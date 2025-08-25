/**
 * Device fingerprinting utility for attendance security
 * Prevents one device from marking attendance for multiple users
 */

interface DeviceFingerprint {
  id: string;
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  cookiesEnabled: boolean;
  localStorage: boolean;
  sessionStorage: boolean;
  indexedDB: boolean;
  webGL: string;
  canvas: string;
  audio: string;
  timestamp: number;
}

interface AttendanceDeviceRestriction {
  deviceId: string;
  userId: string;
  sessionId: string;
  timestamp: number;
  userAgent: string;
  ipAddress?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Generate a unique device fingerprint
 */
export const generateDeviceFingerprint = async (): Promise<DeviceFingerprint> => {
  // Basic browser information
  const userAgent = navigator.userAgent;
  const screenResolution = `${screen.width}x${screen.height}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = navigator.language;
  const platform = navigator.platform;

  // Feature detection
  const cookiesEnabled = navigator.cookieEnabled;
  const localStorage = typeof(Storage) !== "undefined";
  const sessionStorage = typeof(Storage) !== "undefined" && !!window.sessionStorage;
  const indexedDB = 'indexedDB' in window;

  // WebGL fingerprint
  let webGL = '';
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const vendor = gl.getParameter(gl.VENDOR);
      const renderer = gl.getParameter(gl.RENDERER);
      webGL = `${vendor}~${renderer}`;
    }
  } catch (e) {
    webGL = 'unavailable';
  }

  // Canvas fingerprint
  let canvas = '';
  try {
    const canvasElement = document.createElement('canvas');
    const ctx = canvasElement.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprinting for attendance security', 2, 2);
      canvas = canvasElement.toDataURL().slice(-50); // Last 50 chars
    }
  } catch (e) {
    canvas = 'unavailable';
  }

  // Audio fingerprint
  let audio = '';
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const analyser = audioContext.createAnalyser();
    const gain = audioContext.createGain();
    
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(10000, audioContext.currentTime);
    
    gain.gain.setValueAtTime(0, audioContext.currentTime);
    
    oscillator.connect(analyser);
    analyser.connect(gain);
    gain.connect(audioContext.destination);
    
    oscillator.start(0);
    
    const frequencyData = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(frequencyData);
    
    audio = Array.from(frequencyData.slice(0, 10)).join(',');
    oscillator.stop();
  } catch (e) {
    audio = 'unavailable';
  }

  // Generate composite fingerprint ID
  const fingerprintData = `${userAgent}|${screenResolution}|${timezone}|${language}|${platform}|${webGL}|${canvas}|${audio}`;
  
  // Simple hash function for fingerprint ID
  let hash = 0;
  for (let i = 0; i < fingerprintData.length; i++) {
    const char = fingerprintData.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  const fingerprintId = `fp_${Math.abs(hash).toString(36)}_${Date.now()}`;

  return {
    id: fingerprintId,
    userAgent,
    screenResolution,
    timezone,
    language,
    platform,
    cookiesEnabled,
    localStorage,
    sessionStorage,
    indexedDB,
    webGL,
    canvas,
    audio,
    timestamp: Date.now()
  };
};

/**
 * Get or create device fingerprint
 */
export const getDeviceFingerprint = async (): Promise<DeviceFingerprint> => {
  const stored = localStorage.getItem('device_fingerprint');
  
  if (stored) {
    try {
      const fingerprint = JSON.parse(stored) as DeviceFingerprint;
      // Check if fingerprint is less than 24 hours old
      if (Date.now() - fingerprint.timestamp < 24 * 60 * 60 * 1000) {
        return fingerprint;
      }
    } catch (e) {
      console.error('Error parsing stored fingerprint:', e);
    }
  }

  // Generate new fingerprint
  const fingerprint = await generateDeviceFingerprint();
  localStorage.setItem('device_fingerprint', JSON.stringify(fingerprint));
  return fingerprint;
};

/**
 * Check if device can mark attendance for user
 */
export const checkDeviceAttendanceEligibility = async (
  sessionId: string, 
  userId: string
): Promise<{ allowed: boolean; reason?: string; conflictUser?: string }> => {
  const fingerprint = await getDeviceFingerprint();
  
  // Get session attendance restrictions from localStorage
  const restrictionsKey = `attendance_device_restrictions_${sessionId}`;
  const stored = localStorage.getItem(restrictionsKey);
  
  let restrictions: AttendanceDeviceRestriction[] = [];
  if (stored) {
    try {
      restrictions = JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing device restrictions:', e);
    }
  }

  // Check if this device has already been used for attendance in this session
  const existingRestriction = restrictions.find(r => r.deviceId === fingerprint.id);
  
  if (existingRestriction) {
    if (existingRestriction.userId !== userId) {
      return {
        allowed: false,
        reason: 'This device has already been used to mark attendance for another user in this session',
        conflictUser: existingRestriction.userId
      };
    } else {
      // Same user on same device - allow but check for duplicate attendance
      return { allowed: true };
    }
  }

  // Check if user has already marked attendance from another device
  const userRestriction = restrictions.find(r => r.userId === userId);
  if (userRestriction) {
    return {
      allowed: false,
      reason: 'You have already marked attendance for this session from another device',
    };
  }

  return { allowed: true };
};

/**
 * Record device attendance restriction
 */
export const recordDeviceAttendanceRestriction = async (
  sessionId: string, 
  userId: string, 
  location?: { latitude: number; longitude: number }
): Promise<void> => {
  const fingerprint = await getDeviceFingerprint();
  
  const restriction: AttendanceDeviceRestriction = {
    deviceId: fingerprint.id,
    userId,
    sessionId,
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
    location
  };

  // Store restriction
  const restrictionsKey = `attendance_device_restrictions_${sessionId}`;
  const stored = localStorage.getItem(restrictionsKey);
  
  let restrictions: AttendanceDeviceRestriction[] = [];
  if (stored) {
    try {
      restrictions = JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing device restrictions:', e);
    }
  }

  // Remove any existing restriction for this user/device combination
  restrictions = restrictions.filter(r => !(r.userId === userId && r.deviceId === fingerprint.id));
  
  // Add new restriction
  restrictions.push(restriction);
  
  // Store updated restrictions
  localStorage.setItem(restrictionsKey, JSON.stringify(restrictions));
};

/**
 * Get device restrictions summary for debugging
 */
export const getDeviceRestrictionsSummary = (sessionId: string) => {
  const restrictionsKey = `attendance_device_restrictions_${sessionId}`;
  const stored = localStorage.getItem(restrictionsKey);
  
  if (!stored) return null;
  
  try {
    const restrictions: AttendanceDeviceRestriction[] = JSON.parse(stored);
    return {
      totalRestrictions: restrictions.length,
      uniqueDevices: new Set(restrictions.map(r => r.deviceId)).size,
      uniqueUsers: new Set(restrictions.map(r => r.userId)).size,
      restrictions
    };
  } catch (e) {
    console.error('Error parsing restrictions for summary:', e);
    return null;
  }
};

/**
 * Clean up old device restrictions (call periodically)
 */
export const cleanupOldDeviceRestrictions = (maxAgeHours: number = 48) => {
  const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000);
  
  // Get all localStorage keys that are attendance restrictions
  const restrictionKeys = Object.keys(localStorage).filter(key => 
    key.startsWith('attendance_device_restrictions_')
  );

  restrictionKeys.forEach(key => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const restrictions: AttendanceDeviceRestriction[] = JSON.parse(stored);
        const filteredRestrictions = restrictions.filter(r => r.timestamp > cutoffTime);
        
        if (filteredRestrictions.length === 0) {
          localStorage.removeItem(key);
        } else if (filteredRestrictions.length !== restrictions.length) {
          localStorage.setItem(key, JSON.stringify(filteredRestrictions));
        }
      }
    } catch (e) {
      console.error(`Error cleaning up restrictions for ${key}:`, e);
    }
  });
};
