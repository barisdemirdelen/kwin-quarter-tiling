#!/bin/sh
find . -maxdepth 1 -iname '*.js' -not -name 'main.js' -exec cat {} +> main.js
echo "\n\nvar TilingManager = new TilingManager();" >> main.js
