import tornado.httpserver
import tornado.ioloop
import tornado.web


class LoginHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("redirect/redirect.html")

settings = {
    "cookie_secret": "plhfdcndeqltleirfvjhjp111",
}

application = tornado.web.Application([
    (r"/", LoginHandler),
], **settings)
#])

if __name__ == "__main__":
    print ("WEB server Running...")
    print ("Press ctrl + C to close")
    #http_server = tornado.httpserver.HTTPServer(application,xheaders=True, ssl_options={'certfile': 'ssl/tornado.crt', 'keyfile': 'ssl/tornado.key'})
    http_server = tornado.httpserver.HTTPServer(application, ssl_options={'certfile': 'opt/IORDan/ssl/tornado.crt', 'keyfile': 'opt/IORDan/ssl/tornado.key'})
    http_server.listen(443)
    #http_server = tornado.httpserver.HTTPServer(application)
    #http_server.listen(8082)
    tornado.ioloop.IOLoop.instance().start()