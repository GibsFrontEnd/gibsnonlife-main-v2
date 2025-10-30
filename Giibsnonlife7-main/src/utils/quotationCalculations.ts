//@ts-nocheck
import type { Quote, QuoteSection, RiskItem, Extension, Discount } from "../types/quotation"
import type { CalculatedMotorVehicle, MotorVehicleUI } from "../types/motor-quotation"

// Rounding function as specified
export function round2(value: number): number {
  return Math.round(value * 100) / 100
}

// Calculate cover days (inclusive)
export function calculateCoverDays(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = end.getTime() - start.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays + 1 // Inclusive
}

// Calculate risk item totals
export function calculateRiskItemTotals(item: RiskItem, ourShare: number): RiskItem {
  const totalPremium = round2((item.totalSumInsured * item.rate) / 100)
  const ourShareSumInsured = round2((item.totalSumInsured * ourShare) / 100)
  const ourSharePremium = round2((totalPremium * ourShare) / 100)

  return {
    ...item,
    totalPremium,
    ourShareSumInsured,
    ourSharePremium,
  }
}

// Calculate section totals
export function calculateSectionTotals(section: QuoteSection, ourShare: number): QuoteSection {
  // Calculate cover days for section
  const coverDays = calculateCoverDays(section.sectionStartDate, section.sectionExpiryDate)

  // Calculate totals for each risk item
  const updatedItems = section.items.map((item) => calculateRiskItemTotals(item, ourShare))

  // Calculate aggregate values from risk items
  const aggregateSumInsured = updatedItems.reduce((sum, item) => sum + item.totalSumInsured, 0)
  const aggregatePremium = updatedItems.reduce((sum, item) => sum + item.totalPremium, 0)

  // Calculate extensions (loading)
  const updatedExtensions = section.extensions.map((ext) => ({
    ...ext,
    extensionAmount: round2((aggregatePremium * ext.extensionRate) / 100),
  }))

  const totalLoading =
    updatedExtensions.reduce((sum, ext) => sum + ext.extensionAmount, 0) +
    round2((aggregatePremium * section.otherLoading) / 100)

  const premiumAfterLoading = round2(aggregatePremium + totalLoading)

  // Calculate discounts
  const updatedDiscounts = section.discounts.map((disc) => ({
    ...disc,
    discountAmount: round2((premiumAfterLoading * disc.discountRate) / 100),
  }))

  const totalDiscount =
    updatedDiscounts.reduce((sum, disc) => sum + disc.discountAmount, 0) +
    round2((premiumAfterLoading * section.otherDiscount) / 100)

  const premiumDue = round2(premiumAfterLoading - totalDiscount)

  // Calculate pro-rata premium
  const proRataPremium = round2((premiumDue * coverDays) / 365)

  // Final section premium
  const sectionPremium = section.useFlatPremiumRate ? section.flatPremium : proRataPremium

  // Calculate our share amounts
  const ourShareSumInsured = round2((aggregateSumInsured * ourShare) / 100)
  const ourSharePremium = round2((sectionPremium * ourShare) / 100)

  return {
    ...section,
    coverDays,
    items: updatedItems,
    extensions: updatedExtensions,
    discounts: updatedDiscounts,
    aggregateSumInsured: round2(aggregateSumInsured),
    aggregatePremium: round2(aggregatePremium),
    totalLoading: round2(totalLoading),
    premiumAfterLoading: round2(premiumAfterLoading),
    totalDiscount: round2(totalDiscount),
    premiumDue: round2(premiumDue),
    proRataPremium: round2(proRataPremium),
    sectionPremium: round2(sectionPremium),
    ourShareSumInsured: round2(ourShareSumInsured),
    ourSharePremium: round2(ourSharePremium),
  }
}

// Calculate quote totals
export function calculateQuoteTotals(quote: Quote): Quote {
  const updatedSections = quote.sections.map((section) => calculateSectionTotals(section, quote.ourShare))

  const totalSumInsured = updatedSections.reduce((sum, section) => sum + section.aggregateSumInsured, 0)
  const totalNetPremium = updatedSections.reduce((sum, section) => sum + section.sectionPremium, 0)
  const quoteProRata = updatedSections.reduce((sum, section) => sum + section.proRataPremium, 0)

  return {
    ...quote,
    sections: updatedSections,
    totalSumInsured: round2(totalSumInsured),
    totalNetPremium: round2(totalNetPremium),
    quoteProRata: round2(quoteProRata),
  }
}

// Apply quote-level settings to all sections
export function applyQuoteToSections(quote: Quote): Quote {
  const updatedSections = quote.sections.map((section) => ({
    ...section,
    sectionStartDate: quote.startDate,
    sectionExpiryDate: quote.expiryDate,
  }))

  return {
    ...quote,
    sections: updatedSections,
  }
}

// Create default risk item
export function createDefaultRiskItem(itemNo: number): RiskItem {
  return {
    itemId: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    itemNo,
    riskSMI: "",
    itemDescription: "",
    totalSumInsured: 0,
    rate: 0,
    totalPremium: 0,
    stock: "No",
    ourShareSumInsured: 0,
    ourSharePremium: 0,
    section1: "",
    section2: "",
  }
}

// Create default extension
export function createDefaultExtension(): Extension {
  return {
    extensionId: `ext_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    nameDescription: "",
    extensionRate: 0,
    extensionAmount: 0,
  }
}

// Create default discount
export function createDefaultDiscount(): Discount {
  return {
    discountId: `disc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    nameDescription: "",
    discountRate: 0,
    discountAmount: 0,
  }
}

// Create default section
export function createDefaultSection(): QuoteSection {
  return {
    sectionId: `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    sectionName: "",
    riskLocation: "",
    sectionStartDate: "",
    sectionExpiryDate: "",
    coverDays: 0,
    useFlatPremiumRate: false,
    flatPremium: 0,
    uploadSpecificationDetails: false,
    otherLoading: 0,
    otherDiscount: 0,
    items: [createDefaultRiskItem(1)],
    extensions: [],
    discounts: [],
    aggregateSumInsured: 0,
    aggregatePremium: 0,
    totalLoading: 0,
    premiumAfterLoading: 0,
    totalDiscount: 0,
    premiumDue: 0,
    proRataPremium: 0,
    sectionPremium: 0,
    ourShareSumInsured: 0,
    ourSharePremium: 0,
  }
}

// Validate quote
export function validateQuote(quote: Quote): string[] {
  const errors: string[] = []

  if (!quote.quoteNumber.trim()) {
    errors.push("Quote number is required")
  }

  if (!quote.insuredName.trim()) {
    errors.push("Insured name is required")
  }

  if (!quote.startDate) {
    errors.push("Start date is required")
  }

  if (!quote.expiryDate) {
    errors.push("Expiry date is required")
  }

  if (quote.startDate && quote.expiryDate && new Date(quote.startDate) >= new Date(quote.expiryDate)) {
    errors.push("Expiry date must be after start date")
  }

  if (quote.ourShare < 0 || quote.ourShare > 100) {
    errors.push("Our share must be between 0 and 100")
  }

  if (quote.sections.length === 0) {
    errors.push("At least one section is required")
  }

  quote.sections.forEach((section, index) => {
    if (!section.sectionName.trim()) {
      errors.push(`Section ${index + 1}: Section name is required`)
    }

    if (section.items.length === 0) {
      errors.push(`Section ${index + 1}: At least one risk item is required`)
    }

    section.items.forEach((item, itemIndex) => {
      if (!item.itemDescription.trim()) {
        errors.push(`Section ${index + 1}, Item ${itemIndex + 1}: Item description is required`)
      }

      if (item.totalSumInsured <= 0) {
        errors.push(`Section ${index + 1}, Item ${itemIndex + 1}: Sum insured must be greater than 0`)
      }

      if (item.rate < 0) {
        errors.push(`Section ${index + 1}, Item ${itemIndex + 1}: Rate cannot be negative`)
      }
    })
  })

  return errors
}

/**
 * Converts a CalculatedMotorVehicle (from API response) to MotorVehicleUI format
 * This ensures both local and calculated vehicles use the same data structure
 */
export function parseCalculatedVehicleToUI(calculated: CalculatedMotorVehicle): MotorVehicleUI {
  return {
    itemNo: calculated.itemNo,
    vehicleRegNo: calculated.vehicleRegNo,
    vehicleUser: "", // Not provided in calculated response
    vehicleType: calculated.vehicleType,
    vehicleMake: "", // Not provided in calculated response
    vehicleModel: "", // Not provided in calculated response
    chassisNo: "", // Not provided in calculated response
    engineNo: "", // Not provided in calculated response
    color: "", // Not provided in calculated response
    modelYear: new Date().getFullYear(), // Not provided in calculated response
    coverType: calculated.coverType,
    usage: "", // Not provided in calculated response
    vehicleValue: calculated.vehicleValue,
    premiumRate: calculated.premiumRate,
    state: "", // Not provided in calculated response
    seatCapacity: 0, // Not provided in calculated response
    waxCode: "", // Not provided in calculated response
    location: "", // Not provided in calculated response
    startDate: new Date().toISOString().split("T")[0], // Not provided in calculated response
    endDate: new Date().toISOString().split("T")[0], // Not provided in calculated response
    trackingCost: 0, // Not provided in calculated response
    rescueCost: 0, // Not provided in calculated response
    discounts:
      calculated.step2_AfterDiscounts?.adjustments?.map((adj) => ({
        adjustmentName: adj.name,
        adjustmentType: adj.type,
        rate: adj.rate,
        appliedOn: "Premium" as const,
        baseAmount: calculated.step1_BasicPremium?.resultingAmount || 0,
        amount: adj.amount,
        sequenceOrder: adj.sequenceOrder,
        formula: adj.formula,
      })) || [],
    loadings:
      calculated.step3_AfterLoadings?.adjustments?.map((adj) => ({
        adjustmentName: adj.name,
        adjustmentType: adj.type,
        rate: adj.rate,
        appliedOn: "Premium" as const,
        baseAmount: calculated.step2_AfterDiscounts?.resultingAmount || 0,
        amount: adj.amount,
        sequenceOrder: adj.sequenceOrder,
        formula: adj.formula,
      })) || [],
    _collapsed: false,
    _showDetails: false,
    uiId: `vehicle_${calculated.itemNo}_${calculated.vehicleRegNo}`,
  }
}

/**
 * Converts an array of CalculatedMotorVehicles to MotorVehicleUI format
 */
export function parseCalculatedVehiclesToUI(calculated: CalculatedMotorVehicle[]): MotorVehicleUI[] {
  return calculated.map(parseCalculatedVehicleToUI)
}
