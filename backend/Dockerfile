# Use lightweight Node image
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy dependency files first (for caching)
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Copy backend source code
COPY server.js ./

# Expose backend port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
