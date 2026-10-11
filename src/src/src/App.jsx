import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Calendar as CalendarIcon, 
  DollarSign, 
  Plus, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  ExternalLink, 
  Layers, 
  FolderKanban, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight, 
  Instagram, 
  Linkedin, 
  Youtube, 
  Eye, 
  Check, 
  X, 
  Link as LinkIcon, 
  PieChart, 
  ChevronRight,
  Video,
  Image as ImageIcon,
  FileText,
  LogOut,
  UserCheck,
  Cloud,
  CloudOff,
  Smartphone,
  Lock,
  Mail,
  Loader2,
  RefreshCw,
  Sun
} from 'lucide-react';

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';

const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : {
      apiKey: "demo-api-key",
      authDomain: "demo-app.firebaseapp.com",
      projectId: "demo-app",
      storageBucket: "demo-app.appspot.com",
      messagingSenderId: "123456789",
      appId: "1:123456789:web:abcdef"
    };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'central-marketing-app';

const DEFAULT_CLIENTS = [
  {
    id: 'c1',
    name: 'Restaurante Sabor & Arte',
    contactPerson: 'Carlos Silva',
    email: 'carlos@saborarte.com.br',
    niche: 'Gastronomia',
    status: 'Ativo',
    contractValue: 3500,
    dueDay: 10,
    tags: ['Social Media', 'Tráfego Pago', 'Fotografia'],
    logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80',
    links: [
      { id: 'l1', title: 'Pasta do Google Drive', url: 'https://drive.google.com', category: 'Drive' },
      { id: 'l2', title: 'Brand Guidelines', url: 'https://figma.com', category: 'Design' }
    ]
  },
  {
    id: 'c2',
    name: 'TechFlow Software',
    contactPerson: 'Mariana Costa',
    email: 'mariana@techflow.io',
    niche: 'SaaS / Tecnologia',
    status: 'Ativo',
    contractValue: 5800,
    dueDay: 15,
    tags: ['Inbound Marketing', 'LinkedIn'],
    logo: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=150&auto=format&fit=crop&q=80',
    links: [
      { id: 'l4', title: 'Dashboard de Métricas', url: 'https://lookerstudio.google.com', category: 'Relatórios' }
    ]
  }
];

const DEFAULT_POSTS = [
  {
    id: 'p1',
    clientId: 'c1',
    title: 'Lançamento do Cardápio de Primavera',
    format: 'Reels',
    channels: ['Instagram', 'TikTok'],
    publishDate: '2026-10-15',
    status: 'Aguardando Aprovação',
    copy: 'A estação mais florida do ano chegou e o nosso cardápio se renovou por completo! 🌸🥗 Venha experimentar opções leves e surpreendentes.',
    mediaUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'p2',
    clientId: 'c2',
    title: '5 Dicas para Otimizar o Workflow B2B',
    format: 'Carrossel',
    channels: ['LinkedIn', 'Instagram'],
    publishDate: '2026-10-18',
    status: 'Em Produção',
    copy: 'Produtividade é o motor das empresas modernas. Neste carrossel, separamos 5 táticas comprovadas.',
    mediaUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80'
  }
];

const DEFAULT_TRANSACTIONS = [
  {
    id: 't1',
    clientId: 'c1',
    type: 'income',
    category: 'Mensalidade',
    description: 'Pagamento de Contrato Mensal',
    amount: 3500,
    date: '2026-10-05',
    status: 'Pago'
  },
  {
    id: 't2',
    clientId: 'c1',
    type: 'expense',
    category: 'Tráfego Pago',
    description: 'Anúncios Meta Ads (Impulsionamento)',
    amount: 800,
    date: '2026-10-06',
    status: 'Pago'
  },
  {
    id: 't3',
    clientId: 'c2',
    type: 'income',
    category: 'Mensalidade',
    description: 'Fee Mensal Inbound',
    amount: 5800,
    date: '2026-10-10',
    status: 'Pago'
  }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  // App Navigation & Selected Client
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedClientId, setSelectedClientId] = useState('all');

  // Cloud Data States
  const [clients, setClients] = useState([]);
  const [posts, setPosts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Modals state
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [previewPost, setPreviewPost] = useState(null);

  // Form States
  const [newClient, setNewClient] = useState({
    name: '', contactPerson: '', email: '', niche: '', status: 'Ativo', contractValue: '', dueDay: '10', tags: ''
  });

  const [newPost, setNewPost] = useState({
    clientId: '',
    title: '',
    format: 'Reels',
    channels: ['Instagram'],
    publishDate: new Date().toISOString().split('T')[0],
    status: 'Ideia',
    copy: '',
    mediaUrl: ''
  });

  const [newTransaction, setNewTransaction] = useState({
    clientId: '',
    type: 'income',
    category: 'Mensalidade',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Pago'
  });

  const [newLink, setNewLink] = useState({
    clientId: '',
    title: '',
    url: '',
    category: 'Geral'
  });

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth init failed, fallbacking", err);
      }
    };

    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    setIsDataLoading(true);

    // Strict Paths for Public Sync Across Devices (or User Specific)
    const publicPath = (col) => collection(db, 'artifacts', appId, 'public', 'data', col);

    const unsubClients = onSnapshot(publicPath('clients'), (snapshot) => {
      if (snapshot.empty) {
        // Seed default clients if empty for new user session
        DEFAULT_CLIENTS.forEach(async (item) => {
          await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'clients', item.id), item);
        });
      } else {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setClients(items);
        if (items.length > 0 && !newPost.clientId) {
          setNewPost(p => ({ ...p, clientId: items[0].id }));
          setNewTransaction(t => ({ ...t, clientId: items[0].id }));
          setNewLink(l => ({ ...l, clientId: items[0].id }));
        }
      }
      setIsDataLoading(false);
    }, (err) => console.error("Clients sync error:", err));

    const unsubPosts = onSnapshot(publicPath('posts'), (snapshot) => {
      if (snapshot.empty) {
        DEFAULT_POSTS.forEach(async (item) => {
          await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'posts', item.id), item);
        });
      } else {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPosts(items);
      }
    }, (err) => console.error("Posts sync error:", err));

    const unsubTx = onSnapshot(publicPath('transactions'), (snapshot) => {
      if (snapshot.empty) {
        DEFAULT_TRANSACTIONS.forEach(async (item) => {
          await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', item.id), item);
        });
      } else {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTransactions(items);
      }
    }, (err) => console.error("Transactions sync error:", err));

    return () => {
      unsubClients();
      unsubPosts();
      unsubTx();
    };
  }, [user]);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!authEmail || !authPassword) return;

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, authEmail, authPassword);
      } else {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
      }
    } catch (err) {
      setAuthError(err.message.includes('user-not-found') 
        ? 'Usuário não encontrado.' 
        : err.message.includes('wrong-password') 
        ? 'Senha incorreta.' 
        : 'Erro ao autenticar. Tente novamente.');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    // Fall back to anonymous session
    await signInAnonymously(auth);
  };

  const activeClientsCount = useMemo(() => {
    return clients.filter(c => c.status === 'Ativo').length;
  }, [clients]);

  const totalFinancials = useMemo(() => {
    const filteredTx = selectedClientId === 'all' 
      ? transactions 
      : transactions.filter(t => t.clientId === selectedClientId);

    const income = filteredTx
      .filter(t => t.type === 'income' && t.status === 'Pago')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const expense = filteredTx
      .filter(t => t.type === 'expense' && t.status === 'Pago')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const profit = income - expense;
    const margin = income > 0 ? ((profit / income) * 100).toFixed(1) : 0;

    return { income, expense, profit, margin };
  }, [transactions, selectedClientId]);

  const clientFinancialSummaries = useMemo(() => {
    return clients.map(client => {
      const clientTxs = transactions.filter(t => t.clientId === client.id && t.status === 'Pago');
      const income = clientTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount || 0), 0);
      const expense = clientTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount || 0), 0);
      const profit = income - expense;
      const margin = income > 0 ? Math.round((profit / income) * 100) : 0;

      return { ...client, income, expense, profit, margin };
    });
  }, [clients, transactions]);

  const filteredPosts = useMemo(() => {
    if (selectedClientId === 'all') return posts;
    return posts.filter(p => p.clientId === selectedClientId);
  }, [posts, selectedClientId]);

  const filteredTransactions = useMemo(() => {
    if (selectedClientId === 'all') return transactions;
    return transactions.filter(t => t.clientId === selectedClientId);
  }, [transactions, selectedClientId]);

  const handleAddClient = async (e) => {
    e.preventDefault();
    if (!newClient.name || !user) return;

    const id = 'c_' + Date.now();
    const createdClient = {
      id,
      name: newClient.name,
      contactPerson: newClient.contactPerson || 'Não informado',
      email: newClient.email || '',
      niche: newClient.niche || 'Geral',
      status: newClient.status,
      contractValue: Number(newClient.contractValue) || 0,
      dueDay: Number(newClient.dueDay) || 10,
      tags: newClient.tags ? newClient.tags.split(',').map(t => t.trim()) : ['Marketing'],
      logo: `https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&auto=format&fit=crop&q=80`,
      links: []
    };

    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'clients', id), createdClient);
    setIsClientModalOpen(false);
    setNewClient({ name: '', contactPerson: '', email: '', niche: '', status: 'Ativo', contractValue: '', dueDay: '10', tags: '' });
  };

  const handleAddPost = async (e) => {
    e.preventDefault();
    if (!newPost.title || !user) return;

    const id = 'p_' + Date.now();
    const createdPost = { id, ...newPost };

    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'posts', id), createdPost);
    setIsPostModalOpen(false);
    setNewPost({
      clientId: clients[0]?.id || '',
      title: '',
      format: 'Reels',
      channels: ['Instagram'],
      publishDate: new Date().toISOString().split('T')[0],
      status: 'Ideia',
      copy: '',
      mediaUrl: ''
    });
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!newTransaction.amount || !newTransaction.description || !user) return;

    const id = 't_' + Date.now();
    const createdTx = {
      id,
      ...newTransaction,
      amount: Number(newTransaction.amount)
    };

    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', id), createdTx);
    setIsTransactionModalOpen(false);
    setNewTransaction({
      clientId: clients[0]?.id || '',
      type: 'income',
      category: 'Mensalidade',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      status: 'Pago'
    });
  };

  const handleAddLink = async (e) => {
    e.preventDefault();
    if (!newLink.title || !newLink.url || !user) return;

    const targetClient = clients.find(c => c.id === newLink.clientId);
    if (!targetClient) return;

    const updatedLinks = [...(targetClient.links || []), { id: 'l_' + Date.now(), ...newLink }];

    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'clients', targetClient.id), {
      links: updatedLinks
    });

    setIsLinkModalOpen(false);
    setNewLink({ clientId: clients[0]?.id || '', title: '', url: '', category: 'Geral' });
  };

  const updatePostStatus = async (postId, newStatus) => {
    if (!user) return;
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'posts', postId), {
      status: newStatus
    });
  };

  const KANBAN_STAGES = [
    { id: 'Ideia', name: '💡 Ideias / Briefing', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
    { id: 'Em Produção', name: '🎨 Em Produção', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
    { id: 'Aguardando Aprovação', name: '⏳ Aguardando Aprovação', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
    { id: 'Aprovado', name: '✅ Aprovado', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { id: 'Agendado', name: '📅 Agendado', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { id: 'Publicado', name: '🚀 Publicado', bg: 'bg-slate-100 text-slate-700 border-slate-200' }
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-600">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
        <p className="text-sm font-medium">Sincronizando Central de Marketing...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* Top Header Navigation - Clean Light Design */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-md shadow-indigo-600/20">
              <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  Central do Cliente
                </h1>
                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-100 flex items-center gap-1">
                  <Cloud className="w-3 h-3" /> Nuvem Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">Gestão Integrada de Marketing & Finanças</p>
            </div>
          </div>

          {/* Filter & Global Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select 
                value={selectedClientId} 
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="pl-8 pr-7 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all max-w-[150px] sm:max-w-xs truncate"
              >
                <option value="all">Todos os Clientes</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={() => setIsClientModalOpen(true)} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all shadow-sm flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Cliente</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Navigation Tabs */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-6 overflow-x-auto scrollbar-none">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: PieChart },
            { id: 'clients', label: 'Clientes', icon: Users, badge: clients.length },
            { id: 'content', label: 'Conteúdo', icon: FolderKanban, badge: filteredPosts.length },
            { id: 'financial', label: 'Financeiro', icon: CreditCard },
            { id: 'links', label: 'Acessos & Links', icon: LinkIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-3 border-b-2 font-medium text-xs sm:text-sm transition-all whitespace-nowrap ${
                  isActive 
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' 
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                {tab.label}
                {tab.badge !== undefined && (
                  <span className={`px-2 py-0.5 text-[11px] rounded-full font-bold ${
                    isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Cloud Sync Device Notification Bar */}
      <div className="bg-indigo-50 border-b border-indigo-100 py-1.5 px-4 text-center text-xs text-indigo-900 flex items-center justify-center gap-2">
        <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
        <span>Sincronizado na nuvem: Acesse no celular ou PC com os mesmos dados em tempo real.</span>
      </div>

      {/* Main Container Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ---------------------------------------------------- */}
        {/* TAB 1: DASHBOARD PRINCIPAL */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-xs sm:text-sm font-medium">Clientes Ativos</span>
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900">{activeClientsCount}</span>
                  <span className="text-xs text-slate-500">de {clients.length} cadastrados</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-xs sm:text-sm font-medium">Faturamento Total</span>
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-bold text-emerald-600">
                    R$ {totalFinancials.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-xs sm:text-sm font-medium">Despesas Associadas</span>
                  <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                    <ArrowDownRight className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-bold text-rose-600">
                    R$ {totalFinancials.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-xs sm:text-sm font-medium">Lucro Líquido Real</span>
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-slate-900">
                    R$ {totalFinancials.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold">
                    {totalFinancials.margin}%
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions & Welcome Bar */}
            <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold">Painel de Ações Rápidas</h2>
                <p className="text-indigo-200 text-xs sm:text-sm mt-1">
                  Mantenha o planejamento de posts, faturamento e contas sincronizados em qualquer dispositivo.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button 
                  onClick={() => setIsPostModalOpen(true)}
                  className="bg-white hover:bg-slate-100 text-indigo-900 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm shadow flex items-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" /> Novo Conteúdo
                </button>
                <button 
                  onClick={() => setIsTransactionModalOpen(true)}
                  className="bg-indigo-700 hover:bg-indigo-600 text-white border border-indigo-500 px-4 py-2 rounded-xl font-medium text-xs sm:text-sm flex items-center gap-2 transition-all"
                >
                  <DollarSign className="w-4 h-4 text-emerald-400" /> Nova Transação
                </button>
              </div>
            </div>

            {/* Two Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Next Contents */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-indigo-600" />
                    Próximas Publicações Programadas
                  </h3>
                  <button onClick={() => setActiveTab('content')} className="text-xs text-indigo-600 hover:underline font-semibold flex items-center gap-0.5">
                    Ver Kanban <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {filteredPosts.slice(0, 4).map((post) => {
                    const client = clients.find(c => c.id === post.clientId);
                    return (
                      <div key={post.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between gap-4 hover:border-slate-300 transition-all">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0 text-slate-600 font-bold border border-slate-200">
                            {post.format === 'Reels' && <Video className="w-4 h-4 text-purple-600" />}
                            {post.format === 'Carrossel' && <ImageIcon className="w-4 h-4 text-blue-600" />}
                            {['Reels', 'Carrossel'].indexOf(post.format) === -1 && <FileText className="w-4 h-4 text-emerald-600" />}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-slate-900 text-xs sm:text-sm truncate">{post.title}</h4>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                              <span className="text-indigo-600 font-semibold">{client?.name}</span>
                              <span>•</span>
                              <span>{post.publishDate}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold border ${
                            post.status === 'Aprovado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            post.status === 'Aguardando Aprovação' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {post.status}
                          </span>
                          <button 
                            onClick={() => setPreviewPost(post)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Client Profitability Margin */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Margem de Lucro por Cliente
                </h3>

                <div className="space-y-4">
                  {clientFinancialSummaries.map((summary) => (
                    <div key={summary.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-bold text-slate-800 truncate">{summary.name}</span>
                        <span className="text-xs font-bold text-emerald-600">{summary.margin}% Margem</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-full rounded-full" 
                          style={{ width: `${Math.min(Math.max(summary.margin, 0), 100)}%` }} 
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500 mt-2">
                        <span>Líquido: R$ {summary.profit}</span>
                        <span>Fee: R$ {summary.contractValue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 2: CLIENTES */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'clients' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Carteira de Clientes</h2>
                <p className="text-xs text-slate-500">Acompanhe dados contratuais, mensalidades e tags</p>
              </div>
              <button 
                onClick={() => setIsClientModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium text-xs sm:text-sm flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" /> Novo Cliente
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map((client) => {
                const pendingPosts = posts.filter(p => p.clientId === client.id && p.status === 'Aguardando Aprovação').length;

                return (
                  <div key={client.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={client.logo} 
                            alt={client.name} 
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm" 
                          />
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm sm:text-base">{client.name}</h3>
                            <p className="text-xs text-slate-500">{client.niche}</p>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 text-[11px] rounded-full font-bold border ${
                          client.status === 'Ativo' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {client.status}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 mb-4">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Fee Mensal:</span>
                          <span className="font-bold text-slate-900">R$ {client.contractValue.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Vencimento:</span>
                          <span className="text-slate-700 font-medium">Dia {client.dueDay}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Contato:</span>
                          <span className="text-slate-700 truncate max-w-[140px]">{client.contactPerson}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {(client.tags || []).map((tag, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-700 text-[11px] px-2 py-0.5 rounded-md border border-slate-200 font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                      {pendingPosts > 0 ? (
                        <span className="text-[11px] bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full border border-purple-200 font-bold">
                          {pendingPosts} em aprovação
                        </span>
                      ) : <span />}
                      
                      <button 
                        onClick={() => {
                          setSelectedClientId(client.id);
                          setActiveTab('content');
                        }}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        Conteúdos <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 3: QUADRO KANBAN DE CONTEÚDO */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Planejamento de Conteúdo</h2>
                <p className="text-xs text-slate-500">Gerencie o fluxo de criação, aprovação e publicação</p>
              </div>

              <button 
                onClick={() => setIsPostModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium text-xs sm:text-sm flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" /> Novo Conteúdo
              </button>
            </div>

            {/* Kanban Columns Responsive Board */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
              {KANBAN_STAGES.map((stage) => {
                const stagePosts = filteredPosts.filter(p => p.status === stage.id);

                return (
                  <div key={stage.id} className="bg-slate-100/70 border border-slate-200 rounded-2xl p-3 flex flex-col min-w-[280px]">
                    <div className={`p-2.5 rounded-xl border mb-3 flex items-center justify-between shadow-sm ${stage.bg}`}>
                      <h3 className="font-bold text-xs">{stage.name}</h3>
                      <span className="text-xs font-bold bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700">
                        {stagePosts.length}
                      </span>
                    </div>

                    <div className="space-y-3 flex-1">
                      {stagePosts.map((post) => {
                        const client = clients.find(c => c.id === post.clientId);
                        return (
                          <div 
                            key={post.id} 
                            className="bg-white border border-slate-200 rounded-xl p-3.5 hover:border-slate-300 transition-all shadow-sm"
                          >
                            <div className="flex justify-between items-start gap-2 mb-2">
                              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md truncate max-w-[140px]">
                                {client?.name}
                              </span>
                              <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                                {post.format}
                              </span>
                            </div>

                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 mb-2 line-clamp-2">{post.title}</h4>

                            {post.mediaUrl && (
                              <div className="mb-3 rounded-lg overflow-hidden h-28 bg-slate-100 border border-slate-200">
                                <img src={post.mediaUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                              </div>
                            )}

                            <div className="flex justify-between items-center text-xs text-slate-500 border-t border-slate-100 pt-2.5">
                              <span className="flex items-center gap-1 text-[11px] font-medium">
                                <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                                {post.publishDate}
                              </span>

                              <button 
                                onClick={() => setPreviewPost(post)}
                                className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="mt-2.5 pt-2 border-t border-slate-100 flex justify-between items-center text-[10px]">
                              <span className="text-slate-400 font-medium">Status:</span>
                              <select 
                                value={post.status} 
                                onChange={(e) => updatePostStatus(post.id, e.target.value)}
                                className="bg-slate-50 text-slate-700 border border-slate-200 rounded px-1.5 py-0.5 text-[11px] font-medium focus:outline-none"
                              >
                                {KANBAN_STAGES.map(s => (
                                  <option key={s.id} value={s.id}>{s.id}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        );
                      })}

                      {stagePosts.length === 0 && (
                        <div className="h-24 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400">
                          Nenhum post aqui
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 4: FINANCEIRO DEDICADO POR CLIENTE */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'financial' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Financeiro por Cliente</h2>
                <p className="text-xs text-slate-500">
                  Anote entradas de contratos e despesas associadas (anúncios, designers, ferramentas)
                </p>
              </div>

              <button 
                onClick={() => setIsTransactionModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium text-xs sm:text-sm flex items-center gap-2 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" /> Lançar Transação
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <span className="text-xs text-slate-500 font-medium">Faturamento Total</span>
                <p className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1">
                  R$ {totalFinancials.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <span className="text-xs text-slate-500 font-medium">Custos e Repasses</span>
                <p className="text-xl sm:text-2xl font-bold text-rose-600 mt-1">
                  R$ {totalFinancials.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <span className="text-xs text-slate-500 font-medium">Lucro Líquido Retido</span>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                  R$ {totalFinancials.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Extrato de Entradas & Saídas</h3>
                <span className="text-xs text-slate-500">{filteredTransactions.length} registros</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Cliente</th>
                      <th className="p-3.5">Tipo</th>
                      <th className="p-3.5">Descrição</th>
                      <th className="p-3.5">Categoria</th>
                      <th className="p-3.5">Data</th>
                      <th className="p-3.5 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredTransactions.map((tx) => {
                      const client = clients.find(c => c.id === tx.clientId);
                      const isIncome = tx.type === 'income';

                      return (
                        <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3.5 font-bold text-slate-900">{client?.name || 'Geral'}</td>
                          <td className="p-3.5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              isIncome 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {isIncome ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                              {isIncome ? 'Entrada' : 'Saída'}
                            </span>
                          </td>
                          <td className="p-3.5 font-medium">{tx.description}</td>
                          <td className="p-3.5">
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200">
                              {tx.category}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-500">{tx.date}</td>
                          <td className={`p-3.5 text-right font-bold ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isIncome ? '+' : '-'} R$ {Number(tx.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}

                    {filteredTransactions.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center py-8 text-slate-400">
                          Nenhuma transação lançada para este filtro.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 5: LINKS & ARQUIVOS */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'links' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Central de Acessos e Arquivos</h2>
                <p className="text-xs text-slate-500">Links úteis de Drive, Figma e Gerenciador de Anúncios</p>
              </div>

              <button 
                onClick={() => setIsLinkModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium text-xs sm:text-sm flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" /> Cadastrar Link
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {clients.map((client) => {
                const clientLinks = client.links || [];

                return (
                  <div key={client.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                      <img src={client.logo} alt={client.name} className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base">{client.name}</h3>
                        <span className="text-xs text-slate-500">{clientLinks.length} links cadastrados</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {clientLinks.map((link) => (
                        <a 
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-3 bg-slate-50 hover:bg-indigo-50/50 rounded-xl border border-slate-200 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white group-hover:bg-indigo-600 group-hover:text-white rounded-lg text-slate-500 border border-slate-200 transition-colors">
                              <LinkIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-900">{link.title}</h4>
                              <span className="text-[10px] text-slate-500">{link.category}</span>
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                        </a>
                      ))}

                      {clientLinks.length === 0 && (
                        <p className="text-xs text-slate-400 py-4 text-center">Nenhum link adicionado para este cliente.</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* ---------------------------------------------------- */}
      {/* MODALS LIGHT THEME */}
      {/* ---------------------------------------------------- */}

      {/* MODAL: PREVIEW POST */}
      {previewPost && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <button onClick={() => setPreviewPost(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                {previewPost.format}
              </span>
              <span className="text-xs text-slate-500">• Publicação: {previewPost.publishDate}</span>
            </div>

            <h3 className="text-lg font-bold text-slate-900">{previewPost.title}</h3>

            {previewPost.mediaUrl && (
              <div className="rounded-xl overflow-hidden max-h-60 bg-slate-100 border border-slate-200">
                <img src={previewPost.mediaUrl} alt="Preview" className="w-full h-full object-contain" />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Legenda / Copywrite:</label>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs text-slate-800 whitespace-pre-wrap max-h-36 overflow-y-auto">
                {previewPost.copy || 'Sem legenda preenchida.'}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-700">Fluxo de Aprovação:</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    updatePostStatus(previewPost.id, 'Aprovado');
                    setPreviewPost(null);
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Check className="w-4 h-4" /> Aprovar Post
                </button>
                <button 
                  onClick={() => {
                    updatePostStatus(previewPost.id, 'Em Produção');
                    setPreviewPost(null);
                  }}
                  className="flex-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  Pedir Ajuste
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVO CLIENTE */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button onClick={() => setIsClientModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-4">Adicionar Cliente</h3>

            <form onSubmit={handleAddClient} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nome da Marca / Cliente *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Restaurante Sabor"
                  value={newClient.name}
                  onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Contato</label>
                  <input 
                    type="text" 
                    placeholder="Ex: João Silva"
                    value={newClient.contactPerson}
                    onChange={e => setNewClient({ ...newClient, contactPerson: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nicho</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Gastronomia"
                    value={newClient.niche}
                    onChange={e => setNewClient({ ...newClient, niche: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Fee Mensal (R$)</label>
                  <input 
                    type="number" 
                    placeholder="3500"
                    value={newClient.contractValue}
                    onChange={e => setNewClient({ ...newClient, contractValue: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Dia Vencimento</label>
                  <input 
                    type="number" 
                    placeholder="10"
                    value={newClient.dueDay}
                    onChange={e => setNewClient({ ...newClient, dueDay: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Tags (separadas por vírgula)</label>
                <input 
                  type="text" 
                  placeholder="Social Media, Tráfego Pago"
                  value={newClient.tags}
                  onChange={e => setNewClient({ ...newClient, tags: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsClientModalOpen(false)} className="px-4 py-2 text-slate-500 hover:text-slate-800 font-medium">Cancelar</button>
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-bold shadow-sm">Salvar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVO CONTEÚDO */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button onClick={() => setIsPostModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-4">Novo Conteúdo</h3>

            <form onSubmit={handleAddPost} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Cliente *</label>
                <select 
                  value={newPost.clientId}
                  onChange={e => setNewPost({ ...newPost, clientId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Título do Post *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Lançamento de Produto"
                  value={newPost.title}
                  onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Formato</label>
                  <select 
                    value={newPost.format}
                    onChange={e => setNewPost({ ...newPost, format: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  >
                    <option value="Reels">Reels / Vídeo Curto</option>
                    <option value="Carrossel">Carrossel</option>
                    <option value="Stories">Stories</option>
                    <option value="Banner">Banner Single</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Data Prevista</label>
                  <input 
                    type="date" 
                    value={newPost.publishDate}
                    onChange={e => setNewPost({ ...newPost, publishDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Legenda / Copy</label>
                <textarea 
                  rows="3"
                  placeholder="Texto do post..."
                  value={newPost.copy}
                  onChange={e => setNewPost({ ...newPost, copy: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Link da Imagem (Opcional)</label>
                <input 
                  type="text" 
                  placeholder="https://..."
                  value={newPost.mediaUrl}
                  onChange={e => setNewPost({ ...newPost, mediaUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsPostModalOpen(false)} className="px-4 py-2 text-slate-500 hover:text-slate-800 font-medium">Cancelar</button>
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-bold shadow-sm">Criar Conteúdo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVA TRANSAÇÃO */}
      {isTransactionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button onClick={() => setIsTransactionModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-4">Lançar Transação</h3>

            <form onSubmit={handleAddTransaction} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Cliente Vinculado</label>
                <select 
                  value={newTransaction.clientId}
                  onChange={e => setNewTransaction({ ...newTransaction, clientId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tipo</label>
                  <select 
                    value={newTransaction.type}
                    onChange={e => setNewTransaction({ ...newTransaction, type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  >
                    <option value="income">Entrada (Receita)</option>
                    <option value="expense">Saída (Despesa)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Categoria</label>
                  <select 
                    value={newTransaction.category}
                    onChange={e => setNewTransaction({ ...newTransaction, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  >
                    <option value="Mensalidade">Mensalidade</option>
                    <option value="Tráfego Pago">Tráfego Pago</option>
                    <option value="Freelancer">Freelancer</option>
                    <option value="Ferramentas">Ferramentas</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Descrição *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Anúncios Facebook Outubro"
                  value={newTransaction.description}
                  onChange={e => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Valor (R$) *</label>
                  <input 
                    type="number" 
                    required
                    placeholder="1000"
                    value={newTransaction.amount}
                    onChange={e => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Data</label>
                  <input 
                    type="date" 
                    value={newTransaction.date}
                    onChange={e => setNewTransaction({ ...newTransaction, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsTransactionModalOpen(false)} className="px-4 py-2 text-slate-500 hover:text-slate-800 font-medium">Cancelar</button>
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl font-bold shadow-sm">Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVO LINK */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button onClick={() => setIsLinkModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-4">Cadastrar Link Útil</h3>

            <form onSubmit={handleAddLink} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Cliente *</label>
                <select 
                  value={newLink.clientId}
                  onChange={e => setNewLink({ ...newLink, clientId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Título do Link *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Pasta Google Drive"
                  value={newLink.title}
                  onChange={e => setNewLink({ ...newLink, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">URL (https://...) *</label>
                <input 
                  type="url" 
                  required
                  placeholder="https://drive.google.com/..."
                  value={newLink.url}
                  onChange={e => setNewLink({ ...newLink, url: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Categoria</label>
                <select 
                  value={newLink.category}
                  onChange={e => setNewLink({ ...newLink, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                >
                  <option value="Drive">Drive / Nuvem</option>
                  <option value="Design">Figma / Design</option>
                  <option value="Tráfego">Meta Ads</option>
                  <option value="Relatórios">Looker Studio</option>
                  <option value="Geral">Geral</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsLinkModalOpen(false)} className="px-4 py-2 text-slate-500 hover:text-slate-800 font-medium">Cancelar</button>
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-bold shadow-sm">Salvar Link</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
