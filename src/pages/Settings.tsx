import React, { useState, useEffect } from 'react';
import { ListChecks, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
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

  // Fetch data on load
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

  // --- Handlers for Plans ---
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
      if (editingPlan) {
        await updatePlan(editingPlan.id, planForm);
      } else {
        await addPlan(planForm);
      }
      setShowPlanModal(false);
      const plansData = await getPlans();
      setPlans(plansData);
    } catch (err) {
      alert("Failed to save plan.");
    }
    setSaving(false);
  };

  const handleDeletePlan = async (id: string) => {
    if (!window.confirm("Delete this membership plan?")) return;
    try {
      await deletePlan(id);
      setPlans(plans.filter(p => p.id !== id));
    } catch (err) {
      alert("Failed to delete plan.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563EB]" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24 sm:pb-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">Settings</h1>
        <p className="text-sm text-[#6B7280]">Manage membership plans</p>
      </div>

      {/* MEMBERSHIP PLANS */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#E5E7EB] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-[#2563EB]" />
            <h3 className="font-bold text-[#1F2937] text-lg">Membership Plans</h3>
          </div>
          <button 
            onClick={openAddPlan} 
            className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-[#1D4ED8] flex items-center gap-2"
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
                  <td colSpan={4} className="px-6 py-8 text-center text-[#6B7280]">
                    No plans created yet.
                  </td>
                </tr>
              ) : null}
              {plans.map(p => (
                <tr key={p.id} className="hover:bg-[#F9FAFB]">
                  <td className="px-6 py-4 font-medium text-[#1F2937]">{p.name}</td>
                  <td className="px-6 py-4 text-[#4B5563]">{p.duration}</td>
                  <td className="px-6 py-4 font-medium text-[#16A34A]">₹{p.price}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => openEditPlan(p)} 
                      className="p-1.5 text-[#6B7280] hover:text-[#2563EB] mr-2 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeletePlan(p.id)} 
                      className="p-1.5 text-[#6B7280] hover:text-[#DC2626] transition-colors"
                    >
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSavePlan} className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-xl font-bold text-[#1F2937] mb-4">
              {editingPlan ? 'Edit Plan' : 'Create New Plan'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#4B5563] mb-1">Plan Name</label>
                <input 
                  type="text" 
                  placeholder="e.g., Monthly, Annual" 
                  required 
                  value={planForm.name} 
                  onChange={e => setPlanForm({...planForm, name: e.target.value})} 
                  className="w-full h-11 px-3 rounded-lg border border-[#E5E7EB] outline-none focus:border-[#2563EB]" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4B5563] mb-1">Duration</label>
                <input 
                  type="text" 
                  placeholder="e.g., 1 Month, 12 Months" 
                  required 
                  value={planForm.duration} 
                  onChange={e => setPlanForm({...planForm, duration: e.target.value})} 
                  className="w-full h-11 px-3 rounded-lg border border-[#E5E7EB] outline-none focus:border-[#2563EB]" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4B5563] mb-1">Price (₹)</label>
                <input 
                  type="number" 
                  required 
                  value={planForm.price || ''} 
                  onChange={e => setPlanForm({...planForm, price: Number(e.target.value)})} 
                  className="w-full h-11 px-3 rounded-lg border border-[#E5E7EB] outline-none focus:border-[#2563EB]" 
                />
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-6">
              <button 
                type="button" 
                onClick={() => setShowPlanModal(false)} 
                className="px-5 py-2.5 rounded-lg font-medium text-[#6B7280] hover:bg-gray-100"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={saving} 
                className="px-5 py-2.5 bg-[#2563EB] text-white rounded-lg font-medium hover:bg-[#1D4ED8] flex items-center"
              >
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