FROM node:16-alpine
RUN apk add git openssh
RUN npm i -g sequelize-cli sequelize
WORKDIR /app
COPY . .
RUN yarn
EXPOSE 4000
CMD ["node", "server.js"]