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
- 実行結果は画面右上に数秒間表示されます。issue ページ以外では何もコピーしません

```
javascript:import("https://booleanoid.github.io/bookmarklet/link_for_slack.js").then(m=>m.default());
```
