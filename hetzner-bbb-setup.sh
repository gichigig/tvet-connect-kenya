#!/bin/bash
# 🚀 Hetzner BigBlueButton Quick Setup Script for TVET Connect Kenya
# Run this on a fresh Ubuntu 20.04 Hetzner Cloud server

set -e

echo "🏠 TVET Connect Kenya - Hetzner BBB Setup"
echo "========================================"

# Configuration
read -p "Enter your domain (e.g., bbb.tvetkenya.ac.ke): " DOMAIN
read -p "Enter your email: " EMAIL

echo ""
echo "🔧 Setting up server for domain: $DOMAIN"
echo "📧 Admin email: $EMAIL"
echo ""

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install essential packages
echo "📦 Installing essential packages..."
apt install -y wget curl gnupg2 software-properties-common ufw htop

# Set timezone for Kenya
echo "🕒 Setting timezone to Africa/Nairobi..."
timedatectl set-timezone Africa/Nairobi

# Create swap file for better performance
echo "💾 Creating swap file for better performance..."
if [ ! -f /swapfile ]; then
    fallocate -l 4G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    echo "✅ Swap file created"
else
    echo "✅ Swap file already exists"
fi

# Configure firewall
echo "🛡️ Configuring firewall..."
ufw --force enable
ufw allow 22      # SSH
ufw allow 80      # HTTP
ufw allow 443     # HTTPS
ufw allow 16384:32768/udp  # BBB Media

echo "✅ Firewall configured"

# Install BigBlueButton
echo "🎥 Installing BigBlueButton..."
echo "This may take 10-15 minutes..."
wget -qO- https://ubuntu.bigbluebutton.org/bbb-install.sh | bash -s -- -v focal-270 -s $DOMAIN -e $EMAIL

# Get BBB credentials
echo ""
echo "🔑 Your BigBlueButton credentials:"
echo "================================="
bbb-conf --secret

# Configure automatic SSL renewal
echo "🔒 Setting up automatic SSL renewal..."
systemctl enable certbot.timer
systemctl start certbot.timer

# Optimize for Hetzner
echo "⚡ Optimizing for Hetzner Cloud..."

# Increase file limits
cat >> /etc/security/limits.conf << EOF
* soft nofile 65536
* hard nofile 65536
* soft nproc 65536
* hard nproc 65536
root soft nofile 65536
root hard nofile 65536
EOF

# Optimize network settings
cat >> /etc/sysctl.conf << EOF
net.core.rmem_default = 262144
net.core.rmem_max = 16777216
net.core.wmem_default = 262144
net.core.wmem_max = 16777216
net.ipv4.udp_mem = 102400 873800 16777216
net.core.netdev_max_backlog = 5000
EOF

sysctl -p

# Create TVET branding
echo "🎨 Setting up TVET Connect Kenya branding..."
cat >> /usr/share/bbb-web/WEB-INF/classes/bigbluebutton.properties << EOF

# TVET Connect Kenya Customization
defaultWelcomeMessage=Welcome to <b>TVET Connect Kenya</b>!<br><br>Technical and Vocational Education Training online classes.<br>For support, contact your IT administrator.
defaultWelcomeMessageFooter=Powered by BigBlueButton - © 2025 TVET Connect Kenya
defaultCopyright=© 2025 TVET Connect Kenya
EOF

# Restart BBB to apply changes
echo "🔄 Restarting BigBlueButton services..."
bbb-conf --restart

# Final check
echo ""
echo "🧪 Running final system check..."
bbb-conf --check

echo ""
echo "🎉 SETUP COMPLETE!"
echo "=================="
echo ""
echo "✅ BigBlueButton is installed and running"
echo "✅ SSL certificate is configured"
echo "✅ Firewall is properly configured"
echo "✅ System is optimized for Hetzner Cloud"
echo "✅ TVET Connect Kenya branding applied"
echo ""
echo "🌐 Your BBB server: https://$DOMAIN"
echo "🔧 Server location: $(curl -s ipinfo.io/city), $(curl -s ipinfo.io/country)"
echo "💰 Hetzner server specs: $(nproc) vCPU, $(free -h | awk '/^Mem:/{print $2}') RAM"
echo ""
echo "📋 Next steps:"
echo "1. Test your BBB server: https://$DOMAIN/bigbluebutton/api"
echo "2. Add BBB credentials to your TVET Connect Kenya .env file"
echo "3. Test integration with your React app"
echo ""
echo "🆘 Need help? Check the BBB_SELF_HOSTED_GUIDE.md"
echo ""

# Create monitoring script
cat > /usr/local/bin/bbb-hetzner-monitor.sh << 'EOF'
#!/bin/bash
echo "🏠 TVET Connect Kenya BBB Server Status"
echo "======================================"
echo "📅 Date: $(date)"
echo "🌍 Location: $(curl -s ipinfo.io/city), $(curl -s ipinfo.io/country)"
echo ""
echo "🖥️ Server Resources:"
echo "CPU Usage: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
echo "Memory: $(free -h | awk '/^Mem:/{print $3 "/" $2}')"
echo "Disk: $(df -h / | awk 'NR==2{print $3 "/" $2 " (" $5 " used)"}')"
echo ""
echo "🎥 BigBlueButton Status:"
bbb-conf --status
echo ""
echo "🔥 Active Sessions:"
curl -s "http://localhost/bigbluebutton/api/getMeetings" | grep -c "<meetingID>" || echo "0"
echo ""
echo "🔒 SSL Certificate:"
echo | openssl s_client -servername $(hostname -f) -connect $(hostname -f):443 2>/dev/null | openssl x509 -noout -dates | grep notAfter
EOF

chmod +x /usr/local/bin/bbb-hetzner-monitor.sh

echo "🔍 Monitor script created: /usr/local/bin/bbb-hetzner-monitor.sh"
echo "Run 'bbb-hetzner-monitor.sh' anytime to check server status"
