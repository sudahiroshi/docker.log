localstack.log
===============

## LocalStackとは

LocalStackとは，Amazon Web Service（以下AWS）と同等の機能をローカルで動作させる環境です．
AWSのアカウントを持っていない人や，課金が怖い人でも使えるので重宝します．

ここでは，セッティングから簡単な使い方までを学んでいきたいと思います．

### インストール

[LocalStack導入から実行まで](https://qiita.com/rio_matsui/items/e0c2c772d4579d00a312)を参考にしてインストールしていきます．
ありがたいことに，Docker上にLocalStack環境を構築してあるので，このコンテナを使用します．
以下のように順に実行してください．
なるべく分かりやすいように，コマンドを打ち込む場合は1行空けています．

```bash
suda@debian:~$ git clone https://github.com/localstack/localstack
Cloning into 'localstack'...
remote: Counting objects: 4494, done.
remote: Compressing objects: 100% (69/69), done.
remote: Total 4494 (delta 43), reused 80 (delta 32), pack-reused 4378
Receiving objects: 100% (4494/4494), 1.45 MiB | 474.00 KiB/s, done.
Resolving deltas: 100% (2830/2830), done.

suda@debian:~$ cd localstack/

suda@debian:~/localstack$ ls
Dockerfile   MANIFEST.in  README.md  doc                 localstack        setup.py
LICENSE.txt  Makefile     bin        docker-compose.yml  requirements.txt  tests

suda@debian:~/localstack$ sudo TMPDIR=./tmp LAMBDA_EXECUTOR=docker docker-compose up -d
[sudo] suda のパスワード:
Creating network "localstack_default" with the default driver
Pulling localstack (localstack/localstack:latest)...
latest: Pulling from localstack/localstack
d5025fbab3ae: Pull complete
558be65c0bbc: Pull complete
Digest: sha256:b3710ae16e63fe779b87dc25baacd75c3fc492e1469c6ba211db5d63a583f8ad
Status: Downloaded newer image for localstack/localstack:latest
Creating localstack_localstack_1 ... done
suda@debian:~/localstack$ ls
Dockerfile   MANIFEST.in  README.md  doc                 localstack        setup.py  tmp
LICENSE.txt  Makefile     bin        docker-compose.yml  requirements.txt  tests
suda@debian:~/localstack$
```

以上でLocalStackのインストールと起動は終了しました．
Webブラウザから，debianの8080番ポートにアクセスすると，簡単なダッシュボードが表示されるはずです．

続いて，必要なコマンドをインストールします．
具体的にはzipとawscliとjqです．

まずはzipのインストールです．

```
suda@debian:~$ sudo apt-get install zip
パッケージリストを読み込んでいます... 完了
依存関係ツリーを作成しています
状態情報を読み取っています... 完了
以下の追加パッケージがインストールされます:
  unzip
以下のパッケージが新たにインストールされます:
  unzip zip
アップグレード: 0 個、新規インストール: 2 個、削除: 0 個、保留: 1 個。
404 kB のアーカイブを取得する必要があります。
この操作後に追加で 1,169 kB のディスク容量が消費されます。
続行しますか? [Y/n]
取得:1 http://ftp.jp.debian.org/debian stretch/main amd64 unzip amd64 6.0-21 [170 kB]
取得:2 http://ftp.jp.debian.org/debian stretch/main amd64 zip amd64 3.0-11+b1 [234 kB]
404 kB を 0秒 で取得しました (1,226 kB/s)
以前に未選択のパッケージ unzip を選択しています。
(データベースを読み込んでいます ... 現在 54993 個のファイルとディレクトリがインストールされています。)
.../unzip_6.0-21_amd64.deb を展開する準備をしています ...
unzip (6.0-21) を展開しています...
以前に未選択のパッケージ zip を選択しています。
.../zip_3.0-11+b1_amd64.deb を展開する準備をしています ...
zip (3.0-11+b1) を展開しています...
mime-support (3.60) のトリガを処理しています ...
unzip (6.0-21) を設定しています ...
zip (3.0-11+b1) を設定しています ...
suda@debian:~$
```

続けてawscli（AWS Command Line ？）のインストールです．

```
suda@debian:~$ sudo apt-get install awscli
パッケージリストを読み込んでいます... 完了
依存関係ツリーを作成しています
状態情報を読み取っています... 完了
以下の追加パッケージがインストールされます:
  docutils-common libjbig0 libjpeg62-turbo liblcms2-2 libpaper-utils libpaper1 libtiff5 libwebp6 libwebpdemux2 libwebpmux2
  python3-botocore python3-chardet python3-colorama python3-dateutil python3-docutils python3-jmespath python3-pil
  python3-pkg-resources python3-pyasn1 python3-pygments python3-requests python3-roman python3-rsa python3-s3transfer
  python3-six python3-urllib3
提案パッケージ:
  liblcms2-utils docutils-doc fonts-linuxlibertine | ttf-linux-libertine texlive-lang-french texlive-latex-base
  texlive-latex-recommended python-pil-doc python3-pil-dbg python3-setuptools doc-base ttf-bitstream-vera python3-cryptography
  python3-idna python3-openssl python3-socks
以下のパッケージが新たにインストールされます:
  awscli docutils-common libjbig0 libjpeg62-turbo liblcms2-2 libpaper-utils libpaper1 libtiff5 libwebp6 libwebpdemux2
  libwebpmux2 python3-botocore python3-chardet python3-colorama python3-dateutil python3-docutils python3-jmespath python3-pil
  python3-pkg-resources python3-pyasn1 python3-pygments python3-requests python3-roman python3-rsa python3-s3transfer
  python3-six python3-urllib3
アップグレード: 0 個、新規インストール: 27 個、削除: 0 個、保留: 1 個。
4,585 kB のアーカイブを取得する必要があります。
この操作後に追加で 32.6 MB のディスク容量が消費されます。
続行しますか? [Y/n]
取得:1 http://security.debian.org/debian-security stretch/updates/main amd64 libtiff5 amd64 4.0.8-2+deb9u2 [238 kB]
取得:2 http://ftp.jp.debian.org/debian stretch/main amd64 python3-six all 1.10.0-3 [14.4 kB]
取得:3 http://ftp.jp.debian.org/debian stretch/main amd64 python3-dateutil all 2.5.3-2 [45.2 kB]
取得:4 http://ftp.jp.debian.org/debian stretch/main amd64 docutils-common all 0.13.1+dfsg-2 [200 kB]
取得:5 http://ftp.jp.debian.org/debian stretch/main amd64 python3-roman all 2.0.0-2 [8,226 B]
取得:6 http://ftp.jp.debian.org/debian stretch/main amd64 python3-docutils all 0.13.1+dfsg-2 [371 kB]
取得:7 http://ftp.jp.debian.org/debian stretch/main amd64 python3-jmespath all 0.9.0-2 [16.6 kB]
取得:8 http://ftp.jp.debian.org/debian stretch/main amd64 python3-urllib3 all 1.19.1-1 [77.6 kB]
取得:9 http://ftp.jp.debian.org/debian stretch/main amd64 python3-pkg-resources all 33.1.1-1 [137 kB]
取得:10 http://ftp.jp.debian.org/debian stretch/main amd64 python3-chardet all 2.3.0-2 [96.0 kB]
取得:11 http://ftp.jp.debian.org/debian stretch/main amd64 python3-requests all 2.12.4-1 [101 kB]
取得:12 http://ftp.jp.debian.org/debian stretch/main amd64 python3-botocore all 1.4.70-1 [1,053 kB]
取得:13 http://ftp.jp.debian.org/debian stretch/main amd64 python3-colorama all 0.3.7-1 [18.1 kB]
取得:14 http://ftp.jp.debian.org/debian stretch/main amd64 python3-pyasn1 all 0.1.9-2 [34.5 kB]
取得:15 http://ftp.jp.debian.org/debian stretch/main amd64 python3-rsa all 3.4.2-1 [30.7 kB]
取得:16 http://ftp.jp.debian.org/debian stretch/main amd64 python3-s3transfer all 0.1.9-1 [36.4 kB]
取得:17 http://ftp.jp.debian.org/debian stretch/main amd64 awscli all 1.11.13-1 [403 kB]
取得:18 http://ftp.jp.debian.org/debian stretch/main amd64 libjpeg62-turbo amd64 1:1.5.1-2 [134 kB]
取得:19 http://ftp.jp.debian.org/debian stretch/main amd64 liblcms2-2 amd64 2.8-4 [143 kB]
取得:20 http://ftp.jp.debian.org/debian stretch/main amd64 libpaper1 amd64 1.1.24+nmu5 [21.6 kB]
取得:21 http://ftp.jp.debian.org/debian stretch/main amd64 libpaper-utils amd64 1.1.24+nmu5 [17.6 kB]
取得:22 http://ftp.jp.debian.org/debian stretch/main amd64 libjbig0 amd64 2.1-3.1+b2 [31.0 kB]
取得:23 http://ftp.jp.debian.org/debian stretch/main amd64 libwebp6 amd64 0.5.2-1 [235 kB]
取得:24 http://ftp.jp.debian.org/debian stretch/main amd64 libwebpdemux2 amd64 0.5.2-1 [73.7 kB]
取得:25 http://ftp.jp.debian.org/debian stretch/main amd64 libwebpmux2 amd64 0.5.2-1 [83.9 kB]
取得:26 http://ftp.jp.debian.org/debian stretch/main amd64 python3-pil amd64 4.0.0-4 [377 kB]
取得:27 http://ftp.jp.debian.org/debian stretch/main amd64 python3-pygments all 2.2.0+dfsg-1 [588 kB]
4,585 kB を 19秒 で取得しました (236 kB/s)
パッケージを事前設定しています ...
以前に未選択のパッケージ python3-six を選択しています。
(データベースを読み込んでいます ... 現在 55027 個のファイルとディレクトリがインストールされています。)
.../00-python3-six_1.10.0-3_all.deb を展開する準備をしています ...
python3-six (1.10.0-3) を展開しています...
以前に未選択のパッケージ python3-dateutil を選択しています。
.../01-python3-dateutil_2.5.3-2_all.deb を展開する準備をしています ...
python3-dateutil (2.5.3-2) を展開しています...
以前に未選択のパッケージ docutils-common を選択しています。
.../02-docutils-common_0.13.1+dfsg-2_all.deb を展開する準備をしています ...
docutils-common (0.13.1+dfsg-2) を展開しています...
以前に未選択のパッケージ python3-roman を選択しています。
.../03-python3-roman_2.0.0-2_all.deb を展開する準備をしています ...
python3-roman (2.0.0-2) を展開しています...
以前に未選択のパッケージ python3-docutils を選択しています。
.../04-python3-docutils_0.13.1+dfsg-2_all.deb を展開する準備をしています ...
python3-docutils (0.13.1+dfsg-2) を展開しています...
以前に未選択のパッケージ python3-jmespath を選択しています。
.../05-python3-jmespath_0.9.0-2_all.deb を展開する準備をしています ...
python3-jmespath (0.9.0-2) を展開しています...
以前に未選択のパッケージ python3-urllib3 を選択しています。
.../06-python3-urllib3_1.19.1-1_all.deb を展開する準備をしています ...
python3-urllib3 (1.19.1-1) を展開しています...
以前に未選択のパッケージ python3-pkg-resources を選択しています。
.../07-python3-pkg-resources_33.1.1-1_all.deb を展開する準備をしています ...
python3-pkg-resources (33.1.1-1) を展開しています...
以前に未選択のパッケージ python3-chardet を選択しています。
.../08-python3-chardet_2.3.0-2_all.deb を展開する準備をしています ...
python3-chardet (2.3.0-2) を展開しています...
以前に未選択のパッケージ python3-requests を選択しています。
.../09-python3-requests_2.12.4-1_all.deb を展開する準備をしています ...
python3-requests (2.12.4-1) を展開しています...
以前に未選択のパッケージ python3-botocore を選択しています。
.../10-python3-botocore_1.4.70-1_all.deb を展開する準備をしています ...
python3-botocore (1.4.70-1) を展開しています...
以前に未選択のパッケージ python3-colorama を選択しています。
.../11-python3-colorama_0.3.7-1_all.deb を展開する準備をしています ...
python3-colorama (0.3.7-1) を展開しています...
以前に未選択のパッケージ python3-pyasn1 を選択しています。
.../12-python3-pyasn1_0.1.9-2_all.deb を展開する準備をしています ...
python3-pyasn1 (0.1.9-2) を展開しています...
以前に未選択のパッケージ python3-rsa を選択しています。
.../13-python3-rsa_3.4.2-1_all.deb を展開する準備をしています ...
python3-rsa (3.4.2-1) を展開しています...
以前に未選択のパッケージ python3-s3transfer を選択しています。
.../14-python3-s3transfer_0.1.9-1_all.deb を展開する準備をしています ...
python3-s3transfer (0.1.9-1) を展開しています...
以前に未選択のパッケージ awscli を選択しています。
.../15-awscli_1.11.13-1_all.deb を展開する準備をしています ...
awscli (1.11.13-1) を展開しています...
以前に未選択のパッケージ libjpeg62-turbo:amd64 を選択しています。
.../16-libjpeg62-turbo_1%3a1.5.1-2_amd64.deb を展開する準備をしています ...
libjpeg62-turbo:amd64 (1:1.5.1-2) を展開しています...
以前に未選択のパッケージ liblcms2-2:amd64 を選択しています。
.../17-liblcms2-2_2.8-4_amd64.deb を展開する準備をしています ...
liblcms2-2:amd64 (2.8-4) を展開しています...
以前に未選択のパッケージ libpaper1:amd64 を選択しています。
.../18-libpaper1_1.1.24+nmu5_amd64.deb を展開する準備をしています ...
libpaper1:amd64 (1.1.24+nmu5) を展開しています...
以前に未選択のパッケージ libpaper-utils を選択しています。
.../19-libpaper-utils_1.1.24+nmu5_amd64.deb を展開する準備をしています ...
libpaper-utils (1.1.24+nmu5) を展開しています...
以前に未選択のパッケージ libjbig0:amd64 を選択しています。
.../20-libjbig0_2.1-3.1+b2_amd64.deb を展開する準備をしています ...
libjbig0:amd64 (2.1-3.1+b2) を展開しています...
以前に未選択のパッケージ libtiff5:amd64 を選択しています。
.../21-libtiff5_4.0.8-2+deb9u2_amd64.deb を展開する準備をしています ...
libtiff5:amd64 (4.0.8-2+deb9u2) を展開しています...
以前に未選択のパッケージ libwebp6:amd64 を選択しています。
.../22-libwebp6_0.5.2-1_amd64.deb を展開する準備をしています ...
libwebp6:amd64 (0.5.2-1) を展開しています...
以前に未選択のパッケージ libwebpdemux2:amd64 を選択しています。
.../23-libwebpdemux2_0.5.2-1_amd64.deb を展開する準備をしています ...
libwebpdemux2:amd64 (0.5.2-1) を展開しています...
以前に未選択のパッケージ libwebpmux2:amd64 を選択しています。
.../24-libwebpmux2_0.5.2-1_amd64.deb を展開する準備をしています ...
libwebpmux2:amd64 (0.5.2-1) を展開しています...
以前に未選択のパッケージ python3-pil:amd64 を選択しています。
.../25-python3-pil_4.0.0-4_amd64.deb を展開する準備をしています ...
python3-pil:amd64 (4.0.0-4) を展開しています...
以前に未選択のパッケージ python3-pygments を選択しています。
.../26-python3-pygments_2.2.0+dfsg-1_all.deb を展開する準備をしています ...
python3-pygments (2.2.0+dfsg-1) を展開しています...
libpaper1:amd64 (1.1.24+nmu5) を設定しています ...

Creating config file /etc/papersize with new version
libpaper-utils (1.1.24+nmu5) を設定しています ...
python3-roman (2.0.0-2) を設定しています ...
libjpeg62-turbo:amd64 (1:1.5.1-2) を設定しています ...
docutils-common (0.13.1+dfsg-2) を設定しています ...
liblcms2-2:amd64 (2.8-4) を設定しています ...
libjbig0:amd64 (2.1-3.1+b2) を設定しています ...
python3-six (1.10.0-3) を設定しています ...
python3-colorama (0.3.7-1) を設定しています ...
libtiff5:amd64 (4.0.8-2+deb9u2) を設定しています ...
sgml-base (1.29) のトリガを処理しています ...
python3-pkg-resources (33.1.1-1) を設定しています ...
python3-pyasn1 (0.1.9-2) を設定しています ...
libc-bin (2.24-11+deb9u1) のトリガを処理しています ...
python3-chardet (2.3.0-2) を設定しています ...
shared-mime-info (1.8-1) のトリガを処理しています ...
python3-urllib3 (1.19.1-1) を設定しています ...
python3-jmespath (0.9.0-2) を設定しています ...
python3-dateutil (2.5.3-2) を設定しています ...
libwebp6:amd64 (0.5.2-1) を設定しています ...
python3-pygments (2.2.0+dfsg-1) を設定しています ...
libwebpmux2:amd64 (0.5.2-1) を設定しています ...
python3-rsa (3.4.2-1) を設定しています ...
python3-docutils (0.13.1+dfsg-2) を設定しています ...
update-alternatives: /usr/bin/rst-buildhtml (rst-buildhtml) を提供するために自動モードで /usr/share/docutils/scripts/python3/rst-buildhtml を使います
update-alternatives: /usr/bin/rst2html (rst2html) を提供するために自動モードで /usr/share/docutils/scripts/python3/rst2html を使います
update-alternatives: /usr/bin/rst2html4 (rst2html4) を提供するために自動モードで /usr/share/docutils/scripts/python3/rst2html4 を使います
update-alternatives: /usr/bin/rst2html5 (rst2html5) を提供するために自動モードで /usr/share/docutils/scripts/python3/rst2html5 を使います
update-alternatives: /usr/bin/rst2latex (rst2latex) を提供するために自動モードで /usr/share/docutils/scripts/python3/rst2latex を使います
update-alternatives: /usr/bin/rst2man (rst2man) を提供するために自動モードで /usr/share/docutils/scripts/python3/rst2man を使います
update-alternatives: /usr/bin/rst2odt (rst2odt) を提供するために自動モードで /usr/share/docutils/scripts/python3/rst2odt を使います
update-alternatives: /usr/bin/rst2odt_prepstyles (rst2odt_prepstyles) を提供するために自動モードで /usr/share/docutils/scripts/python3/rst2odt_prepstyles を使います
update-alternatives: /usr/bin/rst2pseudoxml (rst2pseudoxml) を提供するために自動モードで /usr/share/docutils/scripts/python3/rst2pseudoxml を使います
update-alternatives: /usr/bin/rst2s5 (rst2s5) を提供するために自動モードで /usr/share/docutils/scripts/python3/rst2s5 を使います
update-alternatives: /usr/bin/rst2xetex (rst2xetex) を提供するために自動モードで /usr/share/docutils/scripts/python3/rst2xetex を使います
update-alternatives: /usr/bin/rst2xml (rst2xml) を提供するために自動モードで /usr/share/docutils/scripts/python3/rst2xml を使います
update-alternatives: /usr/bin/rstpep2html (rstpep2html) を提供するために自動モードで /usr/share/docutils/scripts/python3/rstpep2html を使います
python3-requests (2.12.4-1) を設定しています ...
libwebpdemux2:amd64 (0.5.2-1) を設定しています ...
python3-pil:amd64 (4.0.0-4) を設定しています ...
python3-botocore (1.4.70-1) を設定しています ...
python3-s3transfer (0.1.9-1) を設定しています ...
awscli (1.11.13-1) を設定しています ...
libc-bin (2.24-11+deb9u1) のトリガを処理しています ...
suda@debian:~$
```

さらにjqをインストールします．

```
suda@debian:~$ sudo apt-get install jq
パッケージリストを読み込んでいます... 完了
依存関係ツリーを作成しています
状態情報を読み取っています... 完了
以下の追加パッケージがインストールされます:
  libjq1 libonig4
以下のパッケージが新たにインストールされます:
  jq libjq1 libonig4
アップグレード: 0 個、新規インストール: 3 個、削除: 0 個、保留: 1 個。
327 kB のアーカイブを取得する必要があります。
この操作後に追加で 1,157 kB のディスク容量が消費されます。
続行しますか? [Y/n]
取得:1 http://ftp.jp.debian.org/debian stretch/main amd64 libonig4 amd64 6.1.3-2 [146 kB]
取得:2 http://ftp.jp.debian.org/debian stretch/main amd64 libjq1 amd64 1.5+dfsg-1.3 [123 kB]
取得:3 http://ftp.jp.debian.org/debian stretch/main amd64 jq amd64 1.5+dfsg-1.3 [58.6 kB]
327 kB を 1秒 で取得しました (212 kB/s)
以前に未選択のパッケージ libonig4:amd64 を選択しています。
(データベースを読み込んでいます ... 現在 57794 個のファイルとディレクトリがインストールされています。)
.../libonig4_6.1.3-2_amd64.deb を展開する準備をしています ...
libonig4:amd64 (6.1.3-2) を展開しています...
以前に未選択のパッケージ libjq1:amd64 を選択しています。
.../libjq1_1.5+dfsg-1.3_amd64.deb を展開する準備をしています ...
libjq1:amd64 (1.5+dfsg-1.3) を展開しています...
以前に未選択のパッケージ jq を選択しています。
.../jq_1.5+dfsg-1.3_amd64.deb を展開する準備をしています ...
jq (1.5+dfsg-1.3) を展開しています...
libonig4:amd64 (6.1.3-2) を設定しています ...
libjq1:amd64 (1.5+dfsg-1.3) を設定しています ...
libc-bin (2.24-11+deb9u1) のトリガを処理しています ...
jq (1.5+dfsg-1.3) を設定しています ...
suda@debian:~$
```

### AWSプロファイルの設定

インストールが終わったので，AWSプロファイルを設定します．

```
suda@debian:~$ aws configure --profile localstack
AWS Access Key ID [None]: dummy
AWS Secret Access Key [None]: dummy
Default region name [None]: us-east-1
Default output format [None]: text
suda@debian:~$
```

## 簡単なFunctionの作成

簡単なLambda Functionを作成して，LocalStack上に登録してみましょう．
やることは，順番に作業ディレクトリの作成，cd，Functionの作成，ZIPで固めるです．

```bash
# ディレクトリの作成
suda@debian:~$ mkdir lambda

# cd
suda@debian:~$ cd lambda

# Functionの作成（内容は次のブロックを参照すること）
suda@debian:~/lambda$ vi lambda.py

# ZIPで固める
suda@debian:~/lambda$ zip lambda.zip lambda.py
  adding: lambda.py (deflated 2%)
suda@debian:~/lambda$
```

ここで作成するFunction（Pythonファイル）は以下の通りとします．
（参考文献のままです）

```python
# サンプルコードです
def lambda_handler(event, context):
    return 'Hello from Lambda'
```

それでは，LocalStack上に登録してみましょう．
ちょっとコマンドが長いですが，間違えずに入力してください．

```
suda@debian:~/lambda$ aws --endpoint-url=http://localhost:4574 --region us-east-1 --profile localstack lambda create-function --function-name="lambda_test" --runtime=python3.6 --role=r1 --handler=lambda.lambda_handler --zip-file fileb://lambda.zip
arn:aws:lambda:us-east-1:000000000000:function:lambda_test	lambda_test	lambda.lambda_handler	r1	python3.6
SECURITYGROUPIDS	None
SUBNETIDS	None
suda@debian:~/lambda$
```

Webブラウザで，先程のダッシュボードのページを確認してください．
登録したLambda Functionが表示されているはずです．

以下のようにして実行してみましょう．
200と表示されるのは，HTTP Status Codeです．
結果は，末尾に付けたファイル名のファイルに入っています．

```
suda@debian:~/lambda$ aws lambda --endpoint-url=http://localhost:4574 --profile localstack invoke --function-name lambda_test --payload '{"key1":"value1", "key2":"value2", "key3":"value3"}' result.log
200
suda@debian:~/lambda$
```

結果を確認してみましょう．

```
suda@debian:~/lambda$ cat result.log
Hello from Lambdasuda@debian:~/lambda$
suda@debian:~/lambda$
```

## node.jsによるLambda

test.js

```
'use strict';

console.log('Loading function');

exports.handler = function( event, context, callback ) {
	console.log( "value1 = " + event.key1 );
	console.log( "value2 = " + event.key2 );
	callback( null, "successfull" );
};
```

設定

```
suda@debian:~/node_lambda$ aws --endpoint-url=http://localhost:4574 --profile localstack lambda create-function --function-name="test" --runtime=nodejs6.10 --role=r1 --handler=test.handler --zip-file fileb://test.zip
arn:aws:lambda:us-east-1:000000000000:function:test	test	test.handler	r1	nodejs6.10
SECURITYGROUPIDS	None
SUBNETIDS	None
suda@debian:~/node_lambda$
```

確認

```
suda@debian:~/node_lambda$ aws lambda --endpoint-url=http://localhost:4574 --profile localstack invoke --function-name test2 --payload '{"key1":"value1", "key2":"value2", "key3":"value3"}' result.log
200
suda@debian:~/node_lambda$
```

## DynamoDB

とりあえず[atlassian 製の AWS モックツール LocalStack をさわってみた](http://maroyaka.hateblo.jp/entry/2017/04/28/175712)を見てその内書く予定．






## 参考文献
