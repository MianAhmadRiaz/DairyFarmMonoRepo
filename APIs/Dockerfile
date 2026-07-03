FROM --platform=linux/amd64 node:20.11.1-alpine

RUN node -v

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .