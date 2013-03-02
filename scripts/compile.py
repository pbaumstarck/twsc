#!/usr/bin/env python

import httplib, urllib, re, sys

# Scrape the template page to figure out all the JS we want to include
lines = open('../index.html', 'r').readlines()
scripts = []
for line in lines:
  src_match = re.match(r'.*type\s*=\s*"text/javascript".*?\ssrc\s*=\s*"([^"]+)".*', line)
  if src_match:
   scripts.append(src_match.group(1))

source = '\n'.join([open('..' + script, 'r').read() for script in scripts
    if re.match(r'^/javascript/.*', script)])


# Define the parameters for the POST request and encode them in a URL-safe
# format.
params = urllib.urlencode([
    ('js_code', source),#sys.argv[1]),
    ('compilation_level', 'SIMPLE_OPTIMIZATIONS'),
    ('output_format', 'text'),
    ('output_info', 'compiled_code'),
  ])

# Always use the following value for the Content-type header.
headers = { "Content-type": "application/x-www-form-urlencoded" }
conn = httplib.HTTPConnection('closure-compiler.appspot.com')
conn.request('POST', '/compile', params, headers)
response = conn.getresponse()
data = response.read()
open('../javascript/compiled.js', 'w').write(data)
#print data
conn.close()


