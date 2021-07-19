import pandas as pd
import openpyxl

def UnloadFile(file_name,uname,html_body):
    table = pd.read_html(html_body,header=0)[0]
    table.to_excel("/opt/IORDan/personal/"+uname+"/"+file_name,sheet_name='report')
    return res
