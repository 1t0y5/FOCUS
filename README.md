# FOCUS MVP PWA v3

## GitHub Pagesへのアップロード
1. このZIPを展開
2. 中にあるファイルをGitHubリポジトリのルートへアップロード
3. Settings → Pages → Deploy from a branch
4. Branchを main / root にして保存
5. 発行されたURLをSafariで開く
6. 共有 → ホーム画面に追加

## 今回の仕様
- 入口4種類
- 選択肢中心の会話フロー
- 必要な場面だけ自由入力
- 3回答後に「今日はここまでにする」を表示
- Focus Card作成・修正・保存
- カード一覧
- PWA対応
- オフラインキャッシュ

## AI接続について
現在の返答は仮のルールベースです。
app.js の generateReply() をAPI呼び出しへ置き換えることで、AI会話へ移行できます。
