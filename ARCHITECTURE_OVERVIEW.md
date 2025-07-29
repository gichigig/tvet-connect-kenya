# 🏗️ TVET Connect Kenya - Architecture Overview

## ✅ **FIXED: Firebase Functions Import Error**

**Problem**: `secureUpload.ts` was trying to import `functions` from Firebase config, but you're using AWS Lambda instead.

**Solution**: Updated the architecture to use the correct backend services.

---

## 🏛️ **Your Current Architecture**

### **Frontend** (React + TypeScript + Vite)
- 🎯 **Location**: `src/` folder
- 🔧 **Technology**: React, TypeScript, Vite, Tailwind CSS, Shadcn/UI
- 📱 **Features**: Student/Lecturer/Admin dashboards, Virtual classrooms, Course management

### **Authentication & Database** (Firebase)
- 🔥 **Firebase Auth**: User authentication and authorization
- 🔥 **Firestore**: Real-time database for courses, users, notifications
- 🔥 **Firebase Realtime DB**: Live updates and real-time features
- ❌ **Firebase Functions**: NOT USED (using AWS Lambda instead)

### **Backend Functions** (AWS Lambda)
- ⚡ **AWS Lambda**: Backend business logic and file processing
- 📁 **Location**: `aws-lambda/` folder
- 🎯 **Functions**: File upload, secure URL generation, S3 operations
- 🌐 **API Gateway**: REST API endpoints for Lambda functions

### **File Storage** (AWS S3)
- 📦 **AWS S3**: Secure file storage for documents, images, course materials
- 🔒 **Presigned URLs**: Secure direct uploads from browser to S3
- 📁 **Folders**: `profile-pictures/`, `student-documents/`, `course-materials/`

### **Video Conferencing** (BigBlueButton)
- 🎥 **Self-hosted BBB**: Professional video conferencing (Hetzner setup guide available)
- 🔄 **Fallback Mode**: Basic browser-based classroom as backup

---

## 🔧 **Integration Flow**

### **File Upload Process**:
```
Browser → Firebase Auth → AWS Lambda → S3 Presigned URL → Direct S3 Upload
```

### **Authentication Flow**:
```
Browser → Firebase Auth → ID Token → AWS Lambda (validates token)
```

### **Database Operations**:
```
Browser → Firebase SDK → Firestore/Realtime DB
```

### **Video Conferencing**:
```
Browser → BigBlueButton API → Self-hosted BBB Server
```

---

## 📁 **Key Files Updated**

### ✅ **Fixed Files**:
- `src/integrations/firebase/config.ts` - Removed functions export
- `src/integrations/aws/secureUpload.ts` - Updated to use AWS Lambda instead of Firebase Functions
- `src/lib/bigbluebutton.ts` - Fixed crypto issues for browser compatibility
- `.env.example` - Added AWS Lambda API URL configuration

### 🎯 **Configuration Needed**:
- Add `VITE_AWS_LAMBDA_API_URL` to your `.env` file after deploying Lambda
- Deploy AWS Lambda functions using the provided deployment scripts
- Configure BigBlueButton server (Hetzner guide available)

---

## 🚀 **Deployment Status**

### ✅ **Ready for Production**:
- Frontend React app (can deploy to Vercel, Netlify, etc.)
- Firebase configuration (auth + database)
- AWS Lambda functions (ready to deploy)

### 📋 **Next Steps**:
1. **Deploy AWS Lambda**: Use `aws-lambda/deploy.sh` or manual deployment
2. **Configure API Gateway**: Get the endpoint URL for `VITE_AWS_LAMBDA_API_URL`
3. **Setup BigBlueButton**: Use the Hetzner setup guide for €12.96/month
4. **Environment Variables**: Update `.env` with actual values

---

## 💡 **Why This Architecture?**

### **Benefits**:
- 🔥 **Firebase**: Excellent for real-time features, auth, and frontend integration
- ⚡ **AWS Lambda**: Cost-effective, scalable backend functions
- 📦 **S3**: Secure, reliable file storage with direct uploads
- 🎥 **BigBlueButton**: Professional, self-hosted video conferencing

### **Cost Effective**:
- Firebase: Free tier + pay-as-you-scale
- AWS Lambda: Only pay for execution time
- S3: Cheap storage + bandwidth
- BigBlueButton: €12.96/month for unlimited users

**Perfect for educational institutions!** 🎓
