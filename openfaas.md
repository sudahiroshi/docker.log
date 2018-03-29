OpenFaaS.log
===============

Kubernetesを拡張して，FaaS(Function as a Service)の構築方法についてまとめる．
これまで構築してきたKubernetes環境とは，若干異なるセットアップになるが，将来的には統合する予定である．
そのため，共通部分はそのまま残してある．

## OpenFaaSの関連コマンドのインストール

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

## faas-netesのインストール

ここから先は以下のページを参考にインストールを進める．
[Deployment guide for Kubernetes](https://github.com/openfaas/faas/blob/master/guide/deployment_k8s.md)

元々，Docker Swarm向けにOpenFaaSが開発された．
faas-netesとは，Kubernetesの仕組みに合わせたOpenFaaSである．
今回は手順2.0bを参考にしながら進める．

まずはリポジトリをクローンする．

```
suda@kube01:~$ git clone https://github.com/openfaas/faas-netes
Cloning into 'faas-netes'...
remote: Counting objects: 3332, done.
remote: Total 3332 (delta 0), reused 0 (delta 0), pack-reused 3332
Receiving objects: 100% (3332/3332), 4.16 MiB | 1.72 MiB/s, done.
Resolving deltas: 100% (1682/1682), done.
suda@kube01:~$
```

続いて，ディレクトリを移動し，kubectlコマンドを用いてデプロイする．

```
suda@kube01:~$ cd faas-netes

suda@kube01:~/faas-netes$ kubectl apply -f ./namespaces.yml,./yaml
namespace "openfaas" created
namespace "openfaas-fn" created
service "alertmanager" created
deployment "alertmanager" created
configmap "alertmanager-config" created
service "faas-netesd" created
deployment "faas-netesd" created
deployment "gateway" created
service "gateway" created
service "nats" created
deployment "nats" created
service "prometheus" created
deployment "prometheus" created
configmap "prometheus-config" created
deployment "queue-worker" created
serviceaccount "faas-controller" created
role "faas-controller" created
rolebinding "faas-controller-fn" created
suda@kube01:~/faas-netes$
```

ここでpodを確認すると，エラーが出るが正常である．
開発者いわく，「NATの準備に少し掛かるので数回やり直す．環境によるが数十秒待てば良い」とのことなので安心して欲しい．

```
suda@kube01:~/faas-netes$ kubectl get pods --all-namespaces
NAMESPACE     NAME                             READY     STATUS              RESTARTS   AGE
kube-system   etcd-kube01                      1/1       Running             0          54s
kube-system   kube-apiserver-kube01            1/1       Running             0          28s
kube-system   kube-controller-manager-kube01   1/1       Running             0          36s
kube-system   kube-dns-6f4fd4bdf-zssjf         3/3       Running             0          1m
kube-system   kube-flannel-ds-tg4l6            1/1       Running             0          1m
kube-system   kube-proxy-j5pqx                 1/1       Running             0          1m
kube-system   kube-scheduler-kube01            1/1       Running             0          27s
openfaas      alertmanager-76c4595457-q7cb2    1/1       Running             0          26s
openfaas      faas-netesd-6b99db9f49-cznht     0/1       ContainerCreating   0          25s
openfaas      gateway-7f5bcf864-c8r6p          0/1       Error               0          26s
openfaas      nats-6c4f7df-z7zc4               0/1       ContainerCreating   0          25s
openfaas      prometheus-65b9b5c86d-w2mb7      0/1       ContainerCreating   0          25s
openfaas      queue-worker-676ccd9fb9-s4762    0/1       ContainerCreating   0          25s
suda@kube01:~/faas-netes$
```

暫く待ってから確認すると，きちんとRunningになっている．

```
suda@kube01:~/faas-netes$ kubectl get pods --all-namespaces
NAMESPACE     NAME                             READY     STATUS    RESTARTS   AGE
kube-system   etcd-kube01                      1/1       Running   0          6m
kube-system   kube-apiserver-kube01            1/1       Running   0          6m
kube-system   kube-controller-manager-kube01   1/1       Running   0          6m
kube-system   kube-dns-6f4fd4bdf-zssjf         3/3       Running   0          7m
kube-system   kube-flannel-ds-tg4l6            1/1       Running   0          7m
kube-system   kube-proxy-j5pqx                 1/1       Running   0          7m
kube-system   kube-scheduler-kube01            1/1       Running   0          6m
openfaas      alertmanager-76c4595457-q7cb2    1/1       Running   0          6m
openfaas      faas-netesd-6b99db9f49-cznht     1/1       Running   0          6m
openfaas      gateway-7f5bcf864-c8r6p          1/1       Running   1          6m
openfaas      nats-6c4f7df-z7zc4               1/1       Running   0          6m
openfaas      prometheus-65b9b5c86d-w2mb7      1/1       Running   0          6m
openfaas      queue-worker-676ccd9fb9-s4762    1/1       Running   0          6m
suda@kube01:~/faas-netes$
```

## faas-cliのインストール

OpenFaaSに使用するコマンドのインストールを行う．
と言っても，リポジトリからファイルをダウンロードして実行するだけである．
インストールされるコマンドは```faas-cli```であるが，長いので```faas```というaliasが自動的に作られる．

```
suda@kube01:~/faas-netes$ curl -sSL https://cli.openfaas.com | sudo sh
x86_64
Downloading package https://github.com/openfaas/faas-cli/releases/download/0.6.4/faas-cli as /tmp/faas-cli
Download complete.

Running as root - Attemping to move faas-cli to /usr/local/bin
New version of faas-cli installed to /usr/local/bin
Creating alias 'faas' for 'faas-cli'.
suda@kube01:~/faas-netes$
```

うまくインストールされていれば，以下のように実行できる．

```
suda@kube01:~/faas-netes$ faas
  ___                   _____           ____
 / _ \ _ __   ___ _ __ |  ___|_ _  __ _/ ___|
| | | | '_ \ / _ \ '_ \| |_ / _` |/ _` \___ \
| |_| | |_) |  __/ | | |  _| (_| | (_| |___) |
 \___/| .__/ \___|_| |_|_|  \__,_|\__,_|____/
      |_|


Manage your OpenFaaS functions from the command line

Usage:
  faas-cli [flags]
  faas-cli [command]

Available Commands:
  build          Builds OpenFaaS function containers
  deploy         Deploy OpenFaaS functions
  help           Help about any command
  invoke         Invoke an OpenFaaS function
  list           List OpenFaaS functions
  login          Log in to OpenFaaS gateway
  logout         Log out from OpenFaaS gateway
  new            Create a new template in the current folder with the name given as name
  push           Push OpenFaaS functions to remote registry (Docker Hub)
  remove         Remove deployed OpenFaaS functions
  store          OpenFaaS store commands
  template       Downloads templates from the specified github repo
  version        Display the clients version information

Flags:
      --filter string   Wildcard to match with function names in YAML file
  -h, --help            help for faas-cli
      --regex string    Regex to match with function names in YAML file
  -f, --yaml string     Path to YAML file describing function(s)

Use "faas-cli [command] --help" for more information about a command.
suda@kube01:~/faas-netes$
```

### サンプルの起動

特に問題なくインストールできたと思う．
それではサンプルとして配布されているfunctionを起動してみよう．
まずはダウンロード．

```
suda@kube01:~/faas-netes$ cd ..

suda@kube01:~$ git clone https://github.com/openfaas/faas-cli
Cloning into 'faas-cli'...
remote: Counting objects: 13114, done.
remote: Compressing objects: 100% (45/45), done.
remote: Total 13114 (delta 27), reused 30 (delta 17), pack-reused 13052
Receiving objects: 100% (13114/13114), 16.82 MiB | 4.73 MiB/s, done.
Resolving deltas: 100% (2961/2961), done.

suda@kube01:~$ cd faas-cli

suda@kube01:~/faas-cli$ ls
CHANGELOG.md       Gopkg.toml     app.go            commands           guide               schema     vendor
CONTRIBUTING.md    LICENSE        build.sh          config             legacy_cli.go       stack      version
Dockerfile         MANUAL_CLI.md  build_redist.sh   contrib            legacy_cli_test.go  stack.yml  versioncontrol
Dockerfile.redist  Makefile       build_samples.sh  deploy_samples.sh  proxy               template
Gopkg.lock         README.md      builder           get.sh             sample              test

suda@kube01:~/faas-cli$ cd vendor/github.com/openfaas/faas/sample-functions/

suda@kube01:~/faas-cli/vendor/github.com/openfaas/faas/sample-functions$ ls
AlpineFunction           CHelloWorld        HostnameIntent  NodeInfo           SentimentAnalysis  echo
ApiKeyProtected          CaptainsIntent     MarkdownRender  Phantomjs          WebhookStash       figlet
ApiKeyProtected-Secrets  ChangeColorIntent  Nmap            README.md          WordCountFunction  gif-maker
BaseFunctions            DockerHubStats     NodeHelloEnv    ResizeImageMagick  build_all.sh       samples.yml
suda@kube01:~/faas-cli/vendor/github.com/openfaas/faas/sample-functions$
```

このディレクトリに存在する，samples.ymlを使用すると，サンプルが全てデプロイされる．
ただし，Gatewayの項目だけ修正が必要である．
samples.ymlの先頭10行を以下に示す．
3行目に```gateway```の項目があるので，ここを書き換える．

```
provider:
  name: faas
  gateway: http://localhost:8080  # can be a remote server

functions:
  alpinefunction:
    lang: Dockerfile
    handler: ./AlpineFunction
    image: functions/alpine:0.6.9

```

書き換える内容であるが，OpenFaaSを動かしているコンピュータのIPアドレスと，ポート番号31112を指定すれば良い．
例えば，IPアドレスが172.16.121.165だとすると以下のようになる．
※先頭3行のみを示す．

```
provider:
  name: faas
  gateway: http://172.16.121.165:31112  # can be a remote server
```

書き換えたらデプロしてみよう．

```
suda@kube01:~/faas-cli/vendor/github.com/openfaas/faas/sample-functions$ faas-cli deploy -f samples.yml
Deploying: alpinefunction.

Deployed. 202 Accepted.
URL: http://172.16.121.165:31112/function/alpinefunction

Deploying: apikeyprotected.

Deployed. 202 Accepted.
URL: http://172.16.121.165:31112/function/apikeyprotected

Deploying: chelloworld.

Deployed. 202 Accepted.
URL: http://172.16.121.165:31112/function/chelloworld

Deploying: webhookstash.

Deployed. 202 Accepted.
URL: http://172.16.121.165:31112/function/webhookstash

Deploying: echo.

Deployed. 202 Accepted.
URL: http://172.16.121.165:31112/function/echo

Deploying: gif-maker.

Deployed. 202 Accepted.
URL: http://172.16.121.165:31112/function/gif-maker

Deploying: markdownrender.

Deployed. 202 Accepted.
URL: http://172.16.121.165:31112/function/markdownrender

Deploying: phantomjs.

Deployed. 202 Accepted.
URL: http://172.16.121.165:31112/function/phantomjs

Deploying: wordcountfunction.

Deployed. 202 Accepted.
URL: http://172.16.121.165:31112/function/wordcountfunction

Deploying: captainsintent.

Deployed. 202 Accepted.
URL: http://172.16.121.165:31112/function/captainsintent

Deploying: changecolorintent.

Deployed. 202 Accepted.
URL: http://172.16.121.165:31112/function/changecolorintent

Deploying: hostnameintent.

Deployed. 202 Accepted.
URL: http://172.16.121.165:31112/function/hostnameintent

Deploying: nodeinfo.

Deployed. 202 Accepted.
URL: http://172.16.121.165:31112/function/nodeinfo

Deploying: nmap.

Deployed. 202 Accepted.
URL: http://172.16.121.165:31112/function/nmap

Deploying: dockerhubstats.

Deployed. 202 Accepted.
URL: http://172.16.121.165:31112/function/dockerhubstats

Deploying: resizeimagemagick.

Deployed. 202 Accepted.
URL: http://172.16.121.165:31112/function/resizeimagemagick

Deploying: sentimentanalysis.

Deployed. 202 Accepted.
URL: http://172.16.121.165:31112/function/sentimentanalysis

suda@kube01:~/faas-cli/vendor/github.com/openfaas/faas/sample-functions$
```

登録されているfunctionの一覧を表示してみよう．
Invocatinosは，実行回数である．
Replicasは複製数で，きちんと複数nodeで構成して，かつ，負荷が上がると増えていくはずである．

```
suda@kube01:~/faas-cli/vendor/github.com/openfaas/faas/sample-functions$ faas-cli list -f samples.yml
Function                      	Invocations    	Replicas
alpinefunction                	0              	1
apikeyprotected               	0              	1
captainsintent                	0              	1
changecolorintent             	0              	1
chelloworld                   	0              	1
dockerhubstats                	0              	1
echo                          	0              	1
gif-maker                     	0              	1
hostnameintent                	0              	1
markdownrender                	0              	1
nmap                          	0              	1
nodeinfo                      	0              	1
phantomjs                     	0              	1
resizeimagemagick             	0              	1
sentimentanalysis             	0              	1
webhookstash                  	0              	1
wordcountfunction             	0              	1
suda@kube01:~/faas-cli/vendor/github.com/openfaas/faas/sample-functions$
```

### CLIからfunctionを実行する

それでは，以下のようにしてCLIからfunctionを実行してみよう．
行頭のechoは，functionに渡す文字列の生成である．
この例では何も渡していないが，好きな文字列（パラメータ）を渡すことができる．
実行するfunctionは行末にある```nodeinfo```である．

```
suda@kube01:~/faas-cli/vendor/github.com/openfaas/faas/sample-functions$ echo -n "" | faas-cli invoke --gateway http://172.16.121.165:31112 nodeinfo
Hostname: nodeinfo-6764d9c755-pzngc

Platform: linux
Arch: x64
CPU count: 2
Uptime: 9400
suda@kube01:~/faas-cli/vendor/github.com/openfaas/faas/sample-functions$
```

nodeinfo特有であるが，もう少し詳細を表示したい場合は，以下のように実行することもできる．

```
suda@kube01:~/faas-cli/vendor/github.com/openfaas/faas/sample-functions$ echo -n "verbose" | faas-cli invoke --gateway http://172.16.121.165:31112 nodeinfo
Hostname: nodeinfo-6764d9c755-pzngc

Platform: linux
Arch: x64
CPU count: 2
Uptime: 9429
[ { model: 'Intel(R) Core(TM) i7-7700K CPU @ 4.20GHz',
    speed: 4198,
    times: { user: 1400100, nice: 4000, sys: 1143000, idle: 90532100, irq: 0 } },
  { model: 'Intel(R) Core(TM) i7-7700K CPU @ 4.20GHz',
    speed: 4198,
    times:
     { user: 1502200,
       nice: 23400,
       sys: 1148900,
       idle: 90567100,
       irq: 0 } } ]
{ lo:
   [ { address: '127.0.0.1',
       netmask: '255.0.0.0',
       family: 'IPv4',
       mac: '00:00:00:00:00:00',
       internal: true },
     { address: '::1',
       netmask: 'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
       family: 'IPv6',
       mac: '00:00:00:00:00:00',
       scopeid: 0,
       internal: true } ],
  eth0:
   [ { address: '10.244.0.71',
       netmask: '255.255.255.0',
       family: 'IPv4',
       mac: '0a:58:0a:f4:00:47',
       internal: false },
     { address: 'fe80::54e5:66ff:fea4:cb58',
       netmask: 'ffff:ffff:ffff:ffff::',
       family: 'IPv6',
       mac: '0a:58:0a:f4:00:47',
       scopeid: 3,
       internal: false } ] }
suda@kube01:~/faas-cli/vendor/github.com/openfaas/faas/sample-functions$
```

### Webブラウザからfunctinoを実行する

続いて，Webブラウザからfunctinoを実行してみよう．
Webブラウザから```http://<サーバのIPアドレス>:31112/```にアクセスすると，OpenFaaS Portalが表示される．
左側にfunctionが並んでいるので，実行したいfunctionを選ぶ．
すると，右側に様々な情報が表示される．

ここで，```Invoke```ボタンをクリックすると，その下に実行結果が表示される．

## Functionの登録

### オンプレミスのDocker Registry

OpenFaaSでは，Docker Registryに登録されているDocker ImageをダウンロードしてFunctionとして利用するスタイルを用いている．
この辺りは，FaaSによって様々で，Kubelessでは作成したプログラムにランタイムを適用するだけでFunctionとして利用できる．
優劣が有るわけではなく，スタイルの違いである．

ここではOpenFaaSを用いるので，Functionを含んだDocker ImageをRegistryに登録する必要がある．
DockerHubに登録しても良いが，練習のために使用するのははばかられるので，オンプレミスで立ち上げることとする．

オープンソースのRegistryがDockerHubに登録されているので，これを使用することとする．
[registry](https://hub.docker.com/_/registry/)

上記ページの```Run a local registry: Quick Version```に従ってデプロイする．
Dockerコマンドを用いているが，気が向いたらKubernetes用のYAMLファイルを作る予定である．
なお，下記のように起動した場合，コンテナを停止するとRegistryの内容がクリアされるので注意すること．

```
suda@kube01:~$ docker run -d --rm -p 5000:5000 --name registry registry:2
d2bc14c3a5d9c84877590dc3c0102e438b10f6b293f93c3e6b4db00873161649
suda@kube01:~$
```

動作確認手順を以下に示す．
実際には，以下のことを順番に行っている．
1. DockerHubからubuntuのイメージをPullする
2. アップロード先とイメージ名をtagで指定する
3. Pushする


```
suda@kube01:~$ docker pull ubuntu
Using default tag: latest
latest: Pulling from library/ubuntu
22dc81ace0ea: Pull complete
1a8b3c87dba3: Pull complete
91390a1c435a: Pull complete
07844b14977e: Pull complete
b78396653dae: Pull complete
Digest: sha256:e348fbbea0e0a0e73ab0370de151e7800684445c509d46195aef73e090a49bd6
Status: Downloaded newer image for ubuntu:latest

suda@kube01:~$ docker tag ubuntu localhost:5000/ubuntu

suda@kube01:~$ docker push localhost:5000/ubuntu
The push refers to a repository [localhost:5000/ubuntu]
db584c622b50: Pushed
52a7ea2bb533: Pushed
52f389ea437e: Pushed
88888b9b1b5b: Pushed
a94e0d5a7c40: Pushed
latest: digest: sha256:cd97af0adaa421c07b9fdf18a459a22bb00b00268bdb18d7e50080ce9c1112ab size: 1357
suda@kube01:~$
```

無事にpushできていれば，きちんと動作している．
※このままでは複数台から構成されるKubernetesクラスタから使えない可能性があるので，その内きちんと設定方法を調べる予定である．

### Functionの作成とデプロイ

それでは実際にFunctionを作成してみましょう．
ここでは，下記の資料を見ながら作業を進めていきます．
[OpenFaaS on a Kubernetes clusterを試してみた](https://qiita.com/TakanariKo/items/300bf690181fc647a10d)

まずはディレクトリを作成し，テンプレートファイルをダウンロードします．
最後のlsコマンドで，templateディレクトリが作られていることが分かります．

```
suda@kube01:~$ mkdir hello-python

suda@kube01:~$ cd hello-python

suda@kube01:~/hello-python$ faas template pull
Fetch templates from repository: https://github.com/openfaas/templates.git
2018/03/29 11:55:50 Attempting to expand templates from https://github.com/openfaas/templates.git
2018/03/29 11:55:51 Fetched 12 template(s) : [csharp dockerfile go go-armhf node node-arm64 node-armhf python python-armhf python3 python3-armhf ruby] from https://github.com/openfaas/templates.git

suda@kube01:~/hello-python$ ls -F
template/
suda@kube01:~/hello-python$
```

続いて，Python3テンプレートを使用したFunction```hello-python```を作成します．
hello-pythonディレクトリとhello-python.ymlが作られていることが分かります．

```
suda@kube01:~/hello-python$ faas new hello-python --lang=python3
Folder: hello-python created.
  ___                   _____           ____
 / _ \ _ __   ___ _ __ |  ___|_ _  __ _/ ___|
| | | | '_ \ / _ \ '_ \| |_ / _` |/ _` \___ \
| |_| | |_) |  __/ | | |  _| (_| | (_| |___) |
 \___/| .__/ \___|_| |_|_|  \__,_|\__,_|____/
      |_|


Function created in folder: hello-python
Stack file written: hello-python.yml

suda@kube01:~/hello-python$ ls -F
hello-python/  hello-python.yml  template/
suda@kube01:~/hello-python$
```

hello-python.ymlの内容は以下のようになっています．

```
provider:
  name: faas
  gateway: http://127.0.0.1:8080

functions:
  hello-python:
    lang: python3
    handler: ./hello-python
    image: hello-python
```

作られたhello-pythonディレクトリを覗いてみます．
すると，3つのファイルが作られています．
この中で，まず練習のために使用するのはhandler.pyです．
内容を表示すると，reqを受け取ってreqを返すhandleというメソッドがあります．

```
suda@kube01:~/hello-python$ ls -F hello-python
__init__.py  handler.py  requirements.txt

suda@kube01:~/hello-python$ cat hello-python/handler.py
def handle(req):
    """handle a request to the function
    Args:
        req (str): request body
    """

    return req
suda@kube01:~/hello-python$
```

それでは，handleの内容を書き換えてみましょう．

```
def handle(req):
    """handle a request to the function
    Args:
        req (str): request body
    """
    print( "Welcome to OpenPaaS by Python" )
    print( str )
    return req
```

続いて，hello-python.ymlを書き換えます．
書き換えるポイントは2つです．
1つ目が，provider.gatewayです．この項目は，debianのIPアドレス:31112にしておいてください．
2つ目が，functions.imageです．この項目は，リポジトリ名です．先ほどデプロイしたローカルのリポジトリを使用するように書き換えます．

```
provider:
  name: faas
  gateway: http://172.16.121.165:31112

functions:
  hello-python:
    lang: python3
    handler: ./hello-python
    image: localhost:5000/hello-python
```

それでは，hello-python.ymlを使ってコンテナイメージをビルドします．
Python3テンプレートでは，alpineのイメージを元にして新たなイメージを作成します．
ネットワーク環境によっては，alpineのダウンロードにしばらく時間を要するかもしれません．

```
suda@kube01:~/hello-python$ faas build -f hello-python.yml
[0] > Building hello-python.
Clearing temporary build folder: ./build/hello-python/
Preparing ./hello-python/ ./build/hello-python/function
Building: hello-python with python3 template. Please wait..
Sending build context to Docker daemon  7.68 kB
Step 1/16 : FROM python:3-alpine
 ---> 4fcaf5fb5f2b
Step 2/16 : RUN apk --no-cache add curl     && echo "Pulling watchdog binary from Github."     && curl -sSL https://github.com/openfaas/faas/releases/download/0.7.6/fwatchdog > /usr/bin/fwatchdog     && chmod +x /usr/bin/fwatchdog     && apk del curl --no-cache
 ---> Using cache
 ---> 0e0e4274386b
Step 3/16 : WORKDIR /root/
 ---> Using cache
 ---> 174092ca0611
Step 4/16 : COPY index.py .
 ---> Using cache
 ---> e13905fe4681
Step 5/16 : COPY requirements.txt .
 ---> Using cache
 ---> 817eb77e6d8d
Step 6/16 : RUN pip install -r requirements.txt
 ---> Using cache
 ---> 32a0cfc0591d
Step 7/16 : RUN mkdir -p function
 ---> Using cache
 ---> 8588ca410e21
Step 8/16 : RUN touch ./function/__init__.py
 ---> Using cache
 ---> 955247d60a1c
Step 9/16 : WORKDIR /root/function/
 ---> Using cache
 ---> c0e21ff7c3e2
Step 10/16 : COPY function/requirements.txt .
provider:
 ---> Using cache
 ---> b2da0a585434
Step 11/16 : RUN pip install -r requirements.txt
 ---> Using cache
 ---> e5a90cec86e6
Step 12/16 : WORKDIR /root/
 ---> Using cache
 ---> 35600868649c
Step 13/16 : COPY function function
 ---> 9aac3726b629
Removing intermediate container a261c6ffc2f4
Step 14/16 : ENV fprocess "python3 index.py"
 ---> Running in 5888690230e5
 ---> 8e9eb19db684
Removing intermediate container 5888690230e5
Step 15/16 : HEALTHCHECK --interval=1s CMD [ -e /tmp/.lock ] || exit 1
 ---> Running in db2d14e9f123
 ---> b15eaca24450
Removing intermediate container db2d14e9f123
Step 16/16 : CMD fwatchdog
 ---> Running in 31fadc248fbb
 ---> 9d6553ad8358
Removing intermediate container 31fadc248fbb
Successfully built 9d6553ad8358
Image: hello-python built.
[0] < Building hello-python done.
[0] worker done.
suda@kube01:~/hello-python$
```

続いて，できあがったイメージをローカルのリポジトリに登録します．

```
suda@kube01:~/hello-python$ faas push -f hello-python.yml
[0] > Pushing hello-python.
The push refers to a repository [localhost:5000/hello-python]
139edb40f230: Pushed
df8a146b1da3: Pushed
85269f63996d: Pushed
e12a18f7076e: Pushed
746defdaa29f: Pushed
4fe6dc6d0808: Pushed
5ac9550fccd9: Pushed
aae31f4f40b2: Pushed
88bb90ce2a55: Pushed
f2e7d714d76b: Pushed
efa0b7a2d37b: Pushed
fe548f92b224: Pushed
a7d53ea16e81: Pushed
e53f74215d12: Pushed
latest: digest: sha256:313ff2b86ef9b166b8ff0f806728e638a342dc48cb3752ee21dafa4c6b12a990 size: 3240
[0] < Pushing hello-python done.
[0] worker done.
suda@kube01:~/hello-python$
```

実際にOpenFaaSにデプロイしてみます．

```
suda@kube01:~/hello-python$ faas deploy -f hello-python.yml
Deploying: hello-python.

Deployed. 202 Accepted.
URL: http://172.16.121.165:31112/function/hello-python

suda@kube01:~/hello-python$
```

上記のように```2020 Accepted```が表示されれば，無事にデプロイされています．
CLIから動作を確認してみましょう．

```
suda@kube01:~/hello-python$ echo -n "test" | faas-cli invoke --gateway http://172.16.121.165:31112 hello-python
Welcome to OpenPaaS by Python
<class 'str'>
test
suda@kube01:~/hello-python$
```

handler.pyに書いたとおり，```Welcome to OpenPaaS by Python```が表示されました．
その次の行がおかしいですね．
実は，パラメータreqを表示しようと思っていたのですが，誤ってstrを表示しています．
早速修正しましょう．

### Functionの修正

reqをstrに間違えたことは些細なことで，重要なのは修正時の手順です．
まずはソースコードを修正します．

```
def handle(req):
    """handle a request to the function
    Args:
        req (str): request body
    """
    print( "Welcome to OpenPaaS by Python" )
    print( req )
    return req
```

続いて，イメージをビルドします．
alpineのイメージはキャッシュされているので，すぐに終わります．

```
suda@kube01:~/hello-python$ faas build -f hello-python.yml
[0] > Building hello-python.
Clearing temporary build folder: ./build/hello-python/
Preparing ./hello-python/ ./build/hello-python/function
Building: localhost:5000/hello-python with python3 template. Please wait..
Sending build context to Docker daemon  7.68 kB
Step 1/16 : FROM python:3-alpine
 ---> 4fcaf5fb5f2b
Step 2/16 : RUN apk --no-cache add curl     && echo "Pulling watchdog binary from Github."     && curl -sSL https://github.com/openfaas/faas/releases/download/0.7.6/fwatchdog > /usr/bin/fwatchdog     && chmod +x /usr/bin/fwatchdog     && apk del curl --no-cache
 ---> Using cache
 ---> 0e0e4274386b
Step 3/16 : WORKDIR /root/
 ---> Using cache
 ---> 174092ca0611
Step 4/16 : COPY index.py .
 ---> Using cache
 ---> e13905fe4681
Step 5/16 : COPY requirements.txt .
 ---> Using cache
 ---> 817eb77e6d8d
Step 6/16 : RUN pip install -r requirements.txt
 ---> Using cache
 ---> 32a0cfc0591d
Step 7/16 : RUN mkdir -p function
 ---> Using cache
 ---> 8588ca410e21
Step 8/16 : RUN touch ./function/__init__.py
 ---> Using cache
 ---> 955247d60a1c
Step 9/16 : WORKDIR /root/function/
 ---> Using cache
 ---> c0e21ff7c3e2
Step 10/16 : COPY function/requirements.txt .
 ---> Using cache
 ---> b2da0a585434
Step 11/16 : RUN pip install -r requirements.txt
 ---> Using cache
 ---> e5a90cec86e6
Step 12/16 : WORKDIR /root/
 ---> Using cache
 ---> 35600868649c
Step 13/16 : COPY function function
 ---> 27d11415b115
Removing intermediate container 036c20a94a17
Step 14/16 : ENV fprocess "python3 index.py"
 ---> Running in 003497cea4be
 ---> dcb3d460b73d
Removing intermediate container 003497cea4be
Step 15/16 : HEALTHCHECK --interval=1s CMD [ -e /tmp/.lock ] || exit 1
 ---> Running in e507b857bf76
 ---> 84eac792868c
Removing intermediate container e507b857bf76
Step 16/16 : CMD fwatchdog
 ---> Running in 350a751ec2ff
 ---> eec79d2f1591
Removing intermediate container 350a751ec2ff
Successfully built eec79d2f1591
Image: localhost:5000/hello-python built.
[0] < Building hello-python done.
[0] worker done.
suda@kube01:~/hello-python$
```

続いて，ローカルのリポジトリにアップロードします．
変更がない部分については処理がスキップされるので，こちらもすぐに終わります．

```
suda@kube01:~/hello-python$ faas push -f hello-python.yml
[0] > Pushing hello-python.
The push refers to a repository [localhost:5000/hello-python]
f6d500348258: Pushed
df8a146b1da3: Layer already exists
85269f63996d: Layer already exists
e12a18f7076e: Layer already exists
746defdaa29f: Layer already exists
4fe6dc6d0808: Layer already exists
5ac9550fccd9: Layer already exists
aae31f4f40b2: Layer already exists
88bb90ce2a55: Layer already exists
f2e7d714d76b: Layer already exists
efa0b7a2d37b: Layer already exists
fe548f92b224: Layer already exists
a7d53ea16e81: Layer already exists
e53f74215d12: Layer already exists
latest: digest: sha256:40bce13b998ec4d881dbc9270cdacdca4a4cd8ff28aacbb9152d5e98965a18a2 size: 3240
[0] < Pushing hello-python done.
[0] worker done.
suda@kube01:~/hello-python$
```

続いて，OpenFaaSにデプロイします．
コマンドを実行すると，自動的に既存のfunctionであることを検知し，ローリングアップデートの作業に入ります．

```
suda@kube01:~/hello-python$ faas deploy -f hello-python.yml
Deploying: hello-python.
Function hello-python already exists, attempting rolling-update.

Deployed. 200 OK.
URL: http://172.16.121.165:31112/function/hello-python

suda@kube01:~/hello-python$
```

以上でデプロイが完了したはずなので，動作を確認してみましょう．

```
suda@kube01:~/hello-python$ echo -n "test" | faas-cli invoke --gateway http://172.16.121.165:31112 hello-python
Welcome to OpenPaaS by Python
test
test
suda@kube01:~/hello-python$
```

先程はstrと表示されてい箇所が，testになっているので，無事に更新が完了しました．


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
HTTPヘッダに```Host```情報が必要な点と，ポート番号が30080になっていることに気をつけてほしい．
なお，hello.pyでは表示時に改行が付けられていないので，プロンプトと一緒になっている．

```
suda@kube01:~/kubeless$ curl --header "Host: greeting.172.16.121.165.nip.io" 172.16.121.165:30080
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
