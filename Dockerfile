FROM node:18.13-alpine
RUN apk add git openssh --update python3 make g++ && rm -rf /var/cache/apk/*
RUN npm i -g sequelize-cli sequelize 
WORKDIR /app
COPY . .
RUN yarn
EXPOSE 4000
CMD ["node", "server.js"]