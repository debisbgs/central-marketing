import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, onSnapshot, addDoc, doc, deleteDoc 
} from 'firebase/firestore';
import { 
  Users, DollarSign, Calendar, Link as LinkIcon, Plus, LayoutDashboard, 
  Trash2, ExternalLink
} from 'lucide-react';

// =========================================================
// PREENCHA AQUI COM AS CHAVES QUE VOCÊ COPIOU DO FIREBASE
// =========================================================
const firebaseConfig = {
  apiKey: "AIzaSyC7KvRTkXL7lvwYA9OodiUUytkyPG6iQoA",
  authDomain: "central-marketing-66369.firebaseapp.com",
  projectId: "central-marketing-66369",
  storageBucket: "central-marketing-66369.firebasestorage.app",
  messagingSenderId: "564775197294",
  appId: "1:564775197294:web:6a08516866345bcafc647f"
};

// Inicializa o Firebase e o Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedClient, setSelectedClient] = useState('all');

  // Estados dos Dados em Tempo Real
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

  // Escuta as alterações no Firebase em Tempo Real (Sincroniza Celular <-> PC)
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

  // Funções para Salvar no Firebase
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

  const handleDeleteDoc = async (coll, id) => {
    await deleteDoc(doc(db, coll, id));
  };

  // Cálculos Financeiros
  const filteredFinances = selectedClient === 'all' 
    ? finances 
    : finances.filter(f => f.clientId === selectedClient);

  const totalIncome = filteredFinances.filter(f => f.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = filteredFinances.filter(f => f.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const netProfit = totalIncome - totalExpense;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      {/* Cabeçalho */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg text-white">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 leading-none">Central do Cliente</h1>
                <p className="text-xs text-emerald-600 font-medium mt-0.5">● Conectado ao Firebase</p>
              </div>
            </div>

            {/* Filtro de Cliente */}
            <div className="flex items-center gap-3">
              <select 
                value={selectedClient} 
                onChange={(e) => setSelectedClient(e.target.value)}
                className="bg-slate-100 border border-slate-300 text-slate-700 text-sm rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="all">Todos os Clientes</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <button 
                onClick={() => setIsClientModalOpen(true)}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-3.5 py-2 rounded-lg transition"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Novo Cliente</span>
              </button>
            </div>
          </div>

          {/* Navegação por Abas */}
          <div className="flex gap-2 border-t border-slate-100 pt-2 pb-2 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'clients', label: 'Clientes', icon: Users, count: clients.length },
              { id: 'content', label: 'Planejamento', icon: Calendar, count: contents.length },
              { id: 'finance', label: 'Financeiro', icon: DollarSign },
              { id: 'links', label: 'Acessos & Links', icon: LinkIcon }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-medium transition whitespace-nowrap ${
                    isActive 
                      ? 'bg-indigo-50 text-indigo-600' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`text-xs px-1.5 py-0.2 rounded-full ${isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'}`}>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Faturamento Total</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Despesas Associadas</p>
                <p className="text-2xl font-bold text-rose-600 mt-1">R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Lucro Líquido Real</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">R$ {netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900 mb-4">Ações Rápidas</h2>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => setIsContentModalOpen(true)} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium px-4 py-2 rounded-lg text-sm transition">
                  <Plus className="w-4 h-4" /> Novo Conteúdo
                </button>
                <button onClick={() => setIsFinanceModalOpen(true)} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium px-4 py-2 rounded-lg text-sm transition">
                  <Plus className="w-4 h-4" /> Nova Transação
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CLIENTES */}
        {activeTab === 'clients' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map(c => (
              <div key={c.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-900 text-lg">{c.name}</h3>
                  <button onClick={() => handleDeleteDoc('clients', c.id)} className="text-slate-400 hover:text-rose-600 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-slate-500 mt-1">Contato: {c.contact || 'Não informado'}</p>
                <p className="text-sm text-slate-500">Nicho: {c.niche || 'Geral'}</p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-sm">
                  <span className="font-semibold text-emerald-600">R$ {c.fee}/mês</span>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">Vencimento: dia {c.dueDate}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CONTEÚDO */}
        {activeTab === 'content' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900">Planejamento de Posts</h2>
              <button onClick={() => setIsContentModalOpen(true)} className="flex items-center gap-1.5 bg-indigo-600 text-white text-sm px-3 py-1.5 rounded-lg">
                <Plus className="w-4 h-4" /> Criar Post
              </button>
            </div>
            <div className="space-y-3">
              {contents.map(cnt => {
                const client = clients.find(c => c.id === cnt.clientId);
                return (
                  <div key={cnt.id} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                    <div>
                      <span className="text-xs bg-indigo-100 text-indigo-700 font-medium px-2 py-0.5 rounded">{client ? client.name : 'Cliente'}</span>
                      <h4 className="font-semibold text-slate-900 mt-1">{cnt.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{cnt.format} • {cnt.channel} • {cnt.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs bg-amber-100 text-amber-800 font-medium px-2.5 py-1 rounded-full">{cnt.status}</span>
                      <button onClick={() => handleDeleteDoc('contents', cnt.id)} className="text-slate-400 hover:text-rose-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FINANCEIRO */}
        {activeTab === 'finance' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900">Lançamentos Financeiros</h2>
              <button onClick={() => setIsFinanceModalOpen(true)} className="flex items-center gap-1.5 bg-indigo-600 text-white text-sm px-3 py-1.5 rounded-lg">
                <Plus className="w-4 h-4" /> Nova Transação
              </button>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                    <th className="p-3">Descrição</th>
                    <th className="p-3">Tipo</th>
                    <th className="p-3">Valor</th>
                    <th className="p-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFinances.map(f => (
                    <tr key={f.id}>
                      <td className="p-3 font-medium text-slate-800">{f.description}</td>
                      <td className="p-3">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${f.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {f.type === 'income' ? 'Receita' : 'Despesa'}
                        </span>
                      </td>
                      <td className={`p-3 font-semibold ${f.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        R$ {f.amount.toFixed(2)}
                      </td>
                      <td className="p-3 text-right">
                        <button onClick={() => handleDeleteDoc('finances', f.id)} className="text-slate-400 hover:text-rose-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ACESSOS E LINKS */}
        {activeTab === 'links' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900">Central de Acessos</h2>
              <button onClick={() => setIsLinkModalOpen(true)} className="flex items-center gap-1.5 bg-indigo-600 text-white text-sm px-3 py-1.5 rounded-lg">
                <Plus className="w-4 h-4" /> Adicionar Link
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {links.map(l => (
                <div key={l.id} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-slate-900">{l.title}</h4>
                    <a href={l.url} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 flex items-center gap-1 mt-1 hover:underline">
                      Acessar link <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <button onClick={() => handleDeleteDoc('links', l.id)} className="text-slate-400 hover:text-rose-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* MODAL CLIENTE */}
      {isClientModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Adicionar Cliente</h3>
            <form onSubmit={handleAddClient} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Nome da Marca / Cliente *</label>
                <input required type="text" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Contato</label>
                  <input type="text" value={newClient.contact} onChange={e => setNewClient({...newClient, contact: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Nicho</label>
                  <input type="text" value={newClient.niche} onChange={e => setNewClient({...newClient, niche: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Fee Mensal (R$)</label>
                  <input type="number" value={newClient.fee} onChange={e => setNewClient({...newClient, fee: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Dia Vencimento</label>
                  <input type="number" value={newClient.dueDate} onChange={e => setNewClient({...newClient, dueDate: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsClientModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700">Salvar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONTEÚDO */}
      {isContentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Adicionar Conteúdo</h3>
            <form onSubmit={handleAddContent} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Cliente *</label>
                <select required value={newContent.clientId} onChange={e => setNewContent({...newContent, clientId: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                  <option value="">Selecione um cliente</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Título do Post *</label>
                <input required type="text" value={newContent.title} onChange={e => setNewContent({...newContent, title: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsContentModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700">Salvar Conteúdo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TRANSAÇÃO */}
      {isFinanceModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Nova Transação</h3>
            <form onSubmit={handleAddFinance} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Cliente *</label>
                <select required value={newFinance.clientId} onChange={e => setNewFinance({...newFinance, clientId: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                  <option value="">Selecione um cliente</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Descrição *</label>
                <input required type="text" value={newFinance.description} onChange={e => setNewFinance({...newFinance, description: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Tipo</label>
                  <select value={newFinance.type} onChange={e => setNewFinance({...newFinance, type: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                    <option value="income">Receita (Cliente pagou)</option>
                    <option value="expense">Despesa (Gasto no cliente)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Valor (R$) *</label>
                  <input required type="number" value={newFinance.amount} onChange={e => setNewFinance({...newFinance, amount: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsFinanceModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700">Salvar Transação</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL LINK */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Adicionar Link</h3>
            <form onSubmit={handleAddLink} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Cliente *</label>
                <select required value={newLink.clientId} onChange={e => setNewLink({...newLink, clientId: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                  <option value="">Selecione um cliente</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Título do Link *</label>
                <input required type="text" placeholder="Ex: Pasta Google Drive" value={newLink.title} onChange={e => setNewLink({...newLink, title: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">URL (Link completo) *</label>
                <input required type="url" placeholder="https://..." value={newLink.url} onChange={e => setNewLink({...newLink, url: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsLinkModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700">Salvar Link</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
