import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, onSnapshot, addDoc, doc, deleteDoc, updateDoc 
} from 'firebase/firestore';
import { 
  Users, DollarSign, Calendar, Link as LinkIcon, Plus, LayoutDashboard, 
  Trash2, ExternalLink, ArrowUpRight, ArrowDownRight, Percent, CheckCircle, 
  Clock, FileText, Share2, Tag, Layers, Search, Eye, X, Target, Palette
} from 'lucide-react';

// =========================================================
// SUAS CHAVES DO FIREBASE
// =========================================================
const firebaseConfig = {
  apiKey: "AIzaSyC7KvRTkXL7lvwYA9OodiUUytkyPG6iQoA",
  authDomain: "central-marketing-66369.firebaseapp.com",
  projectId: "central-marketing-66369",
  storageBucket: "central-marketing-66369.firebasestorage.app",
  messagingSenderId: "564775197294",
  appId: "1:564775197294:web:6a08516866345bcafc647f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedClient, setSelectedClient] = useState('all');

  // Dados em Tempo Real do Firebase
  const [clients, setClients] = useState([]);
  const [contents, setContents] = useState([]);
  const [finances, setFinances] = useState([]);
  const [links, setLinks] = useState([]);
  const [leads, setLeads] = useState([]);

  // Modais
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', contact: '', niche: '', fee: '', dueDate: '', color: '#4F46E5', tags: '' });

  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [newContent, setNewContent] = useState({ clientId: '', title: '', format: 'Carrossel', channel: 'Instagram', status: 'Ideia', date: '', copy: '' });

  const [isFinanceModalOpen, setIsFinanceModalOpen] = useState(false);
  const [newFinance, setNewFinance] = useState({ clientId: '', type: 'income', description: '', amount: '', category: 'Mensalidade', date: '' });

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [newLink, setNewLink] = useState({ clientId: '', title: '', url: '', category: 'Arquivos' });

  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [newLead, setNewLead] = useState({ name: '', contact: '', value: '', status: 'Prospecção', source: 'Instagram', notes: '' });

  const [previewContent, setPreviewContent] = useState(null);

  // Sync Firebase
  useEffect(() => {
    const unsubClients = onSnapshot(collection(db, 'clients'), (snapshot) => {
      const loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      loaded.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR', { sensitivity: 'base' }));
      setClients(loaded);
    });
    const unsubContents = onSnapshot(collection(db, 'contents'), (snapshot) => {
      setContents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubFinances = onSnapshot(collection(db, 'finances'), (snapshot) => {
      setFinances(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubLinks = onSnapshot(collection(db, 'links'), (snapshot) => {
      setLinks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubLeads = onSnapshot(collection(db, 'leads'), (snapshot) => {
      setLeads(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubClients();
      unsubContents();
      unsubFinances();
      unsubLinks();
      unsubLeads();
    };
  }, []);

  // Handlers Firebase
  const handleAddClient = async (e) => {
    e.preventDefault();
    if (!newClient.name) return;
    await addDoc(collection(db, 'clients'), {
      name: newClient.name,
      contact: newClient.contact,
      niche: newClient.niche,
      fee: Number(newClient.fee) || 0,
      dueDate: Number(newClient.dueDate) || 1,
      color: newClient.color || '#4F46E5',
      tags: newClient.tags ? newClient.tags.split(',').map(t => t.trim()) : []
    });
    setNewClient({ name: '', contact: '', niche: '', fee: '', dueDate: '', color: '#4F46E5', tags: '' });
    setIsClientModalOpen(false);
  };

  const handleAddContent = async (e) => {
    e.preventDefault();
    if (!newContent.title || !newContent.clientId) return;
    await addDoc(collection(db, 'contents'), newContent);
    setNewContent({ clientId: '', title: '', format: 'Carrossel', channel: 'Instagram', status: 'Ideia', date: '', copy: '' });
    setIsContentModalOpen(false);
  };

  const handleAddFinance = async (e) => {
    e.preventDefault();
    if (!newFinance.description || !newFinance.amount || !newFinance.clientId) return;
    await addDoc(collection(db, 'finances'), {
      ...newFinance,
      amount: Number(newFinance.amount)
    });
    setNewFinance({ clientId: '', type: 'income', description: '', amount: '', category: 'Mensalidade', date: '' });
    setIsFinanceModalOpen(false);
  };

  const handleAddLink = async (e) => {
    e.preventDefault();
    if (!newLink.title || !newLink.url || !newLink.clientId) return;
    await addDoc(collection(db, 'links'), newLink);
    setNewLink({ clientId: '', title: '', url: '', category: 'Arquivos' });
    setIsLinkModalOpen(false);
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    if (!newLead.name) return;
    await addDoc(collection(db, 'leads'), {
      ...newLead,
      value: Number(newLead.value) || 0
    });
    setNewLead({ name: '', contact: '', value: '', status: 'Prospecção', source: 'Instagram', notes: '' });
    setIsLeadModalOpen(false);
  };

  const handleUpdateStatus = async (coll, id, status) => {
    await updateDoc(doc(db, coll, id), { status });
  };

  const handleDeleteDoc = async (coll, id) => {
    await deleteDoc(doc(db, coll, id));
  };

  // Determina a cor do texto (Preto ou Branco) com base no contraste do fundo HEX
  const getContrastTextColor = (hexColor) => {
    if (!hexColor || !hexColor.startsWith('#')) return '#FFFFFF';
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? '#1E293B' : '#FFFFFF';
  };

  // Renderizador de Badge com Cor Livre Selecionada
  const renderClientTag = (clientObj) => {
    const bg = clientObj?.color || '#4F46E5';
    const text = getContrastTextColor(bg);
    return (
      <span 
        style={{ backgroundColor: bg, color: text }}
        className="text-[10px] font-bold px-2.5 py-0.5 rounded-md inline-block shadow-sm"
      >
        {clientObj?.name || 'Cliente'}
      </span>
    );
  };

  // Cálculos Financeiros
  const filteredFinances = selectedClient === 'all' 
    ? finances 
    : finances.filter(f => f.clientId === selectedClient);

  const filteredContents = selectedClient === 'all' 
    ? contents 
    : contents.filter(c => c.clientId === selectedClient);

  const totalIncome = filteredFinances.filter(f => f.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = filteredFinances.filter(f => f.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const netProfit = totalIncome - totalExpense;
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(0) : 0;

  const statusColumns = ['Ideia', 'Em Produção', 'Aprovação', 'Publicado'];
  const crmColumns = ['Prospecção', 'Reunião Agendada', 'Proposta Enviada', 'Fechado / Ganho', 'Perdido'];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      {/* Cabeçalho do App */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-100 shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-none">Central do Cliente</h1>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full border border-indigo-100">
                    Nuvem Sync
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Gestão Integrada de Marketing & Finanças</p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select 
                value={selectedClient} 
                onChange={(e) => setSelectedClient(e.target.value)}
                className="flex-1 sm:flex-none bg-slate-50 border border-slate-300 text-slate-700 text-xs sm:text-sm rounded-lg px-2.5 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium truncate"
              >
                <option value="all">Todos os Clientes</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <button 
                onClick={() => setIsClientModalOpen(true)}
                className="shrink-0 flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold px-3 py-2 rounded-lg transition shadow-md shadow-indigo-200"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Cliente</span>
              </button>
            </div>
          </div>

          {/* Abas Deslizantes */}
          <div className="flex gap-1.5 border-t border-slate-100 mt-3 pt-2 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'clients', label: 'Clientes', icon: Users, count: clients.length },
              { id: 'crm', label: 'CRM & Vendas', icon: Target, count: leads.length },
              { id: 'content', label: 'Conteúdo', icon: Calendar, count: contents.length },
              { id: 'finance', label: 'Financeiro', icon: DollarSign },
              { id: 'links', label: 'Acessos & Links', icon: LinkIcon, count: links.length }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap shrink-0 ${
                    isActive 
                      ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-200 text-slate-700'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6">
        
        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Clientes Ativos</p>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{clients.length}</p>
                </div>
                <div className="p-2.5 sm:p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Faturamento Total</p>
                  <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="p-2.5 sm:p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Despesas Associadas</p>
                  <p className="text-xl sm:text-2xl font-black text-rose-600 mt-1">R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="p-2.5 sm:p-3 bg-rose-50 text-rose-600 rounded-xl">
                  <ArrowDownRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Lucro Líquido Real</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-xl sm:text-2xl font-black text-slate-900">R$ {netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded">{profitMargin}%</span>
                  </div>
                </div>
                <div className="p-2.5 sm:p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Percent className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>

            {/* Painel de Ações Rápidas */}
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-900 p-4 sm:p-6 rounded-2xl shadow-xl text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold">Painel de Ações Rápidas</h2>
                <p className="text-xs text-indigo-200 mt-1">Sincronize clientes, posts e prospecção em tempo real.</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => setIsLeadModalOpen(true)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-amber-400 text-slate-950 font-bold px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm hover:bg-amber-300 transition shadow"
                >
                  <Target className="w-4 h-4" /> Novo Lead / CRM
                </button>
                <button 
                  onClick={() => setIsContentModalOpen(true)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-white text-indigo-950 font-bold px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm hover:bg-slate-100 transition shadow"
                >
                  <Plus className="w-4 h-4 text-indigo-600" /> Novo Conteúdo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CLIENTES */}
        {activeTab === 'clients' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Clientes Cadastrados</h2>
                <p className="text-xs text-slate-500">Organizados por ordem alfabética com cor de tag customizável.</p>
              </div>
              <button onClick={() => setIsClientModalOpen(true)} className="flex items-center gap-1 bg-indigo-600 text-white text-xs sm:text-sm font-bold px-3 py-2 rounded-lg">
                <Plus className="w-4 h-4" /> Novo Cliente
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {clients.map(c => (
                <div key={c.id} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm relative hover:border-indigo-200 transition">
                  <div className="flex justify-between items-start gap-2">
                    <div>{renderClientTag(c)}</div>
                    <button onClick={() => handleDeleteDoc('clients', c.id)} className="text-slate-400 hover:text-rose-600 transition shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-3">Contato: {c.contact || 'Não informado'}</p>
                  <p className="text-xs text-slate-500">Nicho: {c.niche || 'Geral'}</p>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs sm:text-sm">
                    <span className="font-bold text-emerald-600">R$ {c.fee}/mês</span>
                    <span className="text-[11px] bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded">Dia Venc.: {c.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CRM */}
        {activeTab === 'crm' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">CRM & Funil de Prospecção</h2>
                <p className="text-xs text-slate-500">Gerencie potenciais novos clientes e acompanhe as negociações.</p>
              </div>
              <button onClick={() => setIsLeadModalOpen(true)} className="flex items-center gap-1 bg-amber-500 text-slate-950 font-bold px-3 py-2 rounded-lg hover:bg-amber-400">
                <Plus className="w-4 h-4" /> Novo Lead
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 overflow-x-auto">
              {crmColumns.map(col => {
                const colLeads = leads.filter(l => (l.status || 'Prospecção') === col);
                return (
                  <div key={col} className="bg-slate-100/80 p-3 rounded-2xl border border-slate-200/60 min-h-[350px]">
                    <div className="flex justify-between items-center mb-3 px-1">
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 truncate">{col}</h3>
                      <span className="text-xs bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">{colLeads.length}</span>
                    </div>

                    <div className="space-y-2.5">
                      {colLeads.map(lead => (
                        <div key={lead.id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900">{lead.name}</h4>
                            <button onClick={() => handleDeleteDoc('leads', lead.id)} className="text-slate-300 hover:text-rose-600">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-500">Contato: {lead.contact || 'N/A'}</p>
                          <p className="text-xs font-bold text-emerald-600">Estimado: R$ {lead.value}/mês</p>
                          {lead.notes && <p className="text-[11px] bg-amber-50 text-amber-900 p-2 rounded border border-amber-100 italic">{lead.notes}</p>}

                          <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px]">
                            <span className="text-slate-400">{lead.source}</span>
                            <select 
                              value={lead.status || col} 
                              onChange={(e) => handleUpdateStatus('leads', lead.id, e.target.value)}
                              className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-700 font-medium text-[10px]"
                            >
                              {crmColumns.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ACESSOS E LINKS */}
        {activeTab === 'links' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Central de Links & Pastas</h2>
                <p className="text-xs text-slate-500">Google Drive, Figma, Gerenciador de Anúncios de cada conta.</p>
              </div>
              <button onClick={() => setIsLinkModalOpen(true)} className="flex items-center gap-1 bg-indigo-600 text-white text-xs sm:text-sm font-bold px-3 py-2 rounded-lg">
                <Plus className="w-4 h-4" /> Novo Link
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {links.map(l => {
                const client = clients.find(c => c.id === l.clientId);
                return (
                  <div key={l.id} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center hover:border-indigo-200 transition">
                    <div>
                      <div className="mb-1.5">{renderClientTag(client)}</div>
                      <h4 className="font-bold text-slate-900 text-sm">{l.title}</h4>
                      <a href={l.url} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 font-semibold flex items-center gap-1 mt-1.5 hover:underline">
                        Abrir em nova aba <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <button onClick={() => handleDeleteDoc('links', l.id)} className="text-slate-300 hover:text-rose-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CONTEÚDO */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Quadro de Planejamento (Kanban)</h2>
                <p className="text-xs text-slate-500">Acompanhe as fases de produção e aprovação.</p>
              </div>
              <button onClick={() => setIsContentModalOpen(true)} className="flex items-center gap-1 bg-indigo-600 text-white text-xs sm:text-sm font-bold px-3 py-2 rounded-lg">
                <Plus className="w-4 h-4" /> Novo Post
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {statusColumns.map(col => {
                const colPosts = filteredContents.filter(c => (c.status || 'Ideia') === col);
                return (
                  <div key={col} className="bg-slate-100/80 p-3 rounded-2xl border border-slate-200/60 min-h-[350px]">
                    <div className="flex justify-between items-center mb-3 px-1">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">{col}</h3>
                      <span className="text-xs bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">{colPosts.length}</span>
                    </div>

                    <div className="space-y-2.5">
                      {colPosts.map(post => {
                        const client = clients.find(c => c.id === post.clientId);
                        return (
                          <div key={post.id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-2">
                            <div className="flex justify-between items-start gap-2">
                              <div>{renderClientTag(client)}</div>
                              <button onClick={() => handleDeleteDoc('contents', post.id)} className="text-slate-300 hover:text-rose-600 shrink-0">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900">{post.title}</h4>
                            <p className="text-[11px] text-slate-500">{post.format} • {post.channel}</p>

                            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px]">
                              <span className="text-slate-400">{post.date}</span>
                              <select 
                                value={post.status || col} 
                                onChange={(e) => handleUpdateStatus('contents', post.id, e.target.value)}
                                className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-700 font-medium text-[11px]"
                              >
                                {statusColumns.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FINANCEIRO */}
        {activeTab === 'finance' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Extrato Financeiro</h2>
                <p className="text-xs text-slate-500">Lançamentos de honorários e despesas.</p>
              </div>
              <button onClick={() => setIsFinanceModalOpen(true)} className="flex items-center gap-1 bg-indigo-600 text-white text-xs sm:text-sm font-bold px-3 py-2 rounded-lg">
                <Plus className="w-4 h-4" /> Nova Transação
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-sm">
              <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[500px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                    <th className="p-3 sm:p-4">Cliente</th>
                    <th className="p-3 sm:p-4">Descrição</th>
                    <th className="p-3 sm:p-4">Tipo</th>
                    <th className="p-3 sm:p-4">Valor</th>
                    <th className="p-3 sm:p-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFinances.map(f => {
                    const client = clients.find(c => c.id === f.clientId);
                    return (
                      <tr key={f.id} className="hover:bg-slate-50/50">
                        <td className="p-3 sm:p-4 font-bold text-slate-900">{client?.name || 'Cliente'}</td>
                        <td className="p-3 sm:p-4 text-slate-700">{f.description}</td>
                        <td className="p-3 sm:p-4">
                          <span className={`text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-bold ${f.type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {f.type === 'income' ? 'Entrada' : 'Despesa'}
                          </span>
                        </td>
                        <td className={`p-3 sm:p-4 font-bold ${f.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {f.type === 'income' ? '+' : '-'} R$ {f.amount.toFixed(2)}
                        </td>
                        <td className="p-3 sm:p-4 text-right">
                          <button onClick={() => handleDeleteDoc('finances', f.id)} className="text-slate-400 hover:text-rose-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* MODAL CLIENTE (SELETOR DE COR DA TAG) */}
      {isClientModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4">Adicionar Novo Cliente</h3>
            <form onSubmit={handleAddClient} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome da Marca / Cliente *</label>
                <input required type="text" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>

              {/* Seletor de Cor Livre (Color Picker + Hex) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-indigo-600" /> Cor da Tag do Cliente
                </label>
                <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <input 
                    type="color" 
                    value={newClient.color} 
                    onChange={e => setNewClient({...newClient, color: e.target.value})} 
                    className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent p-0"
                  />
                  <div className="flex-1">
                    <input 
                      type="text" 
                      value={newClient.color} 
                      onChange={e => setNewClient({...newClient, color: e.target.value})} 
                      className="w-full text-xs font-mono font-bold bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-800 uppercase"
                      placeholder="#4F46E5"
                    />
                  </div>
                  <div className="shrink-0">
                    <span 
                      style={{ backgroundColor: newClient.color, color: getContrastTextColor(newClient.color) }}
                      className="text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm"
                    >
                      Prévia
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contato</label>
                  <input type="text" value={newClient.contact} onChange={e => setNewClient({...newClient, contact: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nicho</label>
                  <input type="text" value={newClient.niche} onChange={e => setNewClient({...newClient, niche: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fee Mensal (R$)</label>
                  <input type="number" value={newClient.fee} onChange={e => setNewClient({...newClient, fee: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Dia Vencimento</label>
                  <input type="number" value={newClient.dueDate} onChange={e => setNewClient({...newClient, dueDate: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-5 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsClientModalOpen(false)} className="px-3.5 py-2 text-xs sm:text-sm text-slate-600 font-semibold hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-xs sm:text-sm bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow">Salvar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CRM LEAD */}
      {isLeadModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4">Adicionar Lead ao CRM</h3>
            <form onSubmit={handleAddLead} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Lead / Marca *</label>
                <input required type="text" value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contato / Telefone</label>
                  <input type="text" value={newLead.contact} onChange={e => setNewLead({...newLead, contact: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Valor Estimado (R$)</label>
                  <input type="number" value={newLead.value} onChange={e => setNewLead({...newLead, value: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status Inicial</label>
                <select value={newLead.status} onChange={e => setNewLead({...newLead, status: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                  {crmColumns.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notas de Acompanhamento</label>
                <textarea rows="2" value={newLead.notes} onChange={e => setNewLead({...newLead, notes: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Ex: Reunião agendada para quinta-feira..."></textarea>
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsLeadModalOpen(false)} className="px-3.5 py-2 text-xs sm:text-sm text-slate-600 font-semibold hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-xs sm:text-sm bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-400 shadow">Salvar Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONTEÚDO */}
      {isContentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4">Adicionar Novo Post</h3>
            <form onSubmit={handleAddContent} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cliente *</label>
                <select required value={newContent.clientId} onChange={e => setNewContent({...newContent, clientId: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                  <option value="">Selecione um cliente</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Título do Post *</label>
                <input required type="text" value={newContent.title} onChange={e => setNewContent({...newContent, title: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Formato</label>
                  <select value={newContent.format} onChange={e => setNewContent({...newContent, format: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                    <option value="Carrossel">Carrossel</option>
                    <option value="Reels">Reels</option>
                    <option value="Estático">Estático</option>
                    <option value="Stories">Stories</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select value={newContent.status} onChange={e => setNewContent({...newContent, status: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                    {statusColumns.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsContentModalOpen(false)} className="px-3.5 py-2 text-xs sm:text-sm text-slate-600 font-semibold hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-xs sm:text-sm bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow">Salvar Conteúdo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TRANSAÇÃO */}
      {isFinanceModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4">Nova Transação</h3>
            <form onSubmit={handleAddFinance} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cliente *</label>
                <select required value={newFinance.clientId} onChange={e => setNewFinance({...newFinance, clientId: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                  <option value="">Selecione um cliente</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição *</label>
                <input required type="text" placeholder="Ex: Honorários do mês ou Tráfego Pago" value={newFinance.description} onChange={e => setNewFinance({...newFinance, description: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo</label>
                  <select value={newFinance.type} onChange={e => setNewFinance({...newFinance, type: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                    <option value="income">Entrada / Receita</option>
                    <option value="expense">Despesa Dedicada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Valor (R$) *</label>
                  <input required type="number" value={newFinance.amount} onChange={e => setNewFinance({...newFinance, amount: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsFinanceModalOpen(false)} className="px-3.5 py-2 text-xs sm:text-sm text-slate-600 font-semibold hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-xs sm:text-sm bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow">Salvar Transação</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL LINK */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4">Adicionar Link Útil</h3>
            <form onSubmit={handleAddLink} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cliente *</label>
                <select required value={newLink.clientId} onChange={e => setNewLink({...newLink, clientId: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                  <option value="">Selecione um cliente</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Título do Link *</label>
                <input required type="text" placeholder="Ex: Pasta Google Drive" value={newLink.title} onChange={e => setNewLink({...newLink, title: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">URL (Link completo) *</label>
                <input required type="url" placeholder="https://..." value={newLink.url} onChange={e => setNewLink({...newLink, url: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsLinkModalOpen(false)} className="px-3.5 py-2 text-xs sm:text-sm text-slate-600 font-semibold hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-xs sm:text-sm bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow">Salvar Link</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
