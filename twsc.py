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
                    <script type="text/javascript" src="https://www.google.com/jsapi"></script>
                    <script type="text/javascript" src="/javascript/auth.js"></script>
                    <script src="https://apis.google.com/js/client.js?onload=googleApiClientReady"></script>
                    <script type="text/javascript" src="/javascript/jstz.min.js"></script>
                    <script type="text/javascript" src="/javascript/mst.js"></script>
                    <script type="text/javascript" src="/javascript/colors.js"></script>
                    <script type="text/javascript" src="/javascript/numbers.js"></script>
                    <script type="text/javascript" src="/javascript/plots.js"></script>
                    <script type="text/javascript" src="/javascript/mst3k.js"></script>
                    <script type="text/javascript" src="/javascript/site.js"></script>
                    <script type="text/javascript">
                        google.load('visualization', '1.0', {'packages':['corechart']});
                    </script>
                </head>
                <body>
                    <font size="-1" face="Verdana">
                    <center>
                        <img id="image" src="/imgs/twsc.png" width="400" title="This thing is called the Twin-Screw Universal Controller and it's used to control *everything*! / Well, gee, *everything*'s a lot of stuff, Joel ... / Yeah, I'll say it is!"></img><br />
                        <!-- "This thing is called the Twin-Screw Universal Controller and it's used to control *everything*!"<br />
                        "Well, gee, *everything*'s a lot of stuff, Joel ..."<br />
                        "Yeah, I'll say it is!"<br /> -->
                	    <input id="twsc" type="textbox" style="width: 400px;" placeholder="Type something"></input>
                	    <br /> 
                	    <br /> 
                    </center>
                        <div id="results" style="margin-left: auto; margin-right: auto;">
                            <table width="600" border="0" align="center">
                                <tr>
                                    <td colspan="2" align="center">
                                        <br />
                                        <i>Try these commands:</i>
                                    </td>
                                </tr>
                                <tr>
                                    <td valign="top" width="140">help</td>
                                    <td valign="top">To see this help menu again.</td>
                                </tr>
                                <tr>
                                    <td valign="top" width="140">mst</td>
                                    <td valign="top">To fetch a random MST3K episode.</td>
                                </tr>
                                <tr>
                                    <td valign="top" width="140">mst 514</td>
                                    <td valign="top">To look up what episode that is, and automatically search YouTube for it.
                                        Also accepts multiple arguments, e.g., 'mst 514 109 113'</td>
                                </tr>
                                <tr>
                                    <td valign="top" width="140">mst -s=12345</td>
                                    <td valign="top">To fetch a random MST3K episode from seasons 1 through 5.
                                        Use a 'K' to enable KTMA episodes, and an 'A' or a '10' to enable season 10 episodes.</td>
                                </tr>
                                <tr>
                                    <td valign="top" width="140">mst -ns=K</td>
                                    <td valign="top">To fetch a random MST3K episode not from season K.
                                        Use the same patterns from above for other seasons.</td>
                                </tr>
                                <tr>
                                    <td valign="top" width="140">mst -f=eye</td>
                                    <td valign="top">To search for MST3K episodes that contain that pattern.</td>
                                </tr>
                                <tr>
                                    <td valign="top" width="140">
                                        red<br />
                                        #ff0044<br />
                                        #c08<br />
                                        red blue green violet
                                    </td>
                                    <td valign="top">See some rendered HTML color swatches.</td>
                                </tr>
                                <tr>
                                    <td valign="top" width="140">
                                        red to blue
                                    </td>
                                    <td valign="top">To see a rendered fade between any two colors.</td>
                                </tr>
                                <!-- <tr>
                                    <td align="top">help</td>
                                    <td align="top">To see this screen again</td>
                                </tr> -->
                            </table>
                        </div>
                        </font>
                </body>
            </html>
            """)

app = webapp2.WSGIApplication([('/', MainPage)],
                              debug=True)
