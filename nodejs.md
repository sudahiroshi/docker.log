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
public | 画像やjsファイルなど静的なファイルを入れておく
routes | URLによって処理を分けるためのプログラムを入れておく
views | 整形される前のWebページを入れておく

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

この状態でWebブラウザから```http://localhost:3000/```に接続すると"Express"などと表示されます．
終了はctrl+cです．

## Chatを作る

node.jsには，socket.ioというリアルタイムにWebサーバ・クライアント間で通信を行うためのパッケージが用意されています．
socket.ioで利用できるプロトコルとして，WebSocket，AJAX（XML HTTP Request），JSONPなど主要なものを網羅しており，自動的に選択してくれます．
ここでは，node_testを拡張して，socket.ioを使ってChatを作成してみます．
参考までに，socket.ioを使ったChatのプログラムは，node.jsのサンプルとしてよく使われる題材です．

Chatを作るにあたって必要な機能に以下のようなものがあります．
なお，最終的にどのようなChatを作成するか考えて，機能の追加・削除をするものとします．

サーバ/クライアント | 機能
-|-
サーバ | ChatのWebページを用意
サーバ | クライアントから送られてきた投稿を他のクライアントに通知する
サーバ | 投稿内容をDBに格納
サーバ | 過去の投稿内容を引っ張り出す
クライアント | 投稿機能
クライアント | 他社の投稿を受け取り表示

### socket.ioのインストール

まずはsocket.ioをインストールします．
ここでは，インストールしつつ，node_testのパッケージ情報にsocket.ioを追記します．

```
suda@debian:~/node_test$ npm install --save socket.io

> uws@0.14.5 install /home/suda/test/node_modules/uws
> node-gyp rebuild > build_log.txt 2>&1 || exit 0

+ socket.io@2.0.4
added 33 packages in 1.522s
suda@debian:~/node_test$
```

### socket.ioを使って投稿を他のクライアントに通知する（サーバ側）

express generatorを利用してひな形を用意した場合，メインとなる通信制御は```node_chat/bin/www```で行っています．
長いので割愛しますが，このファイルの最後に以下の内容を追加してください．

```javascript
var io = require('socket.io').listen(server);
io.sockets.on('connection', function(socket) {
  console.log("new connection");
  socket.on('message', function(msg) {
    socket.emit('message', msg);
    socket.broadcast.emit('message',msg);
  });
  socket.on('disconnect', function() {
    console.log('disconnected');
  });
});
```

### ChatのWebページを用意する（サーバ側）

次にChatのWebページを用意します．
元々expressでは，サーバサイドで処理をした結果をHTML形式で送信することが前提になっていますが，ここでは一旦静的なWebページに対してクライアントサイドのJavaScriptでデータの送受信を行う形で設計するものとします．
その場合，```node_test/public```の下にHTMLファイルを置いておくだけで良いです．
ここでは```chat.html```とします．

一旦，socket.ioのライブラリを読み込むようにして，コンソールから動作を確認してみましょう．
動作確認用のHTMLを示します．
コメントアウトされている部分は，後ほど使用します．

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <title>Express</title>
    <link rel='stylesheet' href='/stylesheets/style.css' />
    <script src="/socket.io/socket.io.js"></script>
    <!-- <script src="/javascripts/chat.js"></script> -->
  </head>
  <body>
    <h1>Chat by socket.io</h1>
    <div id="connectId"></div>
    <input type="text" id="message" value="">
    <input type="button" id="send" value="send">
    <input type="button" id="disconnect" value="disconnect">
    <div id="receiveMsg"></div>
  </body>
</html>
```

それではWebブラウザから```http://localhost:3000//chat```にアクセスしてください．
この状態では，socket.ioを使える状態ですが，実際には何も行いません．
ブラウザのコンソールを開いて以下のように実行してみてください．
分かりにくいですが，//から始まっている行はコメントなので入力しないでください．
入力する行は>から始まっている行です．

```
// (1)socket.ioの初期化と接続．この段階でサーバサイドに'new connection'が表示される
> var socket=io();
undefined

// (2)サーバから何か送られてきたら，その内容をコンソールに表示する
> socket.addEventListener('message', function(msg) { console.log(msg); });
r {io: r, nsp: "/", json: r, ids: 0, acks: {…}, …}

// (3)サーバにメッセージを送ってみる
> socket.emit('message', 'test');
r {io: r, nsp: "/", json: r, ids: 0, acks: {…}, …}
test    // ←サーバに送った内容がそのまま送り返される．(2)により表示される．
```

この状態で，複数のWebブラウザを開いて（別々のブラウザでも良いし，1つのブラウザ内で複数のウィンドウを開いても良い），それぞれで上記内容を入力すると，コンソール内で会話できます．


次に通信を行うjsを```node_chat/public/javascripts/chat.js```とという名前で作成します．
ついでに，chat.htmlのコメントアウトされている部分を通常の行に戻してください．

```javascript
// connect to server
var socket = io.connect();

// when connected
socket.on( 'connect', function(msg) {
  document.getElementById( "connectId" ).innerHTML = "your ID::" + socket.id;
});

// when receive a message
socket.on( 'message', function(msg) {
  document.getElementById( "receiveMsg" ).appendChild( document.createTextNode( msg  ) );
  document.getElementById( "receiveMsg" ).appendChild( document.createElement( "br" ) );
});


window.addEventListener( 'load', function() {
  // message sending
  document.getElementById( 'send' ).addEventListener( 'click', function() {
    var msg = document.getElementById( 'message' ).value;
    console.log( msg );
    socket.emit( 'message', msg );
  });

  // disconect
  document.getElementById( 'disconnect' ).addEventListener( 'click', function() {
    socket.send(socket.id + " has been disconected.");
    socket.disconnect();
    document.getElementById( "connectId" ).innerHTML = "Disconnected";
  });
});
```

サーバ上で```npm start```してから，Webブラウザで```http://localhost:3000/chat.html```に接続してください．
きちんとsocket.ioの接続が確立するとIDが表示されます．
複数のブラウザ（またはウィンドウ）を開いて，チャットを行ってみてください．
