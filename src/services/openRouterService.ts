interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class OpenRouterService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions';

  constructor() {
    // A chave da API deve ser definida nas variáveis de ambiente
    this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('VITE_OPENROUTER_API_KEY não encontrada nas variáveis de ambiente');
    }
  }

  async sendMessage(messages: OpenRouterMessage[], model: string = 'openai/gpt-3.5-turbo'): Promise<string> {
    if (!this.apiKey) {
      throw new Error('API Key do OpenRouter não configurada. Configure VITE_OPENROUTER_API_KEY no arquivo .env');
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          // Headers recomendados pelo OpenRouter
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
          'X-Title': 'JuriAI',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erro na API OpenRouter: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data: OpenRouterResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('Resposta inválida da API OpenRouter');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('Erro ao chamar OpenRouter API:', error);
      throw error;
    }
  }

  async sendLegalQuery(userMessage: string, context?: string): Promise<string> {
    const systemMessage: OpenRouterMessage = {
      role: 'system',
      content: `Você é uma assistente jurídica especializada em direito brasileiro. 
      Você deve fornecer respostas precisas, baseadas na legislação brasileira atual e jurisprudência relevante.
      Sempre cite as fontes legais quando aplicável (leis, códigos, súmulas, etc.).
      Mantenha um tom profissional mas acessível.
      ${context ? `Contexto adicional: ${context}` : ''}`
    };

    const messages: OpenRouterMessage[] = [
      systemMessage,
      {
        role: 'user',
        content: userMessage
      }
    ];

    return await this.sendMessage(messages);
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

export const openRouterService = new OpenRouterService();
export type { OpenRouterMessage };
