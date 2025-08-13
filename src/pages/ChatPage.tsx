import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, FileText, Scale, Clock, User, Bot, AlertCircle } from 'lucide-react';
import { openRouterService } from '../services/openRouterService';
import { api } from '../services/api';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Olá! Sou sua assistente jurídica especializada em direito brasileiro. Como posso ajudá-lo hoje?',
      timestamp: new Date(),
      suggestions: [
        'Analisar um contrato',
        'Redigir uma petição',
        'Consultar jurisprudência',
        'Calcular prazos processuais'
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleQuickAction = (actionTitle: string) => {
    // Prefill prompts based on quick action selected
    const prompts: Record<string, string> = {
      'Analisar Documento': 'Analisar documento: descreva o tipo (ex.: contrato, petição) e os pontos que deseja verificar.',
      'Consultar Lei': 'Consultar lei: informe o tema (ex.: prescrição trabalhista, dano moral) e a dúvida específica.',
      'Calcular Prazos': 'Calcular prazos: descreva o ato processual e a data do evento para cálculo do prazo.',
    };
    const prompt = prompts[actionTitle] ?? actionTitle;
    setInputValue(prompt);
    // Focus input for immediate editing/sending
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    const currentInput = inputValue;
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setError(null);

    try {
      let aiResponseContent = '';

      // Se um agente estiver selecionado, enviar ao backend dos agentes
      const apiBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
      if (selectedAgent && (apiBase || true)) {
        // Usa cliente centralizado: injeta Authorization automaticamente se houver token
        const json = await api.post(`/api/agents/${selectedAgent}/act`, { message: currentInput });
        aiResponseContent = (json && json.reply) || 'Sem resposta do agente.';
      } else {
        // Fallback: OpenRouter direto como antes
        const openRouterMessages = [
          {
            role: 'system' as const,
            content: 'Você é uma assistente jurídica especializada em direito brasileiro. Forneça respostas precisas, baseadas na legislação e jurisprudência brasileira. Seja profissional, clara e objetiva.'
          },
          ...messages.slice(-5).map(msg => ({
            role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
            content: msg.content
          })),
          {
            role: 'user' as const,
            content: currentInput
          }
        ];
        aiResponseContent = await openRouterService.sendMessage(openRouterMessages);
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponseContent,
        timestamp: new Date(),
        suggestions: [
          'Gerar minuta de petição',
          'Buscar mais jurisprudência',
          'Calcular custos processuais',
          'Sugerir estratégia processual'
        ]
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      
      // Fallback para resposta simulada em caso de erro
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      
      if (errorMessage.includes('API Key')) {
        setError('⚠️ API Key do OpenRouter não configurada. Usando modo simulado.');
      } else {
        setError('❌ Erro na conexão com a IA. Usando modo simulado.');
      }

      // Resposta simulada como fallback
      const fallbackResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Entendi sua questão sobre "${currentInput}". Com base na legislação brasileira e jurisprudência recente, posso fornecer as seguintes orientações:\n\n1. **Análise Legal**: A questão apresentada envolve aspectos importantes do direito civil/trabalhista/tributário brasileiro.\n\n2. **Precedentes Relevantes**: Identifiquei precedentes do STJ e STF que podem ser aplicáveis ao seu caso.\n\n3. **Recomendações**: Sugiro uma abordagem estratégica considerando os riscos e benefícios.\n\nGostaria que eu elabore algum documento específico ou precisa de mais detalhes sobre algum aspecto?`,
        timestamp: new Date(),
        suggestions: [
          'Gerar minuta de petição',
          'Buscar mais jurisprudência',
          'Calcular custos processuais',
          'Sugerir estratégia processual'
        ]
      };
      
      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const quickActions = [
    {
      icon: FileText,
      title: 'Analisar Documento',
      description: 'Upload de contratos, petições e documentos para análise',
    },
    {
      icon: Scale,
      title: 'Consultar Lei',
      description: 'Busca rápida em códigos e legislação brasileira',
    },
    {
      icon: Clock,
      title: 'Calcular Prazos',
      description: 'Cálculo automático de prazos processuais',
    },
  ];

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Assistente Jurídica IA
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Especializada em Direito Brasileiro
                </p>
              </div>
            </div>
            {error && (
              <div className="flex items-center px-3 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4 mr-2" />
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-3xl ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                <div className="flex items-start space-x-3">
                  {message.type === 'ai' && (
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div className={`rounded-2xl px-4 py-3 ${
                    message.type === 'user'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                  }`}>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </div>
                    <div className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>

                  {message.type === 'user' && (
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Suggestions */}
                {message.suggestions && (
                  <div className="mt-3 ml-11 space-y-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      Sugestões:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 border border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bot className="w-5 h-5 text-emerald-500" />
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Assistente JuriAI</h1>
          </div>
          {/* Seletor de Agente */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600 dark:text-gray-300">Agente:</label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="text-sm p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Padrão (OpenRouter)</option>
              <option value="assistente-prazos">Assistente de Prazos</option>
              <option value="analista-documentos">Analista de Documentos</option>
              <option value="consultor-jurisprudencia">Consultor de Jurisprudência</option>
              <option value="assistente-casos">Assistente de Casos</option>
            </select>
          </div>
        </div>

        {/* Input */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Digite sua pergunta jurídica..."
                  className="w-full px-4 py-3 pr-12 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  disabled={isTyping}
                  ref={inputRef}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-6 overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Ações Rápidas
        </h2>
        
        <div className="space-y-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div
                key={index}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                onClick={() => handleQuickAction(action.title)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleQuickAction(action.title)}
              >
                <div className="flex items-start space-x-3">
                  <Icon className="w-5 h-5 text-emerald-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                      {action.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {action.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4">Exemplos de Consultas</h3>
          <div className="space-y-2">
            {[
              'Como calcular juros de mora?',
              'Qual o prazo para contestação?',
              'Diferença entre dolo e culpa?',
              'Como funciona a prescrição?',
            ].map((example, index) => (
              <button
                key={index}
                onClick={() => setInputValue(example)}
                className="w-full text-left p-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}