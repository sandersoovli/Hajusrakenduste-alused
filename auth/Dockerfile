# Base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json + package-lock.json first (to install dependencies)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Expose port
EXPOSE 5006

# Run the app
CMD ["node", "index.js"]

