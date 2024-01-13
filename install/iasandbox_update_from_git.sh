#!/bin/sudo sh

# Check git update
cd /home/olivier/git/IASandbox
git pull

# Build the application
cd /home/olivier/git/IASandbox/api
docker build -t iasandbox-api-image .
# Build IHM
cd /home/olivier/git/IASandbox/ihm
docker build -t iasandbox-ihm-image .
docker run --name iasandbox-ihm iasandbox-ihm-image
rm -Rf /var/iasandbox/html/*
docker cp iasandbox-ihm:/app/dist/ /var/iasandbox/html/
mv /var/iasandbox/html/dist/* /var/iasandbox/html/
rm -r /var/iasandbox/html/dist
docker remove iasandbox-ihm
docker image rm iasandbox-ihm-image 

# Cut service access
rm /etc/nginx/sites-enabled/iasandbox_prod
service nginx restart iasandbox-ihm-image

# Deploy the application
cd /home/olivier/git/IASandbox/install
docker-compose -f docker-compose-prod.yml -p iasandbox down --remove-orphans
docker-compose -f docker-compose-prod.yml -p iasandbox up -d 

# Restore service access & display application
ln -s /etc/nginx/sites-available/iasandbox_prod /etc/nginx/sites-enabled/iasandbox_prod
service nginx restart


