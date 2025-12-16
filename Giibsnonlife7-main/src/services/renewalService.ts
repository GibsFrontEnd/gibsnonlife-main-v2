//@ts-nocheck
import {
    Renewal,
    RenewalResponse,
    RenewalFilterParams,
    UpdateRenewal,
    ApiResponse
  } from "../types/renewal";
  
  const API_BASE_URL = "https://nsianlapi.newgibsonline.com";
  
  class RenewalService {
    private getHeaders(): HeadersInit {
      const token = localStorage.getItem('token'); // Or your auth token storage
      return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      };
    }
  
    // GET /api/Renewal - Get all renewals with pagination
    async getAllRenewals(
      page: number = 1,
      pageSize: number = 10
    ): Promise<ApiResponse<RenewalResponse>> {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/Renewal?page=${page}&pageSize=${pageSize}`,
          {
            headers: this.getHeaders(),
          }
        );
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        return await response.json();
      } catch (error) {
        console.error('Error fetching renewals:', error);
        throw error;
      }
    }
  
    // GET /api/Renewal/{id} - Get renewal by ID
    async getRenewalById(id: number): Promise<ApiResponse<Renewal>> {
      try {
        const response = await fetch(`${API_BASE_URL}/api/Renewal/${id}`, {
          headers: this.getHeaders(),
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        return await response.json();
      } catch (error) {
        console.error(`Error fetching renewal ${id}:`, error);
        throw error;
      }
    }
  
    // GET /api/Renewal/bypolicy/{policyNo} - Get by policy number
    async getRenewalByPolicyNo(policyNo: string): Promise<ApiResponse<Renewal[]>> {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/Renewal/bypolicy/${policyNo}`,
          {
            headers: this.getHeaders(),
          }
        );
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        return await response.json();
      } catch (error) {
        console.error(`Error fetching renewal by policy ${policyNo}:`, error);
        throw error;
      }
    }
  
    // GET /api/Renewal/filter - Get renewals with filters
    async getRenewalsByFilter(
      filters: RenewalFilterParams
    ): Promise<ApiResponse<RenewalResponse>> {
      try {
        // Build query string from filters
        const queryParams = new URLSearchParams();
        
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, String(value));
          }
        });
  
        const response = await fetch(
          `${API_BASE_URL}/api/Renewal/filter?${queryParams.toString()}`,
          {
            headers: this.getHeaders(),
          }
        );
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        return await response.json();
      } catch (error) {
        console.error('Error filtering renewals:', error);
        throw error;
      }
    }
  
    // PUT /api/Renewal/{id} - Update renewal
    async updateRenewal(
      id: number,
      renewalData: UpdateRenewal
    ): Promise<ApiResponse<Renewal>> {
      try {
        const response = await fetch(`${API_BASE_URL}/api/Renewal/${id}`, {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify(renewalData),
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        return await response.json();
      } catch (error) {
        console.error(`Error updating renewal ${id}:`, error);
        throw error;
      }
    }
  }
  
  export const renewalService = new RenewalService();