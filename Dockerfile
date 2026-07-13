# Use the official lightweight Node.js environment image
FROM node:20-alpine

# Establish the secure working folder location inside the virtual container
WORKDIR /usr/src/app

# Copy dependency mappings first to optimize container build caching
COPY package*.json ./

# Execute a clean production package installation pass
RUN npm ci --only=production

# Mount all underlying project repository source folders and assets
COPY . .

# Expose your master core backend port gateway
EXPOSE 3000

# Start up your Express gateway orchestrator engine
CMD ["npm", "start"]
