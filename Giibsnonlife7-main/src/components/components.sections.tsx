"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "./UI/new-button"
import Input from "./UI/Input"
import { Label } from "./UI/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./UI/dialog"
import type { QuoteSection } from "../types/quotation"
import {
  calculateSectionTotals,
  createDefaultRiskItem,
  createDefaultExtension,
  createDefaultDiscount,
} from "../utils/quotationCalculations"
import "./components.sections.css"

interface SectionEditorProps {
  section: QuoteSection
  ourShare: number
  onSectionUpdate: (section: QuoteSection) => void
  onClose: () => void
}

export const SectionEditor: React.FC<SectionEditorProps> = ({ section, ourShare, onSectionUpdate, onClose }) => {
  const [editingSection, setEditingSection] = useState<QuoteSection>(section)

  const riskSMIOptions = [
    "FIRE & SPECIAL PERILS - PRIVATE DWELLING",
    "FIRE & SPECIAL PERILS - COMMERCIAL PROPERTY",
    "FIRE & SPECIAL PERILS - INDUSTRIAL PROPERTY",
    "MOTOR COMPREHENSIVE",
    "MOTOR THIRD PARTY",
    "MARINE CARGO",
    "MARINE HULL",
    "CONTRACTORS ALL RISK",
    "ERECTION ALL RISK",
    "PUBLIC LIABILITY",
    "PROFESSIONAL INDEMNITY",
  ]

  const stockOptions = ["Yes", "No"]

  // Recalculate section totals when section changes
  useEffect(() => {
    const updatedSection = calculateSectionTotals(editingSection, ourShare)
    if (JSON.stringify(updatedSection) !== JSON.stringify(editingSection)) {
      setEditingSection(updatedSection)
      onSectionUpdate(updatedSection)
    }
  }, [editingSection, ourShare])

  const handleSectionFieldChange = (field: string, value: any) => {
    setEditingSection((prev) => ({ ...prev, [field]: value }))
  }

  const handleItemChange = (itemId: string, field: string, value: any) => {
    setEditingSection((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.itemId === itemId ? { ...item, [field]: value } : item)),
    }))
  }

  const handleAddItem = () => {
    const newItem = createDefaultRiskItem(editingSection.items.length + 1)
    setEditingSection((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }))
  }

  const handleRemoveItem = (itemId: string) => {
    if (editingSection.items.length <= 1) {
      alert("Cannot remove the last item. A section must have at least one risk item.")
      return
    }

    setEditingSection((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.itemId !== itemId),
    }))

    // Renumber remaining items
    setEditingSection((prev) => ({
      ...prev,
      items: prev.items.map((item, index) => ({ ...item, itemNo: index + 1 })),
    }))
  }

  const handleExtensionChange = (extensionId: string, field: string, value: any) => {
    setEditingSection((prev) => ({
      ...prev,
      extensions: prev.extensions.map((ext) => (ext.extensionId === extensionId ? { ...ext, [field]: value } : ext)),
    }))
  }

  const handleAddExtension = () => {
    const newExtension = createDefaultExtension()
    setEditingSection((prev) => ({
      ...prev,
      extensions: [...prev.extensions, newExtension],
    }))
  }

  const handleRemoveExtension = (extensionId: string) => {
    setEditingSection((prev) => ({
      ...prev,
      extensions: prev.extensions.filter((ext) => ext.extensionId !== extensionId),
    }))
  }

  const handleDiscountChange = (discountId: string, field: string, value: any) => {
    setEditingSection((prev) => ({
      ...prev,
      discounts: prev.discounts.map((disc) => (disc.discountId === discountId ? { ...disc, [field]: value } : disc)),
    }))
  }

  const handleAddDiscount = () => {
    const newDiscount = createDefaultDiscount()
    setEditingSection((prev) => ({
      ...prev,
      discounts: [...prev.discounts, newDiscount],
    }))
  }

  const handleRemoveDiscount = (discountId: string) => {
    setEditingSection((prev) => ({
      ...prev,
      discounts: prev.discounts.filter((disc) => disc.discountId !== discountId),
    }))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="se-section-editor-dialog max-w-7xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">Section Editor</DialogTitle>
        </DialogHeader>

        <div className="se-section-editor">
          {/* Section Fields */}
          <div className="se-section-fields">
            <div className="se-field-row">
              <div className="se-field se-field-wide">
                <Label htmlFor="sectionName">Section Name</Label>
                <Input
                  id="sectionName"
                  value={editingSection.sectionName}
                  onChange={(e) => handleSectionFieldChange("sectionName", e.target.value)}
                  placeholder="e.g., FIRE & SPECIAL PERILS - PRIVATE DWELLING"
                  className="min-h-[44px]"
                />
              </div>
              <div className="se-field">
                <Label htmlFor="riskLocation">Risk Location</Label>
                <Input
                  id="riskLocation"
                  value={editingSection.riskLocation}
                  onChange={(e) => handleSectionFieldChange("riskLocation", e.target.value)}
                  placeholder="Enter risk location"
                  className="min-h-[44px]"
                />
              </div>
            </div>

            <div className="se-field-row">
              <div className="se-field">
                <Label htmlFor="sectionStartDate">Section Start Date</Label>
                <Input
                  id="sectionStartDate"
                  type="date"
                  value={editingSection.sectionStartDate}
                  onChange={(e) => handleSectionFieldChange("sectionStartDate", e.target.value)}
                  className="min-h-[44px]"
                />
              </div>
              <div className="se-field">
                <Label htmlFor="sectionExpiryDate">Section Expiry Date</Label>
                <Input
                  id="sectionExpiryDate"
                  type="date"
                  value={editingSection.sectionExpiryDate}
                  onChange={(e) => handleSectionFieldChange("sectionExpiryDate", e.target.value)}
                  className="min-h-[44px]"
                />
              </div>
            </div>

            <div className="se-field-row">
              <div className="se-field">
                <div className="se-checkbox-field">
                  <input
                    type="checkbox"
                    id="useFlatPremiumRate"
                    checked={editingSection.useFlatPremiumRate}
                    onChange={(e) => handleSectionFieldChange("useFlatPremiumRate", e.target.checked)}
                  />
                  <Label htmlFor="useFlatPremiumRate">Use Flat Premium Rate</Label>
                </div>
              </div>
              {editingSection.useFlatPremiumRate && (
                <div className="se-field">
                  <Label htmlFor="flatPremium">Flat Premium</Label>
                  <Input
                    id="flatPremium"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingSection.flatPremium}
                    onChange={(e) => handleSectionFieldChange("flatPremium", Number(e.target.value))}
                    className="min-h-[44px]"
                  />
                </div>
              )}
            </div>

            <div className="se-field-row">
              <div className="se-field">
                <div className="se-checkbox-field">
                  <input
                    type="checkbox"
                    id="uploadSpecificationDetails"
                    checked={editingSection.uploadSpecificationDetails}
                    onChange={(e) => handleSectionFieldChange("uploadSpecificationDetails", e.target.checked)}
                  />
                  <Label htmlFor="uploadSpecificationDetails">Upload Specification Details</Label>
                </div>
              </div>
              <div className="se-field">
                <Label htmlFor="otherLoading">Other Loading (%)</Label>
                <Input
                  id="otherLoading"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editingSection.otherLoading}
                  onChange={(e) => handleSectionFieldChange("otherLoading", Number(e.target.value))}
                  className="min-h-[44px]"
                />
              </div>
              <div className="se-field">
                <Label htmlFor="otherDiscount">Other Discount (%)</Label>
                <Input
                  id="otherDiscount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editingSection.otherDiscount}
                  onChange={(e) => handleSectionFieldChange("otherDiscount", Number(e.target.value))}
                  className="min-h-[44px]"
                />
              </div>
            </div>
          </div>

          {/* Risk Items Table */}
          <div className="se-items-section">
            <div className="se-section-header">
              <h3>📋 Risk Item Descriptions</h3>
              <div className="se-section-actions">
                <Button onClick={handleAddItem} size="sm">
                  Add Item
                </Button>
              </div>
            </div>

            <div className="se-items-table">
              <div className="se-table-header">
                <div>Item No</div>
                <div>Risk SMI</div>
                <div>Item Description</div>
                <div>Total Sum Insured</div>
                <div>Rate (%)</div>
                <div>Total Premium</div>
                <div>Stock</div>
                <div>Our Share Sum Insured</div>
                <div>Our Share Premium</div>
                <div>Section</div>
                <div>Section</div>
                <div>Actions</div>
              </div>
              {editingSection.items.map((item) => (
                <div key={item.itemId} className="se-table-row">
                  <div>{item.itemNo}</div>
                  <div>
                    <select
                      value={item.riskSMI}
                      onChange={(e) => handleItemChange(item.itemId, "riskSMI", e.target.value)}
                      className="se-select"
                    >
                      <option value="">Select Risk SMI</option>
                      {riskSMIOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Input
                      value={item.itemDescription}
                      onChange={(e) => handleItemChange(item.itemId, "itemDescription", e.target.value)}
                      placeholder="Item description"
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.totalSumInsured}
                      onChange={(e) => handleItemChange(item.itemId, "totalSumInsured", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) => handleItemChange(item.itemId, "rate", Number(e.target.value))}
                    />
                  </div>
                  <div className="se-computed-value">{formatCurrency(item.totalPremium)}</div>
                  <div>
                    <select
                      value={item.stock}
                      onChange={(e) => handleItemChange(item.itemId, "stock", e.target.value)}
                      className="se-select"
                    >
                      {stockOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="se-computed-value">{formatCurrency(item.ourShareSumInsured)}</div>
                  <div className="se-computed-value">{formatCurrency(item.ourSharePremium)}</div>
                  <div>
                    <Input
                      value={item.section1}
                      onChange={(e) => handleItemChange(item.itemId, "section1", e.target.value)}
                      placeholder="Section 1"
                    />
                  </div>
                  <div>
                    <Input
                      value={item.section2}
                      onChange={(e) => handleItemChange(item.itemId, "section2", e.target.value)}
                      placeholder="Section 2"
                    />
                  </div>
                  <div>
                    <Button
                      onClick={() => handleRemoveItem(item.itemId)}
                      size="sm"
                      variant="outline"
                      disabled={editingSection.items.length <= 1}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Extensions Table */}
          <div className="se-extensions-section">
            <div className="se-section-header">
              <h3>⬆️ Extensions (Loading)</h3>
              <Button onClick={handleAddExtension} size="sm">
                Add Extension
              </Button>
            </div>

            <div className="se-extensions-table">
              <div className="se-table-header">
                <div>#</div>
                <div>Name Description</div>
                <div>Extension Rate (%)</div>
                <div>Extension Amount</div>
                <div>Actions</div>
              </div>
              {editingSection.extensions.map((extension, index) => (
                <div key={extension.extensionId} className="se-table-row">
                  <div>{index + 1}</div>
                  <div>
                    <Input
                      value={extension.nameDescription}
                      onChange={(e) => handleExtensionChange(extension.extensionId, "nameDescription", e.target.value)}
                      placeholder="Extension description"
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={extension.extensionRate}
                      onChange={(e) =>
                        handleExtensionChange(extension.extensionId, "extensionRate", Number(e.target.value))
                      }
                    />
                  </div>
                  <div className="se-computed-value">{formatCurrency(extension.extensionAmount)}</div>
                  <div>
                    <Button onClick={() => handleRemoveExtension(extension.extensionId)} size="sm" variant="outline">
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {editingSection.extensions.length > 0 && (
              <div className="se-computation-area">
                <h4>Extension Premium Computation</h4>
                {editingSection.extensions.map((ext, index) => (
                  <div key={ext.extensionId} className="se-computation-item">
                    <span>{ext.nameDescription || `Extension ${index + 1}`}:</span>
                    <span>{formatCurrency(ext.extensionAmount)}</span>
                  </div>
                ))}
                <div className="se-computation-total">
                  <span>Section Premium After Loading:</span>
                  <span>{formatCurrency(editingSection.premiumAfterLoading)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Discounts Table */}
          <div className="se-discounts-section">
            <div className="se-section-header">
              <h3>⬇️ Discounts</h3>
              <Button onClick={handleAddDiscount} size="sm">
                Add Discount
              </Button>
            </div>

            <div className="se-discounts-table">
              <div className="se-table-header">
                <div>#</div>
                <div>Name Description</div>
                <div>Discount Rate (%)</div>
                <div>Discount Amount</div>
                <div>Actions</div>
              </div>
              {editingSection.discounts.map((discount, index) => (
                <div key={discount.discountId} className="se-table-row">
                  <div>{index + 1}</div>
                  <div>
                    <Input
                      value={discount.nameDescription}
                      onChange={(e) => handleDiscountChange(discount.discountId, "nameDescription", e.target.value)}
                      placeholder="Discount description"
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={discount.discountRate}
                      onChange={(e) =>
                        handleDiscountChange(discount.discountId, "discountRate", Number(e.target.value))
                      }
                    />
                  </div>
                  <div className="se-computed-value">{formatCurrency(discount.discountAmount)}</div>
                  <div>
                    <Button onClick={() => handleRemoveDiscount(discount.discountId)} size="sm" variant="outline">
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {editingSection.discounts.length > 0 && (
              <div className="se-computation-area">
                <h4>Discount Premium Computation</h4>
                {editingSection.discounts.map((disc, index) => (
                  <div key={disc.discountId} className="se-computation-item">
                    <span>{disc.nameDescription || `Discount ${index + 1}`}:</span>
                    <span>{formatCurrency(disc.discountAmount)}</span>
                  </div>
                ))}
                <div className="se-computation-total">
                  <span>Premium After Applying Discounts:</span>
                  <span>{formatCurrency(editingSection.premiumDue)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Section Premium Computation Summary */}
          <div className="se-summary-panel">
            <h3>💰 Section Premium Computation Summary</h3>
            <div className="se-summary-grid">
              <div className="se-summary-item">
                <span>Aggregate Sum Insured:</span>
                <span>{formatCurrency(editingSection.aggregateSumInsured)}</span>
              </div>
              <div className="se-summary-item">
                <span>Aggregate Premium (Gross):</span>
                <span>{formatCurrency(editingSection.aggregatePremium)}</span>
              </div>
              <div className="se-summary-item">
                <span>Total Loading:</span>
                <span>{formatCurrency(editingSection.totalLoading)}</span>
              </div>
              <div className="se-summary-item">
                <span>Premium After Loading:</span>
                <span>{formatCurrency(editingSection.premiumAfterLoading)}</span>
              </div>
              <div className="se-summary-item">
                <span>Total Discount:</span>
                <span>{formatCurrency(editingSection.totalDiscount)}</span>
              </div>
              <div className="se-summary-item">
                <span>Premium Due (Net):</span>
                <span>{formatCurrency(editingSection.premiumDue)}</span>
              </div>
              <div className="se-summary-item">
                <span>Cover Days:</span>
                <span>{editingSection.coverDays}</span>
              </div>
              <div className="se-summary-item">
                <span>Pro-Rata Premium:</span>
                <span>{formatCurrency(editingSection.proRataPremium)}</span>
              </div>
              <div className="se-summary-item">
                <span>Section Premium (Net):</span>
                <span>{formatCurrency(editingSection.sectionPremium)}</span>
              </div>
              <div className="se-summary-item">
                <span>Our Share Sum Insured:</span>
                <span>{formatCurrency(editingSection.ourShareSumInsured)}</span>
              </div>
              <div className="se-summary-item">
                <span>Our Share Premium:</span>
                <span>{formatCurrency(editingSection.ourSharePremium)}</span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="se-footer-actions">
            <Button onClick={onClose}>Close Section Editor</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
