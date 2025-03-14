export default () => {
    const title = document.title;
    const url = document.URL;

    const issue_no = url.match(/\/issues\/(\d+)$/);
    console.log(issue_no);
    if (issue_no) {
        navigator.clipboard.writeText(`[#${issue_no[1]}](${url})`).then();
        return;
    }

    // navigator.clipboard.writeText(`[${title}](${url})`).then();
};