import tornado.httpserver
import tornado.ioloop
import tornado.web
import sys
import hashlib
import importlib
import os
import time
import json
import urllib
import requests
import zipfile
import base64
sys.path.append('/opt/IORDan/modules')
import logg_web
import db_conn
import base_fnk
import adm_base_fnk
import login_db
import loadxls
import unloadxls

class BaseHandler(tornado.web.RequestHandler):
    def get_current_user(self):
        asid = tornado.escape.native_str(self.get_secure_cookie("sid"))
        if asid is None:
            asid='0'
        res = login_db.chck_ss(asid)
        if res=='0':
            self.clear_cookie("user")
            self.clear_cookie("password")
            self.clear_cookie("sid")
        else:
            return self.get_secure_cookie("user")
            return self.get_secure_cookie("password")
            return self.get_secure_cookie("sid")

class LoginHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("frontend/html/login_page.html")

    def post(self):
        passwd =  self.get_argument('password')
        lname = self.get_argument('email')
        loginname = lname.lower()
        ip_adr = self.request.remote_ip
        asid = login_db.login(loginname, passwd, ip_adr)
        #print (asid)
        if asid !='no_usr_or_pwd':
            self.set_secure_cookie("user", loginname)
            self.set_secure_cookie("password", passwd)
            self.set_secure_cookie("sid", str(asid))
            self.redirect("/main")
            #self.write('1')
        else:
            self.clear_cookie("user")
            self.clear_cookie("password")
            self.clear_cookie("sid")
            self.write(asid)

class MainHandler(BaseHandler):
    def get(self):
        if not self.current_user:
            self.redirect("/")
            return
        self.render("frontend/html/main_page.html")
        #self.write('Нет прав доступа')

class AnminHandler(BaseHandler):
    def get(self):
        if not self.current_user:
            self.redirect("/")
            return
        asid = tornado.escape.native_str(self.get_secure_cookie("sid"))
        conn = db_conn.db_connect('web_receivables')
        cur = conn.cursor()
        q_sql = "select access.user_rights('"+asid +"')"
        cur.execute(q_sql)
        for row in cur:
            res=json.loads(row[0])
        try:
            utupe = res["u_type"]
        except:
            utupe = ''
        if utupe=='admin':
            self.render("frontend/html/admin_page.html")
        else:
            self.write('Нет прав доступа')

class Base_FNCHandler(BaseHandler):
    def post(self):
        #autor = tornado.escape.native_str(self.get_secure_cookie('user'))
        asid = tornado.escape.native_str(self.get_secure_cookie("sid"))
        orgid = str(self.get_cookie('companyId'))
        val_param = self.get_argument('val_param')
        try:
            adate = str(((self.request.body).decode('UTF8')))
        except:
            adate = ''
        try:
            val_param1 = self.get_argument('val_param1')
        except:
            val_param1 = ''
        try:
            val_param2 = self.get_argument('val_param2')
        except:
            val_param2 = ''
        try:
            val_param3 = self.get_argument('val_param3')
        except:
            val_param3 = ''
        try:
            val_param4 = self.get_argument('val_param4')
        except:
            val_param4 = ''
        try:
            val_param5 = self.get_argument('val_param5')
        except:
            val_param5 = ''
        try:
            val_param6 = self.get_argument('val_param6')
        except:
            val_param6 = ''
        try:
            val_param7 = self.get_argument('val_param7')
        except:
            val_param7 = ''
        try:
            val_param8 = self.get_argument('val_param8')
        except:
            val_param8 = ''
        try:
            val_param9 = self.get_argument('val_param9')
        except:
            val_param9 = ''
        try:
            val_param10 = self.get_argument('val_param10')
        except:
            val_param10 = ''
        res=base_fnk.fnk_lst(asid,orgid,adate,val_param,val_param1,val_param2,val_param3,val_param4,val_param5,val_param6,val_param7,val_param8,val_param9,val_param10)
        if res == None:
            res=''
        #print(res)            
        self.write(res)

class Base_ADMINHandler(BaseHandler):
    def post(self):
        #autor = tornado.escape.native_str(self.get_secure_cookie('user'))
        asid = tornado.escape.native_str(self.get_secure_cookie("sid"))
        orgid = str(self.get_cookie('companyId'))
        fnk_name = self.get_argument('fnk_name')
        try:
            val_param1 = self.get_argument('val_param1')
        except:
            val_param1 = ''
        try:
            val_param2 = self.get_argument('val_param2')
        except:
            val_param2 = ''
        try:
            val_param3 = self.get_argument('val_param3')
        except:
            val_param3 = ''
        try:
            val_param4 = self.get_argument('val_param4')
        except:
            val_param4 = ''
        try:
            val_param5 = self.get_argument('val_param5')
        except:
            val_param5 = ''
        try:
            val_param6 = self.get_argument('val_param6')
        except:
            val_param6 = ''
        try:
            val_param7 = self.get_argument('val_param7')
        except:
            val_param7 = ''
        try:
            val_param8 = self.get_argument('val_param8')
        except:
            val_param8 = ''
        try:
            val_param9 = self.get_argument('val_param9')
        except:
            val_param9 = ''
        try:
            val_param10 = self.get_argument('val_param10')
        except:
            val_param10 = ''
        res=adm_base_fnk.fnk_lst(asid,orgid,fnk_name,val_param1,val_param2,val_param3,val_param4,val_param5,val_param6,val_param7,val_param8,val_param9,val_param10)
        if res == None:
            res=''
        #print(fnk_name +' '+res)            
        self.write(res)


class ReportHandler(BaseHandler):
    def get(self):
        if not self.current_user:
            self.redirect("/")
            return
        asid = tornado.escape.native_str(self.get_secure_cookie("sid"))
        accid = self.get_argument('accid')
        humanid = self.get_argument('humanid')
        rtype = self.get_argument('rtype')
        rnum = self.get_argument('rnum')
        try:
            multi = self.get_argument('multi')
        except:
            multi = ''
        conn = db_conn.db_connect('web_receivables')
        cur = conn.cursor()
        if rtype == 'certificate' and multi=='':
            q_sql = "select report.sprav"+ rnum +"('"+ asid +"','"+ accid +"','"+ humanid +"')"
            print(q_sql)
            cur.execute(q_sql)
            for row in cur:
                res=(row[0])
                self.write(res)
            encoded = base64.b64encode(q_sql.encode()).decode()
            logg_web.add_log(asid,encoded,'Выполнение справки')
        elif rtype == 'report' and multi=='':
            dateb = self.get_argument('dateb')
            datee = self.get_argument('datee')
            q_sql = "select report.rep"+ rnum +"('"+ asid +"','"+ accid +"','"+ humanid +"','"+ dateb +"','"+ datee +"')"
            print(q_sql)
            cur.execute(q_sql)
            for row in cur:
                res=(row[0])
                self.write(res)
            encoded = base64.b64encode(q_sql.encode()).decode()
            logg_web.add_log(asid,encoded,'Выполнение отчёта')
        elif multi=='true':
            q_sql = "select report.rep_multi('"+ asid +"','"+ accid +"','"+ rtype +"','"+ rnum +"')"
            #print(q_sql)
            cur.execute(q_sql)
            for row in cur:
                res=(row[0])
                self.write(res)
            encoded = base64.b64encode(q_sql.encode()).decode()
            logg_web.add_log(asid,encoded,'Выполнение массового отчёта/справки')
        elif multi!='true' and multi!='':
            dateb = self.get_argument('dateb')
            datee = self.get_argument('datee')
            q_sql = "select report.rep_fast_access('"+ asid +"','"+ accid +"','"+ rtype +"','"+ dateb +"','"+ datee +"','"+ multi +"')"
            print(q_sql)
            cur.execute(q_sql)
            for row in cur:
                res=(row[0])
                self.write(res)
            encoded = base64.b64encode(q_sql.encode()).decode()
            logg_web.add_log(asid,encoded,'Выполнение групового отчёта/справки')
        cur.close()
        conn.close()

class WebRequestHandler(BaseHandler):
    def get(self):
        if not self.current_user:
            self.redirect("/login")
            return
        asid = tornado.escape.native_str(self.get_secure_cookie('sid'))
        val_param = self.get_argument('query')
        conn = db_conn.db_connect('web_receivables')
        cur = conn.cursor()
        if val_param=='user_rights':
            q_sql = "select access.user_rights('"+asid +"')"
        else:
            q_sql = "select main.webrqst('"+asid +"','"+ val_param +"')"
        #print(q_sql)
        cur.execute(q_sql)
        for row in cur:
            res=(row[0])
            self.write(res)
        conn.commit()
        cur.close()
        conn.close()

class FilelistHandler(BaseHandler):
    def get(self):
        if not self.current_user:
            self.redirect("/login")
            return
        asid = tornado.escape.native_str(self.get_secure_cookie("sid"))
        name = tornado.escape.xhtml_escape(self.current_user)
        self.write ('[')
        for root, dirs, files in os.walk('upload/'): 
                string=''
                for f in files:
                    string+='{"name":"'+f+'","creationTime":"'+time.ctime(os.path.getctime(root+"/"+f))+'"},'
        self.write (string.rstrip(','))
        self.write(']')


class UploadHandler(tornado.web.RequestHandler):
    def post(self):
        asid = tornado.escape.native_str(self.get_secure_cookie("sid"))
        autor = tornado.escape.native_str(self.get_secure_cookie("user"))
        file1 = self.request.files['file'][0]
        original_fname = file1['filename']
        #fexist = os.path.exists("www/upload/" + autor + "/" + original_fname)
        fexist = os.path.exists("upload/" + original_fname)
        if fexist==True:
           for cnt in range (1,1000):
               final_filename = "Копия_"+str(cnt)+"-"+original_fname
               #fexist = os.path.exists("upload/" + autor + "/" + final_filename)
               fexist = os.path.exists("upload/" + final_filename)
               if fexist==True:
                  cnt =+1
               else:
                  break
        else:
           final_filename = original_fname
        #output_file = open("upload/" + autor + "/" + final_filename, 'wb')
        output_file = open("upload/" + final_filename, 'wb')
        output_file.write(file1['body'])
        output_file.close()
        self.write('success')
        #logg_web.add_log(asid,'','Загрузка файла на портал',final_filename)

class OpFileHandler(tornado.web.RequestHandler):
    def post(self):
        asid = tornado.escape.native_str(self.get_secure_cookie("sid"))
        autor = tornado.escape.native_str(self.get_secure_cookie('user'))
        attr = self.get_argument('attr')
        fname = self.get_argument('fname')
        if attr=='del':
           os.remove('upload/'+fname)
           self.write('success')
        elif attr=='runformat':
            org_id = self.get_argument('org_id')
            fname_short = fname
            fname = "upload/" + fname
            conn = db_conn.db_connect('web_receivables')
            loadxls.LoadFile(fname,conn,asid,fname_short)
            cur = conn.cursor()
            q_sql = "select loader.addfileparam('"+fname_short +"','orgid','"+ org_id +"')"
            cur.execute(q_sql)
            conn.commit()
            zipname=str(time.time())
            z = zipfile.ZipFile("archive/" + zipname+'.zip', 'w', zipfile.ZIP_DEFLATED)
            z.write(fname)
            z.close()
            os.remove(fname)
            self.write('success')

class BankTemplHandler(BaseHandler):
    def get(self):
        if not self.current_user:
            self.redirect("/login")
            return
        asid = tornado.escape.native_str(self.get_secure_cookie('sid'))
        pid = self.get_argument('pid')
        orgid = self.get_argument('orgid')
        tname = self.get_argument('templ_name')
        conn = db_conn.db_connect('web_receivables')
        cur = conn.cursor()
        q_sql = "select loader.bank_template"+tname +"('"+asid +"','"+ pid +"','"+ orgid +"')"
        print(q_sql)
        cur.execute(q_sql)
        #print(conn.notices)
        #self.write(conn.notices)
        for notice in conn.notices:
            print(notice)
        for row in cur:
            res=(row[0])
            #print(res)
            self.write(res)
        cur.close()
        conn.close()

    def post(self):
        asid = tornado.escape.native_str(self.get_secure_cookie('sid'))
        doc_id = self.get_argument('doc_id')
        doc_summ = self.get_argument('doc_summ')
        num = self.get_argument('num')
        page_json = ((self.request.body).decode('UTF-8'))
        conn = db_conn.db_connect('web_receivables')
        cur = conn.cursor()
        q_sql = "select main.load_bank_doc('"+asid +"','"+ doc_id +"','"+ num +"','"+ page_json +"','"+ doc_summ +"')"
        print(q_sql)
        cur.execute(q_sql)
        for row in cur:
            res=(row[0])
            self.write(res)
        conn.commit()
        cur.close()
        conn.close()


class RedmineHandler(tornado.web.RequestHandler):
    def get(self):
        request = self.get_argument('request')
        url = "https://intelgradplus.ru:10443"+request
        response = requests.get(url)
        self.write(response.content)

    def post(self):
        request = self.get_argument('request')
        encoding = 'windows-1251'
        #args = ((self.request.body).decode(encoding))
        args = self.request.body
        url = "https://intelgradplus.ru:10443"+request
        response = requests.post(url, headers={"Content-Type": "application/json"}, data=args)
        self.write(response.text)

class ReportsrvHandler(BaseHandler):
    def post(self):
        asid = tornado.escape.native_str(self.get_secure_cookie("sid"))
        autor = tornado.escape.native_str(self.get_secure_cookie('user'))
        orgid = str(self.get_cookie('companyId'))
        attr = self.get_argument('attr')
        if attr=='list':
            conn = db_conn.db_connect('web_receivables')
            cur = conn.cursor()
            q_sql = "select report.report_list('"+ asid +"','"+ orgid +"')"
            cur.execute(q_sql)
            for row in cur:
                res=(row[0])
            self.write(res)
        else:
            param = ((self.request.body).decode('UTF8'))
            conn = db_conn.db_connect('web_receivables')
            cur = conn.cursor()
            q_sql = "select report."+attr+"('"+ asid +"','"+ orgid +"','"+param+"')"
            print(q_sql)
            cur.execute(q_sql)
            for row in cur:
                res=(row[0])
            self.write(res)

class ConverHandler(BaseHandler):
    def post(self):
        html_body = ((self.request.body).decode('UTF8'))
        ftype = self.get_argument('type')
        file_name = self.get_argument('file_name')
        if ftype=='xls':
            res=unloadxls.UnloadFile(html_body,file_name)
        self.write(res)


settings = {
    "cookie_secret": "plhfdcndeqltleirfvjhjp111",
}

application = tornado.web.Application([
    (r"/", LoginHandler),
    (r"/main", MainHandler),
    (r"/base_func", Base_FNCHandler),
    (r"/admin_func", Base_ADMINHandler),
    (r"/report", ReportHandler),
    (r"/web_request", WebRequestHandler),
    (r"/upload", UploadHandler),
    (r"/bank_template", BankTemplHandler),
    (r"/opfile", OpFileHandler),
    (r"/filelist", FilelistHandler),
    (r"/admin", AnminHandler),
    (r"/redmine", RedmineHandler),
    (r"/report_srv", ReportsrvHandler),
    (r"/conver", ConverHandler),
    (r"/css/(.*)", tornado.web.StaticFileHandler, {'path': 'frontend/css'}),
    (r"/js/(.*)", tornado.web.StaticFileHandler, {'path': 'frontend/js'}),
    (r"/icon/(.*)", tornado.web.StaticFileHandler, {'path': '/opt/material-design-icons'}),
    (r"/images/(.*)", tornado.web.StaticFileHandler, {'path': 'frontend/images'}),
    (r"/download/(.*)", tornado.web.StaticFileHandler, {'path': 'download'}),
#], **settings)
], **settings, debug=True)

if __name__ == "__main__":
    print ("WEB server Running...")
    print ("Press ctrl + C to close")
    #http_server = tornado.httpserver.HTTPServer(application,xheaders=True, ssl_options={'certfile': 'ssl/tornado.crt', 'keyfile': 'ssl/tornado.key'})
    #http_server = tornado.httpserver.HTTPServer(application, ssl_options={'certfile': 'ssl/tornado.crt', 'keyfile': 'ssl/tornado.key'})
    #http_server.listen(443)
    http_server = tornado.httpserver.HTTPServer(application)
    http_server.listen(8082)
    tornado.ioloop.IOLoop.instance().start()