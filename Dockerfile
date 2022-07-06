FROM node:lts as run

WORKDIR /opt/app

COPY app/ /opt/app

RUN npm install

CMD [ "npm", "start" ]