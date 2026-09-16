# --- Frontend Dockerfile ---
# Stage 1: build the static React app
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# The API URL the built app will call, baked in at build time
# (Vite env vars are compiled into the JS bundle, not read at runtime).
ARG VITE_API_URL=http://localhost:5000/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: serve the built files with a lightweight web server
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# Basic SPA fallback so client-side routes (e.g. /dashboard) work on refresh,
# instead of nginx returning 404 for paths that only exist in React Router.
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        try_files $uri /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
