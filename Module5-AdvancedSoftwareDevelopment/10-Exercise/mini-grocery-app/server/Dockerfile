# ==========================================
# STAGE 1: Build Environment
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# 1. Copy package files to cache dependencies
COPY package.json package-lock.json ./

# 2. Install dependencies
RUN npm ci

# 3. Copy the rest of the application source code
COPY . .

# 4. Generate Prisma Client
RUN npm run prisma:generate

# 5. Build the server
RUN npm run build


# ==========================================
# STAGE 2: Production Runner
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

# 1. Copy package files
COPY package.json package-lock.json ./

# 2. Install production dependencies only
RUN npm ci --omit=dev

# 3. Copy built artifacts and necessary files from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# 4. Generate Prisma Client and create writeable directories
RUN npm run prisma:generate && \
    mkdir -p /app/uploads /app/logs && \
    chown -R node:node /app/uploads /app/logs

# 6. Set environment to production
ENV NODE_ENV=production

# 7. Run as a non-root user for security
USER node

# 8. Expose API port
EXPOSE 3000

# 9. Start the application
CMD ["npm", "run", "start:docker"]
