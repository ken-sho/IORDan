import csv
import os,sys
import json
import fnmatch
sys.path.append('/home/shogun/web_srv_main/modules')
import db_conn
from chardet.universaldetector import UniversalDetector


def CheckPattern(ownname,FileName):
	jsonFName = ownname.split('.')[0] + '.json'
	json_data = open(jsonFName, "r+")
	JD = json.loads(json_data.read())
	extension = '*.'+FileName.split('.')[-1]
	for key,val in JD.items():
		patFN = val["FileName"]
		if extension!=patFN:
			return 'none'
	detector = UniversalDetector()
	with open(FileName, 'rb') as fh:
		for line in fh:
			detector.feed(line)
			if detector.done:
				break
		detector.close()
	code=detector.result
	enc='"EncodingInfo" :("'+code['encoding']+'")'
	err='"ErrorInfo" :("Ошибок нет")'
	col_lst = '"Colls" : ['
	if code['encoding']=='windows-1251':
		rdr = csv.reader(open(FileName, 'r',encoding='cp1251'))
		line1 = next(rdr)
		for coll in line1:
			dlm=coll.find(';')
			if dlm>0:
				err='"ErrorInfo" :("Неверный формат")'
			else:
				col_lst += '"%s",' % (coll)
	elif code['encoding']=='utf-8':
		rdr = csv.reader(open(FileName, 'r',encoding='utf-8'))
		line1 = next(rdr)
		for coll in line1:
			dlm=coll.find(';')
			if dlm>0:
				err='"ErrorInfo" :("Неверный формат")'
			else:
				col_lst += '"%s",' % (coll)
	else:
		err='"ErrorInfo" :("Кодировка не поддерживается")'
	col_lst = col_lst.rstrip(",") + "]"
	return '{"ScriptName" :("csv_l"), "TargetInfo" : ("Сценарий загрузки Акта сверки (csv)"), '+enc+','+err+','+col_lst+'}'


def PrintPattern(val,fname,fname_s,fname_exists):
	dct = eval(val)
	pname=dct['TargetInfo']
	enc=dct['EncodingInfo']
	err=dct['ErrorInfo']
	html = '<div class="close_window" style="float:right;"><a class="close_navigator" onClick="RunFormatFile(0)" title="Закрыть" href="#">'
	html +='<i class="material-icons">close</i></a></div><div class="top_vert_menu">'+pname+'<br><div class="vert-menu-filename">'+fname_s+'</div></div>'
	if fname_exists=='false':
		html +='<div class="content_vert_menu">Кодировка : '+enc+'</div>'
		html +='<div class="content_vert_menu">Ошибка : '+err+'</div>'
		html +='<div class="content_vert_menu">Столбцы:</div>'
		lst=dct['Colls']
		for i in lst:
			html +='<div class="content-vert-menu-list">'+i+'</div>'
		if err=='Ошибок нет':
			html +='<div class="vert_menu"><input type="text" id="hid_load" placeholder="ID Дома" title="XXXXX">'
			html +='<br><input type="text" id="kdr_load" hidden>'
			html +='<br><input type="button" onClick="RunFormatFile(2)" id="yesform" value="Загрузить" file_name="'+fname+'"></div>'
	elif fname_exists=='true':
		html +='<div class="content_vert_menu">Документ загружен</div>'
		conn = db_conn.db_connect('web_station')
		cur = conn.cursor()
		q_sql = "select loader.im_pasp_upd('"+ fname +"','header')"
		cur.execute(q_sql)
		for row in cur:
			res=(row[0])
		dct2 = eval(res)
		try:
			err_info_lst=dct2['ERRLST']
		except:
			err_info_lst=''
		if err_info_lst!='':
			html +='<div class="content_vert_menu">Ошибка документа: '+err_info_lst+'</div>'
		else:
			html +='<div class="content_vert_menu">ID Дома: '+dct2['HID']+'</div>'
			html +='<div class="content_vert_menu">Кадастровый номер: '+dct2['KDRID']+'</div>'
			html +='<div class="content_vert_menu">Адрес: '+dct2['ADR']+'</div>'
			if dct2['LISTRQWST']=='0':
				html +='<div class="content_vert_menu">Строк для повторного запроса: '+dct2['LISTRQWST']+'</div>'
			else:
				html +='<div class="content_vert_menu">Строк для повторного запроса: '+dct2['LISTRQWST']+' <a href="/run_formatfile?fname='+fname+'&val_param=lstrqwst"  target="_blank">(Отчёт)</a></div>'
			if dct2['LISTUPD']=='0':
				html +='<div class="content_vert_menu">Строк для обновления: '+dct2['LISTUPD']+'</div>'
				html +='<input type="text" id="hid_load" placeholder="ID Дома" title="XXXXX" hidden><input type="text" id="kdr_load" hidden>'
				html +='<div class="vert_menu"><input type="button" onClick="RunFormatFile(4)" id="yesform" value="Удалить акт.файл" file_name="'+fname+'"></div>'
			else:
				html +='<div class="content_vert_menu">Строк для обновления: '+dct2['LISTUPD']+' <a href="/run_formatfile?fname='+fname+'&val_param=lstupd"  target="_blank">(Отчёт)</a></div>'
				lst=dct2['LIST']
				for i in lst:
					html +='<div class="content-vert-menu-list">'+i+'</div>'
				html +='<input type="text" id="hid_load" placeholder="ID Дома" title="XXXXX" hidden><input type="text" id="kdr_load" hidden>'
				html +='<div class="vert_menu"><input type="button" onClick="RunFormatFile(4)" id="yesform" value="Удалить акт.файл" file_name="'+fname+'"></div>'
	return html
