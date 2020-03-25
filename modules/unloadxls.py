import pandas as pd
import openpyxl
import time


def UnloadFile(html_body,file_name):
    table = pd.read_html(html_body,header=0)[0]
    timestamp = int(time.time())
    table.to_excel("/download/"+file_name+str(timestamp)+".xlsx",sheet_name='report')
    res='/download/'+file_name+str(timestamp)+'.xlsx'
    return res
