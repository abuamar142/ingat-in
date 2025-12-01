FROM node:20-alpine

# Install dependencies untuk Baileys
RUN apk add --no-cache \
  python3 \
  make \
  g++ \
  cairo-dev \
  jpeg-dev \
  pango-dev \
  giflib-dev \
  curl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy source code and .env
COPY . .

# Build TypeScript
RUN npm run build

# Prune dev dependencies
RUN npm prune --production

# Create directories for volumes
RUN mkdir -p auth_info data logs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/stats', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "dist/index.js"]
