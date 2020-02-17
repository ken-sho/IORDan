# -*- coding: utf-8 -*-
import psycopg2
import xlrd
import datetime
import base64
import sys

def LoadFile(afname,dbc,asid,afname_short):
    cur = dbc.cursor()
    def pfun(fname,params):
        sql = "select loader."+fname+'(%s'+',%s'*(len(params)-1)+');'
        cur.execute(sql, params)
        return cur.fetchall()[0][0]
    seance=pfun('seancestart',('',''))
    astartrow = 0
    astartcol = 0
    rb = xlrd.open_workbook(afname) 
    sn = rb.sheet_names()
    for shnum in range(0,len(sn)):
        fp=pfun('addfilepart',(seance,afname_short,sn[shnum],'',asid))
        ws = rb.sheet_by_index(shnum)
        nr = ws.nrows
        nc = ws.ncols
        vRow = astartrow
        for row in range(astartrow,nr):
            vRow = []
            for col in range(astartcol,nc):
                try:
                    x=ws.cell(row,col).value
                    ttype=ws.cell(row,col).ctype
                except:
                    x='**error**'
                    ttype=xlrd.XL_CELL_TEXT
                if ttype == xlrd.XL_CELL_DATE:
                    strh = datetime.datetime(*xlrd.xldate_as_tuple(x, rb.datemode)).strftime('%d.%m.%Y')
                else:
                    strh = str(x)
                if len(strh)>2701:
                    strh=strh[:2700]
                strh = base64.b64encode(strh.encode()).decode()
#                print(str(strh)+':'+str(ttype))
                #if sys.getsizeof(str(vRow))<8190:
                vRow.append(strh)

            cur.execute("select loader.addrow(%s,%s,%s)", (fp,str(row),vRow))

