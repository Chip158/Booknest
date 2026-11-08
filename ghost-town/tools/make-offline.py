#!/usr/bin/env python3
"""Build ghost-town/mocha-offline.html: index.html with three.js r128 inlined, so one file runs with no network.
Usage: python3 ghost-town/tools/make-offline.py"""
import os
here = os.path.dirname(os.path.abspath(__file__))
root = os.path.dirname(here)
html = open(os.path.join(root, 'index.html'), encoding='utf-8').read()
three = open(os.path.join(root, 'three.min.js'), encoding='utf-8').read()
assert '</script' not in three.lower(), 'three.min.js contains a closing script tag'
loader = '<script src="three.min.js"></script>'
assert html.count(loader) == 1, 'loader tag not found exactly once'
html = html.replace(loader, '<script>/* three.js r128 (MIT), inlined for offline use */\n' + three + '\n</script>')
out = os.path.join(root, 'mocha-offline.html')
open(out, 'w', encoding='utf-8').write(html)
print('wrote', out, len(html), 'bytes')
