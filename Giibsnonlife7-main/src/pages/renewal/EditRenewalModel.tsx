import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { updateRenewal } from "../../features/reducers/renewalReducers/renewalSlice";
import { AppDispatch } from "../../features/store";
import { Renewal } from "../../types/renewal";
import { X } from 'lucide-react';

interface EditRenewalModelProps {
  renewal: Renewal;
  onClose: () => void;
}

const EditRenewalModel: React.FC<EditRenewalModelProps> = ({ renewal, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  
  const [formData, setFormData] = useState({
    policyNo: renewal.policyNo || '',
    insuredName: renewal.insuredName || '',
    email: renewal.email || '',
    mobilePhone: renewal.mobilePhone || '',
    startDate: renewal.startDate?.split('T')[0] || '',
    expiryDate: renewal.expiryDate?.split('T')[0] || '',
    renewalDate: renewal.renewalDate?.split('T')[0] || '',
    grossPremium: renewal.grossPremium || 0,
    sumInsured: renewal.sumInsured || 0,
    adjustedRate: renewal.adjustedRate || 0,
    channels: renewal.channels || '',
    subriskName: renewal.subriskName || '',
    partyName: renewal.partyName || '',
    mKtStaff: renewal.mKtStaff || '',
    tag: renewal.tag || '',
    remarks: renewal.remarks || '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

const handleSave = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const updateData = {
      ...formData,
      renewalID: Number(renewal.renewalID),
      sumInsured: Number(formData.sumInsured) || 0,
      grossPremium: Number(formData.grossPremium) || 0,
      adjustedRate: Number(formData.adjustedRate) || 0,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
      expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : undefined,
      renewalDate: formData.renewalDate ? new Date(formData.renewalDate).toISOString() : undefined,
      modifiedOn: new Date().toISOString(),
      modifiedBy: "current_user"
    };

    console.log('📤 Sending update for renewal ID:', renewal.renewalID);
    console.log('📤 Update data:', updateData);

    const result = await dispatch(updateRenewal({
      id: renewal.renewalID,
      data: updateData
    })).unwrap();

    console.log('✅ Update successful:', result);
    alert('Renewal updated successfully!');
    onClose();

  } catch (error: any) {
    console.error('❌ Update error:', error);
    alert(`Error: ${error.response?.data?.message || error.message || 'Failed to update renewal.'}`);
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Edit Renewal</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Policy Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Policy Number *</label>
              <input
                type="text"
                name="policyNo"
                value={formData.policyNo}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Insured Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Insured Name *</label>
              <input
                type="text"
                name="insuredName"
                value={formData.insuredName}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Mobile Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Phone</label>
              <input
                type="tel"
                name="mobilePhone"
                value={formData.mobilePhone}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Renewal Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Renewal Date</label>
              <input
                type="date"
                name="renewalDate"
                value={formData.renewalDate}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Gross Premium */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gross Premium</label>
              <input
                type="number"
                name="grossPremium"
                value={formData.grossPremium}
                onChange={handleChange}
                step="0.01"
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Sum Insured */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sum Insured</label>
              <input
                type="number"
                name="sumInsured"
                value={formData.sumInsured}
                onChange={handleChange}
                step="0.01"
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Adjusted Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adjusted Rate (%)</label>
              <input
                type="number"
                name="adjustedRate"
                value={formData.adjustedRate}
                onChange={handleChange}
                step="0.01"
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Channel */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
              <select
                name="channels"
                value={formData.channels}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select Channel</option>
                <option value="Direct">Direct</option>
                <option value="Agent">Agent</option>
                <option value="Broker">Broker</option>
                <option value="Online">Online</option>
                <option value="Corporate">Corporate</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="tag"
                value={formData.tag}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select Status</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Expired">Expired</option>
                <option value="Renewed">Renewed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Subrisk Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Subrisk Name</label>
              <input
                type="text"
                name="subriskName"
                value={formData.subriskName}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Party Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Party Name</label>
              <input
                type="text"
                name="partyName"
                value={formData.partyName}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Marketing Staff */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marketing Staff</label>
              <input
                type="text"
                name="mKtStaff"
                value={formData.mKtStaff}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows={3}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRenewalModel;