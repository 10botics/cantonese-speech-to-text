# Deployment Guide

This document provides step-by-step instructions for deploying the Cantonese Speech to Text application to various platforms.

## 🚀 Quick Deploy Options

### Vercel (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/cantonese-speech-to-text)

### Netlify
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/cantonese-speech-to-text)

## 📋 Pre-Deployment Checklist

- [ ] API key removed from code (users enter their own)
- [ ] Environment variables configured
- [ ] Build process tested locally
- [ ] All tests passing
- [ ] Security headers configured
- [ ] Performance optimization enabled

## 🛠️ Platform-Specific Instructions

### Vercel Deployment

#### 1. Automatic Deployment
1. **Fork/Clone** this repository to your GitHub account
2. **Sign up** for [Vercel](https://vercel.com) with your GitHub account
3. **Import Project** from your GitHub repository
4. **Configure** environment variables in the Vercel dashboard
5. **Deploy** - Vercel will automatically build and deploy

#### 2. Manual Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables
vercel env add FAL_API_KEY production
# Enter your Fal.ai API key when prompted

# Deploy to production
vercel --prod
```

#### 3. Environment Variables
In your Vercel dashboard, add these environment variables:
- `FAL_API_KEY`: Your Fal.ai API key (optional - users can enter their own)
- `NEXT_PUBLIC_APP_URL`: Your production domain

### Netlify Deployment

#### 1. Build Settings
```yaml
# netlify.toml
[build]
  publish = "out"
  command = "npm run build && npm run export"

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[redirects]]
  from = "/tests/*"
  to = "/404"
  status = 404
```

#### 2. Manual Steps
1. **Build locally**:
   ```bash
   npm run build
   npm run export
   ```
2. **Upload** the `out` folder to Netlify
3. **Configure** environment variables in Netlify dashboard

### Self-Hosted Deployment

#### 1. Server Requirements
- Node.js 18+
- 2GB+ RAM
- SSL certificate (Let's Encrypt recommended)

#### 2. Deployment Steps
```bash
# Clone repository
git clone https://github.com/your-username/cantonese-speech-to-text.git
cd cantonese-speech-to-text

# Install dependencies
npm install

# Build application
npm run build

# Start production server
npm start
```

#### 3. Process Manager (PM2)
```bash
# Install PM2
npm install -g pm2

# Start application with PM2
pm2 start npm --name "speech-to-text" -- start

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup
```

#### 4. Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Docker Deployment

#### 1. Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### 2. Docker Commands
```bash
# Build image
docker build -t cantonese-speech-to-text .

# Run container
docker run -p 3000:3000 -e FAL_API_KEY=your-key cantonese-speech-to-text

# Using Docker Compose
docker-compose up -d
```

#### 3. docker-compose.yml
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - FAL_API_KEY=${FAL_API_KEY}
    restart: unless-stopped
```

## 🔧 Environment Configuration

### Required Variables
```bash
# API Configuration
FAL_API_KEY=your-fal-ai-api-key

# Application URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Optional Variables
```bash
# Feature defaults
NEXT_PUBLIC_DEFAULT_LANGUAGE=yue
NEXT_PUBLIC_DEFAULT_SPEAKER_ID=false
NEXT_PUBLIC_DEFAULT_CHINESE_CONVERSION=true

# Performance
NEXT_PUBLIC_MAX_FILE_SIZE_MB=50

# Analytics
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

## 🔒 Security Considerations

### 1. API Key Security
- **Never commit** API keys to version control
- Use environment variables for all sensitive data
- Consider server-side API proxying for enhanced security

### 2. HTTPS Enforcement
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          }
        ]
      }
    ]
  }
}
```

### 3. Content Security Policy
```javascript
// Add to next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  }
]
```

## 📊 Performance Optimization

### 1. CDN Configuration
- Enable CDN for static assets
- Configure proper caching headers
- Use image optimization

### 2. Monitoring
```bash
# Performance monitoring
npm install @vercel/analytics

# Error tracking
npm install @sentry/nextjs
```

### 3. Build Optimization
```javascript
// next.config.js
module.exports = {
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  experimental: {
    optimizeCss: true
  }
}
```

## 🧪 Post-Deployment Testing

### 1. Functionality Tests
```bash
# Test basic functionality
curl https://yourdomain.com

# Test API endpoints
curl -X POST https://yourdomain.com/api/health
```

### 2. Performance Tests
- Load time < 3 seconds
- Time to Interactive < 5 seconds
- Lighthouse score > 90

### 3. Security Tests
- SSL Labs test: A+ rating
- Security headers check
- Vulnerability scan

## 🔄 Continuous Deployment

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
      - name: Deploy to Vercel
        run: vercel --token=${{ secrets.VERCEL_TOKEN }} --prod
```

## 📝 Maintenance

### Regular Updates
- Update dependencies monthly
- Monitor security advisories
- Performance audits quarterly
- User feedback integration

### Backup Strategy
- Database backups (if applicable)
- Configuration backups
- Deployment rollback procedures

## 🆘 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

#### Memory Issues
```javascript
// next.config.js
module.exports = {
  experimental: {
    workerThreads: false,
    cpus: 1
  }
}
```

#### API Timeouts
- Increase function timeout limits
- Implement request retry logic
- Monitor API rate limits

### Support Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Fal.ai API Documentation](https://fal.ai/docs)

## 📞 Getting Help

If you encounter issues during deployment:

1. **Check** the [troubleshooting section](#troubleshooting)
2. **Review** platform-specific documentation
3. **Test** locally first
4. **Open** an issue on GitHub with deployment logs

Remember to remove any sensitive information before sharing logs or error messages. 