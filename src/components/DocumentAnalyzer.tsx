import React, { useState, useRef } from 'react';
import { Upload, FileText, X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { openRouterService } from '../services/openRouterService';

interface DocumentAnalyzerProps {
  onClose: () => void;
  onAnalysisComplete: (analysis: string) => void;
}

export default function DocumentAnalyzer({ onClose, onAnalysisComplete }: DocumentAnalyzerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    const validTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!validTypes.includes(selectedFile.type)) {
      setError('Tipo de arquivo não suportado. Use PDF, TXT ou DOC/DOCX.');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      setError('Arquivo muito grande. Máximo 10MB.');
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file);
    });
  };

  const analyzeDocument = async () => {
    if (!file) return;

    setAnalyzing(true);
    setError(null);

    try {
      let content = '';
      
      if (file.type === 'text/plain') {
        content = await readFileContent(file);
      } else {
        // Para PDFs e DOCs, simularemos a extração de texto
        content = `[Documento ${file.name} carregado - ${(file.size / 1024).toFixed(1)}KB]
        
Este é um exemplo de análise de documento. Em uma implementação completa, 
aqui seria extraído o texto real do PDF/DOC usando bibliotecas como pdf-parse ou mammoth.

Para demonstração, vou analisar as características gerais do documento baseado no nome e tipo.`;
      }

      const analysisPrompt = `Analise este documento jurídico e forneça:

1. **Tipo de Documento**: Identifique se é contrato, petição, parecer, etc.
2. **Pontos Principais**: Resuma os pontos mais importantes
3. **Riscos Jurídicos**: Identifique possíveis riscos ou problemas
4. **Recomendações**: Sugira ações ou melhorias
5. **Conformidade Legal**: Verifique se está de acordo com a legislação brasileira

Documento: ${file.name}
Conteúdo: ${content.substring(0, 3000)}...`;

      const analysis = await openRouterService.sendLegalQuery(analysisPrompt);
      
      onAnalysisComplete(`## 📄 Análise do Documento: ${file.name}\n\n${analysis}`);
      onClose();
    } catch (error) {
      console.error('Erro na análise:', error);
      setError(error instanceof Error ? error.message : 'Erro ao analisar documento');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Analisar Documento
          </h3>
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
              <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {!file ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Arraste um documento aqui ou
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              selecione um arquivo
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              PDF, TXT, DOC ou DOCX (máx. 10MB)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <FileText className="w-5 h-5 text-emerald-500 mr-3" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={analyzeDocument}
                disabled={analyzing}
                className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white rounded-lg transition-colors flex items-center justify-center"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Analisar
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
