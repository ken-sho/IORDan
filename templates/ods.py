import ezodf
import os,sys
import json
import fnmatch


def CheckPattern(ownname,FileName):
    doc = ezodf.opendoc(FileName)
    Sheets= '"Sheets" : '
    Sheets +=str(list(doc.sheets.names()))
    return '{"ScriptName" :("ods"), "TargetInfo" : ("Сценарий загрузки файла компании (ods)"), '+Sheets+'}'


def PrintPattern(val,fname,fname_s,fname_exists):
    dct = eval(val)
    pname=dct['TargetInfo']
    html = '<div class="close_window" style="float:right;"><a class="close_navigator" onClick="RunFormatFile(0)" title="Закрыть" href="#">'
    html +='<i class="material-icons">close</i></a></div><div class="top_vert_menu">'+pname+'<br><div class="vert-menu-filename">'+fname_s+'</div></div>'
    lst=dct['Sheets']
    for i in lst:
        html +='<div class="content_vert_menu">'+i+'</div>'

    html +='<div class="vert_menu"><input type="text" id="inn_org_load" placeholder="ИНН организации" title="ИНН организации">'
    html +='<br><input type="button" id="yesform" onClick="RunFormatFile(3)" value="Загрузить" file_name="'+fname+'"></div>'

    return html
