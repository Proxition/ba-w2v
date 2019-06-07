FROM alpine:3.8
RUN apk add --no-cache --virtual .gyp python make g++ nodejs npm
RUN npm i -g pm2 
RUN npm i -g http-server
RUN pm2 install pm2-logrotate
WORKDIR /usr/src/app
COPY ./elastic/package*.json ./
COPY dist ./elastic/
RUN npm install
COPY ./elastic/ .
EXPOSE 26500
CMD ["npm", "run", "start-http"]
