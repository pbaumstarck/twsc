import os
import re
import webapp2
from google.appengine.ext.webapp import template

class MainPage(webapp2.RequestHandler):
    def get(self):
        path = os.path.join(os.path.dirname(__file__), 'index.html')
        safe_for_work = 'sfw' in self.request.arguments() and self.request.get('sfw')
        template_args = {
            "compiled": True,
            "safe_for_work": bool(safe_for_work)
        }
        self.response.out.write(template.render(path, template_args))

app = webapp2.WSGIApplication([('/', MainPage)], debug=True)
