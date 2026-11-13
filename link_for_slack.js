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

const showToast = (message, isError = false) => {
    const toast = document.createElement('div');
    toast.textContent = message;
    Object.assign(toast.style, {
        position: 'fixed',
        top: '16px',
        right: '16px',
        zIndex: '2147483647',
        maxWidth: '480px',
        padding: '10px 16px',
        borderRadius: '6px',
        background: isError ? '#cf222e' : '#1f883d',
        color: '#ffffff',
        font: '14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
        wordBreak: 'break-all',
    });
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
};

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
        showToast('GitHub の issue ページで実行してください', true);
        return;
    }

    const title = extractTitle(document.title);
    const texts = buildClipboardTexts({ ...issue, title });

    writeClipboard(texts)
        .then(() => showToast(`コピーしました: #${issue.number} ${title}`))
        .catch((error) => {
            console.error(error);
            showToast('コピーに失敗しました', true);
        });
};
