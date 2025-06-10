
# Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] Generate secure JWT_SECRET: `openssl rand -base64 64`
- [ ] Set NODE_ENV=production
- [ ] Configure database credentials
- [ ] Set up AWS credentials (if using email/file features)
- [ ] Configure ALLOWED_ORIGINS for your domain

### 2. Database Setup
- [ ] Create MySQL database
- [ ] Run `src/server/schema.sql`
- [ ] Run `src/server/security-updates.sql`
- [ ] Create admin user via API

### 3. Security Configuration
- [ ] Strong JWT_SECRET (minimum 64 characters)
- [ ] Proper CORS origins
- [ ] Database SSL enabled
- [ ] Firewall configured (ports 80, 443, 22 only)

## Deployment Steps

### Option 1: Manual Server Deployment

1. **Server Setup**
   ```bash
   # Install Node.js 18+, MySQL, nginx
   sudo apt update
   sudo apt install nodejs npm mysql-server nginx
   ```

2. **Application Setup**
   ```bash
   git clone <your-repo>
   cd audit-tracker
   npm install
   ```

3. **Environment Configuration**
   ```bash
   # Copy and configure environment
   cp .env.example .env
   # Edit .env with production values
   nano .env
   ```

4. **Database Setup**
   ```bash
   mysql -u root -p
   CREATE DATABASE audit_tracker;
   mysql -u root -p audit_tracker < src/server/schema.sql
   mysql -u root -p audit_tracker < src/server/security-updates.sql
   ```

5. **Build and Start**
   ```bash
   npm run build
   npm run start
   ```

### Option 2: AWS EC2 Deployment

1. **Launch EC2 Instance**
   - Ubuntu 22.04 LTS
   - t3.medium or larger
   - Security group: HTTP(80), HTTPS(443), SSH(22)

2. **Install Dependencies**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo apt-get install -y mysql-server nginx certbot
   ```

3. **Deploy Application**
   ```bash
   git clone <your-repo>
   cd audit-tracker
   npm install
   npm run build
   ```

4. **Process Management**
   ```bash
   sudo npm install -g pm2
   pm2 start npm --name "audit-tracker" -- run start
   pm2 startup
   pm2 save
   ```

5. **Nginx Configuration**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

6. **SSL Certificate**
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

### Option 3: Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 5000
   CMD ["npm", "run", "start"]
   ```

2. **Build and Run**
   ```bash
   docker build -t audit-tracker .
   docker run -d -p 5000:5000 --env-file .env audit-tracker
   ```

## Post-Deployment

### 1. Create Admin User
```bash
curl -X POST https://yourdomain.com/api/auth/create-user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "name": "Admin User",
    "email": "admin@yourdomain.com",
    "password": "SecurePassword123!",
    "role": "admin",
    "roles": ["admin"]
  }'
```

### 2. Test All Features
- [ ] Login/logout functionality
- [ ] OTP email delivery
- [ ] User management
- [ ] Task creation and workflow
- [ ] File uploads (if configured)
- [ ] All API endpoints

### 3. Monitoring Setup
- [ ] Application logs
- [ ] Database monitoring
- [ ] Performance monitoring
- [ ] Security alerts

## Maintenance

### Regular Tasks
- **Daily**: Check logs for errors
- **Weekly**: Security updates
- **Monthly**: Database backup verification
- **Quarterly**: Security audit

### Backup Strategy
```bash
# Database backup
mysqldump -u root -p audit_tracker > backup_$(date +%Y%m%d).sql

# File backup (if using local storage)
tar -czf files_backup_$(date +%Y%m%d).tar.gz uploads/
```

## Troubleshooting

### Common Issues

1. **Server won't start**
   - Check environment variables
   - Verify database connection
   - Check port availability

2. **Authentication failing**
   - Verify JWT_SECRET is set
   - Check OTP email configuration
   - Verify user exists in database

3. **Database connection issues**
   - Check MySQL service status
   - Verify credentials in .env
   - Check network connectivity

### Log Locations
- Application logs: PM2 logs (`pm2 logs`)
- MySQL logs: `/var/log/mysql/error.log`
- Nginx logs: `/var/log/nginx/`

## Security Best Practices

1. **Server Security**
   - Keep system updated
   - Use fail2ban for SSH protection
   - Configure firewall properly
   - Regular security patches

2. **Application Security**
   - Strong JWT secrets
   - Rate limiting enabled
   - Input validation
   - SQL injection protection

3. **Database Security**
   - Strong passwords
   - Limited user privileges
   - SSL connections
   - Regular backups

## Performance Optimization

1. **Database**
   - Proper indexing
   - Query optimization
   - Connection pooling

2. **Application**
   - Caching strategies
   - Compression enabled
   - Static file optimization

3. **Infrastructure**
   - Load balancing (if needed)
   - CDN for static assets
   - Database replication
