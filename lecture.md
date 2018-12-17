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
Kubernetes用に多数のコンテナが起動していて、目当てのコンテナを探しづらいのでgrepと併用する。

```
$ sudo docker ps | grep registry
f29c3e83f120        registry:2                           "/entrypoint.sh /etc…"   2 minutes ago          Up 2 minutes           0.0.0.0:5000->5000/tcp   registry
$
```

なお、dockerではコンテナを終了させると、コンテナの情報が残ったままになるので、再度registryを起動しようとするとエラーが表示される。
このような場合の対処方法として次の３つを紹介する。

やりかた | 注意点
--|--
終了したコンテナ情報を削除する | すでに登録したイメージが消えてしまう
終了したコンテナを基にしたイメージを作成する | イメージが徐々に大きくなってしまう

まずは終了したコンテナの情報を削除する方法を試してみよう。
終了したものも含めて、すべてのコンテナ情報を表示するには```sudo docker ps -a```を使用する。
（実行結果が正規のものではないので、後で差し替えておきます）

```
$ sudo docker ps -a | grep registry
f29c3e83f120        registry:2                           "/entrypoint.sh /etc…"
$
```

ここで、先頭の```f29c3e83f120```がコンテナ名である。
コンテナを削除する場合には以下のようにコンテナ名を使用する。
※コンテナ名は毎回変わるので、以下のコンテナ名をそのまま使用してはいけない
※コンテナ名は、他のコンテナと区別できれば全部入力しなくても良い。例えば```f29```だけで実行でき、他にf29で始まるコンテナが無ければ```f29c3e83f120```と同等とみなされる

```
$ sudo docker rm f29c3e83f120
$
```


[プライベートなDockerレジストリサーバーをコンテナで立てる](https://qiita.com/rsakao/items/617f54579278173d3c20)

[privateなdockerレジストリを構築する](https://qiita.com/zknzfz/items/13d5d07ab5bb0feb1fd1)

[Docker レジストリ](http://docs.docker.jp/registry/index.html)

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

無事にイメージの作成が済んだら，レジストリ名を含んだタグを付けます。

```
$ sudo docker tag suda-nginx localhost:5000/suda-nginx
$
```

続けてRegistryにpushする．

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

## 複数のWebサイトを一括運営する

さて，自分の好きなコンテンツをWebサーバから配信できるようになったので，次に複数のコンテンツを配信できるように設定する．
これにはいくつかのやり方があり，それぞれ一長一短なので順番に試してみたい．

名称 | 長所 | 短所
--|--|--
ポート番号で判断 | 他との干渉をあまり考えなくて良い | 80番と443番以外のポートが塞がれていることがある
IPアドレスで判断 | DNSが死んでいても使える | 小規模な構成では柔軟性に欠ける
ホスト名で判断 | とりあえずお勧め | SSLのキーの共有で引っかかるかも？
パス名で判断 | SSLの設定で悩まなくて良い（たぶん） | ぶら下がるサービスによっては設定が面倒

まずは，ホスト名で判断するように設定を行う．
具体的には，ingress.yamlを変更すれば良い．

#### ワイルドカードDNSとは？

さて，ホスト名でサービスを判断するとなると，DNSへの登録が必要となる．
しかし，本演習授業ではDNSサーバを構築していない．
そのような際に役に立つのが```nip.io```や```xip.io```といったワイルドカードDNSというサービスである．

ワイルドカードDNSとは，IPアドレス＋αで構成されるドメイン名をIPアドレスに直してくれるサービスである．
言葉では伝わらないので，[nip.io](nip.io)のサイトに有る例を示す．

ホスト名 | → | IPアドレス
-|-|-
10.0.0.1.nip.io | → | 10.0.0.1
app.10.0.0.1.nip.io | → | 10.0.0.1
customer1.app.10.0.0.1.nip.io | → | 10.0.0.1
customer2.app.10.0.0.1.nip.io | → | 10.0.0.1
otherapp.10.0.0.1.nip.io | → | 10.0.0.1

このように，小規模でお試ししたいときに役に立つサービスである．
これ以降の例では，各自のホストOSに割り振られているIPアドレスを使ってアクセスすると思って欲しい．

それでは，nip.ioを試すために，debianのパッケージを追加しよう．
使いたいコマンドは```host```コマンドであり，```host```パッケージに入っている．
よって，以下のようにして追加できる．

```
$ sudo apt-get install host
[sudo] suda のパスワード:
パッケージリストを読み込んでいます... 完了
依存関係ツリーを作成しています
状態情報を読み取っています... 完了
以下の追加パッケージがインストールされます:
  bind9-host geoip-database libbind9-140 libdns162 libgeoip1 libisc160 libisccc140 libisccfg140 liblwres141
提案パッケージ:
  geoip-bin
以下のパッケージが新たにインストールされます:
  bind9-host geoip-database host libbind9-140 libdns162 libgeoip1 libisc160 libisccc140 libisccfg140 liblwres141
アップグレード: 0 個、新規インストール: 10 個、削除: 0 個、保留: 4 個。
4,934 kB のアーカイブを取得する必要があります。
この操作後に追加で 14.4 MB のディスク容量が消費されます。
続行しますか? [Y/n]
取得:1 http://ftp.jp.debian.org/debian stretch/main amd64 libgeoip1 amd64 1.6.9-4 [90.5 kB]
取得:2 http://ftp.jp.debian.org/debian stretch/main amd64 libisc160 amd64 1:9.10.3.dfsg.P4-12.3+deb9u4 [398 kB]
取得:3 http://ftp.jp.debian.org/debian stretch/main amd64 libdns162 amd64 1:9.10.3.dfsg.P4-12.3+deb9u4 [1,077 kB]
取得:4 http://ftp.jp.debian.org/debian stretch/main amd64 libisccc140 amd64 1:9.10.3.dfsg.P4-12.3+deb9u4 [198 kB]
取得:5 http://ftp.jp.debian.org/debian stretch/main amd64 libisccfg140 amd64 1:9.10.3.dfsg.P4-12.3+deb9u4 [223 kB]
取得:6 http://ftp.jp.debian.org/debian stretch/main amd64 libbind9-140 amd64 1:9.10.3.dfsg.P4-12.3+deb9u4 [206 kB]
取得:7 http://ftp.jp.debian.org/debian stretch/main amd64 liblwres141 amd64 1:9.10.3.dfsg.P4-12.3+deb9u4 [214 kB]
取得:8 http://ftp.jp.debian.org/debian stretch/main amd64 bind9-host amd64 1:9.10.3.dfsg.P4-12.3+deb9u4 [231 kB]
取得:9 http://ftp.jp.debian.org/debian stretch/main amd64 geoip-database all 20170512-1 [2,112 kB]
取得:10 http://ftp.jp.debian.org/debian stretch/main amd64 host all 1:9.10.3.dfsg.P4-12.3+deb9u4 [186 kB]
4,934 kB を 1秒 で取得しました (3,276 kB/s)
以前に未選択のパッケージ libgeoip1:amd64 を選択しています。
(データベースを読み込んでいます ... 現在 53932 個のファイルとディレクトリがインストールされています。)
.../0-libgeoip1_1.6.9-4_amd64.deb を展開する準備をしています ...
libgeoip1:amd64 (1.6.9-4) を展開しています...
以前に未選択のパッケージ libisc160:amd64 を選択しています。
.../1-libisc160_1%3a9.10.3.dfsg.P4-12.3+deb9u4_amd64.deb を展開する準備をしています ...
libisc160:amd64 (1:9.10.3.dfsg.P4-12.3+deb9u4) を展開しています...
以前に未選択のパッケージ libdns162:amd64 を選択しています。
.../2-libdns162_1%3a9.10.3.dfsg.P4-12.3+deb9u4_amd64.deb を展開する準備をしています ...
libdns162:amd64 (1:9.10.3.dfsg.P4-12.3+deb9u4) を展開しています...
以前に未選択のパッケージ libisccc140:amd64 を選択しています。
.../3-libisccc140_1%3a9.10.3.dfsg.P4-12.3+deb9u4_amd64.deb を展開する準備をしています ...
libisccc140:amd64 (1:9.10.3.dfsg.P4-12.3+deb9u4) を展開しています...
以前に未選択のパッケージ libisccfg140:amd64 を選択しています。
.../4-libisccfg140_1%3a9.10.3.dfsg.P4-12.3+deb9u4_amd64.deb を展開する準備をしています ...
libisccfg140:amd64 (1:9.10.3.dfsg.P4-12.3+deb9u4) を展開しています...
以前に未選択のパッケージ libbind9-140:amd64 を選択しています。
.../5-libbind9-140_1%3a9.10.3.dfsg.P4-12.3+deb9u4_amd64.deb を展開する準備をしています ...
libbind9-140:amd64 (1:9.10.3.dfsg.P4-12.3+deb9u4) を展開しています...
以前に未選択のパッケージ liblwres141:amd64 を選択しています。
.../6-liblwres141_1%3a9.10.3.dfsg.P4-12.3+deb9u4_amd64.deb を展開する準備をしています ...
liblwres141:amd64 (1:9.10.3.dfsg.P4-12.3+deb9u4) を展開しています...
以前に未選択のパッケージ bind9-host を選択しています。
.../7-bind9-host_1%3a9.10.3.dfsg.P4-12.3+deb9u4_amd64.deb を展開する準備をしています ...
bind9-host (1:9.10.3.dfsg.P4-12.3+deb9u4) を展開しています...
以前に未選択のパッケージ geoip-database を選択しています。
.../8-geoip-database_20170512-1_all.deb を展開する準備をしています ...
geoip-database (20170512-1) を展開しています...
以前に未選択のパッケージ host を選択しています。
.../9-host_1%3a9.10.3.dfsg.P4-12.3+deb9u4_all.deb を展開する準備をしています ...
host (1:9.10.3.dfsg.P4-12.3+deb9u4) を展開しています...
geoip-database (20170512-1) を設定しています ...
libgeoip1:amd64 (1.6.9-4) を設定しています ...
libc-bin (2.24-11+deb9u3) のトリガを処理しています ...
liblwres141:amd64 (1:9.10.3.dfsg.P4-12.3+deb9u4) を設定しています ...
libisc160:amd64 (1:9.10.3.dfsg.P4-12.3+deb9u4) を設定しています ...
libisccc140:amd64 (1:9.10.3.dfsg.P4-12.3+deb9u4) を設定しています ...
libdns162:amd64 (1:9.10.3.dfsg.P4-12.3+deb9u4) を設定しています ...
libisccfg140:amd64 (1:9.10.3.dfsg.P4-12.3+deb9u4) を設定しています ...
libbind9-140:amd64 (1:9.10.3.dfsg.P4-12.3+deb9u4) を設定しています ...
bind9-host (1:9.10.3.dfsg.P4-12.3+deb9u4) を設定しています ...
host (1:9.10.3.dfsg.P4-12.3+deb9u4) を設定しています ...
libc-bin (2.24-11+deb9u3) のトリガを処理しています ...
$
```

これでhostコマンドのインストールが完了したので，以下のように試してみよう．

```
// まずはお試し
$ host 10.0.0.1.nip.io
10.0.0.1.nip.io has address 10.0.0.1  // ←10.0.0.1が返る
// その前にホスト名を追加する例
$ host web.10.0.0.1.nip.io
web.10.0.0.1.nip.io has address 10.0.0.1 // ←これもきちんと10.0.0.1が返る
// 例えば10.0.2.15を引いてみる
$ host 10.0.2.15.nip.io
10.0.2.15.nip.io has address 10.0.2.15 // ←このように，どんなIPアドレスであっても返ってくる
```

#### ホスト名ベースのWebサイト用のingress.yaml

それでは，ホスト名ベースのWebサイト用のingress.yamlを以下のように作成しよう．
spec.rules.hostの欄は各自のホストOSに割り振られているIPアドレスをベースとした名前に変更すること．
なお，先頭のweb1については好きに変更して良い．


```
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: test-ingress
spec:
  rules:
  - host: web1.172.16.121.165.nip.io
    http:
      paths:
        - path: /
          backend:
            serviceName: nginx
            servicePort: 80
```

以下のようにして設定を反映させよう．

```
$ kubectl apply -f ingress.yaml
```

これで，ホストOSのWebブラウザから```web1.172.16.121.165.nip.io```にアクセスすると，先程のWebページが表示される．
設定のポイントは，spec.rules.http.paths.backend.serviceNameであり，，service.yamlで設定した名前と一致していれば良い．
すなわち，別名でdeploymentやserviceを登録すれば複数のWebサービスを起動することができ，ingress.yamlでホスト名ごとにサービスを提供することが可能である．

※そのために，複数のWebサーバのコンテナが必要になるので，各自作成すること．



## 終了方法

終了するときは以下のコマンドを実行する．

```
$ sudo shutdown -h now
```

## kubectlコマンドについて

Kubernetesは，基本的にすべての動作をkubectlコマンドで制御できるよう構成されている．
実際には，様々な操作をするために，いくつものサブコマンドを使い分ける必要がある．
ここでは，サブコマンドを整理する．

サブコマンド | 役割 | 使用例 | 注
--|--|--|--
create | マニフェストに則ってリソースを作成する | kubectl create -f example.yaml | マニフェストファイルはexample.yaml
delete | マニフェストに則ってリソースを削除する | kubectl delete -f example.yaml | マニフェストファイルはexample.yaml
apply | マニフェストに則ってリソースを更新する | kubectl apply -f example.yaml | マニフェストファイルを編集後に実行することが多い
edit | マニフェストを編集する | kubectl edit pod ex1 | Pod名がex1のマニフェストを編集する場合の例
get | リソース情報を確認する | kubectl get pods | 動作しているPod一覧を表示
〃 | 〃 | kubectl get pod ex1 | Pod名がex1のリソースを確認する
describe | 詳細なリソース情報を確認する | kubectl describe pod ex1 | Pod名がex1のリソースの詳細情報を確認する
top | リソース利用量を確認する | kubectl top node | 各ノードのCPU，Memoryの利用状況を確認する
exec | Pod上でコマンドを確認する | kubectl exec -it ex1 /bin/sh | ex1上でシェルを起動する．対話型コマンドを実行する際には「-it」を付けること．
〃 | 〃 | kubectl exec ex1 /bin/-ls -l | ex1上でlsコマンドを実行する
logs | ログを確認する | kubectl logs ex1 | ex1のログを確認する
rollout | 更新履歴を表示する | kubectl rollout history ex-dep1 | Deployment名ex-dep1の更新履歴を表示する
〃 | 更新を取り消す | kubectl rollout undo ex-dep1 --to-revision=1 | Deployment名ex-dep1を最新の状態から1つ戻す

その他，次のようなオプションを付けることができる．

```
$ kubectl get pods -o wide
$ kubectl get pods -o yaml
$ kubectl get all
$ kubectl get all -o wide
$ kubectl get all --all-namespaces
```

複数形の場合は（podsなど）一覧，単数形の場合（podなど）はPod名を後ろに付ける．
確認できるリソースは，pods, nodes, replicaset, deployments, services, namespaces, ingressなど.

## node.jsでサービスを作ろう

### Animal

複数のWebブラウザ間で同期する，動物に司令を送ると任意の座標に移動したり，大きさを変えるサービスを例題とする．
通常であれば，以下のようにして起動できる（まだやらないこと！）．

```
$ git clone https://github.com/sudahiroshi/node-animal.git
$ cd node-animal
$ npm install
$ npm start
```

上記のように実行すると，3000番ポートで待ち受けするので，Webブラウザから```http://localhost:3000/chat/```にアクセスすると，動物がゴチャゴチャと固まっている．
フォームに例えば```panda move 200 200```と入力し，```send```をクリックすると，その座標にパンダが移動する．
2回目以降の移動はスムースになる．
他に，```panda size 200```と入力すると，パンダの多きさが200になる．

今回はイカの手順で進めていく．

1. ベースとなるDockerイメージを決める
2. Dockerfileを作成する
3. buildする
4. まずはDockerで動かしてみる (←new)
5. うまくできたらKubernetesの設定ファイルを書いてみる

### Dockerイメージを決める
Dockerhubでnode.jsのイメージを眺めると，公式のnode環境```https://hub.docker.com/_/node/```が存在するので，これを使う．
他を使いたい場合は自己責任で追いかけること．

いろいろ書き換えるので，まずは手元にイメージを持ってきて，自前のレジストリに登録しよう．
レジストリの起動は，上の方にあるので参照して，起動しておくこと．

以下，レジストリが動いているものとする．

```
$ sudo docker pull node
$ sudo docker tag node localhost:5000/node
$ sudo docker push localhost:5000/node
```

### Dockerfileの作成
次にDockerfileを作成する．
Dockerfileは，```FROM```でもととなるイメージを指定するので，以下のようになる．
そこから先は，実行するコマンドを1行ずつ書いていくのに近いので，以下のような感じとする．

```
FROM localhost:5000/node
RUN git clone https://github.com/sudahiroshi/node-animal.git
WORKDIR node-animal
RUN npm install
EXPOSE 3000
CMD ["npm","start"]
```

### buildする

上記Dockerfileがあるディレクトリで，以下の作業を行う．

```
$ sudo docker build -t animal .
$ sudo docker tag animal localhost:5000/animal
$ sudo docker push localhost:5000/animal
```

### まずはDockerで動かしてみる
ここまでほとんど説明してこなかったが，Dockerコマンドを使って起動してみよう．
起動したら，Webブラウザからアクセスしよう．
ただし，仮想計算機の3000番ポートにポートフォワードするよう，設定が必要なので注意．

```
$ sudo docker run --rm -p 3000:3000 animal
```




