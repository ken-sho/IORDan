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
import db_conn
import logg_web

#usr_list
#news_list

def fnk_lst (asid,orgid,fnk_name,val_param1,val_param2,val_param3,val_param4,val_param5,val_param6,val_param7,val_param8,val_param9,val_param10):
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
        #print(q_sql)
        cur.execute(q_sql)
        for row in cur:
            res=(row[0])

    conn.commit()
    cur.close()
    conn.close()
    return res