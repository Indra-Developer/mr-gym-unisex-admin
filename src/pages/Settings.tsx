// File: src/pages/Settings.tsx
import React, { useState, useEffect } from 'react';
import { ListChecks, Plus, Edit, Trash2, Loader2, Store, Save } from 'lucide-react';
import { 
  getPlans, addPlan, updatePlan, deletePlan,
  type Plan 
} from '../services/settings';

export const Settings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  
  // Plan Modal State
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [planForm, setPlanForm] = useState({ name: '', duration: '', price: 0 });

  // Gym Profile State
  const [gymProfile, setGymProfile] = useState({
    name: 'MR GYM',
    phone: '+91 9876543210',
    address: '123 Fitness Street, Main Road',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const plansData = await getPlans();
      setPlans(plansData);
    } catch (err) {
      console.error("Failed to load plans", err);
    }
    setLoading(false);
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  const openAddPlan = () => {
    setEditingPlan(null);
    setPlanForm({ name: '', duration: '', price: 0 });
    setShowPlanModal(true);
  };

  const openEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setPlanForm({ name: plan.name, duration: plan.duration, price: plan.price });
    setShowPlanModal(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: planForm.name.trim(),
        duration: planForm.duration.trim(),
        price: Number(planForm.price)
      };

      if (editingPlan) {
        await updatePlan(editingPlan.id, payload);
      } else {
        await addPlan(payload);
      }
      
      setShowPlanModal(false);
      const plansData = await getPlans();
      setPlans(plansData);
      
    } catch (err) {
      console.error(err);
      alert("Failed to save plan. Check your database rules.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this membership plan?")) return;
    try {
      await deletePlan(id);
      setPlans(plans.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete plan.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563EB]" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24 sm:pb-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">Settings</h1>
        <p className="text-sm text-[#6B7280]">Manage gym profile and membership plans</p>
      </div>

      {/* GYM PROFILE SETTINGS */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden p-6">
        <div className="flex items-center gap-2 mb-4 border-b border-[#E5E7EB] pb-3">
          <Store className="w-5 h-5 text-[#2563EB]" />
          <h3 className="font-bold text-[#1F2937] text-lg">Gym Profile</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1">Gym Name</label>
            <input type="text" value={gymProfile.name} onChange={e => setGymProfile({...gymProfile, name: e.target.value})} className="w-full h-11 px-3 rounded-lg border border-[#E5E7EB] outline-none focus:border-[#2563EB] text-[#1F2937]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1">Contact Phone</label>
            <input type="text" value={gymProfile.phone} onChange={e => setGymProfile({...gymProfile, phone: e.target.value})} className="w-full h-11 px-3 rounded-lg border border-[#E5E7EB] outline-none focus:border-[#2563EB] text-[#1F2937]" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1">Gym Address</label>
            <input type="text" value={gymProfile.address} onChange={e => setGymProfile({...gymProfile, address: e.target.value})} className="w-full h-11 px-3 rounded-lg border border-[#E5E7EB] outline-none focus:border-[#2563EB] text-[#1F2937]" />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="px-4 py-2 bg-gray-100 text-[#4B5563] rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center gap-2 transition-colors">
            <Save className="w-4 h-4" /> Save Profile
          </button>
        </div>
      </div>

      {/* MEMBERSHIP PLANS */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#E5E7EB] flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-[#2563EB]" />
            <h3 className="font-bold text-[#1F2937] text-lg">Membership Plans</h3>
          </div>
          <button 
            onClick={openAddPlan} 
            className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-[#1D4ED8] flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Plan
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#6B7280]">
              <tr>
                <th className="px-6 py-3 font-medium">Plan Name</th>
                <th className="px-6 py-3 font-medium">Duration</th>
                <th className="px-6 py-3 font-medium">Price (₹)</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {plans.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-[#6B7280]">
                    No plans created yet. Click "Add Plan" to create your first membership tier.
                  </td>
                </tr>
              ) : null}
              {plans.map(p => (
                <tr key={p.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-6 py-4 font-bold text-[#1F2937]">{p.name}</td>
                  <td className="px-6 py-4 text-[#4B5563]">{p.duration}</td>
                  <td className="px-6 py-4 font-bold text-[#16A34A]">₹{p.price}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openEditPlan(p)} title="Edit Plan" className="p-1.5 text-[#6B7280] bg-gray-50 border border-[#E5E7EB] rounded-md hover:text-[#2563EB] mr-2 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeletePlan(p.id)} title="Delete Plan" className="p-1.5 text-[#6B7280] bg-gray-50 border border-[#E5E7EB] rounded-md hover:text-[#DC2626] transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PLAN FORM MODAL */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <form onSubmit={handleSavePlan} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-[#1F2937] mb-5 border-b border-[#E5E7EB] pb-3">
              {editingPlan ? 'Edit Membership Plan' : 'Create New Plan'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1">Plan Name</label>
                <input type="text" placeholder="e.g., Monthly, Annual, VIP" required value={planForm.name} onChange={e => setPlanForm({...planForm, name: e.target.value})} className="w-full h-11 px-3 rounded-lg border border-[#E5E7EB] outline-none focus:border-[#2563EB] text-[#1F2937]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1">Duration</label>
                <input type="text" placeholder="e.g., 1 Month, 12 Months" required value={planForm.duration} onChange={e => setPlanForm({...planForm, duration: e.target.value})} className="w-full h-11 px-3 rounded-lg border border-[#E5E7EB] outline-none focus:border-[#2563EB] text-[#1F2937]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1">Price (₹)</label>
                <input type="number" placeholder="e.g., 1500" required value={planForm.price === 0 ? '' : planForm.price} onChange={e => setPlanForm({...planForm, price: Number(e.target.value)})} className="w-full h-11 px-3 rounded-lg border border-[#E5E7EB] outline-none focus:border-[#2563EB] text-[#1F2937]" />
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-8 pt-4 border-t border-[#E5E7EB]">
              <button type="button" onClick={() => setShowPlanModal(false)} className="px-5 py-2.5 rounded-lg font-medium text-[#4B5563] border border-[#E5E7EB] hover:bg-gray-50 transition-colors">Cancel</button>
              <button type="submit" disabled={saving} className="px-5 py-2.5 bg-[#2563EB] text-white rounded-lg font-medium hover:bg-[#1D4ED8] flex items-center transition-colors shadow-sm">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} 
                {editingPlan ? 'Update Plan' : 'Save Plan'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};