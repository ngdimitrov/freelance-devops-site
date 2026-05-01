FROM node:24-alpine AS builder

RUN apk upgrade --no-cache

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build


FROM node:24-alpine AS runner

RUN apk upgrade --no-cache

WORKDIR /app

ENV NODE_ENV=production

RUN chown -R node:node /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force


COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/server ./server 

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["npm", "run", "start"]