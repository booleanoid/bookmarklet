export default () => {
  // 現在のページのURLを取得
  const url = location.href;
  // PageSpeed Insightsの自動計測URLを生成
  const psiUrl = `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(url)}`;
  // 新しいタブで開く
  window.open(psiUrl, '_blank');
}; 