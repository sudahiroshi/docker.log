node.jsアプリをDocker化する
===============

node.jsを利用して作成したサービスをDocker化する方法

使用環境
- VirtualBox
- Debian
- git

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

今回は，Dockerfileを作る練習なので，以前使用したnode-animalを利用します．
作成したプログラムをDockerで使う場合，(1)一つ一つファイルコピーする方法，(2)ファイルを置いたディレクトリをマウントする方法，(3)ネット上からダウンロードする方法が考えられます．
ここでは，後々の更新が楽なように(3)の方法を使います．
(3)の方法にも様々なやり方がありますが，せっかくなのでバージョン管理システムを活用します．

バージョン管理システムにも色々ありますが，ここでは近年のシェアの高さからgitを使用します．
gitサーバとして，GitHubが有名ですが，すでにGitLabやBitBucketにアカウントを持っている人はそちらを利用しても構いません．
まだそれらのアカウントを持っていない人は，作成してください．

### gitの使い方

初めてアカウントを作った人や，アカウントはあるけれども不慣れな人は，まずは新しいリポジトリを作成してみましょう．
例えばGitHubだと，ログイン後に出てくる画面（ダッシュボードと言います）の画面情報にある```Repositories```をクリックして，その右下に出てくる```New```ボタンをクリックしてください．
するといくつかの項目に関する入力欄が出てきます．
練習用に，以下のようにして新しいリポジトリを作ってみましょう．

項目 | 項目（日本語） | 説明
-|-
Owner | オーナー | あなたのユーザ名
Repository name | リポジトリ名 | とりあえずtestとしておいてください
Description | 説明 | 「練習用」とするか，カラのままでも構いません
Public / Private | 公開/非公開 | 公開にしてください
Initialize 以下略 | READMEを作成するか？ | とりあえずチェックを付けてください
Add .gitignore | .gitignoreを作るか？ | Nodeを選択してください
Add a license | ライセンス | 特に入力しなくて良いです

（この辺はgitコマンドに慣れている人はこの手順に沿わなくて構いません．
ここで紹介しているのは初心者でも戸惑わずに遂行できる手順です）

すると，```.gitignore```と```README.md```が存在するリポジトリが作られます．
一旦，Windows上でこのリポジトリをcloneしましょう．

今作成したリポジトリの上の方に```Clone or download```というボタンがあると思います．
これをクリックするとメニューが開くので，URLの右にあるコピーボタンを押してください．
その後，リポジトリをclone（サーバから手元にコピー）を行います．

```
suda@debian:~$ git clone まで入力したらペースト操作をする
Cloning into 'test'...
remote: Counting objects: 2, done.
remote: Compressing objects: 100% (3/3), done.
remote: Total 2 (delta 0), reused 0 (delta 0)
Unpacking objects: 100% (2/2), done.
suda@debian:~$ 
```

すると，testディレクトリが作成されて，その中に.gitignoreとREADME.mdが作られているはずです．
ただし，.gitignoreは表示されないかもしれません．

続いて，testディレクトリにファイルを作成します．
ここでは，Webページの雛形を入れてみましょう．
ファイル名はindex.htmlとします．
（他のファイルが良い人は，適当なファイル名を付けてください）

次に，増えたファイルをサーバにアップロードしてみましょう．
その前に，ユーザ名とメールアドレスの設定が必要です．

```
suda@debian:~$ git config --global user.name "ユーザ名"
suda@debian:~$ git config --global user.email "メールアドレス"
```

それでは，今度こそサーバにアップロードしてみましょう．

```
suda@debian:~$ cd test
suda@debian:~test$ git add .
suda@debian:~test$ git commit -am 'First commit'　　　←ここにはコメントを入れてください
suda@debian:~test$ git push
suda@debian:~test$
```

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

その他，色々便利な機能があるので，徐々に調べながら使ってみてください．

## node_animalをForkする

Githubには，他の人のリポジトリを丸ごとコピーする機能があります．
今回はnode_animalをForkしてみましょう．
Github以外を使っている人は，この機能を使えません．
その場合，node_animalをcloneした後に，全てのファイルをコピーしましょう．
（本当はもっと便利な機能がありますが，後々使い方を調べてみてください）


## Debian上でGitサーバからcloneしたサービスを起動する

それでは，Gitサーバにアップロードしたサービスが，本当に使えるか試してみましょう．
Debianのホームディレクトリから作業を始めます．

```
suda@debian:~$ mkdir temp

suda@debian:~$ cd temp

suda@debian:~/temp$ git clone 各自のnode_animalのURL
Cloning into 'node_animal'...
remote: Counting objects: 20, done.
remote: Compressing objects: 100% (16/16), done.
remote: Total 20 (delta 2), reused 0 (delta 0)
Unpacking objects: 100% (20/20), done.

suda@debian:~/temp$ cd node_animal

suda@debian:~/temp/node_animal$ ls
README.md  app.js  bin  package-lock.json  package.json  public  routes  views

suda@debian:~/temp/node_animal$ npm install

> uws@0.14.5 install /home/suda/temp/node_chat/node_modules/uws
> node-gyp rebuild > build_log.txt 2>&1 || exit 0

added 91 packages in 1.452s

suda@debian:~/temp/node_animal$ npm start

> test@0.0.0 start /home/suda/temp/node_chat
> node ./bin/www
```


途中で```npm install```しているのは，通常パッケージマネージャが存在する言語・環境の場合はパッケージ情報（package.json）だけをアップロードしておいて，サービスを立ち上げる際に公式サーバからダウンロードします．
よって，ここでもその流儀に従って公式サイトよりダウンロードしています．
ところで，開発者がダウンロードしたパッケージはどこに消えたのでしょうか？
実は，```.gitignore```に管理対象外とするファイルやディレクトリを登録することができます．
今回はリポジトリを作成する際に```.gitignore```に```node```を指定してあるのでそれらのファイル（```node_modules```ディレクトリ）が管理対象外となっています．

この状態でWebブラウザから```http://localhost/chat.html```にアクセスすると，チャットが実行できるはずです．
なお，VirtualBoxのポートフォワードの設定も必要です．ポート番号を80番以外にした場合，上記URLも変更となります．

## Dockerfileの作成

やっと準備が整ったので，次はDockerfileを作成してDocker化します．
基本的にDockerfileには，元となるイメージを記述し，その後インストール手順を順番に記述します．
Dockerfileの多くは[Dockerhub](https://hub.docker.com/)に登録されています．
例えばnode.jsのDockerfileを確認したければ，[node](https://hub.docker.com/_/node/)にあります．
多数のDockerfileが表示されるのは，そもそもnode.jsに複数のバージョンが有ることと，それを動かす環境が多数あること，ユーザがどの程度の利便性を求めるか分からないので場合分けしてあることなどが理由です．

例えばDebina9上でnode.js ver.8.16.2を用いるためのDockerfileを確認したい場合は，```8.16.2-stretch```をクリックしてみてください．
Github内のDockerfileが表示されます．
そのように別々の条件のDockerが多数アップロードされています．

Dockerfile内の各行の先頭にあるのが「命令」で，そこに引数があることが分かれば読み解きやすいと思います．
例としていくつかの命令とその意味を記載します．

命令 | 意味
-|-
FROM | 元となるDockerfile
RUN | コマンドの実行
ENV | 環境変数の設定
COPY | ファイルのコピー
ENTRYPOINT | コンテナ起動時に実行するコマンド
CMD | コンテナ起動時に実行するコマンド

ENTRYPOINTとCMDは，ほぼ同じ機能を持っています．
1. 通常はENTRYPOINTとCMDのどちらか1つを記述する．
2. CMDは，docker runコマンドで上書き可能．
3. 両方記述した場合は，ENTRYPOINTがコマンドになり，CMDがオプションになる．
4. 両方記述した場合は，CMDが上書きされる＝オプションが上書きされる．

上から見ていくと，環境変数を設定したり，アーキテクチャを調べて適合するファイルをダウンロードするなどの処理が行われている．
その上で，最後に```docker-entrypoint.sh```というファイルをローカルからDockerイメージにコピーして実行している．
このような形でインフラのコード化が実現されている．

### Dockerfileに追記する

自分のサービスを立ち上げたい場合は，Dockerfileに追記することになる．
この場合，元のイメージとしてnginxを指定して，そこにつながる一連の処理を記述するDockerfileを作れば良い．
以下に例を示す．

```
FROM node:8.16.2-stretch

ENV HOME=/home/node
WORKDIR $HOME
RUN git clone ここにURLを記載する
WORKDIR $HOME/node_chat
RUN npm install
```

まずはここまでのDockerfileの動作を確認します．
手元のDockerfileを使うためには，まずbuildします．

```
suda@debian:~/work$ sudo docker build -t node_animal:1.0 .
Sending build context to Docker daemon  13.53MB
Step 1/9 : FROM node:8.16.2-stretch
 ---> a264e6327bde
Step 2/9 : ENV HOME=/home/node
 ---> Using cache
 ---> 27f1735a713a
Step 3/9 : WORKDIR $HOME
 ---> Using cache
 ---> 56b3346a0d08
Step 4/9 : RUN git 指定したURL
 ---> Using cache
 ---> d304e5853ad9
Step 5/9 : WORKDIR $HOME/node_chat
 ---> Using cache
 ---> 10c7cae75760
Step 6/9 : RUN npm install
 ---> Using cache
 ---> a8d24c4378ff
Successfully built da8b6eb13426
Successfully tagged node_animal:1.0
suda@debian:~/work$
```

無事にbuildできたら，```/bin/bash```を対話的に動かしてみましょう．
具体的には```pwd```や```ls```などでファイルが有ることを確認します．

```
suda@debian:~/work$ sudo docker run -it --rm -p 80:80 node_animal:1.0 /bin/bash

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
FROM node:8.16.2-stretch

ENV HOME=/home/node
WORKDIR $HOME
RUN git clone ここにURLを記載する
WORKDIR $HOME/test
RUN npm install
ENV PORT 80
EXPOSE 80
CMD [ "npm", "start" ]
```

実行するためには，先ほどと同じようにbuild→runの流れになります．
今度はバージョン番号を1.1にしましょう．

```
suda@debian:~/work$ sudo docker build -t node_animal:1.1 .
（ログは省略）
suda@debian:~/work$ sudo docker run -it --rm -p 80:80 node_chat:1.1
（ログは省略）
```

Webブラウザから```http://localhost/chat.html```にアクセスしてみましょう．
うまく動いていればチャットの画面が表示されるはずです．

