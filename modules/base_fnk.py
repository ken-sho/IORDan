import psycopg2
import sys
import hashlib
import importlib
import os
import json
import urllib
import urllib.request
import urllib.parse
import base64
import time
import modules.db_conn as db_conn
import modules.logg_web as logg_web
import modules.tracert as tracert
import modules.pfile_arh_cre as pfilearh


#objects_tree_filters
#account_history
#adr_info
#addchg_human
#addchg_kvdocs
#chg_place_val
#addchg_contact
#reports_setting
#fast_find
#news_portal
#addchg_accnote
#loader_file_list
#delfilepart
#document_list
#rollback_bank
#document_rec
#chg_passwd
#chg_user_attr
#ree_reestrs
#get_registry
#addchg_ree_recodrs
#house_groups
#house_groups_list
#add_usr_hsgrlst
#registry_settings
#chg_history_setting
#chg_reputation
#ree_regular_create
#ree_print_registry_content
#chg_history_foropl
#get_last_pay_date
#office_administration_add_entry
#log_views
#get_egrp_rec
#get_fssp_rec
#pfile_lst

def fnk_lst (asid,orgid,fnk_name,adate,val_param,val_param1,val_param2,val_param3,val_param4,val_param5,val_param6,val_param7,val_param8,val_param9,val_param10):
    conn = db_conn.db_connect('web_receivables')
    cur = conn.cursor()
    res=''
    if fnk_name=='chg_history_setting':
        q_sql = 'main.chg_history_setting' + str([asid,orgid,adate])
        cur.callproc('main.chg_history_setting',[asid,orgid,adate])
        for row in cur:
            res=(row[0])
        encoded = base64.b64encode(q_sql.encode()).decode()
        logg_web.add_log(asid,encoded,'Изменение настроект')
    if fnk_name=='objects_tree_filters':
        q_sql = 'main.house_tree' + str([asid,orgid,adate])
        cur.callproc('main.house_tree',[asid,orgid,adate])
        for row in cur:
            res=(row[0])
        encoded = base64.b64encode(q_sql.encode()).decode()
        logg_web.add_log(asid,encoded,'Применение фильтра объектов')
    elif fnk_name=='account_history':
        q_sql = 'main.account_history' + str([asid,orgid,adate])
        cur.callproc('main.account_history',[asid,orgid,adate])
        for row in cur:
            res=(row[0])
    elif fnk_name=='adr_info':
        q_sql = 'main.adr_info' + str([asid,orgid,adate])
        cur.callproc('main.adr_info',[asid,orgid,adate])
        for row in cur:
            res=(row[0])
    elif val_param=='addchg_human':
        q_sql = 'main.addchg_human' + str([asid,orgid,adate])
        print(q_sql)
        cur.callproc('main.addchg_human',[asid,orgid,adate])
        for row in cur:
            res=(row[0])
        encoded = base64.b64encode(q_sql.encode()).decode()
        logg_web.add_log(asid,encoded,'Добавление/удаление human')
    elif val_param=='addchg_kvdocs':
        q_sql = "select main.addchg_kvdocs('"+ asid +"','"+ val_param1 +"','"+ val_param2 +"','"+ val_param3 +"','"+ val_param4 +"','"+ val_param5 +"','"+ val_param6 +"','"+ val_param7 +"','"+ val_param8 +"')"
        cur.execute(q_sql)
        for row in cur:
            res=(row[0])
        encoded = base64.b64encode(q_sql.encode()).decode()
        logg_web.add_log(asid,encoded,'Добавление/удаление документа на квартиру')
    elif val_param=='chg_place_val':
        q_sql = "select main.chg_adate_place('"+ asid +"','"+ val_param1 +"','"+ val_param2 +"','"+ val_param3 +"')"
        cur.execute(q_sql)
        for row in cur:
            res=(row[0])
        encoded = base64.b64encode(q_sql.encode()).decode()
        logg_web.add_log(asid,encoded,'Изменение атрибутов квартиры')
    elif val_param=='addchg_contact':
        q_sql = "select main.addchg_contact('"+ asid +"','"+ val_param1 +"','"+ val_param2 +"','"+ val_param3 +"','"+ val_param4 +"','"+ val_param5 +"','"+ val_param6 +"','"+ val_param7 +"')"
        cur.execute(q_sql)
        for row in cur:
            res=(row[0])
        encoded = base64.b64encode(q_sql.encode()).decode()
        logg_web.add_log(asid,encoded,'Добавление/удаление контактных данных')
    elif fnk_name=='reports_setting':
        q_sql = 'report.sprav_note_chg' + str([asid,orgid,adate])
        cur.callproc('report.sprav_note_chg',[asid,orgid,adate])
        cur.execute(q_sql)
        for row in cur:
            res=(row[0])
        encoded = base64.b64encode(q_sql.encode()).decode()
        logg_web.add_log(asid,encoded,'Редактирование примечания по справкам')
    elif val_param=='fast_find':
        q_sql = "select main.fast_find('"+ asid +"','"+ val_param1 +"','"+ val_param2 +"')"
        cur.execute(q_sql)
        for row in cur:
            res=(row[0])
    elif val_param=='news_portal':
        q_sql = "select main.news_portal('"+ asid +"','"+ val_param1 +"')"
        cur.execute(q_sql)
        for row in cur:
            res=(row[0])
    elif val_param=='addchg_accnote':
        q_sql = "select main.addchg_accnote('"+ asid +"','"+ val_param1 +"','"+ val_param2 +"','"+ val_param3 +"')"
        cur.execute(q_sql)
        for row in cur:
            res=(row[0])
        encoded = base64.b64encode(q_sql.encode()).decode()
        logg_web.add_log(asid,encoded,'Примечание по адресу')
    elif val_param=='loader_file_list':
        q_sql = 'loader.filelist' + str([asid,orgid])
        cur.callproc('loader.filelist',[asid,orgid])
        for row in cur:
            res=(row[0])
    elif val_param=='delfilepart':
        q_sql = "select loader.delfilepart('"+ asid +"','"+ val_param1 +"')"
        cur.execute(q_sql)
        for row in cur:
            res=(row[0])
        encoded = base64.b64encode(q_sql.encode()).decode()
        logg_web.add_log(asid,encoded,'Удалить лист платёжного документа')
    elif val_param=='document_list':
        q_sql = 'main.document_list' + str([asid,orgid])
        cur.callproc('main.document_list',[asid,orgid])
        for row in cur:
            res=(row[0])
    elif val_param=='rollback_bank':
        q_sql = "select main.rollback_bank_doc('"+ asid +"','"+ val_param1 +"')"
        cur.execute(q_sql)
        for row in cur:
            res=(row[0])
        encoded = base64.b64encode(q_sql.encode()).decode()
        logg_web.add_log(asid,encoded,'Удалить проведённый платёжный документ')
    elif val_param=='document_rec':
        q_sql = "select main.document_rec('"+ asid +"','"+ val_param1 +"')"
        cur.execute(q_sql)
        for row in cur:
            res=(row[0])
    elif val_param=='registries_list':
        q_sql = 'main.registries_list' + str([asid,orgid])
        cur.callproc('main.registries_list',[asid,orgid])
        for row in cur:
            res=(row[0])
    elif val_param=='chg_passwd':
        q_sql = "select access.chg_passwd('"+ asid +"','"+ val_param1 +"','"+ val_param2 +"')"
        cur.execute(q_sql)
        for row in cur:
            res=(row[0])
        encoded = base64.b64encode(q_sql.encode()).decode()
        logg_web.add_log(asid,encoded,'Смена пароля')
    elif val_param=='chg_user_attr':
        q_sql = 'access.chg_user_attr' + str([asid,adate])
        cur.callproc('access.chg_user_attr',[asid,adate])
        for row in cur:
            res=(row[0])
        encoded = base64.b64encode(q_sql.encode()).decode()
        logg_web.add_log(asid,encoded,'Смена настроек пользователя')
    elif val_param=='ree_reestrs':
        q_sql = "select main.ree_reestrs('"+ asid +"','"+ val_param1 +"','"+ orgid +"','"+ val_param2 +"')"
        cur.execute(q_sql)
        for row in cur:
            res=(row[0])
    elif fnk_name=='get_registry':
        q_sql = 'main.ree_recodrs' + str([asid,orgid,adate])
        cur.callproc('main.ree_recodrs',[asid,orgid,adate])
        for row in cur:
            res=(row[0])
        encoded = base64.b64encode(q_sql.encode()).decode()
        logg_web.add_log(asid,encoded,'Открытие реестра')
    elif fnk_name=='addchg_ree_recodrs':
        adate=urllib.parse.unquote(adate)
        q_sql = 'main.addchg_ree_recodrs' + str([asid,orgid,adate])
        tracert.tprint('addchg_ree_recodrs',q_sql)
        cur.callproc('main.addchg_ree_recodrs',[asid,orgid,adate])
        for row in cur:
            res=(row[0])
        encoded = base64.b64encode(q_sql.encode()).decode()
        logg_web.add_log(asid,encoded,'Добавление редактирование строки в реестре')
    elif val_param=='house_groups':
        q_sql = "select main.adddel_house_group('"+ asid +"','"+ orgid +"','"+ val_param1 +"','"+ val_param2 +"','"+ val_param3 +"')"
        cur.execute(q_sql)
        for row in cur:
            res=(row[0])
        encoded = base64.b64encode(q_sql.encode()).decode()
        logg_web.add_log(asid,encoded,'Добавление группы домов')
    elif val_param=='house_group_list':
        q_sql = 'main.house_group_list' + str([asid,orgid])
        cur.callproc('main.house_group_list',[asid,orgid])
        for row in cur:
            res=(row[0])
    elif val_param=='add_usr_hsgrlst':
        q_sql = "select main.add_usr_hsgrlst('"+ asid +"','"+ orgid +"','"+ val_param1 +"','"+ val_param2 +"','"+ val_param3 +"')"
        cur.execute(q_sql)
        for row in cur:
            res=(row[0])
    elif val_param=='house_group_usr':
        q_sql = "select main.house_group_usr('"+ asid +"','"+ val_param1 +"')"
        cur.execute(q_sql)
        for row in cur:
            res=(row[0])
    elif fnk_name=='registry_settings':
        q_sql = 'main.chgthead_reereestrs' + str([asid,orgid,adate])
        cur.callproc('main.chgthead_reereestrs',[asid,orgid,adate])
        for row in cur:
            res=(row[0])
        encoded = base64.b64encode(q_sql.encode()).decode()
        logg_web.add_log(asid,encoded,'Изменение заголовка реестра')
    elif val_param=='ree_reestrs_close':
        q_sql = "select main.ree_reestrs_close('"+ asid +"','"+ val_param1 +"')"
        cur.execute(q_sql)
        for row in cur:
            res=(row[0])
        encoded = base64.b64encode(q_sql.encode()).decode()
        logg_web.add_log(asid,encoded,'Закрытие реестра')
    elif val_param=='chg_reputation':
        q_sql = "select main.chg_reputation('"+ asid +"','"+ val_param1 +"','"+ val_param2 +"')"
        cur.execute(q_sql)
        for row in cur:
            res=(row[0])
        encoded = base64.b64encode(q_sql.encode()).decode()
        logg_web.add_log(asid,encoded,'Изменение репутации')
    elif fnk_name=='ree_regular_create':
        q_sql = 'main.ree_regular_create' + str([asid,orgid,adate])
        cur.callproc('main.ree_regular_create',[asid,orgid,adate])
        for row in cur:
            res=(row[0])
        encoded = base64.b64encode(q_sql.encode()).decode()
        logg_web.add_log(asid,encoded,'Создание регулярного реестра')
    elif fnk_name=='ree_print_registry_content':
        q_sql = 'main.ree_print_registry_content' + str([asid,orgid,adate])
        cur.callproc('main.ree_print_registry_content',[asid,orgid,adate])
        for row in cur:
            res=(row[0])
        encoded = base64.b64encode(q_sql.encode()).decode()
        logg_web.add_log(asid,encoded,'Просмотр документа массовой печати')
    elif fnk_name=='chg_history_foropl':
        q_sql = 'main.chg_history_foropl' + str([asid,orgid,adate])
        cur.callproc('main.chg_history_foropl',[asid,orgid,adate])
        for row in cur:
            res=(row[0])
        encoded = base64.b64encode(q_sql.encode()).decode()
        logg_web.add_log(asid,encoded,'Разбивка оплаты')
    elif fnk_name=='get_last_pay_date':
        q_sql = 'main.get_last_pay_date' + str([asid,orgid,adate])
        cur.callproc('main.get_last_pay_date',[asid,orgid,adate])
        for row in cur:
            res=(row[0])
        encoded = base64.b64encode(q_sql.encode()).decode()
        logg_web.add_log(asid,encoded,'Разбивка оплаты')
    elif fnk_name=='log_views':
        cur.callproc('log.log_views',[asid,adate])
        for row in cur:
            res=(row[0])
    elif fnk_name=='get_egrp_rec':
        q_sql = 'main.get_egrp_rec' + str([asid,orgid,adate])
        cur.callproc('main.get_egrp_rec',[asid,orgid,adate])
        for row in cur:
            res=(row[0])
        encoded = base64.b64encode(q_sql.encode()).decode()
        logg_web.add_log(asid,encoded,'Добавление собственников из ЕГРП')
    elif fnk_name=='get_fssp_rec':
        q_sql = 'main.get_fssp_rec' + str([asid,orgid,adate])
        cur.callproc('main.get_fssp_rec',[asid,orgid,adate])
        for row in cur:
            res=(row[0])
        encoded = base64.b64encode(q_sql.encode()).decode()
        logg_web.add_log(asid,encoded,'Запрос истории ФССП')
    elif fnk_name=='pfile_lst':
        q_sql = 'loader.get_pfile_lst' + str([asid,adate])
        cur.callproc('loader.get_pfile_lst',[asid,adate])
        for row in cur:
            res=(row[0])
    elif fnk_name=='pfile_arh_cre':
        cur.callproc('main.webrqst',[asid,'uname'])
        for row in cur:
            res=(row[0])
        pfilearh.run(asid,res)
        res=("/personal/" + res + "/pfile.zip")

    conn.commit()
    cur.close()
    conn.close()
    return res