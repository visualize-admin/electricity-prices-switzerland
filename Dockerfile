# We are using multi-stage builds to reduce container size
# and only ship what's actually required by the app to run.
# https://docs.docker.com/get-started/09_image_best/#multi-stage-builds

FROM node:22-slim AS base

# Install npm and force cross-spawn, glob version
RUN apt update && apt install -y --no-install-recommends ca-certificates curl && \
    apt-get install --only-upgrade perl-base && \
    apt clean && \
    rm -rf /var/lib/apt/lists/* && \
    npm install -g npm@10.9.4 && \
    # Remove cross-spawn old version
    npm uninstall -g cross-spawn && \
        npm cache clean --force && \
        # Find and remove any remaining old versions
        find /usr/local/lib/node_modules -name "cross-spawn" -type d -exec rm -rf {} + && \
        # Install new version
        npm install -g cross-spawn@7.0.5 --force && \
        npm install -g pnpm@10.28.2 && \
    # Configure npm
    npm config set save-exact=true && \
    npm config set legacy-peer-deps=true && \
    # Remove npm to avoid vulnerabilities
    npm r -g npm


# Dependency image
FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Add nodeLinker: "hoisted" to pnpm config to avoid issues with next standalone and symlinks
RUN echo "nodeLinker: hoisted" > pnpm-workspace.yaml

# Replace the cross-spawn version to avoid the vulnerability
# Need to that as part as the same command as the install to make sure
# the bad version does not appear in a layer, as trivy scan will look
# at every layer.
RUN pnpm install --frozen-lockfile && \
    sed -i 's/"cross-spawn": "7.0.3"/"cross-spawn": "7.0.6"/g' node_modules/next/package.json


# Builder image
FROM base AS builder
WORKDIR /app
RUN apt update && apt install -y --no-install-recommends build-essential make && \
    apt clean && \
    rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG GIT_COMMIT_SHA
ENV GIT_COMMIT_SHA=${GIT_COMMIT_SHA}
ENV NEXT_TELEMETRY_DISABLED=1
ENV I18N_DOMAINS='{"de":"www.strompreis.elcom.admin.ch","fr":"www.prix-electricite.elcom.admin.ch","it":"www.prezzi-elettricita.elcom.admin.ch"}'
RUN pnpm build

# Verify BUILD_ID matches the static folder to catch build inconsistencies
RUN BUILD_ID=$(cat .next/BUILD_ID) && \
    echo "Verifying BUILD_ID: $BUILD_ID" && \
    if [ ! -d ".next/static/$BUILD_ID" ]; then \
        echo "ERROR: Build ID mismatch detected!" && \
        echo "BUILD_ID file contains: $BUILD_ID" && \
        echo "But folder .next/static/$BUILD_ID does not exist" && \
        echo "Available folders in .next/static:" && \
        ls -la .next/static && \
        exit 1; \
    fi && \
    echo "Build ID verification passed: $BUILD_ID"

# Runner image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next && \
    chown nextjs:nodejs .next

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
