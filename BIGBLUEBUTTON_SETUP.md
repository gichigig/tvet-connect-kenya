# 🎥 BigBlueButton Integration Guide

## Overview
This guide helps you integrate BigBlueButton (BBB) with TVET Connect Kenya for professional online classes.

## 🚀 Features
- ✅ **Professional Video Conferencing**: HD video/audio, screen sharing
- ✅ **Interactive Whiteboard**: Real-time collaboration tools
- ✅ **Recording**: Automatic class recording with playback
- ✅ **Breakout Rooms**: Small group activities
- ✅ **Chat & Polls**: Interactive engagement tools
- ✅ **Mobile Support**: Join from any device
- ✅ **Role-based Access**: Lecturer vs Student permissions

## 🛠️ Setup Options

### Option 1: Use Public BBB Server (Easiest)
Use a hosted BigBlueButton service:
- **BigBlueButton Inc**: https://bigbluebutton.org/commercial-support/
- **Blindside Networks**: https://blindsidenetworks.com/
- **Other providers**: Search "BigBlueButton hosting"

### Option 2: Self-Hosted BBB Server (Advanced)
Install on your own server for full control.

#### Server Requirements:
- **OS**: Ubuntu 20.04 LTS (recommended)
- **CPU**: 4+ cores (8+ recommended)
- **RAM**: 8GB minimum (16GB+ recommended)
- **Storage**: 50GB+ SSD
- **Bandwidth**: 100Mbps+ per 25 concurrent users
- **Domain**: HTTPS-enabled domain name

#### Installation Steps:
```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install BigBlueButton
wget -qO- https://ubuntu.bigbluebutton.org/bbb-install.sh | bash -s -- -v focal-260 -s your-domain.com -e your-email@domain.com

# 3. Enable Let's Encrypt SSL
sudo bbb-conf --setip your-domain.com

# 4. Configure firewall
sudo ufw allow 22,80,443,16384:32768/udp

# 5. Get your secret key
sudo bbb-conf --secret
```

## ⚙️ Configuration

### 1. Environment Variables
Add to your `.env` file:
```env
# BigBlueButton Configuration
VITE_BBB_URL=https://your-bbb-server.com/bigbluebutton
VITE_BBB_SECRET=your-secret-key-here

# Optional Settings
VITE_BBB_DEFAULT_WELCOME_MESSAGE=Welcome to TVET Connect Kenya!
VITE_BBB_DEFAULT_MAX_PARTICIPANTS=50
VITE_BBB_DEFAULT_DURATION=120
```

### 2. Get Your BBB Credentials

#### For Hosted Services:
- Contact your BBB provider for URL and secret

#### For Self-Hosted:
```bash
# Run this on your BBB server
sudo bbb-conf --secret
```

Example output:
```
URL: https://your-domain.com/bigbluebutton/
Secret: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
```

## 🧪 Testing Your Setup

### 1. Test BBB Server
Visit: `https://your-domain.com/bigbluebutton/api`
Should show: `<response><returncode>SUCCESS</returncode></response>`

### 2. Test TVET Integration
1. Start your React app: `npm run dev`
2. Go to any course → Virtual Classroom
3. Select "BigBlueButton" mode
4. Create a new session as a lecturer
5. Join the session

## 🎯 Usage Guide

### For Lecturers:
1. **Create Session**: Set title, time, duration, max participants
2. **Configure Recording**: Enable/disable session recording
3. **Start Class**: Click "Create & Start Session"
4. **Manage Participants**: Mute, promote, create breakout rooms
5. **Share Content**: Screen sharing, whiteboard, presentations
6. **End Session**: Click the stop button when finished

### For Students:
1. **Join Session**: Click "Join Now" when session is live
2. **Audio/Video**: Test microphone and camera
3. **Participate**: Use chat, raise hand, participate in polls
4. **Breakout Rooms**: Join assigned small groups
5. **View Recordings**: Access recorded sessions later

## 📊 Advanced Features

### 1. Customization
Add custom branding in BBB configuration:
```bash
# Edit presentation assets
sudo nano /usr/share/bbb-web/WEB-INF/classes/bigbluebutton.properties
```

### 2. Analytics Integration
Track usage with BBB Analytics:
```bash
# Install BBB Analytics
sudo apt install bbb-learning-dashboard
```

### 3. Mobile Apps
Students can use official BBB mobile apps:
- **iOS**: BigBlueButton (App Store)
- **Android**: BigBlueButton (Google Play)

## 🔧 Troubleshooting

### Common Issues:

#### 1. "Failed to Create Session"
- **Check**: BBB server URL and secret
- **Verify**: Server is accessible from your app
- **Test**: Visit BBB API endpoint directly

#### 2. "Cannot Join Meeting"
- **Check**: Meeting was created successfully
- **Verify**: Correct passwords are being used
- **Test**: Try joining directly via BBB interface

#### 3. Audio/Video Issues
- **Check**: HTTPS is properly configured
- **Verify**: Firewall allows UDP ports 16384-32768
- **Test**: Use BBB's built-in echo test

#### 4. Recording Not Working
- **Check**: Recording is enabled in BBB config
- **Verify**: Sufficient disk space
- **Configure**: Recording processing scripts

### Debug Commands:
```bash
# Check BBB status
sudo bbb-conf --check

# View BBB logs
sudo journalctl -u bbb-web
sudo tail -f /var/log/bigbluebutton/bbb-web.log

# Restart BBB services
sudo bbb-conf --restart
```

## 🔒 Security Best Practices

1. **SSL/HTTPS**: Always use HTTPS for BBB server
2. **Firewall**: Restrict access to necessary ports only
3. **Updates**: Keep BBB server updated regularly
4. **Access Control**: Use strong passwords and user validation
5. **Recording Security**: Secure recording storage and access

## 💰 Cost Considerations

### Self-Hosted Costs:
- **Server**: $50-200/month (depending on size)
- **Bandwidth**: $0.10-0.50 per GB transferred
- **Maintenance**: Admin time for updates/monitoring

### Hosted Service Costs:
- **Basic Plans**: $50-200/month for 50-100 concurrent users
- **Enterprise**: $500-2000/month for larger deployments
- **Pay-per-use**: $0.10-0.20 per participant-minute

## 📈 Scaling Guidelines

### Small Institution (< 100 concurrent):
- Single BBB server
- 8GB RAM, 4 CPU cores
- 100Mbps bandwidth

### Medium Institution (100-500 concurrent):
- Load balanced BBB servers
- 16GB+ RAM, 8+ CPU cores per server
- 1Gbps+ bandwidth

### Large Institution (500+ concurrent):
- Multiple BBB servers with load balancer
- Dedicated media servers
- CDN for recordings
- 10Gbps+ bandwidth

## 🆘 Support Resources

- **Official Documentation**: https://docs.bigbluebutton.org/
- **Community Forum**: https://bigbluebutton.org/support/
- **GitHub Issues**: https://github.com/bigbluebutton/bigbluebutton/issues
- **Commercial Support**: https://bigbluebutton.org/commercial-support/

## 🎉 Success!

Once configured, your TVET Connect Kenya platform will have:
- Professional video conferencing capabilities
- Automated session management
- Recording and playback features
- Mobile-friendly access
- Role-based permissions
- Interactive engagement tools

Perfect for technical and vocational education training! 🎓
