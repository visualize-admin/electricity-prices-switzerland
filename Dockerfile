FROM node:18

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --ignore-engines

COPY . .
RUN echo '{}' > src/wiki-content.json

ENV NODE_OPTIONS="--max_old_space_size=16000 --openssl-legacy-provider"
RUN yarn next build

CMD ./node_modules/.bin/next start
