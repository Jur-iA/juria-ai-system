import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Interfaces para TypeScript
interface TopPage {
  page: string;
  views: number;
  percentage: number;
}

interface Sale {
  id: number;
  name: string;
  plan: string;
  value: number;
  date: string;
  status: string;
}

interface Activity {
  type: string;
  from: string;
  action: string;
  time: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  plan: string;
  status: string;
  joined: string;
}

interface AdminData {
  analytics: {
    visitorsToday: number;
    visitorsTotal: number;
    clicksWhatsApp: number;
    clicksDemo: number;
    conversionRate: number;
    topPages: TopPage[];
  };
  sales: {
    totalToday: number;
    totalMonth: number;
    totalYear: number;
    leadsActive: number;
    salesClosed: number;
    pendingPayments: number;
    recentSales: Sale[];
  };
  bot: {
    messagesReceived: number;
    messagesSent: number;
    comprovantesReceived: number;
    tokensGenerated: number;
    activeConversations: number;
    recentActivity: Activity[];
  };
  users: {
    totalUsers: number;
    activeUsers: number;
    newToday: number;
    pendingTokens: number;
    recentUsers: User[];
  };
}

// Dados iniciais zerados para produção (capturar dados reais)
const initialData: AdminData = {
  analytics: {
    visitorsToday: 0,
    visitorsTotal: 0,
    clicksWhatsApp: 0,
    clicksDemo: 0,
    conversionRate: 0,
    topPages: []
  },
  sales: {
    totalToday: 0,
    totalMonth: 0,
    totalYear: 0,
    leadsActive: 0,
    salesClosed: 0,
    pendingPayments: 0,
    recentSales: []
  },
  bot: {
    messagesReceived: 0,
    messagesSent: 0,
    comprovantesReceived: 0,
    tokensGenerated: 0,
    activeConversations: 0,
    recentActivity: []
  },
  users: {
    totalUsers: 0,
    activeUsers: 0,
    newToday: 0,
    pendingTokens: 0,
    recentUsers: []
  }
};

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [realTimeData, setRealTimeData] = useState(initialData);
  const [showManualSaleModal, setShowManualSaleModal] = useState(false);
  const [manualSaleForm, setManualSaleForm] = useState({
    name: '',
    phone: '',
    plan: 'Solo',
    value: 197,
    status: 'Pago'
  });
  const navigate = useNavigate();

  // Senha secreta (em produção, usar autenticação mais robusta)
  const ADMIN_PASSWORD = 'sheknah33#';

  useEffect(() => {
    // Carregar dados reais do bot WhatsApp
    loadBotData();
    
    // Atualizar dados em tempo real
    const interval = setInterval(() => {
      loadBotData(); // Recarregar dados do bot a cada 10 segundos
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('Senha incorreta!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    navigate('/');
  };

  // Função para zerar todos os dados
  const handleResetData = () => {
    if (window.confirm('⚠️ ATENÇÃO: Isso vai zerar TODOS os dados do painel (analytics, vendas, usuários, bot). Esta ação não pode ser desfeita. Tem certeza?')) {
      setRealTimeData(initialData);
      // Limpar localStorage também
      localStorage.removeItem('juria_analytics');
      localStorage.removeItem('juria_admin_data');
      alert('✅ Todos os dados foram zerados com sucesso!');
    }
  };

  // Função para registrar venda manual
  const handleManualSale = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newSale: Sale = {
        id: Date.now(),
        name: manualSaleForm.name,
        plan: manualSaleForm.plan,
        value: manualSaleForm.value,
        date: new Date().toISOString().split('T')[0],
        status: manualSaleForm.status
      };

      // Atualizar dados locais
      const updatedData = { ...realTimeData };
      updatedData.sales.recentSales.unshift(newSale);
      updatedData.sales.recentSales = updatedData.sales.recentSales.slice(0, 10); // Manter apenas 10 mais recentes
      
      // Atualizar totais
      if (manualSaleForm.status === 'Pago') {
        updatedData.sales.totalToday += manualSaleForm.value;
        updatedData.sales.totalMonth += manualSaleForm.value;
        updatedData.sales.totalYear += manualSaleForm.value;
        updatedData.sales.salesClosed++;
      } else {
        updatedData.sales.pendingPayments++;
      }

      setRealTimeData(updatedData);

      // Tentar enviar para o backend
      try {
        await fetch('/api/sales/manual', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSale)
        });
      } catch (error) {
        console.warn('Backend não disponível, dados salvos localmente');
      }

      // Resetar formulário e fechar modal
      setManualSaleForm({
        name: '',
        phone: '',
        plan: 'Solo',
        value: 197,
        status: 'Pago'
      });
      setShowManualSaleModal(false);
      
      alert('✅ Venda registrada com sucesso!');
    } catch (error) {
      console.error('Erro ao registrar venda:', error);
      alert('❌ Erro ao registrar venda. Tente novamente.');
    }
  };

  // Carregar dados reais do bot WhatsApp
  const loadBotData = async () => {
    try {
      const response = await fetch('/api/bot/stats');
      if (response.ok) {
        const { data } = await response.json();
        setRealTimeData(prev => ({
          ...prev,
          bot: {
            messagesReceived: data.messagesReceived,
            messagesSent: data.messagesSent,
            comprovantesReceived: data.comprovantesReceived,
            tokensGenerated: data.tokensGenerated,
            activeConversations: data.activeConversations,
            recentActivity: data.recentActivity
          }
        }));
      }
    } catch (error) {
      console.warn('Não foi possível carregar dados do bot:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white">🔐 Admin Panel</h1>
            <p className="text-gray-400 mt-2">Acesso restrito</p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Senha de Acesso
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Digite a senha..."
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">🚀 JurIA Admin Panel</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-300">Online</span>
            </div>
            <button
              onClick={handleResetData}
              className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded transition-colors"
              title="Zerar todos os dados do painel"
            >
              🗑️ Zerar Dados
            </button>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-white text-sm"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-gray-800 px-6 py-2 border-b border-gray-700">
        <div className="flex gap-6">
          {[
            { id: 'analytics', label: '📊 Analytics', icon: '📊' },
            { id: 'sales', label: '💰 Vendas', icon: '💰' },
            { id: 'bot', label: '🤖 Bot WhatsApp', icon: '🤖' },
            { id: 'users', label: '👥 Usuários', icon: '👥' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">📊 Analytics & Estatísticas</h2>
            
            {/* Cards de métricas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-2xl font-bold text-emerald-400">{realTimeData.analytics.visitorsToday}</div>
                <div className="text-sm text-gray-400">Visitantes Hoje</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">{realTimeData.analytics.clicksWhatsApp}</div>
                <div className="text-sm text-gray-400">Clicks WhatsApp</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-400">{realTimeData.analytics.clicksDemo}</div>
                <div className="text-sm text-gray-400">Clicks Demo</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-400">{realTimeData.analytics.conversionRate}%</div>
                <div className="text-sm text-gray-400">Taxa Conversão</div>
              </div>
            </div>

            {/* Páginas mais visitadas */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">📈 Páginas Mais Visitadas</h3>
              <div className="space-y-3">
                {realTimeData.analytics.topPages.map((page, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-300">{page.page}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{page.views}</span>
                      <span className="text-sm text-gray-400">({page.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">💰 Gestão de Vendas</h2>
              <button
                onClick={() => setShowManualSaleModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                ➕ Registrar Venda Manual
              </button>
            </div>
            
            {/* Cards de vendas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-400">R$ {realTimeData.sales.totalToday}</div>
                <div className="text-sm text-gray-400">Vendas Hoje</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-2xl font-bold text-emerald-400">R$ {realTimeData.sales.totalMonth}</div>
                <div className="text-sm text-gray-400">Vendas Mês</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">{realTimeData.sales.leadsActive}</div>
                <div className="text-sm text-gray-400">Leads Ativos</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-400">{realTimeData.sales.pendingPayments}</div>
                <div className="text-sm text-gray-400">Pagamentos Pendentes</div>
              </div>
            </div>

            {/* Vendas recentes */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">📋 Vendas Recentes</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 text-sm">
                      <th className="pb-2">Cliente</th>
                      <th className="pb-2">Plano</th>
                      <th className="pb-2">Valor</th>
                      <th className="pb-2">Data</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {realTimeData.sales.recentSales.map((sale) => (
                      <tr key={sale.id} className="border-t border-gray-700">
                        <td className="py-2 text-white">{sale.name}</td>
                        <td className="py-2 text-gray-300">{sale.plan}</td>
                        <td className="py-2 text-green-400">R$ {sale.value}</td>
                        <td className="py-2 text-gray-300">{sale.date}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            sale.status === 'Pago' 
                              ? 'bg-green-900 text-green-300' 
                              : 'bg-yellow-900 text-yellow-300'
                          }`}>
                            {sale.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Botão para adicionar venda manual */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">➕ Registrar Venda Manual</h3>
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md">
                Nova Venda WhatsApp
              </button>
            </div>
          </div>
        )}

        {activeTab === 'bot' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">🤖 Bot WhatsApp - Monitoramento</h2>
            
            {/* Cards do bot */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">{realTimeData.bot.messagesReceived}</div>
                <div className="text-sm text-gray-400">Msgs Recebidas</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-400">{realTimeData.bot.messagesSent}</div>
                <div className="text-sm text-gray-400">Msgs Enviadas</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-400">{realTimeData.bot.comprovantesReceived}</div>
                <div className="text-sm text-gray-400">Comprovantes</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-400">{realTimeData.bot.tokensGenerated}</div>
                <div className="text-sm text-gray-400">Tokens Gerados</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-2xl font-bold text-emerald-400">{realTimeData.bot.activeConversations}</div>
                <div className="text-sm text-gray-400">Conversas Ativas</div>
              </div>
            </div>

            {/* Atividade recente do bot */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">📱 Atividade Recente</h3>
              <div className="space-y-3">
                {realTimeData.bot.recentActivity.map((activity, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {activity.type === 'message' ? '💬' : 
                         activity.type === 'payment' ? '💰' : '🎫'}
                      </span>
                      <div>
                        <div className="text-white font-medium">{activity.from}</div>
                        <div className="text-sm text-gray-400">{activity.action}</div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-400">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">👥 Gestão de Usuários</h2>
            
            {/* Cards de usuários */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">{realTimeData.users.totalUsers}</div>
                <div className="text-sm text-gray-400">Total Usuários</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-400">{realTimeData.users.activeUsers}</div>
                <div className="text-sm text-gray-400">Usuários Ativos</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-400">{realTimeData.users.newToday}</div>
                <div className="text-sm text-gray-400">Novos Hoje</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-400">{realTimeData.users.pendingTokens}</div>
                <div className="text-sm text-gray-400">Tokens Pendentes</div>
              </div>
            </div>

            {/* Lista de usuários */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">📋 Usuários Recentes</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 text-sm">
                      <th className="pb-2">Nome</th>
                      <th className="pb-2">Email</th>
                      <th className="pb-2">Plano</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2">Cadastro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {realTimeData.users.recentUsers.map((user) => (
                      <tr key={user.id} className="border-t border-gray-700">
                        <td className="py-2 text-white">{user.name}</td>
                        <td className="py-2 text-gray-300">{user.email}</td>
                        <td className="py-2 text-gray-300">{user.plan}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.status === 'Ativo' 
                              ? 'bg-green-900 text-green-300' 
                              : 'bg-yellow-900 text-yellow-300'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-2 text-gray-300">{user.joined}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Venda Manual */}
      {showManualSaleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">➕ Registrar Venda Manual</h3>
            <form onSubmit={handleManualSale}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Nome do Cliente *
                  </label>
                  <input
                    type="text"
                    value={manualSaleForm.name}
                    onChange={(e) => setManualSaleForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Dr. João Silva"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Telefone (opcional)
                  </label>
                  <input
                    type="tel"
                    value={manualSaleForm.phone}
                    onChange={(e) => setManualSaleForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="(62) 99999-9999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Plano *
                  </label>
                  <select
                    value={manualSaleForm.plan}
                    onChange={(e) => {
                      const plan = e.target.value;
                      const value = plan === 'Solo' ? 197 : 147;
                      setManualSaleForm(prev => ({ ...prev, plan, value }));
                    }}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="Solo">Solo - R$ 197/mês</option>
                    <option value="Escritório">Escritório - R$ 147/usuário/mês</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Valor (R$) *
                  </label>
                  <input
                    type="number"
                    value={manualSaleForm.value}
                    onChange={(e) => setManualSaleForm(prev => ({ ...prev, value: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Status *
                  </label>
                  <select
                    value={manualSaleForm.status}
                    onChange={(e) => setManualSaleForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="Pago">✅ Pago</option>
                    <option value="Pendente">⏳ Pendente</option>
                    <option value="Cancelado">❌ Cancelado</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowManualSaleModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors"
                >
                  Registrar Venda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
