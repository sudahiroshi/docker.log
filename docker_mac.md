Docker for Mac
===============

環境依存になりますが，Docker for Macについても記載します．

使用環境
- macOS sierra

## Docker for Macとは

macOS用のDockerです．
そもそもDockerとは，ホストの環境を汚さずに，迅速かつ確実にアプリケーションを立ち上げるための技術で，PaaS業者であるDotCloud社が開発しました．
元々DockerはLinux上でプロセスなどを隔離する仕組みから発展したものなので，基本的にLinux上でしか動作しません．
macOS上で仮想化されたLinuxを動かし，その上でDockerを走らせるのがDocker for Macです．

## Docker for Macのダウンロードとインストール

Docker for Macには，有償版のEnterprise Edition(EE)と，おためし版のCommunity Edition(CE)があります．
今回はCEを利用します．

CEには，Stableリリース（安定版）と，先進的な取り組みを盛り込んだEdgeリリースがあります．
今回はEdgeリリースを利用します．

以下のページから，Edgeリリースをダウンロードして下さい．

[Docker Community Edition for Mac](https://store.docker.com/editions/community/docker-ce-desktop-mac)

実際のファイルは```Docker.dmg```という名前の，453.6MBのファイルです．
このアイコンを開くと，```Docker.app →DRAG & DROP→ Applications```と書かれたフォルダが出てくるので，文字通りDocker.appをApplicationにDrag & Dropしてください．

以上でダウンロードは完了です．
続いて，Applicationフォルダ内のDocker.appをダブルクリックします．
すると```"Docker.app"はインターネットからダウンロードされたアプリケーションです．開いてもよろしいですか？```と聞かれるので```開く```をクリックしてください．

続いて```Welcome to Docker for Mac!```というダイアログが出るので，```Next```をクリックします．
すると```Docker needs privileged access.```というダイアログが出るので，```OK```をクリックします．
（これは，Dockerコンテナのネットワークのための設定です）
管理者のIDとパスワードを入力すると，インストールは完了です．

画面上部のメニューバーの右の方にDockerのアイコンが増えていると思います．

## Kubernetesのインストール

次に，Kubernetesの設定を行います．

Dockerのアイコンをクリックして，メニューから```Preference...```を選択してください．
ウィンドウが開くので，並んでいるアイコンの中から```Kubernetes```をクリックします．
画面内の```Enable Kubernetes```にチェックを入れて```Apply```をクリックしてください．
するとKubernetesをインストールして良いか尋ねられるので，```Install```をクリックします．
暫く待つと，Kubernetesのインストールが完了します．

## インストールされたソフトウェわの確認

インストールされたソフトウェアを確認してみましょう．
iterm2（コンソール）を開いて以下のように実行してみてください．

```
$ docker version
Client:
 Version:	18.04.0-ce
 API version:	1.37
 Go version:	go1.9.4
 Git commit:	3d479c0
 Built:	Tue Apr 10 18:13:16 2018
 OS/Arch:	darwin/amd64
 Experimental:	true
 Orchestrator:	kubernetes

Server:
 Engine:
  Version:	18.04.0-ce
  API version:	1.37 (minimum version 1.12)
  Go version:	go1.9.4
  Git commit:	3d479c0
  Built:	Tue Apr 10 18:23:05 2018
  OS/Arch:	linux/amd64
  Experimental:	true
 Kubernetes:
  Version:	v1.9.6
  StackAPI:		v1beta1
$
```

dockerコマンドがインストールされていることと，インストールされたDockerがVersion18.04.0-ceであることが確認できました．
同様にkubernetesも確認してみましょう．

```
$ kubectl version
Client Version: version.Info{Major:"1", Minor:"9", GitVersion:"v1.9.6", GitCommit:"9f8ebd171479bec0ada837d7ee641dec2f8c6dd1", GitTreeState:"clean", BuildDate:"2018-03-21T15:21:50Z", GoVersion:"go1.9.3", Compiler:"gc", Platform:"darwin/amd64"}
Server Version: version.Info{Major:"1", Minor:"9", GitVersion:"v1.9.6", GitCommit:"9f8ebd171479bec0ada837d7ee641dec2f8c6dd1", GitTreeState:"clean", BuildDate:"2018-03-21T15:13:31Z", GoVersion:"go1.9.3", Compiler:"gc", Platform:"linux/amd64"}
$
```

kubectlコマンドがインストールされていることと，インストールされたKubernetesがVersion.1.9.6であることが確認できました．

# Dockerを利用してサービスを立ち上げる．

## ```hello-world```コンテナを起動する

Dockerの動作を確認するために，```hello-world```と呼ばれるコンテナを起動してみましょう．
コンテナとは，目的に応じてカスタマイズされた仮想計算機イメージのようなものです．
使用するコマンドは```docker```です．


|単語|意味|
|-|-|
|docker|dockerコマンド|
|run|コンテナを実行|
|hello-world|コンテナ名|

初回は起動に時間がかかりますが，これはhello-worldのディスクイメージをダウンロードするためです．
2回目以降の起動は高速です．
以下のように表示されればきちんと動作しています．

```
$ docker run hello-world
Unable to find image 'hello-world:latest' locally
latest: Pulling from library/hello-world
9bb5a5d4561a: Pull complete
Digest: sha256:f5233545e43561214ca4891fd1157e1c3c563316ed8e237750d59bde73361e77
Status: Downloaded newer image for hello-world:latest

Hello from Docker!
This message shows that your installation appears to be working correctly.

To generate this message, Docker took the following steps:
 1. The Docker client contacted the Docker daemon.
 2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
    (amd64)
 3. The Docker daemon created a new container from that image which runs the
    executable that produces the output you are currently reading.
 4. The Docker daemon streamed that output to the Docker client, which sent it
    to your terminal.

To try something more ambitious, you can run an Ubuntu container with:
 $ docker run -it ubuntu bash

Share images, automate workflows, and more with a free Docker ID:
 https://hub.docker.com/

For more examples and ideas, visit:
 https://docs.docker.com/engine/userguide/

$
```

## インタラクティブなコンテナを起動する

ここでは，軽量なLinuxの一つであるalpineを起動し，仮想計算機のように使ってみましょう．
そのために，/bin/shを使用します．

|単語|意味|
|-|-|
|docker|dockerコマンド|
|run|コンテナを実行|
|-it|インタラクティブモードで実行|
|alpine|コンテナ名|
|bin/sh|実行するコマンド|


```
$ docker run -it alpine /bin/sh
Unable to find image 'alpine:latest' locally
latest: Pulling from library/alpine
ff3a5c916c92: Pull complete
Digest: sha256:7df6db5aa61ae9480f52f0b3a06a140ab98d427f86d8d5de0bedab9b8df6b1c0
Status: Downloaded newer image for alpine:latest
/ #
```

プロンプトが```/ #```となっているのは，alpineの設定です．
この状態で```ls```や```ps```などを実行すると，元々のdebianとはファイル配置が異なることを実感できます．
終了は```exit```です．

```
/ # ls
bin    etc    lib    mnt    root   sbin   sys    usr
dev    home   media  proc   run    srv    tmp    var
/ # ps
PID   USER     TIME   COMMAND
    1 root       0:00 /bin/sh
    6 root       0:00 ps
/ # ifconfig -a
eth0      Link encap:Ethernet  HWaddr 02:42:AC:11:00:03
          inet addr:172.17.0.3  Bcast:0.0.0.0  Mask:255.255.0.0
          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
          RX packets:8 errors:0 dropped:0 overruns:0 frame:0
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:0
          RX bytes:648 (648.0 B)  TX bytes:0 (0.0 B)

lo        Link encap:Local Loopback
          inet addr:127.0.0.1  Mask:255.0.0.0
          UP LOOPBACK RUNNING  MTU:65536  Metric:1
          RX packets:0 errors:0 dropped:0 overruns:0 frame:0
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:1
          RX bytes:0 (0.0 B)  TX bytes:0 (0.0 B)

/ # exit
$
```

このように，異なるOS環境下でコマンドを実行することができます．
上記の例ではインタラクティブに/bin/shを起動しましたが，通常は非インタラクティブにサーバプログラムを動かします．

## Webサーバnginxを動かしてみる

Dockerでは，様々なサービスのコンテナが[Docker Hub](https://hub.docker.com/)に用意されています．
上記サイトを開いて，検索窓に```nginx```と入力すると，標準的な```nginx```に加え，Proxy用の```jwilder/nginx-proxy```なども用意されている．
書式は```作者```/```コンテナ名```となっていて，例外として作者が無いものはDocker社が用意したコンテナです．

それでは実際にnginxを起動してみよう．

|単語|意味|
|-|-|
|docker|dockerコマンド|
|run|コンテナを実行|
|--rm|使い終わったコンテナを自動的に削除する|
|--name nginx|起動しているコンテナ名をnginxとする|
|-p 10080:80|debianの10080番ポートをコンテナの80番ポートにフォワードする|
|-d|デーモン（裏で動くプロセス）として起動|
|nginx|コンテナ名|

```
$ docker run --rm --name nginx -p 10080:80 -d nginx
Unable to find image 'nginx:latest' locally
latest: Pulling from library/nginx
2a72cbf407d6: Pull complete
04b2d3302d48: Pull complete
e7f619103861: Pull complete
Digest: sha256:18156dcd747677b03968621b2729d46021ce83a5bc15118e5bcced925fb4ebb9
Status: Downloaded newer image for nginx:latest
393917b4e58fdc51693f7dad3183e20b15edbb6112ffb6f89c86e6ada6fe5134
$
```

ブラウザから```http://localhost:10080```にアクセスすると，```Welcome to nginx!```の画面が表示されるはずである．
これは，nginxの標準的な初期画面で，とりあえずこの画面が見られれば起動は成功しているという目安です．

### 起動中のコンテナを確認する．


```
$ docker ps
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                   NAMES
59f68787f964        nginx               "nginx -g 'daemon ..."   6 seconds ago       Up 6 seconds        0.0.0.0:10080->80/tcp   nginx
$
```

ここで，NAMESの項目にnginxという文字列が入っているのは，起動時に```--name nginx```として指定したことによる．
もしこのオプションがなかった場合，NAMESにはCONTAINER IDと同じ文字列が入るので，以下のコマンドを使用する際に長い文字列を入力する必要がある．

（ただし，先頭数文字を打ち込めば良いので，見づらいだけで大きな問題にはならない）

### コンテナを止める．

```
$ docker stop nginx
nginx
$
```

### コンテナを削除する

コンテナ起動時に```--rm```オプションを付けていれば残骸は残らないが，このオプションを付けなかった場合このオプションを付けなかった場合はコンテナを止めただけでは残骸が残っているので，残骸を削除する．
残っている理由は，残骸を再度コンテナ化して利用するためである．
通常は```--rm```オプションを付けることを推奨する．

```
$ docker rm nginx
nginx
$
```

### Webページのデータを差し替える

ここでは，macOSの```/Users/suda/html```というディレクトリを作り，その中にWebページのデータ（index.htmlなど）が有るものとする．
さて，肝心のnginxコンテナ内のWebページのデータは```/usr/share/nginx/html```に置かれることになっている．
そこで，```/Users/suda/html```を```/usr/share/nginx/html```にマウントさせて実行する．

※ユーザ名が```suda```である前提で書いています．自分のユーザ名に置き換えてください．

増えたオプションは以下の通り

|単語|意味|
|-|-|
|-v /home/suda/html:/usr/hsare/nginx/html|コロンよりも前のディレクトリをコンテナ内のコロン以後のディレクトリにディレクトリにマウント|

この状態でWebブラウザから```http://localhost:10080```にアクセスすると，Webページの内容が変わっているはずである．

```
$ mkdir html
$ cd html
$ cat > index.html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <title>Example of nginx powered by Docker</title>
</head>
<body>
  <p>Hello World</p>
</body>
</html>
^d // ←ctrl + dを押す
$ docker run --name nginx -p 10080:80 -d --rm -v /Users/suda/html:/usr/share/nginx/html nginx
75084fd62965e183aa915f719d017fbde45ff7e17783244eac8878bba46309e5
$
```

### コンテナにログインしたい

通常のUNIX/Linuxであれば，nginxを動かしているOSにログインしてメンテナンスすることが不通である．
それに対してDockerを使用した場合は，1コンテナ＝1プロセスを前提に話が進んでいく．
これは，コンテナの独立性を高め，再利用可能にしているためである．
それでは，コンテナ内の設定ファイルを読みたい場合にどうすれば良いか？という疑問が湧く．
そのような場合は，nginxを起動せずに，インタラクティブモードで/bin/bashを起動すれば良い．

具体的には，コンテナを停止・残骸を削除した状態で，以下のように起動すれば良い．

```
// コンテナを止めて・残骸を削除してから以下を実行
$ docker run --name nginx -p 10080:80 --rm -it -v /home/suda/html:/var/www/html nginx /bin/bash
root@ddfec24dff54:/# ls
bin  boot  dev	etc  home  lib	lib64  media  mnt  opt	proc  root  run  sbin  srv  sys  tmp  usr  var
root@ddfec24dff54:/#
```

後は，いつものように設定ファイルを確認したり，Webページのデータがきちんとマウントされているか確認すれば良い確認すれば良い．
例によって，終了はexitである．

# Gitサーバを立ち上げてみる

Webサーバだけでは，サービスを起動した感じがしないので，別のサービスを起動する．
ここでは，Gitサーバ```gogs```を起動してみる．
[gogs/gogs](https://hub.docker.com/r/gogs/gogs/)

3000番ポートを使うので（nginxとはかち合わないので），nginxを動かしたまま以下のようにして起動しよう．


```
$ mkdir -p gogs
$ sudo docker run --name gogs -d --rm -p 3000:3000 -v /home/suda/gogs:/data gogs/gogs
Unable to find image 'gogs/gogs:latest' locally
latest: Pulling from gogs/gogs
b1f00a6a160c: Pull complete
219d6f70b7c7: Pull complete
d7347dd7b842: Pull complete
91781f374319: Pull complete
2af6e1a042d8: Pull complete
c8aa11c846cd: Pull complete
63ac2f7bab89: Pull complete
75e74f5ba116: Pull complete
8c5f51d39741: Pull complete
5e9f52d4c77e: Pull complete
4f319b1c39f5: Pull complete
Digest: sha256:f770a8d3f5f38bd7905ec030f3e66da800c21ce6f9c91c5c48199e6ac31f3010
Status: Downloaded newer image for gogs/gogs:latest
usermod: no changes
Dec 12 10:44:40 syslogd started: BusyBox v1.25.1
2017/12/12 10:44:52 [ WARN] Custom config '/data/gogs/conf/app.ini' not found, ignore this if you're running first time
2017/12/12 10:44:52 [TRACE] Custom path: /data/gogs
2017/12/12 10:44:52 [TRACE] Log path: /app/gogs/log
2017/12/12 10:44:52 [TRACE] Build Time: 2017-11-22 08:19:49 UTC
2017/12/12 10:44:52 [TRACE] Build Git Hash:
2017/12/12 10:44:52 [TRACE] Log Mode: Console (Trace)
2017/12/12 10:44:52 [ INFO] Gogs 0.11.34.1122
2017/12/12 10:44:52 [ INFO] Cache Service Enabled
2017/12/12 10:44:52 [ INFO] Session Service Enabled
2017/12/12 10:44:52 [ INFO] SQLite3 Supported
2017/12/12 10:44:52 [ INFO] Run Mode: Development
2017/12/12 10:44:52 [ INFO] Listen: http://0.0.0.0:3000
03cae309093279170ddcd095889ea06b75a4aa6eb4358330608083826e712b3f
```

この状態で```http://localhost:3000/```にアクセスすると，gogsの初期設定画面が現れる．
一番上の```データベースの種類```を```SQLite3```に変更し，```SSHポート```を空白に変更して，最下部の```Gogsをインストール```をクリックしよう．
すると，ログイン画面が出てくるので，サインインボタンの下にある```アカウントが必要ですか？今すぐ登録しましょう！```をクリックしてユーザ登録を行なう．


必要事項を入力して```新規アカウントを作成```をクリックすると，再度ログイン画面になる．
先程入力した情報でログインする．

## データの扱いを楽にする

このままでは，Gogsのデータがローカルのファイル上に置かれるのでポータビリティ（データを保持したまま環境を移行するなど）がよろしくありません．
そこで，```volume```を使用して，ポータビリティ性を向上させましょう．
ただし，今回はお試しとして，ローカルファイルシステム上にvolumeを作成します．
本来の使い方ではデータ置き場をNFS上にするとか，クラウドの機能を利用するなどを行い，ホストを跨いで利用できるようにします．

まずはvolumeを作成します．
volumeとは，コンテナに依存しない，独立したディスクというイメージです．
ここでは```data```という名前のvolumeを作っています．


```
$ docker volume create --name data
data
$
```

上記で作成したvolumeを使用して，gogsを起動します．
オプションの```-v data:/data```がvolume名dataを/dataにマウントして使用することを表します．

```
$ docker run --name gogs --rm -p 3000:3000 -d -v data:/data gogs/gogs
3889c7df63b33e2eb669d6e298f134b4c75376d1a0b37ccde68f5bd1696db72e
$
```

## Dockerfileを覗いてみる

Dockerを使用してサービスを立ち上げるための設定ファイルは```Dockerfile``` である．
例えばgogsのDockerfileは以下のURLで確認できる．

[gogs/gogs](https://hub.docker.com/r/gogs/gogs/~/dockerfile/)

Dockerfileに使われている単語の意味を以下に示す．
詳しくは下記URLを参照すること．

[Dockerfileリファレンス](http://docs.docker.jp/engine/reference/builder.html)

単語 | 意味
-|-
FROM | 基となるイメージ名
ADD | ネット経由でダウンロードしたファイル　または　ローカルのファイルをイメージ内の指定されたディレクトリに加える
RUN | 基となるイメージに対してコマンドを実行する
ENV | 環境変数の定義
COPY | ローカルのファイルをイメージ内にコピーする
WORKDIR | イメージ内のディレクトリを指定し，そこでコマンドを実行する
VOLUME | マウントポイント
EXPOSE | 外からアクセスできるポート番号
ENTRYPOINT | コンテナ起動時に実行するコマンド
CMD | コンテナ起動時に実行するコマンド

ENTRYPOINTとCMDの両方が書かれている場合，ENTRYPOINTが実行コマンドになり，CMDがそのオプションとなる．
CMDは```docker run```時にコマンドを書くと上書きされる．

gogsコンテナは```alpine:3.5```というイメージを基に，```ADD```や```COPY```で指定されたファイルを加え，```RUN```で指定されたコマンドを実行した結果できあがる．
その後，```VOLUME```，```EXPOSE```に書かれている設定を考慮しながら```ENTRYPOINT```，```CMD```に書かれているコマンドを実行する．
つまり，Dockerfileはイメージを作成するための手順書であり，実行方法のメモである，と思えば理解も楽である．

基となるイメージは，たいていalpineやDebianが使われている．
Debianの場合は，バージョンを表すコード名が用いられるので，最新版なら```stretch```と書かれている．

## オーケストレーションツール

単独のサービスとして，nginxやGogsを立ち上げてみた．
本来，これらのサービスは連携させて運用したり，大規模なサービスの場合は複数のWebサーバを起動させる．
大規模になると，万一エラーなどでサービスが停止してしまった場合に再起動が必要になったり，ソフトウェアの更新のために1つ1つコンテナを停止してアップデートするなどの煩わしい作業が出てくる．
これらを手作業で行っていたら，とても間に合わないしミスが発生してしまうので自動化が必要になる．

このような場合はDockerfileだけでは記述できないので，複数のサービスを連携させて立ち上げる仕組みが必要となる．
実際に，```オーケストレーションツール```という名前で，幾つかの実装が存在する．
Docker標準では```Docker Compose```と```Swarm```いう仕組みが用意されており，他にも```Kubernetes```や```Cattle```などが存在している．

使うべきオーケストレーションツールは，今のところKubernetesが最有力である．．
これは，クラウド環境下でコンテナを運用するための様々な仕組みが用意されており，それらと連携を図る際に都合が良いからである．
それではKubernetesを使って，サービスを立ち上げてみよう．

### KubernetesでGogsを立ち上げる

それでは早速Kubernetesを使ってみましょう．
その前に，これまでDockerを使って起動していたサービスを全て停止させておいてください．

Kubernetesを使う場合，コマンドを順次入力してインストールを行うのではなく，設定ファイルを用意することになります．
設定ファイルのフォーマットは通常はYAMLが用いられ，その項目はいくつかの分野に分割されている．
とりあえず必要な分野を以下に示します．
これらを1つのファイルにまとめて定義することも可能ですし，複数のファイルに分割する弧も可能です．

分野名 | 内容
-|-
deployment | 複数のコンテナを起動したり世代管理する
service | 複数のコンテナへのアクセスを仲介する
ingress | 外部のロードバランサに公開するURLなどを指定する

それでは，Gogsを起動するための最低限の設定ファイルを示します．
ここでは，分かりやすくするために分野ごとに3つの設定ファイルを用意するものとします．

まずはdeployment.yamlです．
最後の行は，設定ファイルを置くディレクトリの指定で，通常はこのような直接的な書き方はせずに，クラウド業者の用意したサービスを使用します．


```
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: gogs
spec:
  replicas: 1
  template:
    metadata:
      labels:
        name: gogs
    spec:
      containers:
      - resources:
        name: gogs
        image: gogs/gogs
        ports:
        - name: gogs-port
          containerPort: 3000
        volumeMounts:
        - mountPath: /data
          name: data
      volumes:
      - name: data
        hostPath:
          path: /Users/suda/gogs/data
```

次に，service.yamlです．

```
apiVersion: v1
kind: Service
metadata:
  name: gogs
  labels:
    name: gogs
spec:
  ports:
  - port: 3000
    targetPort: 3000
  selector:
    name: gogs
  type: LoadBalancer
```

最後にingress.yamlです．


```
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: gogs
spec:
  rules:
  - host: localhost
    http:
      paths:
      - path: /
        backend:
          serviceName: gogs
          servicePort: 3000
```

それでは起動してみましょう．
上記3つのファイルをコピー＆ペーストして同じディレクトリに置いてください．
準備が整ったら以下のように実行します．

```
$ kubectl apply -f ./
deployment "gogs" created
ingress "gogs" created
service "gogs" created
$
```

この状態で，```http://localhost:3000/```にアクセスするとGogsを利用できます．
停止するには以下のように実行します．

```
$ kubectl delete -f ./
deployment "gogs" deleted
ingress "gogs" deleted
service "gogs" deleted
$
```

## Ingressを使ってサービスを公開する

ここまでできたら，他のホストからもアクセスしてみたくなりますよね？
その場合，複数のサービスを80番ポートで公開したいとなると，頭の痛い作業が必要となっていました．
Kuberneteは，そのような問題にも対処可能で，その仕組はIngressと名付けられています．
また，ingress.yaml内のingress.yamlのspec.rules.hostの項目は，通常はきちんとしたホスト名を書くことができます．

そのために，Ingress Controllerを立ち上げてみましょう．

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

ここで1つ問題があります．きちんとしたホスト名を付けるためには，DNSサーバが必要になります．
この問題に対して，簡易的に使いたいのであればnip.ioというサービスが有るのでこれを利用します．
nip.ioとは，```IPアドレス.nip.io```というホスト名をIPアドレスに紐付けてくれるサービスです．
IPアドレスが172.16.121.101の場合，172.16.121.101.nip.ioというホスト名が利用できます．
また，そのホスト名の前に好きな名前をつけることも可能です．
例えば，gogs.172.16.121.101.nip.ioのような名前でもアクセスできます．
よって，複数のサービスをホスト名で使い分けることができます．

それでは，80番ポートで公開すべく設定ファイルを書き換えてみましょう．

deployment.yamlはそのままで良いです．
service.yamlを以下のように書き換えてください．
具体的には9行目を3000から80にします．


```
apiVersion: v1
kind: Service
metadata:
  name: gogs
  labels:
    name: gogs
spec:
  ports:
  - port: 80
    targetPort: 3000
  selector:
    name: gogs
  type: LoadBalancer
```

続いてingress.yamlを以下のように書き換えます．
以下は例なので7行目のhostの項目は各自のIPアドレスを含むホスト名に変えてください．
ついでに最終行のservicePortを80にします．

```
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: gogs
spec:
  rules:
  - host: gogs.172.16.121.101.nip.io
    http:
      paths:
      - path: /
        backend:
          serviceName: gogs
          servicePort: 80
```

上記のように変更したら，設定ファイルを反映させます．
Kubernetesを使っている場合，一度止めて立ち上げるといったことは必要ありません．
以下のように実行します．


```
$ kubectl apply -f ./
deployment "gogs" unchanged
ingress "gogs" configured
service "gogs" configured
$
```

applyは，サービスの起動のためのサブコマンドですが，変更された設定ファイルの反映という意味も持っています．
このように，自前で複数のサービスを提供する場合，Ingressの仕組みを使ってホスト名でサービスを分けると便利です．

## 研究室内での利用方法

研究テーマを探している際に，ふとサービスを立ち上げてみたくなることがあります．
そのようなときに，Dockerイメージが公開されているか確認しましょう．
もし公開されていれば，たいてい起動方法も一緒に公開されているので，使ってみましょう．

その後，サービスを活用したくなったらKubernetesを利用してサービスを研究室内で公開しましょう．
さらに進んで，外部に公開したくなったら，GoogleやAmazon，MicrosoftのKubernetes as a Serviceを使って公開すると便利です．
