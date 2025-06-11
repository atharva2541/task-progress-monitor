
# Secure Deployment Guide

## Pre-Deployment Security Checklist

### 1. Environment Variables Setup
- [ ] Generate secure JWT_SECRET (minimum 64 characters): `openssl rand -base64 64`
- [ ] Configure ALLOWED_ORIGINS for your domain
- [ ] Set NODE_ENV=production
- [ ] Configure AWS credentials for SES email sending
- [ ] Set strong MySQL password

### 2. Database Security
- [ ] Run the security-updates.sql script
- [ ] Remove all test users
- [ ] Create admin user with strong password via API
- [ ] Enable SSL for database connections
- [ ] Restrict database access to application server only

### 3. Server Security
- [ ] Configure firewall (only ports 80, 443, 22)
- [ ] Set up SSL certificates (Let's Encrypt recommended)
- [ ] Configure reverse proxy (nginx/Apache)
- [ ] Enable fail2ban for SSH protection
- [ ] Keep server updated

### 4. Application Security
- [ ] All environment variables properly set
- [ ] No console.log statements in production
- [ ] CORS configured for your domain only
- [ ] Rate limiting enabled
- [ ] Helmet security headers enabled

## Windows Deployment Steps

1. **Install Dependencies**
   ```bash
   npm install
   npm run build
   ```

2. **Database Setup**
   - Install MySQL 8.0+
   - Create database: `audit_tracker`
   - Run schema.sql
   - Run security-updates.sql
   - Configure user with limited privileges

3. **Environment Configuration**
   - Copy .env.example to .env
   - Fill in all required values
   - Generate secure JWT_SECRET

4. **Start Application**
   ```bash
   npm run start:prod
   ```

## AWS EC2 Deployment Steps

1. **Server Setup**
   ```bash
   sudo yum update -y
   sudo yum install -y nodejs npm mysql
   ```

2. **Application Deployment**
   ```bash
   git clone <your-repo>
   cd audit-tracker
   npm install
   npm run build
   ```

3. **Database Setup**
   - Use RDS MySQL instance (recommended)
   - Configure security groups
   - Enable automated backups

4. **Process Management**
   ```bash
   npm install -g pm2
   pm2 start npm --name "audit-tracker" -- run start:prod
   pm2 startup
   pm2 save
   ```

5. **Reverse Proxy (nginx)**
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

## Security Monitoring

1. **Set up CloudWatch** (for AWS)
2. **Configure log rotation**
3. **Monitor failed login attempts**
4. **Set up security alerts**
5. **Regular security updates**

## Post-Deployment Testing

1. **Test login/logout functionality**
2. **Verify OTP email delivery**
3. **Test all user roles**
4. **Verify file uploads work**
5. **Check all API endpoints**
6. **Test rate limiting**
7. **Verify CORS restrictions**

## Emergency Procedures

1. **Security Incident Response**
   - Immediately revoke JWT tokens (restart server)
   - Check logs for suspicious activity
   - Reset all user passwords if needed
   - Update security measures

2. **Backup and Recovery**
   - Database backup: every 6 hours
   - File backup: daily
   - Test restore procedures monthly

## Maintenance

- **Weekly**: Security updates
- **Monthly**: Dependency updates
- **Quarterly**: Security audit
- **Annually**: Penetration testing
