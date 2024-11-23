javascript:

// url = 'https://www.deepl.com/ja/translator#ja/en-us/word'
const d = document.getElementsByClassName("semi-table-row");
let str = "";
for (const v in d) {
  let a_l = 0;
  if(d[v].getElementsByClassName("anchor-info")!=null){
    a_l = d[v].getElementsByClassName("anchor-info").length;
  }
  if (a_l != 0){
    let a_i = d[v].getElementsByClassName("anchorDetail-Tz0MNw");
    let an = a_i[0].getElementsByClassName("semi-typography")[0].textContent;
    let hn = a_i[0].getElementsByClassName("semi-typography")[1].textContent;
    let st = d[v].getElementsByClassName("liveplatform-status-tag")[0].getElementsByClassName("semi-tag-content")[0].textContent;
    if(st == "対象"){
      str = str + an + "\t" + hn + "\n";
    }
  }
  navigator.clipboard.writeText(str);
}
alert('test');

