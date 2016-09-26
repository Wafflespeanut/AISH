# -*- coding: utf-8 -*-
# This is much like a 'watchdog' that polls over some files and whenever
# it detects a change, it generates a JS file with the giant raw string
# (among other things) in a valid (JS-parsable) format

from datetime import datetime
from time import sleep

import os, inspect

SELF = inspect.getfile(inspect.currentframe())
JS = os.path.join(os.path.dirname(SELF), 'gen.js')
CSS = os.path.join(os.path.dirname(SELF), 'payload.css')

# Useful colors... (http://ethanschoonover.com/solarized)
#
# #002b36
# #073642
# #586e75
# #657b83
# #839496
# #93a1a1
# #eee8d5
# #fdf6e3
# #b58900
# #cb4b16
# #dc322f
# #d33682
# #6c71c4
# #268bd2
# #2aa198
# #859900

# Stuff which will be blindly appended...

tags = '''
<div id='block'></div>
<div id='pop'></div>
'''

script = '''
var input_msgs = ["Go ahead! Click it!",
                  "C'mon... What are you waiting for? Click it!",
                  "You can do it lad!",
                  "Now, you're really making me wait!"];
'''

def raw_scriptify(string):    # working around unicode representation
    string = '\n%s\n' % string
    raw_string = "%s" % repr(string.decode('utf-8')).replace('"', '\\"')
    start, end = raw_string.find('\\n'), raw_string.rfind('\\n') + 2
    return raw_string[start:end]

time_stamp_css, time_stamp_self = 0, os.stat(SELF).st_mtime
tags_line = 'var tags = "%s";\n' % raw_scriptify(tags)

def write():
    with open(CSS, 'r') as fd:
        style_line = 'var style = "%s";\n' % raw_scriptify(fd.read())

    with open(JS, 'w') as fd:
        print "%s: Generating %r..." % (datetime.now(), JS)
        fd.write(style_line.encode('utf-8') + tags_line + script)

try:
    print 'Watching for file changes...'
    while True:
        if os.stat(CSS).st_mtime != time_stamp_css:
            time_stamp_css = os.stat(CSS).st_mtime
            write()
        if os.stat(SELF).st_mtime != time_stamp_self:
            break
        sleep(0.5)

    print '\nChanges found in watchdog! Re-executing...'
    execfile(SELF)

except KeyboardInterrupt:
    pass
