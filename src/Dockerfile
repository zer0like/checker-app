# set node image with version
FROM node:11.11.0
# create directory
RUN mkdir -p /application/src
# set work directory
WORKDIR /application
# copy only package.json, to install dependencies before container started
COPY package.json /application
RUN npm install
# install nodemon to run our application in hot reload mode. [don't use it in production]
RUN npm install -g nodemon
# set work directory with your sources
WORKDIR /application/src
CMD nodemon app.js