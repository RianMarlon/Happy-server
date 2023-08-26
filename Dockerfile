FROM node:16-slim

WORKDIR /usr/home/app

COPY . .

RUN yarn

CMD [ "yarn", "dev" ]

EXPOSE 3000
