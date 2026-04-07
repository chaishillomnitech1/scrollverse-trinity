# ============================================================
# SCROLLVERSE TRINITY SOVEREIGN ECOSYSTEM
# Production Dockerfile - Multi-stage Build
# Supreme Sovereign: Chais Kenyatta Hill
# ============================================================

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY backend/ .
COPY --from=deps /app/node_modules ./node_modules

# Stage 3: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Security: non-root user
RUN addgroup --system --gid 1001 scrollverse && \
    adduser --system --uid 1001 sovereign

# Copy production files
COPY --from=builder --chown=sovereign:scrollverse /app/src ./src
COPY --from=builder --chown=sovereign:scrollverse /app/node_modules ./node_modules
COPY --from=builder --chown=sovereign:scrollverse /app/package.json ./package.json

# Create logs directory
RUN mkdir -p logs && chown sovereign:scrollverse logs

USER sovereign

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

EXPOSE 3000 9090

ENV NODE_ENV=production

CMD ["node", "src/index.js"]
