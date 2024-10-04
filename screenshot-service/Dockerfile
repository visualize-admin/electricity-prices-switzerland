# We are using multi-stage builds to reduce container size
# and only ship what's actually required by the app to run.
# https://docs.docker.com/get-started/09_image_best/#multi-stage-builds

FROM ghcr.io/puppeteer/puppeteer:latest AS base

# Dependency image
FROM base AS deps
WORKDIR /app

COPY package.json yarn.lock ./

USER pptruser
RUN yarn install --frozen-lockfile


# Builder image
FROM base AS builder
WORKDIR /app
USER pptruser
# RUN apk add alpine-sdk make
COPY --chown=pptruser:pptruser --from=deps /app/node_modules ./node_modules
COPY --chown=pptruser:pptruser . .
RUN yarn build

# # Runner image, copy the built files and dependencies
FROM base AS runner
WORKDIR /app

USER root
RUN apt install -y libxshmfence-dev gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget

RUN chown -R pptruser:pptruser /tmp
# Add tini to perform clean shutdown
ENV TINI_VERSION=v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini
ENTRYPOINT ["/tini", "--"]

USER pptruser
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app .

ENV NODE_ENV=production


EXPOSE 3000

ENV PORT=3000

ENV HOSTNAME="0.0.0.0"
CMD ["node", "index.js"]
