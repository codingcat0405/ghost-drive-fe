# Docker Hub Deployment Guide

This project uses GitHub Actions to automatically build and push Docker images to Docker Hub when you create a version tag.

## 📋 Prerequisites

### 1. Docker Hub Account
- Create an account at https://hub.docker.com if you don't have one
- Note your Docker Hub username

### 2. Docker Hub Access Token (Recommended) or Password
**Option A: Access Token (More Secure - Recommended)**
1. Log in to Docker Hub
2. Go to Account Settings → Security → Access Tokens
3. Click "New Access Token"
4. Give it a name (e.g., "GitHub Actions")
5. Copy the token (you won't see it again!)

**Option B: Password**
- Use your Docker Hub password directly

## 🔐 GitHub Secrets Setup

You need to add these secrets to your GitHub repository:

### Steps:
1. Go to your GitHub repository
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these two secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `DOCKER_USERNAME` | Your Docker Hub username | e.g., `johnsmith` |
| `DOCKER_PASSWORD` | Your Docker Hub access token or password | The token/password you created above |

### Example:
```
DOCKER_USERNAME = hungnguyen
DOCKER_PASSWORD = dckr_pat_abc123xyz... (access token)
```

## 🚀 How to Deploy

### 1. Make your changes and commit
```bash
git add .
git commit -m "Your commit message"
git push origin master
```

### 2. Create and push a version tag
```bash
# Create a tag (follow semantic versioning: v1.0.0, v2.1.3, etc.)
git tag v1.0.0

# Push the tag to GitHub
git push origin v1.0.0
```

### 3. GitHub Actions will automatically:
✅ Checkout your code  
✅ Build the Docker image  
✅ Log in to Docker Hub using your secrets  
✅ Push the image with two tags:
   - `your-username/ghost-drive:v1.0.0` (version-specific)
   - `your-username/ghost-drive:latest` (latest version)

### 4. Monitor the deployment
- Go to your GitHub repository
- Click on **Actions** tab
- You'll see the workflow running
- Click on it to see detailed logs

## 📦 Using the Deployed Image

After successful deployment, anyone can pull and run your image:

```bash
# Pull the latest version
docker pull YOUR_USERNAME/ghost-drive:latest

# Or pull a specific version
docker pull YOUR_USERNAME/ghost-drive:v1.0.0

# Run the container
docker run -p 3000:80 YOUR_USERNAME/ghost-drive:latest
```

Access at: http://localhost:3000

## 🏷️ Version Tag Examples

```bash
# Initial release
git tag v1.0.0 && git push origin v1.0.0

# Bug fix
git tag v1.0.1 && git push origin v1.0.1

# New feature
git tag v1.1.0 && git push origin v1.1.0

# Breaking change
git tag v2.0.0 && git push origin v2.0.0
```

## 🔄 Updating Deployment

1. Make your code changes
2. Commit and push to master
3. Create a new version tag
4. Push the tag - CI/CD will handle the rest!

```bash
git add .
git commit -m "Add new feature"
git push origin master
git tag v1.1.0
git push origin v1.1.0
```

## ❌ Troubleshooting

### Workflow fails with "authentication required"
- Check that your `DOCKER_USERNAME` and `DOCKER_PASSWORD` secrets are correct
- If using access token, make sure it hasn't expired

### Tag not triggering workflow
- Make sure your tag follows the pattern `v*.*.*` (e.g., v1.0.0, v2.1.3)
- Check the Actions tab to see if the workflow was triggered

### Build fails
- Check the Actions logs for detailed error messages
- Make sure your Dockerfile builds successfully locally first

## 📝 Notes

- Only tags matching the pattern `v*.*.*` will trigger deployment
- Regular commits without tags will NOT trigger deployment
- Each tag creates both a versioned tag and updates the `latest` tag
- You can view all your images at `https://hub.docker.com/r/YOUR_USERNAME/ghost-drive`

