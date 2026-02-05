FROM node:20-bookworm-slim

# Install language runtimes
RUN apt-get update && apt-get install -y \
    python3 \
    g++ \
    time \
    bash \
    coreutils \
    && rm -rf /var/lib/apt/lists/*

# Prepare temp directory
RUN mkdir -p /tmp && chmod 1777 /tmp

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY dist ./dist

USER node
CMD ["node", "dist/index.js"]
