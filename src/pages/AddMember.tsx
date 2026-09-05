import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Loader2 } from 'lucide-react';
import { addMember } from '../services/members';

export const AddMember: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Auto-generate an ID like M-1234
  const [membershipId] = useState(`M-${Math.floor(1000 + Math.random() * 9000)}`);
  
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    email: '',
    dateOfBirth: '',
    gender: 'Male',
    planType: 'Monthly',
    accessShift: 'Morning',
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    totalFee: 0,
    discount: 0,
    amountPaid: 0,
  });

  // Handle Profile Pic selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePic(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  // Auto-calculate Expiry Date based on Plan Type & Start Date
  useEffect(() => {
    if (!formData.startDate) return;
    const start = new Date(formData.startDate);
    let expiry = new Date(start);
    
    if (formData.planType === 'Monthly') expiry.setMonth(start.getMonth() + 1);
    else if (formData.planType === '3 Months') expiry.setMonth(start.getMonth() + 3);
    else if (formData.planType === 'Half-Yearly') expiry.setMonth(start.getMonth() + 6);
    else if (formData.planType === 'Annual') expiry.setFullYear(start.getFullYear() + 1);
    
    setFormData(prev => ({ ...prev, expiryDate: expiry.toISOString().split('T')[0] }));
  }, [formData.startDate, formData.planType]);

  const balanceDue = Math.max(0, formData.totalFee - formData.discount - formData.amountPaid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addMember({
        ...formData,
        membershipId,
        balanceDue,
        status: 'Active',
        profilePicUrl: null, // <-- FIX: Explicitly pass null for TS validation
      }, profilePic);
      navigate('/members');
    } catch (error) {
      console.error("Error creating member:", error);
      alert("Failed to create member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24 sm:pb-8">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/members')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-[#6B7280]">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-[#1F2937]">Add New Member</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Profile Pic Section */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-sm flex flex-col items-center justify-center">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-[#F3F4F6] border-2 border-dashed border-[#D1D5DB] flex items-center justify-center overflow-hidden">
              {profilePicPreview ? (
                <img src={profilePicPreview} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <Camera className="h-8 w-8 text-[#9CA3AF]" />
              )}
            </div>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
          <p className="text-sm font-medium text-[#2563EB] mt-3">Upload Photo (Optional)</p>
        </div>

        {/* Basic Details */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-sm space-y-4">
          <h2 className="font-bold text-[#1F2937] border-b pb-2">Basic Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#6B7280] mb-1">Full Name *</label>
              <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full h-11 px-3 rounded-lg border border-[#E5E7EB] outline-none focus:border-[#2563EB]" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B7280] mb-1">Phone Number *</label>
              <input type="tel" required value={formData.mobileNumber} onChange={e => setFormData({...formData, mobileNumber: e.target.value})} className="w-full h-11 px-3 rounded-lg border border-[#E5E7EB] outline-none focus:border-[#2563EB]" placeholder="1234567890" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B7280] mb-1">Email Address</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full h-11 px-3 rounded-lg border border-[#E5E7EB] outline-none focus:border-[#2563EB]" placeholder="john@example.com" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1">Date of Birth</label>
                <input type="date" value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} className="w-full h-11 px-3 rounded-lg border border-[#E5E7EB] outline-none focus:border-[#2563EB]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1">Gender</label>
                <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full h-11 px-3 rounded-lg border border-[#E5E7EB] outline-none bg-white focus:border-[#2563EB]">
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Membership Details */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-sm space-y-4">
          <h2 className="font-bold text-[#1F2937] border-b pb-2">Membership Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#6B7280] mb-1">Membership ID</label>
              <input type="text" readOnly value={membershipId} className="w-full h-11 px-3 rounded-lg border border-[#E5E7EB] bg-gray-50 text-gray-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B7280] mb-1">Plan</label>
              <select value={formData.planType} onChange={e => setFormData({...formData, planType: e.target.value})} className="w-full h-11 px-3 rounded-lg border border-[#E5E7EB] outline-none bg-white focus:border-[#2563EB]">
                <option>Monthly</option>
                <option>3 Months</option>
                <option>Half-Yearly</option>
                <option>Annual</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B7280] mb-1">Start Date</label>
              <input type="date" required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full h-11 px-3 rounded-lg border border-[#E5E7EB] outline-none focus:border-[#2563EB]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B7280] mb-1">Expiry Date (Auto)</label>
              <input type="date" readOnly value={formData.expiryDate} className="w-full h-11 px-3 rounded-lg border border-[#16A34A]/30 bg-[#16A34A]/5 text-[#16A34A] font-medium outline-none" />
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-sm space-y-4">
          <h2 className="font-bold text-[#1F2937] border-b pb-2">Initial Payment</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#6B7280] mb-1">Total Fee (₹)</label>
              <input type="number" required value={formData.totalFee} onChange={e => setFormData({...formData, totalFee: Number(e.target.value)})} className="w-full h-11 px-3 rounded-lg border border-[#E5E7EB] outline-none focus:border-[#2563EB]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B7280] mb-1">Discount (₹)</label>
              <input type="number" value={formData.discount} onChange={e => setFormData({...formData, discount: Number(e.target.value)})} className="w-full h-11 px-3 rounded-lg border border-[#E5E7EB] outline-none focus:border-[#2563EB]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B7280] mb-1">Amount Paid (₹)</label>
              <input type="number" required value={formData.amountPaid} onChange={e => setFormData({...formData, amountPaid: Number(e.target.value)})} className="w-full h-11 px-3 rounded-lg border border-[#E5E7EB] outline-none focus:border-[#2563EB]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B7280] mb-1">Balance Due (₹)</label>
              <input type="number" readOnly value={balanceDue} className={`w-full h-11 px-3 rounded-lg border font-bold outline-none ${balanceDue > 0 ? 'border-red-200 bg-red-50 text-red-600' : 'border-gray-200 bg-gray-50 text-gray-500'}`} />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 sm:justify-end pt-2">
          <button type="button" onClick={() => navigate('/members')} className="flex-1 sm:flex-none h-12 px-6 rounded-lg font-medium text-[#6B7280] border border-[#E5E7EB] bg-white hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="flex-1 sm:flex-none h-12 px-8 rounded-lg font-medium text-white bg-[#2563EB] hover:bg-[#1D4ED8] flex items-center justify-center">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Member'}
          </button>
        </div>

      </form>
    </div>
  );
};