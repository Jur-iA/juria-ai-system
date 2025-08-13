import { useEffect, useState } from 'react';
import { 
  Scale, 
  FileText, 
  Calendar, 
  Clock,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  MessageSquare,
  ArrowRight,
  Sparkles,
  RotateCcw,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';

type CasePriority = 'alta' | 'média' | 'baixa';
interface RecentCase {
  id: string;
  title: string;
  status: string;
  deadline: string;
  priority: CasePriority;
}

interface DashboardStats {
  activeCases: number;
  generatedDocs: number;
  upcomingDeadlines: number;
  monthlyRevenue: number;
}

export default function Dashboard() {
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  // Estado dinâmico com localStorage
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(() => {
    const saved = localStorage.getItem('dashboardStats');
    return saved ? JSON.parse(saved) : {
      activeCases: 24,
      generatedDocs: 156,
      upcomingDeadlines: 8,
      monthlyRevenue: 45280
    };
  });

  const [recentCases, setRecentCases] = useState<RecentCase[]>(() => {
    const saved = localStorage.getItem('dashboardRecentCases');
    return saved ? JSON.parse(saved) as RecentCase[] : [
      {
        id: '001',
        title: 'Ação Trabalhista - Silva vs. Empresa ABC',
        status: 'Em andamento',
        deadline: '2024-02-15',
        priority: 'alta',
      },
      {
        id: '002',
        title: 'Divórcio Consensual - João e Maria',
        status: 'Aguardando documentos',
        deadline: '2024-02-20',
        priority: 'média',
      },
      {
        id: '003',
        title: 'Revisional de Financiamento',
        status: 'Finalizado',
        deadline: '2024-01-30',
        priority: 'baixa',
      },
    ];
  });

  const [isResetting, setIsResetting] = useState(false);

  // Sincronizar "Casos Ativos" com os casos reais salvos
  useEffect(() => {
    try {
      const raw = localStorage.getItem('casesData');
      if (!raw) return;
      const list = JSON.parse(raw) as Array<{ status?: string; value?: string }>; // usar forma flexível
      const active = Array.isArray(list) ? list.filter(c => c && c.status === 'active').length : 0;
      const sumValues = (val?: string) => {
        if (!val) return 0;
        const digits = val.replace(/[^0-9]/g, '');
        return digits ? parseInt(digits, 10) : 0;
      };
      const monthlyRevenue = Array.isArray(list) ? list.reduce((acc, c) => acc + sumValues(c.value), 0) : 0;
      setDashboardStats(prev => {
        const next = { ...prev, activeCases: active, monthlyRevenue };
        localStorage.setItem('dashboardStats', JSON.stringify(next));
        return next;
      });
    } catch {
      // ignore parsing errors
    }
  }, []);

  // Sincronizar "Documentos Gerados" (IA) com base nos documentos salvos
  useEffect(() => {
    try {
      const raw = localStorage.getItem('documentsData');
      if (!raw) return;
      const list = JSON.parse(raw) as Array<{ aiGenerated?: boolean }>; 
      const generated = Array.isArray(list) ? list.filter(d => d && d.aiGenerated).length : 0;
      setDashboardStats(prev => {
        const next = { ...prev, generatedDocs: generated };
        localStorage.setItem('dashboardStats', JSON.stringify(next));
        return next;
      });
    } catch {
      // ignore
    }
  }, []);

  // Sincronizar "Prazos Próximos" com base nos eventos do calendário
  useEffect(() => {
    try {
      const raw = localStorage.getItem('calendarEvents');
      if (!raw) return;
      const list = JSON.parse(raw) as Array<{ type?: string; date?: string }>; 
      const today = new Date();
      const toNum = (s?: string) => (s ? Number(s.replace(/-/g, '')) : 0);
      const todayNum = Number(`${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`);
      const upcoming = Array.isArray(list) ? list.filter(e => e && e.type === 'deadline' && toNum(e.date) >= todayNum).length : 0;
      setDashboardStats(prev => {
        const next = { ...prev, upcomingDeadlines: upcoming };
        localStorage.setItem('dashboardStats', JSON.stringify(next));
        return next;
      });
    } catch {
      // ignore
    }
  }, []);

  const stats = [
    {
      label: 'Casos Ativos',
      value: dashboardStats.activeCases.toString(),
      change: '+12%',
      icon: Scale,
      color: 'bg-blue-500',
    },
    {
      label: 'Documentos Gerados',
      value: dashboardStats.generatedDocs.toString(),
      change: '+28%',
      icon: FileText,
      color: 'bg-emerald-500',
    },
    {
      label: 'Prazos Próximos',
      value: dashboardStats.upcomingDeadlines.toString(),
      change: '-5%',
      icon: Clock,
      color: 'bg-orange-500',
    },
    {
      label: 'Receita Mensal',
      value: `R$ ${dashboardStats.monthlyRevenue.toLocaleString()}`,
      change: '+15%',
      icon: DollarSign,
      color: 'bg-green-500',
    },
  ];

  // Função para zerar estatísticas
  const handleResetStats = async () => {
    if (!window.confirm('Tem certeza que deseja zerar todas as estatísticas? Esta ação não pode ser desfeita.')) {
      return;
    }

    setIsResetting(true);
    
    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const resetStats = {
      activeCases: 0,
      generatedDocs: 0,
      upcomingDeadlines: 0,
      monthlyRevenue: 0
    };
    
    setDashboardStats(resetStats);
    localStorage.setItem('dashboardStats', JSON.stringify(resetStats));
    
    setIsResetting(false);

    // Notificação de sucesso
    addNotification({
      type: 'report',
      title: 'Estatísticas zeradas',
      message: 'Os indicadores do dashboard foram redefinidos com sucesso.',
      priority: 'low'
    });
  };

  // Funções para casos recentes
  const handleViewCase = (caseId: string) => {
    addNotification({
      type: 'case',
      title: 'Abrindo caso',
      message: `Visualização do caso ${caseId} iniciada.`,
      priority: 'low'
    });
    navigate(`/cases?view=${encodeURIComponent(caseId)}`, { state: { action: 'view', caseId } });
  };

  const handleEditCase = (caseId: string) => {
    addNotification({
      type: 'case',
      title: 'Edição de caso',
      message: `Edição do caso ${caseId} iniciada.`,
      priority: 'medium'
    });
    navigate(`/cases?edit=${encodeURIComponent(caseId)}`, { state: { action: 'edit', caseId } });
  };

  const handleDeleteCase = (caseId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este caso?')) {
      const updatedCases = recentCases.filter((c: RecentCase) => c.id !== caseId);
      setRecentCases(updatedCases);
      localStorage.setItem('dashboardRecentCases', JSON.stringify(updatedCases));

      addNotification({
        type: 'case',
        title: 'Caso excluído',
        message: `O caso ${caseId} foi removido dos recentes.`,
        priority: 'low'
      });
    }
  };

  // Funções para AI Insights
  const handleInsightAction = (insightTitle: string) => {
    const map = {
      'Análise de Jurisprudência': {
        type: 'report' as const,
        title: 'Análise de Jurisprudência',
        message: 'Encontrados 15 precedentes favoráveis para seu caso.',
        priority: 'medium' as const,
      },
      'Documentos Pendentes': {
        type: 'report' as const,
        title: 'Documentos Pendentes',
        message: '3 petições precisam ser revisadas antes do prazo.',
        priority: 'high' as const,
      },
      'Oportunidade de Negócio': {
        type: 'report' as const,
        title: 'Oportunidade de Negócio',
        message: 'Cliente com potencial para novos casos na área tributária.',
        priority: 'low' as const,
      },
    };
    const cfg = (map as any)[insightTitle];
    if (cfg) {
      addNotification(cfg);
      // Navegação contextual
      if (insightTitle === 'Análise de Jurisprudência') {
        navigate('/chat', { state: { preset: 'Analise a jurisprudência relacionada a equiparação salarial no caso trabalhista.' } });
      } else if (insightTitle === 'Documentos Pendentes') {
        navigate('/documents', { state: { filter: 'pendentes' } });
      } else if (insightTitle === 'Oportunidade de Negócio') {
        navigate('/cases', { state: { filter: 'potencial' } });
      }
    }
  };

  const aiInsights = [
    {
      title: 'Análise de Jurisprudência',
      description: 'Encontrei 15 precedentes favoráveis para seu caso trabalhista.',
      action: 'Ver Detalhes',
    },
    {
      title: 'Documentos Pendentes',
      description: '3 petições precisam ser revisadas antes do prazo.',
      action: 'Revisar Agora',
    },
    {
      title: 'Oportunidade de Negócio',
      description: 'Cliente com potencial para novos casos na área tributária.',
      action: 'Agendar Reunião',
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Visão geral dos seus casos e atividades jurídicas
          </p>
        </div>
        <button
          onClick={handleResetStats}
          disabled={isResetting}
          className="flex items-center px-3 py-1.5 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white rounded-md text-sm transition-colors"
        >
          <RotateCcw className={`w-3 h-3 mr-1.5 ${isResetting ? 'animate-spin' : ''}`} />
          {isResetting ? 'Zerando...' : 'Zerar Estatísticas'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className={`text-sm font-medium ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                  vs. mês anterior
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Cases */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Casos Recentes
              </h2>
              <NavLink
                to="/cases"
                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center"
              >
                Ver todos
                <ArrowRight className="w-4 h-4 ml-1" />
              </NavLink>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {recentCases.map((case_) => (
              <div key={case_.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                    {case_.title}
                  </h3>
                  <div className="flex items-center mt-1 space-x-4">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Prazo: {case_.deadline}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      case_.priority === 'alta'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                        : case_.priority === 'média'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                        : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    }`}>
                      {case_.priority}
                    </span>
                  </div>
                </div>
                <div className="ml-4 flex items-center space-x-2">
                  <button
                    onClick={() => handleViewCase(case_.id)}
                    className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    title="Visualizar caso"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditCase(case_.id)}
                    className="p-1 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded transition-colors"
                    title="Editar caso"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCase(case_.id)}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Excluir caso"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="ml-2">
                    {case_.status === 'Finalizado' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : case_.priority === 'alta' ? (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-orange-500" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Sparkles className="w-5 h-5 text-emerald-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Insights da IA
              </h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {aiInsights.map((insight, index) => (
              <div key={index} className="p-4 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-2">
                  {insight.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  {insight.description}
                </p>
                <button 
                  onClick={() => handleInsightAction(insight.title)}
                  className="text-emerald-600 hover:text-emerald-700 text-xs font-medium flex items-center hover:bg-emerald-50 dark:hover:bg-emerald-900/20 px-2 py-1 rounded transition-colors"
                >
                  {insight.action}
                  <ArrowRight className="w-3 h-3 ml-1" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <NavLink
          to="/chat"
          className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl p-6 text-white hover:scale-105 transition-transform"
        >
          <div className="flex items-center">
            <MessageSquare className="w-8 h-8 mr-4" />
            <div>
              <h3 className="font-semibold">Consultar IA</h3>
              <p className="text-sm opacity-90">Tire dúvidas jurídicas instantaneamente</p>
            </div>
          </div>
        </NavLink>

        <NavLink
          to="/documents"
          className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:scale-105 transition-transform"
        >
          <div className="flex items-center">
            <FileText className="w-8 h-8 mr-4 text-gray-600 dark:text-gray-400" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Gerar Documento</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Crie petições e contratos automaticamente</p>
            </div>
          </div>
        </NavLink>

        <NavLink
          to="/calendar"
          className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:scale-105 transition-transform"
        >
          <div className="flex items-center">
            <Calendar className="w-8 h-8 mr-4 text-gray-600 dark:text-gray-400" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Ver Prazos</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Gerencie seus compromissos processuais</p>
            </div>
          </div>
        </NavLink>
      </div>
    </div>
  );
}