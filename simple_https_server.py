# taken from http://www.piware.de/2011/01/creating-an-https-server-in-python/
# generate server.xml with the following command:
#    openssl req -new -x509 -keyout server.pem -out server.pem -days 365 -nodes
# run as follows:
#    python simple-https-server.py
# then in your browser, visit:
#    https://localhost:4443

#import BaseHTTPServer, SimpleHTTPServer
#import ssl

#httpd = BaseHTTPServer.HTTPServer(('0.0.0.0', 443), SimpleHTTPServer.SimpleHTTPRequestHandler)
#httpd.socket = ssl.wrap_socket (httpd.socket, certfile='./server.pem', server_side=True)
#httpd.serve_forever()

from http.server import HTTPServer, SimpleHTTPRequestHandler 
import ssl
httpd = HTTPServer(('0.0.0.0', 443), SimpleHTTPRequestHandler)
httpd.socket = ssl.wrap_socket(
            httpd.socket,
                #keyfile="path/to/key.pem",
                    certfile='./server.pem',
                        server_side=True)
httpd.serve_forever()
