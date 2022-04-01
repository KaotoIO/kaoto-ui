#!/bin/bash
 # shellcheck disable=SC2016
#sed -i 's,"",'\""$KAOTO_API"\"',g' /usr/share/nginx/html/env-config.js

PUBLIC_PATH=/usr/share/nginx/html

echo "window.KAOTO_API = \"$KAOTO_API\"" > $PUBLIC_PATH/env-config.js

#include the env-config.js into index.html
sed -i.bak 's~<head[^>]*>~&<script src="env-config.js"></script>~'  $PUBLIC_PATH/index.html
nginx -g 'daemon off;'
