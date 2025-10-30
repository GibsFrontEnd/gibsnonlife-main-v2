//@ts-nocheck

import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch } from "../../../features/store"
import { useNavigate, useParams } from "react-router-dom"
import type { RootState } from "../../../features/store"
import {
  getProposalByNumber,
  calculateComplete,
  recalculateComplete,
  getCurrentCalculation,
  getCalculationBreakdown,
  getSectionsSummary,
  clearMessages,
  calculateMultiSectionAggregate,
  applyProposalAdjustments,
  calculateProRata,
} from "../../../features/reducers/quoteReducers/quotationSlice"
import { getAllProducts } from "../../../features/reducers/productReducers/productSlice"
import { Button } from "../../UI/new-button"
import Input from "../../UI/Input"
import { Label } from "../../UI/label"
import { AddSectionModal } from "../../Modals/AddSectionModal"
import type {
  QuoteSection,
  CompleteCalculationRequest,
  ProposalAdjustments,
  aggregateTotals,
} from "../../../types/quotation"
import "./QuoteCreator.css"
import { toast } from "@/components/UI/use-toast"

// helpers (unchanged)
const getLatestSectionSummaries = (rawSections: any[] | undefined) => {
  if (!Array.isArray(rawSections) || rawSections.length === 0) return []

  const map = new Map<string, any>()
  rawSections.forEach((s) => {
    const id = s.sectionID ?? JSON.stringify(s)
    const existing = map.get(id)
    const ts = s.lastCalculated ? Date.parse(s.lastCalculated) : 0
    const existingTs = existing && existing.lastCalculated ? Date.parse(existing.lastCalculated) : 0
    if (!existing || ts >= existingTs) map.set(id, s)
  })

  return Array.from(map.values())
}

const normalizeCalculationBreakdown = (raw: any) => {
  if (!raw) return null
  if (raw.calculationSteps?.sectionCalculations) return raw

  const inputSections = raw.inputs?.sectionInputs || raw.sectionInputs || []
  const sectionCalculations = (inputSections || []).map((s: any, idx: number) => {
    const items = (s.riskItems || []).map((ri: any, i: number) => ({
      itemNo: ri.itemNo ?? i + 1,
      smiCode: ri.smiCode,
      itemDescription: ri.itemDescription,
      actualValue: ri.actualValue ?? 0,
      itemRate: ri.itemRate ?? 0,
      actualPremium: ri.actualPremium ?? ri.premiumValue ?? 0,
      actualPremiumFormula: ri.actualPremiumFormula ?? ri.actualPremiumFormula,
      stockDiscountAmount: ri.stockDiscountAmount ?? 0,
      feaDiscountAmount: ri.feaDiscountAmount ?? 0,
      netPremiumAfterDiscounts: ri.netPremiumAfterDiscounts ?? 0,
      shareValue: ri.shareValue ?? 0,
      premiumValue: ri.premiumValue ?? 0,
      multiplyRate: ri.multiplyRate ?? 0,
      sectionId: ri.sectionId ?? s.sectionID,
      location: ri.location ?? s.location,
      __raw: ri,
    }))

    return {
      sectionID: s.sectionID ?? `section-${idx}`,
      sectionName: s.sectionName ?? s.sectionDisplayName ?? `Section ${idx + 1}`,
      location: s.location,
      riskItemCalculations: {
        items,
        totals: {
          totalActualValue: s.sectionSumInsured ?? items.reduce((a: number, it: any) => a + (it.actualValue || 0), 0),
          totalSharePremium:
            s.sectionGrossPremium ?? items.reduce((a: number, it: any) => a + (it.actualPremium || 0), 0),
          totalNetPremiumAfterDiscounts: s.sectionNetPremium ?? 0,
        },
      },
      sectionAdjustments: {
        startingPremium: s.sectionGrossPremium ?? 0,
        discountsApplied: s.discountsApplied || [],
        loadingsApplied: s.loadingsApplied || [],
        finalNetPremium: s.sectionNetPremium ?? 0,
      },
      __raw: s,
    }
  })

  const finalResults = raw.finalResults ?? {
    totalSumInsured: inputSections.reduce((acc: number, s: any) => acc + (s.sectionSumInsured || 0), 0),
    totalPremium: inputSections.reduce((acc: number, s: any) => acc + (s.sectionGrossPremium || 0), 0),
    netPremium: inputSections.reduce((acc: number, s: any) => acc + (s.sectionNetPremium || 0), 0),
  }

  return {
    ...raw,
    calculationSteps: {
      sectionCalculations,
      proRataCalculations: raw.inputs?.proRataCalculations ?? raw.proRataCalculations,
    },
    finalResults,
    inputs: raw.inputs ?? raw,
  }
}

const QuoteCreator = () => {
  const { proposalNo } = useParams<{ proposalNo: string }>()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()

  const {
    currentProposal,
    currentCalculation,
    calculationBreakdown,
    sectionsSummary: storeSectionsSummary,
    loading,
    success,
    error,
  } = useSelector((state: RootState) => state.quotations)
  const { products } = useSelector((state: RootState) => state.products)

  const [showAddSectionModal, setShowAddSectionModal] = useState(false)
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [adjCollapse, setAdjCollapse] = useState(true)
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false)

  const [adjustments, setAdjustments] = useState<any>({
    otherDiscountsRate: 0,
    otherLoadingsRate: 0,
  })

  const [remarks, setRemarks] = useState("")
  const [normalizedBreakdown, setNormalizedBreakdown] = useState<any | null>(null)
  const [aggregateTotals, setAggregateTotals] = useState<aggregateTotals | null>(null)
  const [sectionsLoading, setSectionsLoading] = useState(false)
  const [localSectionsSummary, setLocalSectionsSummary] = useState<any | null>(null)
  const [payloadSection, setPayloadSection] = useState<any[] | null>([])
  const [localSections, setLocalSections] = useState<QuoteSection[] | null>(null)
  const [calculatedRiskMap, setCalculatedRiskMap] = useState<Record<string, any[]>>({})
  const [editedSections, setEditedSections] = useState<number[]>([]);
  const [proposalAdjustmentsResult, setProposalAdjustmentsResult] = useState<any | null>(null)
  const [coverDays, setCoverDays] = useState<number>(365)
  const [proRataResult, setProRataResult] = useState<any | null>(null)

  const sectionsFetchIdRef = useRef(0)

  useEffect(() => {
    console.log(proposalNo);

    setLocalSections(null)
    setLocalSectionsSummary(null)
    setCalculatedRiskMap({})
    setProposalAdjustmentsResult(null)
    setProRataResult(null)
    setNormalizedBreakdown(null)
    setAggregateTotals(null)
    setShowDetailedBreakdown(false)
  }, [proposalNo])

  useEffect(() => {
    if (!proposalNo) return

    const fetchId = ++sectionsFetchIdRef.current
    setLocalSectionsSummary(null)
    setSectionsLoading(true)

    dispatch(getProposalByNumber(proposalNo) as any)
    dispatch(getCurrentCalculation(proposalNo) as any)
    dispatch(getCalculationBreakdown(proposalNo) as any)

    Promise.resolve(dispatch(getSectionsSummary(proposalNo) as any))
      .then((res: any) => {
        const payload = res?.payload
        if (!payload) return
        if (sectionsFetchIdRef.current === fetchId) {
          setLocalSectionsSummary(payload)
        }
      })
      .catch((err) => {
        console.error("getSectionsSummary failed:", err)
      })
      .finally(() => {
        if (sectionsFetchIdRef.current === fetchId) setSectionsLoading(false)
      })
  }, [dispatch, proposalNo])

  useEffect(() => {
    const sectionInputs = calculationBreakdown?.inputs?.sectionInputs
    console.log(sectionInputs);

    // If no section inputs, clear the sections
    if (!sectionInputs || sectionInputs.length === 0) {
      console.log("No section calculations found for proposal")
      setLocalSections([])
      return
    }

    const freshSections = sectionInputs.map((s: any) => ({
      sectionID: s.sectionID,
      sectionName: s.sectionName,
      location: s.location ?? "",
      sectionSumInsured: s.sectionSumInsured ?? 0,
      sectionPremium: s.sectionGrossPremium ?? 0,
      sectionNetPremium: s.sectionNetPremium ?? 0,
      riskItems: s.riskItems ?? [],
      lastCalculated: calculationBreakdown?.calculatedOn ?? null
    }))

    setLocalSections(freshSections)
  }, [calculationBreakdown])

  useEffect(() => {
    if (calculationBreakdown?.inputs?.proposalAdjustments) {
      setAdjustments({
        otherDiscountsRate: calculationBreakdown?.inputs?.proposalAdjustments.otherDiscountsRate || 0,
        otherLoadingsRate: calculationBreakdown?.inputs?.proposalAdjustments.otherLoadingsRate || 0,
      })
      if (currentCalculation?.remarks) setRemarks(currentCalculation.remarks)
    }

  }, [calculationBreakdown?.inputs?.proposalAdjustments])

  // initialize coverDays from currentProposal (if present)
  useEffect(() => {
    if (currentProposal && typeof currentProposal.proRataDays === "number") {
      const start = new Date(currentProposal.startDate)
      const end = new Date(currentProposal.endDate)
      const dayRange = Math.floor((Number(end) - Number(start)) / (1000 * 60 * 60 * 24))
      setCoverDays(dayRange)
    }
  }, [currentProposal])

  useEffect(() => {
    if (proposalNo) {
      const proposalProductId = currentProposal && currentProposal.riskID
      if (proposalProductId) {
        dispatch(
          getAllProducts({
            riskId: proposalProductId,
            pageNumber: 1,
            pageSize: 100,
          }) as any,
        )
      }
    }
  }, [dispatch, proposalNo, currentProposal])

  useEffect(() => {
    if (success?.calculate) dispatch(clearMessages() as any)
  }, [success?.calculate, dispatch])

  useEffect(() => {
    if (calculationBreakdown) {
      try {
        const normalized = normalizeCalculationBreakdown(calculationBreakdown)
        setNormalizedBreakdown(normalized)
      } catch (err) {
        console.error("Normalization failed:", err)
        setNormalizedBreakdown(null)
      }
    } else {
      setNormalizedBreakdown(null)
    }
  }, [calculationBreakdown])

  const proposalProductId = currentProposal && currentProposal.subRiskID
  const currentProduct = products.find((p) => p.productID === proposalProductId)

  const handleAddSection = () => {
    setEditingSectionId(null)
    setShowAddSectionModal(true)
  }

  const handleEditSection = (sectionId: string) => {
    setEditingSectionId(sectionId)
    setShowAddSectionModal(true)
  }

  // LOCAL-only save / delete logic
  const handleSaveSection = async (fullsection: any) => {
    const {
      specialDiscountRate,
      deductibleDiscountRate,
      spreadDiscountRate,
      ltaDiscountRate,
      theftLoadingRate,
      srccLoadingRate,
      otherLoading2Rate,
      ...section
    } = fullsection;

    // --- PAYLOAD SECTIONS ---
    setPayloadSection((prev) => {
      const list = prev ? [...prev] : [];
      if (editingSectionId == null) {                  // <-- check null/undefined directly
        list.push(fullsection);
      } else {
        setEditedSections(prev =>
          prev.includes(Number(editingSectionId)) ? prev : [...prev, Number(editingSectionId)]
        )
        const idx = Number(editingSectionId);
        if (!Number.isNaN(idx) && idx >= 0 && idx < list.length) {
          list[idx] = fullsection;
        } else {
          list.push(fullsection); // fallback
        }
      }
      return list;
    });

    // --- LOCAL SECTIONS ---
    setLocalSections((prev) => {
      const list = prev ? [...prev] : [];
      if (editingSectionId == null) {
        list.push(section);
      } else {
        const idx = Number(editingSectionId);
        if (!Number.isNaN(idx) && idx >= 0 && idx < list.length) {
          list[idx] = section;
        } else {
          list.push(section);
        }
      }
      return list;
    });

    // --- LOCAL SECTIONS SUMMARY ---
    setLocalSectionsSummary((prev: any) => {
      const copy = prev ? { ...prev } : { sections: [] };
      const sections = copy.sections ? [...copy.sections] : [];

      const summarySection = {
        sectionID: section.sectionID,
        sectionName: section.sectionName,
        location: section.location,
        sectionSumInsured: section.sectionSumInsured,
        sectionPremium: section.sectionPremium,
        riskItems: section.riskItems,
        lastCalculated: new Date().toISOString(),
      };

      if (editingSectionId == null) {
        sections.push(summarySection);
      } else {
        const idx = Number(editingSectionId);
        if (!Number.isNaN(idx) && idx >= 0 && idx < sections.length) {
          sections[idx] = summarySection;
        } else {
          sections.push(summarySection);
        }
      }

      copy.sections = sections;
      return copy;
    });

    setShowAddSectionModal(false);
    setEditingSectionId(null);
    calculateMultiSectionAggregateLocal();
  };

  const handleDeleteSection = async (sectionId: number) => {
    if (!window.confirm("Are you sure you want to delete this section?")) return
    setPayloadSection((prev) => (prev ? prev.filter((s, index: any) => index !== sectionId) : null))

    setLocalSections((prev) => (prev ? prev.filter((s, index) => index !== sectionId) : null))
    setLocalSectionsSummary((prev: any) => {
      if (!prev) return prev
      return { ...prev, sections: (prev.sections || []).filter((s: any, index) => index !== sectionId) }
    })
    setCalculatedRiskMap((m) => {
      const copy = { ...m }
      delete copy[sectionId]
      return copy
    })
  }

  // Receive full risk array from modal's "Calculate All"
  const handleReceiveFullRiskArray = (sectionID: string, fullRiskArray: any[]) => {
    setCalculatedRiskMap((prev) => ({ ...prev, [sectionID]: fullRiskArray }))

    const existsInLocalSections = !!(localSections && localSections.find((s) => s.sectionID === sectionID))
    const existsInSummary = !!(
      localSectionsSummary &&
      Array.isArray(localSectionsSummary.sections) &&
      localSectionsSummary.sections.find((s: any) => s.sectionID === sectionID)
    )

    if (existsInLocalSections) {
      setLocalSections((prev) => {
        if (!prev) return prev
        return prev.map((s) =>
          s.sectionID === sectionID ? { ...s, riskItems: fullRiskArray, lastCalculated: new Date().toISOString() } : s,
        )
      })
    }

    if (existsInLocalSections || existsInSummary) {
      setLocalSectionsSummary((prev: any) => {
        const copy = prev ? { ...prev } : { sections: [] }
        const sectionsArr = Array.isArray(copy.sections) ? [...copy.sections] : []
        const idx = sectionsArr.findIndex((s: any) => s.sectionID === sectionID)

        const updatedEntry = {
          ...(sectionsArr[idx] || {}),
          sectionID,
          riskItems: fullRiskArray,
          lastCalculated: new Date().toISOString(),
        }

        if (idx >= 0) sectionsArr[idx] = updatedEntry
        else sectionsArr.push(updatedEntry)

        return { ...copy, sections: sectionsArr }
      })
    }
  }

  // Build payload for multi-section aggregate (uses calculatedRiskMap when present)
  const buildMultiSectionPayload = () => {
    const authoritativeSections: any[] = localSections
      ? localSections
      : localSectionsSummary?.sections && localSectionsSummary.sections.length > 0
        ? localSectionsSummary.sections
        : [] // Changed from sections || [] to just []

    const sectionsForPayload = {
      adjustedSections: authoritativeSections.map((s) => ({
        sectionID: s.sectionID,
        sectionName: s.sectionName,
        sectionSumInsured: s.sectionSumInsured,
        sectionNetPremium: s.sectionNetPremium,
        riskItemCount: s.riskItems.length,
        location: s.location,
      })),
    }

    return { ...sectionsForPayload }
  }

  // POST to calculate multi-section aggregate and apply result locally (expects your sectionAggregates response)
  const calculateMultiSectionAggregateLocal = async () => {
    const authoritativeSections: any[] = localSections?.length
      ? localSections
      : localSectionsSummary?.sections?.length
        ? localSectionsSummary.sections
        : [] // Changed from sections || [] to just []

    if (!authoritativeSections || authoritativeSections.length === 0) {
      toast({
        description: "No sections available to aggregate.",
        variant: "info",
        duration: 2000,
      });

      return
    }

    const payload = buildMultiSectionPayload()

    try {
      // Dispatch your thunk instead of doing fetch here
      const resultAction = await dispatch(calculateMultiSectionAggregate(payload))

      if (calculateMultiSectionAggregate.rejected.match(resultAction)) {
        throw new Error(resultAction.payload || "Aggregate calculation failed")
      }
      setAggregateTotals(resultAction.payload)
      toast({
        description: "Multi-section aggregate totals calculated.",
        variant: "success",
        duration: 1000,
      });

    } catch (err: any) {
      toast({
        description: `Failed to calculate aggregate: ${err?.message ?? err}`,
        variant: "destructive",
        duration: 2000,
      });
      console.error("Aggregate calculation failed:", err)
    }
  }

  useEffect(() => {
    if (localSections?.length != undefined && localSections?.length > 0)
      calculateMultiSectionAggregateLocal();
  }, [localSections?.length])


  // Handler that dispatches applyProposalAdjustments and stores returned amounts locally
  const handleApplyProposalAdjustments = async () => {
    if (!proposalNo && !localSections) {
      // allow local-only operation; not strictly requiring proposalNo
      // but inform the user
      console.warn("Applying proposal adjustments locally (no proposalNo).")
    }

    const payload = {
      totalAggregatePremium: aggregateTotals?.totalAggregatePremium,
      otherDiscountsRate: adjustments.otherDiscountsRate,
      otherLoadingsRate: adjustments.otherLoadingsRate
    }

    try {
      // @ts-ignore
      const res =
        (await (dispatch(applyProposalAdjustments(payload)) as any).unwrap?.())
      // res expected shape from your curl:
      // {
      //  startingPremium,
      //  specialDiscountAmount,
      //  specialDiscountNetAmount,
      //  ...
      //  netPremiumDue,
      //  success,
      //  message
      // }
      setProposalAdjustmentsResult(res || null)

      // refresh breakdown if we have a proposalNo so UI matches server state (optional)
      if (proposalNo) {
        await dispatch(getCalculationBreakdown(proposalNo) as any)
      }
      toast({
        description: "Proposal adjustments applied.",
        variant: "success",
        duration: 2000,
      });
    } catch (err: any) {
      console.error("applyProposalAdjustments failed:", err)
      toast({
        description: "Failed to apply proposal adjustments",
        variant: "destructive",
        duration: 2000,
      });
    }
  }
  const netPremium = proposalAdjustmentsResult?.netPremiumDue || calculationBreakdown?.calculationSteps?.proRataCalculations.netPremiumBeforeProRata
  useEffect(() => {
    if (netPremium)
      handleCalculateProRata();
  }, [])

  const handleCalculateProRata = async () => {
    if (!netPremium || Number(netPremium) <= 0) {
      toast({
        description: "No net premium available to pro-rate. Run proposal adjustments or a calculation first.",
        variant: "warning",
        duration: 2000,
      });

      return
    }

    const payload = {
      netPremiumDue: Number(netPremium),
      coverDays: Number(coverDays || 0),
    }
    console.log(payload);

    try {
      // @ts-ignore
      const res = (await (dispatch(calculateProRata(payload)) as any).unwrap?.())
      setProRataResult(res || null)

      // optionally refresh breakdown if server persisted something
      if (proposalNo) {
        await dispatch(getCalculationBreakdown(proposalNo) as any)
      }
      toast({
        description: "Pro-rata calculation complete.",
        variant: "success",
        duration: 2000,
      });

    } catch (err: any) {
      console.error("calculateProRata failed:", err)
      toast({
        description: "Failed to calculate pro-rata.",
        variant: "destructive",
        duration: 2000,
      });
    }
  }


  const handleCalculate = async () => {
    if (!proposalNo || !currentProposal) return
    const sectionsToCalculate = payloadSection?.map(({ lastCalculated, proportionRate, ...rest }) => ({
      ...rest,
      riskItems: (rest.riskItems || []).map(({
        actualPremium,
        actualPremiumFormula,
        shareValue,
        shareValueFormula,
        premiumValue,
        premiumValueFormula,
        stockDiscountAmount,
        feaDiscountAmount,
        netPremiumAfterDiscounts,
        _showStock,
        _collapsed,
        ...riskRest
      }) => riskRest)
    }));
    console.log(editedSections);

    const breakdownSections = (calculationBreakdown?.inputs?.sectionInputs || []).filter((si: any, index) => !editedSections.includes(index)).map((si: any) => {

      return {
        sectionID: si.sectionID ?? si.sectionId ?? "",
        sectionName: si.sectionName ?? "",
        location: si.location ?? "",
        sectionSumInsured: si.sectionSumInsured ?? 0,
        // match payload shape: sectionPremium is gross/premium from breakdown
        sectionPremium: si.sectionGrossPremium ?? si.sectionPremium ?? 0,
        sectionNetPremium: si.sectionNetPremium ?? 0,
        // preserve existing timestamp if available otherwise set now
        lastCalculated: new Date().toISOString(),
        // preserve existing proportionRate if available otherwise fallback to currentProposal or 0
        proportionRate: currentProposal?.proportionRate ?? 0,

        // riskItems mapped to exact payload item shape (including UI flags & totals)
        riskItems: (si.riskItems || []).map((it: any) => ({
          itemNo: it.itemNo ?? 0,
          sectionID: it.sectionID ?? it.sectionId ?? si.sectionID ?? "",
          smiCode: it.smiCode ?? "",
          itemDescription: it.itemDescription ?? "",
          actualValue: it.actualValue ?? 0,
          itemRate: it.itemRate ?? 0,
          multiplyRate: it.multiplyRate ?? 1,
          location: it.location ?? si.location ?? "",
          feaDiscountRate: it.feaDiscountRate ?? 0,

          // premium-related fields (keep formulas if present)
          actualPremium: it.actualPremium ?? 0,
          actualPremiumFormula: it.actualPremiumFormula ?? "",
          shareValue: it.shareValue ?? 0,
          shareValueFormula: it.shareValueFormula ?? "",
          premiumValue: it.premiumValue ?? 0,
          premiumValueFormula: it.premiumValueFormula ?? "",

          // stock/discount amounts and net premium
          stockDiscountAmount: it.stockDiscountAmount ?? 0,
          feaDiscountAmount: it.feaDiscountAmount ?? 0,
          netPremiumAfterDiscounts: it.netPremiumAfterDiscounts ?? it.stockNetPremium ?? 0,

          stockItem: it.stockItem ?? null,

          // UI flags exactly like your payload uses
          _showStock: !!it.stockItem,
          _collapsed: false,

          // try to preserve totalSumInsured if present or compute a reasonable fallback
          totalSumInsured: it.totalSumInsured ?? it.stockSumInsured ?? (it.actualValue ? it.actualValue * (it.multiplyRate ?? 1) : 0)
        })),

        // section-level rates: look into sectionAdjustments for rates first, else fallback to 0 or si fields
        specialDiscountRate: si.sectionAdjustments?.discountsApplied?.find((d: any) => d.name === "Special Discount")?.rate ?? si.specialDiscountRate ?? 0,
        deductibleDiscountRate: si.sectionAdjustments?.discountsApplied?.find((d: any) => d.name === "Deductible Discount")?.rate ?? si.deductibleDiscountRate ?? 0,
        spreadDiscountRate: si.sectionAdjustments?.discountsApplied?.find((d: any) => d.name === "Spread Discount")?.rate ?? si.spreadDiscountRate ?? 0,
        ltaDiscountRate: si.sectionAdjustments?.discountsApplied?.find((d: any) => d.name === "LTA Discount")?.rate ?? si.ltaDiscountRate ?? 0,
        otherDiscountsRate: si.otherDiscountsRate ?? 0,
        theftLoadingRate: si.sectionAdjustments?.loadingsApplied?.find((d: any) => d.name === "Theft Loading")?.rate ?? si.theftLoadingRate ?? 0,
        srccLoadingRate: si.sectionAdjustments?.loadingsApplied?.find((d: any) => d.name === "SRCC Loading")?.rate ?? si.srccLoadingRate ?? 0,
        otherLoading2Rate: si.sectionAdjustments?.loadingsApplied?.find((d: any) => d.name === "Other Loading 2")?.rate ?? si.otherLoading2Rate ?? 0,
      };
    });

    const finalSectionsToCalculate = [
      ...(breakdownSections || []),
      ...(sectionsToCalculate || [])
    ];

    console.log(breakdownSections);
    console.log(sectionsToCalculate);

    console.log(finalSectionsToCalculate);

    const calculationRequest: CompleteCalculationRequest = {
      proposalNo,
      sections: finalSectionsToCalculate, // Use local sections
      proportionRate: currentProposal.proportionRate,
      exchangeRate: currentProposal.exRate,
      currency: currentProposal.exCurrency,
      coverDays: coverDays || 365,
      ...adjustments,
      calculatedBy: "SYSTEM",
      remarks,
    }
    console.log("full calculation request");

    console.log(calculationRequest);


    try {
      if (currentCalculation) {
        console.log("recalc");

        // @ts-ignore
        await (dispatch(recalculateComplete({ proposalNo, calculationData: calculationRequest }) as any).unwrap?.() ??
          dispatch(recalculateComplete({ proposalNo, calculationData: calculationRequest }) as any))
      } else {
        console.log("calc");
        // @ts-ignore
        await (dispatch(calculateComplete({ proposalNo, calculationData: calculationRequest }) as any).unwrap?.() ??
          dispatch(calculateComplete({ proposalNo, calculationData: calculationRequest }) as any))
      }

      await dispatch(getCalculationBreakdown(proposalNo) as any)

      // re-fetch sections summary safely
      const fetchId = ++sectionsFetchIdRef.current
      setSectionsLoading(true)
      await Promise.resolve(dispatch(getSectionsSummary(proposalNo) as any))
        .then((res: any) => {
          const payload = res?.payload ?? res
          if (payload && sectionsFetchIdRef.current === fetchId) setLocalSectionsSummary(payload)
        })
        .catch(() => { })
        .finally(() => {
          if (sectionsFetchIdRef.current === fetchId) setSectionsLoading(false)
        })
    } catch (err) {
      console.error("Calculation failed:", err)
      toast({
        description: "Calculation failed. See console for details.",
        variant: "destructive",
        duration: 2000,
      });
    }
  }

  const handleCancel = () => {
    navigate(`/quotations/edit/${proposalNo}`)
  }

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return "N/A"
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount)
  }

  if (loading?.fetchProposals || !currentProposal) {
    return <div className="qc-container qc-loading">Loading proposal...</div>
  }

  const breakdown = normalizedBreakdown || calculationBreakdown

  return (
    <div className="qc-container">
      <div className="qc-header">
        <div>
          <h1>Quote Creator</h1>
          <p className="qc-proposal-info">
            Proposal: {currentProposal.proposalNo} | Product: {currentProduct?.productName || "N/A"}
          </p>
        </div>
        <div className="qc-header-actions">
          <Button onClick={handleCancel} variant="outline">
            Back to Proposal
          </Button>
          <Button
            onClick={handleCalculate}
            disabled={loading?.calculate || !localSections || localSections.length === 0}
          >
            {loading?.calculate ? "Calculating..." : currentCalculation ? "Recalculate" : "Calculate"}
          </Button>
        </div>
      </div>

      {error?.calculate && <div className="qc-error-message">{error.calculate}</div>}
      {success?.calculate && <div className="qc-success-message">Calculation completed successfully!</div>}

      <div className="qc-content">
        {/* Sections Panel */}
        <div className="qc-sections-panel">
          <div className="qc-sections-header">
            <h3>
              Sections (
              {localSectionsSummary?.sections && localSectionsSummary.length > 0
                ? getLatestSectionSummaries(localSectionsSummary).length
                : (localSections && localSections.length) || 0}
              {/* Removed sections.length fallback */})
            </h3>
            <Button onClick={handleAddSection} size="sm">
              Add Section
            </Button>
          </div>

          {(() => {
            const summaryList = localSectionsSummary?.sections ? getLatestSectionSummaries(localSectionsSummary) : null
            const listToRender =
              localSections && localSections.length > 0
                ? localSections
                : summaryList && summaryList.length > 0
                  ? summaryList
                  : [] // Changed from sections to []

            if (sectionsLoading) {
              return (
                <div className="qc-no-sections qc-loading-sections">
                  <p>Loading sections…</p>
                </div>
              )
            }

            if (!listToRender || listToRender.length === 0) {
              return (
                <div className="qc-no-sections">
                  <p>No sections added yet. Click "Add Section" to begin.</p>
                </div>
              )
            }

            // --- TABLE UI START ---
            return (
              <div className="qc-sections-table-wrap">
                <table className="qc-sections-table" role="table" aria-label="Sections">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Section Name</th>
                      <th>Location</th>
                      <th>Sum Insured</th>
                      <th>Premium</th>
                      <th>Last Calculated</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listToRender.map((section: any, index) => {
                      const id = index
                      const name = section.sectionName ?? "Unnamed Section"
                      const location = section.location ?? ""
                      /* const itemCount = (calculatedRiskMap[id] ?? section.riskItemCount ?? section.riskItems?.length ?? 0) || 0 */
                      const sumInsured = section.sectionSumInsured ?? section.sectionSumInsured ?? 0
                      const premium = section.sectionGrossPremium ?? section.sectionPremium ?? 0
                      const lastCalc = section.lastCalculated ?? null

                      return (
                        <tr key={id} className="qc-section-row">
                          <td>{index + 1}</td>
                          <td>{name}</td>
                          <td>{location || "N/A"}</td>
                          <td>{formatCurrency(sumInsured)}</td>
                          <td>{formatCurrency(premium)}</td>
                          <td>{lastCalc ? new Date(lastCalc).toLocaleString() : "—"}</td>
                          <td>
                            <div style={{ display: "flex", gap: 8 }}>
                              <Button onClick={() => handleEditSection(String(index))} size="sm" variant="outline">
                                Edit
                              </Button>
                              <Button
                                onClick={() => handleDeleteSection(id)}
                                size="sm"
                                variant="outline"
                                className="qc-delete-btn"
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )
            // --- TABLE UI END ---
          })()}

          {aggregateTotals && (
            <>
              <br />
              <div className="qc-sections-summary">
                <h3>Sections Totals</h3>

                <div className="qc-results-grid">
                  <div className="qc-result-item">
                    <Label>Total Sum Insured</Label>
                    <div className="qc-result-value">{formatCurrency(aggregateTotals.totalSumInsured)}</div>
                  </div>
                  <div className="qc-result-item">
                    <Label>Total Aggregate Premium</Label>
                    <div className="qc-result-value">{formatCurrency(aggregateTotals?.totalAggregatePremium)}</div>
                  </div>
                  <div className="qc-result-item">
                    <Label>Section Count</Label>
                    <div className="qc-result-value">{aggregateTotals?.sectionCount}</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Adjustments panel */}
        <div className="qc-adjustments-panel">
          <h3 style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Proposal Adjustments</span>
            <button
              className="link-btn"
              onClick={() => setAdjCollapse(!adjCollapse)}
              aria-label={adjCollapse ? "Expand item" : "Collapse item"}
            >
              {adjCollapse ? "Expand ▾" : "Collapse ▴"}
            </button>
          </h3>
          {!adjCollapse &&
            <div className="qc-adjustments-grid">
              <div className="qc-adjustment-section">
                <h4>Discounts</h4>
                <div className="qc-adjustment-field">
                  <Label htmlFor="otherDiscountsRate">Other Discounts (%)</Label>
                  <Input
                    id="otherDiscountsRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={adjustments.otherDiscountsRate}
                    onChange={(e) => setAdjustments((prev) => ({ ...prev, otherDiscountsRate: Number(e.target.value) }))}
                  />
                </div>
                <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <Label htmlFor="coverDaysSmall">Cover Days</Label>
                  <Input
                    id="coverDaysSmall"
                    type="number"
                    min="0"
                    step="1"
                    value={coverDays}
                    onChange={(e) => setCoverDays(Number(e.target.value || 0))}
                    style={{ width: 120 }}
                    disabled
                  />
                  <div style={{ fontSize: 12, color: "#666" }}>Used for pro-rata calculation</div>
                </div>

              </div>

              <div className="qc-adjustment-section">
                <h4>Loadings</h4>
                <div className="qc-adjustment-field">
                  <Label htmlFor="otherLoadingsRate">Other Loadings (%)</Label>
                  <Input
                    id="otherLoadingsRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={adjustments.otherLoadingsRate}
                    onChange={(e) => setAdjustments((prev) => ({ ...prev, otherLoadingsRate: Number(e.target.value) }))}
                  />
                </div>
                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                  <Button onClick={handleApplyProposalAdjustments} size="sm" variant="outline">
                    Apply Proposal Adjustments
                  </Button>
                  {/*             <Button onClick={handleApplyAndCalculate} size="sm">
              Apply & Calculate Proposal
            </Button>
 */}{" "}
                  <Button onClick={handleCalculateProRata} size="sm" variant="outline">
                    Calculate Pro-Rata
                  </Button>
                  {/*             <Button onClick={handleProRataAndCalculate} size="sm">
              Pro-Rata & Calculate Proposal
            </Button>
 */}{" "}
                </div>

              </div>
            </div>
          }
          {/* Show proposal-adjustments response (if present) */}
          {(calculationBreakdown?.calculationSteps?.proposalAdjustments?.discountsApplied.length > 0 || calculationBreakdown?.calculationSteps?.proposalAdjustments?.loadingsApplied.length > 0 || proposalAdjustmentsResult) && (
            <div className="proposal-adjustments-card">
              <div className="card-header">
                <h4>Proposal Adjustments</h4>
                <span className="badge success">Applied</span>
              </div>

              <div className="card-body two-column">
                <div className="summary-column">
                  <div className="summary-row">
                    <div className="label">Starting Premium</div>
                    <div className="value">{formatCurrency(proposalAdjustmentsResult?.startingPremium || calculationBreakdown?.calculationSteps?.proposalAdjustments?.startingPremium || 0)}</div>
                  </div>

                  <div className="summary-row">
                    <div className="label">Net Premium Due</div>
                    <div className="value highlight">{formatCurrency(proposalAdjustmentsResult?.netPremiumDue || calculationBreakdown?.calculationSteps?.proposalAdjustments?.finalNetPremium || 0)}</div>
                  </div>

                  <div className="divider" />

                  <div className="mini-grid">
                    <div className="mini-item">
                      <div className="mini-label">Other Discounts</div>
                      <div className="mini-value">{formatCurrency(proposalAdjustmentsResult?.otherDiscountsAmount || calculationBreakdown?.calculationSteps?.proposalAdjustments?.discountsApplied[0]?.amount || 0)}</div>
                      <div className="mini-value">Net Amount:{formatCurrency(proposalAdjustmentsResult?.otherDiscountsNetAmount || 0)}</div>
                    </div>
                  </div>
                </div>

                <div className="summary-column">
                  <div className="section-title">Loadings</div>
                  <div className="mini-grid">
                    <div className="mini-item">
                      <div className="mini-label">Other Loadings</div>
                      <div className="mini-value">{formatCurrency(proposalAdjustmentsResult?.otherLoadingsAmount || calculationBreakdown?.calculationSteps?.proposalAdjustments?.loadingsApplied[0]?.amount || 0)}</div>
                      <div className="mini-value">Net Amount:{formatCurrency(proposalAdjustmentsResult?.otherLoadingsNetAmount || 0)}</div>
                    </div>
                  </div>

                  <div className="divider" />

                  <div className="footer-note">
                    <small className="muted">
                      {proposalAdjustmentsResult?.message ?? "Proposal-level adjustments applied."}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Show Pro-Rata result (if present) */}
          {(calculationBreakdown?.calculationSteps?.proRataCalculations || proRataResult) && (
            <div className="pro-rata-card">
              <div className="card-header">
                <h4>Pro-Rata</h4>
                <span className={`badge ${(proRataResult?.isProRated || calculationBreakdown?.calculationSteps?.proRataCalculations.isProRated) ? "info" : "muted"}`}>
                  {(proRataResult?.isProRated || calculationBreakdown?.calculationSteps?.proRataCalculations.isProRated) ? "Pro-Rated" : "Not Pro-Rated"}
                </span>
              </div>

              <div className="card-body pro-rata-grid">
                <div className="pr-row">
                  <div className="pr-label">Base Net Premium</div>
                  <div className="pr-value">{(formatCurrency(proRataResult?.netPremiumDue || calculationBreakdown?.calculationSteps?.proRataCalculations.netPremiumBeforeProRata || 0))}</div>
                </div>

                <div className="pr-row">
                  <div className="pr-label">Pro-Rata Premium</div>
                  <div className="pr-value">{(formatCurrency(proRataResult?.proRataPremium || calculationBreakdown?.calculationSteps?.proRataCalculations.proRataPremium || 0))}</div>
                </div>

                <div className="pr-row">
                  <div className="pr-label">Premium Due</div>
                  <div className="pr-value">
                    {formatCurrency((proRataResult?.premiumDue || calculationBreakdown?.calculationSteps?.proRataCalculations.finalPremiumDue || 0))}
                  </div>
                </div>

                <div className="pr-row">
                  <div className="pr-label">Cover Days</div>
                  <div className="pr-value">{proRataResult?.coverDays ?? coverDays ?? "—"}</div>
                </div>
              </div>
            </div>
          )}
        </div>
        <Button
          onClick={handleCalculate}
          disabled={loading?.calculate || !localSections || localSections.length === 0}
        >
          {loading?.calculate ? "Calculating..." : currentCalculation ? "Save Details" : "Update Details"}
        </Button>

        {/* Calculation results & breakdown */}
        {currentCalculation && (
          <div className="qc-calculation-results">
            <div className="qc-results-header">
              <h3>Calculation Results</h3>
              {breakdown && (
                <Button onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)} variant="outline" size="sm">
                  {showDetailedBreakdown ? "Show Summary" : "Show Detailed Breakdown"}
                </Button>
              )}
            </div>

            {!showDetailedBreakdown ? (
              <>
                <div className="qc-results-grid">
                  <div className="qc-result-item">
                    <Label>Total Sum Insured</Label>
                    <div className="qc-result-value">{formatCurrency(currentCalculation.totalSumInsured)}</div>
                  </div>
                  <div className="qc-result-item">
                    <Label>Total Premium</Label>
                    <div className="qc-result-value">{formatCurrency(currentCalculation.totalPremium)}</div>
                  </div>
                  <div className="qc-result-item">
                    <Label>Net Premium</Label>
                    <div className="qc-result-value">{formatCurrency(currentCalculation.netPremium)}</div>
                  </div>
                  <div className="qc-result-item">
                    <Label>Pro-Rata Premium</Label>
                    <div className="qc-result-value">{formatCurrency(currentCalculation.proRataPremium)}</div>
                  </div>
                  <div className="qc-result-item">
                    <Label>Share Sum Insured</Label>
                    <div className="qc-result-value">{formatCurrency(currentCalculation.shareSumInsured)}</div>
                  </div>
                  <div className="qc-result-item">
                    <Label>Share Premium</Label>
                    <div className="qc-result-value">{formatCurrency(currentCalculation.sharePremium)}</div>
                  </div>
                </div>

                {localSectionsSummary == [] && localSectionsSummary.length > 0 && (
                  <div className="qc-sections-summary">
                    <h4>Sections Summary</h4>
                    <div className="qc-sections-summary-table card-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Section</th>
                            <th className="right">Sum Insured</th>
                            <th className="right">Gross Premium</th>
                            <th className="right">Net Premium</th>
                            <th className="center">Last Calculated</th>
                          </tr>
                        </thead>
                        <tbody>
                          {localSectionsSummary.map((section: any) => (
                            <tr key={section.sectionID}>
                              <td>
                                <div className="section-name">{section.sectionName}</div>
                                <div className="muted small">{section.location || "—"}</div>
                              </td>
                              <td className="right">{formatCurrency(section.sectionSumInsured)}</td>
                              <td className="right">{formatCurrency(section.sectionGrossPremium)}</td>
                              <td className="right highlight">
                                {formatCurrency(section.netPremium ?? section.sectionNetPremium ?? 0)}
                              </td>
                              <td className="center">
                                {section.lastCalculated ? new Date(section.lastCalculated).toLocaleString() : "N/A"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                {currentCalculation.validationErrors && currentCalculation.validationErrors.length > 0 && (
                  <div className="qc-validation-errors">
                    <h4>Validation Issues:</h4>
                    <ul>
                      {currentCalculation.validationErrors.map((err: any, idx: number) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              breakdown && (
                <div className="qc-detailed-breakdown">
                  {/* Calculation Metadata */}
                  <div className="qc-breakdown-section">
                    <h4>Calculation Information</h4>
                    <div className="qc-info-grid">
                      <div className="qc-info-item">
                        <Label>Calculated On</Label>
                        <div className="qc-info-value">
                          {breakdown.calculatedOn ? new Date(breakdown.calculatedOn).toLocaleString() : "N/A"}
                        </div>
                      </div>
                      <div className="qc-info-item">
                        <Label>Calculated By</Label>
                        <div className="qc-info-value">{breakdown.calculatedBy || "N/A"}</div>
                      </div>
                      <div className="qc-info-item">
                        <Label>Type</Label>
                        <div className="qc-info-value">{breakdown.calculationType || "N/A"}</div>
                      </div>
                    </div>
                  </div>

                  {/* Show inputs if present */}
                  {breakdown.inputs && (
                    <div className="qc-breakdown-section">
                      <h4>Calculation Inputs</h4>
                      <div className="qc-info-grid">
                        <div className="qc-info-item">
                          <Label>Proportion Rate</Label>
                          <div className="qc-info-value">{breakdown.inputs.proportionRate ?? "N/A"}%</div>
                        </div>
                        <div className="qc-info-item">
                          <Label>Exchange Rate</Label>
                          <div className="qc-info-value">{breakdown.inputs.exchangeRate ?? "N/A"}</div>
                        </div>
                        <div className="qc-info-item">
                          <Label>Currency</Label>
                          <div className="qc-info-value">{breakdown.inputs.currency ?? "N/A"}</div>
                        </div>
                        <div className="qc-info-item">
                          <Label>Cover Days</Label>
                          <div className="qc-info-value">{breakdown.inputs.coverDays ?? "N/A"}</div>
                        </div>
                        <div className="qc-info-item">
                          <Label>Start</Label>
                          <div className="qc-info-value">
                            {breakdown.inputs.startDate ? new Date(breakdown.inputs.startDate).toLocaleString() : "N/A"}
                          </div>
                        </div>
                        <div className="qc-info-item">
                          <Label>End</Label>
                          <div className="qc-info-value">
                            {breakdown.inputs.endDate ? new Date(breakdown.inputs.endDate).toLocaleString() : "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Section Calculations */}
                  {breakdown.calculationSteps?.sectionCalculations?.map((sectionCalc: any) => (
                    <div key={sectionCalc.sectionID} className="qc-breakdown-section">
                      <h4>Section: {sectionCalc.sectionName}</h4>

                      {/* Risk Items */}
                      <div className="qc-items-breakdown">
                        <h5>Risk Items Calculation</h5>
                        <div className="qc-items-table">
                          <table>
                            <thead>
                              <tr>
                                <th>Item</th>
                                <th>Description</th>
                                <th>Actual Value</th>
                                <th>Rate</th>
                                <th>Formula</th>
                                <th>Premium</th>
                                <th>Discounts</th>
                                <th>Net Premium</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sectionCalc.riskItemCalculations?.items?.map((item: any) => (
                                <tr key={`${item.smiCode || ""}-${item.itemNo}`}>
                                  <td>{item.itemNo}</td>
                                  <td>{item.itemDescription}</td>
                                  <td>{formatCurrency(item.actualValue)}</td>
                                  <td>{item.itemRate !== undefined ? `${item.itemRate}%` : "N/A"}</td>
                                  <td className="qc-formula-cell">{item.actualPremiumFormula}</td>
                                  <td>{formatCurrency(item.actualPremium)}</td>
                                  <td>
                                    {item.stockDiscountAmount > 0 && (
                                      <div>Stock: {formatCurrency(item.stockDiscountAmount)}</div>
                                    )}
                                    {item.feaDiscountAmount > 0 && (
                                      <div>FEA: {formatCurrency(item.feaDiscountAmount)}</div>
                                    )}
                                  </td>
                                  <td className="qc-highlight">{formatCurrency(item.netPremiumAfterDiscounts)}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="qc-totals-row">
                                <td colSpan={2}>
                                  <strong>Section Totals</strong>
                                </td>
                                <td>
                                  <strong>
                                    {formatCurrency(sectionCalc.riskItemCalculations?.totals?.totalActualValue || 0)}
                                  </strong>
                                </td>
                                <td></td>
                                <td></td>
                                <td>
                                  <strong>
                                    {formatCurrency(sectionCalc.riskItemCalculations?.totals?.totalSharePremium || 0)}
                                  </strong>
                                </td>
                                <td></td>
                                <td className="qc-highlight">
                                  <strong>
                                    {formatCurrency(
                                      sectionCalc.riskItemCalculations?.totals?.totalNetPremiumAfterDiscounts || 0,
                                    )}
                                  </strong>
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>

                      {/* Section Adjustments */}
                      {sectionCalc.sectionAdjustments && (
                        <div className="qc-section-adjustments">
                          <h5>Section Adjustments</h5>
                          <div className="qc-adjustments-flow">
                            <div className="qc-adjustment-step">
                              <Label>Starting Premium</Label>
                              <div className="qc-value">
                                {formatCurrency(sectionCalc.sectionAdjustments.startingPremium)}
                              </div>
                            </div>
                            {sectionCalc.sectionAdjustments.loadingsApplied?.map((loading: any, idx: number) => (
                              <div key={idx} className="qc-adjustment-step qc-loading">
                                <Label>{loading.name}</Label>
                                <div className="qc-value">+{formatCurrency(loading.amount)}</div>
                              </div>
                            ))}
                            {sectionCalc.sectionAdjustments.discountsApplied?.map((discount: any, idx: number) => (
                              <div key={idx} className="qc-adjustment-step qc-discount">
                                <Label>{discount.name}</Label>
                                <div className="qc-value">-{formatCurrency(discount.amount)}</div>
                              </div>
                            ))}

                            <div className="qc-adjustment-step qc-final">
                              <Label>Final Net Premium</Label>
                              <div className="qc-value qc-highlight">
                                {formatCurrency(sectionCalc.sectionAdjustments.finalNetPremium)}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Pro-Rata Calculation */}
                  {breakdown.calculationSteps?.proRataCalculations && (
                    <div className="qc-breakdown-section">
                      <h4>Pro-Rata Calculation</h4>
                      <div className="qc-prorata-detail">
                        <div className="qc-prorata-row">
                          <Label>Net Premium Before Pro-Rata</Label>
                          <div className="qc-value">
                            {formatCurrency(breakdown.calculationSteps.proRataCalculations.netPremiumBeforeProRata)}
                          </div>
                        </div>
                        <div className="qc-prorata-row">
                          <Label>Cover Days</Label>
                          <div className="qc-value">
                            {breakdown.calculationSteps.proRataCalculations.coverDays} days
                          </div>
                        </div>
                        <div className="qc-prorata-row">
                          <Label>Standard Days</Label>
                          <div className="qc-value">
                            {breakdown.calculationSteps.proRataCalculations.standardDays} days
                          </div>
                        </div>
                        <div className="qc-prorata-row">
                          <Label>Pro-Rata Factor</Label>
                          <div className="qc-value">{breakdown.calculationSteps.proRataCalculations.proRataFactor}</div>
                        </div>
                        <div className="qc-prorata-row qc-formula">
                          <Label>Formula</Label>
                          <div className="qc-value">
                            {breakdown.calculationSteps.proRataCalculations.proRataFormula}
                          </div>
                        </div>
                        <div className="qc-prorata-row qc-final">
                          <Label>Final Premium Due</Label>
                          <div className="qc-value qc-highlight">
                            {formatCurrency(breakdown.calculationSteps.proRataCalculations.finalPremiumDue)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Final Results Summary */}
                  {breakdown.finalResults && (
                    <div className="qc-breakdown-section qc-final-results">
                      <h4>Final Results Summary</h4>
                      <div className="qc-results-grid">
                        <div className="qc-result-item">
                          <Label>Total Sum Insured</Label>
                          <div className="qc-result-value">
                            {formatCurrency(breakdown.finalResults.totalSumInsured)}
                          </div>
                        </div>
                        <div className="qc-result-item">
                          <Label>Total Premium</Label>
                          <div className="qc-result-value">{formatCurrency(breakdown.finalResults.totalPremium)}</div>
                        </div>
                        <div className="qc-result-item">
                          <Label>Net Premium</Label>
                          <div className="qc-result-value">{formatCurrency(breakdown.finalResults.netPremium)}</div>
                        </div>
                        <div className="qc-result-item">
                          <Label>Pro-Rata Premium</Label>
                          <div className="qc-result-value">{formatCurrency(breakdown.finalResults.proRataPremium)}</div>
                        </div>
                        <div className="qc-result-item">
                          <Label>Share Sum Insured</Label>
                          <div className="qc-result-value">
                            {formatCurrency(breakdown.finalResults.shareSumInsured)}
                          </div>
                        </div>
                        <div className="qc-result-item">
                          <Label>Share Premium</Label>
                          <div className="qc-result-value">{formatCurrency(breakdown.finalResults.sharePremium)}</div>
                        </div>
                        <div className="qc-result-item">
                          <Label>Foreign Sum Insured</Label>
                          <div className="qc-result-value">
                            {formatCurrency(breakdown.finalResults.foreignSumInsured)}{" "}
                            {breakdown.finalResults.foreignCurrency}
                          </div>
                        </div>
                        <div className="qc-result-item">
                          <Label>Foreign Premium</Label>
                          <div className="qc-result-value">
                            {formatCurrency(breakdown.finalResults.foreignPremium)}{" "}
                            {breakdown.finalResults.foreignCurrency}
                          </div>
                        </div>
                        <div className="qc-result-item">
                          <Label>Overall Premium Rate</Label>
                          <div className="qc-result-value">
                            {breakdown.finalResults.overallPremiumRate?.toFixed(4)}%
                          </div>
                        </div>
                        <div className="qc-result-item">
                          <Label>Effective Discount Rate</Label>
                          <div className="qc-result-value">
                            {breakdown.finalResults.effectiveDiscountRate?.toFixed(2)}%
                          </div>
                        </div>
                        <div className="qc-result-item">
                          <Label>Effective Loading Rate</Label>
                          <div className="qc-result-value">
                            {breakdown.finalResults.effectiveLoadingRate?.toFixed(2)}%
                          </div>
                        </div>
                        <div className="qc-result-item">
                          <Label>Proportion Share</Label>
                          <div className="qc-result-value">{breakdown.finalResults.proportionShare}%</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        )}
      </div>

      {showAddSectionModal && (
        <AddSectionModal
          isOpen={showAddSectionModal}
          onClose={() => {
            setShowAddSectionModal(false)
            setEditingSectionId(null)
          }}
          onSave={handleSaveSection}
          section={
            editingSectionId != null
              ? (
                calculationBreakdown?.inputs.sectionInputs?.find(
                  (s, index: number) => String(index) === editingSectionId
                ) ??
                localSections?.find(
                  (s, index: number) => String(index) === editingSectionId
                )
              )
              : undefined
          }
          productId={proposalProductId || ""}
          onCalculateFullRiskArray={handleReceiveFullRiskArray}
        />
      )}
    </div>
  )
}

export default QuoteCreator
