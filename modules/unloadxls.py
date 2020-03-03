import pandas as pd
import openpyxl


def UnloadFile():
    url = "https://www.geeksforgeeks.org/extended-operators-in-relational-algebra/"
    table = pd.read_html(url)[1]
    table.to_excel("data.xlsx",sheet_name='report')

UnloadFile()