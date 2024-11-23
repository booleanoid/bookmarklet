export default () => {
    const title = document.title;
    const url = document.URL;
    navigator.clipboard.writeText(`[${title}](${url})`).then();
};