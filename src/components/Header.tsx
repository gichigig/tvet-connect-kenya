import React, { useState, useRef, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, User, Search, LogOut, Shield, GraduationCap } from "lucide-react";
import Cropper from "react-easy-crop";
import { MobileMenu } from "@/components/ui/MobileMenu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import getCroppedImg from "@/components/getCroppedImg";
import {
  updateUserEmail,
  updateUserPassword,
  updateUserPhoneNumber,
  updateUserProfilePicture
} from "@/integrations/firebase/profile";

// Utility: getCroppedImg should be imported from your utils, or you can define it inline if needed

interface HeaderProps {
  onSearch: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
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

  const handleNavigation = (path: string) => {
    setShowProfileMenu(false);
    setShowProfileMenuMobile(false);
    navigate(path);
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setProfileForm((prev) => ({ ...prev, profilePicture: ev.target?.result as string }));
        setShowCrop(true);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onCropComplete = (_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropSave = async () => {
    setLoading(true);
    try {
      const croppedBlob = await getCroppedImg(profileForm.profilePicture, croppedAreaPixels);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm((prev) => ({ ...prev, profilePicture: reader.result as string }));
        setShowCrop(false);
        setHasCropped(true);
        setSuccess("Cropped successfully!");
        setLoading(false);
      };
      reader.onerror = () => {
        setError("Failed to read cropped image");
        setLoading(false);
      };
      reader.readAsDataURL(croppedBlob);
    } catch (err) {
      setError("Failed to crop image");
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    if (!user) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }
    // Phone validation: must be 9 digits and start with 7
    if (!/^7\d{8}$/.test(profileForm.phone)) {
      setError("Enter a valid Kenyan number (e.g. 712345678)");
      setLoading(false);
      return;
    }
    try {
      if (profileForm.email !== user.email) {
        await updateUserEmail(profileForm.email);
      }
      if (profileForm.password) {
        await updateUserPassword(profileForm.password);
      }
      if (profileForm.phone !== (user.phone ? user.phone.replace(/^\+254/, "") : "")) {
        await updateUserPhoneNumber(user.id, "+254" + profileForm.phone);
      }
      if (hasCropped && profileForm.profilePicture && profileForm.profilePicture !== user.profilePicture) {
        // Convert dataURL to File for upload
        const res = await fetch(profileForm.profilePicture);
        const blob = await res.blob();
        const file = new File([blob], "profile.jpg", { type: blob.type });
        await updateUserProfilePicture(user.id, file);
      }
      setSuccess("Profile updated successfully!");
      setProfileForm((prev) => ({ ...prev, password: "" }));
      setHasCropped(false);
      setTimeout(() => setShowProfileModal(false), 1200);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };



  return (
    <header className="bg-white shadow sticky top-0 z-40">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        <Link to="/" className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <span className="font-bold text-lg">TVET Connect</span>
        </Link>
        <div className="flex-1 mx-4 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search TVET courses..."
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
                    {profileForm.profilePicture ? (
                      <img src={profileForm.profilePicture} alt="Profile" className="w-6 h-6 rounded-full mr-2 object-cover" />
                    ) : (
                      <User className="w-4 h-4 mr-2" />
                    )}
                    Profile
                  </Button>
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow-lg z-50">
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { setShowProfileMenu(false); setShowProfileModal(true); }}>Profile Settings</button>
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
                    {profileForm.profilePicture ? (
                      <img src={profileForm.profilePicture} alt="Profile" className="w-6 h-6 rounded-full mr-2 object-cover" />
                    ) : (
                      <User className="w-4 h-4 mr-2" />
                    )}
                    Profile
                  </Button>
                  {showProfileMenuMobile && (
                    <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow-lg z-50">
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { setShowProfileMenuMobile(false); setShowProfileModal(true); }}>Profile Settings</button>
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
              <img src={profileForm.profilePicture || "/placeholder.svg"} alt="Full Profile" className="max-h-[80vh] max-w-[90vw] rounded-lg border-4 border-white" />
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
            <form onSubmit={handleProfileSubmit} className="space-y-4">
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
                    src={profileForm.profilePicture || "/placeholder.svg"}
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
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  className="w-full border rounded px-3 py-2"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
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
                    minLength={9}
                    placeholder="7XXXXXXXX"
                    required
                  />
                </div>
                {/* Kenyan phone validation */}
                {profileForm.phone && !/^7\d{8}$/.test(profileForm.phone) && (
                  <div className="text-xs text-red-600 mt-1">Enter a valid Kenyan number (e.g. 712345678)</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
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
