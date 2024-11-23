export default () => {
    var sheet_id = '1zaa7nDcOAGI_9rZaQo6kpdCo0mLizE38dzJXQvdlB68';
    var spreadsheet = SpreadsheetApp.openById(sheet_id); // SHEET_IDにご自身のスプレッドシートIDを入力
    var sheet = spreadsheet.getActiveSheet();
    var values = sheet.getRange('A1:C').getValues();

    var array_id_list = [];

    const id_lastRow = sheet.getRange(sheet.getMaxRows(), 1).getNextDataCell(SpreadsheetApp.Direction.UP).getRow();
    for (let i = 1; i < id_lastRow; i++){
        array_id_list.push(values[i][0]);
    }
    Logger.log(sample_array);
    Logger.log(sample_array.filter(i => array_id_list.indexOf(i) == -1));
    Logger.log(idFilter(sample_array, array_id_list));
    Logger.log(is_active_id("fujigaya_haruki", array_id_list));
    Logger.log(array_id_list);


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
            if(st == "対象" && is_active_id(an, array_id_list)){
                str = str + an + "\t" + hn + "\n";
            }
        }
        navigator.clipboard.writeText(str);
    }
    
    function is_active_id(id, array_done_id){
        return !array_done_id.includes(id);
    }
    

};