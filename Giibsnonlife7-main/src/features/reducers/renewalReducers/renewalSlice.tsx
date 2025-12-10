import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiCall from '../../../utils/api-call';
import axios from 'axios';

// Initial state
const initialState = {
  data: [],
  pagination: {
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false
  },
  loading: false,
  error: null,
  selectedRenewal: null,
  filters: {}
};

// =========================
// FETCH RENEWALS
// =========================
export const fetchRenewals = createAsyncThunk(
  'renewals/fetchRenewals',
  async ({ page = 1, pageSize = 10, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await apiCall.get('/Renewal', {
        params: { page, pageSize, ...filters }
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// =========================
// UPDATE RENEWAL
// In renewalSlice.ts
export const updateRenewal = createAsyncThunk(
  'renewal/updateRenewal',
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      console.log("Updating renewal with ID:", id);

      // Ensure the body contains correct renewalID
      const requestData = {
        ...data,
        renewalID: id,
      };

      console.log("Final request body:", requestData);

      // FIX: Changed ID to id (lowercase)
      const response = await apiCall.put(`/Renewal/${id}`, requestData);   // ✅ FIXED
    

      console.log("Update successful:", response.data);
      return response.data;

    } catch (error: any) {
      console.error("Update failed:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);




// =========================
// FILTER RENEWALS
// =========================
export const filterRenewals = createAsyncThunk(
  'renewals/filterRenewals',
  async (filters: any, { rejectWithValue }) => {
    try {
      const response = await apiCall.get('/Renewal', {
        params: { page: 1, pageSize: 10, ...filters }
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// =========================
// SLICE
// =========================
const renewalSlice = createSlice({
  name: 'renewals',
  initialState,
  reducers: {
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    setPageSize: (state, action) => {
      state.pagination.pageSize = action.payload;
      state.pagination.totalPages = Math.ceil(
        state.pagination.totalCount / action.payload
      );
    },
    clearRenewals: (state) => {
      state.data = [];
      state.pagination = initialState.pagination;
      state.error = null;
      state.filters = {};
    },
    setSelectedRenewal: (state, action) => {
      state.selectedRenewal = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    }
  },

  extraReducers: (builder) => {
    // =============================
    // FETCH RENEWALS
    // =============================
    builder
      .addCase(fetchRenewals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRenewals.fulfilled, (state, action) => {
        state.loading = false;

        const payload = action.payload;
        if (!payload) return;

        state.data = payload.data || [];
        if (payload.pagination) {
          state.pagination = { ...payload.pagination };
        }
      })
      .addCase(fetchRenewals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // =============================
    // UPDATE RENEWAL
    // =============================
    builder
      .addCase(updateRenewal.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateRenewal.fulfilled, (state, action) => {
        state.loading = false;

        // Update inside list
        const index = state.data.findIndex(
          (r) => r.renewalID === action.payload.renewalID
        );

        if (index !== -1) {
          state.data[index] = action.payload;
        }

        // Update selected renewal if it is open
        state.selectedRenewal = action.payload;
      })
      .addCase(updateRenewal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // =============================
    // FILTER RENEWALS
    // =============================
    builder
      .addCase(filterRenewals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(filterRenewals.fulfilled, (state, action) => {
        state.loading = false;

        const payload = action.payload;
        if (!payload) return;

        state.data = payload.data || [];

        if (payload.pagination) {
          state.pagination = { ...payload.pagination };
        }
      })
      .addCase(filterRenewals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const {
  setCurrentPage,
  setPageSize,
  clearRenewals,
  setSelectedRenewal,
  setFilters,
  clearFilters
} = renewalSlice.actions;

export default renewalSlice.reducer;
