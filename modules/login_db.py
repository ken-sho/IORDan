import modules.db_conn as db_conn
import hashlib
import os

def login (uname, pwd ,ip_adr):
    passwd = hashlib.md5(pwd.encode('utf-8')).hexdigest()
    conn = db_conn.db_connect('web_receivables')
    cur = conn.cursor()
    note = '{"ip": "'+ip_adr+'"}'
    #q_sql = "SELECT count(sid) FROM access.t_users where sid ='"+ uname +"'and passwd='"+ passwd +"'"
    q_sql = "select access.login('"+ uname +"','"+ passwd +"','"+ note +"')"
    cur.execute(q_sql)
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
    q_sql = "select access.check_sid('"+ asid +"')"
    cur.execute(q_sql)
    conn.commit()
    for row in cur:
        res=(row[0])
        return res
    cur.close()
    conn.close ()