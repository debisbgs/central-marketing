import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, onSnapshot, addDoc, doc, deleteDoc, updateDoc 
} from 'firebase/firestore';
import { 
  Users, DollarSign, Calendar, Link as LinkIcon, Plus, LayoutDashboard, 
  Trash2, ExternalLink, ArrowUpRight, ArrowDownRight, Percent, CheckCircle, 
  Clock, FileText, Share2, Tag, Layers, Search, Eye, X
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

  // Modais
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', contact: '', niche: '', fee: '', dueDate: '', tags: '' });

  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [newContent, setNewContent] = useState({ clientId: '', title: '', format: 'Carrossel', channel: 'Instagram', status: 'Ideia', date: '', copy: '' });

  const [isFinanceModalOpen, setIsFinanceModalOpen] = useState(false);
  const [newFinance, setNewFinance] = useState({ clientId: '', type: 'income', description: '', amount: '', category: 'Mensalidade', date: '' });

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [newLink, setNewLink] = useState({ clientId: '', title: '', url: '', category: 'Arquivos' });

  const [previewContent, setPreviewContent] = useState(null);

  // Sync Firebase
  useEffect(() => {
    const unsubClients = onSnapshot(collection(db, 'clients'), (snapshot) => {
      setClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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

    return () => {
      unsubClients();
      unsubContents();
      unsubFinances();
      unsubLinks();
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
      tags: newClient.tags ? newClient.tags.split(',').map(t => t.trim()) : []
    });
    setNewClient({ name: '', contact: '', niche: '', fee: '', dueDate: '', tags: '' });
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

  const handleUpdateStatus = async (id, status) => {
    await updateDoc(doc(db, 'contents', id), { status });
  };

  const handleDeleteDoc = async (coll, id) => {
    await deleteDoc(doc(db, coll, id));
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      {/* Cabeçalho do App (Design da Imagem 1) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-100">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-slate-900 leading-none">Central do Cliente</h1>
                  <span className="text-[11px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full border border-indigo-100">
                    Nuvem Sync
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Gestão Integrada de Marketing & Finanças</p>
              </div>
            </div>

            {/* Filtro Global de Cliente */}
            <div className="flex items-center gap-3">
              <select 
                value={selectedClient} 
                onChange={(e) => setSelectedClient(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-700 text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
              >
                <option value="all">Todos os Clientes</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <button 
                onClick={() => setIsClientModalOpen(true)}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition shadow-md shadow-indigo-200"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Novo Cliente</span>
              </button>
            </div>
          </div>

          {/* Abas com Contadores */}
          <div className="flex gap-2 border-t border-slate-100 pt-2 pb-2 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'clients', label: 'Clientes', icon: Users, count: clients.length },
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
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
                    isActive 
                      ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-200 text-slate-700'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Faixa Informativa de Sincronização */}
        <div className="bg-indigo-50/60 border-t border-indigo-100 py-1.5 text-center">
          <p className="text-xs text-indigo-800 font-medium">
            📱 Sincronizado na nuvem: Acesse no celular ou PC com os mesmos dados em tempo real.
          </p>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* DASHBOARD PRINCIPAL (Design idêntico à Imagem 1) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Cards Superiores */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Clientes Ativos</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{clients.length}</p>
                  <p className="text-xs text-slate-400 mt-1">{clients.length} de {clients.length} cadastrados</p>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Faturamento Total</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <ArrowUpRight className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Despesas Associadas</p>
                  <p className="text-2xl font-black text-rose-600 mt-1">R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                  <ArrowDownRight className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lucro Líquido Real</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-2xl font-black text-slate-900">R$ {netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded">{profitMargin}%</span>
                  </div>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Percent className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Painel de Ações Rápidas (Barra Azul/Roxa da Imagem 1) */}
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-900 p-6 rounded-2xl shadow-xl text-white flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-lg font-bold">Painel de Ações Rápidas</h2>
                <p className="text-xs text-indigo-200 mt-1">Mantenha o planejamento de posts, faturamento e contas sincronizados em qualquer dispositivo.</p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button 
                  onClick={() => setIsContentModalOpen(true)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-white text-indigo-950 font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-slate-100 transition shadow"
                >
                  <Plus className="w-4 h-4 text-indigo-600" /> Novo Conteúdo
                </button>
                <button 
                  onClick={() => setIsFinanceModalOpen(true)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition shadow border border-indigo-400/30"
                >
                  <DollarSign className="w-4 h-4" /> Nova Transação
                </button>
              </div>
            </div>

            {/* Seções Inferiores do Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Próximas Publicações */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600" /> Próximas Publicações Programadas
                  </h3>
                  <button onClick={() => setActiveTab('content')} className="text-xs text-indigo-600 font-bold hover:underline">
                    Ver Kanban &gt;
                  </button>
                </div>
                <div className="space-y-3">
                  {contents.slice(0, 3).map(cnt => {
                    const client = clients.find(c => c.id === cnt.clientId);
                    return (
                      <div key={cnt.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded">{client?.name || 'Cliente'}</span>
                          <h4 className="text-sm font-semibold text-slate-900 mt-1">{cnt.title}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{cnt.format} • {cnt.channel}</p>
                        </div>
                        <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2.5 py-1 rounded-full">{cnt.status}</span>
                      </div>
                    );
                  })}
                  {contents.length === 0 && <p className="text-xs text-slate-400 py-4 text-center">Nenhum post agendado no momento.</p>}
                </div>
              </div>

              {/* Margem de Lucro por Cliente */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
                  <Percent className="w-4 h-4 text-emerald-600" /> Margem de Lucro por Cliente
                </h3>
                <div className="space-y-3">
                  {clients.map(cli => {
                    const cliFinances = finances.filter(f => f.clientId === cli.id);
                    const inc = cliFinances.filter(f => f.type === 'income').reduce((a, b) => a + b.amount, 0);
                    const exp = cliFinances.filter(f => f.type === 'expense').reduce((a, b) => a + b.amount, 0);
                    const net = inc - exp;
                    const margin = inc > 0 ? ((net / inc) * 100).toFixed(0) : 0;
                    return (
                      <div key={cli.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{cli.name}</h4>
                          <p className="text-xs text-slate-500">Fee: R$ {cli.fee}/mês</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-emerald-600">R$ {net.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                          <span className="text-xs font-semibold text-indigo-600">{margin}% de margem</span>
                        </div>
                      </div>
                    );
                  })}
                  {clients.length === 0 && <p className="text-xs text-slate-400 py-4 text-center">Cadastre um cliente para calcular a margem.</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CLIENTES */}
        {activeTab === 'clients' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Clientes Cadastrados</h2>
              <button onClick={() => setIsClientModalOpen(true)} className="flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-bold px-3.5 py-2 rounded-lg">
                <Plus className="w-4 h-4" /> Novo Cliente
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.map(c => (
                <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative hover:border-indigo-200 transition">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-900 text-lg">{c.name}</h3>
                    <button onClick={() => handleDeleteDoc('clients', c.id)} className="text-slate-400 hover:text-rose-600 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Contato: {c.contact || 'Não informado'}</p>
                  <p className="text-xs text-slate-500">Nicho: {c.niche || 'Geral'}</p>
                  
                  {c.tags && c.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {c.tags.map((t, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-sm">
                    <span className="font-bold text-emerald-600">R$ {c.fee}/mês</span>
                    <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2 py-1 rounded">Vencimento: dia {c.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PLANEJAMENTO DE CONTEÚDO (Visual Quadro Kanban Avançado) */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Quadro de Planejamento (Kanban)</h2>
                <p className="text-xs text-slate-500">Acompanhe as fases de produção e aprovação dos conteúdos.</p>
              </div>
              <button onClick={() => setIsContentModalOpen(true)} className="flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-bold px-3.5 py-2 rounded-lg">
                <Plus className="w-4 h-4" /> Novo Post
              </button>
            </div>

            {/* Colunas do Kanban */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {statusColumns.map(col => {
                const colPosts = filteredContents.filter(c => (c.status || 'Ideia') === col);
                return (
                  <div key={col} className="bg-slate-100/80 p-3 rounded-2xl border border-slate-200/60 min-h-[400px]">
                    <div className="flex justify-between items-center mb-3 px-1">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">{col}</h3>
                      <span className="text-xs bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">{colPosts.length}</span>
                    </div>

                    <div className="space-y-3">
                      {colPosts.map(post => {
                        const client = clients.find(c => c.id === post.clientId);
                        return (
                          <div key={post.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2 hover:shadow-md transition">
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded">{client?.name || 'Cliente'}</span>
                              <button onClick={() => handleDeleteDoc('contents', post.id)} className="text-slate-300 hover:text-rose-600">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900">{post.title}</h4>
                            <p className="text-xs text-slate-500">{post.format} • {post.channel}</p>

                            {post.copy && (
                              <button 
                                onClick={() => setPreviewContent(post)}
                                className="flex items-center gap-1 text-xs text-indigo-600 font-bold hover:underline pt-1"
                              >
                                <Eye className="w-3 h-3" /> Ver Copy / Texto
                              </button>
                            )}

                            {/* Mudar de fase no Kanban */}
                            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px]">
                              <span className="text-slate-400">{post.date}</span>
                              <select 
                                value={post.status || col} 
                                onChange={(e) => handleUpdateStatus(post.id, e.target.value)}
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

        {/* FINANCEIRO DEDICADO POR CLIENTE */}
        {activeTab === 'finance' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Extrato Financeiro Dedicado</h2>
                <p className="text-xs text-slate-500">Lançamentos de honorários e despesas vinculadas a cada conta.</p>
              </div>
              <button onClick={() => setIsFinanceModalOpen(true)} className="flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-bold px-3.5 py-2 rounded-lg">
                <Plus className="w-4 h-4" /> Nova Transação
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Descrição</th>
                    <th className="p-4">Tipo</th>
                    <th className="p-4">Valor</th>
                    <th className="p-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFinances.map(f => {
                    const client = clients.find(c => c.id === f.clientId);
                    return (
                      <tr key={f.id} className="hover:bg-slate-50/50">
                        <td className="p-4 font-bold text-slate-900">{client?.name || 'Cliente'}</td>
                        <td className="p-4 text-slate-700">{f.description}</td>
                        <td className="p-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${f.type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {f.type === 'income' ? 'Entrada / Fee' : 'Despesa Dedicada'}
                          </span>
                        </td>
                        <td className={`p-4 font-bold ${f.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {f.type === 'income' ? '+' : '-'} R$ {f.amount.toFixed(2)}
                        </td>
                        <td className="p-4 text-right">
                          <button onClick={() => handleDeleteDoc('finances', f.id)} className="text-slate-400 hover:text-rose-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredFinances.length === 0 && (
                    <tr><td colSpan="5" className="p-8 text-center text-slate-400 text-xs">Nenhuma movimentação cadastrada.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ACESSOS E LINKS DE ARQUIVOS */}
        {activeTab === 'links' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Central de Links & Pastas</h2>
                <p className="text-xs text-slate-500">Google Drive, Figma, Gerenciador de Anúncios de cada conta.</p>
              </div>
              <button onClick={() => setIsLinkModalOpen(true)} className="flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-bold px-3.5 py-2 rounded-lg">
                <Plus className="w-4 h-4" /> Novo Link
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {links.map(l => {
                const client = clients.find(c => c.id === l.clientId);
                return (
                  <div key={l.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
                    <div>
                      <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded">{client?.name || 'Cliente'}</span>
                      <h4 className="font-bold text-slate-900 mt-1">{l.title}</h4>
                      <a href={l.url} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 font-semibold flex items-center gap-1 mt-1 hover:underline">
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

      </main>

      {/* MODAL CLIENTE */}
      {isClientModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Adicionar Novo Cliente</h3>
            <form onSubmit={handleAddClient} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome da Marca / Cliente *</label>
                <input required type="text" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contato</label>
                  <input type="text" value={newClient.contact} onChange={e => setNewClient({...newClient, contact: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nicho</label>
                  <input type="text" value={newClient.niche} onChange={e => setNewClient({...newClient, niche: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fee Mensal (R$)</label>
                  <input type="number" value={newClient.fee} onChange={e => setNewClient({...newClient, fee: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Dia Vencimento</label>
                  <input type="number" value={newClient.dueDate} onChange={e => setNewClient({...newClient, dueDate: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tags (separadas por vírgula)</label>
                <input type="text" placeholder="Ex: social media, tráfego" value={newClient.tags} onChange={e => setNewClient({...newClient, tags: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div className="flex justify-end gap-2 mt-6 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsClientModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 font-semibold hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-5 py-2 text-sm bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow">Salvar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONTEÚDO */}
      {isContentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Adicionar Novo Post</h3>
            <form onSubmit={handleAddContent} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cliente *</label>
                <select required value={newContent.clientId} onChange={e => setNewContent({...newContent, clientId: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                  <option value="">Selecione um cliente</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Título do Post *</label>
                <input required type="text" value={newContent.title} onChange={e => setNewContent({...newContent, title: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Formato</label>
                  <select value={newContent.format} onChange={e => setNewContent({...newContent, format: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                    <option value="Carrossel">Carrossel</option>
                    <option value="Reels">Reels</option>
                    <option value="Estático">Estático</option>
                    <option value="Stories">Stories</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select value={newContent.status} onChange={e => setNewContent({...newContent, status: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                    {statusColumns.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Legenda / Copy</label>
                <textarea rows="3" value={newContent.copy} onChange={e => setNewContent({...newContent, copy: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Texto do post..."></textarea>
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsContentModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 font-semibold hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-5 py-2 text-sm bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow">Salvar Conteúdo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TRANSAÇÃO */}
      {isFinanceModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Nova Transação</h3>
            <form onSubmit={handleAddFinance} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cliente *</label>
                <select required value={newFinance.clientId} onChange={e => setNewFinance({...newFinance, clientId: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                  <option value="">Selecione um cliente</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição *</label>
                <input required type="text" placeholder="Ex: Honorários do mês ou Tráfego Pago" value={newFinance.description} onChange={e => setNewFinance({...newFinance, description: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo</label>
                  <select value={newFinance.type} onChange={e => setNewFinance({...newFinance, type: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                    <option value="income">Entrada / Receita</option>
                    <option value="expense">Despesa Dedicada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Valor (R$) *</label>
                  <input required type="number" value={newFinance.amount} onChange={e => setNewFinance({...newFinance, amount: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsFinanceModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 font-semibold hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-5 py-2 text-sm bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow">Salvar Transação</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL LINK */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Adicionar Link Útil</h3>
            <form onSubmit={handleAddLink} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cliente *</label>
                <select required value={newLink.clientId} onChange={e => setNewLink({...newLink, clientId: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                  <option value="">Selecione um cliente</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Título do Link *</label>
                <input required type="text" placeholder="Ex: Pasta Google Drive" value={newLink.title} onChange={e => setNewLink({...newLink, title: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">URL (Link completo) *</label>
                <input required type="url" placeholder="https://..." value={newLink.url} onChange={e => setNewLink({...newLink, url: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsLinkModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 font-semibold hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-5 py-2 text-sm bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow">Salvar Link</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL VER COPY */}
      {previewContent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button onClick={() => setPreviewContent(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 mb-1">{previewContent.title}</h3>
            <p className="text-xs text-slate-500 mb-4">{previewContent.format} • {previewContent.channel}</p>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm whitespace-pre-wrap font-sans text-slate-800 max-h-60 overflow-y-auto">
              {previewContent.copy || 'Nenhuma legenda/copy cadastrada.'}
            </div>

            <div className="flex justify-end mt-4">
              <button onClick={() => setPreviewContent(null)} className="px-4 py-2 text-sm bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
