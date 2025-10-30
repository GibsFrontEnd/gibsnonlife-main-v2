// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "../../features/store"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../UI/dialog"
import { Button } from "../UI/new-button"
import { Input } from "../UI/new-input"
import { Label } from "../UI/label"
import { toast } from "../UI/use-toast"
import type { MotorVehicleUI, MotorAdjustment } from "../../types/motor-quotation"
import {
    calculateBasicPremium,
    applyDiscounts,
    applyLoadings,
    calculateFinalPremium,
} from "../../features/reducers/quoteReducers/motorQuotationSlice"
// import "./AddVehicleModal.css"

interface AddVehicleModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (vehicle: MotorVehicleUI) => void
    vehicle?: MotorVehicleUI
}

export const AddVehicleModal = ({ isOpen, onClose, onSave, vehicle }: AddVehicleModalProps) => {
    const dispatch = useDispatch<AppDispatch>()
    const [calculatingStep, setCalculatingStep] = useState<string | null>(null)

    const initialForm = (): MotorVehicleUI => ({
        itemNo: vehicle?.itemNo ?? 1,
        vehicleRegNo: vehicle?.vehicleRegNo ?? "",
        vehicleUser: vehicle?.vehicleUser ?? "",
        vehicleType: vehicle?.vehicleType ?? "",
        vehicleMake: vehicle?.vehicleMake ?? "",
        vehicleModel: vehicle?.vehicleModel ?? "",
        chassisNo: vehicle?.chassisNo ?? "",
        engineNo: vehicle?.engineNo ?? "",
        color: vehicle?.color ?? "",
        modelYear: vehicle?.modelYear ?? new Date().getFullYear(),
        coverType: vehicle?.coverType ?? "Comprehensive",
        usage: vehicle?.usage ?? "Private",
        vehicleValue: vehicle?.vehicleValue ?? 0,
        premiumRate: vehicle?.premiumRate ?? 0,
        state: vehicle?.state ?? "",
        seatCapacity: vehicle?.seatCapacity ?? 0,
        waxCode: vehicle?.waxCode ?? "",
        location: vehicle?.location ?? "",
        startDate: vehicle?.startDate ?? new Date().toISOString().split("T")[0],
        endDate: vehicle?.endDate ?? new Date().toISOString().split("T")[0],
        trackingCost: vehicle?.trackingCost ?? 0,
        rescueCost: vehicle?.rescueCost ?? 0,
        discounts: vehicle?.discounts ?? [],
        loadings: vehicle?.loadings ?? [],
        _collapsed: false,
        _showDetails: false,
        uiId: vehicle?.uiId ?? `vehicle_${Date.now()}`,
    })

    const [formData, setFormData] = useState<MotorVehicleUI>(initialForm())
    const [calculatedPremium, setCalculatedPremium] = useState<{
        basicPremium?: number
        premiumAfterDiscounts?: number
        grossPremium?: number
        netPremium?: number
    }>({})

    useEffect(() => {
        if (vehicle) {
            setFormData(initialForm())
        }
    }, [vehicle])

    const handleInputChange = (field: keyof MotorVehicleUI, value: any) => {
        const numeric = ["vehicleValue", "premiumRate", "seatCapacity", "trackingCost", "rescueCost", "modelYear"]
        const parsed = numeric.includes(field as string) ? (value === "" ? 0 : Number(value)) : value
        setFormData((prev) => ({ ...prev, [field]: parsed }))
    }

    const handleAddDiscount = () => {
        const newDiscount: MotorAdjustment = {
            adjustmentName: "",
            adjustmentType: "Discount",
            rate: 0,
            appliedOn: "Premium",
            baseAmount: 0,
            amount: 0,
            sequenceOrder: formData.discounts.length + 1,
            formula: "",
        }
        setFormData((prev) => ({
            ...prev,
            discounts: [...prev.discounts, newDiscount],
        }))
    }

    const handleAddLoading = () => {
        const newLoading: MotorAdjustment = {
            adjustmentName: "",
            adjustmentType: "Loading",
            rate: 0,
            appliedOn: "SumInsured",
            baseAmount: 0,
            amount: 0,
            sequenceOrder: formData.loadings.length + 1,
            formula: "",
        }
        setFormData((prev) => ({
            ...prev,
            loadings: [...prev.loadings, newLoading],
        }))
    }

    const handleRemoveDiscount = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            discounts: prev.discounts.filter((_, i) => i !== index),
        }))
    }

    const handleRemoveLoading = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            loadings: prev.loadings.filter((_, i) => i !== index),
        }))
    }

    const handleAdjustmentChange = (
        type: "discount" | "loading",
        index: number,
        field: keyof MotorAdjustment,
        value: any,
    ) => {
        const numeric = ["rate", "baseAmount", "amount", "sequenceOrder"]
        const parsed = numeric.includes(field as string) ? (value === "" ? 0 : Number(value)) : value

        if (type === "discount") {
            const updated = [...formData.discounts]
            updated[index] = { ...updated[index], [field]: parsed }
            setFormData((prev) => ({ ...prev, discounts: updated }))
        } else {
            const updated = [...formData.loadings]
            updated[index] = { ...updated[index], [field]: parsed }
            setFormData((prev) => ({ ...prev, loadings: updated }))
        }
    }

    const handleCalculateStep1 = async () => {
        if (!formData.vehicleType || !formData.vehicleValue || !formData.premiumRate || !formData.coverType) {
            toast({
                description: "Please fill in vehicle type, value, rate, and cover type",
                variant: "warning",
                duration: 2000,
            })
            return
        }

        setCalculatingStep("step1")
        try {
            const result = await (
                dispatch(
                    calculateBasicPremium({
                        vehicleType: formData.vehicleType,
                        vehicleValue: formData.vehicleValue,
                        premiumRate: formData.premiumRate,
                        coverType: formData.coverType,
                        usage: formData.usage,
                    }),
                ) as any
            ).unwrap()

            setCalculatedPremium((prev) => ({
                ...prev,
                basicPremium: result.basicPremium,
            }))

            toast({
                description: `Basic Premium: ${formatCurrency(result.basicPremium)}`,
                variant: "success",
                duration: 2000,
            })
        } catch (err: any) {
            toast({
                description: "Failed to calculate basic premium",
                variant: "destructive",
                duration: 2000,
            })
        } finally {
            setCalculatingStep(null)
        }
    }

    const handleCalculateStep2 = async () => {
        if (!calculatedPremium.basicPremium) {
            toast({
                description: "Calculate basic premium first",
                variant: "warning",
                duration: 2000,
            })
            return
        }

        setCalculatingStep("step2")
        try {
            const result = await (
                dispatch(
                    applyDiscounts({
                        basicPremium: calculatedPremium.basicPremium,
                        vehicleValue: formData.vehicleValue,
                        discounts: formData.discounts,
                    }),
                ) as any
            ).unwrap()

            setCalculatedPremium((prev) => ({
                ...prev,
                premiumAfterDiscounts: result.premiumAfterDiscounts,
            }))


            toast({
                description: `Premium After Discounts: ${formatCurrency(result.premiumAfterDiscounts)}`,
                variant: "success",
                duration: 2000,
            })
        } catch (err: any) {
            toast({
                description: "Failed to apply discounts",
                variant: "destructive",
                duration: 2000,
            })
        } finally {
            setCalculatingStep(null)
        }

        if (!calculatedPremium.premiumAfterDiscounts) {
            toast({
                description: "Apply discounts first",
                variant: "warning",
                duration: 2000,
            })
            return
        }


        setCalculatingStep("step3")
        try {
            const result = await (
                dispatch(
                    applyLoadings({
                        premiumAfterDiscounts: calculatedPremium.premiumAfterDiscounts,
                        vehicleValue: formData.vehicleValue,
                        loadings: formData.loadings,
                    }),
                ) as any
            ).unwrap()

            setCalculatedPremium((prev) => ({
                ...prev,
                grossPremium: result.grossPremium,
            }))

            toast({
                description: `Gross Premium: ${formatCurrency(result.grossPremium)}`,
                variant: "success",
                duration: 2000,
            })
        } catch (err: any) {
            if (err?.status == 400) {
                toast({
                    description: "",
                    variant: "destructive",
                    duration: 2000,
                })
            } else {
                toast({
                    description: "Failed to apply loadings",
                    variant: "destructive",
                    duration: 2000,
                })
            }
            console.log(err)

        } finally {
            setCalculatingStep(null)
        }
    }

    const handleCalculateStep3 = async () => {

    }

    const handleCalculateStep4 = async () => {
        if (!calculatedPremium.grossPremium) {
            toast({
                description: "Apply loadings first",
                variant: "warning",
                duration: 2000,
            })
            return
        }

        setCalculatingStep("step4")
        try {
            const result = await (
                dispatch(
                    calculateFinalPremium({
                        grossPremium: calculatedPremium.grossPremium,
                        trackingCost: formData.trackingCost,
                        rescueCost: formData.rescueCost,
                    }),
                ) as any
            ).unwrap()

            setCalculatedPremium((prev) => ({
                ...prev,
                netPremium: result.netPremium,
            }))

            toast({
                description: `Net Premium: ${formatCurrency(result.netPremium)}`,
                variant: "success",
                duration: 2000,
            })
        } catch (err: any) {
            toast({
                description: "Failed to calculate final premium",
                variant: "destructive",
                duration: 2000,
            })
        } finally {
            setCalculatingStep(null)
        }
    }

    const handleSave = () => {
        if (!formData.vehicleRegNo || !formData.vehicleType) {
            toast({
                description: "Please fill in vehicle registration and type",
                variant: "warning",
                duration: 2000,
            })
            return
        }

        handleCalculateStep4()
        onSave(formData)
        setFormData(initialForm())
        setCalculatedPremium({})
    }

    const formatCurrency = (amount: number | null | undefined) => {
        if (amount === null || amount === undefined) return "N/A"
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
        }).format(amount)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="add-vehicle-modal">
                <DialogHeader>
                    <DialogTitle>{vehicle ? "Edit Vehicle" : "Add New Vehicle"}</DialogTitle>
                </DialogHeader>

                <div className="modal-content">
                    {/* Vehicle Information */}
                    <div className="form-section">
                        <h4>Vehicle Information</h4>
                        <div className="form-grid">
                            <div className="form-field">
                                <Label htmlFor="vehicleRegNo">Registration No *</Label>
                                <Input
                                    id="vehicleRegNo"
                                    value={formData.vehicleRegNo}
                                    onChange={(e) => handleInputChange("vehicleRegNo", e.target.value)}
                                    placeholder="e.g., ABC-123-XY"
                                />
                            </div>

                            <div className="form-field">
                                <Label htmlFor="vehicleType">Vehicle Type *</Label>
                                <select
                                    id="vehicleType"
                                    value={formData.vehicleType}
                                    onChange={(e) => handleInputChange("vehicleType", e.target.value)}
                                    className="form-select"
                                >
                                    <option value="">Select Type</option>
                                    <option value="Private Car">Private Car</option>
                                    <option value="Commercial Vehicle">Commercial Vehicle</option>
                                    <option value="Motorcycle">Motorcycle</option>
                                    <option value="Truck">Truck</option>
                                    <option value="Bus">Bus</option>
                                </select>
                            </div>

                            <div className="form-field">
                                <Label htmlFor="vehicleMake">Make</Label>
                                <Input
                                    id="vehicleMake"
                                    value={formData.vehicleMake}
                                    onChange={(e) => handleInputChange("vehicleMake", e.target.value)}
                                    placeholder="e.g., Toyota"
                                />
                            </div>

                            <div className="form-field">
                                <Label htmlFor="vehicleModel">Model</Label>
                                <Input
                                    id="vehicleModel"
                                    value={formData.vehicleModel}
                                    onChange={(e) => handleInputChange("vehicleModel", e.target.value)}
                                    placeholder="e.g., Camry"
                                />
                            </div>

                            <div className="form-field">
                                <Label htmlFor="modelYear">Model Year</Label>
                                <Input
                                    id="modelYear"
                                    type="number"
                                    value={formData.modelYear}
                                    onChange={(e) => handleInputChange("modelYear", e.target.value)}
                                />
                            </div>

                            <div className="form-field">
                                <Label htmlFor="color">Color</Label>
                                <Input
                                    id="color"
                                    value={formData.color}
                                    onChange={(e) => handleInputChange("color", e.target.value)}
                                    placeholder="e.g., Silver"
                                />
                            </div>

                            <div className="form-field">
                                <Label htmlFor="chassisNo">Chassis No</Label>
                                <Input
                                    id="chassisNo"
                                    value={formData.chassisNo}
                                    onChange={(e) => handleInputChange("chassisNo", e.target.value)}
                                />
                            </div>

                            <div className="form-field">
                                <Label htmlFor="engineNo">Engine No</Label>
                                <Input
                                    id="engineNo"
                                    value={formData.engineNo}
                                    onChange={(e) => handleInputChange("engineNo", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Coverage Information */}
                    <div className="form-section">
                        <h4>Coverage Information</h4>
                        <div className="form-grid">
                            <div className="form-field">
                                <Label htmlFor="coverType">Cover Type *</Label>
                                <select
                                    id="coverType"
                                    value={formData.coverType}
                                    onChange={(e) => handleInputChange("coverType", e.target.value)}
                                    className="form-select"
                                >
                                    <option value="Comprehensive">Comprehensive</option>
                                    <option value="Third Party">Third Party</option>
                                    <option value="Third Party Fire & Theft">Third Party Fire & Theft</option>
                                </select>
                            </div>

                            <div className="form-field">
                                <Label htmlFor="usage">Usage *</Label>
                                <select
                                    id="usage"
                                    value={formData.usage}
                                    onChange={(e) => handleInputChange("usage", e.target.value)}
                                    className="form-select"
                                >
                                    <option value="Private">Private</option>
                                    <option value="Commercial">Commercial</option>
                                    <option value="Hire">Hire</option>
                                </select>
                            </div>

                            <div className="form-field">
                                <Label htmlFor="vehicleValue">Vehicle Value *</Label>
                                <Input
                                    id="vehicleValue"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.vehicleValue}
                                    onChange={(e) => handleInputChange("vehicleValue", e.target.value)}
                                />
                            </div>

                            <div className="form-field">
                                <Label htmlFor="premiumRate">Premium Rate (%) *</Label>
                                <Input
                                    id="premiumRate"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={formData.premiumRate}
                                    onChange={(e) => handleInputChange("premiumRate", e.target.value)}
                                />
                            </div>

                            <div className="form-field">
                                <Label htmlFor="seatCapacity">Seat Capacity</Label>
                                <Input
                                    id="seatCapacity"
                                    type="number"
                                    min="0"
                                    value={formData.seatCapacity}
                                    onChange={(e) => handleInputChange("seatCapacity", e.target.value)}
                                />
                            </div>

                            <div className="form-field">
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    value={formData.location}
                                    onChange={(e) => handleInputChange("location", e.target.value)}
                                    placeholder="e.g., Lagos"
                                />
                            </div>
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <div className=""><h5>Calculation Results</h5>
                                {calculatedPremium.basicPremium && (
                                    <div className="result-row">
                                        <span>Basic Premium:</span>
                                        <span>{formatCurrency(calculatedPremium.basicPremium)}</span>
                                    </div>
                                )}
                            </div>
                            <Button className="" onClick={handleCalculateStep1} disabled={calculatingStep !== null} size="sm">
                                {calculatingStep === "step1" ? "Calculating..." : "Calculate Basic Premium"}
                            </Button>
                        </div>
                    </div>

                    {/* Additional Costs */}
                    <div className="form-section">
                        <h4>Additional Costs</h4>
                        <div className="form-grid">
                            <div className="form-field">
                                <Label htmlFor="trackingCost">Tracking Cost</Label>
                                <Input
                                    id="trackingCost"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.trackingCost}
                                    onChange={(e) => handleInputChange("trackingCost", e.target.value)}
                                />
                            </div>

                            <div className="form-field">
                                <Label htmlFor="rescueCost">Rescue Cost</Label>
                                <Input
                                    id="rescueCost"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.rescueCost}
                                    onChange={(e) => handleInputChange("rescueCost", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Discounts */}
                    <div className="form-section">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h4>Discounts ({formData.discounts.length})</h4>
                            <Button onClick={handleAddDiscount} size="sm" variant="outline">
                                Add Discount
                            </Button>
                        </div>
                        <div className="flex flex-col-reverse gap-3">
                            {formData.discounts.map((discount, index) => (
                                <div key={index} className="adjustment-item ">
                                    <div className="flex flex-col">
                                        <div className="form-field">
                                            <Label>Name</Label>
                                            <Input
                                                value={discount.adjustmentName}
                                                onChange={(e) => handleAdjustmentChange("discount", index, "adjustmentName", e.target.value)}
                                                placeholder="e.g., NCB Discount"
                                            />
                                        </div>

                                        <div className="form-field">
                                            <div className="w-full flex justify-between">
                                                <Label>Rate (%)</Label>
                                                <Label className="">Discount: {calculatedPremium.basicPremium ? formatCurrency(calculatedPremium.basicPremium * (discount.rate / 100)) : "N/A"}</Label>
                                            </div>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.01"
                                                value={discount.rate}
                                                onChange={(e) => handleAdjustmentChange("discount", index, "rate", e.target.value)}
                                            />
                                        </div>

                                        <div className="form-field">
                                            <Label>Applied On</Label>
                                            <select
                                                value={discount.appliedOn}
                                                onChange={(e) => handleAdjustmentChange("discount", index, "appliedOn", e.target.value)}
                                                className="form-select"
                                            >
                                                <option value="Premium">Premium</option>
                                                <option value="SumInsured">Sum Insured</option>
                                            </select>
                                        </div>

                                        <Button
                                            onClick={() => handleRemoveDiscount(index)}
                                            size="sm"
                                            variant="outline"
                                            className="remove-btn w-max"
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Loadings */}
                    <div className="form-section">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h4>Loadings ({formData.loadings.length})</h4>
                            <Button onClick={handleAddLoading} size="sm" variant="outline">
                                Add Loading
                            </Button>
                        </div>
                        <div className="flex flex-col-reverse gap-3">
                            {formData.loadings.map((loading, index) => (
                                <div key={index} className="adjustment-item">
                                    <div className="adjustment-grid">
                                        <div className="form-field">
                                            <Label>Name</Label>
                                            <Input
                                                value={loading.adjustmentName}
                                                onChange={(e) => handleAdjustmentChange("loading", index, "adjustmentName", e.target.value)}
                                                placeholder="e.g., Inexperienced Driver"
                                            />
                                        </div>

                                        <div className="form-field">
                                            <div className="w-full flex justify-between">
                                                <Label>Rate (%)</Label>
                                                <Label className="">Loading: {calculatedPremium.basicPremium ? formatCurrency(calculatedPremium.basicPremium * (loading.rate / 100)) : "N/A"}</Label>
                                            </div>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.01"
                                                value={loading.rate}
                                                onChange={(e) => handleAdjustmentChange("loading", index, "rate", e.target.value)}
                                            />
                                        </div>

                                        <div className="form-field">
                                            <Label>Applied On</Label>
                                            <select
                                                value={loading.appliedOn}
                                                onChange={(e) => handleAdjustmentChange("loading", index, "appliedOn", e.target.value)}
                                                className="form-select"
                                            >
                                                <option value="SumInsured">Sum Insured</option>
                                                <option value="Premium">Premium</option>
                                            </select>
                                        </div>

                                        <Button onClick={() => handleRemoveLoading(index)} size="sm" variant="outline" className="remove-btn">
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <Button
                        onClick={async () => {
                            await handleCalculateStep2()
                            handleCalculateStep3()
                        }}
                        disabled={calculatingStep !== null || !calculatedPremium.basicPremium || calculatedPremium.grossPremium}
                        variant="outline"
                        className="h-10"
                    >
                        {calculatedPremium.grossPremium ? (<>
                            Gross Premium : {calculatedPremium.grossPremium}</>) : (
                            <>{(calculatingStep === "step3" || calculatingStep === "step2") ? "Calculating..." : "Apply Discount & Loadings"}</>
                        )}
                    </Button>

                    <div className="modal-actions">
                        <Button disabled={calculatingStep !== null || !calculatedPremium.grossPremium} loading={calculatingStep === "step4"} onClick={handleSave} className="w-[120px]">Save Vehicle</Button>
                        <Button onClick={onClose} variant="outline">
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default AddVehicleModal
