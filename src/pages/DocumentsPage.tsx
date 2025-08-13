import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Download,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Sparkles
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  category: 'petition' | 'contract' | 'motion' | 'brief' | 'other';
  size: string;
  lastModified: string;
  status: 'draft' | 'review' | 'approved' | 'sent';
  aiGenerated: boolean;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>(() => {
    const saved = localStorage.getItem('documentsData');
    return saved ? JSON.parse(saved) as Document[] : [
    {
      id: '1',
      name: 'Petição Inicial - Ação Trabalhista',
      type: 'PDF',
      category: 'petition',
      size: '245 KB',
      lastModified: '2024-01-15',
      status: 'approved',
      aiGenerated: true
    },
    {
      id: '2',
      name: 'Contrato de Prestação de Serviços',
      type: 'DOCX',
      category: 'contract',
      size: '180 KB',
      lastModified: '2024-01-14',
      status: 'review',
      aiGenerated: true
    },
    {
      id: '3',
      name: 'Manifestação sobre Contestação',
      type: 'PDF',
      category: 'motion',
      size: '320 KB',
      lastModified: '2024-01-13',
      status: 'draft',
      aiGenerated: false
    },
    {
      id: '4',
      name: 'Parecer Jurídico - Caso Silva',
      type: 'DOCX',
      category: 'brief',
      size: '420 KB',
      lastModified: '2024-01-12',
      status: 'sent',
      aiGenerated: true
    }
  ];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showGenerator, setShowGenerator] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [customPrompt, setCustomPrompt] = useState('');
  const [viewDoc, setViewDoc] = useState<Document | null>(null);
  const [editDoc, setEditDoc] = useState<Document | null>(null);

  // Persistência local
  React.useEffect(() => {
    localStorage.setItem('documentsData', JSON.stringify(documents));
    // Sincronizar "Documentos Gerados" no Dashboard
    try {
      const generated = documents.filter(d => d.aiGenerated).length;
      const saved = localStorage.getItem('dashboardStats');
      const current = saved ? JSON.parse(saved) as { activeCases: number; generatedDocs: number; upcomingDeadlines: number; monthlyRevenue: number } : {
        activeCases: 0,
        generatedDocs: 0,
        upcomingDeadlines: 0,
        monthlyRevenue: 0,
      };
      const next = { ...current, generatedDocs: generated };
      localStorage.setItem('dashboardStats', JSON.stringify(next));
    } catch {
      // ignore
    }
  }, [documents]);

  // Funções reais para documentos
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validação de tipo de arquivo
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      alert('❌ Tipo de arquivo não suportado. Use PDF, DOC ou DOCX.');
      return;
    }

    // Validação de tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('❌ Arquivo muito grande. Tamanho máximo: 10MB.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simular progresso de upload
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Simular delay de upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Adicionar documento à lista
      const newDocument: Document = {
        id: Date.now().toString(),
        name: file.name,
        type: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
        category: 'other',
        size: `${(file.size / 1024).toFixed(0)} KB`,
        lastModified: new Date().toISOString().split('T')[0],
        status: 'draft',
        aiGenerated: false
      };

      setDocuments(prev => [newDocument, ...prev]);
      setUploadProgress(100);
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        alert('✅ Arquivo enviado com sucesso!');
      }, 500);

    } catch (error) {
      clearInterval(progressInterval);
      setIsUploading(false);
      setUploadProgress(0);
      alert('❌ Erro ao enviar arquivo. Tente novamente.');
    }
  };

  const handleGenerateDocument = async (template: any, customPrompt: string = '') => {
    setIsGenerating(true);
    
    try {
      // Simular delay de geração
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newDocument: Document = {
        id: Date.now().toString(),
        name: `${template.name} - ${new Date().toLocaleDateString()}`,
        type: 'DOCX',
        category: template.category,
        size: `${Math.floor(Math.random() * 200 + 100)} KB`,
        lastModified: new Date().toISOString().split('T')[0],
        status: 'draft',
        aiGenerated: true
      };

      setDocuments(prev => [newDocument, ...prev]);
      setShowGenerator(false);
      alert('✅ Documento gerado com sucesso pela IA!');
      
    } catch (error) {
      alert('❌ Erro ao gerar documento. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewDocument = (doc: Document) => {
    setViewDoc(doc);
  };

  const handleEditDocument = (doc: Document) => {
    setEditDoc({ ...doc });
  };

  const handleDownloadDocument = (doc: Document) => {
    // Gera um conteúdo simples para download com a extensão do tipo original
    const content = `Documento: ${doc.name}\nCategoria: ${doc.category}\nTipo: ${doc.type}\nGerado por: ${doc.aiGenerated ? 'IA' : 'Upload'}\nData: ${new Date().toLocaleString()}`;
    const blob = new Blob([content], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.name.replace(/[^a-z0-9\- ]/gi, '')}.docx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleDeleteDocument = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;
    
    if (window.confirm(`Tem certeza que deseja excluir o documento "${doc.name}"?`)) {
      setDocuments(prev => prev.filter(d => d.id !== docId));
      alert('✅ Documento excluído com sucesso!');
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status: Document['status']) => {
    const statusConfig = {
      draft: { label: 'Rascunho', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' },
      review: { label: 'Em Revisão', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
      approved: { label: 'Aprovado', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
      sent: { label: 'Enviado', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' }
    };
    return statusConfig[status];
  };

  const getCategoryLabel = (category: Document['category']) => {
    const categoryLabels = {
      petition: 'Petição',
      contract: 'Contrato',
      motion: 'Manifestação',
      brief: 'Parecer',
      other: 'Outros'
    };
    return categoryLabels[category];
  };

  const handleEditSubmit = () => {
    if (!editDoc) return;
    if (!editDoc.name.trim()) {
      alert('Informe o nome do documento.');
      return;
    }
    setDocuments(prev => prev.map(d => d.id === editDoc.id ? { ...editDoc, lastModified: new Date().toISOString().split('T')[0] } : d));
    setEditDoc(null);
  };

  const documentTemplates = [
    {
      name: 'Petição Inicial',
      description: 'Modelo padrão para petições iniciais em ações cíveis',
      category: 'petition'
    },
    {
      name: 'Contestação',
      description: 'Modelo para contestação de ações judiciais',
      category: 'motion'
    },
    {
      name: 'Contrato de Trabalho',
      description: 'Contrato padrão para relações de trabalho',
      category: 'contract'
    },
    {
      name: 'Parecer Jurídico',
      description: 'Modelo para pareceres e consultas jurídicas',
      category: 'brief'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Documentos</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gerencie e gere documentos jurídicos automaticamente
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <label className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg flex items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? `Enviando... ${uploadProgress}%` : 'Upload'}
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
          </label>
          <button 
            onClick={() => setShowGenerator(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Gerar com IA
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:text-white"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
            >
              <option value="all">Todas as Categorias</option>
              <option value="petition">Petições</option>
              <option value="contract">Contratos</option>
              <option value="motion">Manifestações</option>
              <option value="brief">Pareceres</option>
              <option value="other">Outros</option>
            </select>
            <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg flex items-center transition-colors">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Documento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tamanho
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Modificado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredDocuments.map((doc) => {
                const statusConfig = getStatusBadge(doc.status);
                return (
                  <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {doc.name}
                            </div>
                            {doc.aiGenerated && (
                              <Sparkles className="w-4 h-4 text-emerald-500 ml-2" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {doc.type}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {getCategoryLabel(doc.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {doc.size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {doc.lastModified}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => handleViewDocument(doc)}
                          className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1 rounded transition-colors"
                          title="Visualizar documento"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditDocument(doc)}
                          className="text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 p-1 rounded transition-colors"
                          title="Editar documento"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDownloadDocument(doc)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded transition-colors"
                          title="Baixar documento"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors"
                          title="Excluir documento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Document Modal */}
      {viewDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Visualizar Documento</h2>
                <button onClick={() => setViewDoc(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">✕</button>
              </div>
            </div>
            <div className="p-6 space-y-3">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Nome</div>
                <div className="text-gray-900 dark:text-white font-medium">{viewDoc.name}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Tipo</div>
                  <div className="text-gray-900 dark:text-white">{viewDoc.type}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Categoria</div>
                  <div className="text-gray-900 dark:text-white">{getCategoryLabel(viewDoc.category)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Tamanho</div>
                  <div className="text-gray-900 dark:text-white">{viewDoc.size}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Modificado</div>
                  <div className="text-gray-900 dark:text-white">{viewDoc.lastModified}</div>
                </div>
              </div>
              <div className="pt-2">
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusBadge(viewDoc.status).color}`}>
                  {getStatusBadge(viewDoc.status).label}
                </span>
                {viewDoc.aiGenerated && <span className="ml-2 inline-flex items-center text-xs text-emerald-600 dark:text-emerald-300"><Sparkles className="w-3 h-3 mr-1"/>Gerado por IA</span>}
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button onClick={() => setViewDoc(null)} className="px-4 py-2 rounded border text-gray-700 dark:text-gray-300">Fechar</button>
                <button onClick={() => { setViewDoc(null); setEditDoc(viewDoc); }} className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-600 text-white">Editar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Document Modal */}
      {editDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Editar Documento</h2>
                <button onClick={() => setEditDoc(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">✕</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
                <input value={editDoc.name} onChange={(e) => setEditDoc({ ...(editDoc as Document), name: e.target.value })} className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
                  <select value={editDoc.category} onChange={(e) => setEditDoc({ ...(editDoc as Document), category: e.target.value as Document['category'] })} className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white">
                    <option value="petition">Petição</option>
                    <option value="contract">Contrato</option>
                    <option value="motion">Manifestação</option>
                    <option value="brief">Parecer</option>
                    <option value="other">Outros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select value={editDoc.status} onChange={(e) => setEditDoc({ ...(editDoc as Document), status: e.target.value as Document['status'] })} className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white">
                    <option value="draft">Rascunho</option>
                    <option value="review">Em Revisão</option>
                    <option value="approved">Aprovado</option>
                    <option value="sent">Enviado</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                  <input value={editDoc.type} onChange={(e) => setEditDoc({ ...(editDoc as Document), type: e.target.value })} className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tamanho</label>
                  <input value={editDoc.size} onChange={(e) => setEditDoc({ ...(editDoc as Document), size: e.target.value })} className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setEditDoc(null)} className="px-4 py-2 rounded border text-gray-700 dark:text-gray-300">Cancelar</button>
                <button onClick={handleEditSubmit} className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-600 text-white">Salvar Alterações</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Document Generator Modal */}
      {showGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Sparkles className="w-6 h-6 text-emerald-500 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Gerador de Documentos IA
                  </h2>
                </div>
                <button
                  onClick={() => setShowGenerator(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Selecione um modelo para gerar automaticamente com inteligência artificial:
              </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {documentTemplates.map((template, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {template.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {getCategoryLabel(template.category as Document['category'])}
                      </span>
                      <button 
                        onClick={() => handleGenerateDocument(template)}
                        disabled={isGenerating}
                        className="text-emerald-600 hover:text-emerald-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGenerating ? 'Gerando...' : 'Gerar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <div className="flex items-start">
                  <Sparkles className="w-5 h-5 text-emerald-500 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                      Geração Personalizada
                    </h4>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                      Descreva o documento que você precisa e nossa IA criará automaticamente baseado nas melhores práticas jurídicas brasileiras.
                    </p>
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Ex: Preciso de uma petição inicial para uma ação de cobrança no valor de R$ 10.000 contra a empresa XYZ por serviços prestados..."
                      className="w-full mt-3 p-3 border border-emerald-200 dark:border-emerald-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                      rows={3}
                    />
                    <button 
                      onClick={() => handleGenerateDocument({ name: 'Documento Personalizado', category: 'other' }, customPrompt)}
                      disabled={isGenerating || !customPrompt.trim()}
                      className="mt-3 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? 'Gerando...' : 'Gerar Documento Personalizado'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}