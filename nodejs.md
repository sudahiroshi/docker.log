node.js
===============

debian9にnode.jsをインストールしてサービスを立ち上げる方法

使用環境
- VirtualBox

## node.jsのインストール

[パッケージマネージャを利用した Node.js のインストール](https://nodejs.org/ja/download/package-manager/#debian-and-ubuntu-based-linux-distributions-debian-ubuntu-linux)を見ながら作業する．
現時点での最新バージョンは，推奨版が8.9.4LTSで最新版が9.4.0です．
ここでは推奨版をインストールする手順を示します．

まずは様々な設定を一度に行ってくれるスクリプトをダウンロード・実行します．
万一，curlがインストールされていない場合は```apt-get install curl```でインストールしてください．


```
suda@debian:~$ curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -

## Installing the NodeSource Node.js v8.x repo...


## Populating apt-get cache...

+ apt-get update
無視:1 http://ftp.jp.debian.org/debian stretch InRelease
ヒット:2 http://ftp.jp.debian.org/debian stretch-updates InRelease
ヒット:3 http://ftp.jp.debian.org/debian stretch Release
ヒット:5 http://security.debian.org/debian-security stretch/updates InRelease
パッケージリストを読み込んでいます... 完了

## Installing packages required for setup: apt-transport-https lsb-release...

+ apt-get install -y apt-transport-https lsb-release > /dev/null 2>&1
,
## Confirming "stretch" is supported...

+ curl -sLf -o /dev/null 'https://deb.nodesource.com/node_8.x/dists/stretch/Release'

## Adding the NodeSource signing key to your keyring...

+ curl -s https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add -
OK

## Creating apt sources list file for the NodeSource Node.js v8.x repo...

+ echo 'deb https://deb.nodesource.com/node_8.x stretch main' > /etc/apt/sources.list.d/nodesource.list
+ echo 'deb-src https://deb.nodesource.com/node_8.x stretch main' >> /etc/apt/sources.list.d/nodesource.list

## Running `apt-get update` for you...

+ apt-get update
無視:1 http://ftp.jp.debian.org/debian stretch InRelease
ヒット:2 http://ftp.jp.debian.org/debian stretch-updates InRelease
取得:3 https://deb.nodesource.com/node_8.x stretch InRelease [4,647 B]
ヒット:4 http://ftp.jp.debian.org/debian stretch Release
取得:6 https://deb.nodesource.com/node_8.x stretch/main Sources [762 B]
ヒット:7 http://security.debian.org/debian-security stretch/updates InRelease
取得:8 https://deb.nodesource.com/node_8.x stretch/main amd64 Packages [1,009 B]
6,418 B を 0秒 で取得しました (9,687 B/s)
パッケージリストを読み込んでいます... 完了

## Run `apt-get install nodejs` (as root) to install Node.js v8.x and npm

suda@debian:~$
```

続いて，node.jsをインストールします．

```
suda@debian:~$ sudo apt-get install nodejs
パッケージリストを読み込んでいます... 完了
依存関係ツリーを作成しています
状態情報を読み取っています... 完了
以下のパッケージが自動でインストールされましたが、もう必要とされていません:
  libicu57 libuv1
これを削除するには 'sudo apt autoremove' を利用してください。
以下の追加パッケージがインストールされます:
  libpython-stdlib libpython2.7-minimal libpython2.7-stdlib python python-minimal python2.7
  python2.7-minimal
提案パッケージ:
  python-doc python-tk python2.7-doc binutils binfmt-support
以下のパッケージが新たにインストールされます:
  libpython-stdlib libpython2.7-minimal libpython2.7-stdlib python python-minimal python2.7
  python2.7-minimal
以下のパッケージはアップグレードされます:
  nodejs
アップグレード: 1 個、新規インストール: 7 個、削除: 0 個、保留: 1 個。
17.0 MB のアーカイブを取得する必要があります。
この操作後に追加で 63.9 MB のディスク容量が消費されます。
続行しますか? [Y/n]
取得:1 http://ftp.jp.debian.org/debian stretch/main amd64 libpython2.7-minimal amd64 2.7.13-2+deb9u2 [389 kB]
取得:2 https://deb.nodesource.com/node_8.x stretch/main amd64 nodejs amd64 8.9.4-1nodesource1 [12.8 MB]
取得:3 http://ftp.jp.debian.org/debian stretch/main amd64 python2.7-minimal amd64 2.7.13-2+deb9u2 [1,382 kB]
取得:4 http://ftp.jp.debian.org/debian stretch/main amd64 python-minimal amd64 2.7.13-2 [40.5 kB]
取得:5 http://ftp.jp.debian.org/debian stretch/main amd64 libpython2.7-stdlib amd64 2.7.13-2+deb9u2 [1,896 kB]
取得:6 http://ftp.jp.debian.org/debian stretch/main amd64 python2.7 amd64 2.7.13-2+deb9u2 [285 kB]
取得:7 http://ftp.jp.debian.org/debian stretch/main amd64 libpython-stdlib amd64 2.7.13-2 [20.0 kB]
取得:8 http://ftp.jp.debian.org/debian stretch/main amd64 python amd64 2.7.13-2 [154 kB]
17.0 MB を 0秒 で取得しました (18.8 MB/s)
以前に未選択のパッケージ libpython2.7-minimal:amd64 を選択しています。
(データベースを読み込んでいます ... 現在 25992 個のファイルとディレクトリがインストールされています。)
.../0-libpython2.7-minimal_2.7.13-2+deb9u2_amd64.deb を展開する準備をしています ...
libpython2.7-minimal:amd64 (2.7.13-2+deb9u2) を展開しています...
以前に未選択のパッケージ python2.7-minimal を選択しています。
.../1-python2.7-minimal_2.7.13-2+deb9u2_amd64.deb を展開する準備をしています ...
python2.7-minimal (2.7.13-2+deb9u2) を展開しています...
以前に未選択のパッケージ python-minimal を選択しています。
.../2-python-minimal_2.7.13-2_amd64.deb を展開する準備をしています ...
python-minimal (2.7.13-2) を展開しています...
以前に未選択のパッケージ libpython2.7-stdlib:amd64 を選択しています。
.../3-libpython2.7-stdlib_2.7.13-2+deb9u2_amd64.deb を展開する準備をしています ...
libpython2.7-stdlib:amd64 (2.7.13-2+deb9u2) を展開しています...
以前に未選択のパッケージ python2.7 を選択しています。
.../4-python2.7_2.7.13-2+deb9u2_amd64.deb を展開する準備をしています ...
python2.7 (2.7.13-2+deb9u2) を展開しています...
以前に未選択のパッケージ libpython-stdlib:amd64 を選択しています。
.../5-libpython-stdlib_2.7.13-2_amd64.deb を展開する準備をしています ...
libpython-stdlib:amd64 (2.7.13-2) を展開しています...
libpython2.7-minimal:amd64 (2.7.13-2+deb9u2) を設定しています ...
python2.7-minimal (2.7.13-2+deb9u2) を設定しています ...
Linking and byte-compiling packages for runtime python2.7...
python-minimal (2.7.13-2) を設定しています ...
以前に未選択のパッケージ python を選択しています。
(データベースを読み込んでいます ... 現在 26738 個のファイルとディレクトリがインストールされています。)
.../python_2.7.13-2_amd64.deb を展開する準備をしています ...
python (2.7.13-2) を展開しています...
.../nodejs_8.9.4-1nodesource1_amd64.deb を展開する準備をしています ...
nodejs (8.9.4-1nodesource1) で (4.8.2~dfsg-1 に) 上書き展開しています ...
mime-support (3.60) のトリガを処理しています ...
nodejs (8.9.4-1nodesource1) を設定しています ...
libpython2.7-stdlib:amd64 (2.7.13-2+deb9u2) を設定しています ...
python2.7 (2.7.13-2+deb9u2) を設定しています ...
libpython-stdlib:amd64 (2.7.13-2) を設定しています ...
python (2.7.13-2) を設定しています ...
suda@debian:~$  node -v
v8.9.4
suda@debian:~$
```

## node.jsのWebフレームワークであるexpressのインストール

node.jsはJavaScriptのインタプリタです．
素のままでWebサービスを行うのはたいへんなので，ここではWebフレームワークであるexpressを用います．
さらに作業を効率化するため，expressで必要なファイルを自動で作成してくれるexpress-generatorを使用します．

まずはexpress-generatorをインストールします．
この段階でexpressもインストールされます．

```
suda@debian:~$ sudo npm install -g express-generator
[sudo] suda のパスワード:
/usr/bin/express -> /usr/lib/node_modules/express-generator/bin/express-cli.js
+ express-generator@4.15.5
added 6 packages in 1.101s
suda@debian:~$
```

続いて，expressコマンドを使ってプロジェクトを生成します．
ここではプロジェクト名を```node_test```としていますが，自由に変更してください．

```
suda@debian:~$ express -e node_test

  warning: option `--ejs' has been renamed to `--view=ejs'


   create : node_test
   create : node_test/package.json
   create : node_test/app.js
   create : node_test/public
   create : node_test/routes
   create : node_test/routes/index.js
   create : node_test/routes/users.js
   create : node_test/views
   create : node_test/views/index.ejs
   create : node_test/views/error.ejs
   create : node_test/bin
   create : node_test/bin/www
   create : node_test/public/javascripts
   create : node_test/public/images
   create : node_test/public/stylesheets
   create : node_test/public/stylesheets/style.css

   install dependencies:
     $ cd node_test && npm install

   run the app:
     $ DEBUG=node-test:* npm start

suda@debian:~$
```

以上でひな形の生成が修了しました．
ひな形を確認しましょう．

```
suda@debian:~$ cd node_test
suda@debian:~/node_test$ ls -F
app.js  bin/  package.json  public/  routes/  views/
suda@debian:~/node_test$
```

ファイルやディレクトリの大まかな役割は以下のとおりです．

名称 | 役割
-|-
app.js | Webサーバのプログラム本体
package.json | 必要なnode.js関連のパッケージの一覧
bin | ？
public | Webページなどのデータを入れておく
routes | URLによって処理を分けるためのプログラムを入れておく
views | jsファイルやcssなどを入れておく

次に，必要なパッケージをインストールします．
パッケージとは，ライブラリのようなものと思ってください．

```
suda@debian:~/node_test$ npm install
npm notice created a lockfile as package-lock.json. You should commit this file.
added 58 packages in 1.141s
suda@debian:~/node_test$
```

npmはnode.js package managerです．
元々は名前の通りパッケージマネージャだったのですが，他にもいろいろな場面で使われます．
メッセージから，```package-lock.json```というファイルが作られたことと，58個のパッケージがインストールされたことが分かります．

準備が完了したので，Webサーバを起動します．

```
suda@debian:~/node_test$ npm start

> node-test@0.0.0 start /home/suda/node_test
> node ./bin/www
```

この状態でWebブラウザから```http://localhost:3000/```に接続すると"Express"などと表示される．
