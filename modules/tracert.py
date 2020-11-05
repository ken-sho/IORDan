import os
from datetime import datetime

def tprint (fname, fquery):
    dexist = os.path.exists("/opt/IORDan/tracert/")
    if dexist==False:
        os.mkdir("/opt/IORDan/tracert/")
    handle = open(r"/opt/IORDan/tracert/"+fname+".trc", "a")
    handle.write('==========' + datetime.strftime(datetime.now(), "%Y.%m.%d %H:%M:%S") + '==========' + '\n')
    handle.write(fquery + '\n')
    handle.write('==========END==========' + '\n')
#tprint('run_test','fffffff')