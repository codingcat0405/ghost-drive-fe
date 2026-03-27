# Docker Setup for Ghost Drive Frontend

This directory contains Docker configuration files for the Ghost Drive frontend application.

## Files Overview

- `Dockerfile` - Multi-stage production build with Nginx
- `Dockerfile.dev` - Development environment setup
- `docker-compose.yml` - Docker Compose configuration
- `nginx.conf` - Nginx configuration for production
- `.dockerignore` - Files to exclude from Docker build context

## Quick Start

### Production Build

Build and run the production version:

```bash
# Build and start the production container
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

The application will be available at `http://localhost:3000`

### Development Mode

Run the development version with hot reload:

```bash
# Start development container
docker-compose --profile dev up --build

# Or run in detached mode
docker-compose --profile dev up -d --build
```

The development server will be available at `http://localhost:5173`

## Available Commands

### Production Commands

```bash
# Build the production image
docker-compose build

# Start production containers
docker-compose up

# Start in detached mode
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f
```

### Development Commands

```bash
# Build development image
docker-compose --profile dev build

# Start development container
docker-compose --profile dev up

# Stop development containers
docker-compose --profile dev down
```

### Individual Container Commands

```bash
# Build production image directly
docker build -t ghost-drive-fe .

# Run production container
docker run -p 3000:80 ghost-drive-fe

# Build development image
docker build -f docker/Dockerfile.dev -t ghost-drive-fe-dev .

# Run development container
docker run -p 5173:5173 -v $(pwd):/app -v /app/node_modules ghost-drive-fe-dev
```

## Configuration

### Environment Variables

You can customize the application by setting environment variables in a `.env` file or directly in the docker-compose.yml:

```yaml
environment:
  - NODE_ENV=production
  - VITE_API_URL=http://localhost:8000
  - VITE_APP_TITLE=Ghost Drive
```

### Port Configuration

- Production: Port 3000 (mapped to container port 80)
- Development: Port 5173 (mapped to container port 5173)

You can change these ports in the `docker-compose.yml` file.

### Volume Mounts (Development)

The development container mounts the current directory to enable hot reload:

- Source code: `./:/app`
- Node modules: `/app/node_modules` (anonymous volume)

## Nginx Configuration

The production build uses Nginx with the following features:

- Gzip compression for static assets
- Client-side routing support (SPA)
- Static asset caching with 1-year expiry
- Security headers
- Optimized for React/Vite applications

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the port mapping in `docker-compose.yml`
2. **Permission issues**: Ensure Docker has proper permissions
3. **Hot reload not working**: Make sure polling is enabled in `vite.config.ts`

### Debugging

```bash
# View container logs
docker-compose logs ghost-drive-fe

# Execute commands inside container
docker-compose exec ghost-drive-fe sh

# Inspect container
docker inspect ghost-drive-frontend
```

### Cleanup

```bash
# Remove containers and networks
docker-compose down

# Remove containers, networks, and volumes
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Clean up Docker system
docker system prune -a
```

## Production Deployment

For production deployment, consider:

1. Using environment-specific docker-compose files
2. Setting up proper SSL/TLS certificates
3. Configuring reverse proxy (if needed)
4. Setting up health checks
5. Implementing proper logging and monitoring

Example production override:

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  ghost-drive-fe:
    restart: always
    environment:
      - NODE_ENV=production
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.ghost-drive.rule=Host(`yourdomain.com`)"
```

Run with: `docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d`

