FROM node:16-slim

WORKDIR /usr/home/app

COPY . .

RUN yarn 

RUN yarn build

CMD [ "yarn", "start" ]

EXPOSE 3000
