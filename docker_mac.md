Docker for Mac
===============

環境依存になりますが，Docker for Macについても記載します．

使用環境
- macOS sierra

## Docker for Macとは

macOS用のDockerです．
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

# Dockerを利用してサービスを立ち上げる．

## まずはインタラクティブなコンテナを起動する

Debian上に，別のディストリビューションのコンテナを起動します．
ここでは，軽量なLinuxの一つであるalpineを起動し，シェルとして/bin/shを使用する．

|単語|意味|
|-|-|
|docker|dockerコマンド|
|run|コンテナを実行|
|-it|インタラクティブモードで実行|
|alpine|コンテナ名|
|bin/sh|実行するコマンド|


```
suda@debian:~$ docker run -it alpine bin/sh
Unable to find image 'alpine:latest' locally
latest: Pulling from library/alpine
2fdfe1cd78c2: Pull complete
Digest: sha256:ccba511b1d6b5f1d83825a94f9d5b05528db456d9cf14a1ea1db892c939cda64
Status: Downloaded newer image for alpine:latest
/ #
```

プロンプトが```/ #```となっているのは，alpineの設定です．
この状態で```ls```や```ps```などを実行すると，元々のdebianとはファイル配置が異なることを実感できます．
終了は```exit```です．

```
/ # ls
bin    dev    etc    home   lib    media  mnt    proc   root   run    sbin   srv    sys    tmp    usr    var
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
suda@debian:~$
```

このように，異なるOS環境下でコマンドを実行することができます．
上記の例ではインタラクティブに/bin/shを起動しましたが，通常は非インタラクティブにサーバプログラムを動かします．

## nginxを動かしてみる

Dockerでは，様々なサービスのコンテナが[Docker Hub](https://hub.docker.com/)に用意されている．
上記サイトを開いて，検索窓に```nginx```と入力すると，標準的な```nginx```に加え，Proxy用の```jwilder/nginx-proxy```なども用意されている．
書式は```作者```/```コンテナ名```となっている．作者が無いものはDocker社が用意したコンテナである．

それでは実際にnginxを起動してみよう．
ここでは，VirtualBoxの設定で，ホストOS側の10080番ポートをゲストOSの10080番ポートにフォワードするよう設定してあるものとする．

|単語|意味|
|-|-|
|docker|dockerコマンド|
|run|コンテナを実行|
|--name nginx|起動しているコンテナ名をnginxとする|
|-p 10080:80|debianの10080番ポートをコンテナの80番ポートにフォワードする|
|-d|デーモン（裏で動くプロセス）として起動|
|nginx|コンテナ名|

```
suda@debian:~$ sudo docker run --name nginx -p 10080:80 -d nginx
[sudo] suda のパスワード:
Unable to find image 'nginx:latest' locally
latest: Pulling from library/nginx
e7bb522d92ff: Pull complete
0f4d7753723e: Pull complete
91470a14d63f: Pull complete
Digest: sha256:25623adabe83582ed4261d975786627033a0a3a4f3656d784f6b9b03b0bc5010
Status: Downloaded newer image for nginx:latest
33328468f5b95512323a0c81f53e27b6a2b4b3a292a5ad7fb0b5f928b4624e2c
suda@debian:~$ sudo docker ps
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                NAMES
33328468f5b9        nginx               "nginx -g 'daemon ..."   28 seconds ago      Up 27 seconds       0.0.0.0:80->80/tcp   nginx
suda@debian:~$
```

ブラウザから```http://localhost:10080```にアクセスすると，```Welcome to nginx!```の画面が表示されるはずである．

### 起動中のコンテナを確認する．


```
suda@debian:~$ sudo docker ps
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                   NAMES
59f68787f964        nginx               "nginx -g 'daemon ..."   6 seconds ago       Up 6 seconds        0.0.0.0:10080->80/tcp   nginx
suda@debian:~$
```

ここで，NAMESの項目にnginxという文字列が入っているのは，起動時に```--name nginx```として指定したことによる．
もしこのオプションがなかった場合，NAMESにはCONTAINER IDと同じ文字列が入るので，以下のコマンドを使用する際に長い文字列を入力する必要がある．

（ただし，先頭数文字を打ち込めば良いので，見づらいだけで大きな問題にはならない）

### コンテナを止める．

```
suda@debian:~$ sudo docker stop nginx
nginx
suda@debian:~$
```

### コンテナを削除する

コンテナを止めただけでは残骸が残っているので，残骸を削除する．
残っている理由は，残骸を再度コンテナ化して利用するためである．
起動時に```--rm```オプションを付けておけば，この作業は不要である．

```
suda@debian:~$ sudo docker rm nginx
nginx
suda@debian:~$
```

### Webページのデータを差し替える

ここでは，debianの```/home/suda/html```というディレクトリを作り，その中にWebページのデータ（index.htmlなど）が有るものとする．
さて，肝心のnginxコンテナ内のWebページのデータの在り処であるが，Debian9にnginxパッケージをインストールした場合は```/var/www/html```であった．
これに対してnginxコンテナでは，```/usr/share/nginx/html```に置かれている．
これを踏まえた上で，```/home/suda/html```をマウントさせて実行する．

増えたオプションは以下の通り

|単語|意味|
|-|-|
|--rm|停止時に残骸を自動的に削除|
|-v /home/suda/html:/usr/hsare/nginx/html|コロンよりも前のディレクトリをコンテナ内のコロン以後のディレクトリにディレクトリにマウント|

この状態でWebブラウザから```http://localhost:10080```にアクセスすると，Webページの内容が変わっているはずである．

```
suda@debian:~$ sudo docker run --name nginx -p 10080:80 -d --rm -v /home/suda/html:/usr/share/nginx/html nginx
75084fd62965e183aa915f719d017fbde45ff7e17783244eac8878bba46309e5
suda@debian:~$
```

### コンテナにログインしたい

通常のUNIX/Linuxであれば，nginxを動かしているOSにログインしてメンテナンスすることが不通である．
それに対してDockerを使用した場合は，1コンテナ＝1プロセスを前提に話が進んでいく．
これは，コンテナの独立性を高め，再利用可能にしているためである．
それでは，コンテナ内の設定ファイルを読みたい場合にどうすれば良いか？という疑問が湧く．
そのような場合は，nginxを起動せずに，インタラクティブモードで/bin/bashを起動すれば良い．

具体的には，コンテナを停止・残骸を削除した状態で，以下のように起動すれば良い．

```
suda@debian:~$ sudo docker run --name nginx -p 10080:80 --rm -it -v /home/suda/html:/var/www/html nginx /bin/bash
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
suda@debian:~$ mkdir -p gogs
suda@debian:~$ sudo docker run --name gogs -d --rm -p 3000:3000 -v /home/suda/gogs:/data gogs/gogs
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
suda@debian:~$ sudo docker volume create --name data
data
suda@debian:~$
```

上記で作成したvolumeを使用して，gogsを起動します．
オプションの```-v data:/data```がvolume名dataを/dataにマウントして使用することを表します．

```
suda@debian:~$ sudo docker run --name gogs --rm -p 3000:3000 -d -v data:/data gogs/gogs
3889c7df63b33e2eb669d6e298f134b4c75376d1a0b37ccde68f5bd1696db72e
suda@debian:~$
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

## 複数のサービスの連携

単独のサービスとして，nginxやGogsを立ち上げてみた．
本来，これらのサービスは連携させて運用することが普通である．
Gogsだけ見ても，本来はGogsとDBMSを連携させるべきである．

このような場合はDockerfileだけでは記述できないので，複数のサービスを連携させて立ち上げる仕組みが必要となる．
実際に，```オーケストレーションツール```という名前で，幾つかの実装が存在する．
Docker標準では```Docker Compose```と```Swarm```いう仕組みが用意されており，他にも```Kubernetes```や```Cattle```などが存在している．

使うべきオーケストレーションツールは，今のところKubernetesが最適と言われている．
これは，クラウド環境下でコンテナを運用するための様々な仕組みが用意されており，それらと連携を図る際に都合が良いからである．
とは言え，Kubernetesの環境構築は色々と厄介なので，ここではDocker Composeを取り上げる．
GoogleやAmazonのクラウド環境を使える立場であれば，迷わずKubernetesを使用するべきであるが動作を理解するためにはDocker Composeの方が適しているためである。

### Docker Composeのインストール

まずはDocker Composeをインストールします．
apt-getコマンドでもインストールできるようですが，多数のパッケージに依存していてディスク容量を使ってしますので，公式で配布されているバイナリをダウンロードします．
執筆時の最新バージョンは1.18.0のようです．


```
suda@debian:~$ sudo curl -L https://github.com/docker/compose/releases/download/1.18.0/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   617    0   617    0     0    714      0 --:--:-- --:--:-- --:--:--   714
100 8280k  100 8280k    0     0  1664k      0  0:00:04  0:00:04 --:--:-- 2143k
suda@debian:~$ sudo chmod +x /usr/local/bin/docker-compose
suda@debian:~$ sudo docker-compose --version
docker-compose version 1.18.0, build 8dd22a9
suda@debian:~$
```

### Docker ComposeによるGogsのインストール

それでは早速Docker Composeを使ってみましょう．
その前に，これまでDockerを使って起動していたサービスを全て停止させておいてください．
また，ポートフォワードが3000→3000になっているものとして話を進めます．

ここでは，先程インストールしたGogsを，Docker Composeを利用してインストールしてみます．
と言っても先ほどと同じではつまらないので，今回はDBMSと連携させてみましょう．
以下のURLの設定ファイルを使用します．

[ahromis/docker-compose.yml](https://gist.github.com/ahromis/4ce4a58623847ca82cb1b745c2f83c82)

Docker Composeの基本事項ですが，設定ファイルは```docker-compose.yml```という名前です．
拡張子に表れているように，YAMLフォーマットです．

以下のようにダウンロードします．

```
suda@debian:~$ curl -L https://gist.githubusercontent.com/ahromis/4ce4a58623847ca82cb1b745c2f83c82/raw/31e8ced3d7e08c602a1c0ca8994c063994971c7f/docker-compose.yml -o docker-compose.yml
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   732  100   732    0     0   2039      0 --:--:-- --:--:-- --:--:--  2044
suda@debian:~$ ls
docker-compose.yml
suda@debian:~$
```

以下に内容を示します．
大雑把に解説しておくと，```services```で起動するプログラムに関することを，```networkds```でネットワークに関することを，```volumes```でデータコンテナに関することを設定しています．
この中で```services```では，```postgres```と```gogs```というプログラムを起動することが書かれています．
また```networks```では，```gogs```という名前のネットワークを作っています．
さらに```volume```では，```db-data```と```gogs-data```を作っています．
また，```${```と```}```で囲まれた部分は，docker-compose実行時に環境変数で値を渡す部分です．

```
version: '2'
services:
    postgres:
      image: postgres:9.5
      restart: always
      environment:
       - "POSTGRES_USER=${POSTGRES_USER}"
       - "POSTGRES_PASSWORD=${POSTGRES_PASSWORD}"
       - "POSTGRES_DB=gogs"
      volumes:
       - "db-data:/var/lib/postgresql/data"
      networks:
       - gogs
    gogs:
      image: gogs/gogs:latest
      restart: always
      ports:
       - "10022:22"
       - "3000:3000"
      links:
       - postgres
      environment:
       - "RUN_CROND=true"
      networks:
       - gogs
      volumes:
       - "gogs-data:/data"
      depends_on:
       - postgres

networks:
    gogs:
      driver: bridge

volumes:
    db-data:
      driver: local
    gogs-data:
      driver: local
```

それでは起動してみましょう．
先に述べたように，起動時に環境変数を通じて値をセットしつつ，docker-composeを実行します．
ここでは，PostgreSQLのユーザ名として```postgres```を，そのユーザのパスワードとして```sudasuda```を指定しています．
試したところ，ユーザ名はpostgresでないときちんと使えませんでした．
パスワードは各自設定してください．

```
suda@debian:~$ sudo POSTGRES_USER=postgres POSTGRES_PASSWORD=sudasuda docker-compose up
Creating network "temp_gogs" with driver "bridge"
Creating volume "temp_db-data" with local driver
Creating temp_postgres_1 ... done
Creating temp_postgres_1 ...
Creating temp_gogs_1     ... done
Attaching to temp_postgres_1, temp_gogs_1
postgres_1  | The files belonging to this database system will be owned by user "postgres".
postgres_1  | This user must also own the server process.
postgres_1  |
postgres_1  | The database cluster will be initialized with locale "en_US.utf8".
postgres_1  | The default database encoding has accordingly been set to "UTF8".
postgres_1  | The default text search configuration will be set to "english".
postgres_1  |
postgres_1  | Data page checksums are disabled.
postgres_1  |
postgres_1  | fixing permissions on existing directory /var/lib/postgresql/data ... ok
postgres_1  | creating subdirectories ... ok
postgres_1  | selecting default max_connections ... 100
postgres_1  | selecting default shared_buffers ... 128MB
postgres_1  | selecting dynamic shared memory implementation ... posix
postgres_1  | creating configuration files ... ok
gogs_1      | usermod: no changes
gogs_1      | init:crond  | Cron Daemon (crond) will be run as requested by s6
gogs_1      | Jan 10 12:04:05 syslogd started: BusyBox v1.25.1
gogs_1      | Jan 10 12:04:06 sshd[32]: Server listening on :: port 22.
gogs_1      | Jan 10 12:04:06 sshd[32]: Server listening on 0.0.0.0 port 22.
postgres_1  | creating template1 database in /var/lib/postgresql/data/base/1 ... ok
postgres_1  | initializing pg_authid ... ok
postgres_1  | initializing dependencies ... ok
postgres_1  | creating system views ... ok
postgres_1  | loading system objects' descriptions ... ok
postgres_1  | creating collations ... ok
postgres_1  | creating conversions ... ok
postgres_1  | creating dictionaries ... ok
postgres_1  | setting privileges on built-in objects ... ok
postgres_1  | creating information schema ... ok
postgres_1  | loading PL/pgSQL server-side language ... ok
postgres_1  | vacuuming database template1 ... ok
postgres_1  | copying template1 to template0 ... ok
postgres_1  | copying template1 to postgres ... ok
postgres_1  | syncing data to disk ... ok
postgres_1  |
postgres_1  | WARNING: enabling "trust" authentication for local connections
postgres_1  | You can change this by editing pg_hba.conf or using the option -A, or
postgres_1  | --auth-local and --auth-host, the next time you run initdb.
postgres_1  |
postgres_1  | Success. You can now start the database server using:
postgres_1  |
postgres_1  |     pg_ctl -D /var/lib/postgresql/data -l logfile start
postgres_1  |
postgres_1  | waiting for server to start....LOG:  could not bind IPv6 socket: Cannot assign requested address
postgres_1  | HINT:  Is another postmaster already running on port 5432? If not, wait a few seconds and retry.
postgres_1  | LOG:  database system was shut down at 2018-01-10 12:04:06 UTC
postgres_1  | LOG:  MultiXact member wraparound protections are now enabled
postgres_1  | LOG:  database system is ready to accept connections
postgres_1  | LOG:  autovacuum launcher started
postgres_1  |  done
postgres_1  | server started
postgres_1  | CREATE DATABASE
postgres_1  |
postgres_1  | ALTER ROLE
postgres_1  |
postgres_1  |
postgres_1  | /usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*
postgres_1  |
postgres_1  | LOG:  received fast shutdown request
postgres_1  | LOG:  aborting any active transactions
postgres_1  | LOG:  autovacuum launcher shutting down
postgres_1  | LOG:  shutting down
postgres_1  | waiting for server to shut down....LOG:  database system is shut down
postgres_1  |  done
postgres_1  | server stopped
postgres_1  |
postgres_1  | PostgreSQL init process complete; ready for start up.
postgres_1  |
postgres_1  | LOG:  database system was shut down at 2018-01-10 12:04:09 UTC
postgres_1  | LOG:  MultiXact member wraparound protections are now enabled
postgres_1  | LOG:  database system is ready to accept connections
postgres_1  | LOG:  autovacuum launcher started
gogs_1      | 2018/01/10 12:04:17 [ WARN] Custom config '/data/gogs/conf/app.ini' not found, ignore this if you're running first time
gogs_1      | 2018/01/10 12:04:17 [TRACE] Custom path: /data/gogs
gogs_1      | 2018/01/10 12:04:17 [TRACE] Log path: /app/gogs/log
gogs_1      | 2018/01/10 12:04:17 [TRACE] Build Time: 2017-11-22 08:19:49 UTC
gogs_1      | 2018/01/10 12:04:17 [TRACE] Build Git Hash:
gogs_1      | 2018/01/10 12:04:17 [TRACE] Log Mode: Console (Trace)
gogs_1      | 2018/01/10 12:04:17 [ INFO] Gogs 0.11.34.1122
gogs_1      | 2018/01/10 12:04:17 [ INFO] Cache Service Enabled
gogs_1      | 2018/01/10 12:04:17 [ INFO] Session Service Enabled
gogs_1      | 2018/01/10 12:04:17 [ INFO] SQLite3 Supported
gogs_1      | 2018/01/10 12:04:17 [ INFO] Run Mode: Development
gogs_1      | 2018/01/10 12:04:17 [ INFO] Listen: http://0.0.0.0:3000
```

起動したら，Webブラウザから接続してみてください．
接続先は[http://localhost:3000/](http://localhost:3000/)です．

すると，インストールするための設定画面が表れます．
先頭にある「データベース設定」には以下のように入力してください．

項目 | 内容 | コメント
--|--|--
データベースの種類 | PostgreSQL | DBと連携します
ホスト | postgres | ポート番号は不要です
ユーザ | postgres | rootでは連携できませんでした
パスワード | sudasuda | 各自環境変数に設定したものを入力してください
データベース名 | gogs | ここは変えないでください
SSLモード | Disable | ここも変えないでください

それ以降の項目は特に変更する必要はありません．
念のため，HTTPポートは3000番になっていることを確認しておいてください．

スペルミスなどがないか確認したら，一番下の「Gogsをインストール」をクリックしてください．
サインイン画面になるので，「アカウントが必要ですか？今すぐ登録しましょう！」をクリックします．

ユーザ名などを適当（適切という意味）に入力して「新規アカウントを作成」をクリックしてください．
ログイン画面が出てくるので，再度IDとパスワードを入力してください．

以上でPostgreSQLと連携したGogsを使えるようになります．

## docker-compose.ymlを詳しく見てみる

### バージョン
それでは設定ファイルを詳しく見ていきましょう．
まずは設定ファイルのフォーマットバージョンです．
現在の最新フォーマットはバージョン3ですが，ここではバージョン2を使っています．
参考までに，バージョンは2.1，2.2など小数点以下まで指定することができます．
バージョンごとの詳しい説明は[Compose file versions and upgrading](https://docs.docker.com/compose/compose-file/compose-versioning/#version-34)を読んで下さい．

```
version: '2'
```

### 第1層の設定項目
続く項目は，サービス設定，ボリューム設定，ネットワーク設定です．
以下のようになっています．

項目 | 意味 | 説明
-|-|-
services | サービス設定 | 実際に動かすコンテナに関する設定
networks | ネットワーク設定 | コンテナ間のネットワークを宣言する
volumes | ボリューム設定 | ボリュームコンテナを宣言する

### networks

まずはnetworksから見ていきましょう．
以下の例では，```gogs```という名前のネットワークを宣言しています．
ここでは1つだけ宣言していますが，複数個のネットワークを宣言してコンテナ毎にネットワークを分けることも可能です．
その次にある```dirver```の項目ですが，この設定ファイルでは```bridge```となっています．
これは，各コンテナが同一のホスト上で実行されていることを想定しています．
複数のホスト上にコンテナを分散したい場合は，```overlay```を指定するのですが，これには```Docker Swarm```という別の仕組みが必要となります．


```
networks:
    gogs:
      driver: bridge
```

### volumes

続いて```volumes```です．
以下の例では，```db-data```というボリュームと```gogs-data```というボリュームを宣言しています．
名前から想像できると思いますが，PostgreSQLのデータを保存しておくボリュームと，Gogsのデータを保存しておくボリュームです．
それぞれ```driver```の項目に```local```が設定されていますが，文字通りホスト上のローカルストレージを使用することを示しています．
この場合，複数のホスト上にコンテナを分散したい場合に支障が出るため，クラウド上で本格的に運用する場合はボリュームプラグインという仕組みを使用して，NFSやCIFS（Windowsのファイル共有の仕組み），各種クラウドの用意している分散ストレージなど使うことが一般的です．

```
volumes:
    db-data:
      driver: local
    gogs-data:
      driver: local
```

### services

最後に```services```です．
第2回想を見ると，```postgres```と```gogs```という2つのサービスを動かそうとしていることが分かります．
ですので，まずはそれぞれのサービスを分けて考えます．

項目 | 説明
-|-|-
image | 使用するDockerイメージを指定する
restart | 何か有った場合に再起動するか指定する（no / always / no-failure）
ports | 外部からアクセスできるポート番号と内部で使用するポート番号を指定する
links | 指定したコンテナと通信することを示す
environment | コンテナの環境変数を設定する
volumes | マウントするファイルシステムを指定する
networkds | 使用するネットワークを指定する
depends_on | 指定しているコンテナが起動するのを待ってから起動する



```
services:
    postgres:
      image: postgres:9.5
      restart: always
      environment:
       - "POSTGRES_USER=${POSTGRES_USER}"
       - "POSTGRES_PASSWORD=${POSTGRES_PASSWORD}"
       - "POSTGRES_DB=gogs"
      volumes:
       - "db-data:/var/lib/postgresql/data"
      networks:
       - gogs
    gogs:
      image: gogs/gogs:latest
      restart: always
      ports:
       - "10022:22"
       - "3000:3000"
      links:
       - postgres
      environment:
       - "RUN_CROND=true"
      networks:
       - gogs
      volumes:
       - "gogs-data:/data"
      depends_on:
       - postgres
```
