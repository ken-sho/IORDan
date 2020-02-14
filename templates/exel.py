import xlrd
import os,sys
import json
import fnmatch


def CheckPattern(ownname,FileName):
	jsonFName = ownname.split('.')[0] + '.json'
	json_data = open(jsonFName, "r+")
	JD = json.loads(json_data.read())
	try:
		rwb = xlrd.open_workbook(FileName,formatting_info=False)
		sheet_names = rwb.sheet_names()
	except:
		return 'none'
	# rwb = xlrd.open_workbook(FileName,formatting_info=False)
	# sheet_names = rwb.sheet_names()
	TargetIDS = '"ScriptName" :("exel"), "TargetIDS" : ('
	TargetInfo = '"TargetInfo" : ('
	for key,val in JD.items():
		patFN = val["FileName"]
		if patFN != "":
			if not fnmatch.fnmatch(FileName,patFN): continue
		patPC = val["TabCount"]
		if patPC != "":
			if int(patPC) != len(sheet_names): continue
		patSH = val["TabNames"]
		if patSH != "":
			cnt=min(len(patSH),len(sheet_names))
			accept=1
			for i in range(0,cnt):
				if not fnmatch.fnmatch(sheet_names[i],patSH[i]):
			  		accept=0
			  		break
			if accept == 0: continue
		TargetIDS += '"%s",' % (key)
		TargetInfo += '"%s",' % (val["caption"])
	res = "{" + TargetIDS.rstrip(",") + "),"
	res += TargetInfo.rstrip(",") + "),"
	res += '"Sheets" : ['
	for (i,item) in enumerate(sheet_names):
		res += '"%s",' % (item)
	return res.rstrip(",") + "]}"

def PrintPattern(val,fname,fname_s,fname_exists):
	dct = eval(val)
	pname=dct['TargetInfo']
	html = '<div class="close_window" style="float:right;"><a class="close_navigator" onClick="RunFormatFile(0)" title="Закрыть" href="#">'
	html +='<i class="material-icons">close</i></a></div><div class="top_vert_menu">'+pname+'<br>'+fname_s+'</div>'
	lst=dct['Sheets']
	for i in lst:
		html +='<div class="content_vert_menu">'+i+'</div>'
	if fname_exists=='false':
		html +='<div class="vert_menu"><input type="text" id="hid_load" placeholder="ID Дома" title="XXXXX">'
		html +='<br><input type="text" id="kdr_load" placeholder="Кадастровый номер" title="XX:XX:XXXXXXX:XXXX">'
		html +='<br><input type="button" onClick="RunFormatFile(1)" id="yesform" value="Загрузить" file_name="'+fname+'"></div>'
	else:
		html +='<div class="vert_menu">Файл с таким именем уже загружен'
		html +='<br>Задать новое имя: <input type="text" id="new_fname" value="'+fname_s+'"></input>'
		html +='<br><input type="button" onClick="RenameFilename()" id="new_fnameform" value="Переименовать"></div>'
		html +='<script>function RenameFilename() {var fname_new = document.getElementById("new_fname").value; var post_param = encodeURI("attr=rename&fname_old='+fname_s+'&fname=" + fname_new);'
		html +='$.ajax({type: "POST",url: "/formatfile",data: post_param,success: () => {'
		html +='$("#fortable").load("/filelist #filelist", function () {const fileStr = $("#filelist td:contains(" + fname_new + ")").parent();'
		html +='const triggerBtn = fileStr.find("i:contains(play_circle_outline)");triggerBtn.trigger("click");});}});}</script>'
	return html
