# Issue #5: github issueの番号とタイトルをクリップボードに保管するブックマークレット 要件定義書

## 作成日
2026年11月13日

## 概要
GitHub の issue ページで実行すると、issue 番号・タイトル・URL を Slack に貼りやすい形式でクリップボードに保存するブックマークレットを作る。Slack に貼ったとき `#番号` がリンクになるように、HTML（リッチテキスト）とプレーンテキストの両方をクリップボードに保存する。

## 背景
- GitHub issue を Slack で共有するとき、番号・タイトル・URL を手で組み立てている
- issue では第一案として `[#2](URL) タイトル` 形式が挙がっている。ただし Slack はプレーンテキストで貼った Markdown リンク `[テキスト](URL)` を通常リンクにしない
- issue には「リンクにならないなら `#2 タイトル` と URL の2行形式にする」という代替案もある
- 確認の結果、HTML（`#番号` をリンクにする）と2行形式のプレーンテキストを同時に保存する方式に決めた（2026年11月13日）
- あわせて次の3点を決めた（2026年11月13日）
  - `?` や `#issuecomment-...` が付いた URL も対象にする
  - GitHub Projects のボード画面は対象外にする
  - 実行結果（コピーできた／できなかった）を画面に通知する

## 1. 現状分析

### 1.1 実装状況

| レイヤー | 状態 | 詳細 |
|---|---|---|
| issue 番号の取得 | 既存処理あり | `link_for_github_projects.js:5` で `document.URL` を `/\/issues\/(\d+)$/` に当てて取得 |
| タイトルの取得 | 既存処理あり | `link_for_github_projects.js:9` で `document.title` を `' · Issue #'` で区切った左側を使用 |
| クリップボード保存（Markdown 1行） | 既存処理あり | `link_for_github_projects.js:10` で `[#番号](URL) タイトル` を `navigator.clipboard.writeText` で保存 |
| クリップボード保存（HTML＋テキスト） | 欠落 | `text/html` を書き込む処理（`ClipboardItem`）はどのファイルにもない |
| Slack 向けブックマークレット | 欠落 | 該当ファイルなし |
| 読み込み方法 | 既存 | `README.md:17-19` の `javascript:import("https://booleanoid.github.io/bookmarklet/xxx.js").then(m=>m.default());` 形式。各ファイルは `export default () => {...}` |

### 1.2 問題点
- 既存の `link_for_github_projects.js` はプレーンテキストの Markdown を保存するだけなので、Slack に貼ると `[#2](https://...)` がそのまま文字として表示される
- URL の正規表現が `$` で終わるので、`?` や `#issuecomment-...` 付きの URL ではどのブックマークレットも動かない（本 issue の新ファイルでは対応する。2.2 を参照）
- 既存のブックマークレットは issue ページ以外で実行しても何も起きず、コピーできたかどうかも画面では分からない

## 2. 要件

### 2.1 ファイル
1. 新しいファイル `link_for_slack.js` を作る
2. 既存の `link_for_github_projects.js` / `link_for_redmine.js` は変えない
3. 既存ファイルと同じく `export default () => {...}` 形式にし、`README.md` の `import()` 方式で読み込めるようにする

### 2.2 取得する値
1. 対象とする URL：`https://github.com/<owner>/<repo>/issues/<数字>` の後ろが、何もない・`?...`・`#...` のいずれかのもの
   - 例：`.../issues/2`、`.../issues/2?foo=bar`、`.../issues/2#issuecomment-123`
   - GitHub Projects のボード画面（`/projects/...?pane=issue&itemId=...`）は対象外
2. issue 番号：上の URL の `/issues/<数字>` から取る
3. タイトル：`document.title`（例 `reate markdown text for redmine · Issue #2 · booleanoid/bookmarklet`）の ` · Issue #` より左側を取る
4. コピーする URL：`?` と `#` から後ろを取り除いた issue の URL（例 `https://github.com/booleanoid/bookmarklet/issues/2`）。コメントへのリンクから開いた場合も issue 本体の URL になる

### 2.3 クリップボードに保存する内容
issue #2 の場合の例：

1. `text/html`（Slack などリッチテキスト対応の貼り付け先用）
   ```html
   <a href="https://github.com/booleanoid/bookmarklet/issues/2">#2</a> reate markdown text for redmine
   ```
   - Slack に貼ると `#2` がリンクになる
   - タイトルと URL は HTML エスケープする（`<` `>` `&` `"` を含むタイトルで表示が崩れないようにする）
2. `text/plain`（プレーンテキストしか受け付けない貼り付け先用）
   ```
   #2 reate markdown text for redmine
   https://github.com/booleanoid/bookmarklet/issues/2
   ```
3. 1 と 2 を1つの `ClipboardItem` にまとめ、`navigator.clipboard.write` で同時に保存する

### 2.4 通知
1. 実行結果を、ページの上に重ねた小さな通知（トースト）で知らせる。数秒で自動的に消える
   - `alert()` は使わない（OK を押すまで操作が止まるため）
2. 通知する内容

   | 状況 | クリップボード | 通知の文言（例） |
   |---|---|---|
   | コピーできた | 2.3 の内容を保存 | `コピーしました: #2 reate markdown text for redmine` |
   | issue ページではない | 変えない | `GitHub の issue ページで実行してください` |
   | コピーに失敗した（ブラウザが許可しない等） | 変えない | `コピーに失敗しました` |
3. 通知の見た目は GitHub のページの CSS に左右されないよう、要素に直接スタイルを指定する

### 2.5 README
1. `README.md` に `link_for_slack.js` の用途と、ブックマークに登録する文字列を追記する

## 影響範囲
- 追加：`link_for_slack.js`
- 変更：`README.md`（使い方の追記）
- 追加：`docs/rdd/issue5_github-issue-link-for-slack-requirements.md`（本書）

## テストケース
Chrome で GitHub Pages に置いた `link_for_slack.js` をブックマークレットから読み込み、手で確かめる。

### 正常系
1. issue ページ（例 `https://github.com/booleanoid/bookmarklet/issues/2`）で実行し、Slack のメッセージ欄に貼ると `#2 reate markdown text for redmine` と表示され、`#2` を押すと issue が開く
2. 同じ状態でテキストエディタ（プレーンテキスト）に貼ると、1行目に `#2 reate markdown text for redmine`、2行目に URL が入る
3. タイトルに日本語を含む issue（例 #5）でも、タイトルが文字化けせずに入る
4. コピーできたとき、「コピーしました」の通知が出て、数秒で消える
5. `#issuecomment-...` 付きの URL（コメントへのリンク）で開いた issue で実行すると、コピーされる URL は `#` 以降を取り除いた issue の URL になる
6. `?` 付きの URL で開いた issue でも同じく、`?` 以降を取り除いた URL がコピーされる

### 異常系
7. issue ページ以外（リポジトリのトップ、Pull Request ページ、Projects のボードなど）で実行すると、「issue ページで実行してください」の通知が出て、クリップボードの中身は変わらない
8. タイトルに `<` `>` `&` を含む issue で実行し、Slack に貼ったときタイトルがそのまま文字として表示される（HTML として解釈されない）
9. クリップボードへの書き込みが失敗したとき（例：ページにフォーカスがない状態で実行）、「コピーに失敗しました」の通知が出る

### 境界値
10. 番号が1桁・3桁以上の issue でも、番号が正しく入る
11. `/issues/2abc` や `/issues/2/foo` のように `/issues/<数字>` の後ろに別の文字が続く URL は対象外として扱う

## 注意事項
- `ClipboardItem` と `navigator.clipboard.write` は Chrome では使えるが、ブラウザによっては使えない。`README.md:14` の動作環境（Chrome）を前提とする
- Slack 側の設定（メッセージをマークアップで書式設定する、など）によって貼り付け結果が変わる可能性があるため、実装後に実際の Slack で確かめる

## 関連Issue
- #2 Redmine 用ブックマークレット（`link_for_redmine.js`）。番号の取得方法が同じ
- #4（PR）GitHub Projects 用ブックマークレット（`link_for_github_projects.js`）。タイトルの取得方法を流用する
