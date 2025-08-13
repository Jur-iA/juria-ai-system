import React, { useState } from 'react';
import { FileText, Download, Copy, X, Loader2, Sparkles, CheckCircle } from 'lucide-react';
import { openRouterService } from '../services/openRouterService';

interface DocumentGeneratorProps {
  onClose: () => void;
  onDocumentGenerated: (document: any) => void;
}

const documentTemplates = [
  {
    id: 'peticao_inicial',
    name: 'Petição Inicial',
    description: 'Modelo padrão para petições iniciais em ações cíveis',
    category: 'Petição',
    fields: ['Autor', 'Réu', 'Objeto da ação', 'Fundamentos legais', 'Pedidos']
  },
  {
    id: 'contestacao',
    name: 'Contestação',
    description: 'Modelo para contestação de ações judiciais',
    category: 'Manifestação',
    fields: ['Contestante', 'Autor da ação', 'Defesas preliminares', 'Mérito', 'Pedidos']
  },
  {
    id: 'contrato_trabalho',
    name: 'Contrato de Trabalho',
    description: 'Contrato padrão para relações de trabalho',
    category: 'Contrato',
    fields: ['Empregador', 'Empregado', 'Função', 'Salário', 'Jornada', 'Benefícios']
  },
  {
    id: 'parecer_juridico',
    name: 'Parecer Jurídico',
    description: 'Modelo para pareceres e consultas jurídicas',
    category: 'Parecer',
    fields: ['Consulente', 'Questão jurídica', 'Análise legal', 'Conclusão', 'Recomendações']
  }
];

export default function DocumentGenerator({ onClose, onDocumentGenerated }: DocumentGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showCustom, setShowCustom] = useState(false);

  const generateDocument = async () => {
    if (!selectedTemplate && !customDescription.trim()) {
      setError('Selecione um modelo ou descreva o documento desejado');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      let prompt = '';
      
      if (selectedTemplate) {
        const template = documentTemplates.find(t => t.id === selectedTemplate);
        prompt = `Gere um documento jurídico completo do tipo "${template?.name}" com as seguintes características:

Tipo: ${template?.name}
Descrição: ${template?.description}
Categoria: ${template?.category}

O documento deve incluir:
- Cabeçalho profissional
- Estrutura formal adequada
- Linguagem jurídica apropriada
- Cláusulas e disposições padrão
- Fundamentação legal quando aplicável
- Formatação profissional

Base o documento na legislação brasileira vigente e melhores práticas jurídicas.`;
      } else {
        prompt = `Gere um documento jurídico profissional baseado na seguinte descrição:

"${customDescription}"

O documento deve incluir:
- Estrutura formal adequada ao tipo de documento
- Linguagem jurídica apropriada
- Fundamentação legal quando aplicável
- Cláusulas necessárias
- Formatação profissional
- Conformidade com a legislação brasileira

Certifique-se de que o documento seja completo e pronto para uso profissional.`;
      }

      const document = await openRouterService.sendLegalQuery(prompt);
      setGeneratedDocument(document);

      // Salvar documento gerado
      const documentData = {
        id: Date.now().toString(),
        name: selectedTemplate ? 
          documentTemplates.find(t => t.id === selectedTemplate)?.name : 
          'Documento Personalizado',
        content: document,
        type: selectedTemplate || 'personalizado',
        createdAt: new Date().toISOString(),
        size: new Blob([document]).size
      };

      onDocumentGenerated(documentData);
    } catch (error) {
      console.error('Erro na geração:', error);
      setError(error instanceof Error ? error.message : 'Erro ao gerar documento');
    } finally {
      setGenerating(false);
    }
  };

  const downloadDocument = () => {
    if (!generatedDocument) return;

    const template = documentTemplates.find(t => t.id === selectedTemplate);
    const fileName = `${template?.name || 'Documento'}_${new Date().toISOString().split('T')[0]}.txt`;
    
    const blob = new Blob([generatedDocument], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    if (!generatedDocument) return;
    
    try {
      await navigator.clipboard.writeText(generatedDocument);
      // Aqui você poderia adicionar uma notificação de sucesso
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Sparkles className="w-6 h-6 text-emerald-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Gerar Documento com IA
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {!generatedDocument ? (
            <div className="space-y-6">
              {/* Seleção de modelo */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Selecione um modelo para gerar automaticamente com inteligência artificial:
                  </h4>
                  <button
                    onClick={() => setShowCustom(!showCustom)}
                    className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                  >
                    {showCustom ? 'Ver Modelos' : 'Geração Personalizada'}
                  </button>
                </div>

                {!showCustom ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documentTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={`p-4 text-left rounded-lg border transition-colors ${
                          selectedTemplate === template.id
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium text-gray-900 dark:text-white">
                            {template.name}
                          </h5>
                          <span className="text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded">
                            {template.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {template.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                            Gerar
                          </button>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Sparkles className="w-5 h-5 text-emerald-500 mr-2" />
                      <h5 className="font-medium text-gray-900 dark:text-white">
                        Geração Personalizada
                      </h5>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Descreva o documento que você precisa e nossa IA criará automaticamente baseado nas
                      melhores práticas jurídicas brasileiras.
                    </p>
                    <textarea
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      placeholder="Ex: contrato de trabalho para desenvolvedor de software com cláusulas de confidencialidade e trabalho remoto"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                      rows={4}
                    />
                  </div>
                )}
              </div>

              {/* Botão de gerar */}
              <div className="flex justify-end">
                <button
                  onClick={generateDocument}
                  disabled={generating || (!selectedTemplate && !customDescription.trim())}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white rounded-lg transition-colors flex items-center"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Gerando Documento...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Gerar Documento Personalizado
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Documento gerado */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Documento Gerado com Sucesso
                  </h4>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors flex items-center"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copiar
                  </button>
                  <button
                    onClick={downloadDocument}
                    className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-mono">
                  {generatedDocument}
                </pre>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => {
                    setGeneratedDocument('');
                    setSelectedTemplate('');
                    setCustomDescription('');
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
                >
                  Gerar Novo Documento
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                >
                  Concluir
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
