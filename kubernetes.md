kubernetes.log
===============

これまで構築してきたdebianを2つ使う．
2個めとして，再度debianをインストールしても良いし，環境が許せば仮想計算機のイメージを複製しても良い．
ここでは，2台めのホスト名をnode2として話を進める．

## kubeadmなどの関連コマンドのインストール

まずはこちらを参考にして，kubeadmなどのコマンドを，debianおよびnode2にインストールする．
実際に行うのは実際に行うのは，```Installing kubeadm, kubelet and kubectl```の部分だけで良い．
[Installing kubeadm](https://kubernetes.io/docs/setup/independent/install-kubeadm/)

順番にログを紹介する．まずは```apt-gransport-https```のインストール．

```
suda@kube01:~$ sudo apt-get update && sudo apt-get install -y apt-transport-https
無視:1 http://ftp.jp.debian.org/debian stretch InRelease
ヒット:2 https://download.docker.com/linux/debian stretch InRelease
ヒット:3 http://ftp.jp.debian.org/debian stretch-updates InRelease
ヒット:4 http://ftp.jp.debian.org/debian stretch Release
ヒット:6 http://security.debian.org/debian-security stretch/updates InRelease
パッケージリストを読み込んでいます... 完了
パッケージリストを読み込んでいます... 完了
依存関係ツリーを作成しています
状態情報を読み取っています... 完了
apt-transport-https はすでに最新バージョン (1.4.8) です。
アップグレード: 0 個、新規インストール: 0 個、削除: 0 個、保留: 2 個。
suda@kube01:~$
```

続いて，Kubernetes関連のツールを公開しているGoogleの公開鍵の入手と登録．

```
suda@kube01:~$ curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
OK
suda@kube01:~$
```

パッケージリポジトリにKubernetes関連のソースを追加（最後の2行）

```
suda@kube01:~$ sudo vi /etc/apt/sources.list
```

実際に編集したsources.listを示します．

```
#

# deb cdrom:[Debian GNU/Linux 9.3.0 _Stretch_ - Official amd64 NETINST 20171209-12:10]/ stretch main

# deb cdrom:[Debian GNU/Linux 9.3.0 _Stretch_ - Official amd64 NETINST 20171209-12:10]/ stretch main

deb http://ftp.jp.debian.org/debian/ stretch main
deb-src http://ftp.jp.debian.org/debian/ stretch main

deb http://security.debian.org/debian-security stretch/updates main
deb-src http://security.debian.org/debian-security stretch/updates main

# stretch-updates, previously known as 'volatile'
deb http://ftp.jp.debian.org/debian/ stretch-updates main
deb [arch=amd64] https://download.docker.com/linux/debian stretch stable
# deb-src [arch=amd64] https://download.docker.com/linux/debian stretch stable
deb-src http://ftp.jp.debian.org/debian/ stretch-updates main

# Kubernetes
deb http://apt.kubernetes.io/ kubernetes-xenial main
```

パッケージ情報の更新を行います．

```
suda@kube01:~$ sudo apt-get update
無視:1 http://ftp.jp.debian.org/debian stretch InRelease
ヒット:2 http://ftp.jp.debian.org/debian stretch-updates InRelease
ヒット:3 http://ftp.jp.debian.org/debian stretch Release
ヒット:5 http://security.debian.org/debian-security stretch/updates InRelease
ヒット:7 https://download.docker.com/linux/debian stretch InRelease
取得:6 https://packages.cloud.google.com/apt kubernetes-xenial InRelease [8,987 B]
取得:8 https://packages.cloud.google.com/apt kubernetes-xenial/main amd64 Packages [13.2 kB]
22.2 kB を 0秒 で取得しました (22.6 kB/s)
パッケージリストを読み込んでいます... 完了
suda@kube01:~$
```

必要とするパッケージ```kubelet```，```kubeadm```，```kubectl```をインストールします．

```
suda@kube01:~$ sudo apt-get install -y kubelet kubeadm kubectl
パッケージリストを読み込んでいます... 完了
依存関係ツリーを作成しています
状態情報を読み取っています... 完了
以下の追加パッケージがインストールされます:
  ebtables ethtool kubernetes-cni socat
以下のパッケージが新たにインストールされます:
  ebtables ethtool kubeadm kubectl kubelet kubernetes-cni socat
アップグレード: 0 個、新規インストール: 7 個、削除: 0 個、保留: 2 個。
57.5 MB のアーカイブを取得する必要があります。
この操作後に追加で 414 MB のディスク容量が消費されます。
取得:1 http://ftp.jp.debian.org/debian stretch/main amd64 ebtables amd64 2.0.10.4-3.5+b1 [85.5 kB]
取得:2 http://ftp.jp.debian.org/debian stretch/main amd64 ethtool amd64 1:4.8-1+b1 [113 kB]
取得:3 http://ftp.jp.debian.org/debian stretch/main amd64 socat amd64 1.7.3.1-2+deb9u1 [353 kB]
取得:4 https://packages.cloud.google.com/apt kubernetes-xenial/main amd64 kubernetes-cni amd64 0.6.0-00 [5,910 kB]
取得:5 https://packages.cloud.google.com/apt kubernetes-xenial/main amd64 kubelet amd64 1.9.3-00 [20.5 MB]
取得:6 https://packages.cloud.google.com/apt kubernetes-xenial/main amd64 kubectl amd64 1.9.3-00 [10.5 MB]
取得:7 https://packages.cloud.google.com/apt kubernetes-xenial/main amd64 kubeadm amd64 1.9.3-00 [20.1 MB]
57.5 MB を 5秒 で取得しました (11.5 MB/s)
以前に未選択のパッケージ ebtables を選択しています。
(データベースを読み込んでいます ... 現在 49520 個のファイルとディレクトリがインストールされています。)
.../0-ebtables_2.0.10.4-3.5+b1_amd64.deb を展開する準備をしています ...
ebtables (2.0.10.4-3.5+b1) を展開しています...
以前に未選択のパッケージ ethtool を選択しています。
.../1-ethtool_1%3a4.8-1+b1_amd64.deb を展開する準備をしています ...
ethtool (1:4.8-1+b1) を展開しています...
以前に未選択のパッケージ kubernetes-cni を選択しています。
.../2-kubernetes-cni_0.6.0-00_amd64.deb を展開する準備をしています ...
kubernetes-cni (0.6.0-00) を展開しています...
以前に未選択のパッケージ socat を選択しています。
.../3-socat_1.7.3.1-2+deb9u1_amd64.deb を展開する準備をしています ...
socat (1.7.3.1-2+deb9u1) を展開しています...
以前に未選択のパッケージ kubelet を選択しています。
.../4-kubelet_1.9.3-00_amd64.deb を展開する準備をしています ...
kubelet (1.9.3-00) を展開しています...
以前に未選択のパッケージ kubectl を選択しています。
.../5-kubectl_1.9.3-00_amd64.deb を展開する準備をしています ...
kubectl (1.9.3-00) を展開しています...
以前に未選択のパッケージ kubeadm を選択しています。
.../6-kubeadm_1.9.3-00_amd64.deb を展開する準備をしています ...
kubeadm (1.9.3-00) を展開しています...
kubernetes-cni (0.6.0-00) を設定しています ...
socat (1.7.3.1-2+deb9u1) を設定しています ...
systemd (232-25+deb9u1) のトリガを処理しています ...
ebtables (2.0.10.4-3.5+b1) を設定しています ...
Created symlink /etc/systemd/system/multi-user.target.wants/ebtables.service → /lib/systemd/system/ebtables.service.
update-rc.d: warning: start and stop actions are no longer supported; falling back to defaults
kubectl (1.9.3-00) を設定しています ...
ethtool (1:4.8-1+b1) を設定しています ...
kubelet (1.9.3-00) を設定しています ...
Created symlink /etc/systemd/system/multi-user.target.wants/kubelet.service → /lib/systemd/system/kubelet.service.
kubeadm (1.9.3-00) を設定しています ...
systemd (232-25+deb9u1) のトリガを処理しています ...
suda@kube01:~$
```
## Kubernetesクラスタの作成

ここから先はこちらを参考にして，順番に環境を整えていく．
[Using kubeadm to Create a Cluster](https://kubernetes.io/docs/setup/independent/create-cluster-kubeadm/#14-installing-kubeadm-on-your-hosts)

### 事前準備

1. kubernetesが期待するdockerのバージョンは```17.03```であるが，実際に使用したのは```17.12```である．なんとか動くので良いものとする．
2. Linuxシステムとして，Swapが設定されていると動作しないので，Swapを止める．

#### Swapの止め方（debian, node2の両方で実行）

まずはSwapがどこに設定されているか探すために```fdisk```コマンドを実行する．
すると，マウントしているデバイス一覧が表示される．
この中で，```Type```が```Linux swap /Solaris```と書いてあるデバイスがSwapである．
Swapを一時的に停止するコマンドは```swapoff```である．

```
suda@debian:~$ sudo fdisk -l
Disk /dev/sda: 20 GiB, 21474836480 bytes, 41943040 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0x23e82d34

Device     Boot    Start      End  Sectors  Size Id Type
/dev/sda1  *        2048 39845887 39843840   19G 83 Linux
/dev/sda2       39847934 41940991  2093058 1022M  5 Extended
/dev/sda5       39847936 41940991  2093056 1022M 82 Linux swap / Solaris

suda@debian:~$ sudo swapoff /dev/sda5

suda@debian:~$
```

## Masterノードのセットアップ

Masterノードとは，クラスタ全体の管理を行うノードである．
順番に説明していく．

### Masterノードの起動（debianで実行）

ここではdebianで実行する箇所である．
なお，Podネットワークが必要になるが，ここではFlannelを採用する．
そのため，init時にネットワークの設定を追加する必要があるので注意すること．

```
suda@debian:~$ sudo kubeadm init --pod-network-cidr=10.244.0.0/16
[init] Using Kubernetes version: v1.9.3
[init] Using Authorization modes: [Node RBAC]
[preflight] Running pre-flight checks.
	[WARNING SystemVerification]: docker version is greater than the most recently validated version. Docker version: 17.12.0-ce. Max validated version: 17.03
	[WARNING FileExisting-crictl]: crictl not found in system path
[preflight] Starting the kubelet service
[certificates] Generated ca certificate and key.
[certificates] Generated apiserver certificate and key.
[certificates] apiserver serving cert is signed for DNS names [debian kubernetes kubernetes.default kubernetes.default.svc kubernetes.default.svc.cluster.local] and IPs [10.96.0.1 172.16.121.160]
[certificates] Generated apiserver-kubelet-client certificate and key.
[certificates] Generated sa key and public key.
[certificates] Generated front-proxy-ca certificate and key.
[certificates] Generated front-proxy-client certificate and key.
[certificates] Valid certificates and keys now exist in "/etc/kubernetes/pki"
[kubeconfig] Wrote KubeConfig file to disk: "admin.conf"
[kubeconfig] Wrote KubeConfig file to disk: "kubelet.conf"
[kubeconfig] Wrote KubeConfig file to disk: "controller-manager.conf"
[kubeconfig] Wrote KubeConfig file to disk: "scheduler.conf"
[controlplane] Wrote Static Pod manifest for component kube-apiserver to "/etc/kubernetes/manifests/kube-apiserver.yaml"
[controlplane] Wrote Static Pod manifest for component kube-controller-manager to "/etc/kubernetes/manifests/kube-controller-manager.yaml"
[controlplane] Wrote Static Pod manifest for component kube-scheduler to "/etc/kubernetes/manifests/kube-scheduler.yaml"
[etcd] Wrote Static Pod manifest for a local etcd instance to "/etc/kubernetes/manifests/etcd.yaml"
[init] Waiting for the kubelet to boot up the control plane as Static Pods from directory "/etc/kubernetes/manifests".
[init] This might take a minute or longer if the control plane images have to be pulled.
[apiclient] All control plane components are healthy after 27.501359 seconds
[uploadconfig] Storing the configuration used in ConfigMap "kubeadm-config" in the "kube-system" Namespace
[markmaster] Will mark node debian as master by adding a label and a taint
[markmaster] Master debian tainted and labelled with key/value: node-role.kubernetes.io/master=""
[bootstraptoken] Using token: ac622a.4225187698b87e71
[bootstraptoken] Configured RBAC rules to allow Node Bootstrap tokens to post CSRs in order for nodes to get long term certificate credentials
[bootstraptoken] Configured RBAC rules to allow the csrapprover controller automatically approve CSRs from a Node Bootstrap Token
[bootstraptoken] Configured RBAC rules to allow certificate rotation for all node client certificates in the cluster
[bootstraptoken] Creating the "cluster-info" ConfigMap in the "kube-public" namespace
[addons] Applied essential addon: kube-dns
[addons] Applied essential addon: kube-proxy

Your Kubernetes master has initialized successfully!

To start using your cluster, you need to run the following as a regular user:

  mkdir -p $HOME/.kube
  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
  sudo chown $(id -u):$(id -g) $HOME/.kube/config

You should now deploy a pod network to the cluster.
Run "kubectl apply -f [podnetwork].yaml" with one of the options listed at:
  https://kubernetes.io/docs/concepts/cluster-administration/addons/

You can now join any number of machines by running the following on each node
as root:

  kubeadm join --token ac622a.4225187698b87e71 172.16.121.160:6443 --discovery-token-ca-cert-hash sha256:572be0ef181ba23d987edf03501b00037ee97aa4c23c3a2603a8914f86023e04

suda@debian:~$
```

なお，実行結果の最後の方で，「一般ユーザで以下を実行する必要がある」と書かれている行を，忘れずに実行すること．

```
suda@debian:~$ mkdir -p $HOME/.kube
suda@debian:~$ sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
suda@debian:~$ sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

また，その下には「Workerノードを追加する際に以下を実行せよ」と書かれた行が表示されるので，この行をなくさないように注意すること．

### Podネットワークのインストール（debianで実行）

Pod間の通信手段をセットアップする．
詳しくは```(3/4) Installing a pod network```に書いてあるので，参照すること．
前節で書いたが，ここではFlannelを採用する．

```
suda@debian:~$ kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/v0.9.1/Documentation/kube-flannel.yml
clusterrole "flannel" created
clusterrolebinding "flannel" created
serviceaccount "flannel" created
configmap "kube-flannel-cfg" created
daemonset "kube-flannel-ds" created
suda@debian:~$
```

通常はKubernetesのMasterノードには，コンテナを配置しないようになっている．
ここで，下記コマンドにより，Masterノードにもコンテナを配置できるようになる．
（つまり，1ノードでKubernetesを使用することができる）

```
suda@debian:~$ kubectl taint nodes --all node-role.kubernetes.io/master-
```

### 確認

Kubernetesクラスタ上で起動しているすべてのサービスを表示する例を以下に示す．

```
suda@debian:~$ kubectl get pods --all-namespaces
NAMESPACE     NAME                             READY     STATUS    RESTARTS   AGE
kube-system   etcd-debian                      1/1       Running   0          12s
kube-system   kube-apiserver-debian            1/1       Running   0          23s
kube-system   kube-controller-manager-debian   1/1       Running   0          39s
kube-system   kube-dns-6f4fd4bdf-wdqjj         0/3       Pending   0          1m
kube-system   kube-flannel-ds-z2cm5            1/1       Running   0          16s
kube-system   kube-proxy-dgdgn                 1/1       Running   0          1m
kube-system   kube-scheduler-debian            1/1       Running   0          40s
suda@debian:~$
```

次に，接続されているホスト情報を表示する例を以下に示す．

```
suda@debian:~$ kubectl get nodes
NAME      STATUS     ROLES     AGE       VERSION
debian    Ready      master    3m        v1.9.3
```

## ノードの追加（node2で実行）

続いて，Workerノードを追加する．
workerノードとは，実際にサービスが実行されるホストである．
なお，ここで入力する内容は，Masterノードで```kubeadm init```を実行した際に表示される内容である．

```
suda@node2:~$ sudo kubeadm join --token ac622a.4225187698b87e71 172.16.121.160:6443 --discovery-token-ca-cert-hash sha256:572be0ef181ba23d987edf03501b00037ee97aa4c23c3a2603a8914f86023e04
[preflight] Running pre-flight checks.
	[WARNING SystemVerification]: docker version is greater than the most recently validated version. Docker version: 17.12.0-ce. Max validated version: 17.03
	[WARNING FileExisting-crictl]: crictl not found in system path
[preflight] Starting the kubelet service
[discovery] Trying to connect to API Server "172.16.121.160:6443"
[discovery] Created cluster-info discovery client, requesting info from "https://172.16.121.160:6443"
[discovery] Requesting info from "https://172.16.121.160:6443" again to validate TLS against the pinned public key
[discovery] Cluster info signature and contents are valid and TLS certificate validates against pinned roots, will use API Server "172.16.121.160:6443"
[discovery] Successfully established connection with API Server "172.16.121.160:6443"

This node has joined the cluster:
* Certificate signing request was sent to master and a response
  was received.
* The Kubelet was informed of the new secure connection details.

Run 'kubectl get nodes' on the master to see this node join the cluster.
suda@node2:~$
```

## 追加されたノードの確認（debianで実行）

ノードの確認コマンドを実行すると，node2が追加されているはずである．
なお，STATUSが```NotReady```になっているのは，起動処理のためである．

```
suda@debian:~$ kubectl get nodes
NAME      STATUS     ROLES     AGE       VERSION
debian    Ready      master    9m        v1.9.3
node2     NotReady   <none>    3s        v1.9.3
suda@debian:~$
```

しばらく待ってから．再度確認コマンドを実行すると，以下のように```Ready```になる．

```
suda@debian:~$ kubectl get nodes
NAME      STATUS    ROLES     AGE       VERSION
debian    Ready     master    47m       v1.9.3
node2     Ready     <none>    38m       v1.9.3
suda@debian:~$
```

もう少し詳しい情報を知りたい場合は，```-o wide```オプションを利用すると良い．

```
suda@debian:~$ kubectl get nodes -o wide
NAME      STATUS    ROLES     AGE       VERSION   EXTERNAL-IP   OS-IMAGE                       KERNEL-VERSION   CONTAINER-RUNTIME
debian    Ready     master    30m       v1.9.3    <none>        Debian GNU/Linux 9 (stretch)   4.9.0-4-amd64    docker://17.12.0-ce
node2     Ready     <none>    28m       v1.9.3    <none>        Debian GNU/Linux 9 (stretch)   4.9.0-4-amd64    docker://17.12.0-ce
suda@debian:~$
```


## サービスのデプロイ（debianで実行）

無事にクラスタができたので，簡単なサービスを起動してみる．
手順としては，
1. nginxの起動
2. LoadBalancerを通じて外部に公開
3. 外部からアクセスするためのIPアドレスの確認
4. サービスの基本的な情報を表示

なぜか，外部IPがpengingのまま・・・

まずはnginxを動かしてみる．

```
suda@debian:~$ kubectl run nginx --image=nginx
deployment "nginx" created
suda@debian:~$
```

これまで起動を確認する．
Kubernetesでは，PODという単位で動いているコンテナを確認できる．

```
suda@debian:~$ kubectl get pods
NAME                   READY     STATUS    RESTARTS   AGE
nginx-8586cf59-99wc7   1/1       Running   0          9s

suda@debian:~$
```

LoadBalancerを起動する．
これによって，外部からのアクセスが可能になる．
ただし，ここで言う外部は「コンテナの外部」であり，debianから内部のIPアドレスを通じてアクセスできる世界である．

```
suda@debian:~$ kubectl expose deployment nginx --port 80 --type LoadBalancer
service "nginx" exposed
suda@debian:~$
```

起動したLoadBalancerのサービスを確認すると，コンテナ内に80番ポートで待ち受けをしているが，コンテナ外からは31136番ポートであることが分かる番ポートであることが分かる．
よって，この例では```http://<debianのIPアドレス>:31136/```でアクセス可能である．
参考までに，GoogleやAmazonのクラウド上では，下記のEXTERNAL-IPのところにきちんとIPアドレスが割り当てられ，独立したサービスとして起動する．

```
suda@debian:~$ kubectl get services
NAME         TYPE           CLUSTER-IP     EXTERNAL-IP   PORT(S)        AGE
kubernetes   ClusterIP      10.96.0.1      <none>        443/TCP        1h
nginx        LoadBalancer   10.108.215.1   <pending>     80:31136/TCP   10s

suda@debian:~$
```

ついでなので，nginxのサービスの詳細を表示してみる．
ここでNodePortという項目が外部ポートである．

```
suda@debian:~$ kubectl describe services nginx
Name:                     nginx
Namespace:                default
Labels:                   run=nginx
Annotations:              <none>
Selector:                 run=nginx
Type:                     LoadBalancer
IP:                       10.108.215.1
Port:                     <unset>  80/TCP
TargetPort:               80/TCP
NodePort:                 <unset>  31136/TCP
Endpoints:                10.244.2.2:80
Session Affinity:         None
External Traffic Policy:  Cluster
Events:                   <none>
suda@debian:~$
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
suda@kube01:~$ kubectl create -f https://raw.githubusercontent.com/jcmoraisjr/haproxy-ingress/master/docs/haproxy-ingress.yaml
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
suda@kube01:~$
```

その後，node名を調べてroleを指定する．

```
suda@kube01:~$ kubectl get node
NAME      STATUS    ROLES     AGE       VERSION
kube01    Ready     master    19m       v1.9.3

suda@kube01:~$ kubectl label node kube01 role=ingress-controller
node "kube01" labeled

suda@kube01:~$ kubectl -n ingress-controller get ds
NAME              DESIRED   CURRENT   READY     UP-TO-DATE   AVAILABLE   NODE SELECTOR             AGE
haproxy-ingress   1         1         0         1            0           role=ingress-controller   19m
suda@kube01:~$
```

参考までに，ここで与えるのはnode名でなければならず，IPアドレスを指定してもエラーとなった．

```
suda@kube01:~$ kubectl label node 172.16.121.165 role=ingress-controller
Error from server (NotFound): nodes "172.16.121.165" not found
suda@kube01:~$ 
```

続いて，すでに起動しているnginxのサービスを，外部に公開するための設定ファイルを記述する．
ファイル名は，```ingress.yaml```としておく．
このファイルの内容は，下記サイトを参考にしてサービス名を変更したものである．
[Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/)

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

上記設定ファイルを元にして，Ingressを起動する．
続く行はIngressの設定の確認である．
確かに，```test-ingress```という名称で，80番ポートを使用することが分かる．

```
suda@debian:~$ kubectl create -f ingress.yaml
ingress "test-ingress" created

suda@debian:~$ kubectl get ingress
NAME           HOSTS     ADDRESS   PORTS     AGE
test-ingress   *                   80        5s
suda@debian:~$
```

この状態で，```http://<debianのIPアドレス>/```にアクセスすると，無事にNginxのページを閲覧可能である．
ここまで来たら，Kubernetesの各種情報が更新されても良さそうであるが，残念ながらそこまではやってくれないらしい．
サービス一覧を表示させても，```EXTERNAL-IP```は```pending```のままであった．

```
suda@debian:~$ kubectl get services
NAME         TYPE           CLUSTER-IP       EXTERNAL-IP   PORT(S)        AGE
kubernetes   ClusterIP      10.96.0.1        <none>        443/TCP        20h
nginx        LoadBalancer   10.108.132.235   <pending>     80:31375/TCP   37m
suda@debian:~$
```

### ホスト名ベースのロードバランサを設定する

このままでは，複数のWebサービスを起動しても競合してしまうので，ディレクトリ名ベースかホスト名ベースでサービスへのエントリーを分ける必要がある．
ここでは，ホスト名ベースでサービスを分けるやり方を記述する．
参考ページは，先程も示したKubernetesのIngressのページである．
[Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/)

まずは，設定ファイル```ingress.yaml```を以下のように編集する．
ここで，```host```の項目に付けた名称毎にサービスを分けることができる．
ここでは，```nip.io```のサービスを利用しているが，本来はDNSの設定でCNAMEを記載するのが普通である．

```
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: test-ingress
spec:
  rules:
  - host: web.172.16.121.165.nip.io
    http:
      paths:
      - backend:
          serviceName: nginx
          servicePort: 80
  - host: dashboard.172.16.121.165.nip.io
    http:
      paths:
      - backend:
          serviceName: kubernetes-dashboard
          servicePort: 8001
```

次に，以下のようにIngressの設定ファイルをリロードし，情報を表示させてみよう．

```
suda@debian:~$ kubectl replace -f ingress.yaml
ingress "test-ingress" replaced

suda@debian:~$ kubectl get ingress
NAME           HOSTS                                                       ADDRESS   PORTS     AGE
test-ingress   web.172.16.121.165.nip.io,dashboard.172.16.121.165.nip.io             80        4h
suda@debian:~$
```

## Kubernetes Dashboardを動かしてみる

```
suda@kube01:~$ kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/master/src/deploy/recommended/kubernetes-dashboard.yaml
secret "kubernetes-dashboard-certs" created
serviceaccount "kubernetes-dashboard" created
role "kubernetes-dashboard-minimal" created
rolebinding "kubernetes-dashboard-minimal" created
deployment "kubernetes-dashboard" created
service "kubernetes-dashboard" created
suda@kube01:~$
```

```
suda@kube01:~$ kubectl get pods --all-namespaces
NAMESPACE     NAME                                    READY     STATUS    RESTARTS   AGE
default       nginx-8586cf59-lk7vt                    1/1       Running   0          3h
kube-system   etcd-kube01                             1/1       Running   0          3h
kube-system   kube-apiserver-kube01                   1/1       Running   0          3h
kube-system   kube-controller-manager-kube01          1/1       Running   0          3h
kube-system   kube-dns-6f4fd4bdf-ck2kl                3/3       Running   0          3h
kube-system   kube-flannel-ds-jq7r7                   1/1       Running   0          3h
kube-system   kube-proxy-vtgcj                        1/1       Running   0          3h
kube-system   kube-scheduler-kube01                   1/1       Running   0          3h
kube-system   kubernetes-dashboard-5bd6f767c7-2r7t8   1/1       Running   0          2m
suda@kube01:~$
```

```
suda@kube01:~$ kubectl describe service kubernetes-dashboard -n kube-system
Name:              kubernetes-dashboard
Namespace:         kube-system
Labels:            k8s-app=kubernetes-dashboard
Annotations:       kubectl.kubernetes.io/last-applied-configuration={"apiVersion":"v1","kind":"Service","metadata":{"annotations":{},"labels":{"k8s-app":"kubernetes-dashboard"},"name":"kubernetes-dashboard","namespace":...
Selector:          k8s-app=kubernetes-dashboard
Type:              ClusterIP
IP:                10.98.70.55
Port:              <unset>  443/TCP
TargetPort:        8443/TCP
Endpoints:         10.244.0.4:8443
Session Affinity:  None
Events:            <none>
suda@kube01:~$
```

```
suda@kube01:~$ kubectl proxy --address="0.0.0.0" -p 8001 --accept-hosts='^*$'
Starting to serve on [::]:8001
```

この状態であれば，他のホストから```http://<debianのIPアドレス>:8001/```にアクセスできる．
実際に使う場合位は```http://<debianのIPアドレス>:8001/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/#!/login```にアクセスする．
この辺りのことは下記URlを参照すること．

[【IBM Cloud k8s】WebUI (Dashboard)への認証方法のメモ](https://qiita.com/MahoTakara/items/fc2e3758d0418001b0a2)

上記の方法では，ログイン画面までは表示されたがそこから先に進めなかった．
もしかしたら下記URLの方法でうまくいくかも．

[CentOS7 kubespray で kubernetes(1.9) cluster を作る - その1 -](https://qiita.com/ainamori/items/cf24466c6c0f4cec16d5)

## 参考文献
[自宅PCクラスタのKubernetesを1.9にバージョンアップしたログ](http://dr-asa.hatenablog.com/entry/2017/12/19/095008)
[Get Docker CE for Ubuntu](https://docs.docker.com/engine/installation/linux/docker-ce/ubuntu/)
[kubectl completion: Bash/Zsh 向けの kubectl のシェル自動補完](https://qiita.com/superbrothers/items/631508630320aa1dbcbc)
