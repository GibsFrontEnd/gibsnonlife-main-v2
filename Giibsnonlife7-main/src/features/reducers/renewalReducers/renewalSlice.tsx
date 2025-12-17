//@ts-nocheck
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
  filters: {},
  // New states for document generation and email sending
  documentLoading: false,
  documentError: null,
  emailLoading: false,
  emailError: null
};

// Helper function to extract filename from response headers
const extractFilenameFromHeaders = (headers: any) => {
  const contentDisposition = headers['content-disposition'] || headers['Content-Disposition'];
  if (contentDisposition) {
    // Try to match filename in quotes first, then without quotes
    const matches = contentDisposition.match(/filename\*?=["']?([^"']+)["']?/i);
    if (matches && matches[1]) {
      // Decode URI encoded filename
      const filename = matches[1];
      if (filename.startsWith("UTF-8''")) {
        return decodeURIComponent(filename.substring(7));
      }
      return filename;
    }
    
    // Alternative pattern
    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (filenameMatch && filenameMatch[1]) {
      let filename = filenameMatch[1].replace(/['"]/g, '');
      // Decode if URI encoded
      if (filename.includes('%')) {
        filename = decodeURIComponent(filename);
      }
      return filename;
    }
  }
  
  // Try to get filename from response URL
  const urlMatch = headers['x-filename'] || headers['X-Filename'];
  if (urlMatch) return urlMatch;
  
  return null;
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
// =========================
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

      // Changed ID to id (lowercase)
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
// GENERATE RENEWAL DOCUMENT
// =========================
export const generateRenewalDocument = createAsyncThunk(
  'renewals/generateDocument',
  async (renewalId: number, { rejectWithValue }) => {
    try {
      console.log(`Generating document for renewal ID: ${renewalId}`);
      
      /**
       * Makes a POST request to generate a Word document for a specific renewal.
       * The API returns a file download (application/vnd.openxmlformats-officedocument.wordprocessingml.document)
       * 
       * @param {number} renewalId - The ID of the renewal to generate document for
       * @returns {Promise<Object>} - Returns the file blob and filename
       */
      
      // Set responseType to 'blob' to handle file download
      const response = await apiCall.post(
        `/Renewal/generate-document/${renewalId}`,
        {}, // Empty body as per API spec
        {
          responseType: 'blob' // Important for file downloads
        }
      );
      
      console.log("Document generation successful, blob size:", response.data.size);
      
      // Extract filename from headers
      const filename = extractFilenameFromHeaders(response.headers) || `Renewal_Notice_${renewalId}.docx`;
      
      return {
        blob: response.data,
        filename: filename,
        renewalId: renewalId
      };
      
    } catch (error: any) {
      console.error(`Document generation failed for renewal ID ${renewalId}:`, error);
      return rejectWithValue(error.response?.data || error.message || 'Failed to generate document');
    }
  }
);

// =========================
// SEND RENEWAL EMAIL
// =========================
export const sendRenewalEmail = createAsyncThunk(
  'renewals/sendEmail',
  async (renewalId: number, { rejectWithValue }) => {
    try {
      console.log(`Sending email for renewal ID: ${renewalId}`);
      
      /**
       * Makes a POST request to send a renewal notice email for a specific renewal.
       * The API triggers email sending with the renewal details.
       * 
       * @param {number} renewalId - The ID of the renewal to send email for
       * @returns {Promise<Object>} - Returns success response from API
       */
      
      const response = await apiCall.post(
        `/Renewal/send-email/${renewalId}`,
        {} // Empty body as per API spec
      );
      
      console.log("Email sent successfully:", response.data);
      return {
        ...response.data,
        renewalId
      };
      
    } catch (error: any) {
      console.error(`Email sending failed for renewal ID ${renewalId}:`, error);
      return rejectWithValue(error.response?.data || error.message || 'Failed to send email');
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
      console.log('🔍 Filtering with params:', filters);
      
      // Clean filters - remove any undefined/null values
      const cleanFilters: any = {};
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          cleanFilters[key] = filters[key];
        }
      });
      
      const response = await apiCall.get('/Renewal/filter', {
        params: cleanFilters
      });
      
      console.log('✅ Filter response:', response.data);
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
    },
    // New reducers for document and email operations
    clearDocumentError: (state) => {
      state.documentError = null;
    },
    clearEmailError: (state) => {
      state.emailError = null;
    },
    resetDocumentState: (state) => {
      state.documentLoading = false;
      state.documentError = null;
    },
    resetEmailState: (state) => {
      state.emailLoading = false;
      state.emailError = null;
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
    // GENERATE RENEWAL DOCUMENT
    // =============================
    builder
      .addCase(generateRenewalDocument.pending, (state) => {
        state.documentLoading = true;
        state.documentError = null;
      })
      .addCase(generateRenewalDocument.fulfilled, (state, action) => {
        state.documentLoading = false;
        state.documentError = null;
        
        /**
         * The action.payload contains:
         * - blob: The file data (Word document)
         * - filename: The suggested filename for download
         * - renewalId: The ID of the renewal
         * 
         * Note: Since this is a file download, we don't update the state data.
         * The file should be handled by the component that dispatched the action.
         */
        
        console.log(`Document generated successfully for renewal ID: ${action.payload.renewalId}`);
        
        // Optional: Update the renewal record to indicate document was generated
        const index = state.data.findIndex(
          (r) => r.renewalID === action.payload.renewalId.toString()
        );
        
        if (index !== -1) {
          state.data[index] = {
            ...state.data[index],
            lastDocumentGenerated: new Date().toISOString()
          };
        }
      })
      .addCase(generateRenewalDocument.rejected, (state, action) => {
        state.documentLoading = false;
        state.documentError = action.payload as string;
        console.error('Document generation failed:', action.payload);
      });

    // =============================
    // SEND RENEWAL EMAIL
    // =============================
    builder
      .addCase(sendRenewalEmail.pending, (state) => {
        state.emailLoading = true;
        state.emailError = null;
      })
      .addCase(sendRenewalEmail.fulfilled, (state, action) => {
        state.emailLoading = false;
        state.emailError = null;
        
        /**
         * Email sent successfully.
         * Update the renewal record in our state
         * to reflect that an email was sent
         */
        
        const { renewalId, ...emailResponse } = action.payload;
        
        // Update the renewal record in the list if it exists
        const index = state.data.findIndex(
          (r) => r.renewalID === renewalId.toString()
        );
        
        if (index !== -1) {
          // Add email sent timestamp to the renewal record
          state.data[index] = {
            ...state.data[index],
            lastEmailSent: new Date().toISOString(),
            emailStatus: 'sent'
          };
        }
        
        // Update selected renewal if it matches
        if (state.selectedRenewal && state.selectedRenewal.renewalID === renewalId.toString()) {
          state.selectedRenewal = {
            ...state.selectedRenewal,
            lastEmailSent: new Date().toISOString(),
            emailStatus: 'sent'
          };
        }
        
        console.log(`Email sent successfully for renewal ID: ${renewalId}`, emailResponse);
      })
      .addCase(sendRenewalEmail.rejected, (state, action) => {
        state.emailLoading = false;
        state.emailError = action.payload as string;
        console.error('Email sending failed:', action.payload);
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
        state.error = null;

        const payload = action.payload;
        if (!payload) return;

        if (Array.isArray(payload)) {

          state.data = payload;

          //calculate pagination for filtered results
          state.pagination = {
            currentPage: 1,
            pageSize: state.pagination?.pageSize || 10,
            totalCount: payload.length,
            totalPages: Math.ceil(payload.length / (state.pagination?.pageSize || 10)),
            hasNextPage: false,
            hasPreviousPage: false
          };
         console.log('Filter results - Array received:', {
          count: payload.length,
          firstItem: payload[0]
         });
        }   else if (payload.data && Array.isArray(payload.data)) {
      // Backward compatibility: if it has data property
      state.data = payload.data;
      
      if (payload.pagination) {
        state.pagination = { ...payload.pagination };
      } else {
        // Calculate pagination
        state.pagination = {
          currentPage: 1,
          pageSize: state.pagination?.pageSize || 10,
          totalCount: payload.data.length,
          totalPages: Math.ceil(payload.data.length / (state.pagination?.pageSize || 10)),
          hasNextPage: false,
          hasPreviousPage: false
        };
      }
    } else {
      // Fallback: treat as empty array
      state.data = [];
      state.pagination = {
        ...state.pagination,
        totalCount: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false
      };
    }
  })
         .addCase(filterRenewals.rejected, (state, action) => {
    state.loading = false;
    state.error = action.payload as string;
    
    // Clear data on error
    state.data = [];
    state.pagination = {
      ...state.pagination,
      totalCount: 0,
      totalPages: 1
    };
    
    console.error('❌ Filter error:', action.payload);
  });
  }
});

export const {
  setCurrentPage,
  setPageSize,
  clearRenewals,
  setSelectedRenewal,
  setFilters,
  clearFilters,
  clearDocumentError,
  clearEmailError,
  resetDocumentState,
  resetEmailState
} = renewalSlice.actions;

export default renewalSlice.reducer;