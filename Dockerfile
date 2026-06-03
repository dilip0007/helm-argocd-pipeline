# Use official lightweight Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy dependency files
COPY app/package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy application files
COPY app/server.js ./

# Expose port
EXPOSE 8080

# Run the app
CMD ["node", "server.js"]
