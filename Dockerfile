# Dockerfile for Vue 3 app with Express backend and Gemini API
# 2025-04-04: Updated to use Nginx for static files and Node.js for backend

# Build stage for the Express backend
FROM node:18-alpine AS backend

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy server files
COPY server.js ./
COPY .env ./

# Final stage
FROM node:18-alpine

WORKDIR /app

# Copy from backend stage
COPY --from=backend /app /app

# Create public directory and copy frontend files
RUN mkdir -p /app/public
COPY modern.html /app/public/index.html
COPY public/ /app/public/
COPY *.js /app/public/
COPY *.css /app/public/

EXPOSE 3000
CMD ["node", "server.js"]
