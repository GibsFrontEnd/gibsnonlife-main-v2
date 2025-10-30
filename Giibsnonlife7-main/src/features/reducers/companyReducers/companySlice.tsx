// features/reducers/companyReducers/companySlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store";
import { decryptData } from "../../../utils/encrypt-utils";

const encryptedToken = localStorage.getItem("token");
const API_BASE_URL = "https://core-api.newgibsonline.com/api";
const AUTH_TOKEN = decryptData(encryptedToken);

// Types
export interface Company {
  companyID: string;
  companyName: string;
  companyType: string;
  address: string | null;
  mobilePhone: string | null;
  landPhone: string | null;
  email: string | null;
  fax: string | null;
  remarks: string | null;
  active: boolean;
  submittedBy?: string | null;
  submittedOn?: string | null;
  modifiedBy?: string | null;
  modifiedOn?: string | null;
}

export interface CompanyListResponse {
  items: Company[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiStatusResponse {
  errorCode: number;
  errorMessage: string;
  extraMessage?: string | null;
  totalSuccess?: number | null;
}

export interface CreateCompanyRequest {
  companyName: string;
  companyType: string;
  address?: string | null;
  mobilePhone?: string | null;
  landPhone?: string | null;
  email?: string | null;
  fax?: string | null;
  remarks?: string | null;
  submittedBy?: string | null;
}

export interface UpdateCompanyRequest {
  companyName?: string;
  companyType?: string;
  address?: string | null;
  mobilePhone?: string | null;
  landPhone?: string | null;
  email?: string | null;
  fax?: string | null;
  remarks?: string | null;
  modifiedBy?: string | null;
}

export interface CompanyState {
  companies: Company[];
  pagination: {
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  } | null;
  loading: {
    getAllCompanies: boolean;
    getCompanyById: boolean;
    createCompany: boolean;
    updateCompany: boolean;
    deleteCompany: boolean;
  };
  success: {
    createCompany: boolean;
    updateCompany: boolean;
    deleteCompany: boolean;
  };
  error: {
    getAllCompanies: string | null;
    getCompanyById: string | null;
    createCompany: string | null;
    updateCompany: string | null;
    deleteCompany: string | null;
  };
  currentCompany?: Company | null;
}

const initialState: CompanyState = {
  companies: [],
  pagination: null,
  loading: {
    getAllCompanies: false,
    getCompanyById: false,
    createCompany: false,
    updateCompany: false,
    deleteCompany: false,
  },
  success: {
    createCompany: false,
    updateCompany: false,
    deleteCompany: false,
  },
  error: {
    getAllCompanies: null,
    getCompanyById: null,
    createCompany: null,
    updateCompany: null,
    deleteCompany: null,
  },
  currentCompany: null,
};

// Thunks

// 1. Get all companies (list)
export const getAllCompanies = createAsyncThunk<
  CompanyListResponse,
  { page?: number; pageSize?: number; sortBy?: string; sortDirection?: "ASC" | "DESC" } | undefined,
  { rejectValue: string }
>(
  "companies/getAllCompanies",
  async (
    { page = 1, pageSize = 50, sortBy = "Company", sortDirection = "ASC" } = {},
    { rejectWithValue }
  ) => {
    try {
      const url = `${API_BASE_URL}/Company/companies?page=${page}&pageSize=${pageSize}&sortBy=${encodeURIComponent(
        sortBy
      )}&sortDirection=${encodeURIComponent(sortDirection)}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "text/plain",
          Authorization: `Bearer ${AUTH_TOKEN}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CompanyListResponse = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch companies");
    }
  }
);

// 2. Get company by ID
export const getCompanyById = createAsyncThunk<
  Company,
  string,
  { rejectValue: string }
>("companies/getCompanyById", async (companyId, { rejectWithValue }) => {
  try {
    const url = `${API_BASE_URL}/Company/companies/${encodeURIComponent(companyId)}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "text/plain",
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: Company = await response.json();
    return data;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch company");
  }
});

// 3. Create company
export const createCompany = createAsyncThunk<
  ApiStatusResponse,
  CreateCompanyRequest,
  { rejectValue: string }
>("companies/createCompany", async (payload, { rejectWithValue }) => {
  try {
    const url = `${API_BASE_URL}/Company/companies`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        accept: "text/plain",
        Authorization: `Bearer ${AUTH_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiStatusResponse = await response.json();
    return data;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to create company");
  }
});

// 4. Update company
export const updateCompany = createAsyncThunk<
  ApiStatusResponse,
  { companyId: string; update: UpdateCompanyRequest },
  { rejectValue: string }
>("companies/updateCompany", async ({ companyId, update }, { rejectWithValue }) => {
  try {
    const url = `${API_BASE_URL}/Company/companies/${encodeURIComponent(companyId)}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        accept: "text/plain",
        Authorization: `Bearer ${AUTH_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(update),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiStatusResponse = await response.json();
    return data;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to update company");
  }
});

// 5. Delete company
export const deleteCompany = createAsyncThunk<
  ApiStatusResponse,
  string,
  { rejectValue: string }
>("companies/deleteCompany", async (companyId, { rejectWithValue }) => {
  try {
    const url = `${API_BASE_URL}/Company/companies/${encodeURIComponent(companyId)}`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        accept: "text/plain",
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiStatusResponse = await response.json();
    return data;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to delete company");
  }
});

// Slice
const companySlice = createSlice({
  name: "companies",
  initialState,
  reducers: {
    clearCompanyMessages: (state) => {
      state.success = {
        createCompany: false,
        updateCompany: false,
        deleteCompany: false,
      };
      state.error = {
        getAllCompanies: null,
        getCompanyById: null,
        createCompany: null,
        updateCompany: null,
        deleteCompany: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // getAllCompanies
      .addCase(getAllCompanies.pending, (state) => {
        state.loading.getAllCompanies = true;
        state.error.getAllCompanies = null;
      })
      .addCase(getAllCompanies.fulfilled, (state, action: PayloadAction<CompanyListResponse>) => {
        state.loading.getAllCompanies = false;
        state.companies = action.payload.items || [];
        state.pagination = {
          totalCount: action.payload.totalCount,
          page: action.payload.page,
          pageSize: action.payload.pageSize,
          totalPages: action.payload.totalPages,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        };
      })
      .addCase(getAllCompanies.rejected, (state, action) => {
        state.loading.getAllCompanies = false;
        state.error.getAllCompanies = (action.payload as string) || "Failed to fetch companies";
      })

      // getCompanyById
      .addCase(getCompanyById.pending, (state) => {
        state.loading.getCompanyById = true;
        state.error.getCompanyById = null;
      })
      .addCase(getCompanyById.fulfilled, (state, action: PayloadAction<Company>) => {
        state.loading.getCompanyById = false;
        state.currentCompany = action.payload;
        // update list item if exists
        const idx = state.companies.findIndex((c) => c.companyID === action.payload.companyID);
        if (idx !== -1) state.companies[idx] = action.payload;
      })
      .addCase(getCompanyById.rejected, (state, action) => {
        state.loading.getCompanyById = false;
        state.error.getCompanyById = (action.payload as string) || "Failed to fetch company";
      })

      // createCompany
      .addCase(createCompany.pending, (state) => {
        state.loading.createCompany = true;
        state.error.createCompany = null;
        state.success.createCompany = false;
      })
      .addCase(createCompany.fulfilled, (state, action: PayloadAction<ApiStatusResponse>) => {
        state.loading.createCompany = false;
        state.success.createCompany = action.payload.errorCode === 0;
        // server returns wrapper, not full created company — UI should refresh list on success
      })
      .addCase(createCompany.rejected, (state, action) => {
        state.loading.createCompany = false;
        state.error.createCompany = (action.payload as string) || "Failed to create company";
      })

      // updateCompany
      .addCase(updateCompany.pending, (state) => {
        state.loading.updateCompany = true;
        state.error.updateCompany = null;
        state.success.updateCompany = false;
      })
      .addCase(updateCompany.fulfilled, (state, action: PayloadAction<ApiStatusResponse>) => {
        state.loading.updateCompany = false;
        state.success.updateCompany = action.payload.errorCode === 0;
        // server returns status message; caller should re-fetch the company/list if needed
      })
      .addCase(updateCompany.rejected, (state, action) => {
        state.loading.updateCompany = false;
        state.error.updateCompany = (action.payload as string) || "Failed to update company";
      })

      // deleteCompany
      .addCase(deleteCompany.pending, (state) => {
        state.loading.deleteCompany = true;
        state.error.deleteCompany = null;
        state.success.deleteCompany = false;
      })
      .addCase(deleteCompany.fulfilled, (state, action: PayloadAction<ApiStatusResponse>) => {
        state.loading.deleteCompany = false;
        state.success.deleteCompany = action.payload.errorCode === 0;
        // if successful, optionally remove from list (only do if you want optimistic removal)
        // remove by id is not provided in response; UI can call getAllCompanies after success
      })
      .addCase(deleteCompany.rejected, (state, action) => {
        state.loading.deleteCompany = false;
        state.error.deleteCompany = (action.payload as string) || "Failed to delete company";
      });
  },
});

export const { clearCompanyMessages } = companySlice.actions;

export const selectCompanies = (state: RootState) => state.companies;
export const selectCompanyCurrent = (state: RootState) => state.companies.currentCompany;

export default companySlice.reducer;
