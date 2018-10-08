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
$ kubeadm reset
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
