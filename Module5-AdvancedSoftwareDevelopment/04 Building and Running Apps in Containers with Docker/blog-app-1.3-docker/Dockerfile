# ==========================================
# STAGE 1: Build Environment
# ==========================================
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# 1. Copy package files to cache dependencies
COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/
COPY shared/package.json ./shared/

# 2. Use 'npm ci' for a clean, reliable installation
RUN npm ci

# 3. Copy the rest of the application source code
COPY . .

# 4. Generate Prisma Client (Required for database access)
RUN npm run prisma:generate

# 5. Build the Application (Builds both React SSR client and Express server)
RUN npm run build


# ==========================================
# STAGE 2: Production Runner
# ==========================================
FROM node:20-alpine AS runner

# Set the working directory
WORKDIR /app

# 1. Copy package files
COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/
COPY shared/package.json ./shared/

# 2. Install dependencies
# Note: We are keeping devDependencies here because your current `npm start` 
# script relies on `concurrently` (root) and `tsx` (client) to run the SSR server.
# For ultimate production optimization, you would compile `client/server.ts` to JS 
# and use `npm ci --omit=dev`.
RUN npm ci

# 3. Copy ONLY the built artifacts and necessary files from the builder stage
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/client/server.ts ./client/server.ts
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/server/prisma ./server/prisma
COPY --from=builder /app/server/prisma.config.ts ./server/prisma.config.ts

# 4. Generate Prisma Client in the runner environment
RUN npm run prisma:generate

# 5. Set environment to production (important for React SSR and Express optimizations)
ENV NODE_ENV=production

# 6. Run as a non-root user for security
USER node

# 7. Expose ports for both the API (3000) and SSR Server (5173)
EXPOSE 3000 5173

# 8. Start the application
CMD ["npm", "start"]
