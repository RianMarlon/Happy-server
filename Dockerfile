FROM node:16-alpine

WORKDIR /usr/home/app

RUN apk update && apk add bash

ENV DOCKERIZE_VERSION v0.7.0
RUN apk add wget openssl \
  && wget -O - https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz | tar xzf - -C /usr/local/bin \
  && apk del wget

COPY . .

RUN yarn 

RUN yarn build

CMD [ "yarn", "start" ]

EXPOSE 3000
