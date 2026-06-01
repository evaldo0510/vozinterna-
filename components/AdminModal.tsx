import React, { useState, useEffect } from 'react';
import { User, UserPlan } from '../types';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  currentPlan: UserPlan;
  onUpdatePlan: (plan: UserPlan) => void;
  onResetApp: () => void;
}

const XMarkIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, user, currentPlan, onUpdatePlan, onResetApp }) => {
  const [activeTab, setActiveTab] = useState<'console' | 'analytics'>('analytics');
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  const [landingVisits, setLandingVisits] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // Mock loading data from "database" (localStorage)
      try {
        const users = JSON.parse(localStorage.getItem('pch_all_users_db') || '[]');
        setRegisteredUsers(users);
        const visits = parseInt(localStorage.getItem('pch_landing_visits') || '0');
        setLandingVisits(visits);
      } catch (e) {
        console.error("Failed to load admin data", e);
      }
    }
  }, [isOpen]);

  if (!isOpen || !user.isAdmin) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-6 animate-fade-in">
      <div className="bg-stone-900 border border-red-900/30 w-full max-w-2xl h-[80vh] rounded-lg flex flex-col relative shadow-2xl overflow-hidden">
         
         {/* Header */}
         <div className="p-6 border-b border-red-900/20 flex justify-between items-center bg-stone-950/50">
             <div>
                <h2 className="text-xl font-serif text-red-100/80 tracking-widest uppercase">Admin Nexus</h2>
                <p className="text-[10px] text-red-500/60 font-mono mt-1">Operator: {user.email}</p>
             </div>
             <button onClick={onClose} className="text-stone-600 hover:text-stone-300">
                <XMarkIcon className="w-6 h-6" />
             </button>
         </div>

         {/* Tabs */}
         <div className="flex border-b border-stone-800">
             <button 
                onClick={() => setActiveTab('analytics')}
                className={`flex-1 py-3 text-xs uppercase tracking-widest transition-colors ${activeTab === 'analytics' ? 'bg-red-900/10 text-red-200 border-b-2 border-red-500' : 'text-stone-500 hover:text-stone-300'}`}
             >
                 Analytics & Users
             </button>
             <button 
                onClick={() => setActiveTab('console')}
                className={`flex-1 py-3 text-xs uppercase tracking-widest transition-colors ${activeTab === 'console' ? 'bg-red-900/10 text-red-200 border-b-2 border-red-500' : 'text-stone-500 hover:text-stone-300'}`}
             >
                 System Console
             </button>
         </div>

         <div className="flex-1 overflow-y-auto p-6 bg-stone-900/50 custom-scrollbar">
             
             {activeTab === 'analytics' && (
                 <div className="space-y-8">
                     
                     {/* Overview Cards */}
                     <div className="grid grid-cols-2 gap-4">
                         <div className="bg-stone-950 p-4 border border-stone-800 rounded">
                             <span className="text-[10px] text-stone-500 uppercase tracking-widest block mb-2">Total Landing Visits</span>
                             <span className="text-2xl font-mono text-teal-500">{landingVisits}</span>
                         </div>
                         <div className="bg-stone-950 p-4 border border-stone-800 rounded">
                             <span className="text-[10px] text-stone-500 uppercase tracking-widest block mb-2">Registered Users</span>
                             <span className="text-2xl font-mono text-amber-500">{registeredUsers.length}</span>
                         </div>
                     </div>

                     {/* Users Table */}
                     <div>
                         <h3 className="text-xs text-stone-400 uppercase tracking-widest mb-4 border-b border-stone-800 pb-2">User Database</h3>
                         <div className="overflow-x-auto">
                             <table className="w-full text-left border-collapse">
                                 <thead>
                                     <tr className="text-[10px] text-stone-600 uppercase tracking-widest border-b border-stone-800">
                                         <th className="py-2 pr-4 font-normal">Name</th>
                                         <th className="py-2 pr-4 font-normal">Email</th>
                                         <th className="py-2 pr-4 font-normal">Plan</th>
                                         <th className="py-2 pr-4 font-normal">Registered</th>
                                         <th className="py-2 font-normal">Last Active</th>
                                     </tr>
                                 </thead>
                                 <tbody className="text-xs font-light text-stone-400 font-mono">
                                     {registeredUsers.length === 0 ? (
                                         <tr>
                                             <td colSpan={5} className="py-4 text-center text-stone-600 italic">No users found.</td>
                                         </tr>
                                     ) : (
                                         registeredUsers.map((u, idx) => (
                                             <tr key={idx} className="border-b border-stone-800/50 hover:bg-stone-800/30 transition-colors">
                                                 <td className="py-3 pr-4 text-stone-300">{u.name}</td>
                                                 <td className="py-3 pr-4">{u.email}</td>
                                                 <td className="py-3 pr-4">
                                                     <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider ${u.plan === 'guardian' ? 'bg-amber-900/30 text-amber-400 border border-amber-900/50' : u.plan === 'member' ? 'bg-teal-900/30 text-teal-400' : 'bg-stone-800 text-stone-500'}`}>
                                                         {u.plan}
                                                     </span>
                                                 </td>
                                                 <td className="py-3 pr-4 text-stone-500">{new Date(u.registeredAt).toLocaleDateString()}</td>
                                                 <td className="py-3 text-stone-300">{u.lastActive ? new Date(u.lastActive).toLocaleString() : '-'}</td>
                                             </tr>
                                         ))
                                     )}
                                 </tbody>
                             </table>
                         </div>
                     </div>
                 </div>
             )}

             {activeTab === 'console' && (
                 <div className="space-y-6">
                     {/* Plan Override */}
                     <div className="space-y-3">
                         <h3 className="text-[10px] text-stone-500 uppercase tracking-widest">Override My Plan (Local)</h3>
                         <div className="grid grid-cols-3 gap-2">
                             {(['visitor', 'member', 'guardian'] as UserPlan[]).map(plan => (
                                 <button
                                    key={plan}
                                    onClick={() => onUpdatePlan(plan)}
                                    className={`p-2 text-[10px] uppercase border rounded transition-all ${currentPlan === plan ? 'bg-teal-900/30 border-teal-500/50 text-teal-200' : 'bg-stone-950 border-stone-800 text-stone-500 hover:text-stone-300'}`}
                                 >
                                     {plan}
                                 </button>
                             ))}
                         </div>
                         <p className="text-[10px] text-stone-600 italic">This changes your current session state for testing features.</p>
                     </div>

                     {/* Danger Zone */}
                     <div className="pt-4 border-t border-stone-800">
                         <h3 className="text-[10px] text-red-900 uppercase tracking-widest mb-3">Danger Zone</h3>
                         <button 
                            onClick={() => {
                                if(confirm("Reset all local data (history, journal, settings)?")) {
                                    onResetApp();
                                }
                            }}
                            className="w-full py-3 bg-red-950/20 border border-red-900/30 text-red-500 hover:bg-red-900/20 text-xs uppercase tracking-widest rounded transition-colors"
                         >
                             Reset Application Data
                         </button>
                     </div>
                 </div>
             )}

         </div>
      </div>
    </div>
  );
};
