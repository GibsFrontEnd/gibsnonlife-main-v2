//@ts-nocheck
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { useEffect } from "react";
import type {
  QuotationState,
  Proposal,
  CreateProposalRequest,
  UpdateProposalRequest,
  CompleteCalculationRequest,
  sectionAdjustments,
  CompleteCalculationResponse,
  CalculationBreakdown,
  ProposalPaginationResponse,
  QuoteSection,
  CalculatedAggregate,
  AdjustmentCalculations,
  aggregateTotals,
  CalculateRiskItemsResponse,
  RiskItem,
  CalculatedRiskItem,
} from "../../../types/quotation"
import { decryptData } from "../../../utils/encrypt-utils"
import apiCall from "@/utils/api-call";

const API_BASE_URL = "https://core-api.newgibsonline.com/api"
const getAuthToken = () => {
  try {
    const encryptedToken = localStorage.getItem("token");
    if (!encryptedToken) return null;
    return decryptData(encryptedToken);
  } catch (err) {
    console.warn("Failed to get token", err);
    return null;
  }
};

// Helper for fetch errors
const handleFetchError = async (res: Response) => {
  const text = await res.text().catch(() => "")
  throw new Error(text || `HTTP error! status: ${res.status}`)
}

/* ---------------------- Thunks ---------------------- */

// fetchProposals
export const fetchProposals = createAsyncThunk<
  ProposalPaginationResponse,
  {
    page?: number
    pageSize?: number
    sortBy?: string
    sortDirection?: string
    riskClass?: string
  },
  { rejectValue: string }
>("quotations/fetchProposals", async (args, { rejectWithValue }) => {
  try {
    const AUTH_TOKEN = getAuthToken();

    const { page = 1, pageSize = 50, sortBy = "TransDate", sortDirection = "DESC", riskClass = "" } = args
    let url = `${API_BASE_URL}/Quotation?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&sortDirection=${sortDirection}`
    if (riskClass) url += `&riskClass=${riskClass}`

    const response = await fetch(url, {
      method: "GET",
      headers: { accept: "text/plain", Authorization: `Bearer ${AUTH_TOKEN}` },
    })

    if (!response.ok) await handleFetchError(response)
    const data = await response.json()
    return data as ProposalPaginationResponse
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch proposals")
  }
})

// getProposalByNumber
export const getProposalByNumber = createAsyncThunk<Proposal, string, { rejectValue: string }>(
  "quotations/getProposalByNumber",
  async (proposalNo, { rejectWithValue }) => {
    try {
      const AUTH_TOKEN = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/Quotation/${proposalNo}?proposalNo=${proposalNo}`, {
        method: "GET",
        headers: { accept: "text/plain", Authorization: `Bearer ${AUTH_TOKEN}` },
      })
      if (!response.ok) await handleFetchError(response)
      const data = await response.json()
      return data as Proposal
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch proposal")
    }
  },
)

// export const fetchProposalReport = createAsyncThunk<ProposalReport, string, { rejectValue: string }>(
//   "quotations/fetchProposalReport",
//   async (proposalNo, { rejectWithValue }) => {
//     try {
//       const AUTH_TOKEN = getAuthToken();

//       const response = await fetch(`${API_BASE_URL} /QuotationReport/detailed/${proposalNo}`, {
//         method: "GET",
//         headers: { accept: "text/plain", Authorization: `Bearer ${AUTH_TOKEN}` },
//       })
//       if (!response.ok) await handleFetchError(response)
//       const data = await response.json()
//       return data as ProposalReport
//     } catch (error) {
//       return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch proposal")
//     }
//   },
// )

export const fetchProposalReport = createAsyncThunk(
  "quotations/fetchProposalReport",
  async (proposalNo: string, { rejectWithValue }) => {
    try {
      console.log(proposalNo)
      const response = await apiCall.get(`/QuotationReport/detailed/${proposalNo}?proposalNo=${proposalNo}`)
      console.log(response.data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to fetch proposal report")
    }
  })

// createProposal
export const createProposal = createAsyncThunk<Proposal, CreateProposalRequest, { rejectValue: string }>(
  "quotations/createProposal",
  async (proposalData, { rejectWithValue }) => {
    try {
      const AUTH_TOKEN = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/Quotation`, {
        method: "POST",
        headers: { accept: "text/plain", Authorization: `Bearer ${AUTH_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify(proposalData),
      })
      if (!response.ok) await handleFetchError(response)
      const data = await response.json()
      return data as Proposal
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to create proposal")
    }
  },
)

// updateProposal
export const updateProposal = createAsyncThunk<
  Proposal,
  { proposalNo: string; proposalData: UpdateProposalRequest },
  { rejectValue: string }
>("quotations/updateProposal", async ({ proposalNo, proposalData }, { rejectWithValue }) => {
  try {
    const AUTH_TOKEN = getAuthToken();

    const response = await fetch(`${API_BASE_URL}/Quotation/${proposalNo}?proposalNo=${proposalNo}`, {
      method: "PUT",
      headers: { accept: "text/plain", Authorization: `Bearer ${AUTH_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(proposalData),
    })
    if (!response.ok) await handleFetchError(response)
    const data = await response.json()
    return data as Proposal
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to update proposal")
  }
})

// deleteProposal
export const deleteProposal = createAsyncThunk<string, string, { rejectValue: string }>(
  "quotations/deleteProposal",
  async (proposalNo, { rejectWithValue }) => {
    try {
      const AUTH_TOKEN = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/Quotation/${proposalNo}?proposalNo=${proposalNo}`, {
        method: "DELETE",
        headers: { accept: "text/plain", Authorization: `Bearer ${AUTH_TOKEN}` },
      })
      if (!response.ok) await handleFetchError(response)
      return proposalNo
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to delete proposal")
    }
  },
)

// calculateComplete (POST)
export const calculateComplete = createAsyncThunk<
  CompleteCalculationResponse,
  { proposalNo: string; calculationData: CompleteCalculationRequest },
  { rejectValue: string }
>("quotations/calculateComplete", async ({ proposalNo, calculationData }, { rejectWithValue }) => {
  try {
    const AUTH_TOKEN = getAuthToken();

    const response = await fetch(`${API_BASE_URL}/Quotation/${proposalNo}/calculate/fire/complete`, {
      method: "POST",
      headers: { accept: "text/plain", Authorization: `Bearer ${AUTH_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(calculationData),
    })
    if (!response.ok) await handleFetchError(response)
    const data = await response.json()
    return data as CompleteCalculationResponse
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to calculate quotation")
  }
})

// recalculateComplete (PUT)
export const recalculateComplete = createAsyncThunk<
  CompleteCalculationResponse,
  { proposalNo: string; calculationData: CompleteCalculationRequest },
  { rejectValue: string }
>("quotations/recalculateComplete", async ({ proposalNo, calculationData }, { rejectWithValue }) => {
  try {
    const AUTH_TOKEN = getAuthToken();

    const response = await fetch(`${API_BASE_URL}/Quotation/${proposalNo}/calculate/fire/complete`, {
      method: "PUT",
      headers: { accept: "text/plain", Authorization: `Bearer ${AUTH_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(calculationData),
    })
    if (!response.ok) await handleFetchError(response)
    const data = await response.json()
    return data as CompleteCalculationResponse
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to recalculate quotation")
  }
})

// getCalculationBreakdown
export const getCalculationBreakdown = createAsyncThunk<CalculationBreakdown, string, { rejectValue: string }>(
  "quotations/getCalculationBreakdown",
  async (proposalNo, { rejectWithValue }) => {
    try {
      const AUTH_TOKEN = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/Quotation/${proposalNo}/calculation/fire/breakdown`, {
        method: "GET",
        headers: { accept: "text/plain", Authorization: `Bearer ${AUTH_TOKEN}` },
      })
      if (!response.ok) await handleFetchError(response)
      const data = await response.json()
      return data as CalculationBreakdown
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch calculation breakdown")
    }
  },
)

// getCurrentCalculation
export const getCurrentCalculation = createAsyncThunk<any, string, { rejectValue: string }>(
  "quotations/getCurrentCalculation",
  async (proposalNo, { rejectWithValue }) => {
    try {
      const AUTH_TOKEN = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/Quotation/${proposalNo}/calculation/current`, {
        method: "GET",
        headers: { accept: "text/plain", Authorization: `Bearer ${AUTH_TOKEN}` },
      })
      if (!response.ok) await handleFetchError(response)
      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch current calculation")
    }
  },
)

// getSectionsSummary
export const getSectionsSummary = createAsyncThunk<any, string, { rejectValue: string }>(
  "quotations/getSectionsSummary",
  async (proposalNo, { rejectWithValue }) => {
    try {
      const AUTH_TOKEN = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/Quotation/${proposalNo}/calculation/sections/summary`, {
        method: "GET",
        headers: { accept: "text/plain", Authorization: `Bearer ${AUTH_TOKEN}` },
      })
      if (!response.ok) await handleFetchError(response)
      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch sections summary")
    }
  },
)

/* -------------------- calculateRiskItems -------------------- */
export const calculateRiskItems = createAsyncThunk<
  CalculateRiskItemsResponse,
  { subRisk: string; riskItems: (RiskItem | Partial<RiskItem>)[]; proportionRate?: number },
  { rejectValue: string }
>("quotations/calculateRiskItems", async (payload, { rejectWithValue }) => {
  try {
    const AUTH_TOKEN = getAuthToken();

    const response = await fetch(`${API_BASE_URL}/Quotation/calculate/risk-items`, {
      method: "POST",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${AUTH_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) await handleFetchError(response)
    const data = await response.json()
    console.log(payload);

    return data as CalculateRiskItemsResponse
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to calculate risk items")
  }
})

/* -------------------- NEW calculation helper endpoints -------------------- */

/**
 * Step 2 - section aggregate (aggregates calculated items for a single section)
 * Request body: { calculatedItems: CalculatedRiskItem[] }
 */
export const calculateSectionAggregate = createAsyncThunk<CalculatedAggregate, { calculatedItems: CalculatedRiskItem[] }, { rejectValue: string }>(
  "quotations/calculateSectionAggregate",
  async (payload, { rejectWithValue }) => {
    try {
      const AUTH_TOKEN = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/Quotation/calculate/section-aggregate`, {
        method: "POST",
        headers: { accept: "text/json", Authorization: `Bearer ${AUTH_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!response.ok) await handleFetchError(response)
      const data: CalculatedAggregate = await response.json()
      return data
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to calculate section aggregate")
    }
  },
)

export const calculateSectionAdjustment = createAsyncThunk<AdjustmentCalculations, sectionAdjustments, { rejectValue: string }>(
  "quotations/calculateSectionAdjustment",
  async (payload, { rejectWithValue }) => {
    try {
      const AUTH_TOKEN = getAuthToken();
      console.log(payload);

      const response = await fetch(`${API_BASE_URL}/Quotation/calculate/section-adjustments`, {
        method: "POST",
        headers: { accept: "text/json", Authorization: `Bearer ${AUTH_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!response.ok) await handleFetchError(response)
      const data: AdjustmentCalculations = await response.json()
      return data
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to calculate section aggregate")
    }
  },
)


/**
 * Step 3 - multi-section aggregate
 * Request body: { sections: { sectionID, sectionName, calculatedItems }[] }
 */
export const calculateMultiSectionAggregate = createAsyncThunk<aggregateTotals, { adjustedSections: any[] }, { rejectValue: string }>(
  "quotations/calculateMultiSectionAggregate",
  async (payload, { rejectWithValue }) => {
    try {
      const AUTH_TOKEN = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/Quotation/calculate/aggregate-adjusted-sections`, {
        method: "POST",
        headers: { accept: "text/json", Authorization: `Bearer ${AUTH_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!response.ok) await handleFetchError(response)
      const data = await response.json()

      return data
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to calculate multi-section aggregate")
    }
  },
)

/**
 * Step 4 - apply proposal-level adjustments to total aggregate premium
 * Request body: { totalAggregatePremium, specialDiscountRate, deductibleDiscountRate, ... }
 */
export const applyProposalAdjustments = createAsyncThunk<any, any, { rejectValue: string }>(
  "quotations/applyProposalAdjustments",
  async (payload, { rejectWithValue }) => {
    try {
      const AUTH_TOKEN = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/Quotation/calculate/proposal-adjustments`, {
        method: "POST",
        headers: { accept: "text/json", Authorization: `Bearer ${AUTH_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!response.ok) await handleFetchError(response)
      const data = await response.json()
      return data
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to apply proposal adjustments")
    }
  },
)

/**
 * Step 5 - pro-rata calculation
 * Request body: { netPremiumDue, coverDays }
 */
export const calculateProRata = createAsyncThunk<any, { netPremiumDue: number; coverDays: number }, { rejectValue: string }>(
  "quotations/calculateProRata",
  async (payload, { rejectWithValue }) => {
    try {
      const AUTH_TOKEN = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/Quotation/calculate/pro-rata`, {
        method: "POST",
        headers: { accept: "text/plain", Authorization: `Bearer ${AUTH_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!response.ok) await handleFetchError(response)
      const data = await response.json()
      return data
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to calculate pro-rata")
    }
  },
)

/**
 * Section preview - calculates a single section preview (used by UI when adding/updating a section)
 * Request body: { section, proportionRate }
 */
export const previewSection = createAsyncThunk<any, { section: any; proportionRate?: number }, { rejectValue: string }>(
  "quotations/previewSection",
  async (payload, { rejectWithValue }) => {
    try {
      const AUTH_TOKEN = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/Quotation/calculate/section-preview`, {
        method: "POST",
        headers: { accept: "text/plain", Authorization: `Bearer ${AUTH_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!response.ok) await handleFetchError(response)
      const data = await response.json()
      return data
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to preview section")
    }
  },
)

/**
 * Preview complete calculation (helper to preview final premium without saving)
 * Request body: CompleteCalculationRequest (without proposalNo typically)
 */
export const previewCompleteCalculation = createAsyncThunk<any, Partial<CompleteCalculationRequest>, { rejectValue: string }>(
  "quotations/previewCompleteCalculation",
  async (payload, { rejectWithValue }) => {
    try {
      const AUTH_TOKEN = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/Quotation/calculate/preview-complete`, {
        method: "POST",
        headers: { accept: "text/plain", Authorization: `Bearer ${AUTH_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!response.ok) await handleFetchError(response)
      const data = await response.json()
      return data
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to preview complete calculation")
    }
  },
)

/* -------------------- NEW: create/update/delete section thunks (use calculate endpoints) -------------------- */

export const createSectionForProposal = createAsyncThunk<
  CompleteCalculationResponse,
  { proposalNo: string; section: QuoteSection; calculatedBy?: string; remarks?: string },
  { state: any; rejectValue: string }
>("quotations/createSectionForProposal", async ({ proposalNo, section, calculatedBy = "USER", remarks = "" }, { getState, rejectWithValue }) => {
  try {
    const AUTH_TOKEN = getAuthToken();

    const state: any = getState()
    const currentProposal: Proposal | null = state.quotations.currentProposal
    const existingSections: QuoteSection[] = state.quotations.sections || []

    // Append the new section
    const newSections = [...existingSections, section]

    const calculationData: CompleteCalculationRequest = {
      proposalNo,
      sections: newSections,
      proportionRate: currentProposal?.proportionRate ?? 0,
      exchangeRate: currentProposal?.exRate ?? 1,
      currency: currentProposal?.exCurrency ?? "NGN",
      coverDays: currentProposal?.proRataDays ?? 365,
      specialDiscountRate: 0,
      deductibleDiscountRate: 0,
      spreadDiscountRate: 0,
      ltaDiscountRate: 0,
      otherDiscountsRate: 0,
      theftLoadingRate: 0,
      srccLoadingRate: 0,
      otherLoading2Rate: 0,
      otherLoadingsRate: 0,
      calculatedBy,
      remarks,
    }

    // Use PUT if there's an existing calculation, else POST
    const usePut = !!state.quotations.currentCalculation
    const response = await fetch(`${API_BASE_URL}/Quotation/${proposalNo}/calculate/fire/complete`, {
      method: usePut ? "PUT" : "POST",
      headers: { accept: "text/plain", Authorization: `Bearer ${AUTH_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(calculationData),
    })

    if (!response.ok) await handleFetchError(response)
    const data = await response.json()
    return data as CompleteCalculationResponse
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to create section")
  }
})

export const updateSectionForProposal = createAsyncThunk<
  CompleteCalculationResponse,
  { proposalNo: string; sectionID: string; section: QuoteSection; calculatedBy?: string; remarks?: string },
  { state: any; rejectValue: string }
>("quotations/updateSectionForProposal", async ({ proposalNo, sectionID, section, calculatedBy = "USER", remarks = "" }, { getState, rejectWithValue }) => {
  try {
    const AUTH_TOKEN = getAuthToken();

    const state: any = getState()
    const currentProposal: Proposal | null = state.quotations.currentProposal
    const existingSections: QuoteSection[] = state.quotations.sections || []

    const newSections = existingSections.map((s) => (s.sectionID === sectionID ? section : s))

    const calculationData: CompleteCalculationRequest = {
      proposalNo,
      sections: newSections,
      proportionRate: currentProposal?.proportionRate ?? 0,
      exchangeRate: currentProposal?.exRate ?? 1,
      currency: currentProposal?.exCurrency ?? "NGN",
      coverDays: currentProposal?.proRataDays ?? 365,
      specialDiscountRate: 0,
      deductibleDiscountRate: 0,
      spreadDiscountRate: 0,
      ltaDiscountRate: 0,
      otherDiscountsRate: 0,
      theftLoadingRate: 0,
      srccLoadingRate: 0,
      otherLoading2Rate: 0,
      otherLoadingsRate: 0,
      calculatedBy,
      remarks,
    }

    const usePut = !!state.quotations.currentCalculation
    const response = await fetch(`${API_BASE_URL}/Quotation/${proposalNo}/calculate/fire/complete`, {
      method: usePut ? "PUT" : "POST",
      headers: { accept: "text/plain", Authorization: `Bearer ${AUTH_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(calculationData),
    })

    if (!response.ok) await handleFetchError(response)
    const data = await response.json()
    return data as CompleteCalculationResponse
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to update section")
  }
})

export const deleteSectionForProposal = createAsyncThunk<
  CompleteCalculationResponse,
  { proposalNo: string; sectionID: string; calculatedBy?: string; remarks?: string },
  { state: any; rejectValue: string }
>("quotations/deleteSectionForProposal", async ({ proposalNo, sectionID, calculatedBy = "USER", remarks = "" }, { getState, rejectWithValue }) => {
  try {
    const AUTH_TOKEN = getAuthToken();

    const state: any = getState()
    const currentProposal: Proposal | null = state.quotations.currentProposal
    const existingSections: QuoteSection[] = state.quotations.sections || []

    const newSections = existingSections.filter((s) => s.sectionID !== sectionID)

    const calculationData: CompleteCalculationRequest = {
      proposalNo,
      sections: newSections,
      proportionRate: currentProposal?.proportionRate ?? 0,
      exchangeRate: currentProposal?.exRate ?? 1,
      currency: currentProposal?.exCurrency ?? "NGN",
      coverDays: currentProposal?.proRataDays ?? 365,
      specialDiscountRate: 0,
      deductibleDiscountRate: 0,
      spreadDiscountRate: 0,
      ltaDiscountRate: 0,
      otherDiscountsRate: 0,
      theftLoadingRate: 0,
      srccLoadingRate: 0,
      otherLoading2Rate: 0,
      otherLoadingsRate: 0,
      calculatedBy,
      remarks,
    }

    const usePut = !!state.quotations.currentCalculation
    const response = await fetch(`${API_BASE_URL}/Quotation/${proposalNo}/calculate/fire/complete`, {
      method: usePut ? "PUT" : "POST",
      headers: { accept: "text/plain", Authorization: `Bearer ${AUTH_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(calculationData),
    })

    if (!response.ok) await handleFetchError(response)
    const data = await response.json()
    return data as CompleteCalculationResponse
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to delete section")
  }
})

/* -------------------- initial state and slice -------------------- */

const initialState: QuotationState = {
  proposals: [],
  currentProposal: null,
  currentCalculation: null,
  calculationBreakdown: null,
  sectionsSummary: null,
  sections: [],
  selectedRiskFilter: null,
  proposalReport: null,

  loading: {
    fetchProposals: false,
    fetchProposalReport: false,
    createProposal: false,
    updateProposal: false,
    deleteProposal: false,
    calculate: false,
    fetchCalculation: false,
    calculateRiskItems: false,
  },
  success: {
    createProposal: false,
    fetchProposalReport: false,
    updateProposal: false,
    deleteProposal: false,
    calculate: false,
    calculateRiskItems: false,
  },
  error: {
    fetchProposals: null,
    fetchProposalReport: false,
    createProposal: null,
    updateProposal: null,
    deleteProposal: null,
    calculate: null,
    fetchCalculation: null,
    calculateRiskItems: null,
  },
  pagination: {
    page: 1,
    pageSize: 50,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  },
  searchTerm: "",
  activeTab: "overview",
}

const quotationSlice = createSlice({
  name: "quotations",
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload
    },
    setActiveTab: (state, action: PayloadAction<"overview" | "drafts" | "calculated" | "converted">) => {
      state.activeTab = action.payload
    },
    setCurrentProposal: (state, action: PayloadAction<Proposal | null>) => {
      state.currentProposal = action.payload
    },
    setSelectedRiskFilter: (state, action: PayloadAction<string | null>) => {
      state.selectedRiskFilter = action.payload
    },
    setSections: (state, action: PayloadAction<QuoteSection[]>) => {
      state.sections = action.payload
    },
    addSection: (state, action: PayloadAction<QuoteSection>) => {
      state.sections.push(action.payload)
    },
    updateSection: (state, action: PayloadAction<{ sectionID: string; section: QuoteSection }>) => {
      const index = state.sections.findIndex((s) => s.sectionID === action.payload.sectionID)
      if (index !== -1) state.sections[index] = action.payload.section
    },
    removeSection: (state, action: PayloadAction<string>) => {
      state.sections = state.sections.filter((s) => s.sectionID !== action.payload)
    },
    clearMessages: (state) => {
      state.success = {
        createProposal: false,
        updateProposal: false,
        deleteProposal: false,
        calculate: false,
        calculateRiskItems: false,
        fetchProposalReport: false,
      }
      state.error = {
        fetchProposals: null,
        createProposal: null,
        updateProposal: null,
        deleteProposal: null,
        calculate: null,
        fetchCalculation: null,
        calculateRiskItems: null,
        fetchProposalReport: null,
      }
    },
  },
  extraReducers: (builder) => {
    builder
      /* fetchProposals */
      .addCase(fetchProposals.pending, (state) => {
        state.loading.fetchProposals = true
        state.error.fetchProposals = null
      })
      .addCase(fetchProposals.fulfilled, (state, action) => {
        state.loading.fetchProposals = false
        state.proposals = action.payload.items
        state.pagination = {
          page: action.payload.page,
          pageSize: action.payload.pageSize,
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
          hasNext: action.payload.hasNext,
          hasPrevious: action.payload.hasPrevious,
        }
      })
      .addCase(fetchProposals.rejected, (state, action) => {
        state.loading.fetchProposals = false
        state.error.fetchProposals = action.payload ?? action.error.message ?? "Failed to fetch proposals"
      })

      .addCase(fetchProposalReport.pending, (state) => {
        state.loading.fetchProposalReport = true
        state.error.fetchProposalReport = null
      })
      .addCase(fetchProposalReport.fulfilled, (state, action) => {
        state.loading.fetchProposalReport = false
        state.success.fetchProposalReport = true
        state.proposalReport = action.payload
      })
      .addCase(fetchProposalReport.rejected, (state, action) => {
        state.loading.fetchProposalReport = false
        state.error.fetchProposalReport = action.payload as string
      })

      /* getProposalByNumber */
      .addCase(getProposalByNumber.pending, (state) => {
        // clear previous proposal immediately to avoid showing stale data
        state.currentProposal = null
      })
      .addCase(getProposalByNumber.fulfilled, (state, action) => {
        state.currentProposal = action.payload
      })
      .addCase(getProposalByNumber.rejected, (state, action) => {
        // leave as null or previously cleared
      })

      /* createProposal */
      .addCase(createProposal.pending, (state) => {
        state.loading.createProposal = true
        state.error.createProposal = null
        state.success.createProposal = false
      })
      .addCase(createProposal.fulfilled, (state, action) => {
        state.loading.createProposal = false
        state.success.createProposal = true
        state.proposals.unshift(action.payload)
        state.currentProposal = action.payload
      })
      .addCase(createProposal.rejected, (state, action) => {
        state.loading.createProposal = false
        state.error.createProposal = action.payload ?? action.error.message ?? "Failed to create proposal"
      })

      /* updateProposal */
      .addCase(updateProposal.pending, (state) => {
        state.loading.updateProposal = true
        state.error.updateProposal = null
        state.success.updateProposal = false
      })
      .addCase(updateProposal.fulfilled, (state, action) => {
        state.loading.updateProposal = false
        state.success.updateProposal = true
        const idx = state.proposals.findIndex((p) => p.proposalNo === action.payload.proposalNo)
        if (idx !== -1) state.proposals[idx] = action.payload
        state.currentProposal = action.payload
      })
      .addCase(updateProposal.rejected, (state, action) => {
        state.loading.updateProposal = false
        state.error.updateProposal = action.payload ?? action.error.message ?? "Failed to update proposal"
      })

      /* deleteProposal */
      .addCase(deleteProposal.pending, (state) => {
        state.loading.deleteProposal = true
        state.error.deleteProposal = null
        state.success.deleteProposal = false
      })
      .addCase(deleteProposal.fulfilled, (state, action) => {
        state.loading.deleteProposal = false
        state.success.deleteProposal = true
        state.proposals = state.proposals.filter((p) => p.proposalNo !== action.payload)
        if (state.currentProposal?.proposalNo === action.payload) state.currentProposal = null
      })
      .addCase(deleteProposal.rejected, (state, action) => {
        state.loading.deleteProposal = false
        state.error.deleteProposal = action.payload ?? action.error.message ?? "Failed to delete proposal"
      })

      /* calculateComplete */
      .addCase(calculateComplete.pending, (state) => {
        state.loading.calculate = true
        state.error.calculate = null
        state.success.calculate = false
      })
      .addCase(calculateComplete.fulfilled, (state, action) => {
        state.loading.calculate = false
        state.success.calculate = true
        state.currentCalculation = action.payload

        if (Array.isArray(action.payload.sectionCalculations)) {
          state.sections = action.payload.sectionCalculations.map((sc: any) => ({
            sectionID: sc.sectionID,
            sectionName: sc.sectionName,
            location: sc.location ?? "",
            sectionSumInsured: sc.sectionSumInsured ?? 0,
            sectionPremium: sc.sectionGrossPremium ?? sc.sectionPremium ?? 0,
            sectionNetPremium: sc.sectionNetPremium ?? 0,
            riskItems:
              Array.isArray(sc.calculatedItems) &&
              sc.calculatedItems.map((ci: any) => ({
                itemNo: ci.itemNo,
                sectionID: ci.sectionID,
                smiCode: ci.smiCode,
                itemDescription: ci.itemDescription,
                actualValue: ci.actualValue ?? 0,
                itemRate: ci.itemRate ?? 0,
                multiplyRate: ci.multiplyRate ?? 1,
                location: ci.location ?? "",
                stockItem: ci.stockItem ?? null,
                feaDiscountRate: ci.feaDiscountRate ?? 0,
                actualPremium: ci.actualPremium,
                shareValue: ci.shareValue,
                premiumValue: ci.premiumValue,
                stockSumInsured: ci.stockSumInsured,
                stockGrossPremium: ci.stockGrossPremium,
                stockDiscountAmount: ci.stockDiscountAmount,
                stockNetPremium: ci.stockNetPremium,
                totalSumInsured: ci.totalSumInsured,
                totalGrossPremium: ci.totalGrossPremium,
                feaDiscountAmount: ci.feaDiscountAmount,
                netPremiumAfterDiscounts: ci.netPremiumAfterDiscounts,
              })),
          }))
        }
      })
      .addCase(calculateComplete.rejected, (state, action) => {
        state.loading.calculate = false
        state.error.calculate = action.payload ?? action.error.message ?? "Failed to calculate"
      })

      /* recalculateComplete */
      .addCase(recalculateComplete.pending, (state) => {
        state.loading.calculate = true
        state.error.calculate = null
        state.success.calculate = false
      })
      .addCase(recalculateComplete.fulfilled, (state, action) => {
        state.loading.calculate = false
        state.success.calculate = true
        state.currentCalculation = action.payload

        if (Array.isArray(action.payload.sectionCalculations)) {
          state.sections = action.payload.sectionCalculations.map((sc: any) => ({
            sectionID: sc.sectionID,
            sectionName: sc.sectionName,
            location: sc.location ?? "",
            sectionSumInsured: sc.sectionSumInsured ?? 0,
            sectionPremium: sc.sectionGrossPremium ?? sc.sectionPremium ?? 0,
            sectionNetPremium: sc.sectionNetPremium ?? 0,
            riskItems:
              Array.isArray(sc.calculatedItems) &&
              sc.calculatedItems.map((ci: any) => ({
                itemNo: ci.itemNo,
                sectionID: ci.sectionID,
                smiCode: ci.smiCode,
                itemDescription: ci.itemDescription,
                actualValue: ci.actualValue ?? 0,
                itemRate: ci.itemRate ?? 0,
                multiplyRate: ci.multiplyRate ?? 1,
                location: ci.location ?? "",
                stockItem: ci.stockItem ?? null,
                feaDiscountRate: ci.feaDiscountRate ?? 0,
                actualPremium: ci.actualPremium,
                shareValue: ci.shareValue,
                premiumValue: ci.premiumValue,
                stockSumInsured: ci.stockSumInsured,
                stockGrossPremium: ci.stockGrossPremium,
                stockDiscountAmount: ci.stockDiscountAmount,
                stockNetPremium: ci.stockNetPremium,
                totalSumInsured: ci.totalSumInsured,
                totalGrossPremium: ci.totalGrossPremium,
                feaDiscountAmount: ci.feaDiscountAmount,
                netPremiumAfterDiscounts: ci.netPremiumAfterDiscounts,
              })),
          }))
        }
      })
      .addCase(recalculateComplete.rejected, (state, action) => {
        state.loading.calculate = false
        state.error.calculate = action.payload ?? action.error.message ?? "Failed to recalculate"
      })

      /* getCalculationBreakdown */
      .addCase(getCalculationBreakdown.pending, (state) => {
        state.loading.fetchCalculation = true
        state.error.fetchCalculation = null
        state.calculationBreakdown = null; 
      })
      .addCase(getCalculationBreakdown.fulfilled, (state, action) => {
        state.loading.fetchCalculation = false
        state.calculationBreakdown = action.payload

        // Back-compat: populate sections from inputs.sectionInputs when present
        if (action.payload?.inputs?.sectionInputs && Array.isArray(action.payload.inputs.sectionInputs)) {
          state.sections = action.payload.inputs.sectionInputs.map((sectionInput: any) => ({
            sectionID: sectionInput.sectionID,
            sectionName: sectionInput.sectionName,
            location: sectionInput.location,
            sectionSumInsured: sectionInput.sectionSumInsured,
            sectionPremium: sectionInput.sectionGrossPremium || sectionInput.sectionPremium || 0,
            sectionNetPremium: sectionInput.sectionNetPremium ?? 0,
            riskItems: sectionInput.riskItems || [],
            lastCalculated: sectionInput.lastCalculated ?? null,
          }))
        }
      })
      .addCase(getCalculationBreakdown.rejected, (state, action) => {
        state.loading.fetchCalculation = false
        state.error.fetchCalculation = action.payload ?? action.error.message ?? "Failed to fetch breakdown"
        state.calculationBreakdown = null;
      })

      /* getCurrentCalculation */
      .addCase(getCurrentCalculation.pending, (state) => {
        // clear previous currentCalculation while fetching new one
        state.loading.fetchCalculation = true
        state.error.fetchCalculation = null
        state.currentCalculation = null
      })
      .addCase(getCurrentCalculation.fulfilled, (state, action) => {
        state.loading.fetchCalculation = false
        state.currentCalculation = action.payload
        if (action.payload?.sections && Array.isArray(action.payload.sections)) {
          state.sections = action.payload.sections
        }
      })
      .addCase(getCurrentCalculation.rejected, (state, action) => {
        state.loading.fetchCalculation = false
        state.error.fetchCalculation = action.payload ?? action.error.message ?? "Failed to fetch current calculation"
      })

      /* getSectionsSummary */
      .addCase(getSectionsSummary.pending, (state) => {
        // CLEAR previous summary immediately so UI can show loader and not stale data
        state.loading.fetchCalculation = true
        state.error.fetchCalculation = null
        state.sectionsSummary = null
      })
      .addCase(getSectionsSummary.fulfilled, (state, action) => {
        state.loading.fetchCalculation = false
        state.sectionsSummary = action.payload
      })
      .addCase(getSectionsSummary.rejected, (state, action) => {
        state.loading.fetchCalculation = false
        state.error.fetchCalculation = action.payload ?? action.error.message ?? "Failed to fetch sections summary"
      })

      /* calculateRiskItems */
      .addCase(calculateRiskItems.pending, (state) => {
        state.loading.calculateRiskItems = true
        state.error.calculateRiskItems = null
        state.success.calculateRiskItems = false
      })
      .addCase(calculateRiskItems.fulfilled, (state, action) => {
        state.loading.calculateRiskItems = false
        state.success.calculateRiskItems = true

        const resp = action.payload as CalculateRiskItemsResponse
        if (!resp) return

        const calculatedItems = Array.isArray(resp.calculatedItems) ? resp.calculatedItems : []

        // Helper: find section by sectionID
        const findSectionIndex = (sectionId: string) => state.sections.findIndex((s) => s.sectionID === sectionId)

        // Merge algorithm (no itemNo reliance)
        calculatedItems.forEach((ci: CalculatedRiskItem) => {
          const secId = (ci as any).sectionID || (ci as any).sectionId || null
          if (!secId) return

          let sIndex = findSectionIndex(secId)
          if (sIndex === -1) {
            // create minimal section entry
            const newSection: any = {
              sectionID: secId,
              sectionName: (ci as any).sectionName ?? "Unknown",
              location: (ci as any).location ?? "",
              sectionSumInsured: 0,
              sectionPremium: 0,
              sectionNetPremium: 0,
              riskItems: [],
              lastCalculated: new Date().toISOString(),
            }
            state.sections.push(newSection)
            sIndex = state.sections.length - 1
          }

          const section = state.sections[sIndex]
          const sectionItems: any[] = Array.isArray(section.riskItems) ? section.riskItems : []

          // Matching priority:
          // 1) smiCode && itemDescription
          // 2) smiCode only
          // 3) itemDescription only
          // 4) first item without server-calculated fields
          // 5) append
          let itemIndex = -1
          if (ci.smiCode && ci.itemDescription) {
            itemIndex = sectionItems.findIndex(
              (it: any) =>
                (it.smiCode || "").toString() === ci.smiCode.toString() &&
                ((it.itemDescription || "").toString().trim() === (ci.itemDescription || "").toString().trim()),
            )
          }
          if (itemIndex === -1 && ci.smiCode) {
            itemIndex = sectionItems.findIndex((it: any) => (it.smiCode || "").toString() === ci.smiCode.toString())
          }
          if (itemIndex === -1 && ci.itemDescription) {
            itemIndex = sectionItems.findIndex((it: any) => (it.itemDescription || "").toString().trim() === (ci.itemDescription || "").toString().trim())
          }
          if (itemIndex === -1) {
            itemIndex = sectionItems.findIndex((it: any) => it.actualPremium === undefined || it.actualPremium === 0)
          }

          if (itemIndex === -1) {
            // append
            const newItem = {
              ...ci,
              itemNo: ci.itemNo ?? sectionItems.length + 1,
            }
            section.riskItems = [...sectionItems, newItem]
          } else {
            const existing = sectionItems[itemIndex]
            const merged = {
              ...existing,
              ...ci,
              actualPremium: ci.actualPremium ?? existing.actualPremium ?? 0,
              actualPremiumFormula: (ci as any).actualPremiumFormula ?? existing.actualPremiumFormula ?? "",
              shareValue: (ci as any).shareValue ?? existing.shareValue ?? 0,
              shareValueFormula: (ci as any).shareValueFormula ?? existing.shareValueFormula ?? "",
              premiumValue: (ci as any).premiumValue ?? existing.premiumValue ?? 0,
              premiumValueFormula: (ci as any).premiumValueFormula ?? existing.premiumValueFormula ?? "",
              stockDiscountAmount: (ci as any).stockDiscountAmount ?? existing.stockDiscountAmount ?? 0,
              feaDiscountAmount: (ci as any).feaDiscountAmount ?? existing.feaDiscountAmount ?? 0,
              netPremiumAfterDiscounts: (ci as any).netPremiumAfterDiscounts ?? existing.netPremiumAfterDiscounts ?? 0,
              stockItem: (ci as any).stockItem ?? existing.stockItem ?? null,
            }
            section.riskItems[itemIndex] = merged
          }

          // stamp lastCalculated
          section.lastCalculated = new Date().toISOString()
        })

        // recompute section totals from items (prefer server fields)
        state.sections = state.sections.map((s: any) => {
          const items = Array.isArray(s.riskItems) ? s.riskItems : []
          const sectionSumInsured = items.reduce((sum: number, it: any) => sum + (Number(it.actualValue) || 0) + (Number(it.stockItem?.stockSumInsured) || 0), 0)
          const sectionPremium = items.reduce((sum: number, it: any) => sum + (Number(it.actualPremium) || 0), 0)
          const sectionNetPremium = items.reduce((sum: number, it: any) => sum + (Number(it.netPremiumAfterDiscounts) || 0), 0)
          return { ...s, sectionSumInsured, sectionPremium, sectionNetPremium }
        })

        // attach global totals to currentCalculation if present in response
        if (resp.totalActualValue !== undefined || resp.totalActualPremium !== undefined) {
          state.currentCalculation = {
            ...(state.currentCalculation || ({} as CompleteCalculationResponse)),
            totalSumInsured: resp.totalActualValue ?? state.currentCalculation?.totalSumInsured,
            totalPremium: resp.totalActualPremium ?? state.currentCalculation?.totalPremium,
            totalShareValue: resp.totalShareValue ?? state.currentCalculation?.totalShareValue,
            totalSharePremium: resp.totalSharePremium ?? state.currentCalculation?.totalSharePremium,
            totalNetPremiumAfterDiscounts: resp.totalNetPremiumAfterDiscounts ?? (state.currentCalculation as any)?.totalNetPremiumAfterDiscounts,
          } as CompleteCalculationResponse
        }
      })
      .addCase(calculateRiskItems.rejected, (state, action) => {
        state.loading.calculateRiskItems = false
        state.error.calculateRiskItems = action.payload ?? action.error.message ?? "Failed to calculate risk items"
        state.success.calculateRiskItems = false
      })

      /* create/update/delete section thunks */
      .addCase(createSectionForProposal.pending, (state) => {
        state.loading.calculate = true
        state.error.calculate = null
      })
      .addCase(createSectionForProposal.fulfilled, (state, action) => {
        state.loading.calculate = false
        state.success.calculate = true
        state.currentCalculation = action.payload
        if (Array.isArray(action.payload.sectionCalculations)) {
          state.sections = action.payload.sectionCalculations.map((sc: any) => ({
            sectionID: sc.sectionID,
            sectionName: sc.sectionName,
            location: sc.location ?? "",
            sectionSumInsured: sc.sectionSumInsured ?? 0,
            sectionPremium: sc.sectionGrossPremium ?? sc.sectionPremium ?? 0,
            sectionNetPremium: sc.sectionNetPremium ?? 0,
            riskItems:
              Array.isArray(sc.calculatedItems) &&
              sc.calculatedItems.map((ci: any) => ({
                itemNo: ci.itemNo,
                sectionID: ci.sectionID,
                smiCode: ci.smiCode,
                itemDescription: ci.itemDescription,
                actualValue: ci.actualValue ?? 0,
                itemRate: ci.itemRate ?? 0,
                multiplyRate: ci.multiplyRate ?? 1,
                location: ci.location ?? "",
                stockItem: ci.stockItem ?? null,
                feaDiscountRate: ci.feaDiscountRate ?? 0,
                actualPremium: ci.actualPremium,
                shareValue: ci.shareValue,
                premiumValue: ci.premiumValue,
                stockSumInsured: ci.stockSumInsured,
                stockGrossPremium: ci.stockGrossPremium,
                stockDiscountAmount: ci.stockDiscountAmount,
                stockNetPremium: ci.stockNetPremium,
                totalSumInsured: ci.totalSumInsured,
                totalGrossPremium: ci.totalGrossPremium,
                feaDiscountAmount: ci.feaDiscountAmount,
                netPremiumAfterDiscounts: ci.netPremiumAfterDiscounts,
              })),
          }))
        }
      })
      .addCase(createSectionForProposal.rejected, (state, action) => {
        state.loading.calculate = false
        state.error.calculate = action.payload ?? action.error.message ?? "Failed to create section"
        state.success.calculate = false
      })

      .addCase(updateSectionForProposal.pending, (state) => {
        state.loading.calculate = true
        state.error.calculate = null
      })
      .addCase(updateSectionForProposal.fulfilled, (state, action) => {
        state.loading.calculate = false
        state.success.calculate = true
        state.currentCalculation = action.payload
        if (Array.isArray(action.payload.sectionCalculations)) {
          state.sections = action.payload.sectionCalculations.map((sc: any) => ({
            sectionID: sc.sectionID,
            sectionName: sc.sectionName,
            location: sc.location ?? "",
            sectionSumInsured: sc.sectionSumInsured ?? 0,
            sectionPremium: sc.sectionGrossPremium ?? sc.sectionPremium ?? 0,
            sectionNetPremium: sc.sectionNetPremium ?? 0,
            riskItems:
              Array.isArray(sc.calculatedItems) &&
              sc.calculatedItems.map((ci: any) => ({
                itemNo: ci.itemNo,
                sectionID: ci.sectionID,
                smiCode: ci.smiCode,
                itemDescription: ci.itemDescription,
                actualValue: ci.actualValue ?? 0,
                itemRate: ci.itemRate ?? 0,
                multiplyRate: ci.multiplyRate ?? 1,
                location: ci.location ?? "",
                stockItem: ci.stockItem ?? null,
                feaDiscountRate: ci.feaDiscountRate ?? 0,
                actualPremium: ci.actualPremium,
                shareValue: ci.shareValue,
                premiumValue: ci.premiumValue,
                stockSumInsured: ci.stockSumInsured,
                stockGrossPremium: ci.stockGrossPremium,
                stockDiscountAmount: ci.stockDiscountAmount,
                stockNetPremium: ci.stockNetPremium,
                totalSumInsured: ci.totalSumInsured,
                totalGrossPremium: ci.totalGrossPremium,
                feaDiscountAmount: ci.feaDiscountAmount,
                netPremiumAfterDiscounts: ci.netPremiumAfterDiscounts,
              })),
          }))
        }
      })
      .addCase(updateSectionForProposal.rejected, (state, action) => {
        state.loading.calculate = false
        state.error.calculate = action.payload ?? action.error.message ?? "Failed to update section"
        state.success.calculate = false
      })

      .addCase(deleteSectionForProposal.pending, (state) => {
        state.loading.calculate = true
        state.error.calculate = null
      })
      .addCase(deleteSectionForProposal.fulfilled, (state, action) => {
        state.loading.calculate = false
        state.success.calculate = true
        state.currentCalculation = action.payload
        if (Array.isArray(action.payload.sectionCalculations)) {
          state.sections = action.payload.sectionCalculations.map((sc: any) => ({
            sectionID: sc.sectionID,
            sectionName: sc.sectionName,
            location: sc.location ?? "",
            sectionSumInsured: sc.sectionSumInsured ?? 0,
            sectionPremium: sc.sectionGrossPremium ?? sc.sectionPremium ?? 0,
            sectionNetPremium: sc.sectionNetPremium ?? 0,
            riskItems:
              Array.isArray(sc.calculatedItems) &&
              sc.calculatedItems.map((ci: any) => ({
                itemNo: ci.itemNo,
                sectionID: ci.sectionID,
                smiCode: ci.smiCode,
                itemDescription: ci.itemDescription,
                actualValue: ci.actualValue ?? 0,
                itemRate: ci.itemRate ?? 0,
                multiplyRate: ci.multiplyRate ?? 1,
                location: ci.location ?? "",
                stockItem: ci.stockItem ?? null,
                feaDiscountRate: ci.feaDiscountRate ?? 0,
                actualPremium: ci.actualPremium,
                shareValue: ci.shareValue,
                premiumValue: ci.premiumValue,
                stockSumInsured: ci.stockSumInsured,
                stockGrossPremium: ci.stockGrossPremium,
                stockDiscountAmount: ci.stockDiscountAmount,
                stockNetPremium: ci.stockNetPremium,
                totalSumInsured: ci.totalSumInsured,
                totalGrossPremium: ci.totalGrossPremium,
                feaDiscountAmount: ci.feaDiscountAmount,
                netPremiumAfterDiscounts: ci.netPremiumAfterDiscounts,
              })),
          }))
        }
      })
      .addCase(deleteSectionForProposal.rejected, (state, action) => {
        state.loading.calculate = false
        state.error.calculate = action.payload ?? action.error.message ?? "Failed to delete section"
        state.success.calculate = false
      })

      /* -------------------- NEW ENDPOINT HANDLERS -------------------- */

      /* calculateSectionAggregate */
      .addCase(calculateSectionAggregate.pending, (state) => {
        state.loading.calculate = true
        state.error.calculate = null
      })
      .addCase(calculateSectionAggregate.fulfilled, (state, action) => {
        state.loading.calculate = false
          // store result to a friendly key so UI can use it if needed
          ; (state as any).sectionAggregate = action.payload
      })
      .addCase(calculateSectionAggregate.rejected, (state, action) => {
        state.loading.calculate = false
        state.error.calculate = action.payload ?? action.error.message ?? "Failed to compute section aggregate"
      })

      /* calculateMultiSectionAggregate */
      .addCase(calculateMultiSectionAggregate.pending, (state) => {
        state.loading.calculate = true
        state.error.calculate = null
      })
      .addCase(calculateMultiSectionAggregate.fulfilled, (state, action) => {
        state.loading.calculate = false
          ; (state as any).multiSectionAggregate = action.payload
      })
      .addCase(calculateMultiSectionAggregate.rejected, (state, action) => {
        state.loading.calculate = false
        state.error.calculate = action.payload ?? action.error.message ?? "Failed to compute multi-section aggregate"
      })

      /* applyProposalAdjustments */
      .addCase(applyProposalAdjustments.pending, (state) => {
        state.loading.calculate = true
        state.error.calculate = null
      })
      .addCase(applyProposalAdjustments.fulfilled, (state, action) => {
        state.loading.calculate = false
          ; (state as any).proposalAdjustmentDetails = action.payload
      })
      .addCase(applyProposalAdjustments.rejected, (state, action) => {
        state.loading.calculate = false
        state.error.calculate = action.payload ?? action.error.message ?? "Failed to apply proposal adjustments"
      })

      /* calculateProRata */
      .addCase(calculateProRata.pending, (state) => {
        state.loading.calculate = true
        state.error.calculate = null
      })
      .addCase(calculateProRata.fulfilled, (state, action) => {
        state.loading.calculate = false
          ; (state as any).proRataDetails = action.payload
      })
      .addCase(calculateProRata.rejected, (state, action) => {
        state.loading.calculate = false
        state.error.calculate = action.payload ?? action.error.message ?? "Failed to calculate pro-rata"
      })

      /* previewSection */
      .addCase(previewSection.pending, (state) => {
        state.loading.calculate = true
        state.error.calculate = null
      })
      .addCase(previewSection.fulfilled, (state, action) => {
        state.loading.calculate = false
          ; (state as any).sectionPreview = action.payload
      })
      .addCase(previewSection.rejected, (state, action) => {
        state.loading.calculate = false
        state.error.calculate = action.payload ?? action.error.message ?? "Failed to preview section"
      })

      /* previewCompleteCalculation */
      .addCase(previewCompleteCalculation.pending, (state) => {
        state.loading.calculate = true
        state.error.calculate = null
      })
      .addCase(previewCompleteCalculation.fulfilled, (state, action) => {
        state.loading.calculate = false
          ; (state as any).calculationPreview = action.payload
      })
      .addCase(previewCompleteCalculation.rejected, (state, action) => {
        state.loading.calculate = false
        state.error.calculate = action.payload ?? action.error.message ?? "Failed to preview complete calculation"
      })
  },
})

export const {
  setSearchTerm,
  setActiveTab,
  setCurrentProposal,
  setSelectedRiskFilter,
  setSections,
  addSection,
  updateSection,
  removeSection,
  clearMessages,
} = quotationSlice.actions

export default quotationSlice.reducer
