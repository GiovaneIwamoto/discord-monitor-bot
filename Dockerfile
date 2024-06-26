# Node.js runtime image
FROM node:18

# Working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install --only=production
# Copy the rest of your application code to the working directory
COPY . .

# Expose the port that your app runs on
EXPOSE 3000

# Command to run your application
CMD ["npm", "start"]
