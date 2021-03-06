docker.log
===============

debian9にDockerをインストールするメモ

使用環境
- VirtualBox

## Debianインストールディスクの入手

以下のページから「64 ビット PC netinst iso」をクリックして入手する．
執筆時のバージョンは9.3.0だった．

[Debian を入手するには](https://www.debian.org/distrib/)

## Debianのインストール

VirtualBoxで新規仮想マシンを作り，インストールする．
今回は，下記の設定で行った．

- メモリ：512MB
- HDD：8GB
- 一般ユーザ名：suda

インストールを進めていくと，最後の方でパッケージの選択が有るが，ここでは何も選択しない．

## Debianの起動後のセットアップ

無事に起動したら，まずは一般ユーザでログインして，```su -```でrootになり，以下のパッケージをインストールする．
その後の作業はターミナルからsshで接続すると楽．

- ssh

次に，sudoをインストールする．
此処から先はログを残しておく．

```
root@debian:~# apt-get install sudo
パッケージリストを読み込んでいます... 完了
依存関係ツリーを作成しています
状態情報を読み取っています... 完了
以下のパッケージが新たにインストールされます:
  sudo
アップグレード: 0 個、新規インストール: 1 個、削除: 0 個、保留: 0 個。
1,055 kB のアーカイブを取得する必要があります。
この操作後に追加で 3,108 kB のディスク容量が消費されます。
取得:1 http://ftp.jp.debian.org/debian stretch/main amd64 sudo amd64 1.8.19p1-2.1 [1,055 kB]
1,055 kB を 0秒 で取得しました (1,832 kB/s)
以前に未選択のパッケージ sudo を選択しています。
(データベースを読み込んでいます ... 現在 24379 個のファイルとディレクトリがインストールされています。)
.../sudo_1.8.19p1-2.1_amd64.deb を展開する準備をしています ...
sudo (1.8.19p1-2.1) を展開しています...
sudo (1.8.19p1-2.1) を設定しています ...
systemd (232-25+deb9u1) のトリガを処理しています ...
root@debian:~#
```

続いて，一般ユーザからsudoを使えるようにする．

```
root@debian:~# visudo
```
すると，エディタが開くので，最後の行に以下を追加する．
なお，先頭の```suda```はユーザ名なので，各自の設定に変更すること．

```
suda ALL=(ALL:ALL) ALL
```

これで一般ユーザ（ここではsuda）からsudoを使えるようになったので，以下の作業は一般ユーザで行うこととする．

## Docker CEのインストール

以下を参照しながらインストールする．

[Get Docker CE for Debian](https://docs.docker.com/engine/installation/linux/docker-ce/debian/)

まずはパッケージ情報のupdate．

```
suda@debian:~$ sudo apt-get update
取得:1 http://security.debian.org/debian-security stretch/updates InRelease [63.0 kB]
無視:2 http://ftp.jp.debian.org/debian stretch InRelease
ヒット:3 http://ftp.jp.debian.org/debian stretch-updates InRelease
ヒット:4 http://ftp.jp.debian.org/debian stretch Release
63.0 kB を 2秒 で取得しました (24.1 kB/s)
パッケージリストを読み込んでいます... 完了
suda@debian:~$
```

続いて，リポジトリを登録するために必要なパッケージのインストール．

```
suda@debian:~$ sudo apt-get install \
      apt-transport-https \
      ca-certificates \
      curl \
      gnupg2 \
      software-properties-common
パッケージリストを読み込んでいます... 完了
依存関係ツリーを作成しています
状態情報を読み取っています... 完了
以下の追加パッケージがインストールされます:
  dh-python distro-info-data file gir1.2-glib-2.0 gir1.2-packagekitglib-1.0 iso-codes libcap2-bin libcurl3 libcurl3-gnutls
  libdbus-glib-1-2 libgirepository-1.0-1 libglib2.0-0 libglib2.0-bin libglib2.0-data libgstreamer1.0-0 libicu57
  libldap-2.4-2 libldap-common libmagic-mgc libmagic1 libmpdec2 libnghttp2-14 libpackagekit-glib2-18 libpam-cap
  libpolkit-agent-1-0 libpolkit-backend-1-0 libpolkit-gobject-1-0 libpython3-stdlib libpython3.5-minimal
  libpython3.5-stdlib librtmp1 libsasl2-2 libsasl2-modules libsasl2-modules-db libssh2-1 libxml2 lsb-release mime-support
  openssl packagekit packagekit-tools policykit-1 python-apt-common python3 python3-apt python3-dbus python3-gi
  python3-minimal python3-pycurl python3-software-properties python3.5 python3.5-minimal sgml-base shared-mime-info
  unattended-upgrades xdg-user-dirs xml-core
提案パッケージ:
  libdpkg-perl isoquery gstreamer1.0-tools libsasl2-modules-gssapi-mit | libsasl2-modules-gssapi-heimdal
  libsasl2-modules-ldap libsasl2-modules-otp libsasl2-modules-sql lsb appstream python3-doc python3-tk python3-venv
  python3-apt-dbg python-apt-doc python-dbus-doc python3-dbus-dbg libcurl4-gnutls-dev python-pycurl-doc python3-pycurl-dbg
  python3.5-venv python3.5-doc binutils binfmt-support sgml-base-doc bsd-mailx mail-transport-agent needrestart debhelper
以下のパッケージが新たにインストールされます:
  apt-transport-https ca-certificates curl dh-python distro-info-data file gir1.2-glib-2.0 gir1.2-packagekitglib-1.0 gnupg2
  iso-codes libcap2-bin libcurl3 libcurl3-gnutls libdbus-glib-1-2 libgirepository-1.0-1 libglib2.0-0 libglib2.0-bin
  libglib2.0-data libgstreamer1.0-0 libicu57 libldap-2.4-2 libldap-common libmagic-mgc libmagic1 libmpdec2 libnghttp2-14
  libpackagekit-glib2-18 libpam-cap libpolkit-agent-1-0 libpolkit-backend-1-0 libpolkit-gobject-1-0 libpython3-stdlib
  libpython3.5-minimal libpython3.5-stdlib librtmp1 libsasl2-2 libsasl2-modules libsasl2-modules-db libssh2-1 libxml2
  lsb-release mime-support openssl packagekit packagekit-tools policykit-1 python-apt-common python3 python3-apt
  python3-dbus python3-gi python3-minimal python3-pycurl python3-software-properties python3.5 python3.5-minimal sgml-base
  shared-mime-info software-properties-common unattended-upgrades xdg-user-dirs xml-core
アップグレード: 0 個、新規インストール: 62 個、削除: 0 個、保留: 1 個。
31.6 MB のアーカイブを取得する必要があります。
この操作後に追加で 123 MB のディスク容量が消費されます。
続行しますか? [Y/n]
取得:1 http://ftp.jp.debian.org/debian stretch/main amd64 libpython3.5-minimal amd64 3.5.3-1+deb9u1 [573 kB]
取得:2 http://security.debian.org/debian-security stretch/updates/main amd64 libmagic-mgc amd64 1:5.30-1+deb9u3 [222 kB]
取得:3 http://ftp.jp.debian.org/debian stretch/main amd64 python3.5-minimal amd64 3.5.3-1+deb9u1 [1,691 kB]
取得:4 http://security.debian.org/debian-security stretch/updates/main amd64 libmagic1 amd64 1:5.30-1+deb9u3 [111 kB]
取得:5 http://security.debian.org/debian-security stretch/updates/main amd64 file amd64 1:5.30-1+deb9u3 [64.2 kB]
取得:6 http://security.debian.org/debian-security stretch/updates/main amd64 libsasl2-modules-db amd64 2.1.27~101-g0780600+dfsg-3+deb9u1 [68.4 kB]
取得:7 http://ftp.jp.debian.org/debian stretch/main amd64 python3-minimal amd64 3.5.3-1 [35.3 kB]
取得:8 http://security.debian.org/debian-security stretch/updates/main amd64 libsasl2-2 amd64 2.1.27~101-g0780600+dfsg-3+deb9u1 [105 kB]
取得:9 http://ftp.jp.debian.org/debian stretch/main amd64 mime-support all 3.60 [36.7 kB]
取得:10 http://ftp.jp.debian.org/debian stretch/main amd64 libmpdec2 amd64 2.4.2-1 [85.2 kB]
取得:11 http://ftp.jp.debian.org/debian stretch/main amd64 libpython3.5-stdlib amd64 3.5.3-1+deb9u1 [2,167 kB]
取得:12 http://security.debian.org/debian-security stretch/updates/main amd64 libnghttp2-14 amd64 1.18.1-1+deb9u1 [79.2 kB]
取得:13 http://security.debian.org/debian-security stretch/updates/main amd64 openssl amd64 1.1.0l-1~deb9u1 [749 kB]
取得:14 http://security.debian.org/debian-security stretch/updates/main amd64 libsasl2-modules amd64 2.1.27~101-g0780600+dfsg-3+deb9u1 [102 kB]
取得:15 http://ftp.jp.debian.org/debian stretch/main amd64 python3.5 amd64 3.5.3-1+deb9u1 [229 kB]
取得:16 http://ftp.jp.debian.org/debian stretch/main amd64 libpython3-stdlib amd64 3.5.3-1 [18.6 kB]
取得:17 http://ftp.jp.debian.org/debian stretch/main amd64 dh-python all 2.20170125 [86.8 kB]
取得:18 http://ftp.jp.debian.org/debian stretch/main amd64 python3 amd64 3.5.3-1 [21.6 kB]
取得:19 http://ftp.jp.debian.org/debian stretch/main amd64 sgml-base all 1.29 [14.8 kB]
取得:20 http://ftp.jp.debian.org/debian stretch/main amd64 libldap-common all 2.4.44+dfsg-5+deb9u3 [85.7 kB]
取得:21 http://ftp.jp.debian.org/debian stretch/main amd64 libldap-2.4-2 amd64 2.4.44+dfsg-5+deb9u3 [220 kB]
取得:22 http://ftp.jp.debian.org/debian stretch/main amd64 libicu57 amd64 57.1-6+deb9u3 [7,705 kB]
取得:23 http://ftp.jp.debian.org/debian stretch/main amd64 libxml2 amd64 2.9.4+dfsg1-2.2+deb9u2 [920 kB]
取得:24 http://ftp.jp.debian.org/debian stretch/main amd64 librtmp1 amd64 2.4+20151223.gitfa8646d.1-1+b1 [60.4 kB]
取得:25 http://ftp.jp.debian.org/debian stretch/main amd64 libssh2-1 amd64 1.7.0-1+deb9u1 [139 kB]
取得:26 http://ftp.jp.debian.org/debian stretch/main amd64 libcurl3-gnutls amd64 7.52.1-5+deb9u9 [290 kB]
取得:27 http://ftp.jp.debian.org/debian stretch/main amd64 apt-transport-https amd64 1.4.9 [171 kB]
取得:28 http://ftp.jp.debian.org/debian stretch/main amd64 ca-certificates all 20161130+nmu1+deb9u1 [182 kB]
取得:29 http://ftp.jp.debian.org/debian stretch/main amd64 libcurl3 amd64 7.52.1-5+deb9u9 [292 kB]
取得:30 http://ftp.jp.debian.org/debian stretch/main amd64 curl amd64 7.52.1-5+deb9u9 [227 kB]
取得:31 http://ftp.jp.debian.org/debian stretch/main amd64 distro-info-data all 0.36 [5,810 B]
取得:32 http://ftp.jp.debian.org/debian stretch/main amd64 libglib2.0-0 amd64 2.50.3-2+deb9u1 [2,691 kB]
取得:33 http://ftp.jp.debian.org/debian stretch/main amd64 libgirepository-1.0-1 amd64 1.50.0-1+b1 [89.0 kB]
取得:34 http://ftp.jp.debian.org/debian stretch/main amd64 gir1.2-glib-2.0 amd64 1.50.0-1+b1 [139 kB]
取得:35 http://ftp.jp.debian.org/debian stretch/main amd64 libpackagekit-glib2-18 amd64 1.1.5-2+deb9u1 [114 kB]
取得:36 http://ftp.jp.debian.org/debian stretch/main amd64 gir1.2-packagekitglib-1.0 amd64 1.1.5-2+deb9u1 [34.7 kB]
取得:37 http://ftp.jp.debian.org/debian stretch/main amd64 gnupg2 all 2.1.18-8~deb9u4 [299 kB]
取得:38 http://ftp.jp.debian.org/debian stretch/main amd64 iso-codes all 3.75-1 [2,389 kB]
取得:39 http://ftp.jp.debian.org/debian stretch/main amd64 libcap2-bin amd64 1:2.25-1 [26.5 kB]
取得:40 http://ftp.jp.debian.org/debian stretch/main amd64 libdbus-glib-1-2 amd64 0.108-2 [206 kB]
取得:41 http://ftp.jp.debian.org/debian stretch/main amd64 libglib2.0-data all 2.50.3-2+deb9u1 [2,518 kB]
取得:42 http://ftp.jp.debian.org/debian stretch/main amd64 libglib2.0-bin amd64 2.50.3-2+deb9u1 [1,615 kB]
取得:43 http://ftp.jp.debian.org/debian stretch/main amd64 libgstreamer1.0-0 amd64 1.10.4-1 [1,962 kB]
取得:44 http://ftp.jp.debian.org/debian stretch/main amd64 libpam-cap amd64 1:2.25-1 [13.5 kB]
取得:45 http://ftp.jp.debian.org/debian stretch/main amd64 libpolkit-gobject-1-0 amd64 0.105-18+deb9u1 [43.8 kB]
取得:46 http://ftp.jp.debian.org/debian stretch/main amd64 libpolkit-agent-1-0 amd64 0.105-18+deb9u1 [24.4 kB]
取得:47 http://ftp.jp.debian.org/debian stretch/main amd64 libpolkit-backend-1-0 amd64 0.105-18+deb9u1 [45.7 kB]
取得:48 http://ftp.jp.debian.org/debian stretch/main amd64 lsb-release all 9.20161125 [27.1 kB]
取得:49 http://ftp.jp.debian.org/debian stretch/main amd64 policykit-1 amd64 0.105-18+deb9u1 [63.5 kB]
取得:50 http://ftp.jp.debian.org/debian stretch/main amd64 packagekit amd64 1.1.5-2+deb9u1 [546 kB]
取得:51 http://ftp.jp.debian.org/debian stretch/main amd64 packagekit-tools amd64 1.1.5-2+deb9u1 [45.3 kB]
取得:52 http://ftp.jp.debian.org/debian stretch/main amd64 python-apt-common all 1.4.0~beta3 [93.0 kB]
取得:53 http://ftp.jp.debian.org/debian stretch/main amd64 python3-apt amd64 1.4.0~beta3 [170 kB]
取得:54 http://ftp.jp.debian.org/debian stretch/main amd64 python3-dbus amd64 1.2.4-1+b1 [184 kB]
取得:55 http://ftp.jp.debian.org/debian stretch/main amd64 python3-gi amd64 3.22.0-2 [473 kB]
取得:56 http://ftp.jp.debian.org/debian stretch/main amd64 python3-pycurl amd64 7.43.0-2 [61.3 kB]
取得:57 http://ftp.jp.debian.org/debian stretch/main amd64 python3-software-properties all 0.96.20.2-1 [49.5 kB]
取得:58 http://ftp.jp.debian.org/debian stretch/main amd64 shared-mime-info amd64 1.8-1+deb9u1 [731 kB]
取得:59 http://ftp.jp.debian.org/debian stretch/main amd64 software-properties-common all 0.96.20.2-1 [83.6 kB]
取得:60 http://ftp.jp.debian.org/debian stretch/main amd64 unattended-upgrades all 0.93.1+nmu1 [61.7 kB]
取得:61 http://ftp.jp.debian.org/debian stretch/main amd64 xdg-user-dirs amd64 0.15-2+b1 [52.2 kB]
取得:62 http://ftp.jp.debian.org/debian stretch/main amd64 xml-core all 0.17 [23.2 kB]
31.6 MB を 7秒 で取得しました (4,505 kB/s)
パッケージからテンプレートを展開しています: 100%
パッケージを事前設定しています ...
以前に未選択のパッケージ libpython3.5-minimal:amd64 を選択しています。
(データベースを読み込んでいます ... 現在 24485 個のファイルとディレクトリがインストールされています。)
.../0-libpython3.5-minimal_3.5.3-1+deb9u1_amd64.deb を展開する準備をしています ...
libpython3.5-minimal:amd64 (3.5.3-1+deb9u1) を展開しています...
以前に未選択のパッケージ python3.5-minimal を選択しています。
.../1-python3.5-minimal_3.5.3-1+deb9u1_amd64.deb を展開する準備をしています ...
python3.5-minimal (3.5.3-1+deb9u1) を展開しています...
以前に未選択のパッケージ python3-minimal を選択しています。
.../2-python3-minimal_3.5.3-1_amd64.deb を展開する準備をしています ...
python3-minimal (3.5.3-1) を展開しています...
以前に未選択のパッケージ mime-support を選択しています。
.../3-mime-support_3.60_all.deb を展開する準備をしています ...
mime-support (3.60) を展開しています...
以前に未選択のパッケージ libmpdec2:amd64 を選択しています。
.../4-libmpdec2_2.4.2-1_amd64.deb を展開する準備をしています ...
libmpdec2:amd64 (2.4.2-1) を展開しています...
以前に未選択のパッケージ libpython3.5-stdlib:amd64 を選択しています。
.../5-libpython3.5-stdlib_3.5.3-1+deb9u1_amd64.deb を展開する準備をしています ...
libpython3.5-stdlib:amd64 (3.5.3-1+deb9u1) を展開しています...
以前に未選択のパッケージ python3.5 を選択しています。
.../6-python3.5_3.5.3-1+deb9u1_amd64.deb を展開する準備をしています ...
python3.5 (3.5.3-1+deb9u1) を展開しています...
以前に未選択のパッケージ libpython3-stdlib:amd64 を選択しています。
.../7-libpython3-stdlib_3.5.3-1_amd64.deb を展開する準備をしています ...
libpython3-stdlib:amd64 (3.5.3-1) を展開しています...
以前に未選択のパッケージ dh-python を選択しています。
.../8-dh-python_2.20170125_all.deb を展開する準備をしています ...
dh-python (2.20170125) を展開しています...
libpython3.5-minimal:amd64 (3.5.3-1+deb9u1) を設定しています ...
python3.5-minimal (3.5.3-1+deb9u1) を設定しています ...
python3-minimal (3.5.3-1) を設定しています ...
以前に未選択のパッケージ python3 を選択しています。
(データベースを読み込んでいます ... 現在 25428 個のファイルとディレクトリがインストールされています。)
.../00-python3_3.5.3-1_amd64.deb を展開する準備をしています ...
python3 (3.5.3-1) を展開しています...
以前に未選択のパッケージ sgml-base を選択しています。
.../01-sgml-base_1.29_all.deb を展開する準備をしています ...
sgml-base (1.29) を展開しています...
以前に未選択のパッケージ libmagic-mgc を選択しています。
.../02-libmagic-mgc_1%3a5.30-1+deb9u3_amd64.deb を展開する準備をしています ...
libmagic-mgc (1:5.30-1+deb9u3) を展開しています...
以前に未選択のパッケージ libmagic1:amd64 を選択しています。
.../03-libmagic1_1%3a5.30-1+deb9u3_amd64.deb を展開する準備をしています ...
libmagic1:amd64 (1:5.30-1+deb9u3) を展開しています...
以前に未選択のパッケージ file を選択しています。
.../04-file_1%3a5.30-1+deb9u3_amd64.deb を展開する準備をしています ...
file (1:5.30-1+deb9u3) を展開しています...
以前に未選択のパッケージ libsasl2-modules-db:amd64 を選択しています。
.../05-libsasl2-modules-db_2.1.27~101-g0780600+dfsg-3+deb9u1_amd64.deb を展開する準備をしています ...
libsasl2-modules-db:amd64 (2.1.27~101-g0780600+dfsg-3+deb9u1) を展開しています...
以前に未選択のパッケージ libsasl2-2:amd64 を選択しています。
.../06-libsasl2-2_2.1.27~101-g0780600+dfsg-3+deb9u1_amd64.deb を展開する準備をしています ...
libsasl2-2:amd64 (2.1.27~101-g0780600+dfsg-3+deb9u1) を展開しています...
以前に未選択のパッケージ libldap-common を選択しています。
.../07-libldap-common_2.4.44+dfsg-5+deb9u3_all.deb を展開する準備をしています ...
libldap-common (2.4.44+dfsg-5+deb9u3) を展開しています...
以前に未選択のパッケージ libldap-2.4-2:amd64 を選択しています。
.../08-libldap-2.4-2_2.4.44+dfsg-5+deb9u3_amd64.deb を展開する準備をしています ...
libldap-2.4-2:amd64 (2.4.44+dfsg-5+deb9u3) を展開しています...
以前に未選択のパッケージ libicu57:amd64 を選択しています。
.../09-libicu57_57.1-6+deb9u3_amd64.deb を展開する準備をしています ...
libicu57:amd64 (57.1-6+deb9u3) を展開しています...
以前に未選択のパッケージ libxml2:amd64 を選択しています。
.../10-libxml2_2.9.4+dfsg1-2.2+deb9u2_amd64.deb を展開する準備をしています ...
libxml2:amd64 (2.9.4+dfsg1-2.2+deb9u2) を展開しています...
以前に未選択のパッケージ libnghttp2-14:amd64 を選択しています。
.../11-libnghttp2-14_1.18.1-1+deb9u1_amd64.deb を展開する準備をしています ...
libnghttp2-14:amd64 (1.18.1-1+deb9u1) を展開しています...
以前に未選択のパッケージ librtmp1:amd64 を選択しています。
.../12-librtmp1_2.4+20151223.gitfa8646d.1-1+b1_amd64.deb を展開する準備をしています ...
librtmp1:amd64 (2.4+20151223.gitfa8646d.1-1+b1) を展開しています...
以前に未選択のパッケージ libssh2-1:amd64 を選択しています。
.../13-libssh2-1_1.7.0-1+deb9u1_amd64.deb を展開する準備をしています ...
libssh2-1:amd64 (1.7.0-1+deb9u1) を展開しています...
以前に未選択のパッケージ libcurl3-gnutls:amd64 を選択しています。
.../14-libcurl3-gnutls_7.52.1-5+deb9u9_amd64.deb を展開する準備をしています ...
libcurl3-gnutls:amd64 (7.52.1-5+deb9u9) を展開しています...
以前に未選択のパッケージ apt-transport-https を選択しています。
.../15-apt-transport-https_1.4.9_amd64.deb を展開する準備をしています ...
apt-transport-https (1.4.9) を展開しています...
以前に未選択のパッケージ openssl を選択しています。
.../16-openssl_1.1.0l-1~deb9u1_amd64.deb を展開する準備をしています ...
openssl (1.1.0l-1~deb9u1) を展開しています...
以前に未選択のパッケージ ca-certificates を選択しています。
.../17-ca-certificates_20161130+nmu1+deb9u1_all.deb を展開する準備をしています ...
ca-certificates (20161130+nmu1+deb9u1) を展開しています...
以前に未選択のパッケージ libcurl3:amd64 を選択しています。
.../18-libcurl3_7.52.1-5+deb9u9_amd64.deb を展開する準備をしています ...
libcurl3:amd64 (7.52.1-5+deb9u9) を展開しています...
以前に未選択のパッケージ curl を選択しています。
.../19-curl_7.52.1-5+deb9u9_amd64.deb を展開する準備をしています ...
curl (7.52.1-5+deb9u9) を展開しています...
以前に未選択のパッケージ distro-info-data を選択しています。
.../20-distro-info-data_0.36_all.deb を展開する準備をしています ...
distro-info-data (0.36) を展開しています...
以前に未選択のパッケージ libglib2.0-0:amd64 を選択しています。
.../21-libglib2.0-0_2.50.3-2+deb9u1_amd64.deb を展開する準備をしています ...
libglib2.0-0:amd64 (2.50.3-2+deb9u1) を展開しています...
以前に未選択のパッケージ libgirepository-1.0-1:amd64 を選択しています。
.../22-libgirepository-1.0-1_1.50.0-1+b1_amd64.deb を展開する準備をしています ...
libgirepository-1.0-1:amd64 (1.50.0-1+b1) を展開しています...
以前に未選択のパッケージ gir1.2-glib-2.0:amd64 を選択しています。
.../23-gir1.2-glib-2.0_1.50.0-1+b1_amd64.deb を展開する準備をしています ...
gir1.2-glib-2.0:amd64 (1.50.0-1+b1) を展開しています...
以前に未選択のパッケージ libpackagekit-glib2-18:amd64 を選択しています。
.../24-libpackagekit-glib2-18_1.1.5-2+deb9u1_amd64.deb を展開する準備をしています ...
libpackagekit-glib2-18:amd64 (1.1.5-2+deb9u1) を展開しています...
以前に未選択のパッケージ gir1.2-packagekitglib-1.0 を選択しています。
.../25-gir1.2-packagekitglib-1.0_1.1.5-2+deb9u1_amd64.deb を展開する準備をしています ...
gir1.2-packagekitglib-1.0 (1.1.5-2+deb9u1) を展開しています...
以前に未選択のパッケージ gnupg2 を選択しています。
.../26-gnupg2_2.1.18-8~deb9u4_all.deb を展開する準備をしています ...
gnupg2 (2.1.18-8~deb9u4) を展開しています...
以前に未選択のパッケージ iso-codes を選択しています。
.../27-iso-codes_3.75-1_all.deb を展開する準備をしています ...
iso-codes (3.75-1) を展開しています...
以前に未選択のパッケージ libcap2-bin を選択しています。
.../28-libcap2-bin_1%3a2.25-1_amd64.deb を展開する準備をしています ...
libcap2-bin (1:2.25-1) を展開しています...
以前に未選択のパッケージ libdbus-glib-1-2:amd64 を選択しています。
.../29-libdbus-glib-1-2_0.108-2_amd64.deb を展開する準備をしています ...
libdbus-glib-1-2:amd64 (0.108-2) を展開しています...
以前に未選択のパッケージ libglib2.0-data を選択しています。
.../30-libglib2.0-data_2.50.3-2+deb9u1_all.deb を展開する準備をしています ...
libglib2.0-data (2.50.3-2+deb9u1) を展開しています...
以前に未選択のパッケージ libglib2.0-bin を選択しています。
.../31-libglib2.0-bin_2.50.3-2+deb9u1_amd64.deb を展開する準備をしています ...
libglib2.0-bin (2.50.3-2+deb9u1) を展開しています...
以前に未選択のパッケージ libgstreamer1.0-0:amd64 を選択しています。
.../32-libgstreamer1.0-0_1.10.4-1_amd64.deb を展開する準備をしています ...
libgstreamer1.0-0:amd64 (1.10.4-1) を展開しています...
以前に未選択のパッケージ libpam-cap:amd64 を選択しています。
.../33-libpam-cap_1%3a2.25-1_amd64.deb を展開する準備をしています ...
libpam-cap:amd64 (1:2.25-1) を展開しています...
以前に未選択のパッケージ libpolkit-gobject-1-0:amd64 を選択しています。
.../34-libpolkit-gobject-1-0_0.105-18+deb9u1_amd64.deb を展開する準備をしています ...
libpolkit-gobject-1-0:amd64 (0.105-18+deb9u1) を展開しています...
以前に未選択のパッケージ libpolkit-agent-1-0:amd64 を選択しています。
.../35-libpolkit-agent-1-0_0.105-18+deb9u1_amd64.deb を展開する準備をしています ...
libpolkit-agent-1-0:amd64 (0.105-18+deb9u1) を展開しています...
以前に未選択のパッケージ libpolkit-backend-1-0:amd64 を選択しています。
.../36-libpolkit-backend-1-0_0.105-18+deb9u1_amd64.deb を展開する準備をしています ...
libpolkit-backend-1-0:amd64 (0.105-18+deb9u1) を展開しています...
以前に未選択のパッケージ libsasl2-modules:amd64 を選択しています。
.../37-libsasl2-modules_2.1.27~101-g0780600+dfsg-3+deb9u1_amd64.deb を展開する準備をしています ...
libsasl2-modules:amd64 (2.1.27~101-g0780600+dfsg-3+deb9u1) を展開しています...
以前に未選択のパッケージ lsb-release を選択しています。
.../38-lsb-release_9.20161125_all.deb を展開する準備をしています ...
lsb-release (9.20161125) を展開しています...
以前に未選択のパッケージ policykit-1 を選択しています。
.../39-policykit-1_0.105-18+deb9u1_amd64.deb を展開する準備をしています ...
Unit polkit.service does not exist, proceeding anyway.
Created symlink /run/systemd/system/polkit.service → /dev/null.
policykit-1 (0.105-18+deb9u1) を展開しています...
以前に未選択のパッケージ packagekit を選択しています。
.../40-packagekit_1.1.5-2+deb9u1_amd64.deb を展開する準備をしています ...
packagekit (1.1.5-2+deb9u1) を展開しています...
以前に未選択のパッケージ packagekit-tools を選択しています。
.../41-packagekit-tools_1.1.5-2+deb9u1_amd64.deb を展開する準備をしています ...
packagekit-tools (1.1.5-2+deb9u1) を展開しています...
以前に未選択のパッケージ python-apt-common を選択しています。
.../42-python-apt-common_1.4.0~beta3_all.deb を展開する準備をしています ...
python-apt-common (1.4.0~beta3) を展開しています...
以前に未選択のパッケージ python3-apt を選択しています。
.../43-python3-apt_1.4.0~beta3_amd64.deb を展開する準備をしています ...
python3-apt (1.4.0~beta3) を展開しています...
以前に未選択のパッケージ python3-dbus を選択しています。
.../44-python3-dbus_1.2.4-1+b1_amd64.deb を展開する準備をしています ...
python3-dbus (1.2.4-1+b1) を展開しています...
以前に未選択のパッケージ python3-gi を選択しています。
.../45-python3-gi_3.22.0-2_amd64.deb を展開する準備をしています ...
python3-gi (3.22.0-2) を展開しています...
以前に未選択のパッケージ python3-pycurl を選択しています。
.../46-python3-pycurl_7.43.0-2_amd64.deb を展開する準備をしています ...
python3-pycurl (7.43.0-2) を展開しています...
以前に未選択のパッケージ python3-software-properties を選択しています。
.../47-python3-software-properties_0.96.20.2-1_all.deb を展開する準備をしています ...
python3-software-properties (0.96.20.2-1) を展開しています...
以前に未選択のパッケージ shared-mime-info を選択しています。
.../48-shared-mime-info_1.8-1+deb9u1_amd64.deb を展開する準備をしています ...
shared-mime-info (1.8-1+deb9u1) を展開しています...
以前に未選択のパッケージ software-properties-common を選択しています。
.../49-software-properties-common_0.96.20.2-1_all.deb を展開する準備をしています ...
software-properties-common (0.96.20.2-1) を展開しています...
以前に未選択のパッケージ unattended-upgrades を選択しています。
.../50-unattended-upgrades_0.93.1+nmu1_all.deb を展開する準備をしています ...
unattended-upgrades (0.93.1+nmu1) を展開しています...
以前に未選択のパッケージ xdg-user-dirs を選択しています。
.../51-xdg-user-dirs_0.15-2+b1_amd64.deb を展開する準備をしています ...
xdg-user-dirs (0.15-2+b1) を展開しています...
以前に未選択のパッケージ xml-core を選択しています。
.../52-xml-core_0.17_all.deb を展開する準備をしています ...
xml-core (0.17) を展開しています...
python-apt-common (1.4.0~beta3) を設定しています ...
libpam-cap:amd64 (1:2.25-1) を設定しています ...
libnghttp2-14:amd64 (1.18.1-1+deb9u1) を設定しています ...
mime-support (3.60) を設定しています ...
iso-codes (3.75-1) を設定しています ...
libldap-common (2.4.44+dfsg-5+deb9u3) を設定しています ...
libcap2-bin (1:2.25-1) を設定しています ...
libglib2.0-0:amd64 (2.50.3-2+deb9u1) を設定しています ...
スキーマファイルが見つかりません: 何もしません。
libsasl2-modules-db:amd64 (2.1.27~101-g0780600+dfsg-3+deb9u1) を設定しています ...
libsasl2-2:amd64 (2.1.27~101-g0780600+dfsg-3+deb9u1) を設定しています ...
distro-info-data (0.36) を設定しています ...
librtmp1:amd64 (2.4+20151223.gitfa8646d.1-1+b1) を設定しています ...
libpackagekit-glib2-18:amd64 (1.1.5-2+deb9u1) を設定しています ...
sgml-base (1.29) を設定しています ...
libicu57:amd64 (57.1-6+deb9u3) を設定しています ...
libgirepository-1.0-1:amd64 (1.50.0-1+b1) を設定しています ...
libxml2:amd64 (2.9.4+dfsg1-2.2+deb9u2) を設定しています ...
libmagic-mgc (1:5.30-1+deb9u3) を設定しています ...
libmagic1:amd64 (1:5.30-1+deb9u3) を設定しています ...
gnupg2 (2.1.18-8~deb9u4) を設定しています ...
gir1.2-glib-2.0:amd64 (1.50.0-1+b1) を設定しています ...
libssh2-1:amd64 (1.7.0-1+deb9u1) を設定しています ...
libglib2.0-data (2.50.3-2+deb9u1) を設定しています ...
libc-bin (2.24-11+deb9u4) のトリガを処理しています ...
libldap-2.4-2:amd64 (2.4.44+dfsg-5+deb9u3) を設定しています ...
systemd (232-25+deb9u12) のトリガを処理しています ...
openssl (1.1.0l-1~deb9u1) を設定しています ...
shared-mime-info (1.8-1+deb9u1) を設定しています ...
gir1.2-packagekitglib-1.0 (1.1.5-2+deb9u1) を設定しています ...
xml-core (0.17) を設定しています ...
dbus (1.10.28-0+deb9u1) のトリガを処理しています ...
libsasl2-modules:amd64 (2.1.27~101-g0780600+dfsg-3+deb9u1) を設定しています ...
ca-certificates (20161130+nmu1+deb9u1) を設定しています ...
Updating certificates in /etc/ssl/certs...
151 added, 0 removed; done.
libglib2.0-bin (2.50.3-2+deb9u1) を設定しています ...
xdg-user-dirs (0.15-2+b1) を設定しています ...
libmpdec2:amd64 (2.4.2-1) を設定しています ...
libpolkit-gobject-1-0:amd64 (0.105-18+deb9u1) を設定しています ...
libgstreamer1.0-0:amd64 (1.10.4-1) を設定しています ...
Setcap worked! gst-ptp-helper is not suid!
libcurl3:amd64 (7.52.1-5+deb9u9) を設定しています ...
libdbus-glib-1-2:amd64 (0.108-2) を設定しています ...
libpolkit-agent-1-0:amd64 (0.105-18+deb9u1) を設定しています ...
libcurl3-gnutls:amd64 (7.52.1-5+deb9u9) を設定しています ...
libpython3.5-stdlib:amd64 (3.5.3-1+deb9u1) を設定しています ...
file (1:5.30-1+deb9u3) を設定しています ...
libpolkit-backend-1-0:amd64 (0.105-18+deb9u1) を設定しています ...
python3.5 (3.5.3-1+deb9u1) を設定しています ...
libpython3-stdlib:amd64 (3.5.3-1) を設定しています ...
apt-transport-https (1.4.9) を設定しています ...
curl (7.52.1-5+deb9u9) を設定しています ...
policykit-1 (0.105-18+deb9u1) を設定しています ...
Removed /run/systemd/system/polkit.service.
polkit.service is a disabled or a static unit not running, not starting it.
packagekit (1.1.5-2+deb9u1) を設定しています ...
packagekit-tools (1.1.5-2+deb9u1) を設定しています ...
python3 (3.5.3-1) を設定しています ...
running python rtupdate hooks for python3.5...
running python post-rtupdate hooks for python3.5...
python3-gi (3.22.0-2) を設定しています ...
lsb-release (9.20161125) を設定しています ...
dh-python (2.20170125) を設定しています ...
python3-pycurl (7.43.0-2) を設定しています ...
python3-apt (1.4.0~beta3) を設定しています ...
python3-dbus (1.2.4-1+b1) を設定しています ...
unattended-upgrades (0.93.1+nmu1) を設定しています ...

Creating config file /etc/apt/apt.conf.d/20auto-upgrades with new version

Creating config file /etc/apt/apt.conf.d/50unattended-upgrades with new version
Created symlink /etc/systemd/system/multi-user.target.wants/unattended-upgrades.service → /lib/systemd/system/unattended-upgrades.service.
Synchronizing state of unattended-upgrades.service with SysV service script with /lib/systemd/systemd-sysv-install.
Executing: /lib/systemd/systemd-sysv-install enable unattended-upgrades
python3-software-properties (0.96.20.2-1) を設定しています ...
software-properties-common (0.96.20.2-1) を設定しています ...
libc-bin (2.24-11+deb9u4) のトリガを処理しています ...
sgml-base (1.29) のトリガを処理しています ...
ca-certificates (20161130+nmu1+deb9u1) のトリガを処理しています ...
Updating certificates in /etc/ssl/certs...
0 added, 0 removed; done.
Running hooks in /etc/ca-certificates/update.d...
done.
dbus (1.10.28-0+deb9u1) のトリガを処理しています ...
systemd (232-25+deb9u12) のトリガを処理しています ...
suda@debian:~$
```

続いて，Docker社のGPGキーを入手する．

```
suda@debian:~$ curl -fsSL https://download.docker.com/linux/$(. /etc/os-release; echo "$ID")/gpg | sudo apt-key add -
OK
suda@debian:~$
```

念のため，キーの内容を確認する．
以下のように表示されればOK．

```
suda@debian:~$ sudo apt-key fingerprint 0EBFCD88
pub   rsa4096 2017-02-22 [SCEA]
      9DC8 5822 9FC7 DD38 854A  E2D8 8D81 803C 0EBF CD88
uid           [ unknown] Docker Release (CE deb) <docker@docker.com>
sub   rsa4096 2017-02-22 [S]

suda@debian:~$
```

リポジトリの追加を行う．

```
suda@debian:~$ sudo add-apt-repository \
    "deb [arch=amd64] https://download.docker.com/linux/$(. /etc/os-release; echo "$ID") \
    $(lsb_release -cs) \
    stable"
suda@debian:~$
```

パッケージ情報のアップデート．

```
suda@debian:~$ sudo apt-get update
ヒット:1 http://security.debian.org/debian-security stretch/updates InRelease
無視:2 http://ftp.jp.debian.org/debian stretch InRelease
ヒット:3 http://ftp.jp.debian.org/debian stretch-updates InRelease
ヒット:4 http://ftp.jp.debian.org/debian stretch Release
取得:5 https://download.docker.com/linux/debian stretch InRelease [44.8 kB]
取得:7 https://download.docker.com/linux/debian stretch/stable amd64 Packages [11.9 kB]
56.7 kB を 0秒 で取得しました (159 kB/s)
パッケージリストを読み込んでいます... 完了
suda@debian:~$
```

Dockerのインストール．関連パッケージをインストールしてよいか聞かれるので，yを答える．

```
suda@debian:~$ sudo apt-get install docker-ce
パッケージリストを読み込んでいます... 完了
依存関係ツリーを作成しています
状態情報を読み取っています... 完了
以下の追加パッケージがインストールされます:
  aufs-dkms aufs-tools binutils cgroupfs-mount containerd.io cpp cpp-6 dkms docker-ce-cli fakeroot gcc gcc-6 git git-man
  less libasan3 libatomic1 libc-dev-bin libc6-dev libcc1-0 libcilkrts5 liberror-perl libfakeroot libgcc-6-dev libgomp1
  libisl15 libitm1 liblsan0 libltdl7 libmpc3 libmpfr4 libmpx2 libquadmath0 libtsan0 libubsan0 linux-compiler-gcc-6-x86
  linux-headers-4.9.0-11-amd64 linux-headers-4.9.0-11-common linux-headers-amd64 linux-kbuild-4.9 linux-libc-dev make
  manpages manpages-dev patch pigz rsync
提案パッケージ:
  aufs-dev binutils-doc cpp-doc gcc-6-locales python3-apport menu gcc-multilib autoconf automake libtool flex bison gdb
  gcc-doc gcc-6-multilib gcc-6-doc libgcc1-dbg libgomp1-dbg libitm1-dbg libatomic1-dbg libasan3-dbg liblsan0-dbg
  libtsan0-dbg libubsan0-dbg libcilkrts5-dbg libmpx2-dbg libquadmath0-dbg git-daemon-run | git-daemon-sysvinit git-doc
  git-el git-email git-gui gitk gitweb git-arch git-cvs git-mediawiki git-svn glibc-doc make-doc man-browser ed
  diffutils-doc
以下のパッケージが新たにインストールされます:
  aufs-dkms aufs-tools binutils cgroupfs-mount containerd.io cpp cpp-6 dkms docker-ce docker-ce-cli fakeroot gcc gcc-6 git
  git-man less libasan3 libatomic1 libc-dev-bin libc6-dev libcc1-0 libcilkrts5 liberror-perl libfakeroot libgcc-6-dev
  libgomp1 libisl15 libitm1 liblsan0 libltdl7 libmpc3 libmpfr4 libmpx2 libquadmath0 libtsan0 libubsan0
  linux-compiler-gcc-6-x86 linux-headers-4.9.0-11-amd64 linux-headers-4.9.0-11-common linux-headers-amd64 linux-kbuild-4.9
  linux-libc-dev make manpages manpages-dev patch pigz rsync
アップグレード: 0 個、新規インストール: 48 個、削除: 0 個、保留: 1 個。
132 MB のアーカイブを取得する必要があります。
この操作後に追加で 591 MB のディスク容量が消費されます。
続行しますか? [Y/n]
取得:1 http://security.debian.org/debian-security stretch/updates/main amd64 git-man all 1:2.11.0-3+deb9u5 [1,433 kB]
取得:2 http://ftp.jp.debian.org/debian stretch/main amd64 liberror-perl all 0.17024-1 [26.9 kB]
取得:3 https://download.docker.com/linux/debian stretch/stable amd64 containerd.io amd64 1.2.10-3 [20.0 MB]
取得:4 http://ftp.jp.debian.org/debian stretch/main amd64 pigz amd64 2.3.4-1 [55.4 kB]
取得:5 http://ftp.jp.debian.org/debian stretch/main amd64 less amd64 481-2.1 [126 kB]
取得:6 http://ftp.jp.debian.org/debian stretch/main amd64 manpages all 4.10-2 [1,222 kB]
取得:7 http://security.debian.org/debian-security stretch/updates/main amd64 git amd64 1:2.11.0-3+deb9u5 [4,161 kB]
取得:8 http://ftp.jp.debian.org/debian stretch/main amd64 libisl15 amd64 0.18-1 [564 kB]
取得:9 http://security.debian.org/debian-security stretch/updates/main amd64 linux-kbuild-4.9 amd64 4.9.189-3+deb9u2 [862 kB]
取得:10 http://ftp.jp.debian.org/debian stretch/main amd64 libmpfr4 amd64 3.1.5-1 [556 kB]
取得:11 http://security.debian.org/debian-security stretch/updates/main amd64 linux-libc-dev amd64 4.9.189-3+deb9u2 [1,447 kB]
取得:12 http://security.debian.org/debian-security stretch/updates/main amd64 linux-compiler-gcc-6-x86 amd64 4.9.189-3+deb9u2 [656 kB]
取得:13 http://ftp.jp.debian.org/debian stretch/main amd64 libmpc3 amd64 1.0.3-1+b2 [39.9 kB]
取得:14 http://ftp.jp.debian.org/debian stretch/main amd64 cpp-6 amd64 6.3.0-18+deb9u1 [6,584 kB]
取得:15 http://security.debian.org/debian-security stretch/updates/main amd64 linux-headers-4.9.0-11-common all 4.9.189-3+deb9u2 [7,705 kB]
取得:16 http://security.debian.org/debian-security stretch/updates/main amd64 linux-headers-4.9.0-11-amd64 amd64 4.9.189-3+deb9u2 [450 kB]
取得:17 http://ftp.jp.debian.org/debian stretch/main amd64 cpp amd64 4:6.3.0-4 [18.7 kB]
取得:18 http://ftp.jp.debian.org/debian stretch/main amd64 libcc1-0 amd64 6.3.0-18+deb9u1 [30.6 kB]
取得:19 http://ftp.jp.debian.org/debian stretch/main amd64 binutils amd64 2.28-5 [3,770 kB]
取得:20 http://ftp.jp.debian.org/debian stretch/main amd64 libgomp1 amd64 6.3.0-18+deb9u1 [73.3 kB]
取得:21 http://ftp.jp.debian.org/debian stretch/main amd64 libitm1 amd64 6.3.0-18+deb9u1 [27.3 kB]
取得:22 http://ftp.jp.debian.org/debian stretch/main amd64 libatomic1 amd64 6.3.0-18+deb9u1 [8,966 B]
取得:23 http://ftp.jp.debian.org/debian stretch/main amd64 libasan3 amd64 6.3.0-18+deb9u1 [311 kB]
取得:24 http://ftp.jp.debian.org/debian stretch/main amd64 liblsan0 amd64 6.3.0-18+deb9u1 [115 kB]
取得:25 http://ftp.jp.debian.org/debian stretch/main amd64 libtsan0 amd64 6.3.0-18+deb9u1 [257 kB]
取得:26 http://ftp.jp.debian.org/debian stretch/main amd64 libubsan0 amd64 6.3.0-18+deb9u1 [107 kB]
取得:27 http://ftp.jp.debian.org/debian stretch/main amd64 libcilkrts5 amd64 6.3.0-18+deb9u1 [40.5 kB]
取得:28 http://ftp.jp.debian.org/debian stretch/main amd64 libmpx2 amd64 6.3.0-18+deb9u1 [11.2 kB]
取得:29 http://ftp.jp.debian.org/debian stretch/main amd64 libquadmath0 amd64 6.3.0-18+deb9u1 [131 kB]
取得:30 http://ftp.jp.debian.org/debian stretch/main amd64 libgcc-6-dev amd64 6.3.0-18+deb9u1 [2,296 kB]
取得:31 http://ftp.jp.debian.org/debian stretch/main amd64 gcc-6 amd64 6.3.0-18+deb9u1 [6,900 kB]
取得:32 https://download.docker.com/linux/debian stretch/stable amd64 docker-ce-cli amd64 5:19.03.5~3-0~debian-stretch [42.5 MB]
取得:33 http://ftp.jp.debian.org/debian stretch/main amd64 gcc amd64 4:6.3.0-4 [5,196 B]
取得:34 http://ftp.jp.debian.org/debian stretch/main amd64 make amd64 4.1-9.1 [302 kB]
取得:35 http://ftp.jp.debian.org/debian stretch/main amd64 patch amd64 2.7.5-1+deb9u2 [112 kB]
取得:36 http://ftp.jp.debian.org/debian stretch/main amd64 dkms all 2.3-2 [74.8 kB]
取得:37 http://ftp.jp.debian.org/debian stretch/main amd64 aufs-dkms amd64 4.9+20161219-1 [169 kB]
取得:38 http://ftp.jp.debian.org/debian stretch/main amd64 aufs-tools amd64 1:4.1+20161219-1 [102 kB]
取得:39 http://ftp.jp.debian.org/debian stretch/main amd64 cgroupfs-mount all 1.3 [5,716 B]
取得:40 http://ftp.jp.debian.org/debian stretch/main amd64 libfakeroot amd64 1.21-3.1 [45.7 kB]
取得:41 http://ftp.jp.debian.org/debian stretch/main amd64 fakeroot amd64 1.21-3.1 [85.6 kB]
取得:42 http://ftp.jp.debian.org/debian stretch/main amd64 libc-dev-bin amd64 2.24-11+deb9u4 [259 kB]
取得:43 http://ftp.jp.debian.org/debian stretch/main amd64 libc6-dev amd64 2.24-11+deb9u4 [2,364 kB]
取得:44 http://ftp.jp.debian.org/debian stretch/main amd64 libltdl7 amd64 2.4.6-2 [389 kB]
取得:45 http://ftp.jp.debian.org/debian stretch/main amd64 linux-headers-amd64 amd64 4.9+80+deb9u9 [6,084 B]
取得:46 http://ftp.jp.debian.org/debian stretch/main amd64 manpages-dev all 4.10-2 [2,145 kB]
取得:47 http://ftp.jp.debian.org/debian stretch/main amd64 rsync amd64 3.1.2-1+deb9u2 [393 kB]
取得:48 https://download.docker.com/linux/debian stretch/stable amd64 docker-ce amd64 5:19.03.5~3-0~debian-stretch [22.8 MB]
132 MB を 25秒 で取得しました (5,128 kB/s)
パッケージからテンプレートを展開しています: 100%
以前に未選択のパッケージ liberror-perl を選択しています。
(データベースを読み込んでいます ... 現在 27949 個のファイルとディレクトリがインストールされています。)
.../00-liberror-perl_0.17024-1_all.deb を展開する準備をしています ...
liberror-perl (0.17024-1) を展開しています...
以前に未選択のパッケージ git-man を選択しています。
.../01-git-man_1%3a2.11.0-3+deb9u5_all.deb を展開する準備をしています ...
git-man (1:2.11.0-3+deb9u5) を展開しています...
以前に未選択のパッケージ git を選択しています。
.../02-git_1%3a2.11.0-3+deb9u5_amd64.deb を展開する準備をしています ...
git (1:2.11.0-3+deb9u5) を展開しています...
以前に未選択のパッケージ pigz を選択しています。
.../03-pigz_2.3.4-1_amd64.deb を展開する準備をしています ...
pigz (2.3.4-1) を展開しています...
以前に未選択のパッケージ less を選択しています。
.../04-less_481-2.1_amd64.deb を展開する準備をしています ...
less (481-2.1) を展開しています...
以前に未選択のパッケージ manpages を選択しています。
.../05-manpages_4.10-2_all.deb を展開する準備をしています ...
manpages (4.10-2) を展開しています...
以前に未選択のパッケージ libisl15:amd64 を選択しています。
.../06-libisl15_0.18-1_amd64.deb を展開する準備をしています ...
libisl15:amd64 (0.18-1) を展開しています...
以前に未選択のパッケージ libmpfr4:amd64 を選択しています。
.../07-libmpfr4_3.1.5-1_amd64.deb を展開する準備をしています ...
libmpfr4:amd64 (3.1.5-1) を展開しています...
以前に未選択のパッケージ libmpc3:amd64 を選択しています。
.../08-libmpc3_1.0.3-1+b2_amd64.deb を展開する準備をしています ...
libmpc3:amd64 (1.0.3-1+b2) を展開しています...
以前に未選択のパッケージ cpp-6 を選択しています。
.../09-cpp-6_6.3.0-18+deb9u1_amd64.deb を展開する準備をしています ...
cpp-6 (6.3.0-18+deb9u1) を展開しています...
以前に未選択のパッケージ cpp を選択しています。
.../10-cpp_4%3a6.3.0-4_amd64.deb を展開する準備をしています ...
cpp (4:6.3.0-4) を展開しています...
以前に未選択のパッケージ libcc1-0:amd64 を選択しています。
.../11-libcc1-0_6.3.0-18+deb9u1_amd64.deb を展開する準備をしています ...
libcc1-0:amd64 (6.3.0-18+deb9u1) を展開しています...
以前に未選択のパッケージ binutils を選択しています。
.../12-binutils_2.28-5_amd64.deb を展開する準備をしています ...
binutils (2.28-5) を展開しています...
以前に未選択のパッケージ libgomp1:amd64 を選択しています。
.../13-libgomp1_6.3.0-18+deb9u1_amd64.deb を展開する準備をしています ...
libgomp1:amd64 (6.3.0-18+deb9u1) を展開しています...
以前に未選択のパッケージ libitm1:amd64 を選択しています。
.../14-libitm1_6.3.0-18+deb9u1_amd64.deb を展開する準備をしています ...
libitm1:amd64 (6.3.0-18+deb9u1) を展開しています...
以前に未選択のパッケージ libatomic1:amd64 を選択しています。
.../15-libatomic1_6.3.0-18+deb9u1_amd64.deb を展開する準備をしています ...
libatomic1:amd64 (6.3.0-18+deb9u1) を展開しています...
以前に未選択のパッケージ libasan3:amd64 を選択しています。
.../16-libasan3_6.3.0-18+deb9u1_amd64.deb を展開する準備をしています ...
libasan3:amd64 (6.3.0-18+deb9u1) を展開しています...
以前に未選択のパッケージ liblsan0:amd64 を選択しています。
.../17-liblsan0_6.3.0-18+deb9u1_amd64.deb を展開する準備をしています ...
liblsan0:amd64 (6.3.0-18+deb9u1) を展開しています...
以前に未選択のパッケージ libtsan0:amd64 を選択しています。
.../18-libtsan0_6.3.0-18+deb9u1_amd64.deb を展開する準備をしています ...
libtsan0:amd64 (6.3.0-18+deb9u1) を展開しています...
以前に未選択のパッケージ libubsan0:amd64 を選択しています。
.../19-libubsan0_6.3.0-18+deb9u1_amd64.deb を展開する準備をしています ...
libubsan0:amd64 (6.3.0-18+deb9u1) を展開しています...
以前に未選択のパッケージ libcilkrts5:amd64 を選択しています。
.../20-libcilkrts5_6.3.0-18+deb9u1_amd64.deb を展開する準備をしています ...
libcilkrts5:amd64 (6.3.0-18+deb9u1) を展開しています...
以前に未選択のパッケージ libmpx2:amd64 を選択しています。
.../21-libmpx2_6.3.0-18+deb9u1_amd64.deb を展開する準備をしています ...
libmpx2:amd64 (6.3.0-18+deb9u1) を展開しています...
以前に未選択のパッケージ libquadmath0:amd64 を選択しています。
.../22-libquadmath0_6.3.0-18+deb9u1_amd64.deb を展開する準備をしています ...
libquadmath0:amd64 (6.3.0-18+deb9u1) を展開しています...
以前に未選択のパッケージ libgcc-6-dev:amd64 を選択しています。
.../23-libgcc-6-dev_6.3.0-18+deb9u1_amd64.deb を展開する準備をしています ...
libgcc-6-dev:amd64 (6.3.0-18+deb9u1) を展開しています...
以前に未選択のパッケージ gcc-6 を選択しています。
.../24-gcc-6_6.3.0-18+deb9u1_amd64.deb を展開する準備をしています ...
gcc-6 (6.3.0-18+deb9u1) を展開しています...
以前に未選択のパッケージ gcc を選択しています。
.../25-gcc_4%3a6.3.0-4_amd64.deb を展開する準備をしています ...
gcc (4:6.3.0-4) を展開しています...
以前に未選択のパッケージ make を選択しています。
.../26-make_4.1-9.1_amd64.deb を展開する準備をしています ...
make (4.1-9.1) を展開しています...
以前に未選択のパッケージ patch を選択しています。
.../27-patch_2.7.5-1+deb9u2_amd64.deb を展開する準備をしています ...
patch (2.7.5-1+deb9u2) を展開しています...
以前に未選択のパッケージ dkms を選択しています。
.../28-dkms_2.3-2_all.deb を展開する準備をしています ...
dkms (2.3-2) を展開しています...
以前に未選択のパッケージ linux-kbuild-4.9 を選択しています。
.../29-linux-kbuild-4.9_4.9.189-3+deb9u2_amd64.deb を展開する準備をしています ...
linux-kbuild-4.9 (4.9.189-3+deb9u2) を展開しています...
以前に未選択のパッケージ aufs-dkms を選択しています。
.../30-aufs-dkms_4.9+20161219-1_amd64.deb を展開する準備をしています ...
aufs-dkms (4.9+20161219-1) を展開しています...
以前に未選択のパッケージ aufs-tools を選択しています。
.../31-aufs-tools_1%3a4.1+20161219-1_amd64.deb を展開する準備をしています ...
aufs-tools (1:4.1+20161219-1) を展開しています...
以前に未選択のパッケージ cgroupfs-mount を選択しています。
.../32-cgroupfs-mount_1.3_all.deb を展開する準備をしています ...
cgroupfs-mount (1.3) を展開しています...
以前に未選択のパッケージ containerd.io を選択しています。
.../33-containerd.io_1.2.10-3_amd64.deb を展開する準備をしています ...
containerd.io (1.2.10-3) を展開しています...
以前に未選択のパッケージ docker-ce-cli を選択しています。
.../34-docker-ce-cli_5%3a19.03.5~3-0~debian-stretch_amd64.deb を展開する準備をしています ...
docker-ce-cli (5:19.03.5~3-0~debian-stretch) を展開しています...
以前に未選択のパッケージ docker-ce を選択しています。
.../35-docker-ce_5%3a19.03.5~3-0~debian-stretch_amd64.deb を展開する準備をしています ...
docker-ce (5:19.03.5~3-0~debian-stretch) を展開しています...
以前に未選択のパッケージ libfakeroot:amd64 を選択しています。
.../36-libfakeroot_1.21-3.1_amd64.deb を展開する準備をしています ...
libfakeroot:amd64 (1.21-3.1) を展開しています...
以前に未選択のパッケージ fakeroot を選択しています。
.../37-fakeroot_1.21-3.1_amd64.deb を展開する準備をしています ...
fakeroot (1.21-3.1) を展開しています...
以前に未選択のパッケージ libc-dev-bin を選択しています。
.../38-libc-dev-bin_2.24-11+deb9u4_amd64.deb を展開する準備をしています ...
libc-dev-bin (2.24-11+deb9u4) を展開しています...
以前に未選択のパッケージ linux-libc-dev:amd64 を選択しています。
.../39-linux-libc-dev_4.9.189-3+deb9u2_amd64.deb を展開する準備をしています ...
linux-libc-dev:amd64 (4.9.189-3+deb9u2) を展開しています...
以前に未選択のパッケージ libc6-dev:amd64 を選択しています。
.../40-libc6-dev_2.24-11+deb9u4_amd64.deb を展開する準備をしています ...
libc6-dev:amd64 (2.24-11+deb9u4) を展開しています...
以前に未選択のパッケージ libltdl7:amd64 を選択しています。
.../41-libltdl7_2.4.6-2_amd64.deb を展開する準備をしています ...
libltdl7:amd64 (2.4.6-2) を展開しています...
以前に未選択のパッケージ linux-compiler-gcc-6-x86 を選択しています。
.../42-linux-compiler-gcc-6-x86_4.9.189-3+deb9u2_amd64.deb を展開する準備をしています ...
linux-compiler-gcc-6-x86 (4.9.189-3+deb9u2) を展開しています...
以前に未選択のパッケージ linux-headers-4.9.0-11-common を選択しています。
.../43-linux-headers-4.9.0-11-common_4.9.189-3+deb9u2_all.deb を展開する準備をしています ...
linux-headers-4.9.0-11-common (4.9.189-3+deb9u2) を展開しています...
以前に未選択のパッケージ linux-headers-4.9.0-11-amd64 を選択しています。
.../44-linux-headers-4.9.0-11-amd64_4.9.189-3+deb9u2_amd64.deb を展開する準備をしています ...
linux-headers-4.9.0-11-amd64 (4.9.189-3+deb9u2) を展開しています...
以前に未選択のパッケージ linux-headers-amd64 を選択しています。
.../45-linux-headers-amd64_4.9+80+deb9u9_amd64.deb を展開する準備をしています ...
linux-headers-amd64 (4.9+80+deb9u9) を展開しています...
以前に未選択のパッケージ manpages-dev を選択しています。
.../46-manpages-dev_4.10-2_all.deb を展開する準備をしています ...
manpages-dev (4.10-2) を展開しています...
以前に未選択のパッケージ rsync を選択しています。
.../47-rsync_3.1.2-1+deb9u2_amd64.deb を展開する準備をしています ...
rsync (3.1.2-1+deb9u2) を展開しています...
libquadmath0:amd64 (6.3.0-18+deb9u1) を設定しています ...
aufs-tools (1:4.1+20161219-1) を設定しています ...
libgomp1:amd64 (6.3.0-18+deb9u1) を設定しています ...
libatomic1:amd64 (6.3.0-18+deb9u1) を設定しています ...
manpages (4.10-2) を設定しています ...
git-man (1:2.11.0-3+deb9u5) を設定しています ...
libcc1-0:amd64 (6.3.0-18+deb9u1) を設定しています ...
less (481-2.1) を設定しています ...
make (4.1-9.1) を設定しています ...
libasan3:amd64 (6.3.0-18+deb9u1) を設定しています ...
containerd.io (1.2.10-3) を設定しています ...
Created symlink /etc/systemd/system/multi-user.target.wants/containerd.service → /lib/systemd/system/containerd.service.
mime-support (3.60) のトリガを処理しています ...
liberror-perl (0.17024-1) を設定しています ...
linux-headers-4.9.0-11-common (4.9.189-3+deb9u2) を設定しています ...
libcilkrts5:amd64 (6.3.0-18+deb9u1) を設定しています ...
libubsan0:amd64 (6.3.0-18+deb9u1) を設定しています ...
libtsan0:amd64 (6.3.0-18+deb9u1) を設定しています ...
linux-libc-dev:amd64 (4.9.189-3+deb9u2) を設定しています ...
cgroupfs-mount (1.3) を設定しています ...
rsync (3.1.2-1+deb9u2) を設定しています ...
Created symlink /etc/systemd/system/multi-user.target.wants/rsync.service → /lib/systemd/system/rsync.service.
liblsan0:amd64 (6.3.0-18+deb9u1) を設定しています ...
libmpx2:amd64 (6.3.0-18+deb9u1) を設定しています ...
libisl15:amd64 (0.18-1) を設定しています ...
patch (2.7.5-1+deb9u2) を設定しています ...
linux-kbuild-4.9 (4.9.189-3+deb9u2) を設定しています ...
libc-bin (2.24-11+deb9u4) のトリガを処理しています ...
libfakeroot:amd64 (1.21-3.1) を設定しています ...
systemd (232-25+deb9u12) のトリガを処理しています ...
libltdl7:amd64 (2.4.6-2) を設定しています ...
libmpfr4:amd64 (3.1.5-1) を設定しています ...
libmpc3:amd64 (1.0.3-1+b2) を設定しています ...
binutils (2.28-5) を設定しています ...
cpp-6 (6.3.0-18+deb9u1) を設定しています ...
libc-dev-bin (2.24-11+deb9u4) を設定しています ...
docker-ce-cli (5:19.03.5~3-0~debian-stretch) を設定しています ...
manpages-dev (4.10-2) を設定しています ...
libc6-dev:amd64 (2.24-11+deb9u4) を設定しています ...
pigz (2.3.4-1) を設定しています ...
git (1:2.11.0-3+deb9u5) を設定しています ...
libitm1:amd64 (6.3.0-18+deb9u1) を設定しています ...
cpp (4:6.3.0-4) を設定しています ...
docker-ce (5:19.03.5~3-0~debian-stretch) を設定しています ...
Created symlink /etc/systemd/system/multi-user.target.wants/docker.service → /lib/systemd/system/docker.service.
Created symlink /etc/systemd/system/sockets.target.wants/docker.socket → /lib/systemd/system/docker.socket.
libgcc-6-dev:amd64 (6.3.0-18+deb9u1) を設定しています ...
fakeroot (1.21-3.1) を設定しています ...
update-alternatives: /usr/bin/fakeroot (fakeroot) を提供するために自動モードで /usr/bin/fakeroot-sysv を使います
gcc-6 (6.3.0-18+deb9u1) を設定しています ...
gcc (4:6.3.0-4) を設定しています ...
linux-compiler-gcc-6-x86 (4.9.189-3+deb9u2) を設定しています ...
dkms (2.3-2) を設定しています ...
aufs-dkms (4.9+20161219-1) を設定しています ...
Loading new aufs-4.9+20161219 DKMS files...
Building for 4.9.0-4-amd64
Module build for kernel 4.9.0-4-amd64 was skipped since the
kernel headers for this kernel does not seem to be installed.
linux-headers-4.9.0-11-amd64 (4.9.189-3+deb9u2) を設定しています ...
linux-headers-amd64 (4.9+80+deb9u9) を設定しています ...
libc-bin (2.24-11+deb9u4) のトリガを処理しています ...
systemd (232-25+deb9u12) のトリガを処理しています ...
suda@debian:~$
```

ここまでの作業が無事にできていれば，dockerコマンドで好きなコンテナを起動させることが可能となっている．
ここでは例として，```hello-world```コンテナを実行してみる．

```
suda@debian:~$ sudo docker run hello-world
Unable to find image 'hello-world:latest' locally
latest: Pulling from library/hello-world
1b930d010525: Pull complete
Digest: sha256:4fe721ccc2e8dc7362278a29dc660d833570ec2682f4e4194f4ee23e415e1064
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
 https://docs.docker.com/get-started/

suda@debian:~$
```

上記のようなメッセージが表示された方，おめでとうございます．


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
