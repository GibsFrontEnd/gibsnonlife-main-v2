"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../hooks/use-apps"
import { Button } from "./UI/new-button"
import Input from "./UI/Input"
import { Label } from "./UI/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./UI/dialog"
import { selectUiState, setShowQuoteEditorDialog } from "../features/reducers/uiReducers/uiSlice"
import {
  createQuote,
  updateQuote,
  selectQuotations,
  clearMessages,
  setCurrentSection,
  updateQuoteInState,
} from "../features/reducers/quoteReducers/quotationSlice"
import type { Quote, QuoteSection } from "../types/quotation"
import {
  calculateQuoteTotals,
  applyQuoteToSections,
  createDefaultSection,
  validateQuote,
  calculateCoverDays,
} from "../utils/quotationCalculations"
import { SectionEditor } from "./components.sections"
import "./components.quotes.css"

export const QuoteEditor = () => {
  const dispatch = useAppDispatch()
  const { showQuoteEditorDialog } = useAppSelector(selectUiState)
  const { currentProposal, currentQuote, loading, success, error } = useAppSelector(selectQuotations)

  const [quote, setQuote] = useState<Quote>({
    quoteId: "",
    proposalNo: "",
    quoteNumber: "",
    policyNo: "",
    entryDate: new Date().toISOString().split("T")[0],
    startDate: "",
    expiryDate: "",
    coverDays: 0,
    insuredName: "",
    ourShare: 100,
    validityPeriod: 30,
    notes: "",
    sections: [],
    totalSumInsured: 0,
    totalNetPremium: 0,
    quoteProRata: 0,
    status: "DRAFT",
  })

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  const [showSectionEditor, setShowSectionEditor] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Initialize quote when modal opens
  useEffect(() => {
    if (showQuoteEditorDialog && currentProposal) {
      if (currentQuote) {
        // Editing existing quote
        setQuote(currentQuote)
        if (currentQuote.sections.length > 0) {
          setSelectedSectionId(currentQuote.sections[0].sectionId)
        }
      } else {
        // Creating new quote
        const newQuote: Quote = {
          quoteId: `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          proposalNo: currentProposal.proposalNo,
          quoteNumber: `QT/${currentProposal.proposalNo}/${Date.now()}`,
          policyNo: `POL/${currentProposal.proposalNo}/${Date.now()}`,
          entryDate: new Date().toISOString().split("T")[0],
          startDate: currentProposal.startDate.split("T")[0],
          expiryDate: currentProposal.endDate.split("T")[0],
          coverDays: 0,
          insuredName: currentProposal.insuredName,
          ourShare: 100,
          validityPeriod: 30,
          notes: "",
          sections: [createDefaultSection()],
          totalSumInsured: 0,
          totalNetPremium: 0,
          quoteProRata: 0,
          status: "DRAFT",
        }

        // Calculate cover days
        newQuote.coverDays = calculateCoverDays(newQuote.startDate, newQuote.expiryDate)

        setQuote(newQuote)
        setSelectedSectionId(newQuote.sections[0].sectionId)
      }
    }
  }, [showQuoteEditorDialog, currentProposal, currentQuote])

  // Recalculate totals when quote changes
  useEffect(() => {
    const updatedQuote = calculateQuoteTotals(quote)
    if (JSON.stringify(updatedQuote) !== JSON.stringify(quote)) {
      setQuote(updatedQuote)
      dispatch(updateQuoteInState(updatedQuote))
    }
  }, [quote]) // Updated dependency array to include quote

  const handleQuoteFieldChange = (field: string, value: any) => {
    setQuote((prev) => {
      const updated = { ...prev, [field]: value }

      // Recalculate cover days when dates change
      if (field === "startDate" || field === "expiryDate") {
        updated.coverDays = calculateCoverDays(updated.startDate, updated.expiryDate)
      }

      return updated
    })

    // Clear validation errors when user makes changes
    if (validationErrors.length > 0) {
      setValidationErrors([])
    }
  }

  const handleApplyToAllSections = () => {
    const updatedQuote = applyQuoteToSections(quote)
    setQuote(updatedQuote)
  }

  const handleAddSection = () => {
    const newSection = createDefaultSection()
    setQuote((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }))
    setSelectedSectionId(newSection.sectionId)
    setShowSectionEditor(true)
  }

  const handleDuplicateSection = (sectionId: string) => {
    const sectionToDuplicate = quote.sections.find((s) => s.sectionId === sectionId)
    if (sectionToDuplicate) {
      const duplicatedSection = JSON.parse(JSON.stringify(sectionToDuplicate))
      duplicatedSection.sectionId = `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      duplicatedSection.sectionName = `${duplicatedSection.sectionName} (Copy)`

      // Generate new IDs for all nested items
      duplicatedSection.items = duplicatedSection.items.map((item: any) => ({
        ...item,
        itemId: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      }))
      duplicatedSection.extensions = duplicatedSection.extensions.map((ext: any) => ({
        ...ext,
        extensionId: `ext_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      }))
      duplicatedSection.discounts = duplicatedSection.discounts.map((disc: any) => ({
        ...disc,
        discountId: `disc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      }))

      setQuote((prev) => ({
        ...prev,
        sections: [...prev.sections, duplicatedSection],
      }))
    }
  }

  const handleDeleteSection = (sectionId: string) => {
    if (quote.sections.length <= 1) {
      alert("Cannot delete the last section. A quote must have at least one section.")
      return
    }

    setQuote((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.sectionId !== sectionId),
    }))

    // Select another section if the deleted one was selected
    if (selectedSectionId === sectionId) {
      const remainingSections = quote.sections.filter((s) => s.sectionId !== sectionId)
      if (remainingSections.length > 0) {
        setSelectedSectionId(remainingSections[0].sectionId)
      }
    }
  }

  const handleSelectSection = (sectionId: string) => {
    setSelectedSectionId(sectionId)
    const section = quote.sections.find((s) => s.sectionId === sectionId)
    if (section) {
      dispatch(setCurrentSection(section))
      setShowSectionEditor(true)
    }
  }

  const handleSectionUpdate = (updatedSection: QuoteSection) => {
    setQuote((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.sectionId === updatedSection.sectionId ? updatedSection : s)),
    }))
  }

  const handleSaveQuote = () => {
    // Validate quote
    const errors = validateQuote(quote)
    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }

    const quoteToSave = {
      ...quote,
      status: "SAVED" as const,
    }

    if (currentQuote) {
      // Update existing quote
      dispatch(
        updateQuote({
          proposalNo: quote.proposalNo,
          quoteData: quoteToSave,
        }),
      )
    } else {
      // Create new quote
      dispatch(createQuote(quoteToSave))
    }
  }

  const handleCopyQuoteJSON = () => {
    const quoteJSON = JSON.stringify(quote, null, 2)
    navigator.clipboard
      .writeText(quoteJSON)
      .then(() => {
        alert("Quote JSON copied to clipboard!")
      })
      .catch(() => {
        alert("Failed to copy to clipboard")
      })
  }

  const handleResetQuote = () => {
    if (confirm("Are you sure you want to reset the quote? All changes will be lost.")) {
      if (currentProposal) {
        const resetQuote: Quote = {
          quoteId: quote.quoteId,
          proposalNo: currentProposal.proposalNo,
          quoteNumber: quote.quoteNumber,
          policyNo: quote.policyNo,
          entryDate: new Date().toISOString().split("T")[0],
          startDate: currentProposal.startDate.split("T")[0],
          expiryDate: currentProposal.endDate.split("T")[0],
          coverDays: 0,
          insuredName: currentProposal.insuredName,
          ourShare: 100,
          validityPeriod: 30,
          notes: "",
          sections: [createDefaultSection()],
          totalSumInsured: 0,
          totalNetPremium: 0,
          quoteProRata: 0,
          status: "DRAFT",
        }

        resetQuote.coverDays = calculateCoverDays(resetQuote.startDate, resetQuote.expiryDate)
        setQuote(resetQuote)
        setSelectedSectionId(resetQuote.sections[0].sectionId)
        setValidationErrors([])
      }
    }
  }

  const handleClose = () => {
    setShowSectionEditor(false)
    setSelectedSectionId(null)
    setValidationErrors([])
    dispatch(setShowQuoteEditorDialog(false))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  useEffect(() => {
    if (success.createQuote || success.updateQuote) {
      handleClose()
      dispatch(clearMessages())
    }
  }, [success.createQuote, success.updateQuote, dispatch])

  if (!currentProposal) return null

  return (
    <Dialog open={showQuoteEditorDialog} onOpenChange={handleClose}>
      <DialogContent className="qe-quote-editor-dialog max-w-7xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">
            {currentQuote ? `Edit Quote - ${quote.quoteNumber}` : "Create New Quote"}
          </DialogTitle>
        </DialogHeader>

        <div className="qe-quote-editor">
          <div className="qe-quote-header">
            {/* Quote-level fields */}
            <div className="qe-quote-fields">
              <div className="qe-field-row">
                <div className="qe-field">
                  <Label htmlFor="quoteNumber">Quote Number</Label>
                  <Input
                    id="quoteNumber"
                    value={quote.quoteNumber}
                    onChange={(e) => handleQuoteFieldChange("quoteNumber", e.target.value)}
                    placeholder="Quote number"
                    className="min-h-[44px]"
                  />
                </div>
                <div className="qe-field">
                  <Label htmlFor="policyNo">Policy No</Label>
                  <Input
                    id="policyNo"
                    value={quote.policyNo}
                    onChange={(e) => handleQuoteFieldChange("policyNo", e.target.value)}
                    placeholder="Policy number"
                    className="min-h-[44px]"
                  />
                </div>
                <div className="qe-field">
                  <Label htmlFor="entryDate">Entry Date</Label>
                  <Input
                    id="entryDate"
                    type="date"
                    value={quote.entryDate}
                    onChange={(e) => handleQuoteFieldChange("entryDate", e.target.value)}
                    className="min-h-[44px]"
                  />
                </div>
              </div>

              <div className="qe-field-row">
                <div className="qe-field">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={quote.startDate}
                    onChange={(e) => handleQuoteFieldChange("startDate", e.target.value)}
                    className="min-h-[44px]"
                  />
                </div>
                <div className="qe-field">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={quote.expiryDate}
                    onChange={(e) => handleQuoteFieldChange("expiryDate", e.target.value)}
                    className="min-h-[44px]"
                  />
                </div>
                <div className="qe-field">
                  <Label>Cover Days</Label>
                  <div className="qe-computed-field">{quote.coverDays}</div>
                </div>
              </div>

              <div className="qe-field-row">
                <div className="qe-field qe-field-wide">
                  <Label htmlFor="insuredName">Insured Name</Label>
                  <Input
                    id="insuredName"
                    value={quote.insuredName}
                    onChange={(e) => handleQuoteFieldChange("insuredName", e.target.value)}
                    placeholder="Insured name"
                    className="min-h-[44px]"
                  />
                </div>
                <div className="qe-field">
                  <Label htmlFor="ourShare">Our Share (%)</Label>
                  <Input
                    id="ourShare"
                    type="number"
                    min="0"
                    max="100"
                    value={quote.ourShare}
                    onChange={(e) => handleQuoteFieldChange("ourShare", Number(e.target.value))}
                    className="min-h-[44px]"
                  />
                </div>
                <div className="qe-field">
                  <Label htmlFor="validityPeriod">Validity Period (Days)</Label>
                  <Input
                    id="validityPeriod"
                    type="number"
                    min="1"
                    value={quote.validityPeriod}
                    onChange={(e) => handleQuoteFieldChange("validityPeriod", Number(e.target.value))}
                    className="min-h-[44px]"
                  />
                </div>
              </div>

              <div className="qe-field-row">
                <div className="qe-field qe-field-full">
                  <Label htmlFor="notes">Notes</Label>
                  <textarea
                    id="notes"
                    value={quote.notes}
                    onChange={(e) => handleQuoteFieldChange("notes", e.target.value)}
                    placeholder="Enter notes..."
                    className="qe-textarea"
                    rows={3}
                  />
                </div>
              </div>

              <div className="qe-quote-actions">
                <Button onClick={handleApplyToAllSections} variant="outline" size="sm">
                  Apply to All Sections
                </Button>
              </div>
            </div>

            {/* Quote totals */}
            <div className="qe-quote-totals">
              <h3>Quote Totals</h3>
              <div className="qe-total-item">
                <span>Total Sum Insured:</span>
                <span>{formatCurrency(quote.totalSumInsured)}</span>
              </div>
              <div className="qe-total-item">
                <span>Total Net Premium:</span>
                <span>{formatCurrency(quote.totalNetPremium)}</span>
              </div>
              <div className="qe-total-item">
                <span>Quote Pro-Rata:</span>
                <span>{formatCurrency(quote.quoteProRata)}</span>
              </div>
            </div>
          </div>

          {/* Validation errors */}
          {validationErrors.length > 0 && (
            <div className="qe-validation-errors">
              <h4>Please fix the following errors:</h4>
              <ul>
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Sections */}
          <div className="qe-sections-container">
            <div className="qe-sections-header">
              <h3>Sections ({quote.sections.length})</h3>
              <Button onClick={handleAddSection} size="sm">
                Add Section
              </Button>
            </div>

            <div className="qe-sections-list">
              {quote.sections.map((section, index) => (
                <div
                  key={section.sectionId}
                  className={`qe-section-item ${selectedSectionId === section.sectionId ? "selected" : ""}`}
                >
                  <div className="qe-section-info">
                    <h4>{section.sectionName || `Section ${index + 1}`}</h4>
                    <p>{section.riskLocation}</p>
                    <div className="qe-section-stats">
                      <span>Items: {section.items.length}</span>
                      <span>SI: {formatCurrency(section.aggregateSumInsured)}</span>
                      <span>Premium: {formatCurrency(section.premiumDue)}</span>
                    </div>
                  </div>
                  <div className="qe-section-actions">
                    <Button size="sm" variant="outline" onClick={() => handleSelectSection(section.sectionId)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDuplicateSection(section.sectionId)}>
                      Duplicate
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteSection(section.sectionId)}
                      disabled={quote.sections.length <= 1}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Error messages */}
          {(error.createQuote || error.updateQuote) && (
            <div className="qe-error-message">{error.createQuote || error.updateQuote}</div>
          )}

          {/* Footer actions */}
          <div className="qe-footer-actions">
            <div className="qe-action-group">
              <Button onClick={handleSaveQuote} disabled={loading.createQuote || loading.updateQuote}>
                {loading.createQuote || loading.updateQuote ? "Saving..." : "Save Quote"}
              </Button>
              <Button onClick={handleCopyQuoteJSON} variant="outline">
                Copy Quote JSON
              </Button>
              <Button onClick={handleResetQuote} variant="outline">
                Reset Quote
              </Button>
            </div>
            <Button onClick={handleClose} variant="outline">
              Close
            </Button>
          </div>
        </div>

        {/* Section Editor */}
        {showSectionEditor && selectedSectionId && (
          <SectionEditor
            section={quote.sections.find((s) => s.sectionId === selectedSectionId)!}
            ourShare={quote.ourShare}
            onSectionUpdate={handleSectionUpdate}
            onClose={() => setShowSectionEditor(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
