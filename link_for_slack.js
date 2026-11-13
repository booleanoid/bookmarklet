// GitHub の issue 番号・タイトル・URL を Slack に貼りやすい形でクリップボードに保存する
// text/html: <a href="URL">#番号</a> タイトル（Slack では #番号 がリンクになる）
// text/plain: 1行目「#番号 タイトル」、2行目「URL」

const ISSUE_URL_PATTERN = /^(https:\/\/github\.com\/[^/?#]+\/[^/?#]+\/issues\/(\d+))(?:[?#].*)?$/;

// issue ページの URL なら { url, number } を返す。?・# 以降は取り除く
export const parseIssueUrl = (pageUrl) => {
    const match = pageUrl.match(ISSUE_URL_PATTERN);
    if (!match) {
        return null;
    }
    return { url: match[1], number: match[2] };
};

// 「タイトル · Issue #2 · owner/repo」から「タイトル」を取り出す
export const extractTitle = (pageTitle) => pageTitle.split(' · Issue #')[0];

export const escapeHtml = (text) => text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const buildClipboardTexts = ({ url, number, title }) => ({
    html: `<a href="${escapeHtml(url)}">#${number}</a> ${escapeHtml(title)}`,
    plain: `#${number} ${title}\n${url}`,
});

const writeClipboard = ({ html, plain }) => {
    if (typeof ClipboardItem === 'undefined') {
        return navigator.clipboard.writeText(plain);
    }
    return navigator.clipboard.write([
        new ClipboardItem({
            'text/html': new Blob([html], { type: 'text/html' }),
            'text/plain': new Blob([plain], { type: 'text/plain' }),
        }),
    ]);
};

export default () => {
    const issue = parseIssueUrl(document.URL);
    if (!issue) {
        alert('GitHub の issue ページで実行してください。\n（例: https://github.com/owner/repo/issues/123）');
        return;
    }

    const title = extractTitle(document.title);
    const texts = buildClipboardTexts({ ...issue, title });

    // navigator.clipboard が無い環境で同期的に例外が出ても catch で拾えるよう Promise で包む
    Promise.resolve()
        .then(() => writeClipboard(texts))
        .then(() => alert(`コピーしました。\n\n${texts.plain}`))
        .catch((error) => {
            console.error(error);
            alert(`クリップボードにコピーできませんでした。\nページ内を一度クリックしてから、もう一度実行してください。\n\n理由: ${error && error.message ? error.message : error}`);
        });
};
