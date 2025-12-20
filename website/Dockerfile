FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY dist ./dist
COPY server ./server
COPY .env .env

ENV PORT=3000
EXPOSE 3000

CMD ["node", "server/server.js"]
