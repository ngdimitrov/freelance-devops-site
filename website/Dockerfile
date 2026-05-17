# Pinned by digest for reproducible builds (= node:22-alpine, Node 22.22.3 /
# Alpine 3.23.4). `apk upgrade` below patches OS-package CVEs at build time;
# bump this digest deliberately when a newer patched base is published.
ARG NODE_IMAGE=node:22-alpine@sha256:968df39aedcea65eeb078fb336ed7191baf48f972b4479711397108be0966920

FROM ${NODE_IMAGE} AS builder

RUN apk upgrade --no-cache

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build


FROM ${NODE_IMAGE} AS runner

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