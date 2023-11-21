# set node image with version
FROM node:19.9.0
# create directory
RUN mkdir -p /application/src
# set work directory
WORKDIR /application
# copy only package.json, to install dependencies before container started
COPY package.json /application
RUN npm install
RUN npm install -g pm2
# set work directory with your sources
WORKDIR /application/src
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
CMD node app.js