FROM node:11-alpine
WORKDIR /app

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
CMD ["yarn", "start"]
