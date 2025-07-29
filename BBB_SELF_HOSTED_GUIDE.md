# 🏠 Self-Hosted BigBlueButton Server Setup Guide with Hetzner

## 🎯 Overview
Complete guide for setting up your own BigBlueButton server on Hetzner Cloud for TVET Connect Kenya. Hetzner offers excellent price-performance ratio, making it perfect for educational institutions. This gives you full control, better security, and significant cost savings.

## 🖥️ Server Requirements

### Minimum Requirements (Testing/Small Classes):
- **OS**: Ubuntu 20.04 LTS or Ubuntu 22.04 LTS
- **CPU**: 4 cores (3.0 GHz+)
- **RAM**: 8 GB
- **Storage**: 50 GB SSD
- **Bandwidth**: 100 Mbps
- **Users**: Up to 25 concurrent

### Recommended Production (Medium Classes):
- **OS**: Ubuntu 20.04 LTS (most stable)
- **CPU**: 8 cores (3.5 GHz+) 
- **RAM**: 16 GB
- **Storage**: 100 GB SSD
- **Bandwidth**: 500 Mbps
- **Users**: Up to 75 concurrent

### Large Scale Production:
- **OS**: Ubuntu 20.04 LTS
- **CPU**: 16+ cores (3.5 GHz+)
- **RAM**: 32+ GB
- **Storage**: 200+ GB SSD
- **Bandwidth**: 1 Gbps+
- **Users**: 150+ concurrent

## 🌐 Domain & DNS Setup

### 1. Get a Domain Name
- Purchase from: Namecheap, GoDaddy, or Cloudflare
- Example: `classes.tvetkenya.ac.ke`

### 2. Configure DNS Records
```
Type: A
Name: @
Value: [Your Server IP]
TTL: 300

Type: A  
Name: classes
Value: [Your Server IP]
TTL: 300

Type: CNAME
Name: www
Value: classes.tvetkenya.ac.ke
TTL: 300
```

## 🚀 Hetzner Cloud Server Setup

### Step 1: Create Hetzner Account & Server
```bash
# 1. Go to https://console.hetzner.cloud/
# 2. Create account (get €20 free credit!)
# 3. Create new project: "TVET-BBB-Server"

# Server Configuration:
# - Location: Nuremberg, Germany (best for Africa)
# - Image: Ubuntu 20.04 LTS
# - Type: CPX31 (4 vCPU, 8GB RAM) - €12.96/month
# - Volume: None (50GB included)
# - Network: Default
# - SSH Key: Upload your public key
# - Firewall: We'll configure this later
```

### Step 2: Initial Server Setup
```bash
# Connect via SSH
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install required packages
apt install -y wget curl gnupg2 software-properties-common ufw

# Set timezone for Kenya
timedatectl set-timezone Africa/Nairobi

# Create swap file for better performance
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### Step 5: Install BigBlueButton
```bash
# Download and run BBB installation script
wget -qO- https://ubuntu.bigbluebutton.org/bbb-install.sh | bash -s -- -v focal-270 -s bbb.yourdomain.com -e admin@yourdomain.com

# Replace with your actual domain and email
# Example: bbb.tvetkenya.ac.ke
```

### Step 6: Enable HTTPS with Let's Encrypt
```bash
# The installation script should have configured SSL
# Verify SSL is working
bbb-conf --check

# If SSL needs manual setup:
bbb-conf --setip bbb.yourdomain.com

# Enable automatic SSL renewal
systemctl enable certbot.timer
systemctl start certbot.timer
```

### Step 3: Configure Hetzner Firewall
```bash
# Enable UFW firewall
ufw --force enable

# Allow SSH (Hetzner uses port 22 by default)
ufw allow 22

# Allow HTTP/HTTPS
ufw allow 80
ufw allow 443

# Allow BBB media ports (UDP for WebRTC)
ufw allow 16384:32768/udp

# Check firewall status
ufw status verbose
```

### Step 4: Setup Domain with Hetzner DNS (Optional)
```bash
# If you bought domain through Hetzner:
# 1. Go to DNS Console: https://dns.hetzner.com/
# 2. Add your domain
# 3. Create A record pointing to your server IP

# DNS Records needed:
# Type: A, Name: @, Value: [Server IP]
# Type: A, Name: bbb, Value: [Server IP]
# Type: CNAME, Name: www, Value: bbb.yourdomain.com
```

## ⚙️ BBB Configuration

### Step 1: Get Your Credentials
```bash
# Get BBB URL and Secret
sudo bbb-conf --secret
```

Save these credentials - you'll need them for TVET Connect Kenya!

### Step 2: Customize Welcome Message
```bash
# Edit BBB properties
sudo nano /usr/share/bbb-web/WEB-INF/classes/bigbluebutton.properties

# Find and modify:
defaultWelcomeMessage=Welcome to <b>TVET Connect Kenya</b>!<br><br>For technical support, contact IT support.
defaultWelcomeMessageFooter=
```

### Step 3: Configure Recording Settings
```bash
# Enable recordings
sudo nano /usr/share/bbb-web/WEB-INF/classes/bigbluebutton.properties

# Set recording options:
allowStartStopRecording=true
autoStartRecording=false
defaultRecordingEnabled=true
```

### Step 4: Set Institution Branding
```bash
# Create custom logo directory
sudo mkdir -p /var/www/bigbluebutton-default/assets

# Upload your TVET logo (replace with actual logo)
sudo wget -O /var/www/bigbluebutton-default/assets/logo.png https://your-domain.com/logo.png

# Configure branding
sudo nano /usr/share/bbb-web/WEB-INF/classes/bigbluebutton.properties

# Add:
defaultLogoURL=/assets/logo.png
defaultCopyright=© 2025 TVET Connect Kenya
```

## 🎛️ Performance Optimization

### Step 1: Increase File Limits
```bash
# Edit limits
sudo nano /etc/security/limits.conf

# Add these lines:
* soft nofile 65536
* hard nofile 65536
* soft nproc 65536
* hard nproc 65536
root soft nofile 65536
root hard nofile 65536
```

### Step 2: Optimize Kernel Parameters
```bash
# Edit sysctl
sudo nano /etc/sysctl.conf

# Add optimization settings:
net.core.rmem_default = 262144
net.core.rmem_max = 16777216
net.core.wmem_default = 262144
net.core.wmem_max = 16777216
net.ipv4.udp_mem = 102400 873800 16777216
net.core.netdev_max_backlog = 5000

# Apply changes
sudo sysctl -p
```

### Step 3: Configure FreeSWITCH
```bash
# Optimize audio settings
sudo nano /opt/freeswitch/etc/freeswitch/vars.xml

# Find and set:
<X-PRE-PROCESS cmd="set" data="rtp_start_port=16384"/>
<X-PRE-PROCESS cmd="set" data="rtp_end_port=32768"/>
```

## 📊 Monitoring & Maintenance

### Step 1: Install Monitoring Tools
```bash
# Install system monitoring
sudo apt install -y htop iotop nethogs

# Install BBB monitoring
sudo apt install -y bbb-monitoring
```

### Step 2: Setup Log Rotation
```bash
# Configure log rotation
sudo nano /etc/logrotate.d/bigbluebutton

# Add content:
/var/log/bigbluebutton/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    sharedscripts
}
```

### Step 3: Create Monitoring Script
```bash
# Create monitoring script
sudo nano /usr/local/bin/bbb-monitor.sh

# Add content:
#!/bin/bash
echo "=== BBB Server Status ===" 
sudo bbb-conf --check
echo "=== Disk Usage ==="
df -h
echo "=== Memory Usage ==="
free -h
echo "=== Active Sessions ==="
curl -s "http://localhost/bigbluebutton/api/getMeetings" | grep -c "<meetingID>"

# Make executable
sudo chmod +x /usr/local/bin/bbb-monitor.sh
```

## 🔄 Backup & Recovery

### Step 1: Setup Automated Backups
```bash
# Create backup script
sudo nano /usr/local/bin/bbb-backup.sh

# Add content:
#!/bin/bash
BACKUP_DIR="/backup/bbb-$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# Backup configurations
cp -r /usr/share/bbb-web/WEB-INF/classes/ $BACKUP_DIR/web-config/
cp -r /opt/freeswitch/etc/freeswitch/ $BACKUP_DIR/freeswitch-config/
cp -r /etc/nginx/ $BACKUP_DIR/nginx-config/

# Backup recordings
rsync -av /var/bigbluebutton/recording/ $BACKUP_DIR/recordings/

# Compress backup
tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR
rm -rf $BACKUP_DIR

echo "Backup completed: $BACKUP_DIR.tar.gz"

# Make executable
sudo chmod +x /usr/local/bin/bbb-backup.sh

# Schedule daily backups
echo "0 2 * * * /usr/local/bin/bbb-backup.sh" | sudo crontab -
```

## 🛡️ Security Hardening

### Step 1: SSH Security
```bash
# Configure SSH
sudo nano /etc/ssh/sshd_config

# Secure settings:
Port 2222  # Change from default 22
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3

# Restart SSH
sudo systemctl restart sshd

# Update firewall for new SSH port
sudo ufw delete allow 22
sudo ufw allow 2222
```

### Step 2: Install Fail2Ban
```bash
# Install fail2ban
sudo apt install -y fail2ban

# Configure for BBB
sudo nano /etc/fail2ban/jail.local

# Add content:
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = 2222

[nginx-http-auth]
enabled = true
```

### Step 3: Setup SSL Monitoring
```bash
# Create SSL check script
sudo nano /usr/local/bin/ssl-check.sh

# Add content:
#!/bin/bash
DOMAIN="classes.tvetkenya.ac.ke"
EXPIRY=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
EXPIRY_DATE=$(date -d "$EXPIRY" +%s)
CURRENT_DATE=$(date +%s)
DAYS_LEFT=$(( ($EXPIRY_DATE - $CURRENT_DATE) / 86400 ))

if [ $DAYS_LEFT -lt 30 ]; then
    echo "SSL certificate expires in $DAYS_LEFT days!"
    # Add email notification here
fi

# Make executable and schedule
sudo chmod +x /usr/local/bin/ssl-check.sh
echo "0 6 * * * /usr/local/bin/ssl-check.sh" | sudo crontab -
```

## 🧪 Testing Your Installation

### Step 1: Basic Functionality Test
```bash
# Check BBB status
sudo bbb-conf --check

# Test API endpoint
curl "https://classes.tvetkenya.ac.ke/bigbluebutton/api"

# Should return: <response><returncode>SUCCESS</returncode></response>
```

### Step 2: Create Test Meeting
```bash
# Get your secret
BBB_SECRET=$(sudo bbb-conf --secret | grep Secret: | cut -d' ' -f2)
BBB_URL="https://classes.tvetkenya.ac.ke/bigbluebutton"

# Create test meeting (use the BBB API client from your React app)
```

### Step 3: Performance Test
```bash
# Monitor during test meeting
htop  # Check CPU/Memory usage
iotop  # Check disk I/O
nethogs  # Check network usage
```

## 🔧 Troubleshooting

### Common Issues:

#### 1. Certificate Problems
```bash
# Renew SSL certificate
sudo certbot renew --force-renewal
sudo bbb-conf --setip classes.tvetkenya.ac.ke
```

#### 2. Audio/Video Issues
```bash
# Check FreeSWITCH
sudo systemctl status freeswitch
sudo systemctl restart freeswitch

# Check Kurento
sudo systemctl status kurento-media-server
sudo systemctl restart kurento-media-server
```

#### 3. Recording Issues
```bash
# Check recording processes
sudo systemctl status bbb-rap-caption-inbox
sudo systemctl status bbb-record-core

# Restart recording services
sudo systemctl restart bbb-record-core
```

#### 4. High CPU Usage
```bash
# Check active meetings
sudo bbb-conf --debug

# Optimize video settings in client
# Reduce default video quality in BBB config
```

## 💰 Hetzner Cost Breakdown (Excellent Value!)

### Hetzner Cloud Pricing (EUR):

#### Small Setup (Up to 25 users):
- **CPX21**: 3 vCPU, 4GB RAM, 40GB SSD - **€4.51/month**
- **Traffic**: 20TB included (more than enough)
- **Backups**: €1.80/month (40% of server cost)
- **Total**: €6.31/month (~KES 850/month)

#### Recommended Production (Up to 75 users):
- **CPX31**: 4 vCPU, 8GB RAM, 80GB SSD - **€12.96/month**
- **Traffic**: 20TB included
- **Backups**: €5.18/month
- **Total**: €18.14/month (~KES 2,450/month)

#### Large Scale (Up to 150 users):
- **CPX41**: 8 vCPU, 16GB RAM, 160GB SSD - **€25.92/month**
- **Traffic**: 20TB included
- **Backups**: €10.37/month
- **Total**: €36.29/month (~KES 4,900/month)

### Additional Hetzner Services:
- **Domain Registration**: €0.50-15/year
- **Hetzner DNS**: Free
- **Load Balancer**: €4.90/month (if needed for scaling)
- **Floating IP**: €1.19/month (for high availability)

### Why Hetzner is Perfect for Kenya:
✅ **Best Price-Performance**: Up to 60% cheaper than AWS/Google  
✅ **Excellent Network**: Great connectivity to Africa  
✅ **Green Energy**: 100% renewable energy data centers  
✅ **No Traffic Costs**: 20TB included (competitors charge $0.09/GB)  
✅ **Simple Pricing**: No hidden fees or complex billing  
✅ **EU Data Protection**: GDPR compliant, excellent for education  

### Total Cost Comparison:
| Provider | 8GB Server | Traffic (1TB) | Total/Month |
|----------|------------|---------------|-------------|
| **Hetzner** | €12.96 | Free | **€12.96** |
| AWS | $35 | $90 | **$125** |
| Google Cloud | $30 | $120 | **$150** |
| DigitalOcean | $40 | $0 | **$40** |

**Hetzner saves you 70-90% compared to major cloud providers!**

## 📈 Scaling Your Installation

### When to Scale Up:
- **CPU > 80%** consistently
- **Memory > 85%** usage
- **Network drops** or poor quality
- **More than 50 concurrent users**

### Scaling Options:

#### 1. Vertical Scaling (Easier):
- Increase server CPU/RAM
- Add more storage
- Upgrade bandwidth

#### 2. Horizontal Scaling (Advanced):
- Multiple BBB servers
- Load balancer (nginx/haproxy)
- Separate media servers
- Database clustering

## 🎓 TVET Connect Kenya Integration

### Step 1: Update Environment Variables
```env
# Add to your .env file:
VITE_BBB_URL=https://classes.tvetkenya.ac.ke/bigbluebutton
VITE_BBB_SECRET=your-secret-from-bbb-conf-command

# Optional customizations
VITE_BBB_DEFAULT_WELCOME_MESSAGE=Welcome to TVET Connect Kenya Online Classes!
VITE_BBB_DEFAULT_MAX_PARTICIPANTS=75
VITE_BBB_DEFAULT_DURATION=120
VITE_BBB_INSTITUTION_NAME=TVET Connect Kenya
```

### Step 2: Test Integration
1. Start your React app: `npm run dev`
2. Navigate to Virtual Classroom
3. Select "BigBlueButton" mode
4. Create a test session
5. Verify all features work

### Step 3: Production Deployment
- Deploy your React app to production
- Test with real users
- Monitor server performance
- Set up alerts for issues

## 🆘 Support & Maintenance

### Regular Maintenance Tasks:
- **Weekly**: Check server resources and logs
- **Monthly**: Update BBB and system packages
- **Quarterly**: Review and test backups
- **Annually**: Renew domain and review security

### Getting Help:
- **BBB Community**: https://docs.bigbluebutton.org/
- **Ubuntu Forums**: https://ubuntuforums.org/
- **DigitalOcean Tutorials**: https://www.digitalocean.com/community/tutorials

## 🎉 Success!

Your self-hosted BigBlueButton server is now ready for TVET Connect Kenya! You now have:

✅ **Full Control**: Customize everything to your needs  
✅ **Cost Savings**: Much cheaper than hosted solutions  
✅ **Security**: Your data stays in Kenya  
✅ **Performance**: Optimized for your specific usage  
✅ **Scalability**: Grow as your institution grows  

**Next Steps**: Configure your React app with the new BBB credentials and start hosting professional online classes! 🚀
