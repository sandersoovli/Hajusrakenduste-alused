# Base image
FROM node:20-alpine

# Working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Expose port (sama mis app.listen)
EXPOSE 5000

# Start the app
CMD ["node", "index.js"]
