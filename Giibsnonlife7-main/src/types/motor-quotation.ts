// Motor-specific types for the quotation system

export interface MotorAdjustment {
  adjustmentName: string
  adjustmentType: string
  rate: number
  appliedOn: "SumInsured" | "Premium"
  baseAmount: number
  amount: number
  sequenceOrder: number
  formula: string
}

export interface MotorVehicle {
  itemNo: number
  vehicleRegNo: string
  vehicleUser: string
  vehicleType: string
  vehicleMake: string
  vehicleModel: string
  chassisNo: string
  engineNo: string
  color: string
  modelYear: number
  coverType: string
  usage: string
  vehicleValue: number
  premiumRate: number
  state: string
  seatCapacity: number
  waxCode: string
  location: string
  startDate: string
  endDate: string
  trackingCost: number
  rescueCost: number
  discounts: MotorAdjustment[]
  loadings: MotorAdjustment[]
}

export interface CalculatedMotorVehicle extends MotorVehicle {
  itemNo: number,
  vehicleRegNo: string,
  certificateNo: string,
  vehicleType: string,
  coverType: string,
  vehicleValue: number,
  premiumRate: number,
  step1_BasicPremium?: {
    stepName: string
    startingAmount: number
    adjustments: {
      name: string,
      type: string,
      rate: number,
      amount: number,
      sequenceOrder: number,
      formula: string
    }[]
    totalAdjustment: number,
    resultingAmount: number
    formula: string
  }
  step2_AfterDiscounts?: {
    stepName: string
    startingAmount: number
    adjustments: {
      name: string,
      type: string,
      rate: number,
      amount: number,
      sequenceOrder: number,
      formula: string
    }[]
    totalAdjustment: number,
    resultingAmount: number
    formula: string
  }
  step3_AfterLoadings?: {
    stepName: string
    startingAmount: number
    adjustments: {
      name: string,
      type: string,
      rate: number,
      amount: number,
      sequenceOrder: number,
      formula: string
    }[]
    totalAdjustment: number,
    resultingAmount: number
    formula: string
  }
  step4_FinalPremium?: {
    stepName: string
    startingAmount: number
    adjustments: {
      name: string,
      type: string,
      rate: number,
      amount: number,
      sequenceOrder: number,
      formula: string
    }[]
    totalAdjustment: number,
    resultingAmount: number
    formula: string
  }
  shareValue: number,
  sharePremium: number
}

export interface MotorVehicleUI extends MotorVehicle {
  _collapsed?: boolean
  _showDetails?: boolean
  uiId?: string
}

export interface MotorCalculationRequest {
  proposalNo: string
  vehicles: MotorVehicle[]
  otherDiscountRate: number
  otherLoadingRate: number
  proportionRate: number
  exchangeRate: number
  currency: string
  coverDays: number
  calculatedBy: string
}

export interface MotorCalculationResponse {
  proposalNo: string
  calculatedVehicles: CalculatedMotorVehicle[]
  totalVehicleValue: number
  totalNetPremium: number
  vehicleCount: number
  otherDiscountRate: number
  otherLoadingRate: number
  otherDiscountAmount: number
  otherLoadingAmount: number
  netPremiumDue: number
  proRataPremium: number
  shareSumInsured: number
  sharePremium: number
  foreignSumInsured: number
  foreignPremium: number
  finalPremiumDue: number
  success: boolean
  message: string
}

export interface MotorCalculationBreakdown {
  proposalNo: string
  calculatedOn: string
  calculatedBy: string
  inputs: {
    proportionRate: number
    exchangeRate: number
    currency: string
    coverDays: number
    vehicleCount: number
    otherDiscountRate: number
    otherLoadingRate: number
  }
  vehicleAggregation: {
    totalVehicles: number,
    totalVehicleValue: number,
    totalNetPremium: number,
    vehicleSummaries: [
      {
        itemNo: number,
        vehicleRegNo: string,
        vehicleValue: number,
        netPremium: number
      }
    ]
  }
  vehicleCalculations: CalculatedMotorVehicle[]
  proposalAdjustments: {
    aggregatePremium: number
    otherDiscountRate: number
    otherDiscountAmount: number
    premiumAfterDiscount: number
    otherLoadingRate: number
    otherLoadingAmount: number
    netPremiumDue: number
  }
  finalResults: {
    totalVehicleValue: number,
    totalNetPremium: number,
    netPremiumAfterProposalAdjustments: number,
    proRataPremium: number,
    shareSumInsured: number,
    sharePremium: number,
    foreignSumInsured: number,
    foreignPremium: number,
    foreignCurrency: string,
    finalPremiumDue: number
  }
  success: boolean
  message: string
}

export interface MotorQuotationState {
  currentProposal: any | null
  currentCalculation: MotorCalculationResponse | null
  calculationBreakdown: MotorCalculationBreakdown | null
  vehicles: MotorVehicleUI[]
  hasCalculated: boolean

  loading: {
    fetchProposal: boolean
    calculate: boolean
    fetchCalculation: boolean
  }
  success: {
    calculate: boolean
  }
  error: {
    fetchProposal: string | null
    calculate: string | null
    fetchCalculation: string | null
  }
}
