FROM node:18-alpine

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

CMD npx prisma migrate dev && npx prisma generate && node server.js

EXPOSE 3001

