#!/bin/sh
find ./contents/code -iname '*.js' -not -name 'main.js' -exec cat {} +> ./contents/code/main.js
echo '\n\nvar TilingManager = new TilingManager();' >> ./contents/code/main.js