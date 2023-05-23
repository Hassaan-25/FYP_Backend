#!/bin/bash
#export NODE_ENV=production
export NODE_ENV=production
cd /home/ubuntu/saadiTrip-api
pm2 start server.js --name="saadi-web"
