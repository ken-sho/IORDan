import psycopg2
import sys
import hashlib
import importlib
import os
import json
import urllib
import urllib.request
import urllib.parse
import base64
import time
import modules.db_conn as db_conn
import modules.logg_web as logg_web

#usr_list
#news_list
#news

def fnk_lst (asid,orgid,fnk_name,adate,operation):
    conn = db_conn.db_connect('web_receivables')
    cur = conn.cursor()
    res=''
    if fnk_name=='usr_list':
        q_sql = "select admin.usr_list('"+ asid +"')"
        cur.execute(q_sql)
        for row in cur:
            res=(row[0])
    elif fnk_name=='news_list':
        q_sql = "select admin.news_list('"+ asid +"')"
        cur.execute(q_sql)
        for row in cur:
            res=(row[0])
    elif fnk_name=='news':
        q_sql = "select admin.adddel_news('"+ asid +"','"+ adate +"','"+ operation +"')"
        print(q_sql)
        cur.execute(q_sql)
        for row in cur:
            res=(row[0])
        encoded = base64.b64encode(q_sql.encode()).decode()
        logg_web.add_log(asid,encoded,'Добавление/удаление новости')

    conn.commit()
    cur.close()
    conn.close()
    return res