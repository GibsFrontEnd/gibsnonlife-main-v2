import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import type {
    MotorCalculationRequest,
    MotorCalculationResponse,
    MotorCalculationBreakdown,
    MotorQuotationState,
} from "../../../types/motor-quotation"
import { parseCalculatedVehiclesToUI } from "@/utils/quotationCalculations";

const API_BASE = "https://core-api.newgibsonline.com/api"

// Async thunks for motor calculations
export const calculateMotorComplete = createAsyncThunk(
    "motorQuotation/calculateComplete",
    async (
        { proposalNo, calculationData }: { proposalNo: string; calculationData: MotorCalculationRequest },
        { rejectWithValue },
    ) => {
        try {
            const response = await fetch(`${API_BASE}/Quotation/${proposalNo}/calculate/motor/complete`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(calculationData),
            })
            if (!response.ok) throw new Error("Calculation failed")
            return (await response.json()) as MotorCalculationResponse
        } catch (error: any) {
            return rejectWithValue(error.message)
        }
    },
)

export const recalculateMotorComplete = createAsyncThunk(
    "motorQuotation/recalculateComplete",
    async (
        { proposalNo, calculationData }: { proposalNo: string; calculationData: MotorCalculationRequest },
        { rejectWithValue },
    ) => {
        try {
            const response = await fetch(`${API_BASE}/Quotation/${proposalNo}/calculate/motor/complete`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(calculationData),
            })
            if (!response.ok) throw new Error("Recalculation failed")
            return (await response.json()) as MotorCalculationResponse
        } catch (error: any) {
            return rejectWithValue(error.message)
        }
    },
)

export const getMotorCalculationBreakdown = createAsyncThunk(
    "motorQuotation/getCalculationBreakdown",
    async (proposalNo: string, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE}/Quotation/${proposalNo}/motor/calculation/breakdown`)
            if (!response.ok) throw new Error("Failed to fetch breakdown")
            return (await response.json()) as MotorCalculationBreakdown
        } catch (error: any) {
            return rejectWithValue(error.message)
        }
    },
)

// Step-by-step calculation endpoints
export const calculateBasicPremium = createAsyncThunk(
    "motorQuotation/calculateBasicPremium",
    async (
        payload: {
            vehicleType: string
            vehicleValue: number
            premiumRate: number
            coverType: string
            usage: string
        },
        { rejectWithValue },
    ) => {
        try {
            const response = await fetch(`${API_BASE}/Quotation/motor/calculate/step1-basic-premium`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            if (!response.ok) throw new Error("Basic premium calculation failed")
            return await response.json()
        } catch (error: any) {
            return rejectWithValue(error.message)
        }
    },
)

export const applyDiscounts = createAsyncThunk(
    "motorQuotation/applyDiscounts",
    async (
        payload: {
            basicPremium: number
            vehicleValue: number
            discounts: any[]
        },
        { rejectWithValue },
    ) => {
        try {
            const response = await fetch(`${API_BASE}/Quotation/motor/calculate/step2-apply-discounts`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            if (!response.ok) throw new Error("Discount calculation failed")
            return await response.json()
        } catch (error: any) {
            return rejectWithValue(error.message)
        }
    },
)

export const applyLoadings = createAsyncThunk(
    "motorQuotation/applyLoadings",
    async (
        payload: {
            premiumAfterDiscounts: number
            vehicleValue: number
            loadings: any[]
        },
        { rejectWithValue },
    ) => {
        try {
            const response = await fetch(`${API_BASE}/Quotation/motor/calculate/step3-apply-loadings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            if (!response.ok) throw new Error("Loading calculation failed")
            return await response.json()
        } catch (error: any) {
            return rejectWithValue(error.message)
        }
    },
)

export const calculateFinalPremium = createAsyncThunk(
    "motorQuotation/calculateFinalPremium",
    async (
        payload: {
            grossPremium: number
            trackingCost: number
            rescueCost: number
        },
        { rejectWithValue },
    ) => {
        try {
            const response = await fetch(`${API_BASE}/Quotation/motor/calculate/step4-final-premium`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            if (!response.ok) throw new Error("Final premium calculation failed")
            return await response.json()
        } catch (error: any) {
            return rejectWithValue(error.message)
        }
    },
)

export const aggregateVehicles = createAsyncThunk(
    "motorQuotation/aggregateVehicles",
    async (
        payload: {
            vehicles: Array<{
                itemNo: number
                vehicleRegNo: string
                vehicleValue: number
                netPremium: number
            }>
        },
        { rejectWithValue },
    ) => {
        try {
            const response = await fetch(`${API_BASE}/Quotation/motor/calculate/step5-aggregate-vehicles`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            if (!response.ok) throw new Error("Vehicle aggregation failed")
            return await response.json()
        } catch (error: any) {
            return rejectWithValue(error.message)
        }
    },
)

export const applyProposalAdjustments = createAsyncThunk(
    "motorQuotation/applyProposalAdjustments",
    async (
        payload: {
            aggregatePremium: number
            otherDiscountRate: number
            otherLoadingRate: number
        },
        { rejectWithValue },
    ) => {
        try {
            const response = await fetch(`${API_BASE}/Quotation/motor/calculate/step6-proposal-adjustments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            if (!response.ok) throw new Error("Proposal adjustments calculation failed")
            return await response.json()
        } catch (error: any) {
            return rejectWithValue(error.message)
        }
    },
)

export const calculateFinal = createAsyncThunk(
    "motorQuotation/calculateFinal",
    async (
        payload: {
            netPremium: number
            totalVehicleValue: number
            coverDays: number
            proportionRate: number
            exchangeRate: number
            currency: string
        },
        { rejectWithValue },
    ) => {
        try {
            const response = await fetch(`${API_BASE}/Quotation/motor/calculate/step7-final-calculation`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            if (!response.ok) throw new Error("Final calculation failed")
            return await response.json()
        } catch (error: any) {
            return rejectWithValue(error.message)
        }
    },
)

const initialState: MotorQuotationState = {
    currentProposal: null,
    currentCalculation: null,
    calculationBreakdown: null,
    hasCalculated: false,
    vehicles: [],
    loading: {
        fetchProposal: false,
        calculate: false,
        fetchCalculation: false,
    },
    success: {
        calculate: false,
    },
    error: {
        fetchProposal: null,
        calculate: null,
        fetchCalculation: null,
    },
}

const motorQuotationSlice = createSlice({
    name: "motorQuotations",
    initialState,
    reducers: {
        clearMessages: (state) => {
            state.error = { fetchProposal: null, calculate: null, fetchCalculation: null }
            state.success = { calculate: false }
        },
        setVehicles: (state, action) => {
            state.vehicles = action.payload
        },
        addVehicle: (state, action) => {
            state.vehicles.push(action.payload)
            state.hasCalculated = false
        },
        updateVehicle: (state, action) => {
            const index = state.vehicles.findIndex((v) => v.uiId === action.payload.uiId)
            if (index !== -1) {
                state.vehicles[index] = action.payload
            }
            state.hasCalculated = false
        },
        removeVehicle: (state, action) => {
            state.vehicles = state.vehicles.filter((v) => v.uiId !== action.payload)
            state.hasCalculated = false
        },
    },
    extraReducers: (builder) => {
        // Calculate Motor Complete
        builder
            .addCase(calculateMotorComplete.pending, (state) => {
                state.loading.calculate = true
                state.error.calculate = null
            })
            .addCase(calculateMotorComplete.fulfilled, (state, action) => {
                state.loading.calculate = false
                state.currentCalculation = action.payload
                state.hasCalculated = true
                state.success.calculate = true
            })
            .addCase(calculateMotorComplete.rejected, (state, action) => {
                state.loading.calculate = false
                state.error.calculate = action.payload as string
            })

        // Recalculate Motor Complete
        builder
            .addCase(recalculateMotorComplete.pending, (state) => {
                state.loading.calculate = true
                state.error.calculate = null
            })
            .addCase(recalculateMotorComplete.fulfilled, (state, action) => {
                state.loading.calculate = false
                state.currentCalculation = action.payload
                state.hasCalculated = true
                state.success.calculate = true
            })
            .addCase(recalculateMotorComplete.rejected, (state, action) => {
                state.loading.calculate = false
                state.error.calculate = action.payload as string
            })

        // Get Motor Calculation Breakdown
        builder
            .addCase(getMotorCalculationBreakdown.pending, (state) => {
                state.loading.fetchCalculation = true
                state.calculationBreakdown = null
                state.error.fetchCalculation = null
            })
            .addCase(getMotorCalculationBreakdown.fulfilled, (state, action) => {
                state.loading.fetchCalculation = false
                state.calculationBreakdown = action.payload
                if (action.payload.vehicleCalculations && action.payload.vehicleCalculations.length > 0) {
                    state.vehicles = parseCalculatedVehiclesToUI(action.payload.vehicleCalculations)
                }
                state.hasCalculated = true
            })
            .addCase(getMotorCalculationBreakdown.rejected, (state, action) => {
                state.loading.fetchCalculation = false
                state.error.fetchCalculation = action.payload as string
            })

        builder
            .addCase(aggregateVehicles.pending, (state) => {
                state.loading.calculate = true
                state.error.calculate = null
            })
            .addCase(aggregateVehicles.fulfilled, (state, action) => {
                state.loading.calculate = false
                state.currentCalculation = action.payload
                state.success.calculate = true
            })
            .addCase(aggregateVehicles.rejected, (state, action) => {
                state.loading.calculate = false
                state.error.calculate = action.payload as string
            })

        builder
            .addCase(applyProposalAdjustments.pending, (state) => {
                state.loading.calculate = true
                state.error.calculate = null
            })
            .addCase(applyProposalAdjustments.fulfilled, (state, action) => {
                state.loading.calculate = false
                state.currentCalculation = action.payload
                state.success.calculate = true
            })
            .addCase(applyProposalAdjustments.rejected, (state, action) => {
                state.loading.calculate = false
                state.error.calculate = action.payload as string
            })

        builder
            .addCase(calculateFinal.pending, (state) => {
                state.loading.calculate = true
                state.error.calculate = null
            })
            .addCase(calculateFinal.fulfilled, (state, action) => {
                state.loading.calculate = false
                state.currentCalculation = action.payload
                state.success.calculate = true
            })
            .addCase(calculateFinal.rejected, (state, action) => {
                state.loading.calculate = false
                state.error.calculate = action.payload as string
            })
    },
})

export const { clearMessages, setVehicles, addVehicle, updateVehicle, removeVehicle } = motorQuotationSlice.actions

export default motorQuotationSlice.reducer
