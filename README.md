# bookmarklet

## 目的
ブックマークレットをGitHubリポジトリで管理、運用する。


## 概要
利用できるブックマークを集めています。


## 動作環境
- OS: Windows 11 Pro
- CPU: Intel(R) Core(TM) i7-11700 @ 2.50GHz
- ブラウザ：Chrome 129.0.6668.58

## ブックマークレット使用方法
```
javascript:import("https://booleanoid.github.io/bookmarklet/xxx.js").then(m=>m.default());
```

- URL は GitHub Pages（`https://booleanoid.github.io/...`）を指定します。`https://github.com/.../blob/...` は HTML ページなので読み込めません
- github.com のページは外部スクリプトの読み込みを禁止しているため、GitHub 上で使うブックマークレットはこの形式では動きません。下の「直接登録する形式」を使ってください

### 直接登録する形式（GitHub 上で使うもの）
ファイルの中身をそのままブックマークの URL に入れる形式です。外部ファイルを読み込まないので、github.com でも動きます。

1. `node scripts/build-bookmarklet.mjs <ファイル.js>` を実行すると、`dist/<ファイル名>.bookmarklet.txt` ができます
2. そのファイルの中身（`javascript:` から始まる1行）を、ブックマークの URL 欄に貼り付けます

## ブックマークレット一覧

### link_for_slack.js
GitHub の issue ページで実行すると、issue 番号・タイトル・URL を Slack に貼りやすい形でクリップボードに保存します。

- Slack に貼ると `#2 タイトル` と表示され、`#2` が issue へのリンクになります
- プレーンテキストしか貼れない場所では、次の2行になります
  ```
  #2 タイトル
  https://github.com/owner/repo/issues/2
  ```
- コメントへのリンク（`#issuecomment-...` 付き）から開いた issue でも、issue 本体の URL をコピーします
- 実行結果は alert で表示します（コピーしました／issue ページで実行してください／コピーできませんでした）。issue ページ以外では何もコピーしません
- 登録方法：[dist/link_for_slack.bookmarklet.txt](dist/link_for_slack.bookmarklet.txt) の中身（`javascript:` から始まる1行）をブックマークの URL 欄に貼り付けます
- `link_for_slack.js` を変更したら `node scripts/build-bookmarklet.mjs link_for_slack.js` で作り直してください
