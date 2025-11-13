#!/bin/sh
# Railway startup script for nginx
# Uses PORT environment variable if set, defaults to 80

PORT=${PORT:-80}

echo "Starting nginx on port $PORT"

# Update nginx config to listen on Railway's PORT
sed -i "s/listen 80;/listen $PORT;/g" /etc/nginx/conf.d/default.conf
sed -i "s/listen \[::\]:80;/listen [::]:$PORT;/g" /etc/nginx/conf.d/default.conf

# Start nginx
exec nginx -g 'daemon off;'
