import psycopg2
import modules.db_conn as db_conn

def add_log (asid,query,note):
    conn = db_conn.db_connect('web_receivables')
    cur = conn.cursor()
    cur.callproc('log.add_log_rec',[asid,query,note])    
    conn.commit()
    cur.close()
    conn.close ()
