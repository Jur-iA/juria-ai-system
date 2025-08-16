# Jur-iA backend Dockerfile
# Runtime: Node 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install deps first (better layer caching)
COPY package*.json ./
# If you have a lockfile, prefer deterministic install
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

# Copy source
COPY . .

# Set production env and default port
ENV NODE_ENV=production
ENV PORT=3001

# Expose the app port (informational for most PaaS)
EXPOSE 3001

# Healthcheck (optional)
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT||3001) + '/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))" || exit 1

# Start the server
CMD ["node", "backend/server.js"]
