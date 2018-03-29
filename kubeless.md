kubeless.log
===============

Kubernetesを拡張して，FaaS(Function as a Service)の構築方法についてまとめる．
これまで構築してきたKubernetes環境とは，若干異なるセットアップになるが，将来的には統合する予定である．
そのため，共通部分はそのまま残してある．

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

以下にセットアップのログを示す．
なお，debianのIPアドレスは172.16.121.165であるものとする．


```
suda@kube01:~$ sudo kubeadm init --pod-network-cidr=10.244.0.0/16 --apiserver-advertise-address=172.16.121.165
[init] Using Kubernetes version: v1.9.3
[init] Using Authorization modes: [Node RBAC]
[preflight] Running pre-flight checks.
	[WARNING FileExisting-crictl]: crictl not found in system path
[preflight] Starting the kubelet service
[certificates] Generated ca certificate and key.
[certificates] Generated apiserver certificate and key.
[certificates] apiserver serving cert is signed for DNS names [kube01 kubernetes kubernetes.default kubernetes.default.svc kubernetes.default.svc.cluster.local] and IPs [10.96.0.1 172.16.121.165]
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
[apiclient] All control plane components are healthy after 28.001277 seconds
[uploadconfig] Storing the configuration used in ConfigMap "kubeadm-config" in the "kube-system" Namespace
[markmaster] Will mark node kube01 as master by adding a label and a taint
[markmaster] Master kube01 tainted and labelled with key/value: node-role.kubernetes.io/master=""
[bootstraptoken] Using token: 311f64.7b54b4ce759d066f
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

  kubeadm join --token 311f64.7b54b4ce759d066f 172.16.121.165:6443 --discovery-token-ca-cert-hash sha256:e7bc7d595c244518086b932196df6653bd4622493e89eee33f9baf1ac3ea2c51

suda@kube01:~$
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
STATUS欄がRunningとなっているのは起動完了しているコンテナであり，Penginとなっているのはこれから起動するコンテナである．

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

## Ingress Controllerのインストール

あとで書く

## Kubelessのインストール

### Kubeless環境のインストール

Ingress Contollerをインストールしたので，続いてKubeless環境をインストールする．
これ以降は以下のドキュメントを参考に進めていく．
[Installation](http://kubeless.io/docs/quick-start/)

順番に，以下のことを行っていく．
1. ```RELEASE```に最新版のバージョンを代入する
2. Kubernetesに```kubeless```というNamespaceを登録する
3. YAMLファイルをダウンロードする
4. YAMLファイルを基に，Kubelessを起動する

なお，ドキュメントによると最新バージョンはv0.5.0のようであるが，試したところkubeless-controller-managerのコンテナが起動しなかったのでv0.4.0を使用する．

```
suda@kube01:~$ export RELEASE=v0.4.0

suda@kube01:~$ kubectl create namespace kubeless

namespace "kubeless" created
suda@kube01:~$ curl -LO https://github.com/kubeless/kubeless/releases/download/${RELEASE}/kubeless-rbac-${RELEASE}.yaml
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   615    0   615    0     0    799      0 --:--:-- --:--:-- --:--:--   800
100  9525  100  9525    0     0   5923      0  0:00:01  0:00:01 --:--:-- 11773

suda@kube01:~$ kubectl create -f kubeless-rbac-${RELEASE}.yaml
service "zoo" created
deployment "kubeless-controller" created
clusterrolebinding "kubeless-controller-deployer" created
customresourcedefinition "functions.kubeless.io" created
service "broker" created
service "kafka" created
statefulset "zoo" created
service "zookeeper" created
configmap "kubeless-config" created
serviceaccount "controller-acct" created
clusterrole "kubeless-controller-deployer" created
statefulset "kafka" created
suda@kube01:~$
```

### kubelssコマンドのセットアップ

順番が前後するが，```kubeless```コマンドのセットアップも行う．
順番に以下のことを実行している．
1. unzipパッケージのインストール
2. kubelessコマンドの圧縮ファイルのダウンロード
3. kubelessコマンドの展開
4. 実行属性の付与
5. ```/usr/loca/bin```に移動
6. 動作確認のためにバージョンを表示させる

```
suda@kube01:~$ sudo apt-get install -y unzip
パッケージリストを読み込んでいます... 完了
依存関係ツリーを作成しています
状態情報を読み取っています... 完了
提案パッケージ:
  zip
以下のパッケージが新たにインストールされます:
  unzip
アップグレード: 0 個、新規インストール: 1 個、削除: 0 個、保留: 4 個。
170 kB のアーカイブを取得する必要があります。
この操作後に追加で 547 kB のディスク容量が消費されます。
取得:1 http://ftp.jp.debian.org/debian stretch/main amd64 unzip amd64 6.0-21 [170 kB]
170 kB を 0秒 で取得しました (543 kB/s)
以前に未選択のパッケージ unzip を選択しています。
(データベースを読み込んでいます ... 現在 51307 個のファイルとディレクトリがインストールされています。)
.../unzip_6.0-21_amd64.deb を展開する準備をしています ...
unzip (6.0-21) を展開しています...
mime-support (3.60) のトリガを処理しています ...
unzip (6.0-21) を設定しています ...

suda@kube01:~$ wget -c https://github.com/kubeless/kubeless/releases/download/${RELEASE}/kubeless_linux-amd64.zip
--2018-03-08 14:48:54--  https://github.com/kubeless/kubeless/releases/download/v0.4.0/kubeless_linux-amd64.zip
github.com (github.com) をDNSに問いあわせています... 192.30.253.113, 192.30.253.112
github.com (github.com)|192.30.253.113|:443 に接続しています... 接続しました。
HTTP による接続要求を送信しました、応答を待っています... 302 Found
場所: https://github-production-release-asset-2e65be.s3.amazonaws.com/73902337/c119333e-10be-11e8-93bf-cf0183e444d4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIWNJYAX4CSVEH53A%2F20180308%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20180308T054855Z&X-Amz-Expires=300&X-Amz-Signature=a660e31a8f9fa44b57e45b6124218318c711fed138586a16da23cecf7d3ba347&X-Amz-SignedHeaders=host&actor_id=0&response-content-disposition=attachment%3B%20filename%3Dkubeless_linux-amd64.zip&response-content-type=application%2Foctet-stream [続く]
--2018-03-08 14:48:55--  https://github-production-release-asset-2e65be.s3.amazonaws.com/73902337/c119333e-10be-11e8-93bf-cf0183e444d4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIWNJYAX4CSVEH53A%2F20180308%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20180308T054855Z&X-Amz-Expires=300&X-Amz-Signature=a660e31a8f9fa44b57e45b6124218318c711fed138586a16da23cecf7d3ba347&X-Amz-SignedHeaders=host&actor_id=0&response-content-disposition=attachment%3B%20filename%3Dkubeless_linux-amd64.zip&response-content-type=application%2Foctet-stream
github-production-release-asset-2e65be.s3.amazonaws.com (github-production-release-asset-2e65be.s3.amazonaws.com) をDNSに問いあわせています... 52.216.16.80
github-production-release-asset-2e65be.s3.amazonaws.com (github-production-release-asset-2e65be.s3.amazonaws.com)|52.216.16.80|:443 に接続しています... 接続しました。
HTTP による接続要求を送信しました、応答を待っています... 200 OK
長さ: 6555227 (6.3M) [application/octet-stream]
`kubeless_linux-amd64.zip' に保存中

kubeless_linux-amd64.zip                             100%[======================================================================================================================>]   6.25M  1.82MB/s    in 4.5s

2018-03-08 14:49:00 (1.38 MB/s) - `kubeless_linux-amd64.zip' へ保存完了 [6555227/6555227]

suda@kube01:~$ unzip kubeless_linux-amd64.zip
Archive:  kubeless_linux-amd64.zip
   creating: bundles/kubeless_linux-amd64/
  inflating: bundles/kubeless_linux-amd64/kubeless
  
suda@kube01:~$ chmod +x bundles/kubeless_linux-amd64/kubeless

suda@kube01:~$ sudo mv bundles/kubeless_linux-amd64/kubeless /usr/local/bin/

suda@kube01:~$ kubeless version
Kubeless version: v0.4.0 (4f4f531f)
suda@kube01:~$
```

### 確認

ここまでの手順がきちんと動いていると，以下のように表示されるはずである．
（```Kafka```と```zoo```の```STATUS```がInitになっているが，正常である）

```
suda@kube01:~$ kubectl get pods --namespace kubeless
NAME                                  READY     STATUS     RESTARTS   AGE
kafka-0                               0/1       Init:0/1   0          1m
kubeless-controller-b54bc9db6-hkgnr   1/1       Running    0          1m
zoo-0                                 0/1       Init:0/1   0          1m
suda@kube01:~$
```

CRD(Custom Resource Definition)も確認してみる．
以下のように表示されたら正常である．


```
suda@kube01:~$ kubectl get crd
NAME                    AGE
functions.kubeless.io   29s
suda@kube01:~$
```

## Functionの登録

参考サイトに従って，Pythonで書かれた```hello.py```というプログラムを，Function名```greeting```として登録してみる．

### Functionの登録

まずは以下の内容を持つ```hello.py```を作成する．

```
def greeting():
    return "hello, world!"
```

続いて，```hello.py```をFunctionとして登録する．

```
suda@kube01:~/kubeless$ kubeless function deploy greeting --runtime python2.7 --from-file hello.py --handler hello.greeting --trigger-http
INFO[0000] Deploying function...
INFO[0000] Function greeting submitted for deployment
INFO[0000] Check the deployment status executing 'kubeless function ls greeting'
suda@kube01:~/kubeless$
```

以下のようにして確認する．

```
suda@kube01:~/kubeless$ kubeless function ls
NAME    	NAMESPACE	HANDLER       	RUNTIME  	TYPE	TOPIC	DEPENDENCIES	STATUS
greeting	default  	hello.greeting	python2.7	HTTP	     	            	0/1 NOT READY
suda@kube01:~/kubeless$
```

Python2.7のコンテナを用意するために，若干時間が掛かる．
準備ができると以下のようになる．

```
suda@kube01:~$ kubeless function ls
NAME    	NAMESPACE	HANDLER       	RUNTIME  	TYPE	TOPIC	DEPENDENCIES	STATUS
greeting	default  	hello.greeting	python2.7	HTTP	     	            	1/1 READY
suda@kube01:~$
```

### Functionのテスト

以下のようにすると，登録されたFunctionを実行できる．

```
suda@kube01:~/kubeless$ kubeless function call greeting
hello, world!
suda@kube01:~/kubeless$
```

### Ingressへの登録

参考資料では，Ingressに登録するためにはkubelessコマンドのingressサブコマンドを使うと書いてあるが，バージョンアップに伴いサブコマンドが変更された．
新しいサブコマンドは```route```である．
実際に登録した例を示す．

```
suda@kube01:~/kubeless$ kubeless route create greeting --function greeting
suda@kube01:~/kubeless$
```

確認は以下のとおりである．
kubelessで登録したFunctionは，上記コマンドの```create```の後ろにつけた文字列を，Function利用時にホスト名の前に付けることになる．

```
suda@kube01:~/kubeless$ kubeless route ls
NAME    	NAMESPACE	HOST                          	PATH	SERVICE NAME	SERVICE PORT
greeting	default  	greeting.172.16.121.165.nip.io	/   	greeting    	8080

suda@kube01:~/kubeless$ kubectl get ingress
NAME       HOSTS                            ADDRESS   PORTS     AGE
greeting   greeting.172.16.121.165.nip.io             80        1h
suda@kube01:~/kubeless$
```

この状態であれば，curlコマンドやWebブラウザからアクセス可能である．
以下にcurlコマンドを使ってアクセスした例を示す．
なお，hello.pyでは表示時に改行が付けられていないので，プロンプトと一緒になっている．

```
suda@kube01:~/kubeless$ curl greeting.172.16.121.165.nip.io
hello, world!suda@kube01:~/kubeless$
```

## 通常のサービスのデプロイ（debianで実行）

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

このままでは外部からアクセス出来ないので，Ingressにサービスを登録する．
手順としては，nginxのサービスを外部に公開するための設定ファイルを記述し，kubectlコマンドを使って登録する．
公開する設定ファイル名は```ingress.yaml```としておく．
このファイルの内容は，下記サイトを参考にしてサービス名を変更したものである．
[Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/)

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

以下のようにして上記ファイルを読み込ませる．
続けて確認方法も示す．
正常であれば以下のように表示されるはずである．


```
suda@kube01:~$ kubectl create -f ingress.yaml
ingress "test-ingress" created

suda@kube01:~$ kubectl get ingress
NAME           HOSTS                                                       ADDRESS   PORTS     AGE
greeting       greeting.172.16.121.165.nip.io                                        80        21h
test-ingress   web.172.16.121.165.nip.io,dashboard.172.16.121.165.nip.io             80        1h
suda@kube01:~$
```

もし，設定ファイルの記述を誤った場合は，設定ファイルを編集した後リロードすれば良い．

```
suda@debian:~$ kubectl replace -f ingress.yaml
ingress "test-ingress" replaced
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

## 参考文献
[自宅PCクラスタのKubernetesを1.9にバージョンアップしたログ](http://dr-asa.hatenablog.com/entry/2017/12/19/095008)
[Get Docker CE for Ubuntu](https://docs.docker.com/engine/installation/linux/docker-ce/ubuntu/)
[kubectl completion: Bash/Zsh 向けの kubectl のシェル自動補完](https://qiita.com/superbrothers/items/631508630320aa1dbcbc)
