import React, { useState, useRef, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Search, LogOut, Shield, GraduationCap, Bell } from "lucide-react";
import Cropper from "react-easy-crop";
import { MobileMenu } from "@/components/ui/MobileMenu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import getCroppedImg from "@/components/getCroppedImg";
import {
  updateUserEmail,
  updateUserPassword,
  updateUserPhoneNumber,
  saveProfileWithPicture
} from "@/integrations/firebase/profile";
import { createSampleNotifications } from "@/utils/notificationUtils";

// Utility: getCroppedImg should be imported from your utils, or you can define it inline if needed

interface HeaderProps {
  onSearch: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout, updateProfilePicture } = useAuth();
  const { unreadCount } = useNotifications();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileMenuMobile, setShowProfileMenuMobile] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showFullPic, setShowFullPic] = useState(false);
  const [showCrop, setShowCrop] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [hasCropped, setHasCropped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileForm, setProfileForm] = useState({
    email: user?.email || "",
    phone: user?.phone ? user.phone.replace(/^\+254/, "") : "",
    password: "",
    profilePicture: user?.profilePicture || ""
  });

  // Update profileForm when user context changes (especially profile picture)
  useEffect(() => {
    if (user) {
      setProfileForm(prev => ({
        ...prev,
        email: user.email || "",
        phone: user.phone ? user.phone.replace(/^\+254/, "") : "",
        profilePicture: user.profilePicture || ""
      }));
    }
  }, [user]);

  const handleNavigation = (path: string) => {
    setShowProfileMenu(false);
    setShowProfileMenuMobile(false);
    navigate(path);
  };

  // Independent profile picture update function
  const handleProfilePictureUpdate = async (pictureFile: File) => {
    setLoading(true);
    setError("");
    setSuccess("");

    console.log('[DEBUG] handleProfilePictureUpdate: user:', user);
    console.log('[DEBUG] handleProfilePictureUpdate: isAuthenticated:', isAuthenticated);

    if (!user?.id) {
      setError("Please log in to update your profile picture");
      setLoading(false);
      return;
    }

    try {
      // Use the updateProfilePicture function from AuthContext
      const newImageUrl = await updateProfilePicture(pictureFile);
      
      // Update the form state with the new image URL
      setProfileForm(prev => ({ ...prev, profilePicture: newImageUrl }));
      setSuccess("Profile picture uploaded to AWS and saved successfully!");
      setHasCropped(false);
      
      console.log('[DEBUG] Profile picture uploaded to AWS and saved:', newImageUrl);
    } catch (err: any) {
      console.error('[DEBUG] Profile picture update error:', err);
      setError(err.message || "Failed to update profile picture");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  // Function to create sample notifications for testing
  const createSampleNotifs = async () => {
    if (!user?.id) return;
    try {
      await createSampleNotifications(user.id);
      setSuccess("Sample notifications created!");
    } catch (error) {
      console.error("Error creating sample notifications:", error);
      setError("Failed to create sample notifications");
    }
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Import validation function dynamically
      import("@/integrations/aws/utils").then(({ validateProfilePicture }) => {
        const validation = validateProfilePicture(file);
        
        if (!validation.valid) {
          setError(validation.error || "Invalid file");
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (ev) => {
          setProfileForm((prev) => ({ ...prev, profilePicture: ev.target?.result as string }));
          setShowCrop(true);
          setError(""); // Clear any previous errors
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const onCropComplete = (_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropSave = async () => {
    setLoading(true);
    try {
      const croppedBlob = await getCroppedImg(profileForm.profilePicture, croppedAreaPixels);
      
      // Convert blob to file for immediate upload
      const croppedFile = new File([croppedBlob], "profile.jpg", { type: croppedBlob.type });
      
      // Immediately update the profile picture
      await handleProfilePictureUpdate(croppedFile);
      
      setShowCrop(false);
      setHasCropped(false); // Reset since we've already saved
    } catch (err) {
      setError("Failed to crop and save image");
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!user?.id) {
      setError("Please log in to update your profile");
      setLoading(false);
      return;
    }

    console.log('Profile submit started for user:', { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    });
    
    // Phone validation: only validate if phone number is provided and not empty
    if (profileForm.phone.trim() && !/^7\d{8}$/.test(profileForm.phone.trim())) {
      setError("Enter a valid Kenyan number (e.g. 712345678) or leave empty to keep current");
      setLoading(false);
      return;
    }

    // Email validation: basic email format if provided
    if (profileForm.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email.trim())) {
      setError("Enter a valid email address or leave empty to keep current");
      setLoading(false);
      return;
    }
    
    try {
      // Check what changes we're making (excluding pictures)
      const hasEmailChange = profileForm.email.trim() && profileForm.email !== user.email;
      const hasPhoneChange = profileForm.phone.trim() && profileForm.phone !== (user.phone ? user.phone.replace(/^\+254/, "") : "");
      const hasPasswordChange = profileForm.password.trim();

      // Validate that we have some changes to make
      if (!hasEmailChange && !hasPhoneChange && !hasPasswordChange) {
        setError("No changes detected. Please modify email, phone, or password.");
        setLoading(false);
        return;
      }

      // Handle auth updates only if values have actually changed and are not empty
      if (hasEmailChange) {
        await updateUserEmail(profileForm.email);
      }
      
      if (hasPasswordChange) {
        await updateUserPassword(profileForm.password);
      }
      
      if (hasPhoneChange) {
        await updateUserPhoneNumber(user.id, "+254" + profileForm.phone);
      }

      // Create descriptive success message
      const updatedItems = [];
      if (hasEmailChange) updatedItems.push("email");
      if (hasPhoneChange) updatedItems.push("phone");
      if (hasPasswordChange) updatedItems.push("password");

      const successMessage = updatedItems.length > 0 
        ? `Updated: ${updatedItems.join(", ")}`
        : "Profile saved successfully!";

      setSuccess(successMessage);
      setProfileForm((prev) => ({ ...prev, password: "" }));
      setTimeout(() => setShowProfileModal(false), 1200);
    } catch (err: any) {
      console.error('Profile update error:', err);
      
      let errorMessage = "Failed to update profile";
      
      if (err.message && err.message.includes('Authentication expired')) {
        errorMessage = err.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };



  return (
    <header className="bg-white shadow sticky top-0 z-40">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src="/WhatsApp Image 2025-08-06 at 11.54.03 PM.jpeg" alt="Billy Dev Logo" className="w-8 h-8 object-cover" />
          <span className="font-bold text-lg">Billy Dev</span>
        </Link>
        <div className="flex-1 mx-4 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search Billy Dev courses..."
              className="pl-10 w-full border rounded px-3 py-2"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        </div>
        {/* Desktop actions */}
        <div className="hidden sm:flex items-center space-x-4">
          {isAuthenticated && user ? (
            <>
              {isAdmin && (
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleNavigation('/admin')}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Admin Panel
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleNavigation('/courses')}
                  >
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Courses
                  </Button>
                </div>
              )}
              {!isAdmin && (
                <Button variant="ghost" size="sm">
                  My Courses
                </Button>
              )}
              <div className="flex items-center space-x-4">
                {/* Notification Bell */}
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleNavigation('/notifications')}
                    className="relative p-2"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center border-2 border-white shadow-lg">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {user.role.toUpperCase()}
                  </span>
                </div>
                <div className="relative group">
                  <Button variant="ghost" size="sm" className="flex items-center" onClick={() => setShowProfileMenu(v => !v)}>
                    {user?.profilePicture ? (
                      <img src={user.profilePicture} alt="Profile" className="w-6 h-6 rounded-full mr-2 object-cover" />
                    ) : (
                      <User className="w-4 h-4 mr-2" />
                    )}
                    Profile
                  </Button>
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow-lg z-50">
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { setShowProfileMenu(false); setShowProfileModal(true); }}>Profile Settings</button>
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-blue-600" onClick={() => { setShowProfileMenu(false); createSampleNotifs(); }}>Create Sample Notifications</button>
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600" onClick={() => { setShowProfileMenu(false); logout(); }}>Log Out</button>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
        {/* Mobile hamburger menu */}
        <MobileMenu>
          <div className="flex flex-col p-4 gap-3">
            {isAuthenticated && user ? (
              <>
                {isAdmin && (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="justify-start"
                      onClick={() => handleNavigation('/admin')}
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Admin Panel
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="justify-start"
                      onClick={() => handleNavigation('/courses')}
                    >
                      <GraduationCap className="w-4 h-4 mr-2" />
                      Courses
                    </Button>
                  </>
                )}
                {!isAdmin && (
                  <Button variant="ghost" size="sm" className="justify-start">
                    My Courses
                  </Button>
                )}
                {/* Notifications for mobile */}
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="justify-start relative"
                  onClick={() => handleNavigation('/notifications')}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center border border-white shadow-md">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Button>
                <div className="flex items-center gap-2 mt-2">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {user.role.toUpperCase()}
                  </span>
                </div>
                <div className="relative group">
                  <Button variant="ghost" size="sm" className="flex items-center justify-start" onClick={() => setShowProfileMenuMobile(v => !v)}>
                    {user?.profilePicture ? (
                      <img src={user.profilePicture} alt="Profile" className="w-6 h-6 rounded-full mr-2 object-cover" />
                    ) : (
                      <User className="w-4 h-4 mr-2" />
                    )}
                    Profile
                  </Button>
                  {showProfileMenuMobile && (
                    <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow-lg z-50">
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { setShowProfileMenuMobile(false); setShowProfileModal(true); }}>Profile Settings</button>
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-blue-600" onClick={() => { setShowProfileMenuMobile(false); createSampleNotifs(); }}>Create Sample Notifications</button>
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600" onClick={() => { setShowProfileMenuMobile(false); logout(); }}>Log Out</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="justify-start">
                    <User className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="justify-start">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </MobileMenu>
      </div>
      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          {/* Full Picture Modal */}
          {showFullPic && !showCrop && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80" onClick={() => setShowFullPic(false)}>
              <img src={user?.profilePicture || profileForm.profilePicture || "/placeholder.svg"} alt="Full Profile" className="max-h-[80vh] max-w-[90vw] rounded-lg border-4 border-white" />
            </div>
          )}
          {/* Crop Modal */}
          {showCrop && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
                <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowCrop(false)}>&times;</button>
                <h2 className="text-lg font-bold mb-4">Crop Profile Picture</h2>
                <div className="relative w-64 h-64 bg-gray-100">
                  <Cropper
                    image={profileForm.profilePicture}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <Button type="button" variant="ghost" onClick={() => setShowCrop(false)}>Cancel</Button>
                  <Button type="button" onClick={handleCropSave} disabled={loading}>{loading ? "Saving..." : "Save Crop"}</Button>
                </div>
              </div>
            </div>
          )}
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowProfileModal(false)}>&times;</button>
            <h2 className="text-xl font-bold mb-4">Profile Settings</h2>
            <form onSubmit={handleProfileSubmit} className="space-y-4" noValidate>
              <div className="flex flex-col items-center mb-4">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleProfilePicChange}
                />
                <div className="relative group cursor-pointer">
                  <img
                    src={user?.profilePicture || profileForm.profilePicture || "/placeholder.svg"}
                    alt="Profile Preview"
                    className="w-20 h-20 rounded-full object-cover border"
                    onClick={() => !showCrop && setShowFullPic(true)}
                  />
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 text-xs"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Edit
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email (Optional)</label>
                <input
                  type="email"
                  name="email"
                  className="w-full border rounded px-3 py-2"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  placeholder="Leave blank to keep current email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number (Optional)</label>
                <div className="flex items-center">
                  <span className="px-2 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l">+254</span>
                  <input
                    type="tel"
                    name="phone"
                    className="w-full border rounded-r px-3 py-2 border-l-0"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                    pattern="[0-9]{9}"
                    maxLength={9}
                    placeholder="7XXXXXXXX or leave blank to keep current"
                  />
                </div>
                {/* Kenyan phone validation - only show if phone has content */}
                {profileForm.phone.trim() && !/^7\d{8}$/.test(profileForm.phone.trim()) && (
                  <div className="text-xs text-red-600 mt-1">Enter a valid Kenyan number (e.g. 712345678) or leave blank</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">New Password (Optional)</label>
                <input
                  type="password"
                  name="password"
                  className="w-full border rounded px-3 py-2"
                  value={profileForm.password}
                  onChange={handleProfileChange}
                  placeholder="Leave blank to keep current password"
                />
              </div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
              {success && <div className="text-green-600 text-sm">{success}</div>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setShowProfileModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || showCrop}>
                  {loading
                    ? "Saving..."
                    : showCrop
                    ? "Crop Image First"
                    : success
                    ? "Update"
                    : hasCropped
                    ? "Save Changes"
                    : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
