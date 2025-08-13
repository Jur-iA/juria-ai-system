import React, { useState } from 'react';
import { Search, Book, X, Loader2, Scale, ExternalLink } from 'lucide-react';
import { openRouterService } from '../services/openRouterService';

interface LawConsultantProps {
  onClose: () => void;
  onConsultationComplete: (result: string) => void;
}

const lawCategories = [
  { id: 'civil', name: 'Direito Civil', icon: '⚖️' },
  { id: 'penal', name: 'Direito Penal', icon: '🏛️' },
  { id: 'trabalhista', name: 'Direito Trabalhista', icon: '👷' },
  { id: 'tributario', name: 'Direito Tributário', icon: '💰' },
  { id: 'administrativo', name: 'Direito Administrativo', icon: '🏢' },
  { id: 'constitucional', name: 'Direito Constitucional', icon: '📜' },
  { id: 'empresarial', name: 'Direito Empresarial', icon: '🏪' },
  { id: 'consumidor', name: 'Direito do Consumidor', icon: '🛒' },
];

const commonQueries = [
  'Prazo de prescrição para cobrança de dívidas',
  'Direitos do trabalhador em caso de demissão',
  'Como funciona a usucapião de imóveis',
  'Diferença entre dolo e culpa no direito penal',
  'Direitos básicos do consumidor',
  'Processo de abertura de empresa',
  'Direitos constitucionais fundamentais',
  'Cálculo de juros e correção monetária',
];

export default function LawConsultant({ onClose, onConsultationComplete }: LawConsultantProps) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Digite sua consulta jurídica');
      return;
    }

    setSearching(true);
    setError(null);

    try {
      const categoryContext = selectedCategory 
        ? `Área do direito: ${lawCategories.find(c => c.id === selectedCategory)?.name}\n\n`
        : '';

      const searchPrompt = `${categoryContext}Consulta jurídica: "${query}"

Por favor, forneça uma resposta completa incluindo:

1. **Legislação Aplicável**: Cite as leis, códigos e artigos relevantes
2. **Jurisprudência**: Mencione precedentes importantes (STF, STJ, tribunais)
3. **Interpretação Legal**: Explique como a lei se aplica ao caso
4. **Procedimentos**: Descreva os passos necessários, se aplicável
5. **Prazos**: Informe prazos legais relevantes
6. **Observações Importantes**: Alertas e considerações especiais

Base sua resposta exclusivamente na legislação brasileira vigente.`;

      const result = await openRouterService.sendLegalQuery(searchPrompt);
      
      onConsultationComplete(`## 📚 Consulta Legal: ${query}\n\n${result}`);
      onClose();
    } catch (error) {
      console.error('Erro na consulta:', error);
      setError(error instanceof Error ? error.message : 'Erro ao consultar legislação');
    } finally {
      setSearching(false);
    }
  };

  const handleQuickQuery = (quickQuery: string) => {
    setQuery(quickQuery);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Scale className="w-6 h-6 text-emerald-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Consultar Legislação
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
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Área do Direito (opcional)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {lawCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id === selectedCategory ? '' : category.id)}
                  className={`p-2 text-left rounded-lg border transition-colors ${
                    selectedCategory === category.id
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                      : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="text-sm">
                    {category.icon} {category.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Campo de busca */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sua consulta jurídica
            </label>
            <div className="relative">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: Como calcular juros de mora em contratos de compra e venda?"
                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                rows={3}
              />
              <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Consultas rápidas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Consultas Frequentes
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
              {commonQueries.map((quickQuery, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuery(quickQuery)}
                  className="text-left p-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  {quickQuery}
                </button>
              ))}
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSearch}
              disabled={searching || !query.trim()}
              className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white rounded-lg transition-colors flex items-center justify-center"
            >
              {searching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Consultando...
                </>
              ) : (
                <>
                  <Book className="w-4 h-4 mr-2" />
                  Consultar
                </>
              )}
            </button>
          </div>

          {/* Links úteis */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Links úteis:</p>
            <div className="flex flex-wrap gap-2">
              <a
                href="http://www.planalto.gov.br/ccivil_03/leis/leis_2001/l10406.htm"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs text-emerald-600 hover:text-emerald-700"
              >
                Código Civil <ExternalLink className="w-3 h-3 ml-1" />
              </a>
              <a
                href="https://www.stf.jus.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs text-emerald-600 hover:text-emerald-700"
              >
                STF <ExternalLink className="w-3 h-3 ml-1" />
              </a>
              <a
                href="https://www.stj.jus.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs text-emerald-600 hover:text-emerald-700"
              >
                STJ <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
