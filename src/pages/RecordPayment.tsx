import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Search } from 'lucide-react';
import { getMembers, getMember, type Member } from '../services/members';
import { recordPayment, getPayment, updatePayment } from '../services/payments';

export const RecordPayment: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState('Auto-generated');

  const [formData, setFormData] = useState({
    transactionDate: new Date().toISOString().split('T')[0],
    paymentMode: 'Cash' as const,
    totalFee: 0,
    discount: 0,
    amountPaid: 0,
  });

  useEffect(() => {
    getMembers().then(setMembers);
    
    // If Editing, load the payment and the associated member
    if (isEditMode && id) {
      getPayment(id).then(async (payment) => {
        if (payment) {
          setInvoiceNumber(payment.invoiceNumber);
          setFormData({
            transactionDate: payment.transactionDate,
            paymentMode: payment.paymentMode as any,
            totalFee: payment.totalFee,
            discount: payment.discount,
            amountPaid: payment.amountPaid,
          });
          const mbr = await getMember(payment.memberId);
          if (mbr) setSelectedMember(mbr);
        }
        setLoading(false);
      });
    }
  }, [id, isEditMode]);

  const handleSelectMember = (m: Member) => {
    setSelectedMember(m);
    setSearch('');
    // Auto-fill fee with remaining balance when adding new payment
    if (!isEditMode) {
      setFormData(prev => ({ ...prev, totalFee: m.balanceDue, amountPaid: m.balanceDue }));
    }
  };

  const balanceDue = Math.max(0, formData.totalFee - formData.discount - formData.amountPaid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return alert("Please select a member first.");
    
    setLoading(true);
    try {
      if (isEditMode && id) {
        await updatePayment(id, {
          memberId: selectedMember.id,
          memberName: selectedMember.fullName,
          membershipId: selectedMember.membershipId,
          ...formData,
          balanceDue
        });
        navigate(`/payments/invoice/${id}`);
      } else {
        const paymentId = await recordPayment({
          memberId: selectedMember.id,
          memberName: selectedMember.fullName,
          membershipId: selectedMember.membershipId,
          ...formData,
          balanceDue
        });
        navigate(`/payments/invoice/${paymentId}`); 
      }
    } catch (error) {
      alert(`Failed to ${isEditMode ? 'update' : 'record'} payment`);
    } finally {
      setLoading(false);
    }
  };

  const searchResults = members.filter(m => {
    if (!search) return false;
    const s = search.toLowerCase();
    return (
      m.fullName.toLowerCase().includes(s) || 
      m.membershipId.toLowerCase().includes(s) ||
      m.mobileNumber.includes(s) ||
      (m.email && m.email.toLowerCase().includes(s))
    );
  });

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#2563EB]" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 sm:pb-8">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100"><ArrowLeft className="w-5 h-5 text-[#6B7280]" /></button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1F2937]">{isEditMode ? 'Edit Payment' : 'Record Payment'}</h1>
          <p className="text-sm text-[#6B7280] hidden sm:block">Manage all membership payment records</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Col: Member Selection */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-sm">
            <h3 className="font-bold text-[#1F2937] mb-3">Member Selection</h3>
            
            {!selectedMember ? (
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-[#9CA3AF]" />
                <input type="text" placeholder="Name, ID, Mobile, Email..." value={search} onChange={e => setSearch(e.target.value)} className="w-full h-11 pl-10 pr-3 rounded-lg border border-[#E5E7EB] outline-none focus:border-[#2563EB] text-sm" />
                {search && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-[#E5E7EB] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.length > 0 ? searchResults.map(m => (
                        <button key={m.id} type="button" onClick={() => handleSelectMember(m)} className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-0">
                          <div className="font-medium text-[#1F2937]">{m.fullName}</div>
                          <div className="text-xs text-[#6B7280]">{m.membershipId} • Due: ₹{m.balanceDue}</div>
                          <div className="text-[10px] text-[#9CA3AF]">{m.mobileNumber}</div>
                        </button>
                      )) : <div className="p-4 text-center text-sm text-[#6B7280]">No members found</div>}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg border border-[#E5E7EB] relative">
                {!isEditMode && <button type="button" onClick={() => setSelectedMember(null)} className="absolute top-3 right-3 text-xs text-[#2563EB] font-medium">Change</button>}
                <div className="text-sm text-[#6B7280] mb-1">Selected Member:</div>
                <div className="font-bold text-[#1F2937] text-lg">{selectedMember.fullName}</div>
                <div className="text-sm text-[#4B5563] mt-2">Membership ID: <span className="font-medium">{selectedMember.membershipId}</span></div>
                <div className="text-sm text-[#4B5563]">Plan: <span className="font-medium">{selectedMember.planType}</span></div>
                <div className="text-sm text-[#4B5563]">Current Balance: <span className="font-medium text-[#DC2626]">₹{selectedMember.balanceDue}</span></div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Payment Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-5 sm:p-6 rounded-xl border border-[#E5E7EB] shadow-sm space-y-5">
            <h3 className="font-bold text-[#1F2937] border-b pb-3">Payment Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-xs font-medium text-[#6B7280] mb-1">Invoice Number</label><input type="text" readOnly value={invoiceNumber} className="w-full h-11 px-3 rounded-lg border border-[#E5E7EB] bg-gray-50 text-[#9CA3AF] outline-none font-medium" /></div>
              <div><label className="block text-xs font-medium text-[#6B7280] mb-1">Transaction Date</label><input type="date" required value={formData.transactionDate} onChange={e => setFormData({...formData, transactionDate: e.target.value})} className="w-full h-11 px-3 rounded-lg border border-[#E5E7EB] outline-none focus:border-[#2563EB]" /></div>
              <div className="sm:col-span-2"><label className="block text-xs font-medium text-[#6B7280] mb-1">Payment Mode</label><select value={formData.paymentMode} onChange={e => setFormData({...formData, paymentMode: e.target.value as any})} className="w-full h-11 px-3 rounded-lg border border-[#E5E7EB] outline-none bg-white focus:border-[#2563EB]"><option>Cash</option><option>UPI</option><option>Card</option><option>Bank Transfer</option></select></div>
              
              <div><label className="block text-xs font-medium text-[#6B7280] mb-1">Total Fee (₹)</label><input type="number" required value={formData.totalFee} onChange={e => setFormData({...formData, totalFee: Number(e.target.value)})} className="w-full h-11 px-3 rounded-lg border border-[#E5E7EB] outline-none focus:border-[#2563EB]" /></div>
              <div><label className="block text-xs font-medium text-[#6B7280] mb-1">Discount (₹)</label><input type="number" value={formData.discount} onChange={e => setFormData({...formData, discount: Number(e.target.value)})} className="w-full h-11 px-3 rounded-lg border border-[#E5E7EB] outline-none focus:border-[#2563EB]" /></div>
              <div><label className="block text-xs font-medium text-[#6B7280] mb-1">Amount Paid (₹)</label><input type="number" required value={formData.amountPaid} onChange={e => setFormData({...formData, amountPaid: Number(e.target.value)})} className="w-full h-11 px-3 rounded-lg border border-[#E5E7EB] outline-none focus:border-[#2563EB]" /></div>
              
              <div className="bg-[#2563EB]/5 border border-[#2563EB]/20 rounded-lg p-3 flex flex-col justify-center">
                <div className="text-xs font-medium text-[#2563EB] mb-1">Balance Due</div>
                <div className="text-xl font-bold text-[#1F2937]">₹{balanceDue}</div>
              </div>
            </div>

            <div className="pt-4 flex gap-3 justify-end border-t border-[#E5E7EB]">
              <button type="button" onClick={() => navigate(-1)} className="h-11 px-6 rounded-lg font-medium text-[#6B7280] border border-[#E5E7EB] hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={loading} className="h-11 px-8 rounded-lg font-medium text-white bg-[#2563EB] hover:bg-[#1D4ED8] flex items-center">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (isEditMode ? 'Update Payment' : 'Save Payment')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};