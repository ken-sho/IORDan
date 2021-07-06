import os
import shutil
import zipfile
import modules.tracert as tracert
import modules.db_conn as db_conn

def run (asid,uname):
    dexist = os.path.exists("/opt/IORDan/personal/" + uname + "/pfilearh")
    if dexist==True:
        shutil.rmtree("/opt/IORDan/personal/" + uname + "/pfilearh")
        os.mkdir("/opt/IORDan/personal/" + uname + "/pfilearh")
        os.remove('/opt/IORDan/personal/' + uname + '/spam.zip')
    else:
        os.mkdir("/opt/IORDan/personal/" + uname + "/pfilearh")
    conn = db_conn.db_connect('web_receivables')
    cur = conn.cursor()
    cur.callproc('loader.pfile_tbl',[asid])
    for row in cur:
        url=(row[0])
        fname=(row[1])
        pfid=(row[2])
        if os.path.exists('/opt/IORDan' + url):
            tracert.tprint('file_lst',url)
            shutil.copyfile(r'/opt/IORDan' + url, r'/opt/IORDan/personal/' + uname + '/pfilearh/' + pfid + '_' + fname)
        else: 
            tracert.tprint('file_lst','erorr#' + url)
    conn.commit()
    cur.close()
    conn.close()
    z = zipfile.ZipFile('/opt/IORDan/personal/' + uname + '/pfile.zip', 'w')        # Создание нового архива
    for root, dirs, files in os.walk('/opt/IORDan/personal/' + uname + '/pfilearh/'): # Список всех файлов и папок в директории folder
        for file in files:
            z.write(os.path.join(root,file))         # Создание относительных путей и запись файлов в архив
        z.close()