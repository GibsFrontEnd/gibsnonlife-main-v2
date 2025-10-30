import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import type {
  Clause,
  ClauseOption,
  ClauseState,
  CreateClauseRequest,
  UpdateClauseRequest,
} from "../../../types/clause"

const API_BASE_URL = "https://core-api.newgibsonline.com/api"
const AUTH_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoicGVsbHVtaSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWVpZGVudGlmaWVyIjoiNjM0IiwiZXhwIjoxNzYwNDY1NjY4fQ.NamzSEgd8k8MTH0Az-SJ-MgAiamB_hA5MDypGMxGydg"

// New: Get clauses by policyNo (proposal number)
export const getClausesByPolicyNo = createAsyncThunk(
  "clauses/getClausesByPolicyNo",
  async (policyNo: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ClausesControllers?policyno=${encodeURIComponent(policyNo)}`, {
        method: "GET",
        headers: {
          accept: "text/plain",
          Authorization: `Bearer ${AUTH_TOKEN}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: Clause[] = await response.json()
      return data
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch clauses by policy number")
    }
  },
)

// Get all clauses
export const getAllClauses = createAsyncThunk("clauses/getAllClauses", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ClausesControllers`, {
      method: "GET",
      headers: {
        accept: "text/plain",
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: Clause[] = await response.json()
    return data
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch clauses")
  }
})

// Get clause options by subrisk code
export const getClauseOptionsBySubrisk = createAsyncThunk(
  "clauses/getClauseOptionsBySubrisk",
  async (subriskCode: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ClausesControllers/clauses-options?subriskcode=${subriskCode}`, {
        method: "GET",
        headers: {
          accept: "text/plain",
          Authorization: `Bearer ${AUTH_TOKEN}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ClauseOption[] = await response.json()
      return data
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch clause options")
    }
  },
)

// Get clause option by memo ID
export const getClauseOptionByMemoId = createAsyncThunk(
  "clauses/getClauseOptionByMemoId",
  async (memoId: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ClausesControllers/${memoId}/clauses-options`, {
        method: "GET",
        headers: {
          accept: "text/plain",
          Authorization: `Bearer ${AUTH_TOKEN}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ClauseOption = await response.json()
      return data
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch clause option")
    }
  },
)

// Get clause by ID
export const getClauseById = createAsyncThunk("clauses/getClauseById", async (id: number, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ClausesControllers/${id}`, {
      method: "GET",
      headers: {
        accept: "text/plain",
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: Clause = await response.json()
    return data
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch clause")
  }
})

// Create clauses in bulk
export const createClausesBulk = createAsyncThunk(
  "clauses/createClausesBulk",
  async (clauses: CreateClauseRequest[], { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ClausesControllers/bulk`, {
        method: "POST",
        headers: {
          accept: "text/plain",
          Authorization: `Bearer ${AUTH_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clauses),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create clauses")
    }
  },
)

// Update clause
export const updateClause = createAsyncThunk(
  "clauses/updateClause",
  async ({ id, clauseData }: { id: number; clauseData: UpdateClauseRequest }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ClausesControllers/${id}`, {
        method: "PUT",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${AUTH_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clauseData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return id
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update clause")
    }
  },
)

// Delete clause
export const deleteClause = createAsyncThunk("clauses/deleteClause", async (id: number, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ClausesControllers/${id}`, {
      method: "DELETE",
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return id
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to delete clause")
  }
})

const initialState: ClauseState = {
  clauses: [],
  clauseOptions: [],
  currentClause: null,
  loading: {
    fetchClauses: false,
    fetchClauseOptions: false,
    createClauses: false,
    updateClause: false,
    deleteClause: false,
  },
  success: {
    createClauses: false,
    updateClause: false,
    deleteClause: false,
  },
  error: {
    fetchClauses: null,
    fetchClauseOptions: null,
    createClauses: null,
    updateClause: null,
    deleteClause: null,
  },
}

const clauseSlice = createSlice({
  name: "clauses",
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.success = {
        createClauses: false,
        updateClause: false,
        deleteClause: false,
      }
      state.error = {
        fetchClauses: null,
        fetchClauseOptions: null,
        createClauses: null,
        updateClause: null,
        deleteClause: null,
      }
    },
    clearClauseOptions: (state) => {
      state.clauseOptions = []
    },
  },
  extraReducers: (builder) => {
    // Get all clauses
    builder
      .addCase(getAllClauses.pending, (state) => {
        state.loading.fetchClauses = true
        state.error.fetchClauses = null
      })
      .addCase(getAllClauses.fulfilled, (state, action) => {
        state.loading.fetchClauses = false
        state.clauses = action.payload
      })
      .addCase(getAllClauses.rejected, (state, action) => {
        state.loading.fetchClauses = false
        state.error.fetchClauses = action.payload as string
      })

    // Get clauses by policyNo (new)
    builder
      .addCase(getClausesByPolicyNo.pending, (state) => {
        state.loading.fetchClauses = true
        state.error.fetchClauses = null
      })
      .addCase(getClausesByPolicyNo.fulfilled, (state, action) => {
        state.loading.fetchClauses = false
        // replace clauses with the API response for that policy number
        state.clauses = action.payload
      })
      .addCase(getClausesByPolicyNo.rejected, (state, action) => {
        state.loading.fetchClauses = false
        state.error.fetchClauses = action.payload as string
      })

    // Get clause options by subrisk
    builder
      .addCase(getClauseOptionsBySubrisk.pending, (state) => {
        state.loading.fetchClauseOptions = true
        state.error.fetchClauseOptions = null
      })
      .addCase(getClauseOptionsBySubrisk.fulfilled, (state, action) => {
        state.loading.fetchClauseOptions = false
        state.clauseOptions = action.payload
      })
      .addCase(getClauseOptionsBySubrisk.rejected, (state, action) => {
        state.loading.fetchClauseOptions = false
        state.error.fetchClauseOptions = action.payload as string
      })

    // Get clause by ID
    builder
      .addCase(getClauseById.pending, (state) => {
        state.loading.fetchClauses = true
        state.error.fetchClauses = null
      })
      .addCase(getClauseById.fulfilled, (state, action) => {
        state.loading.fetchClauses = false
        state.currentClause = action.payload
      })
      .addCase(getClauseById.rejected, (state, action) => {
        state.loading.fetchClauses = false
        state.error.fetchClauses = action.payload as string
      })

    // Create clauses bulk
    builder
      .addCase(createClausesBulk.pending, (state) => {
        state.loading.createClauses = true
        state.error.createClauses = null
        state.success.createClauses = false
      })
      .addCase(createClausesBulk.fulfilled, (state) => {
        state.loading.createClauses = false
        state.success.createClauses = true
      })
      .addCase(createClausesBulk.rejected, (state, action) => {
        state.loading.createClauses = false
        state.error.createClauses = action.payload as string
      })

    // Update clause
    builder
      .addCase(updateClause.pending, (state) => {
        state.loading.updateClause = true
        state.error.updateClause = null
        state.success.updateClause = false
      })
      .addCase(updateClause.fulfilled, (state) => {
        state.loading.updateClause = false
        state.success.updateClause = true
      })
      .addCase(updateClause.rejected, (state, action) => {
        state.loading.updateClause = false
        state.error.updateClause = action.payload as string
      })

    // Delete clause
    builder
      .addCase(deleteClause.pending, (state) => {
        state.loading.deleteClause = true
        state.error.deleteClause = null
        state.success.deleteClause = false
      })
      .addCase(deleteClause.fulfilled, (state, action) => {
        state.loading.deleteClause = false
        state.success.deleteClause = true
        state.clauses = state.clauses.filter((clause) => clause.id !== action.payload)
      })
      .addCase(deleteClause.rejected, (state, action) => {
        state.loading.deleteClause = false
        state.error.deleteClause = action.payload as string
      })
  },
})

export const { clearMessages, clearClauseOptions } = clauseSlice.actions
export default clauseSlice.reducer
