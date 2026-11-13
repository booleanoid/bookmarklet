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
- 実際に使ったところコピーされなかったため、次のように変更した（2026年11月13日）
  - 原因1：ブックマークレットの URL に `https://github.com/.../blob/main/...js` を指定していた。これは HTML ページなので `import()` できない
  - 原因2：github.com は Content-Security-Policy（`script-src github.githubassets.com ...`）で外部スクリプトの読み込みを禁止している。そのため GitHub Pages の URL を指定しても、GitHub の issue ページ上では `import()` が失敗する
  - 原因3：`import()` の失敗を拾う処理がなく、何も表示されなかった
  - 対応：ファイルを読み込まず、コードをそのままブックマークに登録する形式にする。通知は alert にする

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
3. ソースは既存ファイルと同じく `export default () => {...}` 形式で書く
4. github.com では `import()` で外部ファイルを読み込めない（「背景」を参照）ため、ブックマークにはコードをそのまま入れた `javascript:` URL を登録する
   - `scripts/build-bookmarklet.mjs` で `link_for_slack.js` から `dist/link_for_slack.bookmarklet.txt` を作る
   - `link_for_slack.js` を変えたら作り直す

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
1. 実行結果を `alert()` で知らせる
2. 通知する内容

   | 状況 | クリップボード | alert の文言 |
   |---|---|---|
   | コピーできた | 2.3 の内容を保存 | `コピーしました。` と、コピーした2行（`#番号 タイトル` と URL） |
   | issue ページではない | 変えない | `GitHub の issue ページで実行してください。` と URL の例 |
   | コピーに失敗した（ページにフォーカスがない、ブラウザが許可しない等） | 変えない | `クリップボードにコピーできませんでした。ページ内を一度クリックしてから、もう一度実行してください。` と失敗の理由 |

### 2.5 README
1. `README.md` に `link_for_slack.js` の用途と、ブックマークへの登録方法（`dist/link_for_slack.bookmarklet.txt` の中身を貼る）を追記する
2. `README.md` に、`blob` の URL は使えないこと、github.com では `import()` 形式が動かないことを書く

## 影響範囲
- 追加：`link_for_slack.js`
- 追加：`scripts/build-bookmarklet.mjs`（ブックマークに登録する `javascript:` URL を作る）
- 追加：`dist/link_for_slack.bookmarklet.txt`（ブックマークに登録する文字列）
- 変更：`README.md`（使い方の追記）
- 追加：`docs/rdd/issue5_github-issue-link-for-slack-requirements.md`（本書）

## テストケース
Chrome で `dist/link_for_slack.bookmarklet.txt` の中身をブックマークに登録し、手で確かめる。

### 正常系
1. issue ページ（例 `https://github.com/booleanoid/bookmarklet/issues/2`）で実行し、Slack のメッセージ欄に貼ると `#2 reate markdown text for redmine` と表示され、`#2` を押すと issue が開く
2. 同じ状態でテキストエディタ（プレーンテキスト）に貼ると、1行目に `#2 reate markdown text for redmine`、2行目に URL が入る
3. タイトルに日本語を含む issue（例 #5）でも、タイトルが文字化けせずに入る
4. コピーできたとき、「コピーしました。」とコピーした内容が alert で表示される
5. `#issuecomment-...` 付きの URL（コメントへのリンク）で開いた issue で実行すると、コピーされる URL は `#` 以降を取り除いた issue の URL になる
6. `?` 付きの URL で開いた issue でも同じく、`?` 以降を取り除いた URL がコピーされる

### 異常系
7. issue ページ以外（リポジトリのトップ、Pull Request ページ、Projects のボードなど）で実行すると、「GitHub の issue ページで実行してください。」が alert で表示され、クリップボードの中身は変わらない
8. タイトルに `<` `>` `&` を含む issue で実行し、Slack に貼ったときタイトルがそのまま文字として表示される（HTML として解釈されない）
9. クリップボードへの書き込みが失敗したとき（例：ページにフォーカスがない状態で実行）、「クリップボードにコピーできませんでした。」と理由が alert で表示される

### 境界値
10. 番号が1桁・3桁以上の issue でも、番号が正しく入る
11. `/issues/2abc` や `/issues/2/foo` のように `/issues/<数字>` の後ろに別の文字が続く URL は対象外として扱う

## 注意事項
- `ClipboardItem` と `navigator.clipboard.write` は Chrome では使えるが、ブラウザによっては使えない。`README.md:14` の動作環境（Chrome）を前提とする
- Slack 側の設定（メッセージをマークアップで書式設定する、など）によって貼り付け結果が変わる可能性があるため、実装後に実際の Slack で確かめる

## 関連Issue
- #2 Redmine 用ブックマークレット（`link_for_redmine.js`）。番号の取得方法が同じ
- #4（PR）GitHub Projects 用ブックマークレット（`link_for_github_projects.js`）。タイトルの取得方法を流用する
