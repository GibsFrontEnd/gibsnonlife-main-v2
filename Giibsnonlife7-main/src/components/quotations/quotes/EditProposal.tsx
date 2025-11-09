//@ts-nocheck

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import type { RootState } from "../../../features/store";
import {
  getProposalByNumber,
  updateProposal,
  clearMessages,
  fetchProposalReport,
} from "../../../features/reducers/quoteReducers/quotationSlice";
import { getAllRisks } from "../../../features/reducers/adminReducers/riskSlice";
import { getAllProducts } from "../../../features/reducers/productReducers/productSlice";
import { getAllBranches } from "../../../features/reducers/companyReducers/branchSlice";
import { getAllAgents } from "../../../features/reducers/csuReducers/agentSlice";
import { Button } from "../../UI/new-button";
import Input from "../../UI/Input";
import { Label } from "../../UI/label";
import type { UpdateProposalRequest } from "../../../types/quotation";
import "./EditProposal.css";
import { useToast } from "@/components/UI/use-toast";
import useProposalPDF from "@/hooks/use-proposal-pdf";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../UI/tabs";
import QuoteCreator from "./QuoteCreator";
import MotorQuoteCreator from "./MotorQuoteCreator";
import ClauseManager from "./ClauseManager";

const EditProposal = () => {
  const { toast } = useToast();
  const { proposalNo } = useParams<{ proposalNo: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { downloadPDF } = useProposalPDF();

  const { currentProposal, proposalReport, loading, success, error } =
    useSelector((state: RootState) => state.quotations);
  const { risks } = useSelector((state: RootState) => state.risks);
  const { products } = useSelector((state: RootState) => state.products);
  const { branches } = useSelector((state: RootState) => state.branches);
  const { agents } = useSelector((state: RootState) => state.parties);

  const [formData, setFormData] = useState<UpdateProposalRequest>({
    surname: "",
    firstName: "",
    otherNames: "",
    insAddress: "",
    insMobilePhone: "",
    insEmail: "",
    insOccupation: "",
    bizSource: "",
    proportionRate: 0,
    remarks: "",
    modifiedBy: "SYSTEM",
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("proposal-info");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  useEffect(() => {
    if (success.fetchProposalReport) {
      dispatch(clearMessages());
      toast({
        title: "Report fetched succesfully!",
        description: "You can proceed to view the report in the downloads",
        duration: 3000,
        variant: "success",
      });
      downloadPDF(proposalReport);
    } else if (error.fetchProposalReport) {
      dispatch(clearMessages());
      toast({
        title: "Failed to download proposal",
        duration: 3000,
        variant: "destructive",
      });
    }
  }, [dispatch, success.fetchProposalReport, error.fetchProposalReport]);

  useEffect(() => {
    if (proposalNo) {
      dispatch(getProposalByNumber(proposalNo) as any);
    }
    dispatch(getAllRisks({ pageNumber: 1, pageSize: 100 }) as any);
    dispatch(getAllBranches() as any);
    dispatch(getAllAgents({ pageNumber: 1, pageSize: 100 }) as any);
  }, [dispatch, proposalNo]);

  useEffect(() => {
    console.log("it's log");

    if (currentProposal) {
      console.log(currentProposal);

      setFormData({
        surname: `${currentProposal.insSurname}`,
        firstName: `${currentProposal.insFirstname}`,
        otherNames: `${currentProposal.insOthernames}`,
        insAddress: currentProposal.insAddress,
        insMobilePhone: currentProposal.insMobilePhone,
        insEmail: currentProposal.insEmail,
        insOccupation: currentProposal.insOccupation,
        bizSource: currentProposal.bizSource,
        proportionRate: currentProposal.proportionRate,
        remarks: currentProposal.remarks || "",
        modifiedBy: "SYSTEM",
      });

      if (currentProposal.subRiskID) {
        dispatch(
          getAllProducts({
            riskId: currentProposal.subRiskID,
            pageNumber: 1,
            pageSize: 100,
          }) as any
        );
      }
    }
  }, [currentProposal, dispatch]);

  useEffect(() => {
    if (success.updateProposal) {
      dispatch(clearMessages());
    }
  }, [success.updateProposal, dispatch]);

  const handleInputChange = (
    field: keyof UpdateProposalRequest,
    value: any
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.surname) errors.push("Insured name is required");
    if (!formData.insAddress) errors.push("Address is required");
    if (!formData.insMobilePhone) errors.push("Mobile phone is required");
    if (!formData.insEmail) errors.push("Email is required");

    if (formData.insEmail && !/\S+@\S+\.\S+/.test(formData.insEmail)) {
      errors.push("Please enter a valid email address");
    }

    return errors;
  };

  const handleSubmit = () => {
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    if (proposalNo) {
      dispatch(updateProposal({ proposalNo, proposalData: formData }) as any);
      dispatch(getProposalByNumber(proposalNo) as any);
    }
  };

  const handleCancel = () => {
    navigate("/quotations");
  };

  const handleDoQuote = () => {
    if (
      risks.find((r) => r.riskID == currentProposal.riskID)?.riskName == "Motor"
    ) {
      if (proposalNo) {
        navigate(`/quotations/quote/motor/${proposalNo}`);
      }
    } else {
      if (proposalNo) {
        navigate(`/quotations/quote/${proposalNo}`);
      }
    }
  };

  const handleDoClause = () => {
    if (proposalNo) {
      navigate(`/quotations/clauses/${proposalNo}`);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setUploadedFiles((prev) => [...prev, ...Array.from(files)]);
      toast({
        title: "Files uploaded",
        description: `${files.length} file(s) added successfully`,
        duration: 3000,
        variant: "success",
      });
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return "N/A";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  if (!currentProposal) {
    return <div className="edit-proposal-loading">Loading proposal...</div>;
  }

  return (
    <div className="edit-proposal-container">
      <div className="edit-proposal-header">
        <div>
          <h1>Edit Proposal</h1>
          <p className="proposal-number">
            Proposal No: {currentProposal.proposalNo}
          </p>
        </div>
        <div className="header-actions">
          <Button
            className="w-[150px] text-black"
            loading={loading.fetchProposalReport}
            onClick={() => dispatch(fetchProposalReport(proposalNo))}
            variant="outline"
            size="sm"
          >
            Print Quote
          </Button>
          <Button onClick={handleCancel} variant="outline">
            Back to List
          </Button>
          <Button onClick={handleSubmit} disabled={loading.updateProposal}>
            {loading.updateProposal ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full flex bg-white border-b border-gray-200 mb-6 rounded-none">
          <TabsTrigger
            value="proposal-info"
            className="flex-1 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-600 rounded-t-md rounded-b-none border-b-2 border-transparent data-[state=active]:border-purple-600"
          >
            Proposal Info
          </TabsTrigger>
          <TabsTrigger
            value="do-quote"
            className="flex-1 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-600 rounded-t-md rounded-b-none border-b-2 border-transparent data-[state=active]:border-purple-600"
          >
            Do Quote
          </TabsTrigger>
          <TabsTrigger
            value="do-clause"
            className="flex-1 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-600 rounded-t-md rounded-b-none border-b-2 border-transparent data-[state=active]:border-purple-600"
          >
            Do Clause
          </TabsTrigger>
          <TabsTrigger
            value="upload-documents"
            className="flex-1 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-600 rounded-t-md rounded-b-none border-b-2 border-transparent data-[state=active]:border-purple-600"
          >
            Upload Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="proposal-info">
          <div className="edit-proposal-content">
            {validationErrors.length > 0 && (
              <div className="validation-errors">
                <h4>Please fix the following errors:</h4>
                <ul>
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {error.updateProposal && (
              <div className="error-message">{error.updateProposal}</div>
            )}

            {success.updateProposal && (
              <div className="success-message">
                Proposal updated successfully!
              </div>
            )}

            {/* Read-only proposal information */}
            <div className="form-section readonly-section">
              <h3>Proposal Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <Label>Status</Label>
                  <div
                    className={`status-badge status-${currentProposal.transSTATUS}`}
                  >
                    {currentProposal.transSTATUS}
                  </div>
                </div>
                <div className="info-item">
                  <Label>Business Category</Label>
                  <div className="info-value">
                    {
                      risks.find((r) => r.riskID == currentProposal.riskID)
                        ?.riskName
                    }
                  </div>
                </div>
                <div className="info-item">
                  <Label>Subclass</Label>
                  <div className="info-value">{currentProposal.subRisk}</div>
                </div>
                <div className="info-item">
                  <Label>Branch</Label>
                  <div className="info-value">{currentProposal.branch}</div>
                </div>
                <div className="info-item">
                  <Label>Agent</Label>
                  <div className="info-value">{currentProposal.party}</div>
                </div>
                <div className="info-item">
                  <Label>Marketing Staff</Label>
                  <div className="info-value">{currentProposal.mktStaff}</div>
                </div>
                <div className="info-item">
                  <Label>Start Date</Label>
                  <div className="info-value">
                    {formatDate(currentProposal.startDate)}
                  </div>
                </div>
                <div className="info-item">
                  <Label>End Date</Label>
                  <div className="info-value">
                    {formatDate(currentProposal.endDate)}
                  </div>
                </div>
                <div className="info-item">
                  <Label>Sum Insured</Label>
                  <div className="info-value">
                    {formatCurrency(currentProposal.sumInsured)}
                  </div>
                </div>
                <div className="info-item">
                  <Label>Gross Premium</Label>
                  <div className="info-value">
                    {formatCurrency(currentProposal.grossPremium)}
                  </div>
                </div>
                <div className="info-item">
                  <Label>Currency</Label>
                  <div className="info-value">{currentProposal.exCurrency}</div>
                </div>
                <div className="info-item">
                  <Label>Exchange Rate</Label>
                  <div className="info-value">{currentProposal.exRate}</div>
                </div>
              </div>
            </div>

            {/* Editable fields */}
            <div className="form-section">
              <h3>Insured Information (Editable)</h3>
              <div className="form-grid">
                <div className="form-field">
                  <Label htmlFor="surname">Last Name *</Label>
                  <Input
                    id="surname"
                    value={formData.surname}
                    onChange={(e) =>
                      handleInputChange("surname", e.target.value)
                    }
                    placeholder="Enter last name"
                  />
                </div>

                <div className="form-field">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    placeholder="Enter first name"
                  />
                </div>
                <div className="form-field form-field-full">
                  <Label htmlFor="insuredName">Other Names *</Label>
                  <Input
                    id="fistName"
                    value={formData.otherNames}
                    onChange={(e) =>
                      handleInputChange("otherNames", e.target.value)
                    }
                    placeholder="Enter insured name"
                  />
                </div>

                <div className="form-field">
                  <Label htmlFor="insAddress">Address *</Label>
                  <textarea
                    id="insAddress"
                    value={formData.insAddress}
                    onChange={(e) =>
                      handleInputChange("insAddress", e.target.value)
                    }
                    placeholder="Enter address"
                    className="form-textarea"
                    rows={3}
                  />
                </div>

                <div className="form-field">
                  <Label htmlFor="insMobilePhone">Mobile Phone *</Label>
                  <Input
                    id="insMobilePhone"
                    value={formData.insMobilePhone}
                    onChange={(e) =>
                      handleInputChange("insMobilePhone", e.target.value)
                    }
                    placeholder="Enter mobile phone"
                  />
                </div>

                <div className="form-field">
                  <Label htmlFor="insEmail">Email *</Label>
                  <Input
                    id="insEmail"
                    type="email"
                    value={formData.insEmail}
                    onChange={(e) =>
                      handleInputChange("insEmail", e.target.value)
                    }
                    placeholder="Enter email"
                  />
                </div>

                <div className="form-field">
                  <Label htmlFor="insOccupation">Occupation</Label>
                  <Input
                    id="insOccupation"
                    value={formData.insOccupation}
                    onChange={(e) =>
                      handleInputChange("insOccupation", e.target.value)
                    }
                    placeholder="Enter occupation"
                  />
                </div>

                <div className="form-field">
                  <Label htmlFor="bizSource">Business Source</Label>
                  <select
                    id="bizSource"
                    value={formData.bizSource}
                    onChange={(e) =>
                      handleInputChange("bizSource", e.target.value)
                    }
                    className="form-select"
                  >
                    <option value="DIRECT">Direct</option>
                    <option value="BROKER">Broker</option>
                    <option value="AGENT">Agent</option>
                  </select>
                </div>

                <div className="form-field">
                  <Label htmlFor="proportionRate">Proportion Rate (%)</Label>
                  <Input
                    id="proportionRate"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.proportionRate}
                    onChange={(e) =>
                      handleInputChange(
                        "proportionRate",
                        Number(e.target.value)
                      )
                    }
                    disabled
                  />
                </div>

                <div className="form-field form-field-full">
                  <Label htmlFor="remarks">Remarks</Label>
                  <textarea
                    id="remarks"
                    value={formData.remarks}
                    onChange={(e) =>
                      handleInputChange("remarks", e.target.value)
                    }
                    placeholder="Enter remarks"
                    className="form-textarea"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="do-quote">
          {risks.find((r) => r.riskID == currentProposal.riskID)?.riskName ===
          "Motor" ? (
            <MotorQuoteCreator />
          ) : (
            <QuoteCreator />
          )}
        </TabsContent>

        <TabsContent value="do-clause">
          <ClauseManager />
        </TabsContent>

        <TabsContent value="upload-documents">
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Upload Documents</h2>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="space-y-2">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="text-sm text-gray-600">
                      <span className="font-semibold text-purple-600 hover:text-purple-500">
                        Click to upload
                      </span>{" "}
                      or drag and drop
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, DOCX, JPG, JPEG, PNG up to 10MB
                    </p>
                  </div>
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold mb-2">
                    Uploaded Files:
                  </h3>
                  <ul className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <svg
                            className="h-5 w-5 text-gray-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm text-gray-700">
                            {file.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024).toFixed(2)} KB)
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EditProposal;
