export default () => {
    const title = document.title;
    const url = document.URL;

    const issue_no = url.match(/\/issues\/(\d+)$/);
    console.log(issue_no);
    if (issue_no) {
        // ページタイトルから「 · Issue #{issue_no}」の左側のテキストを抽出
        const page_title = title.split(' · Issue #')[0];
        navigator.clipboard.writeText(`[#${issue_no[1]}](${url}) ${page_title}`).then();
        return;
    }

    // navigator.clipboard.writeText(`[${title}](${url})`).then();
};