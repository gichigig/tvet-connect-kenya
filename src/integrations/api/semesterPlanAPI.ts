// Semester Plan API Integration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const API_KEY = import.meta.env.VITE_API_KEY;

interface SemesterPlanData {
  semesterStart?: string;
  semesterWeeks: number;
  weekPlans: any[];
}

interface ApiResponse {
  message: string;
  plan?: any;
  planId?: string;
  error?: string;
}

export class SemesterPlanAPI {
  private static getHeaders() {
    return {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY || '',
    };
  }

  /**
   * Save semester plan to backend
   */
  static async saveSemesterPlan(unitId: string, planData: SemesterPlanData): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/semester/plans/${unitId}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(planData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save semester plan');
      }

      return data;
    } catch (error) {
      console.error('Error saving semester plan:', error);
      throw error;
    }
  }

  /**
   * Get semester plan from backend
   */
  static async getSemesterPlan(unitId: string): Promise<SemesterPlanData> {
    try {
      console.log(`SemesterPlanAPI - getSemesterPlan called for unit: ${unitId}`);
      console.log(`SemesterPlanAPI - API URL: ${API_BASE_URL}/api/semester/plans/${unitId}`);
      console.log(`SemesterPlanAPI - API Key present:`, !!API_KEY);
      
      const response = await fetch(`${API_BASE_URL}/api/semester/plans/${unitId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      console.log(`SemesterPlanAPI - Response status: ${response.status}`);
      console.log(`SemesterPlanAPI - Response ok: ${response.ok}`);

      const data = await response.json();
      console.log(`SemesterPlanAPI - Response data:`, data);

      if (response.status === 404) {
        console.log(`SemesterPlanAPI - Plan not found (404) for unit: ${unitId}`);
        // Return default empty plan if not found
        return {
          semesterStart: undefined,
          semesterWeeks: 15,
          weekPlans: []
        };
      }

      if (!response.ok) {
        console.log(`SemesterPlanAPI - Error response:`, data);
        throw new Error(data.error || 'Failed to fetch semester plan');
      }

      console.log(`SemesterPlanAPI - Successfully fetched plan for unit: ${unitId}`, data.plan);
      return data.plan;
    } catch (error) {
      console.error('SemesterPlanAPI - Error fetching semester plan:', error);
      console.error('SemesterPlanAPI - Error details:', error.message);
      // Return default empty plan on error
      return {
        semesterStart: undefined,
        semesterWeeks: 15,
        weekPlans: []
      };
    }
  }

  /**
   * Delete semester plan from backend
   */
  static async deleteSemesterPlan(unitId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/semester/plans/${unitId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete semester plan');
      }

      return data;
    } catch (error) {
      console.error('Error deleting semester plan:', error);
      throw error;
    }
  }

  /**
   * Test API connectivity
   */
  static async testConnectivity(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      
      return response.ok;
    } catch (error) {
      console.error('API connectivity test failed:', error);
      return false;
    }
  }
}

export default SemesterPlanAPI;
