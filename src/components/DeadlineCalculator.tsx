import React, { useState } from 'react';
import { Calendar, Clock, X, Calculator, AlertTriangle, CheckCircle } from 'lucide-react';
import { openRouterService } from '../services/openRouterService';

interface DeadlineCalculatorProps {
  onClose: () => void;
  onCalculationComplete: (result: string) => void;
}

const deadlineTypes = [
  { id: 'contestacao', name: 'Contestação', days: 15, description: 'Prazo para contestar em processo civil' },
  { id: 'recurso_apelacao', name: 'Recurso de Apelação', days: 15, description: 'Prazo para interpor apelação' },
  { id: 'recurso_especial', name: 'Recurso Especial/Extraordinário', days: 15, description: 'Prazo para STJ/STF' },
  { id: 'embargos_declaracao', name: 'Embargos de Declaração', days: 5, description: 'Prazo para embargos declaratórios' },
  { id: 'defesa_trabalhista', name: 'Defesa Trabalhista', days: 20, description: 'Prazo para defesa na Justiça do Trabalho' },
  { id: 'recurso_trabalhista', name: 'Recurso Trabalhista', days: 8, description: 'Prazo para recurso ordinário trabalhista' },
  { id: 'impugnacao_execucao', name: 'Impugnação à Execução', days: 15, description: 'Prazo para impugnar execução' },
  { id: 'manifestacao_pericia', name: 'Manifestação sobre Perícia', days: 15, description: 'Prazo para se manifestar sobre laudo' },
  { id: 'alegacoes_finais', name: 'Alegações Finais', days: 15, description: 'Prazo para alegações finais' },
  { id: 'personalizado', name: 'Prazo Personalizado', days: 0, description: 'Definir prazo específico' },
];

export default function DeadlineCalculator({ onClose, onCalculationComplete }: DeadlineCalculatorProps) {
  const [selectedType, setSelectedType] = useState('');
  const [customDays, setCustomDays] = useState('');
  const [startDate, setStartDate] = useState('');
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6; // Domingo ou Sábado
  };

  const isHoliday = (date: Date): boolean => {
    // Lista básica de feriados nacionais fixos
    const holidays = [
      '01-01', // Ano Novo
      '04-21', // Tiradentes
      '09-07', // Independência
      '10-12', // Nossa Senhora Aparecida
      '11-02', // Finados
      '11-15', // Proclamação da República
      '12-25', // Natal
    ];
    
    const monthDay = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return holidays.includes(monthDay);
  };

  const addBusinessDays = (startDate: Date, days: number): Date => {
    let currentDate = new Date(startDate);
    let addedDays = 0;
    
    while (addedDays < days) {
      currentDate.setDate(currentDate.getDate() + 1);
      
      if (!isWeekend(currentDate) && !isHoliday(currentDate)) {
        addedDays++;
      }
    }
    
    return currentDate;
  };

  const calculateDeadline = async () => {
    if (!selectedType || !startDate) {
      setError('Selecione o tipo de prazo e a data inicial');
      return;
    }

    const selectedDeadline = deadlineTypes.find(d => d.id === selectedType);
    let daysToAdd = selectedDeadline?.days || 0;

    if (selectedType === 'personalizado') {
      if (!customDays || parseInt(customDays) <= 0) {
        setError('Digite um número válido de dias para o prazo personalizado');
        return;
      }
      daysToAdd = parseInt(customDays);
    }

    setCalculating(true);
    setError(null);

    try {
      const start = new Date(startDate);
      const deadline = addBusinessDays(start, daysToAdd);
      
      // Calcular dias corridos também
      const deadlineCalendar = new Date(start);
      deadlineCalendar.setDate(deadlineCalendar.getDate() + daysToAdd);

      const today = new Date();
      const daysUntilDeadline = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      const calculationResult = {
        type: selectedDeadline?.name || 'Prazo Personalizado',
        description: selectedDeadline?.description || 'Prazo definido pelo usuário',
        startDate: start.toLocaleDateString('pt-BR'),
        deadlineBusinessDays: deadline.toLocaleDateString('pt-BR'),
        deadlineCalendarDays: deadlineCalendar.toLocaleDateString('pt-BR'),
        businessDays: daysToAdd,
        daysUntilDeadline,
        isUrgent: daysUntilDeadline <= 3,
        isOverdue: daysUntilDeadline < 0,
      };

      setResult(calculationResult);

      // Gerar análise detalhada com IA
      const analysisPrompt = `Analise este cálculo de prazo processual:

Tipo: ${calculationResult.type}
Data inicial: ${calculationResult.startDate}
Prazo final (dias úteis): ${calculationResult.deadlineBusinessDays}
Dias restantes: ${calculationResult.daysUntilDeadline}

Forneça:
1. **Confirmação do Cálculo**: Valide se o cálculo está correto
2. **Orientações Legais**: Cite a base legal do prazo
3. **Recomendações**: Ações recomendadas considerando o prazo
4. **Alertas**: Avisos importantes sobre o prazo
5. **Próximos Passos**: O que fazer antes do vencimento

Base sua resposta na legislação processual brasileira.`;

      const analysis = await openRouterService.sendLegalQuery(analysisPrompt);
      
      const fullResult = `## ⏰ Cálculo de Prazo: ${calculationResult.type}

### 📊 Resultado do Cálculo
- **Data Inicial**: ${calculationResult.startDate}
- **Prazo Final (dias úteis)**: ${calculationResult.deadlineBusinessDays}
- **Prazo Final (dias corridos)**: ${calculationResult.deadlineCalendarDays}
- **Dias úteis**: ${calculationResult.businessDays}
- **Dias restantes**: ${calculationResult.daysUntilDeadline} dias

${calculationResult.isOverdue ? '🚨 **PRAZO VENCIDO!**' : 
  calculationResult.isUrgent ? '⚠️ **PRAZO URGENTE!**' : 
  '✅ **Prazo dentro do normal**'}

### 🎯 Análise Jurídica
${analysis}`;

      onCalculationComplete(fullResult);
    } catch (error) {
      console.error('Erro no cálculo:', error);
      setError(error instanceof Error ? error.message : 'Erro ao calcular prazo');
    } finally {
      setCalculating(false);
    }
  };

  const formatDate = (date: string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Clock className="w-6 h-6 text-emerald-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Calcular Prazos Processuais
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* Tipo de prazo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Prazo
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {deadlineTypes.map((deadline) => (
                <button
                  key={deadline.id}
                  onClick={() => setSelectedType(deadline.id)}
                  className={`p-3 text-left rounded-lg border transition-colors ${
                    selectedType === deadline.id
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {deadline.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {deadline.description}
                      </p>
                    </div>
                    {deadline.days > 0 && (
                      <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        {deadline.days} dias
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Prazo personalizado */}
          {selectedType === 'personalizado' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Número de Dias Úteis
              </label>
              <input
                type="number"
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value)}
                placeholder="Ex: 30"
                min="1"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          {/* Data inicial */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data Inicial (intimação/citação)
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Preview do resultado */}
          {result && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center mb-2">
                {result.isOverdue ? (
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                ) : result.isUrgent ? (
                  <Clock className="w-5 h-5 text-amber-500 mr-2" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                )}
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Resultado do Cálculo
                </h4>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-gray-600 dark:text-gray-400">
                  <strong>Prazo final:</strong> {result.deadlineBusinessDays}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <strong>Dias restantes:</strong> {result.daysUntilDeadline} dias
                </p>
                <p className={`font-medium ${
                  result.isOverdue ? 'text-red-600' :
                  result.isUrgent ? 'text-amber-600' : 'text-green-600'
                }`}>
                  {result.isOverdue ? 'PRAZO VENCIDO!' :
                   result.isUrgent ? 'PRAZO URGENTE!' : 'Prazo dentro do normal'}
                </p>
              </div>
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={calculateDeadline}
              disabled={calculating || !selectedType || !startDate}
              className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white rounded-lg transition-colors flex items-center justify-center"
            >
              {calculating ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Calculando...
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4 mr-2" />
                  Calcular
                </>
              )}
            </button>
          </div>

          {/* Observações */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <strong>Observações:</strong> O cálculo considera apenas dias úteis (excluindo sábados, domingos e feriados nacionais). 
              Sempre verifique feriados locais e disposições específicas do tribunal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
