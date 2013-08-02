
import cgi
import os
import re
import urllib
import webapp2
from google.appengine.api import users
from google.appengine.api import search
from google.appengine.ext import ndb
from google.appengine.ext.webapp import template


EVENTS_INDEX = search.Index(name="Events_Index")
#search.Index(name=_INDEX_NAME).put(document)


class Event(ndb.Model):
  author = ndb.UserProperty()
  author_id = ndb.StringProperty(required=True)
  content = ndb.StringProperty(indexed=False)
  date = ndb.DateTimeProperty(auto_now_add=True)

  def Index(self):
     return search.Document(
        fields=[search.TextField(name='author', value=nickname),
                search.HtmlField(name='comment', value=content),
                search.DateField(name='date', value=datetime.now().date())])


class MainPage(webapp2.RequestHandler):
  def get(self):
    path = os.path.join(os.path.dirname(__file__), 'index.html')
    safe_for_work = 'sfw' in self.request.arguments() and self.request.get('sfw')
    template_args = {
        "compiled": False,
        "safe_for_work": bool(safe_for_work),
    }
    self.response.out.write(template.render(path, template_args))


class SandboxPage(webapp2.RequestHandler):
  def get(self):
    path = os.path.join(os.path.dirname(__file__), 'sandbox.html')
    events = Event.query().fetch()
    event_strs = []
    for event in events:
      event_strs.append("author: %s; author ID: %s; content: %s; date: %s" % (
          event.author, event.author_id, cgi.escape(event.content), str(event.date)))
    self.response.out.write(template.render(path, {
      "event_strs": event_strs,
    }))


class SignHandler(webapp2.RequestHandler):
  def post(self):
    if not users.get_current_user():
      self.response.write('<html><body>Y U NO LOGIN!?!??!!?/2~!~!?~?!?~?!</body></html>')
      return
    event = Event()
    event.author = users.get_current_user()
    event.author_id = users.get_current_user().user_id()
    event.content = self.request.get('content')
    event.put()
    self.response.write('<html><body>PUT\'ED!</body></html>')


app = webapp2.WSGIApplication([
  ('/', MainPage),
  ('/sandbox', SandboxPage),
  ('/sign', SignHandler)], debug=True)
