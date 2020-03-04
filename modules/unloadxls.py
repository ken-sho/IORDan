import pandas as pd
import openpyxl


def UnloadFile(html_body):
    table = pd.read_html(html_body)[0]
    table.to_excel("download/data.xlsx",sheet_name='report')
    res='/download/data.xlsx'
    return res
