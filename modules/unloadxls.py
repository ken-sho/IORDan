import pandas as pd
import openpyxl
import json
import time
import modules.db_conn as db_conn


def UnloadFile(html_body,file_name,asid):
    conn = db_conn.db_connect('web_receivables')
    cur = conn.cursor()
    cur.callproc('main.webrqst',[asid,'uname'])
    for row in cur:
        uname=(row[0])
    table = pd.read_html(html_body,header=0)[0]
    timestamp = int(time.time())
    fname = file_name+str(timestamp)+".xlsx"
    cur.callproc('loader.add_personal_file',[asid,fname])
    for row in cur:
        fnameid=(row[0])
    table.to_excel("/opt/IORDan/personal/"+uname+"/"+fnameid+'.xlsx',sheet_name='report')
    url = str('/personal/'+uname+'/'+fnameid+'.xlsx')
    res={
        "url":url,
        "name":fname
        }
    res=json.dumps(res)
    conn.commit()
    cur.close()
    conn.close()
    return res