import modules.db_conn as db_conn
import xml
import pandas as pd
import os

def read_file (fname):
    print(fname)
    conn = db_conn.db_connect('web_receivables')
    cur = conn.cursor()
    f = open(fname, 'r')
    #data = pd.read_csv(fname, sep="\t", header=None)
    print('run')
    #print(data)
    ifile=''
    try:
        for line in f:
            ifile=ifile+line
            #q_sql = "select main.add_str3('"+ line +"','"+ fname +"')"
            #cur.execute(q_sql)
        if len(ifile)>10:
            q_sql = "select main.add_str3('"+ ifile +"','"+ fname +"')"
            cur.execute(q_sql)
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

read_cat()
#read_file('Богдана Хмельницкого 15-93.xml')