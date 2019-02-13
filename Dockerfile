FROM node:11-alpine
WORKDIR /app

ENV SD_API_HOST=0.0.0.0
ENV SD_API_PORT=3001

ENV SD_CONFIG=/data/config.yml
ENV TYPEORM_OVERRIDES=/data/ormconfig.overrides.js

RUN apk update && \
      apk upgrade && \
      apk add --no-cache \
        git

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-concurrency 1 && \
      rm -r /usr/local/share/.cache

COPY . .
RUN yarn build

EXPOSE 3001
CMD yarn start
