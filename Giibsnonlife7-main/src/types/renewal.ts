// types/renewal.types.ts

// Base Renewal interface (keep as is)
export interface Renewal {
  renewalID: number;
  policyNo: string;
  procDate: string;
  startDate: string;
  expiryDate: string;
  renewalDate: string;
  insuredName: string;
  address: string;
  email: string;
  mobilePhone: string;
  subriskID: string;
  subriskName: string;
  notetype: string | null;
  partyID: string | null;
  partyName: string | null;
  bizOption: string | null;
  description: string | null;
  claimNo: string | null;
  claimRatio: number | null;
  channels: string | null;
  groupName: string | null;
  mktStaffID: string | null;
  mKtStaff: string | null;
  agentAddress: string | null;
  agentEmail: string | null;
  sumInsured: number;
  grossPremium: number;
  aggregateSumInsured: number;
  aggregatePremium: number;
  adjustedRate: number;
  a1: number;
  a2: number;
  a3: number;
  a4: number;
  a5: number;
  field1: string;
  field2: string;
  field3: string;
  field4: string;
  field5: string;
  processBy: string;
  processOn: string;
  modifiedBy: string;
  modifiedOn: string;
  mailSentBy: string;
  mailSentOn: string;
  transGUID: string;
  remarks: string;
  tag: string;
}

// Update Renewal interface (for PUT requests) - keep as is
export interface UpdateRenewalData {
  policyNo?: string;
  insuredName?: string;
  email?: string;
  mobilePhone?: string;
  startDate?: string;
  expiryDate?: string;
  renewalDate?: string;
  grossPremium?: number;
  sumInsured?: number;
  adjustedRate?: number;
  channels?: string;
  subriskName?: string;
  partyName?: string;
  mKtStaff?: string;
  tag?: string;
  remarks?: string;
}

// FIXED: Pagination interface to match ACTUAL API response
export interface PaginationResponse {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// FIXED: Main API response interface that matches ACTUAL API structure
export interface RenewalApiResponse {
  data: Renewal[];
  pagination: PaginationResponse;
}

// Keep your existing RenewalResponse for other uses
export interface RenewalResponse {
  data: Renewal[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Filter parameters - keep as is
export interface RenewalFilterParams {
  policyNo?: string;
  insuredName?: string;
  startDate?: string;
  expiryDate?: string;
  channels?: string;
  subriskName?: string;
  partyName?: string;
  mktStaff?: string;
  tag?: string;
  page?: number;
  pageSize?: number;
}

// API response wrapper - keep as is
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Slice state - keep as is
export interface RenewalState {
  renewals: Renewal[];
  selectedRenewal: Renewal | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  filters: RenewalFilterParams;
}

// HELPER: Function to convert API response to your slice state format
export function mapApiResponseToState(apiResponse: RenewalApiResponse) {
  return {
    renewals: apiResponse.data || [],
    pagination: {
      page: apiResponse.pagination.currentPage,
      pageSize: apiResponse.pagination.pageSize,
      total: apiResponse.pagination.totalCount,
      totalPages: apiResponse.pagination.totalPages,
    }
  };
}