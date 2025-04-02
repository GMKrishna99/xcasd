
# Step 1: Build the React app
FROM node:20-alpine AS builder

# Add these lines to accept the build argument
ARG REACT_APP_API_BASE_URL
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL

WORKDIR /app

# Copy only package files to optimize caching
COPY package*.json ./

# Increase memory limit and install dependencies
RUN NODE_OPTIONS="--max-old-space-size=4096" npm install --legacy-peer-deps

# Copy the remaining source code
COPY . .

# Build the React app with increased memory
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build --legacy-peer-deps

# Step 2: Serve using a fresh Alpine image (not nginx base image)
FROM alpine:latest

# Install nginx from Alpine packages
RUN apk add --no-cache nginx

# Create required nginx directories
RUN mkdir -p /run/nginx

# Remove default nginx configurations
RUN rm -rf /etc/nginx/http.d/* /etc/nginx/conf.d/*

# Create our own nginx configuration that only listens on 4020
RUN echo 'server {' > /etc/nginx/http.d/default.conf && \
    echo '    listen 3011;' >> /etc/nginx/http.d/default.conf && \
    echo '    server_name localhost;' >> /etc/nginx/http.d/default.conf && \
    echo '' >> /etc/nginx/http.d/default.conf && \
    echo '    root /usr/share/nginx/html;' >> /etc/nginx/http.d/default.conf && \
    echo '    index index.html;' >> /etc/nginx/http.d/default.conf && \
    echo '' >> /etc/nginx/http.d/default.conf && \
    echo '    location / {' >> /etc/nginx/http.d/default.conf && \
    echo '        try_files $uri /index.html;' >> /etc/nginx/http.d/default.conf && \
    echo '    }' >> /etc/nginx/http.d/default.conf && \
    echo '' >> /etc/nginx/http.d/default.conf && \
    echo '    error_page 404 /index.html;' >> /etc/nginx/http.d/default.conf && \
    echo '' >> /etc/nginx/http.d/default.conf && \
    echo '    location /static/ {' >> /etc/nginx/http.d/default.conf && \
    echo '        expires max;' >> /etc/nginx/http.d/default.conf && \
    echo '        access_log off;' >> /etc/nginx/http.d/default.conf && \
    echo '    }' >> /etc/nginx/http.d/default.conf && \
    echo '}' >> /etc/nginx/http.d/default.conf

# Also modify the main nginx.conf to ensure no port 80 anywhere
RUN sed -i 's/listen 80;/listen 3011;/g' /etc/nginx/nginx.conf 2>/dev/null || true
RUN sed -i 's/listen [::]:80;/listen [::]:3011;/g' /etc/nginx/nginx.conf 2>/dev/null || true

# Create directory for web files
RUN mkdir -p /usr/share/nginx/html

# Copy the build files from the builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Only expose port 4020
EXPOSE 3011

# Set up the entrypoint
CMD ["nginx", "-g", "daemon off;"]
