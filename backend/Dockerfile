# --- Backend Dockerfile ---
FROM node:20-alpine

WORKDIR /app

# bcrypt has a native binding; alpine (musl libc) needs build tools
# to compile it if a prebuilt binary isn't available for this platform.
RUN apk add --no-cache python3 make g++ openssl

COPY package*.json ./
RUN npm install

COPY . .

# Bakes the Prisma client into the image based on schema.prisma.
# (Does not need a live DB connection — just reads the schema file.)
RUN npx prisma generate

EXPOSE 5000

# On container start: apply any pending migrations, then start the server.
# Uses `migrate deploy` (not `migrate dev`) — the production-safe variant
# that doesn't prompt for input or attempt to create new migrations.
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
