#!/usr/bin/env python

import httplib, urllib, re, sys

# Scrape the template page to figure out all the JS we want to include
lines = open('../index.html', 'r').readlines()
scripts = []
# Only start keeping scripts after we've seen an 'else'
seen_else = False
for line in lines:
  if seen_else:
    src_match = re.search(r'type\s*=\s*"text/javascript".*?\ssrc\s*=\s*"([^"]+)"', line)
    if src_match:
     scripts.append(src_match.group(1))
  elif re.search(r'{% else %}', line):
    seen_else = True

source = '\n'.join([open('..' + script, 'r').read() for script in scripts
    if re.match(r'/javascript/', script)])

# Define the parameters for the POST request and encode them in a URL-safe
# format.
params = urllib.urlencode([
    ('js_code', source),#sys.argv[1]),
    ('compilation_level', 'WHITESPACE_ONLY'),#'SIMPLE_OPTIMIZATIONS'),
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
print "Old data: " + str(len(source))
print "New data: " + str(len(data))
print "%% reduction: " + str(float(int(10000 * (len(source) - len(data)) / len(source))) / 100.0)
#print data
conn.close()


