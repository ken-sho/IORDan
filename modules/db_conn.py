import psycopg2
import asyncio
import asyncpg

def db_connect (dbname):
    handle = open(r"/opt/IORDan/ssl/bd_con.txt", "r")
    usr = handle.readline().strip()
    passwd = handle.readline().strip()
    handle.close()
    conn_string = "host='localhost' dbname='"+dbname+"' user='"+usr+"' password='"+passwd+"'"
    conn = psycopg2.connect(conn_string)
    #conn.set_client_encoding('UTF8')
    conn.autocommit=False
    return conn
