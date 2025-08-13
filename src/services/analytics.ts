// Serviço de Analytics para capturar dados reais de visitantes e conversões

interface AnalyticsEvent {
  type: 'page_view' | 'click' | 'conversion' | 'demo_request' | 'whatsapp_click';
  page?: string;
  element?: string;
  value?: string;
  timestamp: number;
  sessionId: string;
  userAgent: string;
  referrer: string;
  ip?: string;
}

interface VisitorData {
  sessionId: string;
  firstVisit: number;
  lastVisit: number;
  pageViews: number;
  events: AnalyticsEvent[];
  referrer: string;
  userAgent: string;
}

class AnalyticsService {
  private sessionId: string;
  private events: AnalyticsEvent[] = [];
  private startTime: number;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.initializeSession();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeSession() {
    // Capturar dados da sessão
    const visitorData: VisitorData = {
      sessionId: this.sessionId,
      firstVisit: this.startTime,
      lastVisit: this.startTime,
      pageViews: 0,
      events: [],
      referrer: document.referrer || 'direct',
      userAgent: navigator.userAgent
    };

    // Salvar no localStorage para persistência
    const existingData = localStorage.getItem('juria_analytics');
    if (existingData) {
      const parsed = JSON.parse(existingData);
      parsed.sessions = parsed.sessions || [];
      parsed.sessions.push(visitorData);
      localStorage.setItem('juria_analytics', JSON.stringify(parsed));
    } else {
      localStorage.setItem('juria_analytics', JSON.stringify({
        sessions: [visitorData],
        totalVisits: 1,
        firstVisit: this.startTime
      }));
    }

    // Enviar dados para o backend (se disponível)
    this.sendToBackend('session_start', visitorData);
  }

  // Capturar visualização de página
  trackPageView(page: string) {
    const event: AnalyticsEvent = {
      type: 'page_view',
      page,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      referrer: document.referrer || 'direct'
    };

    this.events.push(event);
    this.updateLocalStorage();
    this.sendToBackend('page_view', event);

    console.log('📊 Analytics: Page view tracked', { page, sessionId: this.sessionId });
  }

  // Capturar clicks em elementos específicos
  trackClick(element: string, value?: string) {
    const event: AnalyticsEvent = {
      type: 'click',
      element,
      value,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      referrer: document.referrer || 'direct'
    };

    this.events.push(event);
    this.updateLocalStorage();
    this.sendToBackend('click', event);

    console.log('📊 Analytics: Click tracked', { element, value, sessionId: this.sessionId });
  }

  // Capturar clicks no WhatsApp
  trackWhatsAppClick(source: string = 'unknown') {
    const event: AnalyticsEvent = {
      type: 'whatsapp_click',
      element: 'whatsapp_button',
      value: source,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      referrer: document.referrer || 'direct'
    };

    this.events.push(event);
    this.updateLocalStorage();
    this.sendToBackend('whatsapp_click', event);

    console.log('📊 Analytics: WhatsApp click tracked', { source, sessionId: this.sessionId });
  }

  // Capturar solicitações de demo
  trackDemoRequest(source: string = 'unknown') {
    const event: AnalyticsEvent = {
      type: 'demo_request',
      element: 'demo_button',
      value: source,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      referrer: document.referrer || 'direct'
    };

    this.events.push(event);
    this.updateLocalStorage();
    this.sendToBackend('demo_request', event);

    console.log('📊 Analytics: Demo request tracked', { source, sessionId: this.sessionId });
  }

  // Capturar conversões (cadastros, vendas)
  trackConversion(type: string, value?: string) {
    const event: AnalyticsEvent = {
      type: 'conversion',
      element: type,
      value,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      referrer: document.referrer || 'direct'
    };

    this.events.push(event);
    this.updateLocalStorage();
    this.sendToBackend('conversion', event);

    console.log('📊 Analytics: Conversion tracked', { type, value, sessionId: this.sessionId });
  }

  // Atualizar dados no localStorage
  private updateLocalStorage() {
    const existingData = JSON.parse(localStorage.getItem('juria_analytics') || '{}');
    const currentSession = existingData.sessions?.find((s: VisitorData) => s.sessionId === this.sessionId);
    
    if (currentSession) {
      currentSession.events = this.events;
      currentSession.lastVisit = Date.now();
      currentSession.pageViews = this.events.filter(e => e.type === 'page_view').length;
    }

    localStorage.setItem('juria_analytics', JSON.stringify(existingData));
  }

  // Enviar dados para o backend
  private async sendToBackend(eventType: string, data: any) {
    try {
      // Tentar enviar para o backend se estiver disponível
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType,
          data,
          timestamp: Date.now()
        })
      });

      if (!response.ok) {
        console.warn('📊 Analytics: Backend not available, data saved locally');
      }
    } catch (error) {
      // Backend não disponível, dados ficam no localStorage
      console.warn('📊 Analytics: Backend not available, data saved locally');
    }
  }

  // Obter estatísticas da sessão atual
  getSessionStats() {
    const pageViews = this.events.filter(e => e.type === 'page_view').length;
    const clicks = this.events.filter(e => e.type === 'click').length;
    const whatsappClicks = this.events.filter(e => e.type === 'whatsapp_click').length;
    const demoRequests = this.events.filter(e => e.type === 'demo_request').length;
    const conversions = this.events.filter(e => e.type === 'conversion').length;
    const timeOnSite = Date.now() - this.startTime;

    return {
      sessionId: this.sessionId,
      pageViews,
      clicks,
      whatsappClicks,
      demoRequests,
      conversions,
      timeOnSite,
      events: this.events
    };
  }

  // Obter todas as estatísticas armazenadas
  static getAllStats() {
    const data = JSON.parse(localStorage.getItem('juria_analytics') || '{}');
    const sessions = data.sessions || [];
    
    const totalPageViews = sessions.reduce((sum: number, session: VisitorData) => 
      sum + session.events.filter(e => e.type === 'page_view').length, 0);
    
    const totalClicks = sessions.reduce((sum: number, session: VisitorData) => 
      sum + session.events.filter(e => e.type === 'click').length, 0);
    
    const totalWhatsAppClicks = sessions.reduce((sum: number, session: VisitorData) => 
      sum + session.events.filter(e => e.type === 'whatsapp_click').length, 0);
    
    const totalDemoRequests = sessions.reduce((sum: number, session: VisitorData) => 
      sum + session.events.filter(e => e.type === 'demo_request').length, 0);
    
    const totalConversions = sessions.reduce((sum: number, session: VisitorData) => 
      sum + session.events.filter(e => e.type === 'conversion').length, 0);

    const today = new Date().toDateString();
    const todaySessions = sessions.filter((session: VisitorData) => 
      new Date(session.firstVisit).toDateString() === today);

    return {
      totalSessions: sessions.length,
      todaySessions: todaySessions.length,
      totalPageViews,
      totalClicks,
      totalWhatsAppClicks,
      totalDemoRequests,
      totalConversions,
      conversionRate: totalPageViews > 0 ? ((totalConversions / totalPageViews) * 100).toFixed(2) : '0',
      sessions: sessions.slice(-10), // Últimas 10 sessões
      rawData: data
    };
  }

  // Limpar dados antigos (manter apenas últimos 30 dias)
  static cleanOldData() {
    const data = JSON.parse(localStorage.getItem('juria_analytics') || '{}');
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    if (data.sessions) {
      data.sessions = data.sessions.filter((session: VisitorData) => 
        session.firstVisit > thirtyDaysAgo);
      localStorage.setItem('juria_analytics', JSON.stringify(data));
    }
  }
}

// Instância global do analytics
export const analytics = new AnalyticsService();

// Hook para usar analytics em componentes React
export const useAnalytics = () => {
  return {
    trackPageView: (page: string) => analytics.trackPageView(page),
    trackClick: (element: string, value?: string) => analytics.trackClick(element, value),
    trackWhatsAppClick: (source?: string) => analytics.trackWhatsAppClick(source),
    trackDemoRequest: (source?: string) => analytics.trackDemoRequest(source),
    trackConversion: (type: string, value?: string) => analytics.trackConversion(type, value),
    getSessionStats: () => analytics.getSessionStats(),
    getAllStats: () => AnalyticsService.getAllStats()
  };
};

export default AnalyticsService;
