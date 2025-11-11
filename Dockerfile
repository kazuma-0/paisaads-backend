FROM node:23-alpine

WORKDIR /usr/src/app

EXPOSE 3001

COPY package*.json ./

RUN npm install

RUN npm i -g @nestjs/cli
COPY . .

RUN npm run build

RUN ls

CMD ["npm", "run", "start"]