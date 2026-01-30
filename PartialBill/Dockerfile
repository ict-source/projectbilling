# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets to nginx directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 3000
EXPOSE 8000

CMD ["nginx", "-g", "daemon off;"]
