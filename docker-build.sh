#!/bin/bash

# Pull the node:18 Docker image
docker pull node:18

# Run a Docker container based on the node:18 image
docker run -u root -v /etc/localtime:/etc/localtime:ro -v "$(pwd):/elcom-electricity-price-website" -w /elcom-electricity-price-website --rm node:18 bash -c '

# Inside the Docker container

# Print Node.js version
node -v

# Set environment variables
if [ "$CFSPACE" == "ref" ]; then
    export GITLAB_WIKI_URL=""
    export GITLAB_WIKI_TOKEN=""
    export WEBPACK_ASSET_PREFIX=""
else
    export GITLAB_WIKI_URL="gitlab.ldbar.ch/api/v4/projects/73/wikis"
    export GITLAB_WIKI_TOKEN=""
    export WEBPACK_ASSET_PREFIX=""
fi

# Disable strict SSL in Yarn
yarn config set 'strict-ssl' false

# Install dependencies and build
yarn build

