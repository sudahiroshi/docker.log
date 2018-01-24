node.jsアプリをDocker化する
===============

node.jsを利用して作成したサービスをDocker化する方法

使用環境
- VirtualBox

## Docker化

作成したnode.jsのアプリを，Docker化します．
ソースコードは，一旦gitサーバにアップロードするという前提で話をします．

## Docker化の流れ

概ね，以下の手順で行います．

1. node.jsアプリの作成とアップロード
2. Dockerfileの作成
3. Dockerイメージのビルド
4. Dockerコマンドを使って動作させる
5. 不具合があったらDockerfileを修正して3に戻る

### node.jsサービスの作成とアップロード

今回は，Dockerfileを作る練習なので，前回作成したチャットを利用します．
作成したプログラムをDockerで使う場合，(1)一つ一つファイルコピーする方法，(2)ファイルを置いたディレクトリをマウントする方法，(3)ネット上からダウンロードする方法が考えられます．
ここでは，後々の更新が楽なように(3)の方法を使います．
(3)の方法にも様々なやり方がありますが，せっかくなのでバージョン管理システムを活用します．

バージョン管理システムにも色々ありますが，ここでは近年のシェアの高さからgitを使用します．
gitサーバとして，GitHubが有名ですが，すでにアカウントを持っている人はそちらを利用しても構いません．
アカウントを持っていない人は，自前でgogsを起動して利用しましょう．

### gitの使い方

起動方法は以前紹介しましたが，DBMSと連携させても良いですし，連携させずに単独で立ち上げても良いです．
立ち上げたらWebブラウザからアクセスして，ログインしましょう．
ログインしたら，画面右上に「+▼」のメニューが有るのでクリックし，「+新しいリポジトリ」を選択します．
その後，「新しいリポジトリ」を作成するための入力欄が出てきます．
以下を参考にして「リポジトリを作成」をクリックしてください．

項目 | 説明
-|-
オーナー | あなたの作成したユーザ名
リポジトリ名 | とりあえずnode_chatとしておいてください
公開/非公開 | 公開にしてください（チェックを付けない）
説明 | 好きに入力してください
.gitignore | nodeと入力するとメニューが出てくるのでNodeを選択してください
ライセンス | 特に入力しなくて良いです
Readme | Default
最後の項目 | 「選択されたファイル及びテンプレートでリポジトリを初期化」にチェックを入れてください．
（この辺はgitコマンドに慣れている人はこの手順に沿わなくて構いません．
ここで紹介しているのは初心者でも戸惑わずに遂行できる手順です）

すると，```.gitignore```と```README.md```が存在するリポジトリが作られます．
一旦，Debian上でこのリポジトリをcloneしましょう．

```
suda@debian:~$ git clone http://localhost:3000/suda/node_chat.git
Cloning into 'node_chat'...
remote: Counting objects: 4, done.
remote: Compressing objects: 100% (3/3), done.
remote: Total 4 (delta 0), reused 0 (delta 0)
Unpacking objects: 100% (4/4), done.
suda@debian:~$
```

次に，このディレクトリに過去に作成したnode_testから必要なファイルをコピーします．
ディレクトリ構造が異なる人は，適宜変更してください．

```
suda@debian:~$ cp -R node_test/* node_chat
suda@debian:~$
```

続いて，コピーしたファイルをgitに認識させてサーバにアップロードします．
一連の履歴を掲載します．
見やすくするよう，コマンドを入力する場合は一行空けておきます．

```bash
suda@debian:~$ cd node_chat

suda@debian:~/node_chat$ ls
README.md  app.js  bin  node_modules  package-lock.json  package.json  public  routes  views

suda@debian:~/node_chat$ git add .

suda@debian:~/node_chat$ git commit -am 'ファイルを追加'
[master 084e3c8] ファイルを追加
 9 files changed, 872 insertions(+)
 create mode 100644 app.js
 create mode 100755 bin/www
 create mode 100644 package-lock.json
 create mode 100644 package.json
 create mode 100644 public/stylesheets/style.css
 create mode 100644 routes/index.js
 create mode 100644 routes/users.js
 create mode 100644 views/error.ejs
 create mode 100644 views/index.ejs
 
suda@debian:~/node_chat$ git push
Counting objects: 16, done.
Delta compression using up to 2 threads.
Compressing objects: 100% (13/13), done.
Writing objects: 100% (16/16), 8.28 KiB | 0 bytes/s, done.
Total 16 (delta 1), reused 0 (delta 0)
Username for 'http://localhost:3000': suda
Password for 'http://suda@localhost:3000':
To http://localhost:3000/suda/node_chat.git
   959a963..084e3c8  master -> master
suda@debian:~/node_chat$
```

無事に完了したら，Gogs上でリポジトリの内容を確認してみてください．
（要リロード）

gitコマンドの最低限の使い方を以下に示します．

サブコマンド | 説明 | 使用例 | 解説
-|-|-|-
add | ファイルを管理対象とする | git add . | ディレクトリに有るファイルを全て管理対象とする
commit | 履歴に登録 | git commit -am 'コメント' | 'コメント'は通常変更箇所を書く
push | サーバに登録 | git push | サーバにアップロードする
pull | サーバから最新のリポジトリをダウンロードする | git pull | 手元のファイルを更新する
clone | リポジトリを手元にコピーする | git clone http://（以下略) | URLで示されるリポジトリを手元にコピーする

今後，ファイルを変更した場合は```git commit```→```git push```の順にコマンドを入力します．
ファイルを追加した場合は```git add```→```git commit```→```git push```の順となります．

gitコマンドは，macOSであれば追加インストールせずに使用できます．
また，Unix系OSであれば，インストールは簡単に行なえます．
その他，GUIで操作するgitクライアントも存在するので，面倒ですがこちらを使用することも可能です．
（つまり，macOSやWindows上で使い慣れたエディタを利用して開発可能です）

## Gitサーバからcloneしてサービスを起動する

それでは，Gitサーバにアップロードしたサービスが，本当に使えるか試してみましょう．
Dockerで動かしているnode_testがあったら終了させておいてください．
また，Gogsは起動させておいてください．

Debianのホームディレクトリから作業を始めます．

```
suda@debian:~$ mkdir temp

suda@debian:~$ cd temp

suda@debian:~/temp$ git clone http://localhost:3000/suda/node_chat.git
Cloning into 'node_chat'...
remote: Counting objects: 20, done.
remote: Compressing objects: 100% (16/16), done.
remote: Total 20 (delta 2), reused 0 (delta 0)
Unpacking objects: 100% (20/20), done.

suda@debian:~/temp$ cd node_chat

suda@debian:~/temp/node_chat$ ls
README.md  app.js  bin  package-lock.json  package.json  public  routes  views

suda@debian:~/temp/node_chat$ npm install

> uws@0.14.5 install /home/suda/temp/node_chat/node_modules/uws
> node-gyp rebuild > build_log.txt 2>&1 || exit 0

added 91 packages in 1.452s

suda@debian:~/temp/node_chat$ PORT=4000 npm start

> test@0.0.0 start /home/suda/temp/node_chat
> node ./bin/www
```

途中で```npm install```しているのは，通常パッケージマネージャが存在する言語・環境の場合はパッケージ情報（package.json）だけをアップロードしておいて，サービスを立ち上げる際に公式サーバからダウンロードします．
よって，ここでもその流儀に従って公式サイトよりダウンロードしています．
ここで疑問が湧くかもしれませんが，作成したnode_testにはすでにパッケージがダウンロードされていました．
リポジトリ上ではそれらのパッケージはどこに消えたのでしょうか？

実は，```.gitignore```に管理対象外とするファイルやディレクトリを登録することができます．
今回はGogs上でリポジトリを作成する際に```.gitignore```に```node```を指定してあるのでそれらのファイル（```node_modules```ディレクトリ）が管理対象外となっています．

実行する際に```PORT=4000```としているのは，すでに3000番ポートを使っているので他のポートを割り当てるためです．
なお，VirtualBoxのポートフォワードの設定に4000→4000を追加しておいてください．
この状態でWebブラウザから```http://localhost:4000/chat.html```にアクセスすると，チャットが実行できるはずです．

## Dockerfileの作成

やっと準備が整ったので，次はDockerfileを作成してDocker化します．
以前説明しましたが，基本的にDockerfileでは，インストール手順を順番に記述します．
ここで，DockerHubに登録されているnodeのイメージを使えば，node.jsのインストールは不要です．
[node](https://hub.docker.com/_/node/)を確認すると，様々な環境が揃っています．
元々Debian9上で，node8.9.4を使って開発していたので，同じ環境（8.9.4-stretch）を使用しましょう．

念のためDockerfileを覗いてみます．
[nodejs/docker-node](https://github.com/nodejs/docker-node/blob/994f8286cb0efc92578902d5fd11182f63a59869/8/stretch/Dockerfile)
ざっと見てみると，nodeというユーザを作っているので，このユーザを使ってサービスを動かすことにします．

それでは，node8.9.4-stretchを使用するDockerfileを作ってみましょう．
ディレクトリはホームディレクトリの直下にworkを作成して，ここに作ることにします．

```
suda@debian:~$ mkdir work

suda@debian:~$ cd work
```

ファイルの内容は以下のとおりです．

```
FROM node:8.9.4-stretch
```

とりあえずこれだけでOKです．

### Dockerfileに追記する

続いて，Dockerfile上で目的とするリポジトリの内容をダウンロードして，さらに使用するパッケージをダウンロードしてみましょう．
使用するユーザ名はnodeなので，作業するホームディレクトリは```/home/node```です．
ここまでのDockerfileを示します．

```
FROM node:8.9.4-stretch

ENV HOME=/home/node
WORKDIR $HOME
RUN git clone http://localhost:3000/suda/node_chat
WORKDIR $HOME/node_chat
RUN npm install
```

まずはここまでのDockerfileの動作を確認します．
手元のDockerfileを使うためには，まずbuildします．

```
suda@debian:~/work$ sudo docker build -t node_chat:1.0 .
Sending build context to Docker daemon  13.53MB
Step 1/9 : FROM node:8.9.4-stretch
 ---> a264e6327bde
Step 2/9 : ENV HOME=/home/node
 ---> Using cache
 ---> 27f1735a713a
Step 3/9 : WORKDIR $HOME
 ---> Using cache
 ---> 56b3346a0d08
Step 4/9 : RUN git clone http://172.16.121.160:3000/suda/test
 ---> Using cache
 ---> d304e5853ad9
Step 5/9 : WORKDIR $HOME/test
 ---> Using cache
 ---> 10c7cae75760
Step 6/9 : RUN npm install
 ---> Using cache
 ---> a8d24c4378ff
Successfully built da8b6eb13426
Successfully tagged node_chat:1.0
suda@debian:~/work$
```

無事にbuildできたら，```/bin/bash```を対話的に動かしてみましょう．
具体的には```pwd```や```ls```などでファイルが有ることを確認します．

```
suda@debian:~/work$ sudo docker run -it --rm -p 4000:4000 node_chat:1.0 /bin/bash

root@105d383d5491:~/test# pwd
/home/node/test

root@105d383d5491:~/test# ls
README.md  app.js  bin  node_modules  package-lock.json  package.json  public  routes  views

root@105d383d5491:~/test# exit
exit
suda@debian:~/work$
```

ここまでできていれば，後は実行の部分をDockerfileに追記します．
最終的なDockerfileを以下に示します．
（PORTが決め打ちなのは格好悪いのと応用が効かないので，後で直します）

```
FROM node:8.9.4-stretch

ENV HOME=/home/node
WORKDIR $HOME
RUN git clone http://172.16.121.160:3000/suda/test
WORKDIR $HOME/test
RUN npm install
ENV PORT 4000
EXPOSE 4000
CMD [ "npm", "start" ]
```

実行するためには，先ほどと同じようにbuild→runの流れになります．
今度はバージョン番号を1.1にしましょう．

```
suda@debian:~/work$ sudo docker build -t node_chat:1.1 .
（ログは省略）
suda@debian:~/work$ sudo docker run -it --rm -p 4000:4000 node_chat:1.1
（ログは省略）
```

Webブラウザから```http://localhsot:4000/chat.html```にアクセスしてみましょう．
うまく動いていればチャットの画面が表示されるはずです．

## Docker Compose化する

ここまでできると，起動のためのdockerコマンドが面倒と感じるようになってくると思います．
これを解消するために，docker composeを使用します．
本来のdocker composeは複数のコンテナを連携させるオーケストレーションの仕組みですが，起動を楽にする意味も含まれています．
それではdocker-compose.ymlの例を示します．

```
version: '2'
services:
  node_chat:
    build: .
    environment:
     - "PORT=4000"
    ports:
     - "4000:4000"
```

短いと思うかもしれませんが，単独のコンテナを起動するだけなのでこの程度で済んでいます．
自前のDockerfileを扱うための記述が```build```です．
この場合は，カレントディレクトリに有るDockerfileを使用することを示しています．
他のディレクトリに存在するDockerfileを使ってサービスを起動することも可能です．

それでは起動してみましょう．起動するためには以下のようにします．
見て分かるように，docker-composeコマンドでサービスを起動すると，イメージの作成からサービスの起動までが実行されます．

```
suda@debian:~/work$ sudo docker-compose up
Creating network "work_default" with the default driver
Building node_chat
Step 1/9 : FROM node:8.9.4-stretch
 ---> a264e6327bde
Step 2/9 : ENV HOME=/home/node
 ---> Using cache
 ---> 27f1735a713a
Step 3/9 : WORKDIR $HOME
 ---> Using cache
 ---> 56b3346a0d08
Step 4/9 : RUN git clone http://172.16.121.160:3000/suda/test
 ---> Using cache
 ---> d304e5853ad9
Step 5/9 : WORKDIR $HOME/test
 ---> Using cache
 ---> 10c7cae75760
Step 6/9 : RUN npm install
 ---> Using cache
 ---> a8d24c4378ff
Step 7/9 : ENV PORT 4000
 ---> Using cache
 ---> b58ac8e270b6
Step 8/9 : EXPOSE 4000
 ---> Using cache
 ---> 2abe6e3efc44
Step 9/9 : CMD [ "npm", "start" ]
 ---> Using cache
 ---> da8b6eb13426
Successfully built da8b6eb13426
Successfully tagged work_node_chat:latest
WARNING: Image for service node_chat was built because it did not already exist. To rebuild this image you must use `docker-compose build` or `docker-compose up --build`.
Creating work_node_chat_1 ... done
Attaching to work_node_chat_1
node_chat_1  |
node_chat_1  | > node-test@0.0.0 start /home/node/test
node_chat_1  | > node ./bin/www
```

後は，作成したDockerfileとdocker-compose.ymlを，Gitサーバにアップロードしておくことを勧めます．
その際，node_chat内に入れても良いですし，別々でも構いません．
（今回の書き方は別のリポジトリに入れることを前提としていますが，少し変更するだけなので挑戦してみてください）
