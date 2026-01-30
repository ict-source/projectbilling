# Use official Node.js 18 image
FROM node:18

# Set working directory inside container
WORKDIR /app

# Copy package.json & package-lock.json first
# This allows Docker to cache npm install layer
COPY package*.json ./

# Install dependencies
# Force native modules like bcrypt & sqlite3 to build from source
RUN npm install --build-from-source

# Copy the rest of the backend source code
COPY . .

# Expose backend port
EXPOSE 4000

# Start backend
CMD ["node", "server.js"]
