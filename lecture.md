# 配布したVMの使い方

## 確認事項

### IPアドレスの確認

```
$ ip addr show
```

上記を実行して、enp0s3のインタフェースにIPv6のアドレスが割り当てられていないことを確認。
もし割り当てられていたら、下記を実行する。

```
$ sudo vi /etc/sysctl.conf
最下行に以下を追加
net.ipv6.conf.all.disable_ipv6 = 1
viを終了して（ESC → :wq）
$ sudo sysctl -p
```

### Swapの停止

```
$ sudo swapoff /dev/sda5
```

## 起動順序

```
$ sudo kubeadm reset
$ sudo kubeadm init --pod-network-cidr=10.244.0.0/16
$ sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
$ sudo chown $(id -u):$(id -g) $HOME/.kube/config
$ kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
$ kubectl taint nodes --all node-role.kubernetes.io/master-
```

## 確認

以下のコマンドを実行して、全てのSTATUSがRunningであることを確認する。

```
$ kubectl get pods --all-namespaces
NAMESPACE     NAME                             READY   STATUS    RESTARTS   AGE
kube-system   coredns-576cbf47c7-5kshb         1/1     Running   1          27m
kube-system   coredns-576cbf47c7-sqbnh         1/1     Running   1          27m
kube-system   etcd-debian                      1/1     Running   0          26m
kube-system   kube-apiserver-debian            1/1     Running   0          26m
kube-system   kube-controller-manager-debian   1/1     Running   0          26m
kube-system   kube-flannel-ds-amd64-zz9s2      1/1     Running   0          19m
kube-system   kube-proxy-54txc                 1/1     Running   0          27m
kube-system   kube-scheduler-debian            1/1     Running   0          26m
$
```

## Ingressを使って，外部にサービスを公開する

前節のままでは，サービスは起動しているが，外部からアクセスできない状態である．
外部からサービスにアクセスするための仕組みが必要であり，KubernetesではIngressと呼ばれている．
Ingressは仕組みの名称であり，実体にはLoadBalancerやNginxによるリバースProxyである．
ここでは，HAProxy-ingressを使用する．

インストール手順は下記ページの```Deploy the ingress controller```の通りである．
[setup-cluster.md](https://github.com/jcmoraisjr/haproxy-ingress/blob/master/examples/setup-cluster.md#five-minutes-deployment)

まずはdefault-backendを起動する．

```
$ kubectl create -f https://raw.githubusercontent.com/jcmoraisjr/haproxy-ingress/master/docs/haproxy-ingress.yaml
namespace "ingress-controller" created
serviceaccount "ingress-controller" created
clusterrole "ingress-controller" created
role "ingress-controller" created
clusterrolebinding "ingress-controller" created
rolebinding "ingress-controller" created
deployment "ingress-default-backend" created
service "ingress-default-backend" created
configmap "haproxy-ingress" created
daemonset "haproxy-ingress" created
$
```

その後，node名を調べてroleを指定する．

```
$ kubectl get node
NAME      STATUS    ROLES     AGE       VERSION
debian    Ready     master    19m       v1.9.3

$ kubectl label node debian role=ingress-controller
node "kube01" labeled
$ kubectl -n ingress-controller get ds
NAME              DESIRED   CURRENT   READY     UP-TO-DATE   AVAILABLE   NODE SELECTOR             AGE
haproxy-ingress   1         1         0         1            0           role=ingress-controller   19m
$
```

# 実際にWebサーバを起動する

ここではnginxを動作させるために，3つのファイルを作成する．
作成するファイル名は```nginx.yaml```，```service.yaml```，```ingress.yaml```とする．

まずは，nginxを指定するための，nginx.yamlを次のように作成する．

```
apiVersion: apps/v1beta1
kind: Deployment
metadata:
  name: nginx
spec:
  replicas: 3
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.7.9
        ports:
        - containerPort: 80
```

その後，以下のようにする．

```
$ kubectl apply -f nginx.yaml
```

書式にエラーが有る場合は，その旨のメッセージが表示され，特に何も起動しない．

続いて，サービスを定義するためのservice.yamlを作成する．

```
kind: Service
apiVersion: v1
metadata:
  name: nginx
spec:
  selector:
    app: nginx
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: LoadBalancer
```

```
$ kubectl apply -f service.yaml
service/nginx created
```

最後に，ingress.yamlを作成する．


```
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: test-ingress
spec:
  backend:
    serviceName: nginx
    servicePort: 80
```

```
$ kubectl apply -f ingress.yaml
ingress.extensions/test-ingress created
```

### 確認方法

動作中のPodを表示

```
$ kubectl get pods
NAME                     READY   STATUS    RESTARTS   AGE
nginx-5c689d88bb-sl9ff   1/1     Running   0          17m
nginx-5c689d88bb-vvmgr   1/1     Running   0          17m
nginx-5c689d88bb-z5tsx   1/1     Running   0          17m
```

Podの詳細を表示
（podの後ろは，上記で調べた実際に動作しているPodの名前）

```
$ kubectl describe pod nginx-5c689d88bb-sl9ff
Name:               nginx-5c689d88bb-sl9ff
Namespace:          default
Priority:           0
PriorityClassName:  <none>
Node:               debian/10.0.2.15
Start Time:         Mon, 15 Oct 2018 15:49:50 +0900
Labels:             app=nginx
                    pod-template-hash=5c689d88bb
Annotations:        <none>
Status:             Running
IP:                 10.244.0.9
Controlled By:      ReplicaSet/nginx-5c689d88bb
Containers:
  nginx:
    Container ID:   docker://ea71677d0093e03c891f816cc5732ec230c895bb4f06a6c4a264d1e78f5b2826
    Image:          nginx:1.7.9
    Image ID:       docker-pullable://nginx@sha256:e3456c851a152494c3e4ff5fcc26f240206abac0c9d794affb40e0714846c451
    Port:           80/TCP
    Host Port:      0/TCP
    State:          Running
      Started:      Mon, 15 Oct 2018 15:50:03 +0900
    Ready:          True
    Restart Count:  0
    Environment:    <none>
    Mounts:
      /var/run/secrets/kubernetes.io/serviceaccount from default-token-pl2n4 (ro)
Conditions:
  Type              Status
  Initialized       True
  Ready             True
  ContainersReady   True
  PodScheduled      True
Volumes:
  default-token-pl2n4:
    Type:        Secret (a volume populated by a Secret)
    SecretName:  default-token-pl2n4
    Optional:    false
QoS Class:       BestEffort
Node-Selectors:  <none>
Tolerations:     node.kubernetes.io/not-ready:NoExecute for 300s
                 node.kubernetes.io/unreachable:NoExecute for 300s
Events:
  Type    Reason     Age   From               Message
  ----    ------     ----  ----               -------
  Normal  Scheduled  18m   default-scheduler  Successfully assigned default/nginx-5c689d88bb-sl9ff to debian
  Normal  Pulling    18m   kubelet, debian    pulling image "nginx:1.7.9"
  Normal  Pulled     18m   kubelet, debian    Successfully pulled image "nginx:1.7.9"
  Normal  Created    18m   kubelet, debian    Created container
  Normal  Started    18m   kubelet, debian    Started container
$
```

Deploymentの確認

```
$ kubectl get deployment
NAME    DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
nginx   3         3         3            3           20m
$
```

Deploymentの詳細

```
$ kubectl describe deployment nginx
Name:                   nginx
Namespace:              default
CreationTimestamp:      Mon, 15 Oct 2018 15:49:50 +0900
Labels:                 app=nginx
Annotations:            deployment.kubernetes.io/revision: 1
                        kubectl.kubernetes.io/last-applied-configuration:
                          {"apiVersion":"apps/v1beta1","kind":"Deployment","metadata":{"annotations":{},"name":"nginx","namespace":"default"},"spec":{"replicas":3,"...
Selector:               app=nginx
Replicas:               3 desired | 3 updated | 3 total | 3 available | 0 unavailable
StrategyType:           RollingUpdate
MinReadySeconds:        0
RollingUpdateStrategy:  25% max unavailable, 25% max surge
Pod Template:
  Labels:  app=nginx
  Containers:
   nginx:
    Image:        nginx:1.7.9
    Port:         80/TCP
    Host Port:    0/TCP
    Environment:  <none>
    Mounts:       <none>
  Volumes:        <none>
Conditions:
  Type           Status  Reason
  ----           ------  ------
  Available      True    MinimumReplicasAvailable
  Progressing    True    NewReplicaSetAvailable
OldReplicaSets:  <none>
NewReplicaSet:   nginx-5c689d88bb (3/3 replicas created)
Events:
  Type    Reason             Age   From                   Message
  ----    ------             ----  ----                   -------
  Normal  ScalingReplicaSet  20m   deployment-controller  Scaled up replica set nginx-5c689d88bb to 3
```

Ingressのチェック

```
$ kubectl get ingress
NAME           HOSTS   ADDRESS   PORTS   AGE
test-ingress   *                 80      19m
$
```

### プロセスを切ってみよう

まずは，nginxと名の付くプロセスを表示してみよう．

```
$ ps aux | grep nginx
root      2625  0.0  0.2  31072  4872 ?        Ss   15:49   0:00 nginx: master process nginx -g daemon off;
systemd+  2650  0.0  0.1  31448  2664 ?        S    15:49   0:00 nginx: worker process
root      2732  0.0  0.2  31072  5076 ?        Ss   15:50   0:00 nginx: master process nginx -g daemon off;
systemd+  2754  0.0  0.1  31448  2640 ?        S    15:50   0:00 nginx: worker process
root      2780  0.0  0.2  31072  5004 ?        Ss   15:50   0:00 nginx: master process nginx -g daemon off;
systemd+  2808  0.0  0.1  31448  2672 ?        S    15:50   0:00 nginx: worker process
suda     14148  0.0  0.0  12264   968 pts/0    S+   16:12   0:00 grep nginx
$
```

それでは，nginxのプロセスを切ってみよう．

```
$ sudo kill -9 2625
$ ps aux | grep nginx
ps aux | grep nginx
root      2732  0.0  0.2  31072  5076 ?        Ss   15:50   0:00 nginx: master process nginx -g daemon off;
systemd+  2754  0.0  0.1  31448  2640 ?        S    15:50   0:00 nginx: worker process
root      2780  0.0  0.2  31072  5004 ?        Ss   15:50   0:00 nginx: master process nginx -g daemon off;
systemd+  2808  0.0  0.1  31448  2672 ?        S    15:50   0:00 nginx: worker process
root     15143  0.0  0.2  31072  5080 ?        Ss   16:13   0:00 nginx: master process nginx -g daemon off;
systemd+ 15165  0.0  0.1  31448  2592 ?        S    16:13   0:00 nginx: worker process
suda     15188  0.0  0.0  12264   936 pts/0    S+   16:13   0:00 grep nginx
$
```

すると，15143番プロセスが立ち上がっている．
Podの状態を調べると，RESTARTSが1になっているPodが存在する．
これは，Kubernetesが再起動したPodである．

```
$ kubectl get pods
NAME                     READY   STATUS    RESTARTS   AGE
nginx-5c689d88bb-sl9ff   1/1     Running   0          24m
nginx-5c689d88bb-vvmgr   1/1     Running   1          24m
nginx-5c689d88bb-z5tsx   1/1     Running   0          24m
```

### 各自のコンテンツを配信するWebサーバを立ち上げる

次に，独自コンテンツを配信するWebサーバを立ち上げてみよう．
これにはいくつかのやり方があるのだが，動作の仕組みが簡単になるように，コンテンツ込みのDockerイメージを作る方法を採用する．
ところで，Kubernetesで起動するDockerイメージは，Registryに置いてあるものをダウンロードして使用する．
RegistryとしてDockerHubを使うのが最も手っ取り早いが，ユーザ登録が必要なため，ここではローカルRegistryを立ち上げて使用する方法を採用する．

### ローカルRegistyを立ち上げる

単独のホストからのみアクセスできるRegistryを起動してみよう．
なお，本来は複数のホストからアクセスすることが前提となっている（そもそもKubernetesはクラスタ上で使う）ので，あくまでお試し or 練習用となる．
次のように5000番ポートで立ち上げてみよう．

```
$ sudo docker run -d -p 5000:5000 --name registry registry:2
f29c3e83f120d509042a9ae6afc93da17c94c8a78b9948deb5c24197ee120565
$
```

起動確認は以下のようにする．

```
$ sudo docker ps | grep registry
f29c3e83f120        registry:2                           "/entrypoint.sh /etc…"   2 minutes ago          Up 2 minutes           0.0.0.0:5000->5000/tcp   registry
$
```

### nginxをRegistryに登録する

Registryへの登録は，Dockerイメージのダウンロード or Dockerイメージの作成 →　タグ付け　→　Registryへのpushの順に行う．
ここでは，単純にダウンロードしたイメージをそのままRegistryに登録する手順を学習する．

まずはDockerイメージのダウンロード．

```
$ sudo docker pull nginx
Using default tag: latest
latest: Pulling from library/nginx
Digest: sha256:b73f527d86e3461fd652f62cf47e7b375196063bbbd503e853af5be16597cb2e
Status: Image is up to date for nginx:latest
$
```

続いてタグ付けを行う．
アップロード先とイメージ名を指定すると思って欲しい．

```
$ sudo docker tag nginx localhost:5000/nginx
$
```

さらにpushを行う．
pushの後に続くのはタグ名である．

```
$ sudo docker push localhost:5000/nginx
The push refers to repository [localhost:5000/nginx]
86df2a1b653b: Pushed
bc5b41ec0cfa: Pushed
237472299760: Pushed
latest: digest: sha256:d98b66402922eccdbee49ef093edb2d2c5001637bd291ae0a8cd21bb4c36bebe size: 948
$
```

それでは，```nginx.yaml```を以下のように書き換えて，実際に起動してみよう．
実際に書き換えるのは```spec.template.spec.containers.image```（spec内の，template内の，spec内の，containers内のimageという項目を指す）である．
すでに```service.yaml```や```ingress.yaml```などと併用してnginxが動いていることを前提としているので，まだ動かしていない場合は，順番に起動すること．

```
apiVersion: apps/v1beta1
kind: Deployment
metadata:
  name: nginx
spec:
  replicas: 3
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: "localhost:5000/nginx"
        ports:
        - containerPort: 80
```

書き換えたら起動しよう．

```
$ kubectl apply -f nginx.yaml
deployment.apps/nginx created
$
```

Webブラウザでlocalhostにアクセスすると・・・残念ながらこれまでと同じコンテンツが表示される．
とりあえずWebサーバが動いていることを確認すれば良いこととする．

### Dockerイメージを作ってRegistryにpushする

ダウンロードしたイメージを登録するだけでは何も嬉しくないので，Dockerイメージを自作してRegistryに登録する．
Dockerfileの作成　→　イメージのビルド　→　タグ付け　→　Registryへのpushの手順で行う．

まずはDockerfileの作成を行う．
以下の内容を持つ，Dockerfileというファイルを作成する．
内容は，1行目で```localhost:5000/nginx```というイメージをベースにすることを宣言し，2行目でカレントディレクトリにあるhtmlというディレクトリの内容を```/usr/share/nginx/html```にコピーする．

```
FROM localhost:5000/nginx
COPY ./html/ /usr/share/nginx/html/
```

コピーするhtmlファイルも作成する．

```
$ mkdir html
```

htmlディレクトリ内にindex.htmlを作成する．
内容は何でも良いが，サンプルを以下に示す．
index.html以外のファイルも置いておくと良いが，とりあえずindex.htmlのみを置いておく．

```
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8">
</head>

<body>
<p>This is a test page.<p>
<p>Version 1.0</p>
</body>
</html>
```

続いてイメージのビルドを行う．
ここでは-tオプションを使用して，タグ付けも同時に行っている．
ここではタグ名をsuda-nginxとしている．

```
$ sudo docker build -t suda-nginx .
Sending build context to Docker daemon  3.584kB
Step 1/2 : FROM localhost:5000/nginx
 ---> dbfc48660aeb
Step 2/2 : COPY ./html/ /usr/share/nginx/html/
 ---> 149b673dfae8
Successfully built 149b673dfae8
Successfully tagged suda-nginx:latest
$
```

無事にイメージの作成が済んだら，Registryにpushする．

```
$ sudo docker push localhost:5000/suda-nginx
The push refers to repository [localhost:5000/suda-nginx]
8fcd42847d6b: Pushed
86df2a1b653b: Mounted from nginx
bc5b41ec0cfa: Mounted from nginx
237472299760: Mounted from nginx
latest: digest: sha256:dfaecb5001cc6fa509396cd752083c5420270ec226b60bacff885bfbc0dbe4df size: 1155
$
```

### 自作イメージを起動する

nginx.yamlを書き換えて，自作したイメージを動かしてみよう．
先程と同様，```spec.template.spec.containsers.image```を変更する．

```
apiVersion: apps/v1beta1
kind: Deployment
metadata:
  name: nginx
spec:
  replicas: 3
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: "localhost:5000/suda-nginx"
        ports:
        - containerPort: 80
```

書き換えたら起動してみよう．

```
$ kubectl apply -f nginx.yaml
deployment.apps/nginx created
$
```

Webブラウザからlocalhostに接続すると，先ほど作成したindex.htmlが表示されるはずである．
そうでなければ，スーパーリロードを実行すること．

## 終了方法

終了するときは以下のコマンドを実行する．

```
$ sudo shutdown -h now
```

