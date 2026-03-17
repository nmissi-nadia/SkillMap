# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build --configuration=production

# Final stage (Nginx)
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Clean default nginx files
RUN rm -rf ./*

# Copy built files from build stage
COPY --from=build /app/dist/frontend/browser .

# Copy nginx configuration (if needed) or use default
# Useful for handling Angular routes (index.html fallback)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
