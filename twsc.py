import webapp2

class MainPage(webapp2.RequestHandler):
    def get(self):
        #self.response.headers['Content-Type'] = 'text/plain'
        self.response.out.write("""
             <!DOCTYPE html>
             <html>
                <head>
                    <title>Twin-Screw Universal Controller</title>
                    <link rel="stylesheet" type="text/css" href="/css/main.css">
                    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7/jquery.js"></script>
                    <script type="text/javascript" src="/javascript/mst.js"></script>
                    <script type="text/javascript" src="/javascript/colors.js"></script>
                    <script type="text/javascript" src="/javascript/numbers.js"></script>
                    <script type="text/javascript" src="/javascript/site.js"></script>
                </head>
                <body>
                    <center>
                        <img id="image" src="/imgs/twsc.png" width="400" title="This thing is called the Twin-Screw Universal Controller and it's used to control *everything*! / Well, gee, *everything*'s a lot of stuff, Joel ... / Yeah, I'll say it is!"></img><br />
                	    <input id="twsc" type="textbox" style="width: 400px;" placeholder="Type something"></input>
                	    <br /> 
                	    <br /> 
                        <div id="results"></div>
                    </center>
                </body>
            </html>
            """)

app = webapp2.WSGIApplication([('/', MainPage)],
                              debug=True)
