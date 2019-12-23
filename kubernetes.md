kubernetes.log
===============

DebianにKubernetesをインストールするログを書き留める．
まずは練習のためにシングルホストKubernetesを構築する．

Debianのホスト名はdebianとする．
また，Kubernetesが最低でもCPUコアを2つ要求するので，VirtualBoxやVMWareの設定でプロセッサを2つ以上に設定すること．

## kubeadmなどの関連コマンドのインストール

まずはこちらを参考にして，kubeadmなどのコマンドを，debianおよびnode2にインストールする．
実際に行うのは実際に行うのは，```Installing kubeadm, kubelet and kubectl```の部分だけで良い．
[Installing kubeadm](https://kubernetes.io/docs/setup/independent/install-kubeadm/)

順番にログを紹介する．まずは```apt-gransport-https```のインストール．

```
suda@debian:~$ sudo apt-get install -y apt-transport-https
パッケージリストを読み込んでいます... 完了
依存関係ツリーを作成しています
状態情報を読み取っています... 完了
apt-transport-https はすでに最新バージョン (1.4.9) です。
アップグレード: 0 個、新規インストール: 0 個、削除: 0 個、保留: 1 個。
suda@debian:~$
```

続いて，Kubernetes関連のツールを公開しているGoogleの公開鍵の入手と登録．

```
suda@debian:~$ curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
OK
suda@debian:~$
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
suda@debian:~$ sudo apt-get update
無視:1 http://ftp.jp.debian.org/debian stretch InRelease
ヒット:2 http://ftp.jp.debian.org/debian stretch-updates InRelease
ヒット:3 http://ftp.jp.debian.org/debian stretch Release
ヒット:6 http://security.debian.org/debian-security stretch/updates InRelease
ヒット:7 https://download.docker.com/linux/debian stretch InRelease
取得:4 https://packages.cloud.google.com/apt kubernetes-xenial InRelease [8,993 B]
取得:8 https://packages.cloud.google.com/apt kubernetes-xenial/main amd64 Packages [32.2 kB]
41.2 kB を 2秒 で取得しました (19.9 kB/s)
パッケージリストを読み込んでいます... 完了
suda@debian:~$
```

必要とするパッケージ```kubelet```，```kubeadm```，```kubectl```をインストールします．

```
suda@debian:~$ sudo apt-get update
無視:1 http://ftp.jp.debian.org/debian stretch InRelease
ヒット:2 http://ftp.jp.debian.org/debian stretch-updates InRelease
ヒット:3 http://ftp.jp.debian.org/debian stretch Release
ヒット:6 http://security.debian.org/debian-security stretch/updates InRelease
ヒット:7 https://download.docker.com/linux/debian stretch InRelease
取得:4 https://packages.cloud.google.com/apt kubernetes-xenial InRelease [8,993 B]
取得:8 https://packages.cloud.google.com/apt kubernetes-xenial/main amd64 Packages [32.2 kB]
41.2 kB を 2秒 で取得しました (19.9 kB/s)
パッケージリストを読み込んでいます... 完了
suda@debian:~$ sudo apt-get install -y kubelet kubeadm kubectl
パッケージリストを読み込んでいます... 完了
依存関係ツリーを作成しています
状態情報を読み取っています... 完了
以下の追加パッケージがインストールされます:
  conntrack cri-tools ebtables ethtool kubernetes-cni socat
以下のパッケージが新たにインストールされます:
  conntrack cri-tools ebtables ethtool kubeadm kubectl kubelet kubernetes-cni socat
アップグレード: 0 個、新規インストール: 9 個、削除: 0 個、保留: 1 個。
51.8 MB のアーカイブを取得する必要があります。
この操作後に追加で 273 MB のディスク容量が消費されます。
取得:1 http://ftp.jp.debian.org/debian stretch/main amd64 conntrack amd64 1:1.4.4+snapshot20161117-5 [32.9 kB]
取得:2 http://ftp.jp.debian.org/debian stretch/main amd64 ebtables amd64 2.0.10.4-3.5+b1 [85.5 kB]
取得:4 http://ftp.jp.debian.org/debian stretch/main amd64 ethtool amd64 1:4.8-1+b1 [113 kB]
取得:5 http://ftp.jp.debian.org/debian stretch/main amd64 socat amd64 1.7.3.1-2+deb9u1 [353 kB]
取得:3 https://packages.cloud.google.com/apt kubernetes-xenial/main amd64 cri-tools amd64 1.13.0-00 [8,776 kB]
取得:6 https://packages.cloud.google.com/apt kubernetes-xenial/main amd64 kubernetes-cni amd64 0.7.5-00 [6,473 kB]
取得:7 https://packages.cloud.google.com/apt kubernetes-xenial/main amd64 kubelet amd64 1.17.0-00 [19.2 MB]
取得:8 https://packages.cloud.google.com/apt kubernetes-xenial/main amd64 kubectl amd64 1.17.0-00 [8,742 kB]
取得:9 https://packages.cloud.google.com/apt kubernetes-xenial/main amd64 kubeadm amd64 1.17.0-00 [8,059 kB]
51.8 MB を 9秒 で取得しました (5,282 kB/s)
以前に未選択のパッケージ conntrack を選択しています。
(データベースを読み込んでいます ... 現在 49610 個のファイルとディレクトリがインストールされています。)
.../0-conntrack_1%3a1.4.4+snapshot20161117-5_amd64.deb を展開する準備をしています ...
conntrack (1:1.4.4+snapshot20161117-5) を展開しています...
以前に未選択のパッケージ cri-tools を選択しています。
.../1-cri-tools_1.13.0-00_amd64.deb を展開する準備をしています ...
cri-tools (1.13.0-00) を展開しています...
以前に未選択のパッケージ ebtables を選択しています。
.../2-ebtables_2.0.10.4-3.5+b1_amd64.deb を展開する準備をしています ...
ebtables (2.0.10.4-3.5+b1) を展開しています...
以前に未選択のパッケージ ethtool を選択しています。
.../3-ethtool_1%3a4.8-1+b1_amd64.deb を展開する準備をしています ...
ethtool (1:4.8-1+b1) を展開しています...
以前に未選択のパッケージ kubernetes-cni を選択しています。
.../4-kubernetes-cni_0.7.5-00_amd64.deb を展開する準備をしています ...
kubernetes-cni (0.7.5-00) を展開しています...
以前に未選択のパッケージ socat を選択しています。
.../5-socat_1.7.3.1-2+deb9u1_amd64.deb を展開する準備をしています ...
socat (1.7.3.1-2+deb9u1) を展開しています...
以前に未選択のパッケージ kubelet を選択しています。
.../6-kubelet_1.17.0-00_amd64.deb を展開する準備をしています ...
kubelet (1.17.0-00) を展開しています...
以前に未選択のパッケージ kubectl を選択しています。
.../7-kubectl_1.17.0-00_amd64.deb を展開する準備をしています ...
kubectl (1.17.0-00) を展開しています...
以前に未選択のパッケージ kubeadm を選択しています。
.../8-kubeadm_1.17.0-00_amd64.deb を展開する準備をしています ...
kubeadm (1.17.0-00) を展開しています...
conntrack (1:1.4.4+snapshot20161117-5) を設定しています ...
kubernetes-cni (0.7.5-00) を設定しています ...
cri-tools (1.13.0-00) を設定しています ...
socat (1.7.3.1-2+deb9u1) を設定しています ...
systemd (232-25+deb9u12) のトリガを処理しています ...
ebtables (2.0.10.4-3.5+b1) を設定しています ...
Created symlink /etc/systemd/system/multi-user.target.wants/ebtables.service → /lib/systemd/system/ebtables.service.
update-rc.d: warning: start and stop actions are no longer supported; falling back to defaults
kubectl (1.17.0-00) を設定しています ...
ethtool (1:4.8-1+b1) を設定しています ...
kubelet (1.17.0-00) を設定しています ...
Created symlink /etc/systemd/system/multi-user.target.wants/kubelet.service → /lib/systemd/system/kubelet.service.
kubeadm (1.17.0-00) を設定しています ...
systemd (232-25+deb9u12) のトリガを処理しています ...
suda@debian:~$
```
## Kubernetesクラスタの作成

ここから先はこちらを参考にして，順番に環境を整えていく．
[Using kubeadm to Create a Cluster](https://kubernetes.io/docs/setup/independent/create-cluster-kubeadm/#14-installing-kubeadm-on-your-hosts)

### 事前準備

1. インストール時のDockerのバージョンは19.03.5であった．
2. Linuxシステムとして，Swapが設定されていると動作しないので，Swapを止める．

#### Swapの止め方（debian, node2の両方で実行）

まずはSwapがどこに設定されているか探すために```fdisk```コマンドを実行する．
すると，マウントしているデバイス一覧が表示される．
この中で，```Type```が```Linux swap /Solaris```と書いてあるデバイスがSwapである．
Swapを一時的に停止するコマンドは```swapoff```である．

```
suda@debian:~$ sudo swapoff -a

suda@debian:~$
```

## Masterノードのセットアップ

Masterノードとは，クラスタ全体の管理を行うノードである．
順番に説明していく．

### 再実行する場合

Kubernetesの設定をしていてやり直したい場合や，設定後に電源を落として再起動した場合は以下の操作が必要となる．

```
suda@debian:~$ sudo kubeadm reset
suda@debian:~$
```

### Masterノードの起動（debianで実行）

ここではdebianで実行する箇所である．
なお，Podネットワークが必要になるが，ここではFlannelを採用する．
そのため，init時にネットワークの設定を追加する必要があるので注意すること．

```
suda@debian:~$ sudo kubeadm init --pod-network-cidr=10.244.0.0/16
W1223 14:27:06.029997    9818 validation.go:28] Cannot validate kube-proxy config - no validator is available
W1223 14:27:06.030029    9818 validation.go:28] Cannot validate kubelet config - no validator is available
[init] Using Kubernetes version: v1.17.0
[preflight] Running pre-flight checks
	[WARNING IsDockerSystemdCheck]: detected "cgroupfs" as the Docker cgroup driver. The recommended driver is "systemd". Please follow the guide at https://kubernetes.io/docs/setup/cri/
[preflight] Pulling images required for setting up a Kubernetes cluster
[preflight] This might take a minute or two, depending on the speed of your internet connection
[preflight] You can also perform this action in beforehand using 'kubeadm config images pull'
[kubelet-start] Writing kubelet environment file with flags to file "/var/lib/kubelet/kubeadm-flags.env"
[kubelet-start] Writing kubelet configuration to file "/var/lib/kubelet/config.yaml"
[kubelet-start] Starting the kubelet
[certs] Using certificateDir folder "/etc/kubernetes/pki"
[certs] Generating "ca" certificate and key
[certs] Generating "apiserver" certificate and key
[certs] apiserver serving cert is signed for DNS names [debian kubernetes kubernetes.default kubernetes.default.svc kubernetes.default.svc.cluster.local] and IPs [10.96.0.1 10.0.2.15]
[certs] Generating "apiserver-kubelet-client" certificate and key
[certs] Generating "front-proxy-ca" certificate and key
[certs] Generating "front-proxy-client" certificate and key
[certs] Generating "etcd/ca" certificate and key
[certs] Generating "etcd/server" certificate and key
[certs] etcd/server serving cert is signed for DNS names [debian localhost] and IPs [10.0.2.15 127.0.0.1 ::1]
[certs] Generating "etcd/peer" certificate and key
[certs] etcd/peer serving cert is signed for DNS names [debian localhost] and IPs [10.0.2.15 127.0.0.1 ::1]
[certs] Generating "etcd/healthcheck-client" certificate and key
[certs] Generating "apiserver-etcd-client" certificate and key
[certs] Generating "sa" key and public key
[kubeconfig] Using kubeconfig folder "/etc/kubernetes"
[kubeconfig] Writing "admin.conf" kubeconfig file
[kubeconfig] Writing "kubelet.conf" kubeconfig file
[kubeconfig] Writing "controller-manager.conf" kubeconfig file
[kubeconfig] Writing "scheduler.conf" kubeconfig file
[control-plane] Using manifest folder "/etc/kubernetes/manifests"
[control-plane] Creating static Pod manifest for "kube-apiserver"
[control-plane] Creating static Pod manifest for "kube-controller-manager"
W1223 14:27:54.651011    9818 manifests.go:214] the default kube-apiserver authorization-mode is "Node,RBAC"; using "Node,RBAC"
[control-plane] Creating static Pod manifest for "kube-scheduler"
W1223 14:27:54.651683    9818 manifests.go:214] the default kube-apiserver authorization-mode is "Node,RBAC"; using "Node,RBAC"
[etcd] Creating static Pod manifest for local etcd in "/etc/kubernetes/manifests"
[wait-control-plane] Waiting for the kubelet to boot up the control plane as static Pods from directory "/etc/kubernetes/manifests". This can take up to 4m0s
[apiclient] All control plane components are healthy after 34.502055 seconds
[upload-config] Storing the configuration used in ConfigMap "kubeadm-config" in the "kube-system" Namespace
[kubelet] Creating a ConfigMap "kubelet-config-1.17" in namespace kube-system with the configuration for the kubelets in the cluster
[upload-certs] Skipping phase. Please see --upload-certs
[mark-control-plane] Marking the node debian as control-plane by adding the label "node-role.kubernetes.io/master=''"
[mark-control-plane] Marking the node debian as control-plane by adding the taints [node-role.kubernetes.io/master:NoSchedule]
[bootstrap-token] Using token: er8h92.1hbd2126um0y6qci
[bootstrap-token] Configuring bootstrap tokens, cluster-info ConfigMap, RBAC Roles
[bootstrap-token] configured RBAC rules to allow Node Bootstrap tokens to post CSRs in order for nodes to get long term certificate credentials
[bootstrap-token] configured RBAC rules to allow the csrapprover controller automatically approve CSRs from a Node Bootstrap Token
[bootstrap-token] configured RBAC rules to allow certificate rotation for all node client certificates in the cluster
[bootstrap-token] Creating the "cluster-info" ConfigMap in the "kube-public" namespace
[kubelet-finalize] Updating "/etc/kubernetes/kubelet.conf" to point to a rotatable kubelet client certificate and key
[addons] Applied essential addon: CoreDNS
[addons] Applied essential addon: kube-proxy

Your Kubernetes control-plane has initialized successfully!

To start using your cluster, you need to run the following as a regular user:

  mkdir -p $HOME/.kube
  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
  sudo chown $(id -u):$(id -g) $HOME/.kube/config

You should now deploy a pod network to the cluster.
Run "kubectl apply -f [podnetwork].yaml" with one of the options listed at:
  https://kubernetes.io/docs/concepts/cluster-administration/addons/

Then you can join any number of worker nodes by running the following on each as root:

kubeadm join 10.0.2.15:6443 --token er8h92.1hbd2126um0y6qci \
    --discovery-token-ca-cert-hash sha256:19dca7ea4c16425bf8a11fec53b1ed9132c7cd7dce08064a489b97c99d2afe81
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
suda@debian:~$ kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
podsecuritypolicy.policy/psp.flannel.unprivileged created
clusterrole.rbac.authorization.k8s.io/flannel created
clusterrolebinding.rbac.authorization.k8s.io/flannel created
serviceaccount/flannel created
configmap/kube-flannel-cfg created
daemonset.apps/kube-flannel-ds-amd64 created
daemonset.apps/kube-flannel-ds-arm64 created
daemonset.apps/kube-flannel-ds-arm created
daemonset.apps/kube-flannel-ds-ppc64le created
daemonset.apps/kube-flannel-ds-s390x created
suda@debian:~$
```

通常はKubernetesのMasterノードには，コンテナを配置しないようになっている．
ここで，下記コマンドにより，Masterノードにもコンテナを配置できるようになる．
（つまり，1ノードでKubernetesを使用することができる）

```
suda@debian:~$ kubectl taint nodes --all node-role.kubernetes.io/master-
node/debian untainted
suda@debian:~$
```

### 確認

Kubernetesクラスタ上で起動しているすべてのサービスを表示する例を以下に示す．

```
suda@debian:~$ kubectl get pods --all-namespaces
NAMESPACE     NAME                             READY   STATUS    RESTARTS   AGE
kube-system   coredns-6955765f44-cb4v9         1/1     Running   0          93s
kube-system   coredns-6955765f44-xvj46         1/1     Running   0          93s
kube-system   etcd-debian                      1/1     Running   0          89s
kube-system   kube-apiserver-debian            1/1     Running   0          89s
kube-system   kube-controller-manager-debian   1/1     Running   0          89s
kube-system   kube-flannel-ds-amd64-d562n      1/1     Running   0          40s
kube-system   kube-proxy-xt7qm                 1/1     Running   0          93s
kube-system   kube-scheduler-debian            1/1     Running   0          89s
suda@debian:~$
```

次に，接続されているホスト情報を表示する例を以下に示す．

```
suda@debian:~$ kubectl get nodes
NAME     STATUS   ROLES    AGE     VERSION
debian   Ready    master   2m10s   v1.17.0
suda@debian:~$
```

## nginxの起動

まずはnginxを動かしてみよう．

```
suda@debian:~$ kubectl run nginx --image=nginx
kubectl run --generator=deployment/apps.v1 is DEPRECATED and will be removed in a future version. Use kubectl run --generator=run-pod/v1 or kubectl create instead.
deployment.apps/nginx created
suda@debian:~$
```

将来的にrunの中でdeploymentを使うのは使えなくなるのでやめろと言われているが，現状は動いているので良しとする．
これまで起動を確認する．
Kubernetesでは，PODという単位で動いているコンテナを確認できる．

```
suda@debian:~$ kubectl get pods
NAME                     READY   STATUS    RESTARTS   AGE
nginx-6db489d4b7-qdz6p   1/1     Running   0          22s
suda@debian:~$
```

### コンテナ数を変更する

ここで，以下のように入力すると，様々な設定を修正することができる．

```
suda@debina:~$ kubectl edit deployment
```

エディタが起動するので内容を確認して欲しい．

```
# Please edit the object below. Lines beginning with a '#' will be ignored,
# and an empty file will abort the edit. If an error occurs while saving this file will be
# reopened with the relevant failures.
#
apiVersion: apps/v1
kind: Deployment
metadata:
  annotations:
    deployment.kubernetes.io/revision: "1"
  creationTimestamp: "2019-12-23T06:14:14Z"
  generation: 3
  labels:
    run: nginx
  name: nginx
  namespace: default
  resourceVersion: "6428"
  selfLink: /apis/apps/v1/namespaces/default/deployments/nginx
  uid: d900855c-7112-4fe2-8b2f-560bc04dc972
spec:
  progressDeadlineSeconds: 600
  replicas: 1
  revisionHistoryLimit: 10
  selector:
    matchLabels:
      run: nginx
  strategy:
    rollingUpdate:
      maxSurge: 25%
      maxUnavailable: 25%
    type: RollingUpdate
  template:
    metadata:
      creationTimestamp: null
      labels:
        run: nginx
    spec:
      containers:
      - image: nginx
        imagePullPolicy: Always
        name: nginx
        resources: {}
        terminationMessagePath: /dev/termination-log
        terminationMessagePolicy: File
      dnsPolicy: ClusterFirst
      restartPolicy: Always
      schedulerName: default-scheduler
      securityContext: {}
      terminationGracePeriodSeconds: 30
status:
  availableReplicas: 1
  conditions:
  - lastTransitionTime: "2019-12-23T06:14:14Z"
    lastUpdateTime: "2019-12-23T06:14:18Z"
    message: ReplicaSet "nginx-6db489d4b7" has successfully progressed.
    reason: NewReplicaSetAvailable
    status: "True"
    type: Progressing
  - lastTransitionTime: "2019-12-23T06:44:20Z"
    lastUpdateTime: "2019-12-23T06:44:20Z"
    message: Deployment has minimum availability.
    reason: MinimumReplicasAvailable
    status: "True"
    type: Available
  observedGeneration: 3
  readyReplicas: 1
  replicas: 1
  updatedReplicas: 1
```

ここで，起動しているnginxのコンテナ数を変更してみよう．
21行目の```replicas```が，コンテナ数である．
例えばこれを3にしてみよう．
行頭の数字は行番号なので，無視すること．

```
21   replicas: 3
```

保存して終了すると，コンテナ数が増える．
タイミングによって表示内容が異なるが，エディタ終了直後にpodを確認すると以下のように表示される．

```
suda@debian:~$ kubectl get pods
NAME                     READY   STATUS              RESTARTS   AGE
nginx-6db489d4b7-qdz6p   1/1     Running             0          37m
nginx-6db489d4b7-rd9qq   0/1     ContainerCreating   0          2s
nginx-6db489d4b7-xnkks   0/1     ContainerCreating   0          2s
```

1つ目が先程から実行されているコンテナで，下2つが新たに起動しようとしているコンテナである．
しばらく待ってから確認すると，以下のように起動していることが分かる．

```
suda@debian:~$ kubectl get pods
NAME                     READY   STATUS    RESTARTS   AGE
nginx-6db489d4b7-qdz6p   1/1     Running   0          37m
nginx-6db489d4b7-rd9qq   1/1     Running   0          9s
nginx-6db489d4b7-xnkks   1/1     Running   0          9s
suda@debian:~$
```

続いて，手動でコンテナを終了させてみよう．
まずはnginxに関連するコンテナ情報をdockerコマンドで表示してみよう．

```
suda@debian:~$ sudo docker ps | grep nginx
4f5c772bda64        nginx                  "nginx -g 'daemon of…"   3 minutes ago       Up 2 minutes                            k8s_nginx_nginx-6db489d4b7-rd9qq_default_aad8c84a-5204-41ea-9ab9-28b9e24fdb19_0
1d3c6f512657        nginx                  "nginx -g 'daemon of…"   3 minutes ago       Up 3 minutes                            k8s_nginx_nginx-6db489d4b7-xnkks_default_6451b3a2-07d2-4234-9638-054db19484d0_0
9f6f9d361618        k8s.gcr.io/pause:3.1   "/pause"                 3 minutes ago       Up 3 minutes                            k8s_POD_nginx-6db489d4b7-xnkks_default_6451b3a2-07d2-4234-9638-054db19484d0_0
e429e92936a4        k8s.gcr.io/pause:3.1   "/pause"                 3 minutes ago       Up 3 minutes                            k8s_POD_nginx-6db489d4b7-rd9qq_default_aad8c84a-5204-41ea-9ab9-28b9e24fdb19_0
137601861f14        nginx                  "nginx -g 'daemon of…"   40 minutes ago      Up 40 minutes                           k8s_nginx_nginx-6db489d4b7-qdz6p_default_ce7c5b3c-cb04-4e6c-bc06-609d81b665f7_0
9d40c73d5531        k8s.gcr.io/pause:3.1   "/pause"                 40 minutes ago      Up 40 minutes                           k8s_POD_nginx-6db489d4b7-qdz6p_default_ce7c5b3c-cb04-4e6c-bc06-609d81b665f7_0
031a3383c5ae        3297e40e273c           "nginx -g 'daemon of…"   45 minutes ago      Up 45 minutes                           k8s_http-svc_http-svc-5b874554-5xqk8_ingress-controller_210f8457-bbb3-4720-8e1e-15fe322f9463_0
suda@debian:~$
```

少々見づらいが，左から2番めの欄に```nginx```と書いてあるものが該当するコンテナである．
1行目の```4f5c```で始まるコンテナを終了させてすぐにコンテナ情報を確認してみよう．

```
suda@debian:~$ sudo docker kill 4f5c
4f5c
suda@debian:~$ sudo docker ps | grep nginx
1d3c6f512657        nginx                  "nginx -g 'daemon of…"   5 minutes ago       Up 5 minutes                            k8s_nginx_nginx-6db489d4b7-xnkks_default_6451b3a2-07d2-4234-9638-054db19484d0_0
9f6f9d361618        k8s.gcr.io/pause:3.1   "/pause"                 5 minutes ago       Up 5 minutes                            k8s_POD_nginx-6db489d4b7-xnkks_default_6451b3a2-07d2-4234-9638-054db19484d0_0
e429e92936a4        k8s.gcr.io/pause:3.1   "/pause"                 5 minutes ago       Up 5 minutes                            k8s_POD_nginx-6db489d4b7-rd9qq_default_aad8c84a-5204-41ea-9ab9-28b9e24fdb19_0
137601861f14        nginx                  "nginx -g 'daemon of…"   43 minutes ago      Up 43 minutes                           k8s_nginx_nginx-6db489d4b7-qdz6p_default_ce7c5b3c-cb04-4e6c-bc06-609d81b665f7_0
9d40c73d5531        k8s.gcr.io/pause:3.1   "/pause"                 43 minutes ago      Up 43 minutes                           k8s_POD_nginx-6db489d4b7-qdz6p_default_ce7c5b3c-cb04-4e6c-bc06-609d81b665f7_0
031a3383c5ae        3297e40e273c           "nginx -g 'daemon of…"   47 minutes ago      Up 47 minutes                           k8s_http-svc_http-svc-5b874554-5xqk8_ingress-controller_210f8457-bbb3-4720-8e1e-15fe322f9463_0
suda@debian:~$
```

この時点では確かにnginxコンテナは2つに減っている．
少し時間をおいて再び確認すると，また3つになっている．

```
suda@debian:~$ sudo docker ps | grep nginx
a22e796e097b        nginx                  "nginx -g 'daemon of…"   14 seconds ago      Up 13 seconds                           k8s_nginx_nginx-6db489d4b7-rd9qq_default_aad8c84a-5204-41ea-9ab9-28b9e24fdb19_1
1d3c6f512657        nginx                  "nginx -g 'daemon of…"   5 minutes ago       Up 5 minutes                            k8s_nginx_nginx-6db489d4b7-xnkks_default_6451b3a2-07d2-4234-9638-054db19484d0_0
9f6f9d361618        k8s.gcr.io/pause:3.1   "/pause"                 5 minutes ago       Up 5 minutes                            k8s_POD_nginx-6db489d4b7-xnkks_default_6451b3a2-07d2-4234-9638-054db19484d0_0
e429e92936a4        k8s.gcr.io/pause:3.1   "/pause"                 5 minutes ago       Up 5 minutes                            k8s_POD_nginx-6db489d4b7-rd9qq_default_aad8c84a-5204-41ea-9ab9-28b9e24fdb19_0
137601861f14        nginx                  "nginx -g 'daemon of…"   43 minutes ago      Up 43 minutes                           k8s_nginx_nginx-6db489d4b7-qdz6p_default_ce7c5b3c-cb04-4e6c-bc06-609d81b665f7_0
9d40c73d5531        k8s.gcr.io/pause:3.1   "/pause"                 43 minutes ago      Up 43 minutes                           k8s_POD_nginx-6db489d4b7-qdz6p_default_ce7c5b3c-cb04-4e6c-bc06-609d81b665f7_0
031a3383c5ae        3297e40e273c           "nginx -g 'daemon of…"   47 minutes ago      Up 47 minutes                           k8s_http-svc_http-svc-5b874554-5xqk8_ingress-controller_210f8457-bbb3-4720-8e1e-15fe322f9463_0
suda@debian:~$
```

Kubectlコマンドでnginxコンテナを追ってみたものを以下に示す．
以下のように，KILLされたコンテナは，Kubernetes上でのステータスは```Error```となり，数秒待つと```CrashLoopbackOff```になる．
その後，再起動されるという手順を経る．

```
suda@debian:~$ kubectl get pods を繰り返し実行して該当箇所を抜粋したもので，実際の表示結果とは異なる
NAME                     READY   STATUS    RESTARTS   AGE
nginx-6db489d4b7-rd9qq   0/1     Error     1          9m4s
nginx-6db489d4b7-rd9qq   0/1     Error     1          9m7s
nginx-6db489d4b7-rd9qq   0/1     Error     1          9m12s
nginx-6db489d4b7-rd9qq   0/1     CrashLoopBackOff   1          9m13s
nginx-6db489d4b7-rd9qq   0/1     CrashLoopBackOff   1          9m15s
nginx-6db489d4b7-rd9qq   1/1     Running   2          9m16s
```

このように，不意にコンテナが落ちても，サービス全体が落ちることのないよう，Kubernetesが監視してくれる．

## サービスのデプロイ（debianで実行）

無事にクラスタができたので，nginxにアクセスするための手順を示す．
1. LoadBalancerを通じて外部に公開
2. 外部からアクセスするためのIPアドレスの確認
3. サービスの基本的な情報を表示

なぜか，外部IPがpengingのまま・・・
ついでなので，nginxのサービスの詳細を表示してみる．
ここでNodePortという項目が外部ポートである．

LoadBalancerを起動する．
これによって，外部からのアクセスが可能になる．
ただし，ここで言う外部は「コンテナの外部」であり，debianから内部のIPアドレスを通じてアクセスできる世界である．

```
suda@debian:~$ kubectl expose deployment nginx --port 80 --type LoadBalancer
service/nginx exposed
suda@debian:~$
```

起動したLoadBalancerのサービスを確認すると，コンテナ内に80番ポートで待ち受けをしているが，コンテナ外からは31136番ポートであることが分かる番ポートであることが分かる．
よって，この例では```http://<debianのIPアドレス>:31136/```でアクセス可能である．
参考までに，GoogleやAmazonのクラウド上では，下記のEXTERNAL-IPのところにきちんとIPアドレスが割り当てられ，独立したサービスとして起動する．

```
suda@debian:~$ kubectl get services
NAME         TYPE           CLUSTER-IP    EXTERNAL-IP   PORT(S)        AGE
kubernetes   ClusterIP      10.96.0.1     <none>        443/TCP        5m43s
nginx        LoadBalancer   10.96.27.72   <pending>     80:30929/TCP   14s
suda@debian:~$
```

nginxの情報をもう少し詳細に表示するには，以下のように```describe```を使用する．

```
suda@debian:~$ kubectl describe services nginx
Name:                     nginx
Namespace:                default
Labels:                   run=nginx
Annotations:              <none>
Selector:                 run=nginx
Type:                     LoadBalancer
IP:                       10.96.27.72
Port:                     <unset>  80/TCP
TargetPort:               80/TCP
NodePort:                 <unset>  30929/TCP
Endpoints:                10.244.0.4:80
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
suda@debian:~$ kubectl create -f https://raw.githubusercontent.com/jcmoraisjr/haproxy-ingress/master/docs/haproxy-ingress.yaml
namespace/ingress-controller created
serviceaccount/ingress-controller created
clusterrole.rbac.authorization.k8s.io/ingress-controller created
role.rbac.authorization.k8s.io/ingress-controller created
clusterrolebinding.rbac.authorization.k8s.io/ingress-controller created
rolebinding.rbac.authorization.k8s.io/ingress-controller created
deployment.apps/ingress-default-backend created
service/ingress-default-backend created
configmap/haproxy-ingress created
daemonset.apps/haproxy-ingress created
suda@debian:~$
```

その後，node名を調べてroleを指定する．

```
suda@debian:~$ kubectl get node
NAME     STATUS   ROLES    AGE     VERSION
debian   Ready    master   7m18s   v1.17.0
suda@debian:~$ kubectl label node debian role=ingress-controller
node/debian labeled
suda@debian:~$ kubectl -n ingress-controller get ds
NAME              DESIRED   CURRENT   READY   UP-TO-DATE   AVAILABLE   NODE SELECTOR             AGE
haproxy-ingress   1         1         1       1            1           role=ingress-controller   57s
suda@debian:~$
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
ingress.extensions/test-ingress created
suda@debian:~$ kubectl get ingress
NAME           HOSTS   ADDRESS   PORTS   AGE
test-ingress   *                 80      6s
suda@debian:~$
```

この状態で，```http://<debianのIPアドレス>/```にアクセスすると，無事にNginxのページを閲覧可能である．
ここまで来たら，Kubernetesの各種情報が更新されても良さそうであるが，残念ながらそこまではやってくれないらしい．
サービス一覧を表示させても，```EXTERNAL-IP```は```pending```のままであった．

```
suda@debian:~$ kubectl get services
NAME         TYPE           CLUSTER-IP    EXTERNAL-IP   PORT(S)        AGE
kubernetes   ClusterIP      10.96.0.1     <none>        443/TCP        9m51s
nginx        LoadBalancer   10.96.27.72   <pending>     80:30929/TCP   4m22s
suda@debian:~$
```

ここまで設定すると，localhostの80番ポートへのアクセスを，nginxに繋げてくれるはずなのだが，上手くいかない．
なぜ？

参考までに，10.96.27.72の80番ポートにアクセスすると，Welcome to nginx!が返される．

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

Kubernetesクラスタの状態を表示するWebのインタフェースを動かしてみる．
[kubernetes/dashboard](https://github.com/kubernetes/dashboard)

それでは，```Getting start```の手順に従っていきなりデプロイする．

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

確認すると，```kubernetes-dashboard```から始まるPodが動いているのが分かる．

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

詳細を表示してみる．

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

このままでは外部からアクセスできないので，proxyを動作させる．

```
suda@kube01:~$ kubectl proxy --address="0.0.0.0" -p 8001 --accept-hosts='^*$' &
Starting to serve on [::]:8001
suda@kube01:~$
```

この状態であれば，他のホストから```http://<debianのIPアドレス>:8001/```にアクセスできる．
実際に使う場合は```http://<debianのIPアドレス>:8001/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/#!/login```にアクセスする．
アクセスすると，```Kubeconfig```と```Token```と書かれた，ログインページのようなものが表示される．

しかし，このままでは権限の関係で先に進めないので，以下の手順で権限を付ける．
[Creating sample user](https://github.com/kubernetes/dashboard/wiki/Creating-sample-user)

ここでは，```admin-user```というアカウントを作成し，```cluster-admin```というロールに割り当てる．
まずは上記ページに掲載されているyamlファイルを作成する．
ファイル名は特に指定されていないので，ここでは```admin-user.yaml```と```admin-role.yaml```としておく．

admin-user.yaml

```
apiVersion: v1
kind: ServiceAccount
metadata:
  name: admin-user
  namespace: kube-system
```

admin-role.yaml

```
apiVersion: rbac.authorization.k8s.io/v1beta1
kind: ClusterRoleBinding
metadata:
  name: admin-user
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
- kind: ServiceAccount
  name: admin-user
  namespace: kube-system
```

これらをkubectlを使って登録する．

```
suda@kube01:~/dashboard$ kubectl create -f admin-user.yaml
serviceaccount "admin-user" created

suda@kube01:~/dashboard$ kubectl create -f admin-role.yaml
clusterrolebinding "admin-user" created
suda@kube01:~/dashboard$
```

続いて，作成した```admin-user```のtokenを取得する．

```
suda@kube01:~/dashboard$ kubectl -n kube-system describe secret $(kubectl -n kube-system get secret | grep admin-user | awk '{print $1}')
Name:         admin-user-token-4bn95
Namespace:    kube-system
Labels:       <none>
Annotations:  kubernetes.io/service-account.name=admin-user
              kubernetes.io/service-account.uid=a13bd1c5-3254-11e8-a767-000c29966b2f

Type:  kubernetes.io/service-account-token

Data
====
token:      eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJrdWJlLXN5c3RlbSIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJhZG1pbi11c2VyLXRva2VuLTRibjk1Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6ImFkbWluLXVzZXIiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC51aWQiOiJhMTNiZDFjNS0zMjU0LTExZTgtYTc2Ny0wMDBjMjk5NjZiMmYiLCJzdWIiOiJzeXN0ZW06c2VydmljZWFjY291bnQ6a3ViZS1zeXN0ZW06YWRtaW4tdXNlciJ9.ha-Lmyq8m9Ic_3TM145KAl_8BMiqXt-Ozfgyp8upu1oYWn0OJMwkO1pzUd1A-6EOewTLpgbIBFJwF9zDuHV1ShTI1vq2d4hxuslNLFt072GwQVmQOrF2uEEZ66fRvMeqd6FDHC4SxDcsBBNmflTwQQLfPEUCdPOhFlN1VX-lAIZTwsKUk6F_DAE2cv6ZtyT3pleoxZv5TRbTOzbbIYyJbCR-Xd2PcDDdBhJpgDEp8VE_9YPXAGjUetoENTvWEIyfG0ZnrrKyeCmj1yLGMibf4_ypUKXtDWLWZXuHwjuv-9LYnKy5a-N5tpgkge06nQn4BTb5rMxSJmC3dubpd5E4bA
ca.crt:     1025 bytes
namespace:  11 bytes
suda@kube01:~/dashboard$
```

この中の，taken:の行にある```eyJh```で始まる文字列がtokenであるので，マウスで選択してコピーしておく．
Webブラウザから，先程のDashboardを開き，```Token```を選択して，その下にある入力欄にペーストする．
```SIGN IN```をクリックすると次に進みそうであるが，進まなかったので```Skip```をクリックしたら次に進んだ．

Dashboardを表示させながら，コマンドを叩くことによって，動作がわかりやすくなるはずなので活用して欲しい．

## 参考文献
[自宅PCクラスタのKubernetesを1.9にバージョンアップしたログ](http://dr-asa.hatenablog.com/entry/2017/12/19/095008)
[Get Docker CE for Ubuntu](https://docs.docker.com/engine/installation/linux/docker-ce/ubuntu/)
[kubectl completion: Bash/Zsh 向けの kubectl のシェル自動補完](https://qiita.com/superbrothers/items/631508630320aa1dbcbc)
