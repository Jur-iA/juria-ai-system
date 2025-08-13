import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  User,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface Case {
  id: string;
  title: string;
  client: string;
  type: string;
  status: 'active' | 'pending' | 'completed' | 'archived';
  priority: 'high' | 'medium' | 'low';
  deadline: string;
  value: string;
  description: string;
  documents: number;
}

export default function CasesPage() {
  const location = useLocation();
  const [cases, setCases] = useState<Case[]>(() => {
    const saved = localStorage.getItem('casesData');
    return saved ? JSON.parse(saved) as Case[] : [
    {
      id: '001',
      title: 'Ação Trabalhista - Horas Extras',
      client: 'Maria Silva',
      type: 'Trabalhista',
      status: 'active',
      priority: 'high',
      deadline: '2024-02-15',
      value: 'R$ 25.000,00',
      description: 'Ação para cobrança de horas extras não pagas durante período de 2 anos.',
      documents: 12
    },
    {
      id: '002',
      title: 'Divórcio Consensual',
      client: 'João Santos',
      type: 'Família',
      status: 'pending',
      priority: 'medium',
      deadline: '2024-02-20',
      value: 'R$ 8.000,00',
      description: 'Processo de divórcio consensual com partilha de bens.',
      documents: 8
    },
    {
      id: '003',
      title: 'Revisional de Financiamento',
      client: 'Carlos Oliveira',
      type: 'Bancário',
      status: 'completed',
      priority: 'low',
      deadline: '2024-01-30',
      value: 'R$ 15.000,00',
      description: 'Revisão de contrato de financiamento imobiliário.',
      documents: 15
    },
    {
      id: '004',
      title: 'Indenização por Danos Morais',
      client: 'Ana Costa',
      type: 'Cível',
      status: 'active',
      priority: 'medium',
      deadline: '2024-03-01',
      value: 'R$ 50.000,00',
      description: 'Ação indenizatória por danos morais decorrentes de negativação indevida.',
      documents: 6
    }
  ];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCase, setNewCase] = useState<Omit<Case, 'id' | 'documents'>>({
    title: '',
    client: '',
    type: '',
    status: 'active',
    priority: 'medium',
    deadline: '',
    value: '',
    description: '',
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCase, setEditCase] = useState<Case | null>(null);

  // Persistência local
  React.useEffect(() => {
    localStorage.setItem('casesData', JSON.stringify(cases));
  }, [cases]);

  // Atualiza cards do Dashboard (Casos Ativos e Receita Mensal) com base na lista atual
  const syncDashboardActiveCases = (list: Case[]) => {
    try {
      const saved = localStorage.getItem('dashboardStats');
      const current = saved ? JSON.parse(saved) as { activeCases: number; generatedDocs: number; upcomingDeadlines: number; monthlyRevenue: number } : {
        activeCases: 0,
        generatedDocs: 0,
        upcomingDeadlines: 0,
        monthlyRevenue: 0,
      };
      const activeCount = list.filter(c => c.status === 'active').length;
      const parseBRL = (v?: string) => {
        if (!v) return 0;
        // Remove símbolo e espaços, troca separadores BR por padrão
        const s = v.replace(/[^0-9.,]/g, '').replace(/\./g, '').replace(/,/g, '.');
        const num = parseFloat(s);
        return isNaN(num) ? 0 : num;
      };
      const monthlyRevenue = list.reduce((acc, c) => acc + parseBRL(c.value), 0);
      const next = { ...current, activeCases: activeCount, monthlyRevenue };
      localStorage.setItem('dashboardStats', JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  // Abrir automaticamente Visualizar/Editar quando vier do Dashboard
  useEffect(() => {
    const state = location.state as any | undefined;
    const params = new URLSearchParams(location.search);
    const viewId = state?.action === 'view' ? state.caseId : params.get('view');
    const editId = state?.action === 'edit' ? state.caseId : params.get('edit');
    if (viewId) {
      const c = cases.find(ca => ca.id === viewId);
      if (c) {
        setSelectedCase(c);
      }
    } else if (editId) {
      const c = cases.find(ca => ca.id === editId);
      if (c) {
        setEditCase({ ...c });
        setShowEditModal(true);
      }
    }
    // Não adicionar cases em deps para evitar reabrir quando a lista muda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  const filteredCases = cases.filter(case_ => {
    const matchesSearch = case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || case_.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Case['status']) => {
    const statusConfig = {
      active: { label: 'Ativo', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
      pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
      completed: { label: 'Concluído', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
      archived: { label: 'Arquivado', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' }
    };
    
    return statusConfig[status];
  };

  const getPriorityIcon = (priority: Case['priority']) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  const handleCreateSubmit = () => {
    if (!newCase.title.trim() || !newCase.client.trim()) {
      alert('Preencha pelo menos Título e Cliente.');
      return;
    }
    const id = String(Date.now()).slice(-6);
    const created: Case = {
      id,
      ...newCase,
      documents: 0,
    };
    const nextCases = [created, ...cases];
    setCases(nextCases);
    syncDashboardActiveCases(nextCases);
    // Atualizar "Casos Recentes" do Dashboard
    try {
      const raw = localStorage.getItem('dashboardRecentCases');
      const existing = raw ? JSON.parse(raw) as Array<{ id: string; title: string; status: string; deadline: string; priority: 'alta' | 'média' | 'baixa'; }> : [];
      const priorityMap: Record<Case['priority'], 'alta' | 'média' | 'baixa'> = {
        high: 'alta',
        medium: 'média',
        low: 'baixa',
      };
      const statusMap = (s: Case['status']): string => {
        if (s === 'completed') return 'Finalizado';
        if (s === 'pending') return 'Aguardando documentos';
        if (s === 'archived') return 'Arquivado';
        return 'Em andamento';
      };
      const recentItem = {
        id: created.id,
        title: created.title,
        status: statusMap(created.status),
        deadline: created.deadline,
        priority: priorityMap[created.priority],
      };
      const updated = [recentItem, ...existing.filter(rc => rc.id !== created.id)].slice(0, 3);
      localStorage.setItem('dashboardRecentCases', JSON.stringify(updated));
    } catch (_) {
      // noop — mantém criação mesmo se recente falhar
    }
    setShowCreateModal(false);
    setNewCase({ title: '', client: '', type: '', status: 'active', priority: 'medium', deadline: '', value: '', description: '' });
  };

  const handleDeleteCase = (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este caso?')) return;
    const nextCases = cases.filter(c => c.id !== id);
    setCases(nextCases);
    syncDashboardActiveCases(nextCases);
  };

  const openEditCase = (c: Case) => {
    setEditCase({ ...c });
    setShowEditModal(true);
  };

  const handleEditSubmit = () => {
    if (!editCase) return;
    if (!editCase.title.trim() || !editCase.client.trim()) {
      alert('Preencha pelo menos Título e Cliente.');
      return;
    }
    const nextCases = cases.map(c => (c.id === editCase.id ? { ...editCase } as Case : c));
    setCases(nextCases);
    syncDashboardActiveCases(nextCases);
    setShowEditModal(false);
    setEditCase(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Casos</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gerencie todos os seus casos jurídicos
          </p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="mt-4 sm:mt-0 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Novo Caso
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar casos por título ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:text-white"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativos</option>
              <option value="pending">Pendentes</option>
              <option value="completed">Concluídos</option>
              <option value="archived">Arquivados</option>
            </select>
            <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg flex items-center transition-colors">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCases.map((case_) => {
          const status = getStatusBadge(case_.status);
          return (
            <div key={case_.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">{case_.title}</h3>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <User className="w-4 h-4 mr-1" />
                      {case_.client}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getPriorityIcon(case_.priority)}
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${status.color}`}>{status.label}</span>
                  </div>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Tipo:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{case_.type}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Valor:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{case_.value}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Prazo:</span>
                    <div className="flex items-center text-gray-900 dark:text-white">
                      <Calendar className="w-4 h-4 mr-1" />
                      {case_.deadline}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Documentos:</span>
                    <div className="flex items-center text-gray-900 dark:text-white">
                      <FileText className="w-4 h-4 mr-1" />
                      {case_.documents}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{case_.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-2">
                    <button onClick={() => setSelectedCase(case_)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Visualizar">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => openEditCase(case_)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Editar">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteCase(case_.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Excluir">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">#{case_.id}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Case Details Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Detalhes do Caso
                </h2>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Título
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedCase.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cliente
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedCase.client}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descrição
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedCase.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tipo
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedCase.type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Valor
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedCase.value}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

  {/* Edit Case Modal */}
  {showEditModal && editCase && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Editar Caso</h2>
            <button onClick={() => { setShowEditModal(false); setEditCase(null); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">✕</button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
              <input value={editCase.title} onChange={(e) => setEditCase({ ...(editCase as Case), title: e.target.value })} className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cliente</label>
              <input value={editCase.client} onChange={(e) => setEditCase({ ...(editCase as Case), client: e.target.value })} className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
              <input value={editCase.type} onChange={(e) => setEditCase({ ...(editCase as Case), type: e.target.value })} className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor</label>
              <input value={editCase.value} onChange={(e) => setEditCase({ ...(editCase as Case), value: e.target.value })} className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select value={editCase.status} onChange={(e) => setEditCase({ ...(editCase as Case), status: e.target.value as Case['status'] })} className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white">
                <option value="active">Ativo</option>
                <option value="pending">Pendente</option>
                <option value="completed">Concluído</option>
                <option value="archived">Arquivado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prioridade</label>
              <select value={editCase.priority} onChange={(e) => setEditCase({ ...(editCase as Case), priority: e.target.value as Case['priority'] })} className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white">
                <option value="high">Alta</option>
                <option value="medium">Média</option>
                <option value="low">Baixa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prazo</label>
              <input type="date" value={editCase.deadline} onChange={(e) => setEditCase({ ...(editCase as Case), deadline: e.target.value })} className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
            <textarea rows={3} value={editCase.description} onChange={(e) => setEditCase({ ...(editCase as Case), description: e.target.value })} className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => { setShowEditModal(false); setEditCase(null); }} className="px-4 py-2 rounded border text-gray-700 dark:text-gray-300">Cancelar</button>
            <button onClick={handleEditSubmit} className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-600 text-white">Salvar Alterações</button>
          </div>
        </div>
      </div>
    </div>
  )}

  {/* Create Case Modal */}
  {showCreateModal && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Novo Caso</h2>
            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">✕</button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
              <input value={newCase.title} onChange={(e) => setNewCase({ ...newCase, title: e.target.value })} className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cliente</label>
              <input value={newCase.client} onChange={(e) => setNewCase({ ...newCase, client: e.target.value })} className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
              <input value={newCase.type} onChange={(e) => setNewCase({ ...newCase, type: e.target.value })} className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor</label>
              <input value={newCase.value} onChange={(e) => setNewCase({ ...newCase, value: e.target.value })} className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select value={newCase.status} onChange={(e) => setNewCase({ ...newCase, status: e.target.value as Case['status'] })} className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white">
                <option value="active">Ativo</option>
                <option value="pending">Pendente</option>
                <option value="completed">Concluído</option>
                <option value="archived">Arquivado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prioridade</label>
              <select value={newCase.priority} onChange={(e) => setNewCase({ ...newCase, priority: e.target.value as Case['priority'] })} className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white">
                <option value="high">Alta</option>
                <option value="medium">Média</option>
                <option value="low">Baixa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prazo</label>
              <input type="date" value={newCase.deadline} onChange={(e) => setNewCase({ ...newCase, deadline: e.target.value })} className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
            <textarea rows={3} value={newCase.description} onChange={(e) => setNewCase({ ...newCase, description: e.target.value })} className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded border text-gray-700 dark:text-gray-300">Cancelar</button>
            <button onClick={handleCreateSubmit} className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-600 text-white">Salvar Caso</button>
          </div>
        </div>
      </div>
    </div>
  )}
    </div>
  );
}