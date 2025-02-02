FROM node:18

WORKDIR /Chaltteok_BE

COPY package*.json ./

RUN npm install -g pm2 && npm install

COPY . .

EXPOSE 9801

CMD ["pm2-runtime", "start", "chaltteok.js"]
