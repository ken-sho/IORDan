import modules.db_conn as db_conn
import xml
import pandas as pd
import os

def read_file (fname,vaccid):
    conn = db_conn.db_connect('web_receivables')
    cur = conn.cursor()
    f = open(fname, 'r')
    ifile=''
    try:
        for line in f:
            ifile=ifile+line
        if len(ifile)>10:
            cur.callproc('loader.xml_upload',[ifile,fname,vaccid])
        conn.commit()
        cur.close()
        conn.close()
    except:
        print('bad')
   
def read_cat ():
    for root, dirs, files in os.walk('/opt/IORDan/upload_bd/xml'): 
        for f in files:
            if f!='upload_xml.py' and f!='db_conn.cpython-36.pyc' and f!='db_conn.py' and f!='db_conn.cpython-38.pyc':
                read_file(f)
