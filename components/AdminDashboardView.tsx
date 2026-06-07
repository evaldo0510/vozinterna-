import React, { useState, useEffect } from 'react';
import { User, Language } from '../types';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, getDocs, setDoc, getDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { Users, Settings, Plus, Save, Activity, Heart, Eye, BookOpen, AlertCircle, Sparkles, Trash2, Download, Search, X, ArrowUpDown, ChevronUp, ChevronDown, BarChart2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { NeuroAnalyticsDashboard } from './NeuroAnalyticsDashboard';

interface AdminDashboardViewProps {
  currentUser: User | null;
  lang: Language;
  onImpersonateUser?: (user: User | null) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ currentUser, lang, onImpersonateUser }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'system' | 'logs' | 'neuro_analytics'>('users');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [allNeuroProfiles, setAllNeuroProfiles] = useState<any[]>([]);
  const [loadingNeuroProfiles, setLoadingNeuroProfiles] = useState(true);

  // Real-time user filter search term
  const [searchTerm, setSearchTerm] = useState('');

  // Sorting state fields
  const [sortField, setSortField] = useState<'name' | 'email' | 'plan'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Delete User verification dialog states
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);

  // Editable Guide Prompts state
  const [systemPrompt, setSystemPrompt] = useState('');
  const [guidedPoems, setGuidedPoems] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Administrative Activity Logs states
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  // Checkbox bulk action states
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Recent search history (persisted in localStorage)
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('recentSearches') || '[]');
    } catch {
      return [];
    }
  });

  // Frequency mapping for most searched terms
  const [searchFrequencies, setSearchFrequencies] = useState<Record<string, number>>(() => {
    try {
      return JSON.parse(localStorage.getItem('searchFrequencies') || '{}');
    } catch {
      return {};
    }
  });

  const saveSearchTerm = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed || trimmed.length < 2) return;
    
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 5);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });

    setSearchFrequencies(prev => {
      const updated = { ...prev, [trimmed]: (prev[trimmed] || 0) + 1 };
      localStorage.setItem('searchFrequencies', JSON.stringify(updated));
      return updated;
    });
  };

  const removeSearchTerm = (termToRemove: string) => {
    setRecentSearches(prev => {
      const updated = prev.filter(item => item !== termToRemove);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });

    setSearchFrequencies(prev => {
      const updated = { ...prev };
      delete updated[termToRemove];
      localStorage.setItem('searchFrequencies', JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    setSearchFrequencies({});
    localStorage.removeItem('recentSearches');
    localStorage.removeItem('searchFrequencies');
  };

  const mostSearchedTerms = React.useMemo(() => {
    return Object.entries(searchFrequencies)
      .map(([term, count]) => ({ term, count: Number(count) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [searchFrequencies]);

  // Debounced auto-save of typed search query to recent searches
  useEffect(() => {
    const trimmed = searchTerm.trim();
    if (!trimmed || trimmed.length < 3) return;
    const timer = setTimeout(() => {
      saveSearchTerm(trimmed);
    }, 1200);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const logAdminActivity = async (actionType: string, description: string) => {
    try {
      const logRef = doc(collection(db, 'admin_logs'));
      await setDoc(logRef, {
        actionType,
        description,
        timestamp: new Date().toISOString(),
        adminEmail: currentUser?.email || 'unknown_admin',
        adminId: currentUser?.id || 'unknown_admin_id'
      });
    } catch (err) {
      console.error("Failed to log admin activity in Firestore", err);
    }
  };

  // Synchronize admin logs in real-time
  useEffect(() => {
    let unsubscribe = () => {};
    if (currentUser?.isAdmin) {
      setLoadingLogs(true);
      const colRef = collection(db, 'admin_logs');
      unsubscribe = onSnapshot(colRef, (snapshot) => {
        const logsList: any[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          logsList.push({
            id: docSnap.id,
            actionType: data.actionType || 'action',
            description: data.description || '',
            timestamp: data.timestamp || new Date().toISOString(),
            adminEmail: data.adminEmail || 'admin',
            adminId: data.adminId || ''
          });
        });
        
        // Sort from newest to oldest
        logsList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setLogs(logsList);
        setLoadingLogs(false);
      }, (err) => {
        console.error("Failed to listen to admin activity logs", err);
        setLoadingLogs(false);
      });
    }
    return () => unsubscribe();
  }, [currentUser]);

  // Load registered users live from Firestore
  useEffect(() => {
    let unsubscribe = () => {};
    if (currentUser?.isAdmin) {
      setLoadingUsers(true);
      const colRef = collection(db, 'users');
      unsubscribe = onSnapshot(colRef, (snapshot) => {
        const usersList: User[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          usersList.push({
            id: docSnap.id,
            name: data.name || 'Praticante',
            email: data.email || 'desconhecido@email.com',
            isAdmin: !!data.isAdmin,
            plan: data.plan || 'visitor',
            registeredAt: data.registeredAt || new Date().toISOString(),
            lastActive: data.lastActive || new Date().toISOString(),
            resonanceScore: data.resonanceScore || 0,
            accessibilityMode: !!data.accessibilityMode,
            points: data.points || 0,
            level: data.level || 1,
            communicationPreference: data.communicationPreference,
            neuroMode: data.neuroMode
          });
        });
        setAllUsers(usersList);
        setLoadingUsers(false);
      }, (err) => {
        console.error("Failed to load user database inside Admin dashboard", err);
        setLoadingUsers(false);
      });
    }

    return () => unsubscribe();
  }, [currentUser]);

  // Load registered user neuro profiles live from Firestore
  useEffect(() => {
    let unsubscribe = () => {};
    if (currentUser?.isAdmin) {
      setLoadingNeuroProfiles(true);
      const colRef = collection(db, 'user_neuro_profile');
      unsubscribe = onSnapshot(colRef, (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((docSnap) => {
          list.push({
            id: docSnap.id,
            ...docSnap.data()
          });
        });
        setAllNeuroProfiles(list);
        setLoadingNeuroProfiles(false);
      }, (err) => {
        console.error("Failed to load user neuro profiles inside Admin dashboard", err);
        setLoadingNeuroProfiles(false);
      });
    }

    return () => unsubscribe();
  }, [currentUser]);

  // Load editable Voice configurations (Dr Evaldo prompt/responses) from Firestore live config doc
  useEffect(() => {
    const fetchSystemConfig = async () => {
      try {
        const configDocRef = doc(db, 'system_config', 'voice_settings');
        const snap = await getDoc(configDocRef);
        if (snap.exists()) {
          const data = snap.data();
          setSystemPrompt(data.systemPrompt || '');
          setGuidedPoems(data.guidedPoems || '');
        } else {
          // Initialize with defaults if non-existent
          const defaultPrompt = `Você é o "Dr. Evaldo", guia da Voz Interior PCH. Você é um amigo caloroso, empático e sábio.\n\nUse a Poesia Cognitiva Hipnótica (PCH) para harmonizar o peito do usuário.`;
          const defaultPoems = `1. Poema de Ancoragem: "Sinta o sopro da tarde, deite as pedras no chão..."\n2. Exercício de Descompressão: Respire por quatro segundos, sustente, sinta seu centro...`;
          setSystemPrompt(defaultPrompt);
          setGuidedPoems(defaultPoems);
        }
      } catch (err) {
        console.error("Failed to fetch custom system config", err);
      }
    };

    if (currentUser?.isAdmin) {
      fetchSystemConfig();
    }
  }, [currentUser]);

  const handleSaveConfig = async () => {
    setSavingSettings(true);
    setSavedSuccess(false);
    try {
      const configDocRef = doc(db, 'system_config', 'voice_settings');
      await setDoc(configDocRef, {
        systemPrompt,
        guidedPoems,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser?.email
      });

      await logAdminActivity(
        'config_update',
        lang === 'pt'
          ? `Atualizada as instruções de sistema e poemas da Voz Interior`
          : `Updated system instructions and poems of the Inner Voice`
      );

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save custom config to firestore", err);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setDeletingUser(true);
    try {
      const userDocRef = doc(db, 'users', userToDelete.id);
      await deleteDoc(userDocRef);

      await logAdminActivity(
        'user_deletion', 
        lang === 'pt'
          ? `Removido o praticante "${userToDelete.name}" (${userToDelete.email})`
          : `Removed practitioner "${userToDelete.name}" (${userToDelete.email})`
      );

      // Make sure we clear the selectedUserIds of this user if selected
      setSelectedUserIds(prev => prev.filter(id => id !== userToDelete.id));
      setUserToDelete(null);
    } catch (err) {
      console.error("Failed to delete user profile from Firestore", err);
    } finally {
      setDeletingUser(false);
    }
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedUserIds.length === 0) return;
    setBulkDeleting(true);
    try {
      const selectedNames: string[] = [];
      const deletePromises = selectedUserIds.map(async (userId) => {
        const userObj = allUsers.find(u => u.id === userId);
        if (userObj) {
          selectedNames.push(userObj.name);
        }
        const userDocRef = doc(db, 'users', userId);
        return deleteDoc(userDocRef);
      });

      await Promise.all(deletePromises);

      await logAdminActivity(
        'bulk_user_deletion', 
        lang === 'pt'
          ? `Remoção em massa de ${selectedUserIds.length} praticantes: [${selectedNames.join(', ')}]`
          : `Bulk removed ${selectedUserIds.length} practitioners: [${selectedNames.join(', ')}]`
      );

      setSelectedUserIds([]);
      setShowBulkDeleteModal(false);
    } catch (err) {
      console.error("Failed to execute bulk user deletion from Firestore", err);
    } finally {
      setBulkDeleting(false);
    }
  };

  // 30 Days registrations trend dataset calculation
  const last30DaysData = React.useMemo(() => {
    const data: Array<{ date: string; dateLabel: string; count: number }> = [];
    const today = new Date();
    
    // Generate dates for the last 30 days
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const isoDate = d.toISOString().slice(0, 10); // "YYYY-MM-DD"
      const label = d.toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', { day: 'numeric', month: 'short' });
      data.push({
        date: isoDate,
        dateLabel: label,
        count: 0
      });
    }

    // Accumulate registered users
    allUsers.forEach(user => {
      if (!user.registeredAt) return;
      const regDay = user.registeredAt.slice(0, 10); // "YYYY-MM-DD"
      const matched = data.find(item => item.date === regDay);
      if (matched) {
        matched.count += 1;
      }
    });

    return data;
  }, [allUsers, lang]);

  const handleSort = (field: 'name' | 'email' | 'plan') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Real-time filtering
  const filteredUsers = allUsers.filter(user => {
    const term = searchTerm.toLowerCase().trim();
    return (
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
  });

  // Sorting logic based on sortField and sortDirection using robust localeCompare
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const valA = a[sortField] || '';
    const valB = b[sortField] || '';
    return sortDirection === 'asc'
      ? valA.localeCompare(valB, undefined, { sensitivity: 'base' })
      : valB.localeCompare(valA, undefined, { sensitivity: 'base' });
  });

  // Checkbox select-all helper logic to exclude current account from being self-deleted
  const checkableUsers = sortedUsers.filter(u => u.id !== currentUser?.id);
  const isAllChecked = checkableUsers.length > 0 && checkableUsers.every(u => selectedUserIds.includes(u.id));
  const isSomeChecked = checkableUsers.length > 0 && checkableUsers.some(u => selectedUserIds.includes(u.id)) && !isAllChecked;

  const handleSelectAllChange = () => {
    if (isAllChecked) {
      const checkableIds = checkableUsers.map(u => u.id);
      setSelectedUserIds(prev => prev.filter(id => !checkableIds.includes(id)));
    } else {
      const checkableIds = checkableUsers.map(u => u.id);
      setSelectedUserIds(prev => {
        const union = new Set([...prev, ...checkableIds]);
        return Array.from(union);
      });
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUserIds(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleDownloadCSV = () => {
    const headers = ["ID", "Name", "Email", "Plan", "Registered At", "Last Active", "Points", "Level", "Neuro Mode", "Comm Preference"];
    const rows = sortedUsers.map(u => [
      u.id,
      `"${u.name.replace(/"/g, '""')}"`,
      u.email,
      u.plan,
      u.registeredAt,
      u.lastActive,
      u.points,
      u.level,
      u.neuroMode || 'natural',
      u.communicationPreference || 'hybrid'
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `usuarios_filtrados_${new Date().toISOString().slice(0, 10)}.csv`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Framer Motion staggered animation variants for the users list
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 6 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 220, damping: 22 }
    }
  };

  // Calculate distribution of users across plans for Recharts Pie Chart
  const planCounts = allUsers.reduce((acc, u) => {
    const p = u.plan || 'visitor';
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const planData = [
    { name: lang === 'pt' ? 'Guardião' : 'Guardian', value: planCounts['guardian'] || 0 },
    { name: lang === 'pt' ? 'Membro' : 'Member', value: planCounts['member'] || 0 },
    { name: lang === 'pt' ? 'Visitante' : 'Visitor', value: planCounts['visitor'] || 0 },
  ].filter(item => item.value > 0);

  const PLAN_COLORS: Record<string, string> = {
    'Guardião': '#f59e0b', // amber-500
    'Guardian': '#f59e0b',
    'Membro': '#14b8a6',   // teal-500
    'Member': '#14b8a6',
    'Visitante': '#6366f1', // indigo-500
    'Visitor': '#6366f1'
  };

  if (!currentUser?.isAdmin) {
    return (
      <div className="p-6 bg-red-950/20 border border-red-900/40 text-red-400 font-mono text-center rounded-3xl max-w-sm mx-auto space-y-3">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
        <h4 className="font-bold uppercase tracking-widest text-xs">Acesso Restrito</h4>
        <p className="text-[10px] leading-relaxed">Esta área necessita de privilégios de Administrador. Sintonize na conta autorizada.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in p-4 pb-12 text-stone-200">
      {/* Upper header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-900 pb-3 gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-serif text-teal-100 uppercase tracking-widest">Painel Operador PCH</h2>
          <p className="text-[10px] text-stone-500 tracking-wider mt-1 uppercase font-mono">Espaço Supremo de Gestão de IA Multimodal</p>
        </div>

        {/* Tab triggers */}
        <div className="flex bg-stone-900/50 p-1 rounded-2xl border border-stone-850 flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'users' ? 'bg-teal-500 text-stone-950 font-black' : 'text-stone-500 hover:text-stone-300'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{lang === 'pt' ? 'Usuários' : 'Users'} ({allUsers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('neuro_analytics')}
            className={`px-4 py-2 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'neuro_analytics' ? 'bg-teal-500 text-stone-950 font-black' : 'text-stone-500 hover:text-stone-300'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>{lang === 'pt' ? 'NeuroMétricas' : 'NeuroMetrics'}</span>
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`px-4 py-2 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'system' ? 'bg-teal-500 text-stone-950 font-black' : 'text-stone-500 hover:text-stone-300'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{lang === 'pt' ? 'Gestão da Voz' : 'Voice Config'}</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'logs' ? 'bg-teal-500 text-stone-950 font-black' : 'text-stone-500 hover:text-stone-300'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{lang === 'pt' ? 'Atividades' : 'Logs'} ({logs.length})</span>
          </button>
        </div>
      </div>

      {/* Overview Analytics Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="neu-card p-4 rounded-3xl">
          <span className="text-[9px] uppercase tracking-widest text-stone-500 font-mono block">Membros Registrados</span>
          <span className="text-2xl font-mono font-bold text-teal-400 mt-1 block">{allUsers.length}</span>
        </div>
        <div className="glass-panel p-4 rounded-3xl">
          <span className="text-[9px] uppercase tracking-widest text-stone-500 font-mono block">Ativos Recentes</span>
          <span className="text-2xl font-mono font-bold text-amber-400 mt-1 block">
            {allUsers.filter(u => new Date(u.lastActive).getTime() > Date.now() - 24 * 60 * 60 * 1000).length}
          </span>
        </div>
        <div className="neu-card p-4 rounded-3xl">
          <span className="text-[9px] uppercase tracking-widest text-stone-500 font-mono block">Perfis TDAH / Down / Autismo</span>
          <span className="text-2xl font-mono font-bold text-indigo-400 mt-1 block">
            {allUsers.filter(u => u.neuroMode && u.neuroMode !== 'natural').length}
          </span>
        </div>
        <div className="glass-panel p-4 rounded-3xl">
          <span className="text-[9px] uppercase tracking-widest text-stone-500 font-mono block">Pontos Cultivados</span>
          <span className="text-2xl font-mono font-bold text-rose-400 mt-1 block">
            {allUsers.reduce((sum, u) => sum + (u.points || 0), 0)} XP
          </span>
        </div>
      </div>

      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Users Table Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="neu-card rounded-3xl p-5 overflow-hidden relative">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
                <div>
                  <h3 className="font-serif text-sm tracking-widest text-stone-300 uppercase">{lang === 'pt' ? 'Banco de Dados' : 'User Database'}</h3>
                  <p className="text-[10px] text-stone-500 font-mono uppercase mt-0.5">
                    {lang === 'pt' ? `${sortedUsers.length} usuários sintonizados` : `${sortedUsers.length} tuned users`}
                  </p>
                </div>

                {/* Real-time search filter and download CSV button */}
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-60">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search className="h-3 w-3 text-stone-500" />
                    </span>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          saveSearchTerm(searchTerm);
                        }
                      }}
                      placeholder={lang === 'pt' ? 'Buscar praticante e pressionar Enter...' : 'Search practitioner (Enter to save)...'}
                      className="w-full bg-stone-950 border border-stone-850 focus:border-teal-500 text-[10px] rounded-xl pl-8 pr-8 py-2 text-stone-300 focus:outline-none transition-all placeholder-stone-700 font-mono animate-fade-in"
                    />
                    {searchTerm && (
                      <button 
                        onClick={() => setSearchTerm('')}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-500 hover:text-stone-300"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  {selectedUserIds.length > 0 && (
                    <button
                      onClick={() => setShowBulkDeleteModal(true)}
                      className="py-2 px-3 bg-rose-950/45 hover:bg-rose-900 border border-rose-900/50 text-rose-300 text-[9px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer active:scale-95 shadow-md shrink-0 focus:outline-none animate-fade-in"
                      title={lang === 'pt' ? 'Remover Selecionados em Massa' : 'Delete Selected in Bulk'}
                    >
                      <Trash2 className="w-3 h-3 text-rose-400" />
                      <span>{lang === 'pt' ? `Deletar (${selectedUserIds.length})` : `Delete (${selectedUserIds.length})`}</span>
                    </button>
                  )}

                  <button
                    onClick={handleDownloadCSV}
                    className="py-2 px-3 bg-stone-950 hover:bg-stone-900 border border-stone-850 text-stone-300 text-[9px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer active:scale-95 shadow-md shrink-0"
                    title={lang === 'pt' ? 'Exportar Banco de Dados (.csv)' : 'Export Database (.csv)'}
                  >
                    <Download className="w-3 h-3 text-teal-400" />
                    <span>CSV</span>
                  </button>
                </div>
              </div>

              {/* Recent and Most Popular Searches */}
              {(recentSearches.length > 0 || mostSearchedTerms.length > 0) && (
                <div className="space-y-2 mb-5 p-3 bg-stone-950/40 rounded-2xl border border-stone-900/60 animate-fade-in">
                  
                  {/* Recent Filters */}
                  {recentSearches.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[8px] uppercase tracking-wider font-mono text-stone-500 font-bold px-1 select-none">
                        {lang === 'pt' ? 'Filtragens Recentes:' : 'Recent Filters:'}
                      </span>
                      {recentSearches.map((term, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSearchTerm(term)}
                          className={`group flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[9px] font-mono border transition-all cursor-pointer active:scale-95 ${
                            searchTerm.trim().toLowerCase() === term.trim().toLowerCase()
                              ? 'bg-teal-500/15 border-teal-500/40 text-teal-300 font-bold'
                              : 'bg-stone-900/60 border-stone-850 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                          }`}
                        >
                          <span className="truncate max-w-[120px]">{term}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSearchTerm(term);
                            }}
                            className="text-stone-500 hover:text-rose-450 p-0.5 rounded-full transition-all inline-flex items-center justify-center"
                            title={lang === 'pt' ? 'Remover pesquisa' : 'Remove search'}
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={clearRecentSearches}
                        className="text-[8px] uppercase font-mono text-stone-600 hover:text-stone-400 ml-auto font-bold tracking-wider px-1"
                      >
                        {lang === 'pt' ? 'Limpar Histórico' : 'Clear History'}
                      </button>
                    </div>
                  )}

                  {/* Most Searched Terms */}
                  {mostSearchedTerms.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-stone-900/50">
                      <span className="text-[8px] uppercase tracking-wider font-mono text-stone-500 font-bold px-1 select-none">
                        {lang === 'pt' ? 'Mais Buscados:' : 'Most Searched:'}
                      </span>
                      {mostSearchedTerms.map(({ term, count }, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSearchTerm(term)}
                          className={`group flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[9px] font-mono border transition-all cursor-pointer active:scale-95 ${
                            searchTerm.trim().toLowerCase() === term.trim().toLowerCase()
                              ? 'bg-teal-500/15 border-teal-500/40 text-teal-300 font-bold'
                              : 'bg-stone-900/60 border-stone-850 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                          }`}
                        >
                          <span>{term}</span>
                          <span className="text-[7.5px] px-1 bg-stone-950 font-black rounded-full text-teal-400/80 border border-teal-500/10 shrink-0">
                            {count}x
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {loadingUsers ? (
                <div className="py-12 text-center text-xs text-stone-600 font-mono animate-pulse uppercase tracking-widest">Sintonizando Almas Cadastradas...</div>
              ) : (
                <div className="space-y-4">
                  {/* DESKTOP TABLE VIEW */}
                  <div className="hidden md:block overflow-x-auto text-[11px]">
                    <table className="w-full text-left border-collapse font-mono">
                      <thead className="select-none">
                        <tr className="text-[9px] uppercase tracking-wider border-b border-stone-900 text-stone-600 font-semibold">
                          <th className="py-3 px-2 w-8 text-center select-none">
                            <input 
                              type="checkbox" 
                              checked={isAllChecked}
                              onChange={handleSelectAllChange}
                              ref={el => {
                                if (el) {
                                  el.indeterminate = isSomeChecked;
                                }
                              }}
                              className="h-3.5 w-3.5 rounded border-stone-850 bg-stone-950 text-teal-500 focus:ring-teal-500/40 focus:ring-offset-0 focus:outline-none accent-teal-500 cursor-pointer"
                            />
                          </th>
                          <th 
                            onClick={() => handleSort('name')}
                            className="py-3 px-2 font-normal cursor-pointer hover:text-stone-300 transition-colors"
                          >
                            <div className="flex items-center space-x-1">
                              <span>{lang === 'pt' ? 'Nome' : 'Name'}</span>
                              {sortField === 'name' ? (
                                sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 text-teal-400" /> : <ChevronDown className="w-3 h-3 text-teal-400" />
                              ) : (
                                <ArrowUpDown className="w-2.5 h-2.5 text-stone-700 hover:text-stone-500" />
                              )}
                            </div>
                          </th>
                          <th 
                            onClick={() => handleSort('email')}
                            className="py-3 px-2 font-normal cursor-pointer hover:text-stone-300 transition-colors"
                          >
                            <div className="flex items-center space-x-1">
                              <span>{lang === 'pt' ? 'E-mail' : 'Email'}</span>
                              {sortField === 'email' ? (
                                sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 text-teal-400" /> : <ChevronDown className="w-3 h-3 text-teal-400" />
                              ) : (
                                <ArrowUpDown className="w-2.5 h-2.5 text-stone-700 hover:text-stone-500" />
                              )}
                            </div>
                          </th>
                          <th 
                            onClick={() => handleSort('plan')}
                            className="py-3 px-2 font-normal cursor-pointer hover:text-stone-300 transition-colors"
                          >
                            <div className="flex items-center space-x-1">
                              <span>{lang === 'pt' ? 'Plano' : 'Plan'}</span>
                              {sortField === 'plan' ? (
                                sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 text-teal-400" /> : <ChevronDown className="w-3 h-3 text-teal-400" />
                              ) : (
                                <ArrowUpDown className="w-2.5 h-2.5 text-stone-700 hover:text-stone-500" />
                              )}
                            </div>
                          </th>
                          <th className="py-3 px-2 font-normal">{lang === 'pt' ? 'Preferências' : 'Preferences'}</th>
                          <th className="py-3 px-2 font-normal">{lang === 'pt' ? 'Adaptativo' : 'Adaptive'}</th>
                          <th className="py-3 px-2 font-normal">{lang === 'pt' ? 'Pontuação' : 'Score'}</th>
                          <th className="py-3 px-2 font-normal text-right">{lang === 'pt' ? 'Ações' : 'Actions'}</th>
                        </tr>
                      </thead>
                      <motion.tbody 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        key={`${searchTerm}_${sortField}_${sortDirection}`}
                        className="text-stone-300"
                      >
                        {sortedUsers.map((userObj) => (
                          <motion.tr 
                            key={userObj.id} 
                            variants={itemVariants}
                            className="border-b border-stone-900/60 hover:bg-stone-900/20 transition-all text-[11.5px]"
                          >
                            <td className="py-3 px-2 w-8 text-center select-none animate-fade-in">
                              {userObj.id !== currentUser?.id ? (
                                <input 
                                  type="checkbox"
                                  checked={selectedUserIds.includes(userObj.id)}
                                  onChange={() => handleSelectUser(userObj.id)}
                                  className="h-3.5 w-3.5 rounded border-stone-850 bg-stone-950 text-teal-500 focus:ring-teal-500/40 focus:ring-offset-0 focus:outline-none accent-teal-500 cursor-pointer"
                                />
                              ) : (
                                <div className="w-3.5 h-3.5 mx-auto" />
                              )}
                            </td>
                            <td className="py-3 px-2 font-sans font-semibold text-stone-200">{userObj.name}</td>
                            <td className="py-3 px-2 text-stone-500">{userObj.email}</td>
                            <td className="py-3 px-2">
                              <span className={`px-2 py-0.5 rounded text-[8px] uppercase tracking-widest font-extrabold ${
                                userObj.plan === 'guardian' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                              }`}>
                                {userObj.plan}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-[10px] uppercase">
                              {userObj.communicationPreference === 'voice' ? '🎙️ Voz' : userObj.communicationPreference === 'text' ? '✉️ Texto' : '🔄 Tudo'}
                            </td>
                            <td className="py-3 px-2">
                              <span className="text-[10px] px-2 py-0.5 rounded bg-stone-950 border border-stone-850/50 text-stone-400">
                                {userObj.neuroMode || 'natural'}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-amber-500 font-bold">{userObj.points || 0} XP (Lvl {userObj.level || 1})</td>
                            <td className="py-3 px-1 text-right">
                              {userObj.id !== currentUser?.id ? (
                                <div className="flex items-center justify-end space-x-1.5">
                                  <button
                                    onClick={() => {
                                      if (onImpersonateUser) {
                                        onImpersonateUser(userObj);
                                      }
                                    }}
                                    className="p-1.5 px-2.5 rounded bg-teal-950/20 border border-teal-900/30 hover:bg-teal-950/80 hover:border-teal-900 text-teal-400 hover:text-teal-100 transition-all font-sans text-[9px] uppercase tracking-wider font-semibold cursor-pointer active:scale-95 inline-flex items-center space-x-1"
                                    title={lang === 'pt' ? 'Ativar microfone e interagir com perfil' : 'Activate mic and interact'}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-3 h-3">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                                    </svg>
                                    <span>{lang === 'pt' ? 'Interagir' : 'Interact'}</span>
                                  </button>
                                  <button
                                    onClick={() => setUserToDelete(userObj)}
                                    className="p-1.5 px-2.5 rounded bg-rose-950/20 border border-rose-900/30 hover:bg-rose-950/80 hover:border-rose-900 text-rose-400 hover:text-rose-100 transition-all font-sans text-[9px] uppercase tracking-wider font-semibold cursor-pointer active:scale-95 inline-flex items-center space-x-1"
                                    title={lang === 'pt' ? 'Remover Praticante' : 'Delete User'}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span className="hidden md:inline">{lang === 'pt' ? 'Remover' : 'Delete'}</span>
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[9px] uppercase font-mono text-stone-600 italic px-2.5">
                                  {lang === 'pt' ? 'Você' : 'You'}
                                </span>
                              )}
                            </td>
                          </motion.tr>
                        ))}
                        {sortedUsers.length === 0 && (
                          <motion.tr variants={itemVariants}>
                            <td colSpan={8} className="py-8 text-center text-stone-600 italic">
                              {lang === 'pt' ? 'Nenhum praticante sintonizado com esse filtro.' : 'No practitioners match this filter.'}
                            </td>
                          </motion.tr>
                        )}
                      </motion.tbody>
                    </table>
                  </div>

                  {/* MOBILE COMPACT CARDS VIEW */}
                  <div className="md:hidden flex flex-col space-y-3.5 mt-2 animate-fade-in">
                    {sortedUsers.map((userObj) => (
                      <div 
                        key={userObj.id} 
                        className="bg-stone-950/60 p-4 rounded-2xl border border-stone-900 flex flex-col space-y-3 text-[11.5px] relative"
                      >
                        {/* Title Row */}
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-start space-x-2.5">
                            {userObj.id !== currentUser?.id && (
                              <input 
                                type="checkbox"
                                checked={selectedUserIds.includes(userObj.id)}
                                onChange={() => handleSelectUser(userObj.id)}
                                className="h-3.5 w-3.5 rounded border-stone-850 bg-stone-950 text-teal-500 accent-teal-500 cursor-pointer focus:ring-0 mt-0.5 shrink-0"
                              />
                            )}
                            <div className="flex flex-col">
                              <span className="font-sans font-bold text-stone-200">{userObj.name}</span>
                              <span className="text-[10px] text-stone-500 font-mono mt-0.5">{userObj.email}</span>
                            </div>
                          </div>
                          
                          <span className={`px-2 py-0.5 rounded text-[7.5px] uppercase tracking-widest font-extrabold shrink-0 ${
                            userObj.plan === 'guardian' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' : 'bg-teal-500/10 text-teal-400 border border-teal-500/25'
                          }`}>
                            {userObj.plan}
                          </span>
                        </div>

                        {/* Middle Specifications Row */}
                        <div className="grid grid-cols-2 gap-2 text-[10px] bg-stone-900/30 p-2 rounded-xl font-mono text-stone-400">
                          <div>
                            <span className="text-stone-600 block text-[8px] uppercase tracking-wider mb-0.5">Preferências</span>
                            <span>{userObj.communicationPreference === 'voice' ? '🎙️ Voz' : userObj.communicationPreference === 'text' ? '✉️ Texto' : '🔄 Tudo'}</span>
                          </div>
                          <div>
                            <span className="text-stone-600 block text-[8px] uppercase tracking-wider mb-0.5">Adaptativo</span>
                            <span className="capitalize">{userObj.neuroMode || 'natural'}</span>
                          </div>
                        </div>

                        {/* Bottom Row & CTA */}
                        <div className="flex justify-between items-center pt-2.5 border-t border-stone-900/40 text-[10.5px]">
                          <span className="text-amber-500 font-bold font-mono">
                            {userObj.points || 0} XP <span className="text-[9px] text-stone-500 font-normal">({lang === 'pt' ? 'Lvl' : 'Lvl'} {userObj.level || 1})</span>
                          </span>

                          <div className="flex items-center space-x-1.5">
                            {userObj.id !== currentUser?.id ? (
                              <>
                                <button
                                  onClick={() => {
                                    if (onImpersonateUser) {
                                      onImpersonateUser(userObj);
                                    }
                                  }}
                                  className="p-1 px-2.5 rounded bg-teal-950/20 border border-teal-900/35 hover:bg-teal-950 text-teal-400 text-[9px] font-sans uppercase tracking-wider font-semibold cursor-pointer active:scale-95 inline-flex items-center space-x-1"
                                >
                                  <span>{lang === 'pt' ? 'Interagir' : 'Interact'}</span>
                                </button>
                                <button
                                  onClick={() => setUserToDelete(userObj)}
                                  className="p-1 px-2 border border-rose-900/35 rounded bg-rose-950/20 hover:bg-rose-950 text-rose-450 text-[9px] cursor-pointer"
                                  title={lang === 'pt' ? 'Remover' : 'Delete'}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <span className="text-[9px] uppercase font-mono text-stone-600 italic px-2 py-0.5 rounded bg-stone-900/50 select-none">
                                {lang === 'pt' ? 'Você' : 'You'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {sortedUsers.length === 0 && (
                      <div className="py-8 text-center text-stone-600 italic font-mono text-[10px]">
                        {lang === 'pt' ? 'Nenhum praticante sintonizado com esse filtro.' : 'No practitioners match this filter.'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Analytics Charts (Plan Distribution + 30 Days Registrations Trend) */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Pie Chart: Plan distribution */}
            <div className="glass-panel rounded-3xl p-5 flex flex-col justify-between h-80 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl"></div>
              <div className="border-b border-stone-900 pb-2 mb-2 relative z-10">
                <h4 className="font-serif text-xs uppercase tracking-widest text-stone-400">
                  {lang === 'pt' ? 'Distribuição de Planos' : 'Plan Distribution'}
                </h4>
                <p className="text-[8px] text-stone-500 font-mono mt-0.5 uppercase">
                  {lang === 'pt' ? 'Análise Sensorial de Acessos' : 'Sensory Access Report'}
                </p>
              </div>

              <div className="flex-1 min-h-[160px] w-full flex items-center justify-center relative z-10">
                {planData.length === 0 ? (
                  <span className="text-[10px] text-stone-600 font-mono uppercase tracking-widest">{lang === 'pt' ? 'Sem dados de planos' : 'No plan data'}</span>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={planData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {planData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PLAN_COLORS[entry.name] || '#14b8a6'} stroke="#0c0a09" strokeWidth={1} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1c1917', 
                          border: '1px solid #292524', 
                          borderRadius: '12px', 
                          fontSize: '10px', 
                          color: '#e7e5e4', 
                          fontFamily: 'monospace' 
                        }} 
                        itemStyle={{ color: '#e7e5e4' }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={32} 
                        iconSize={8}
                        iconType="circle"
                        wrapperStyle={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#78716c' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Line Chart: Registrations in last 30 days */}
            <div className="neu-card rounded-3xl p-5 flex flex-col justify-between h-80 relative overflow-hidden">
              <div className="absolute top-0 right-5 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl"></div>
              <div className="border-b border-stone-900 pb-2 mb-2 relative z-10">
                <h4 className="font-serif text-xs uppercase tracking-widest text-stone-400">
                  {lang === 'pt' ? 'Histórico de Registros' : 'Registration History'}
                </h4>
                <p className="text-[8px] text-stone-500 font-mono mt-0.5 uppercase">
                  {lang === 'pt' ? 'Novos Praticantes (Últimos 30 Dias)' : 'New Practitioners (Last 30 Days)'}
                </p>
              </div>

              <div className="flex-1 min-h-[160px] w-full flex items-center justify-center relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={last30DaysData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1c1917" />
                    <XAxis 
                      dataKey="dateLabel" 
                      stroke="#44403c" 
                      tick={{ fill: '#78716c', fontSize: 8, fontFamily: 'monospace' }} 
                    />
                    <YAxis 
                      allowDecimals={false} 
                      stroke="#44403c" 
                      tick={{ fill: '#78716c', fontSize: 8, fontFamily: 'monospace' }} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1c1917', 
                        border: '1px solid #292524', 
                        borderRadius: '12px', 
                        fontSize: '10px', 
                        color: '#e7e5e4', 
                        fontFamily: 'monospace' 
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#14b8a6" 
                      strokeWidth={2} 
                      dot={{ r: 3, stroke: '#0d9488', strokeWidth: 1, fill: '#14b8a6' }}
                      activeDot={{ r: 5 }}
                      name={lang === 'pt' ? 'Registros' : 'Registrations'}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      )}

      {activeTab === 'neuro_analytics' && (
        <div className="p-1 animate-fade-in">
          <NeuroAnalyticsDashboard users={allUsers} neuroProfiles={allNeuroProfiles} lang={lang} />
        </div>
      )}

      {activeTab === 'system' && (
        /* Dynamic system editing (Gestão de Respostas do Dr Evaldo sem alterar o código!) */
        <div className="glass-panel rounded-3xl p-6 space-y-6 animate-fade-in font-sans">
          <div className="flex justify-between items-center border-b border-stone-900 pb-3">
            <div>
              <h3 className="font-serif text-sm tracking-widest text-stone-300 uppercase">Gestão da Voz do Dr. Evaldo</h3>
              <p className="text-[9px] text-stone-500 leading-relaxed mt-0.5">As alterações nos paramentos de prompts propagam-se instantaneamente para todos os atendimentos.</p>
            </div>
            
            <button
              onClick={handleSaveConfig}
              disabled={savingSettings}
              className="py-2.5 px-5 bg-teal-500 hover:bg-teal-400 text-stone-950 font-bold uppercase tracking-[0.2em] text-[9px] rounded-xl transition-all cursor-pointer flex items-center space-x-2 shrink-0 active:scale-95 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingSettings ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>

          {savedSuccess && (
            <div className="p-3 bg-teal-500/10 border border-teal-500/30 text-teal-400 font-bold text-[10px] uppercase tracking-wider text-center rounded-xl flex items-center justify-center space-x-2">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Configurações atualizadas na nuvem Firestore com sucesso!</span>
            </div>
          )}

          <div className="space-y-4">
            {/* System prompt override */}
            <div className="space-y-2">
              <label className="text-[10px] text-stone-500 uppercase tracking-widest block font-bold font-mono">Instruções de Sistema da Voz (System Prompt)</label>
              <textarea
                rows={6}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Insira as regras, persona e objetivos da Voz interior aqui..."
                className="w-full bg-stone-950 border border-stone-850 focus:border-teal-500 text-xs rounded-2xl p-4 text-stone-300 focus:outline-none transition-all placeholder-stone-800 font-mono leading-relaxed"
              />
              <p className="text-[9px] text-stone-600 leading-normal font-sans">
                Substitui a identidade básica do modelo. Ensine-o a usar expressões calmas, ranhuras e regras de PCH (Poesia Cognitiva Hipnótica).
              </p>
            </div>

            {/* Response/Poem list override */}
            <div className="space-y-2 pt-4 border-t border-stone-900/60">
              <label className="text-[10px] text-stone-500 uppercase tracking-widest block font-bold font-mono">Poemas de Apoio e Exercícios Integrantes</label>
              <textarea
                rows={5}
                value={guidedPoems}
                onChange={(e) => setGuidedPoems(e.target.value)}
                placeholder="Insira poemas, exercícios mentais, trilhas relaxantes..."
                className="w-full bg-stone-950 border border-stone-850 focus:border-teal-500 text-xs rounded-2xl p-4 text-stone-300 focus:outline-none transition-all placeholder-stone-800 font-mono leading-relaxed"
              />
              <p className="text-[9px] text-stone-600 leading-normal font-sans">
                Estes textos moldam o repertório de exercícios terapêuticos e poemas que o modelo utiliza para tranquilizar os corações dos usuários.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        /* Administrative Activity Logs displaying chronological list */
        <div className="neu-card rounded-3xl p-6 space-y-4 animate-fade-in font-sans">
          <div className="border-b border-stone-950 pb-3 flex flex-row justify-between items-center">
            <div>
              <h3 className="font-serif text-sm tracking-widest text-stone-300 uppercase">
                {lang === 'pt' ? 'Histórico de Atividades Administrativas' : 'Administrative Activity Logs'}
              </h3>
              <p className="text-[9px] text-stone-500 font-mono uppercase mt-0.5 leading-relaxed">
                {lang === 'pt' ? 'Registro cronológico de ações executadas por operadores' : 'Chronological log of actions executed by operators'}
              </p>
            </div>
            <span className="text-[8px] font-mono font-bold text-teal-400 bg-teal-500/5 border border-teal-500/10 px-2 py-1 rounded-lg uppercase tracking-widest block shadow-sm select-none">
              {lang === 'pt' ? 'Sincronizado' : 'Synced'}
            </span>
          </div>

          {loadingLogs ? (
            <div className="py-12 text-center text-xs text-stone-600 font-mono animate-pulse uppercase tracking-widest">
              {lang === 'pt' ? 'Carregando histórico do Santuário...' : 'Loading Sanctuary history...'}
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-500 font-mono italic">
              {lang === 'pt' ? 'Nenhuma atividade registrada até o momento.' : 'No activity logged yet.'}
            </div>
          ) : (
            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
              {logs.map((logItem) => (
                <div key={logItem.id} className="bg-stone-950/40 border border-stone-900 hover:border-stone-850/60 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[11px] font-mono transition-all">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] uppercase tracking-wider font-extrabold ${
                        logItem.actionType === 'user_deletion' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                      }`}>
                        {logItem.actionType}
                      </span>
                      <span className="text-stone-300 font-sans font-medium text-[11.5px]">{logItem.description}</span>
                    </div>
                    <div className="text-[10px] text-stone-500">
                      {lang === 'pt' ? 'Administrador: ' : 'Admin: '}
                      <span className="text-stone-400 font-semibold">{logItem.adminEmail}</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-stone-500 text-left sm:text-right shrink-0">
                    {new Date(logItem.timestamp).toLocaleString(lang === 'pt' ? 'pt-BR' : 'en-US')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal for user removal */}
      {userToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-sm w-full space-y-6">
            <div className="text-center space-y-2">
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
              <h4 className="font-serif text-lg font-bold text-stone-100 uppercase tracking-wide">
                {lang === 'pt' ? 'Confirmar Exclusão' : 'Confirm Deletion'}
              </h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                {lang === 'pt' 
                  ? `Tem certeza que deseja remover o praticante "${userToDelete.name}" por completo do Santuário? Esta ação é de exclusão permanente no Firebase.` 
                  : `Are you sure you want to completely remove practitioner "${userToDelete.name}" from the Sanctuary? This action is permanent on Firebase.`}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="py-3 bg-stone-950 border border-stone-800 hover:border-stone-750 text-stone-400 hover:text-stone-300 font-bold uppercase tracking-widest text-[9px] rounded-xl transition-all cursor-pointer"
              >
                {lang === 'pt' ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deletingUser}
                className="py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-widest text-[9px] rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {deletingUser ? (
                  <span>{lang === 'pt' ? 'Removendo...' : 'Deleting...'}</span>
                ) : (
                  <span>{lang === 'pt' ? 'Confirmar' : 'Confirm'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for bulk user removal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-sm w-full space-y-6">
            <div className="text-center space-y-2">
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
              <h4 className="font-serif text-lg font-bold text-stone-100 uppercase tracking-wide">
                {lang === 'pt' ? 'Confirmar Remoção em Massa' : 'Confirm Bulk Deletion'}
              </h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                {lang === 'pt' 
                  ? `Tem certeza que deseja remover por completo esses ${selectedUserIds.length} praticantes selecionados do Santuário? Esta ação é irreversível e excluirá permanentemente os registros do Firebase.` 
                  : `Are you sure you want to completely remove these ${selectedUserIds.length} selected practitioners from the Sanctuary? This action is irreversible and will permanently delete records from Firebase.`}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                className="py-3 bg-stone-950 border border-stone-800 hover:border-stone-750 text-stone-400 hover:text-stone-300 font-bold uppercase tracking-widest text-[9px] rounded-xl transition-all cursor-pointer"
              >
                {lang === 'pt' ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                onClick={handleBulkDeleteConfirm}
                disabled={bulkDeleting}
                className="py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-widest text-[9px] rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {bulkDeleting ? (
                  <span>{lang === 'pt' ? 'Removendo...' : 'Deleting...'}</span>
                ) : (
                  <span>{lang === 'pt' ? 'Confirmar' : 'Confirm'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

