// ES モジュール形式のブックマークレット（export default () => {...}）を、
// import() を使わずにそのままブックマークに登録できる javascript: URL に変換する。
//
// github.com は Content-Security-Policy で外部スクリプトの読み込みを禁止しているため、
// import("https://booleanoid.github.io/...") 形式は GitHub 上では動かない。
//
// 使い方: node scripts/build-bookmarklet.mjs link_for_slack.js
// 出力先: dist/<元のファイル名から .js を除いた名前>.bookmarklet.txt
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const toBookmarklet = (source) => {
    const body = source
        .replace(/^﻿/, '')
        .replace(/^export default /m, 'const __main = ')
        .replace(/^export const /gm, 'const ');
    if (!body.includes('const __main = ')) {
        throw new Error('export default が見つかりません');
    }
    return `javascript:${encodeURIComponent(`(() => {\n${body}\n__main();\n})();`)}`;
};

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectRun) {
    const input = process.argv[2];
    if (!input) {
        console.error('使い方: node scripts/build-bookmarklet.mjs <ファイル.js>');
        process.exit(1);
    }
    const root = join(dirname(fileURLToPath(import.meta.url)), '..');
    const output = join(root, 'dist', `${basename(input, '.js')}.bookmarklet.txt`);
    mkdirSync(dirname(output), { recursive: true });
    writeFileSync(output, `${toBookmarklet(readFileSync(input, 'utf8'))}\n`);
    console.log(`出力しました: ${output}`);
}
