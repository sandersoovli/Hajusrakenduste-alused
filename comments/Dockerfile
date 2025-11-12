# Base image
FROM node:20-alpine

# Working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Expose port (sama mis app.listen)
EXPOSE 5001

# Start the app
CMD ["npm", "start"]
