// Debug script to test email delivery configuration
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { firebaseApp } from "./src/integrations/firebase/config.js";

async function debugEmailDelivery() {
  console.log("🔍 Debugging Firebase Email Delivery...");
  
  const auth = getAuth(firebaseApp);
  
  // Test email delivery configuration
  console.log("Firebase Config:");
  console.log("- Auth Domain:", auth.app.options.authDomain);
  console.log("- Project ID:", auth.app.options.projectId);
  console.log("- API Key:", auth.app.options.apiKey ? "Present" : "Missing");
  
  // Test with a known email
  const testEmail = "test@example.com"; // Replace with actual test email
  
  try {
    console.log(`\n📧 Testing password reset email to: ${testEmail}`);
    
    await sendPasswordResetEmail(auth, testEmail, {
      url: `${window.location.origin}/login`,
      handleCodeInApp: false
    });
    
    console.log("✅ Email sent successfully (according to Firebase)");
    console.log("📝 Check the following:");
    console.log("1. Firebase Console → Authentication → Users (verify user exists)");
    console.log("2. Firebase Console → Authentication → Templates (check email templates)");
    console.log("3. Firebase Console → Authentication → Settings → Authorized domains");
    console.log("4. User's email spam/junk folder");
    console.log("5. Firebase Console → Authentication → Settings → Email verification");
    
  } catch (error) {
    console.error("❌ Error sending email:", error);
    console.log("Error code:", error.code);
    console.log("Error message:", error.message);
  }
}

// Run the debug function
debugEmailDelivery();
