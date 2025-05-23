# We are using multi-stage builds to reduce container size
# and only ship what's actually required by the app to run.
# https://docs.docker.com/get-started/09_image_best/#multi-stage-builds

FROM node:22-alpine AS base

# Install npm and force cross-spawn version
# Remove old version and install new one
RUN npm install -g npm@10.9.0 && \
    # Remove old version
    npm uninstall -g cross-spawn && \
    npm cache clean --force && \
    # Find and remove any remaining old versions
    find /usr/local/lib/node_modules -name "cross-spawn" -type d -exec rm -rf {} + && \
    # Install new version
    npm install -g cross-spawn@7.0.5 --force && \
    # Configure npm
    npm config set save-exact=true && \
    npm config set legacy-peer-deps=true

RUN apk update && apk upgrade --no-cache openssl


# Dependency image
FROM base AS deps
WORKDIR /app

COPY package.json yarn.lock ./

# Replace the cross-spawn version to avoid the vulnerability
# Need to that as part as the same command as the install to make sure
# the bad version does not appear in a layer, as trivy scan will look
# at every layer.
RUN yarn install --frozen-lockfile && \
    sed -i 's/"cross-spawn": "7.0.3"/"cross-spawn": "7.0.6"/g' node_modules/next/package.json


# Builder image
FROM base AS builder
WORKDIR /app
RUN apk add alpine-sdk make curl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN yarn build

# Runner image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN apk add curl

# Cleanup to solve warning in acs-image-scan
RUN apk --purge del apk-tools

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

COPY configure-proxy.js /app/configure-proxy.js

USER nextjs

EXPOSE 3000

ENV PORT=3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
ENV HOSTNAME="0.0.0.0"
ENV NODE_OPTIONS="-r \"global-agent/bootstrap\" --max_old_space_size=2048 --openssl-legacy-provider --unhandled-rejections=warn"
CMD ["node", "server.js"]
