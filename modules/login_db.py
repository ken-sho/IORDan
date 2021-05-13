import modules.db_conn as db_conn
import hashlib
import os

def login (uname, pwd ,ip_adr):
    passwd = hashlib.md5(pwd.encode('utf-8')).hexdigest()
    conn = db_conn.db_connect('web_receivables')
    cur = conn.cursor()
    note = '{"ip": "'+ip_adr+'"}'
    cur.callproc('access.login',[uname,passwd,note])
    for row in cur:
        res=(row[0])
        print(res)
        if res!='no_usr_or_pwd':
           conn.commit()
           cur.close()
           conn.close ()
           dexist = os.path.exists("/opt/IORDan/personal/" + uname)
           if dexist==True:
              return res
           else:
              os.mkdir("/opt/IORDan/personal/" + uname)
              return res
        else:
           cur.close()
           conn.close ()
           return res

def chck_ss (asid):
    conn = db_conn.db_connect('web_receivables')
    cur = conn.cursor()
    cur.callproc('access.check_sid',[asid])
    conn.commit()
    for row in cur:
        res=(row[0])
        return res
    cur.close()
    conn.close ()