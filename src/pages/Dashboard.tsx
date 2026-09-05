import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, CalendarClock, IndianRupee, Plus, Loader2, CreditCard, ArrowRight } from 'lucide-react';
import { getMembers, type Member } from '../services/members';
import { getPayments, type Payment } from '../services/payments';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [expiriesLimit, setExpiriesLimit] = useState(5);
  const [paymentsLimit, setPaymentsLimit] = useState(5);

  useEffect(() => {
    Promise.all([getMembers(), getPayments()]).then(([membersData, paymentsData]) => {
      setMembers(membersData);
      setPayments(paymentsData);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-[#2563EB]" /></div>;
  }

  // --- DYNAMIC CALCULATIONS ---
  const today = new Date();
  
  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === 'Active').length;
  const expiredMembers = members.filter(m => m.status === 'Expired').length;
  const frozenMembers = members.filter(m => m.status === 'Frozen').length;
  const cancelledMembers = members.filter(m => m.status === 'Cancelled').length;

  const pendingBalance = members.reduce((sum, m) => sum + (m.balanceDue || 0), 0);

  const expiringSoonList = members.filter(m => {
    if (m.status === 'Expired' || m.status === 'Cancelled') return false;
    const expDate = new Date(m.expiryDate);
    const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  });

  const stats = [
    { label: 'Total Members', value: totalMembers.toString(), trend: 'Overall', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Members', value: activeMembers.toString(), trend: 'Current', icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Expiring Soon', value: expiringSoonList.length.toString(), trend: '7 Days', icon: CalendarClock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Pending Payments', value: `₹${new Intl.NumberFormat('en-IN').format(pendingBalance)}`, trend: 'Due', icon: IndianRupee, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  const getPercent = (count: number) => totalMembers > 0 ? Math.round((count / totalMembers) * 100) : 0;
  const activeDash = (getPercent(activeMembers) / 100) * 251;
  const expiredDash = (getPercent(expiredMembers) / 100) * 251;
  const frozenDash = (getPercent(frozenMembers) / 100) * 251;

  // Sorting all expiries
  const allUpcomingExpiries = [...members]
    .filter(m => m.status === 'Active' || m.status === 'Expiring')
    .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

  // Sorting all payments
  const allRecentPayments = [...payments]
    .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());

  // Sliced lists based on 'Load More' limits
  const visibleExpiries = allUpcomingExpiries.slice(0, expiriesLimit);
  const visiblePayments = allRecentPayments.slice(0, paymentsLimit);

  // Avatar Helper
  const Avatar = ({ url, name }: { url?: string | null, name: string }) => (
    url ? (
      <img src={url} alt={name} className="h-8 w-8 rounded-full object-cover border border-gray-200 shrink-0 shadow-sm" />
    ) : (
      <div className="h-8 w-8 rounded-full bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center font-bold text-xs shrink-0 border border-[#2563EB]/20 shadow-sm">
        {name.charAt(0).toUpperCase()}
      </div>
    )
  );

  return (
    <div className="space-y-6">
      
      {/* HEADER & QUICK ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-[#1F2937]">Dashboard Overview</h2>
          <p className="text-sm text-[#6B7280] mt-1">
            Today is {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        
        {/* Quick Action Buttons - Desktop & Mobile Friendly */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button onClick={() => navigate('/members/add')} className="flex-1 md:flex-none px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-[#1D4ED8] transition-colors shadow-sm flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Add Member
          </button>
          <button onClick={() => navigate('/payments/record')} className="flex-1 md:flex-none px-4 py-2 bg-white border border-[#E5E7EB] text-[#1F2937] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center gap-2">
            <CreditCard className="w-4 h-4 text-[#6B7280]" /> Record Payment
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-4 sm:p-5 rounded-xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2 sm:mb-4">
              <span className="text-xs sm:text-sm font-medium text-[#6B7280]">{stat.label}</span>
              <span className="hidden sm:inline-flex text-[10px] sm:text-xs font-semibold text-[#16A34A] bg-[#16A34A]/10 px-2 py-0.5 rounded-full">
                {stat.trend}
              </span>
            </div>
            <div className="flex justify-between items-end">
              <h3 className="text-xl sm:text-3xl font-bold text-[#1F2937]">{stat.value}</h3>
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MIDDLE ROW: CHARTS & EXPIRIES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Donut Chart */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#E5E7EB] shadow-sm col-span-1 h-fit">
          <h3 className="text-base font-bold text-[#1F2937] mb-6">Membership Overview</h3>
          <div className="flex sm:flex-col md:flex-row lg:flex-col xl:flex-row items-center justify-between gap-6">
            
            <div className="relative w-32 h-32 shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#E5E7EB" strokeWidth="12" fill="none" />
                <circle cx="50" cy="50" r="40" stroke="#2563EB" strokeWidth="12" fill="none" strokeDasharray={`${activeDash} 251`} />
                <circle cx="50" cy="50" r="40" stroke="#DC2626" strokeWidth="12" fill="none" strokeDasharray={`${expiredDash} 251`} strokeDashoffset={`-${activeDash}`} />
                <circle cx="50" cy="50" r="40" stroke="#16A34A" strokeWidth="12" fill="none" strokeDasharray={`${frozenDash} 251`} strokeDashoffset={`-${activeDash + expiredDash}`} />
              </svg>
            </div>

            <div className="w-full space-y-3">
              {[
                { label: 'Active', count: activeMembers, percent: getPercent(activeMembers), color: 'bg-[#2563EB]' },
                { label: 'Expired', count: expiredMembers, percent: getPercent(expiredMembers), color: 'bg-[#DC2626]' },
                { label: 'Frozen', count: frozenMembers, percent: getPercent(frozenMembers), color: 'bg-[#16A34A]' },
                { label: 'Cancelled', count: cancelledMembers, percent: getPercent(cancelledMembers), color: 'bg-[#6B7280]' },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <span className={`w-2.5 h-2.5 rounded-full mr-2 ${item.color}`}></span>
                    <span className="text-[#4B5563]">{item.label}</span>
                  </div>
                  <div className="flex space-x-2">
                    <span className="font-medium text-[#1F2937]">{new Intl.NumberFormat('en-IN').format(item.count)}</span>
                    <span className="text-[#9CA3AF] text-xs w-8 text-right">({item.percent}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Expiries */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm col-span-1 lg:col-span-2 overflow-hidden flex flex-col h-fit">
          <div className="p-5 sm:p-6 border-b border-[#E5E7EB] flex justify-between items-center bg-gray-50/50">
            <h3 className="text-base font-bold text-[#1F2937]">Upcoming Expiries</h3>
            <span className="text-xs font-medium bg-amber-100 text-amber-800 px-2 py-1 rounded-md">Top {visibleExpiries.length}</span>
          </div>
          
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="text-[#6B7280] border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  <th className="py-3 px-6 font-medium">Member</th>
                  <th className="py-3 px-6 font-medium">Plan</th>
                  <th className="py-3 px-6 font-medium">Expiry Date</th>
                  <th className="py-3 px-6 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {visibleExpiries.length > 0 ? visibleExpiries.map(m => {
                  const diffDays = Math.ceil((new Date(m.expiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  const statusText = diffDays < 0 ? 'Expired' : diffDays === 0 ? 'Today' : `Due in ${diffDays} days`;
                  
                  return (
                    <tr key={m.id} className="hover:bg-[#F9FAFB] transition-colors cursor-pointer" onClick={() => navigate(`/members/${m.id}`)}>
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <Avatar url={m.profilePicUrl} name={m.fullName} />
                          <div>
                            <div className="font-medium text-[#1F2937]">{m.fullName}</div>
                            <div className="text-xs text-[#6B7280]">{m.membershipId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-6 text-[#4B5563]">{m.planType}</td>
                      <td className="py-3 px-6 text-[#4B5563]">{m.expiryDate}</td>
                      <td className="py-3 px-6">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md border ${diffDays < 0 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                          {statusText}
                        </span>
                      </td>
                    </tr>
                  )
                }) : <tr><td colSpan={4} className="py-6 text-center text-[#6B7280]">No upcoming expiries</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="sm:hidden space-y-0 divide-y divide-[#E5E7EB]">
            {visibleExpiries.length > 0 ? visibleExpiries.map(m => {
              const diffDays = Math.ceil((new Date(m.expiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              const statusText = diffDays < 0 ? 'Expired' : diffDays === 0 ? 'Today' : `Due in ${diffDays} days`;
              
              return (
                <div key={m.id} onClick={() => navigate(`/members/${m.id}`)} className="p-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Avatar url={m.profilePicUrl} name={m.fullName} />
                    <div>
                      <p className="font-semibold text-[#1F2937] text-sm">{m.fullName}</p>
                      <p className="text-xs text-[#6B7280] mt-0.5">{m.planType}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-medium ${diffDays < 0 ? 'text-red-600' : 'text-amber-600'}`}>{statusText}</p>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">{m.expiryDate}</p>
                  </div>
                </div>
              )
            }) : <div className="text-center py-6 text-[#6B7280] text-sm">No upcoming expiries</div>}
          </div>
          
          {allUpcomingExpiries.length > expiriesLimit && (
            <div className="p-3 border-t border-[#E5E7EB] bg-gray-50 text-center">
              <button onClick={() => setExpiriesLimit(prev => prev + 5)} className="text-sm font-medium text-[#2563EB] hover:underline">Load More</button>
            </div>
          )}
        </div>
      </div>

      {/* RECENT PAYMENTS */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden h-fit">
        <div className="p-5 sm:p-6 border-b border-[#E5E7EB] flex justify-between items-center bg-gray-50/50">
          <h3 className="text-base font-bold text-[#1F2937]">Recent Transactions</h3>
          <button onClick={() => navigate('/payments')} className="text-sm font-medium text-[#2563EB] hover:underline flex items-center gap-1">View All <ArrowRight className="w-4 h-4"/></button>
        </div>
        
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="text-[#6B7280] border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <th className="py-3 px-6 font-medium">Member</th>
                <th className="py-3 px-6 font-medium">Transaction Details</th>
                <th className="py-3 px-6 font-medium">Amount</th>
                <th className="py-3 px-6 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {visiblePayments.length > 0 ? visiblePayments.map(p => {
                const member = members.find(m => m.membershipId === p.membershipId);
                return (
                  <tr key={p.id} className="hover:bg-[#F9FAFB] transition-colors cursor-pointer" onClick={() => navigate(`/payments/invoice/${p.id}`)}>
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <Avatar url={member?.profilePicUrl} name={p.memberName} />
                        <div>
                          <div className="font-medium text-[#1F2937]">{p.memberName}</div>
                          <div className="text-xs text-[#6B7280]">{p.membershipId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-[#4B5563]">
                      <div className="font-medium">{p.invoiceNumber}</div>
                      <div className="text-xs text-[#9CA3AF]">{p.transactionDate} • {p.paymentMode}</div>
                    </td>
                    <td className="py-3 px-6 font-bold text-[#1F2937]">₹{new Intl.NumberFormat('en-IN').format(p.amountPaid)}</td>
                    <td className="py-3 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${p.status === 'Paid' ? 'bg-[#16A34A]/10 text-[#16A34A]' : p.status === 'Partial' ? 'bg-[#D97706]/10 text-[#D97706]' : 'bg-[#DC2626]/10 text-[#DC2626]'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${p.status === 'Paid' ? 'bg-[#16A34A]' : p.status === 'Partial' ? 'bg-[#D97706]' : 'bg-[#DC2626]'}`}></span>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                )
              }) : <tr><td colSpan={4} className="py-6 text-center text-[#6B7280]">No recent payments</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="sm:hidden space-y-0 divide-y divide-[#E5E7EB]">
          {visiblePayments.length > 0 ? visiblePayments.map(p => {
            const member = members.find(m => m.membershipId === p.membershipId);
            return (
              <div key={p.id} onClick={() => navigate(`/payments/invoice/${p.id}`)} className="p-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Avatar url={member?.profilePicUrl} name={p.memberName} />
                  <div>
                    <p className="font-semibold text-sm text-[#1F2937]">{p.memberName}</p>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">{p.transactionDate}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#1F2937] text-sm">₹{new Intl.NumberFormat('en-IN').format(p.amountPaid)}</p>
                  <span className={`mt-1 inline-flex items-center text-[10px] font-medium ${p.status === 'Paid' ? 'text-[#16A34A]' : p.status === 'Partial' ? 'text-[#D97706]' : 'text-[#DC2626]'}`}>
                    {p.status}
                  </span>
                </div>
              </div>
            )
          }) : <div className="text-center py-6 text-[#6B7280] text-sm">No recent payments</div>}
        </div>
        
        {allRecentPayments.length > paymentsLimit && (
          <div className="p-3 border-t border-[#E5E7EB] bg-gray-50 text-center">
            <button onClick={() => setPaymentsLimit(prev => prev + 5)} className="text-sm font-medium text-[#2563EB] hover:underline">Load More</button>
          </div>
        )}
      </div>

    </div>
  );
};