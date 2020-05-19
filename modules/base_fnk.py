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

#house_tree
#account_history
#adr_info
#addchg_human
#addchg_kvdocs
#chg_place_val
#addchg_contact
#sprav_note_chg
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
#ree_recodrs
#addchg_ree_recodrs
#house_groups
#house_groups_list
#add_usr_hsgrlst
#chgthead_reereestrs
#chg_history_setting
#chg_reputation
#ree_regular_create
#ree_print_registry_content
#chg_history_foropl

def fnk_lst (asid,orgid,fnk_name,adate,val_param,val_param1,val_param2,val_param3,val_param4,val_param5,val_param6,val_param7,val_param8,val_param9,val_param10):
    conn = db_conn.db_connect('web_receivables')
    cur = conn.cursor()
    res=''
    if fnk_name=='chg_history_setting':
        q_sql = "select main.chg_history_setting('"+ asid +"','"+ orgid +"','"+ adate +"')"
        cur.execute(q_sql)
        for row in cur:
            res=(row[0])
        encoded = base64.b64encode(q_sql.encode()).decode()
        logg_web.add_log(asid,encoded,'Изменение настроект')
    if val_param=='house_tree':
        q_sql = "select main.house_tree('"+ asid +"','"+ orgid +"','"+ val_param1 +"')"
        cur.execute(q_sql)
        for row in cur:
            res=(row[0])
    elif val_param=='account_history':
        q_sql = "select main.account_history('"+ asid +"','"+ val_param1 +"','"+ val_param2 +"','"+ orgid +"')"
        print(q_sql)
        cur.execute(q_sql)
        for row in cur:
            res=(row[0])
    elif val_param=='adr_info':
        q_sql = "select main.adr_info('','"+ val_param1 +"')"
        cur.execute(q_sql)
        for row in cur:
            res=(row[0])
    elif val_param=='addchg_human':
        q_sql = "select main.addchg_human('"+ asid +"','"+ val_param1 +"','"+ val_param2 +"','"+ val_param3 +"','"+ val_param4 +"','"+ val_param5 +"','"+ val_param6 +"','"+ val_param7 +"','"+ val_param8 +"')"
        cur.execute(q_sql)
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
    elif val_param=='sprav_note_chg':
        q_sql = "select report.sprav_note_chg('"+ asid +"','"+ val_param1 +"','"+ val_param2 +"','"+ val_param3 +"','"+ val_param4 +"')"
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
        q_sql = "select loader.filelist('"+ asid +"','"+ orgid +"')"
        cur.execute(q_sql)
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
        q_sql = "select main.document_list('"+ asid +"','"+ orgid +"')"
        cur.execute(q_sql)
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
        q_sql = "select main.registries_list('"+ asid +"','"+ orgid +"')"
        cur.execute(q_sql)
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
        q_sql = "select access.chg_user_attr('"+ asid +"','"+ val_param1 +"','"+ val_param2 +"')"
        cur.execute(q_sql)
        for row in cur:
            res=(row[0])
        encoded = base64.b64encode(q_sql.encode()).decode()
        logg_web.add_log(asid,encoded,'Смена настроек пользователя')
    elif val_param=='ree_reestrs':
        q_sql = "select main.ree_reestrs('"+ asid +"','"+ val_param1 +"','"+ orgid +"','"+ val_param2 +"')"
        cur.execute(q_sql)
        for row in cur:
            res=(row[0])
    elif val_param=='ree_recodrs':
        q_sql = "select main.ree_recodrs('"+ asid +"','"+ val_param1 +"','"+ val_param2 +"')"
        print(q_sql)
        cur.execute(q_sql)
        for row in cur:
            res=(row[0])
    elif val_param=='addchg_ree_recodrs':
        q_sql = "select main.addchg_ree_recodrs('"+ asid +"','"+ val_param1 +"','"+ val_param2 +"','"+ val_param3 +"','"+ val_param4 +"','"+ val_param5 +"','"+ val_param6 +"','"+ val_param7 +"','"+ val_param8 +"','"+ val_param9 +"','"+ val_param10 +"')"
        cur.execute(q_sql)
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
        q_sql = "select main.house_group_list('"+ asid +"','"+ orgid +"')"
        cur.execute(q_sql)
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
    elif val_param=='chgthead_reereestrs':
        q_sql = "select main.chgthead_reereestrs('"+ asid +"','"+ val_param1 +"','"+ adate +"')"
        cur.execute(q_sql)
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
        q_sql = "select main.ree_regular_create('"+ asid +"','"+ orgid +"','"+ adate +"')"
        cur.execute(q_sql)
        for row in cur:
            res=(row[0])
        encoded = base64.b64encode(q_sql.encode()).decode()
        logg_web.add_log(asid,encoded,'Создание регулярного реестра')
    elif fnk_name=='ree_print_registry_content':
        q_sql = "select main.ree_print_registry_content('"+ asid +"','"+ orgid +"','"+ adate +"')"
        cur.execute(q_sql)
        for row in cur:
            res=(row[0])
        encoded = base64.b64encode(q_sql.encode()).decode()
        logg_web.add_log(asid,encoded,'Просмотр документа массовой печати')
    elif fnk_name=='chg_history_foropl':
        q_sql = "select main.chg_history_foropl('"+ asid +"','"+ orgid +"','"+ adate +"')"
        print(q_sql)
        cur.execute(q_sql)
        for row in cur:
            res=(row[0])
        encoded = base64.b64encode(q_sql.encode()).decode()
        logg_web.add_log(asid,encoded,'Разбивка оплаты')



        
    conn.commit()
    cur.close()
    conn.close()
    return res