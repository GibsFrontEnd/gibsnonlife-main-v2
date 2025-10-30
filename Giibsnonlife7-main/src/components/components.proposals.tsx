"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../hooks/use-apps"
import { Button } from "./UI/new-button"
import Input from "./UI/Input"
import { Label } from "./UI/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./UI/dialog"
import {
  selectUiState,
  setShowCreateProposalDialog,
  setShowEditProposalDialog,
} from "../features/reducers/uiReducers/uiSlice"
import {
  createProposal,
  updateProposal,
  deleteProposal,
  convertQuoteToPolicy,
  selectQuotations,
  setCurrentProposal,
  setCurrentQuote,
  clearMessages,
} from "../features/reducers/quoteReducers/quotationSlice"
import type { Proposal, CreateProposalRequest } from "../types/quotation"
import "./components.proposals.css"

export const CreateProposalModal = () => {
  const dispatch = useAppDispatch()
  const { showCreateProposalDialog } = useAppSelector(selectUiState)
  const { loading, success, error } = useAppSelector(selectQuotations)

  const [formData, setFormData] = useState<CreateProposalRequest>({
    businessCategory: "",
    businessSubClass: "",
    agentCode: "",
    branchCode: "",
    customerCode: "",
    customerName: "",
    customerAddress: "",
    customerPhone: "",
    customerEmail: "",
    proposalDate: new Date().toISOString().split("T")[0],
    startDate: "",
    endDate: "",
    insuredName: "",
  })

  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear validation errors when user makes changes
    if (validationErrors.length > 0) {
      setValidationErrors([])
    }
  }

  const validateForm = (): string[] => {
    const errors: string[] = []

    if (!formData.businessCategory.trim()) errors.push("Business category is required")
    if (!formData.businessSubClass.trim()) errors.push("Business sub-class is required")
    if (!formData.agentCode.trim()) errors.push("Agent code is required")
    if (!formData.branchCode.trim()) errors.push("Branch code is required")
    if (!formData.customerCode.trim()) errors.push("Customer code is required")
    if (!formData.customerName.trim()) errors.push("Customer name is required")
    if (!formData.customerAddress.trim()) errors.push("Customer address is required")
    if (!formData.customerPhone.trim()) errors.push("Customer phone is required")
    if (!formData.customerEmail.trim()) errors.push("Customer email is required")
    if (!formData.proposalDate) errors.push("Proposal date is required")
    if (!formData.startDate) errors.push("Start date is required")
    if (!formData.endDate) errors.push("End date is required")
    if (!formData.insuredName.trim()) errors.push("Insured name is required")

    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      errors.push("End date must be after start date")
    }

    if (formData.customerEmail && !/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      errors.push("Please enter a valid email address")
    }

    return errors
  }

  const handleSubmit = () => {
    const errors = validateForm()
    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }

    dispatch(createProposal(formData))
  }

  const handleClose = () => {
    setFormData({
      businessCategory: "",
      businessSubClass: "",
      agentCode: "",
      branchCode: "",
      customerCode: "",
      customerName: "",
      customerAddress: "",
      customerPhone: "",
      customerEmail: "",
      proposalDate: new Date().toISOString().split("T")[0],
      startDate: "",
      endDate: "",
      insuredName: "",
    })
    setValidationErrors([])
    dispatch(setShowCreateProposalDialog(false))
  }

  useEffect(() => {
    if (success.createProposal) {
      handleClose()
      dispatch(clearMessages())
    }
  }, [success.createProposal, dispatch])

  return (
    <Dialog open={showCreateProposalDialog} onOpenChange={handleClose}>
      <DialogContent className="cp-create-proposal-dialog max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">Create New Proposal</DialogTitle>
        </DialogHeader>

        <div className="cp-create-proposal-form">
          {/* Validation errors */}
          {validationErrors.length > 0 && (
            <div className="cp-validation-errors">
              <h4>Please fix the following errors:</h4>
              <ul>
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="cp-form-grid">
            <div className="cp-form-row">
              <div className="cp-form-field">
                <Label htmlFor="businessCategory">Business Category</Label>
                <Input
                  id="businessCategory"
                  value={formData.businessCategory}
                  onChange={(e) => handleInputChange("businessCategory", e.target.value)}
                  placeholder="Enter business category"
                />
              </div>
              <div className="cp-form-field">
                <Label htmlFor="businessSubClass">Business Sub-Class</Label>
                <Input
                  id="businessSubClass"
                  value={formData.businessSubClass}
                  onChange={(e) => handleInputChange("businessSubClass", e.target.value)}
                  placeholder="Enter business sub-class"
                />
              </div>
            </div>

            <div className="cp-form-row">
              <div className="cp-form-field">
                <Label htmlFor="agentCode">Agent Code</Label>
                <Input
                  id="agentCode"
                  value={formData.agentCode}
                  onChange={(e) => handleInputChange("agentCode", e.target.value)}
                  placeholder="Enter agent code"
                />
              </div>
              <div className="cp-form-field">
                <Label htmlFor="branchCode">Branch Code</Label>
                <Input
                  id="branchCode"
                  value={formData.branchCode}
                  onChange={(e) => handleInputChange("branchCode", e.target.value)}
                  placeholder="Enter branch code"
                />
              </div>
            </div>

            <div className="cp-form-row">
              <div className="cp-form-field">
                <Label htmlFor="customerCode">Customer Code</Label>
                <Input
                  id="customerCode"
                  value={formData.customerCode}
                  onChange={(e) => handleInputChange("customerCode", e.target.value)}
                  placeholder="Enter customer code"
                />
              </div>
              <div className="cp-form-field">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange("customerName", e.target.value)}
                  placeholder="Enter customer name"
                />
              </div>
            </div>

            <div className="cp-form-row">
              <div className="cp-form-field cp-form-field-full">
                <Label htmlFor="customerAddress">Customer Address</Label>
                <textarea
                  id="customerAddress"
                  value={formData.customerAddress}
                  onChange={(e) => handleInputChange("customerAddress", e.target.value)}
                  placeholder="Enter customer address"
                  className="cp-textarea"
                  rows={3}
                />
              </div>
            </div>

            <div className="cp-form-row">
              <div className="cp-form-field">
                <Label htmlFor="customerPhone">Customer Phone</Label>
                <Input
                  id="customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) => handleInputChange("customerPhone", e.target.value)}
                  placeholder="Enter customer phone"
                />
              </div>
              <div className="cp-form-field">
                <Label htmlFor="customerEmail">Customer Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => handleInputChange("customerEmail", e.target.value)}
                  placeholder="Enter customer email"
                />
              </div>
            </div>

            <div className="cp-form-row">
              <div className="cp-form-field">
                <Label htmlFor="proposalDate">Proposal Date</Label>
                <Input
                  id="proposalDate"
                  type="date"
                  value={formData.proposalDate}
                  onChange={(e) => handleInputChange("proposalDate", e.target.value)}
                />
              </div>
              <div className="cp-form-field">
                <Label htmlFor="insuredName">Insured Name</Label>
                <Input
                  id="insuredName"
                  value={formData.insuredName}
                  onChange={(e) => handleInputChange("insuredName", e.target.value)}
                  placeholder="Enter insured name"
                />
              </div>
            </div>

            <div className="cp-form-row">
              <div className="cp-form-field">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange("startDate", e.target.value)}
                />
              </div>
              <div className="cp-form-field">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Error message */}
          {error.createProposal && <div className="cp-error-message">{error.createProposal}</div>}

          {/* Footer actions */}
          <div className="cp-footer-actions">
            <Button onClick={handleSubmit} disabled={loading.createProposal}>
              {loading.createProposal ? "Creating..." : "Create Proposal"}
            </Button>
            <Button onClick={handleClose} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const EditProposalModal = () => {
  const dispatch = useAppDispatch()
  const { showEditProposalDialog } = useAppSelector(selectUiState)
  const { currentProposal, loading, success, error } = useAppSelector(selectQuotations)

  const [formData, setFormData] = useState<Proposal | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  useEffect(() => {
    if (showEditProposalDialog && currentProposal) {
      setFormData(currentProposal)
    }
  }, [showEditProposalDialog, currentProposal])

  const handleInputChange = (field: string, value: string) => {
    if (!formData) return
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null))
    // Clear validation errors when user makes changes
    if (validationErrors.length > 0) {
      setValidationErrors([])
    }
  }

  const validateForm = (): string[] => {
    if (!formData) return ["No proposal data available"]

    const errors: string[] = []

    if (!formData.businessCategory.trim()) errors.push("Business category is required")
    if (!formData.businessSubClass.trim()) errors.push("Business sub-class is required")
    if (!formData.agentCode.trim()) errors.push("Agent code is required")
    if (!formData.branchCode.trim()) errors.push("Branch code is required")
    if (!formData.customerCode.trim()) errors.push("Customer code is required")
    if (!formData.customerName.trim()) errors.push("Customer name is required")
    if (!formData.customerAddress.trim()) errors.push("Customer address is required")
    if (!formData.customerPhone.trim()) errors.push("Customer phone is required")
    if (!formData.customerEmail.trim()) errors.push("Customer email is required")
    if (!formData.proposalDate) errors.push("Proposal date is required")
    if (!formData.startDate) errors.push("Start date is required")
    if (!formData.endDate) errors.push("End date is required")
    if (!formData.insuredName.trim()) errors.push("Insured name is required")

    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      errors.push("End date must be after start date")
    }

    if (formData.customerEmail && !/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      errors.push("Please enter a valid email address")
    }

    return errors
  }

  const handleSubmit = () => {
    if (!formData) return

    const errors = validateForm()
    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }

    dispatch(updateProposal({ proposalNo: formData.proposalNo, data: formData }))
  }

  const handleClose = () => {
    setFormData(null)
    setValidationErrors([])
    dispatch(setShowEditProposalDialog(false))
  }

  useEffect(() => {
    if (success.updateProposal) {
      handleClose()
      dispatch(clearMessages())
    }
  }, [success.updateProposal, dispatch])

  if (!formData) return null

  return (
    <Dialog open={showEditProposalDialog} onOpenChange={handleClose}>
      <DialogContent className="cp-edit-proposal-dialog max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">Edit Proposal - {formData.proposalNo}</DialogTitle>
        </DialogHeader>

        <div className="cp-edit-proposal-form">
          {/* Validation errors */}
          {validationErrors.length > 0 && (
            <div className="cp-validation-errors">
              <h4>Please fix the following errors:</h4>
              <ul>
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="cp-form-grid">
            <div className="cp-form-row">
              <div className="cp-form-field">
                <Label htmlFor="businessCategory">Business Category</Label>
                <Input
                  id="businessCategory"
                  value={formData.businessCategory}
                  onChange={(e) => handleInputChange("businessCategory", e.target.value)}
                  placeholder="Enter business category"
                />
              </div>
              <div className="cp-form-field">
                <Label htmlFor="businessSubClass">Business Sub-Class</Label>
                <Input
                  id="businessSubClass"
                  value={formData.businessSubClass}
                  onChange={(e) => handleInputChange("businessSubClass", e.target.value)}
                  placeholder="Enter business sub-class"
                />
              </div>
            </div>

            <div className="cp-form-row">
              <div className="cp-form-field">
                <Label htmlFor="agentCode">Agent Code</Label>
                <Input
                  id="agentCode"
                  value={formData.agentCode}
                  onChange={(e) => handleInputChange("agentCode", e.target.value)}
                  placeholder="Enter agent code"
                />
              </div>
              <div className="cp-form-field">
                <Label htmlFor="branchCode">Branch Code</Label>
                <Input
                  id="branchCode"
                  value={formData.branchCode}
                  onChange={(e) => handleInputChange("branchCode", e.target.value)}
                  placeholder="Enter branch code"
                />
              </div>
            </div>

            <div className="cp-form-row">
              <div className="cp-form-field">
                <Label htmlFor="customerCode">Customer Code</Label>
                <Input
                  id="customerCode"
                  value={formData.customerCode}
                  onChange={(e) => handleInputChange("customerCode", e.target.value)}
                  placeholder="Enter customer code"
                />
              </div>
              <div className="cp-form-field">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange("customerName", e.target.value)}
                  placeholder="Enter customer name"
                />
              </div>
            </div>

            <div className="cp-form-row">
              <div className="cp-form-field cp-form-field-full">
                <Label htmlFor="customerAddress">Customer Address</Label>
                <textarea
                  id="customerAddress"
                  value={formData.customerAddress}
                  onChange={(e) => handleInputChange("customerAddress", e.target.value)}
                  placeholder="Enter customer address"
                  className="cp-textarea"
                  rows={3}
                />
              </div>
            </div>

            <div className="cp-form-row">
              <div className="cp-form-field">
                <Label htmlFor="customerPhone">Customer Phone</Label>
                <Input
                  id="customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) => handleInputChange("customerPhone", e.target.value)}
                  placeholder="Enter customer phone"
                />
              </div>
              <div className="cp-form-field">
                <Label htmlFor="customerEmail">Customer Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => handleInputChange("customerEmail", e.target.value)}
                  placeholder="Enter customer email"
                />
              </div>
            </div>

            <div className="cp-form-row">
              <div className="cp-form-field">
                <Label htmlFor="proposalDate">Proposal Date</Label>
                <Input
                  id="proposalDate"
                  type="date"
                  value={formData.proposalDate}
                  onChange={(e) => handleInputChange("proposalDate", e.target.value)}
                />
              </div>
              <div className="cp-form-field">
                <Label htmlFor="insuredName">Insured Name</Label>
                <Input
                  id="insuredName"
                  value={formData.insuredName}
                  onChange={(e) => handleInputChange("insuredName", e.target.value)}
                  placeholder="Enter insured name"
                />
              </div>
            </div>

            <div className="cp-form-row">
              <div className="cp-form-field">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange("startDate", e.target.value)}
                />
              </div>
              <div className="cp-form-field">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Error message */}
          {error.updateProposal && <div className="cp-error-message">{error.updateProposal}</div>}

          {/* Footer actions */}
          <div className="cp-footer-actions">
            <Button onClick={handleSubmit} disabled={loading.updateProposal}>
              {loading.updateProposal ? "Updating..." : "Update Proposal"}
            </Button>
            <Button onClick={handleClose} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const ProposalsList = () => {
  const dispatch = useAppDispatch()
  const { proposals, loading, error } = useAppSelector(selectQuotations)

  const handleEditProposal = (proposal: Proposal) => {
    dispatch(setCurrentProposal(proposal))
    dispatch(setShowEditProposalDialog(true))
  }

  const handleDeleteProposal = (proposalNo: string) => {
    if (confirm("Are you sure you want to delete this proposal? This action cannot be undone.")) {
      dispatch(deleteProposal(proposalNo))
    }
  }

  const handleConvertToPolicy = (proposalNo: string) => {
    if (confirm("Are you sure you want to convert this quote to a policy? This action cannot be undone.")) {
      dispatch(convertQuoteToPolicy(proposalNo))
    }
  }

  const handleCreateQuote = (proposal: Proposal) => {
    dispatch(setCurrentProposal(proposal))
    dispatch(setCurrentQuote(null))
    // This would trigger the quote editor dialog
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      DRAFT: "cp-status-draft",
      ACTIVE: "cp-status-active",
      EXPIRED: "cp-status-expired",
      CONVERTED: "cp-status-converted",
    }
    return <span className={`cp-status-badge ${statusClasses[status as keyof typeof statusClasses]}`}>{status}</span>
  }

  if (loading.fetchProposals) {
    return <div className="cp-loading">Loading proposals...</div>
  }

  if (error.fetchProposals) {
    return <div className="cp-error">Error: {error.fetchProposals}</div>
  }

  return (
    <div className="cp-proposals-list">
      <div className="cp-proposals-table">
        <div className="cp-table-header">
          <div>Proposal No</div>
          <div>Customer Name</div>
          <div>Insured Name</div>
          <div>Business Category</div>
          <div>Start Date</div>
          <div>End Date</div>
          <div>Status</div>
          <div>Actions</div>
        </div>
        {proposals.map((proposal) => (
          <div key={proposal.proposalNo} className="cp-table-row">
            <div>{proposal.proposalNo}</div>
            <div>{proposal.customerName}</div>
            <div>{proposal.insuredName}</div>
            <div>{proposal.businessCategory}</div>
            <div>{formatDate(proposal.startDate)}</div>
            <div>{formatDate(proposal.endDate)}</div>
            <div>{getStatusBadge(proposal.status)}</div>
            <div className="cp-actions">
              <Button size="sm" variant="outline" onClick={() => handleEditProposal(proposal)}>
                Edit
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleCreateQuote(proposal)}>
                Create Quote
              </Button>
              {proposal.status === "ACTIVE" && (
                <Button size="sm" variant="outline" onClick={() => handleConvertToPolicy(proposal.proposalNo)}>
                  Convert to Policy
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDeleteProposal(proposal.proposalNo)}
                disabled={proposal.status === "CONVERTED"}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
