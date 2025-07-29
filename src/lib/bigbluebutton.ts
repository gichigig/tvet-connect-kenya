// Note: In browser environment, we'll use Web Crypto API fallback
// import crypto from 'crypto';

export interface BBBMeetingConfig {
  meetingID: string;
  meetingName: string;
  attendeePW: string;
  moderatorPW: string;
  welcome?: string;
  dialNumber?: string;
  voiceBridge?: string;
  maxParticipants?: number;
  logoutURL?: string;
  record?: boolean;
  duration?: number;
  isBreakout?: boolean;
  parentMeetingID?: string;
  sequence?: number;
  freeJoin?: boolean;
  meta?: Record<string, string>;
}

export interface BBBJoinConfig {
  meetingID: string;
  password: string;
  fullName: string;
  userID?: string;
  webVoiceConf?: string;
  configToken?: string;
  defaultLayout?: string;
  avatarURL?: string;
  redirect?: boolean;
  clientURL?: string;
  joinViaHtml5?: boolean;
  guest?: boolean;
}

class BigBlueButtonAPI {
  private baseUrl: string;
  private secret: string;

  constructor(baseUrl: string, secret: string) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.secret = secret;
  }

  /**
   * Generate SHA1 hash using browser-compatible method
   */
  private async sha1(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-1', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Generate checksum for API calls
   */
  private async generateChecksum(apiCall: string, queryString: string): Promise<string> {
    const data = apiCall + queryString + this.secret;
    return await this.sha1(data);
  }

  /**
   * Build query string from parameters
   */
  private buildQueryString(params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result: Record<string, any>, key: string) => {
        if (params[key] !== undefined && params[key] !== null) {
          result[key] = params[key];
        }
        return result;
      }, {});

    return new URLSearchParams(sortedParams).toString();
  }

  /**
   * Create a new meeting
   */
  async createMeeting(config: BBBMeetingConfig): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const params: Record<string, any> = {
        name: config.meetingName,
        meetingID: config.meetingID,
        attendeePW: config.attendeePW,
        moderatorPW: config.moderatorPW,
      };

      // Optional parameters
      if (config.welcome) params.welcome = config.welcome;
      if (config.dialNumber) params.dialNumber = config.dialNumber;
      if (config.voiceBridge) params.voiceBridge = config.voiceBridge;
      if (config.maxParticipants) params.maxParticipants = config.maxParticipants;
      if (config.logoutURL) params.logoutURL = config.logoutURL;
      if (config.record !== undefined) params.record = config.record;
      if (config.duration) params.duration = config.duration;
      if (config.isBreakout !== undefined) params.isBreakout = config.isBreakout;
      if (config.parentMeetingID) params.parentMeetingID = config.parentMeetingID;
      if (config.sequence) params.sequence = config.sequence;
      if (config.freeJoin !== undefined) params.freeJoin = config.freeJoin;

      // Meta parameters
      if (config.meta) {
        Object.keys(config.meta).forEach(key => {
          params[`meta_${key}`] = config.meta![key];
        });
      }

      const queryString = this.buildQueryString(params);
      const checksum = await this.generateChecksum('create', queryString);
      const url = `${this.baseUrl}/api/create?${queryString}&checksum=${checksum}`;

      const response = await fetch(url, { method: 'GET' });
      const xmlText = await response.text();
      
      // Parse XML response (simplified - in production use a proper XML parser)
      const returnCode = xmlText.match(/<returncode>(.*?)<\/returncode>/)?.[1];
      
      if (returnCode === 'SUCCESS') {
        return { success: true, data: xmlText };
      } else {
        const messageKey = xmlText.match(/<messageKey>(.*?)<\/messageKey>/)?.[1];
        const message = xmlText.match(/<message>(.*?)<\/message>/)?.[1];
        return { success: false, error: message || messageKey || 'Unknown error' };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Generate join URL for a meeting
   */
  async getJoinURL(config: BBBJoinConfig): Promise<string> {
    const params: Record<string, any> = {
      meetingID: config.meetingID,
      password: config.password,
      fullName: config.fullName,
    };

    // Optional parameters
    if (config.userID) params.userID = config.userID;
    if (config.webVoiceConf) params.webVoiceConf = config.webVoiceConf;
    if (config.configToken) params.configToken = config.configToken;
    if (config.defaultLayout) params.defaultLayout = config.defaultLayout;
    if (config.avatarURL) params.avatarURL = config.avatarURL;
    if (config.redirect !== undefined) params.redirect = config.redirect;
    if (config.clientURL) params.clientURL = config.clientURL;
    if (config.joinViaHtml5 !== undefined) params.joinViaHtml5 = config.joinViaHtml5;
    if (config.guest !== undefined) params.guest = config.guest;

    const queryString = this.buildQueryString(params);
    const checksum = await this.generateChecksum('join', queryString);
    
    return `${this.baseUrl}/api/join?${queryString}&checksum=${checksum}`;
  }

  /**
   * Check if meeting is running
   */
  async isMeetingRunning(meetingID: string): Promise<{ success: boolean; running?: boolean; error?: string }> {
    try {
      const params = { meetingID };
      const queryString = this.buildQueryString(params);
      const checksum = await this.generateChecksum('isMeetingRunning', queryString);
      const url = `${this.baseUrl}/api/isMeetingRunning?${queryString}&checksum=${checksum}`;

      const response = await fetch(url);
      const xmlText = await response.text();
      
      const returnCode = xmlText.match(/<returncode>(.*?)<\/returncode>/)?.[1];
      const running = xmlText.match(/<running>(.*?)<\/running>/)?.[1] === 'true';
      
      if (returnCode === 'SUCCESS') {
        return { success: true, running };
      } else {
        const message = xmlText.match(/<message>(.*?)<\/message>/)?.[1];
        return { success: false, error: message || 'Unknown error' };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get meeting info
   */
  async getMeetingInfo(meetingID: string, password: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const params = { meetingID, password };
      const queryString = this.buildQueryString(params);
      const checksum = await this.generateChecksum('getMeetingInfo', queryString);
      const url = `${this.baseUrl}/api/getMeetingInfo?${queryString}&checksum=${checksum}`;

      const response = await fetch(url);
      const xmlText = await response.text();
      
      const returnCode = xmlText.match(/<returncode>(.*?)<\/returncode>/)?.[1];
      
      if (returnCode === 'SUCCESS') {
        return { success: true, data: xmlText };
      } else {
        const message = xmlText.match(/<message>(.*?)<\/message>/)?.[1];
        return { success: false, error: message || 'Unknown error' };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * End meeting
   */
  async endMeeting(meetingID: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const params = { meetingID, password };
      const queryString = this.buildQueryString(params);
      const checksum = await this.generateChecksum('end', queryString);
      const url = `${this.baseUrl}/api/end?${queryString}&checksum=${checksum}`;

      const response = await fetch(url);
      const xmlText = await response.text();
      
      const returnCode = xmlText.match(/<returncode>(.*?)<\/returncode>/)?.[1];
      
      if (returnCode === 'SUCCESS') {
        return { success: true };
      } else {
        const message = xmlText.match(/<message>(.*?)<\/message>/)?.[1];
        return { success: false, error: message || 'Unknown error' };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get recordings
   */
  async getRecordings(meetingID?: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const params: Record<string, any> = {};
      if (meetingID) params.meetingID = meetingID;

      const queryString = this.buildQueryString(params);
      const checksum = await this.generateChecksum('getRecordings', queryString);
      const url = `${this.baseUrl}/api/getRecordings?${queryString}&checksum=${checksum}`;

      const response = await fetch(url);
      const xmlText = await response.text();
      
      const returnCode = xmlText.match(/<returncode>(.*?)<\/returncode>/)?.[1];
      
      if (returnCode === 'SUCCESS') {
        return { success: true, data: xmlText };
      } else {
        const message = xmlText.match(/<message>(.*?)<\/message>/)?.[1];
        return { success: false, error: message || 'Unknown error' };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export default BigBlueButtonAPI;
