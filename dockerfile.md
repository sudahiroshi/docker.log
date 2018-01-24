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

実行する際に```PORT=4000```としているのは，すでに3000番ポートを使っているので他のポートを割り当てるためです．
なお，VirtualBoxのポートフォワードの設定に4000→4000を追加しておいてください．
この状態でWebブラウザから```http://localhost:4000/chat.html```にアクセスすると，チャットが実行できるはずです．
