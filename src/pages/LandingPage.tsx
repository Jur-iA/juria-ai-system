import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAnalytics } from '../services/analytics';

// Número fornecido: DDD 62 99937353 -> formato wa.me exige país + DDD + número, sem sinais
// Brasil = 55, então: 55 62 99937353  => 556299937353
const WHATSAPP_LINK = 'https://wa.me/556299937353?text=Oi%2C%20quero%20ver%20uma%20demo%20do%20JurIA%20%F0%9F%91%8B';

export default function LandingPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const [showExpired, setShowExpired] = useState<boolean>(() => params.get('expired') === '1');
  // Estado para rotacionar depoimentos (1 por vez)
  const [active, setActive] = useState<number>(0);
  const { trackPageView, trackWhatsAppClick, trackDemoRequest, trackClick } = useAnalytics();
  const WAGreen = '#DCF8C6';
  const WABeige = '#ECE5DD';
  const BlueTick = '#34B7F1';
  // Slides (depoimentos PT-BR)
  const slides = [
    {
      id: 'maria',
      name: 'Dra. Maria Silva',
      role: 'Advogada Criminalista',
      city: 'São Paulo, SP',
      header: '#128C7E',
      meta: 'online agora',
      msgs: [
        { from:'lawyer', text:'JurIA, preciso de um modelo de recurso para revisão criminal com base em precedente do STJ.', time:'14:32' },
        { from:'us', text:'Claro! Vou preparar um modelo com jurisprudência recente do STJ e referências do TJSP onde couber.', time:'14:33', status:'read' },
        { from:'us', text:'Incluo dosimetria, tese subsidiária e pedidos alternativos. Quer manter sigilo de partes?', time:'14:33', status:'read' },
        { from:'lawyer', text:'Sim, por favor. Indique custas estimadas entre R$ 8.000 e R$ 15.000.', time:'14:34' },
        { from:'us', text:'Feito. Campos editáveis prontos e ementa do STJ anexada.', time:'14:35', status:'read' },
        { from:'lawyer', text:'Excelente. Lança o prazo no calendário?', time:'14:36' },
        { from:'us', text:'Lancei para 10/09 às 18h e ativei alerta no sininho.', time:'14:36', status:'read' },
      ]
    },
    {
      id: 'carlos',
      name: 'Dr. Carlos Mendes',
      role: 'Advogado Trabalhista',
      city: 'Rio de Janeiro, RJ',
      header: '#075E54',
      meta: 'online agora',
      msgs: [
        { from:'lawyer', text:'Inicial de horas extras para bancário com base na Súmula 338 do TST. Consegue?', time:'09:02' },
        { from:'us', text:'Sim. Trago planilha de apuração, reflexos e precedentes do TRT‑1.', time:'09:03', status:'read' },
        { from:'lawyer', text:'Inclua valor de causa em R$ 12.000 e pedido subsidiário.', time:'09:04' },
        { from:'us', text:'Incluído. Protocolo assistido e prazo lançado no calendário.', time:'09:05', status:'read' },
        { from:'lawyer', text:'Ótimo, obrigado!', time:'09:06' },
      ]
    },
    {
      id: 'ana',
      name: 'Dra. Ana Costa',
      role: 'Advogada de Família',
      city: 'Belo Horizonte, MG',
      header: '#128C7E',
      meta: 'online agora',
      msgs: [
        { from:'lawyer', text:'Minuta de guarda compartilhada (TJMG) com regime de convivência e pensão.', time:'17:10' },
        { from:'us', text:'Modelo com férias, feriados, reajuste IPCA‑E e precedentes do TJMG.', time:'17:11', status:'read' },
        { from:'lawyer', text:'Acrescente mediação prévia e multa por descumprimento.', time:'17:11' },
        { from:'us', text:'Adicionado. Orçamento estimado entre R$ 8.000 e R$ 15.000.', time:'17:12', status:'sent' },
        { from:'lawyer', text:'Perfeito.', time:'17:13' },
      ]
    },
    {
      id: 'pedro',
      name: 'Dr. Pedro Almeida',
      role: 'Advogado Empresarial',
      city: 'São Paulo, SP',
      header: '#128C7E',
      meta: 'online agora',
      msgs: [
        { from:'lawyer', text:'Visão mensal de prazos, LGPD e alertas por unidade/responsável?', time:'11:26' },
        { from:'us', text:'Calendário com estatísticas, checklist, modelos de DPA e exportação CSV.', time:'11:27', status:'read' },
        { from:'lawyer', text:'Ative segmentação por equipe.', time:'11:28' },
        { from:'us', text:'Segmentação ativada, com filtros por caso e usuário.', time:'11:28', status:'read' },
      ]
    },
    {
      id: 'luana',
      name: 'Dra. Luana Freitas',
      role: 'Advogada do Consumidor',
      city: 'Rio de Janeiro, RJ',
      header: '#075E54',
      meta: 'online agora',
      msgs: [
        { from:'lawyer', text:'Anexar documentos por caso e gerar rascunho de acordo com base no CDC.', time:'08:40' },
        { from:'us', text:'Organização por status e geração automática de minuta com danos morais.', time:'08:41', status:'read' },
        { from:'lawyer', text:'Show!', time:'08:42' },
      ]
    },
    {
      id: 'henrique',
      name: 'Dr. Henrique Braga',
      role: 'Advogado Criminal',
      city: 'São Paulo, SP',
      header: '#128C7E',
      meta: 'online agora',
      msgs: [
        { from:'lawyer', text:'Integra e‑mail para captar intimações e separar o que é prazo?', time:'19:03' },
        { from:'us', text:'Capturo, classifico e destaco no sininho. Lançamento automático no calendário.', time:'19:03', status:'delivered' },
        { from:'lawyer', text:'Perfeito.', time:'19:04' },
      ]
    },
    {
      id: 'sofia',
      name: 'Dra. Sofia Ramos',
      role: 'Advogada Previdenciária',
      city: 'Belo Horizonte, MG',
      header: '#075E54',
      meta: 'online agora',
      msgs: [
        { from:'lawyer', text:'Revisão da vida toda com cálculo a partir do CNIS. Você faz?', time:'13:20' },
        { from:'us', text:'Faço cálculos, checkpoints e modelo de petição com precedentes.', time:'13:21', status:'read' },
        { from:'lawyer', text:'Obrigado!', time:'13:22' },
      ]
    },
  ];
  // Clean the expired param from URL after mount to avoid re-triggers
  useEffect(() => {
    if (params.get('expired') === '1' && typeof window !== 'undefined') {
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, '', cleanUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // auto-rotate depoimentos a cada 4s
  useEffect(() => {
    // Tracking de page view
    trackPageView('Landing Page');
    
    const timer = setInterval(() => {
      setActive(prev => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length, trackPageView]);
  return (
    <div className="text-gray-900 dark:text-gray-100">
      {showExpired && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-100 text-sm">
          <div className="max-w-6xl mx-auto px-6 py-2 flex items-center justify-between gap-3">
            <span>Sua sessão de demonstração expirou. Quer falar com nosso time?</span>
            <div className="flex items-center gap-2">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
              >
                Falar no WhatsApp
              </a>
              <button onClick={() => setShowExpired(false)} className="underline">Fechar</button>
            </div>
          </div>
        </div>
      )}
      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              JurIA: seu assistente jurídico para prazos, documentos e notificações
            </h1>
            <p className="mt-4 text-gray-300 text-lg">
              Centralize avisos de e‑mail e prazos, gere minutas com IA e tenha visão clara dos seus casos.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-md bg-emerald-500 hover:bg-emerald-600 px-5 py-3 font-semibold text-white"
              >
                Falar no WhatsApp
              </a>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 px-5 py-3 font-semibold"
              >
                Agendar demo de 10 min
              </Link>
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 ring-1 ring-emerald-500/40 hover:ring-2 hover:ring-emerald-500/70 transition-all">
            <ul className="space-y-3 text-sm">
              <li>• Sininho de notificações: e‑mails e prazos em tempo real</li>
              <li>• Calendário inteligente com estatísticas</li>
              <li>• Geração de documentos com IA (minutas, petições)</li>
              <li>• Dashboard com próximos passos e casos recentes</li>
            </ul>
            <div className="mt-4 text-xs text-gray-300">
              Em uso por advogados solo e pequenos escritórios
            </div>
          </div>
        </div>
      </section>

      {/* Problema -> Solução */}
      <section className="py-14 px-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Menos burocracia, mais tempo para advogar</h2>
            <p className="mt-3 text-gray-600 dark:text-gray-300">
              Perder tempo com e‑mails, prazos e arquivos é coisa do passado. O JurIA centraliza avisos, agenda prazos
              automaticamente e ajuda a gerar minutas em minutos.
            </p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 ring-1 ring-emerald-500/40 hover:ring-2 hover:ring-emerald-500/70 shadow-[0_0_80px_rgba(16,185,129,0.18),0_0_180px_rgba(16,185,129,0.12),0_0_90px_rgba(255,255,255,0.10)] transition-all">
            <ul className="space-y-2 text-sm list-disc pl-5">
              <li>Notificações em tempo real (e‑mails, prazos, atualizações de casos)</li>
              <li>IA no chat para pesquisas rápidas e minutas</li>
              <li>Calendário de prazos com estatísticas e visão mensal</li>
              <li>Documentos organizados por caso e status</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Prova social */}
      <section className="py-14 px-6">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-xl font-semibold">Resultados que importam</h3>
          <div className="mt-4 grid md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5 bg-white dark:bg-gray-800 ring-1 ring-emerald-500/40 hover:ring-2 hover:ring-emerald-500/70 shadow-[0_0_80px_rgba(16,185,129,0.18),0_0_180px_rgba(16,185,129,0.12),0_0_90px_rgba(255,255,255,0.10)] transition-all">
              <div className="text-3xl font-extrabold text-emerald-500">-50%</div>
              <div className="text-sm mt-1 text-gray-600 dark:text-gray-300">tempo em tarefas operacionais</div>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5 bg-white dark:bg-gray-800 shadow-[0_0_80px_rgba(16,185,129,0.18),0_0_180px_rgba(16,185,129,0.12),0_0_90px_rgba(255,255,255,0.10)] transition-shadow hover:shadow-[0_0_0_2px_rgba(16,185,129,0.35)]">
              <div className="text-3xl font-extrabold text-emerald-500">+Agilidade</div>
              <div className="text-sm mt-1 text-gray-600 dark:text-gray-300">minutas com IA em minutos</div>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5 bg-white dark:bg-gray-800 shadow-[0_0_80px_rgba(16,185,129,0.18),0_0_180px_rgba(16,185,129,0.12),0_0_90px_rgba(255,255,255,0.10)] transition-shadow hover:shadow-[0_0_0_2px_rgba(16,185,129,0.35)]">
              <div className="text-3xl font-extrabold text-emerald-500">0</div>
              <div className="text-sm mt-1 text-gray-600 dark:text-gray-300">prazos perdidos (com alertas)</div>
            </div>
          </div>
        </div>
      </section>

      {/* Depoimentos (iPhone rotativo, 1 por vez) */}
      <section className="py-12 px-6 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 text-center">
            <h3 className="text-lg font-semibold">O que os(as) advogados(as) estão dizendo</h3>
            <div className="mt-3 flex items-center justify-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`h-2 w-2 rounded-full transition-all ${active===i?'bg-emerald-500 w-4':'bg-gray-400 hover:bg-gray-500'}`}
                  aria-label={`Ir para depoimento ${i+1}`}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-center relative" style={{minHeight: 560}}>
            {slides.map((slide, i) => (
              <div key={slide.id} className={`transition-all duration-500 ${i===active?'opacity-100 translate-x-0':'opacity-0 -translate-x-6 pointer-events-none'} absolute`} style={{width: 260}}>
                <div className="flex flex-col items-center">
                  <div id={`chat-${slide.id}`} className="group relative w-[260px] transition-transform duration-300 will-change-transform">
                    <div className="relative mx-auto rounded-[42px] bg-black p-2 shadow-[0_0_100px_rgba(16,185,129,0.30),0_0_240px_rgba(16,185,129,0.22),0_0_120px_rgba(255,255,255,0.12)] ring-1 ring-black/30">
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-[20px]" />
                      <div className="absolute -left-0.5 top-24 w-0.5 h-12 bg-black/70 rounded-r" />
                      <div className="absolute -left-0.5 top-40 w-0.5 h-8 bg-black/70 rounded-r" />
                      <div className="absolute -right-0.5 top-32 w-0.5 h-16 bg-black/70 rounded-l" />
                      <div className="relative w-[236px] h-[495px] rounded-[32px] overflow-hidden bg-gray-100 dark:bg-gray-800 flex flex-col">
                        <div className="px-3 py-2 flex items-center justify-between shrink-0 text-white" style={{backgroundColor: slide.header}}>
                          <div className="flex items-center gap-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="opacity-90"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            <div className="w-6 h-6 rounded-full bg-white/20" />
                            <div>
                              <div className="text-[11px] font-semibold truncate max-w-[120px]">{slide.name}</div>
                              <div className="text-[9px] text-white/80 leading-none">{slide.meta}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="opacity-90"><path d="M15 10l4-3v10l-4-3v-4z" fill="currentColor"/><rect x="3" y="7" width="12" height="10" rx="2" fill="currentColor"/></svg>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="opacity-90"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.08 4.18 2 2 0  0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.9.31 1.77.57 2.61a2 2 0 0 1-.45 2.11L8 9a16 16 0 0 0 6 6l.56-1.18a2 2 0 0 1 2.11-.45c.84.26 1.71.45 2.61.57A2 2 0  0 1 22 16.92z" fill="currentColor"/></svg>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="opacity-90"><circle cx="12" cy="6" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="18" r="1.5" fill="currentColor"/></svg>
                          </div>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="h-full w-full overflow-auto p-2.5 space-y-2 [background-size:14px_14px]" style={{backgroundColor: WABeige}}>
                            {slide.msgs.map((m, i2) => (
                              m.from === 'lawyer' ? (
                                <div key={i2} className="relative max-w-[82%] rounded-2xl rounded-tl-sm bg-white border border-gray-200 px-2.5 py-2 text-[11px] text-gray-800">
                                  <span className="absolute -left-1 top-2 block w-2 h-2 bg-white border-l border-b border-gray-200 rotate-45" />
                                  <div>{m.text}</div>
                                  {m.time && (
                                    <div className="mt-1 flex items-center justify-end gap-1 text-[9px] text-gray-500">{m.time}</div>
                                  )}
                                </div>
                              ) : (
                                <div key={i2} className="flex justify-end">
                                  <div className="relative max-w-[82%] rounded-2xl rounded-tr-sm px-2.5 py-2 text-[11px] text-gray-900" style={{backgroundColor: WAGreen}}>
                                    <span className="absolute -right-1 top-2 block w-2 h-2" style={{backgroundColor: WAGreen}} />
                                    <div>{m.text}</div>
                                    <div className="mt-1 flex items-center justify-end gap-1 text-[9px] text-gray-600">
                                      {m.time}
                                      {m.status && (
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                          <path d="M6 12l2.5 2.5L18 5" stroke={m.status==='read'?BlueTick:'#9CA3AF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                          <path d="M4 14l2.5 2.5" stroke={m.status==='read'?BlueTick:'#9CA3AF'} strokeWidth="2" strokeLinecap="round"/>
                                        </svg>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            ))}
                          </div>
                        </div>
                        <div className="px-2.5 py-2 bg-[#F0F0F0] dark:bg-gray-900 flex items-center gap-2 shrink-0">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-500"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M8 14c1 1.2 2.6 2 4 2s3-.8 4-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/></svg>
                          <div className="flex-1 h-7 rounded-full bg-white border border-gray-300" />
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-500"><path d="M21.44 11.05L12 20.5a6 6 0 11-8.49-8.48l10-10a4.5 4.5 0 016.36 6.36l-10 10a3 3 0 11-4.24-4.24l8.6-8.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-500"><path d="M4 7h3l2-2h6l2 2h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.5"/></svg>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-emerald-600"><path d="M12 14a3 3 0 0 0 3-3V7a3 3 0 0 0-6 0v 4a3 3 0 0 0 3 3z" fill="currentColor"/><path d="M19 11a7 7 0 0 1-14 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M12 18v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 mb-4 text-center text-[11px]">
                      <div className="font-semibold text-emerald-600">{slide.name}</div>
                      <div className="text-gray-600 dark:text-gray-300">{slide.role}</div>
                      <div className="text-gray-500">{slide.city}</div>
                      <div className="mt-1 text-amber-500">★★★★★</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-md bg-emerald-500 hover:bg-emerald-600 px-5 py-3 font-semibold text-white"
            >
              Falar no WhatsApp agora
            </a>
          </div>
        </div>
      </section>

      {/* Integrações */}
      <section className="py-12 px-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-lg font-semibold text-center">Integra com os sistemas que você usa</h3>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-sm text-gray-600 dark:text-gray-300">
            {['PJe','e-SAJ','Projudi','Gmail','Outlook','WhatsApp'].map((name) => (
              <div key={name} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800 px-3 py-2 text-center ring-1 ring-emerald-500/40 hover:ring-2 hover:ring-emerald-500/70 transition-all">{name}</div>
            ))}
          </div>
          <p className="mt-3 text-center text-xs text-gray-500">Captura de intimações, classificação por caso e lançamento automático de prazos.</p>
        </div>
      </section>

      {/* Segurança & LGPD */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-start">
          <div>
            <h3 className="text-lg font-semibold">Segurança e LGPD</h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2"><span className="mt-1 text-emerald-500">●</span> Criptografia em trânsito e em repouso</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-emerald-500">●</span> Controle de acesso por usuário e equipe (RLS)</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-emerald-500">●</span> Backups automáticos e trilha de auditoria</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-emerald-500">●</span> LGPD‑ready: retenção, portabilidade e exclusão</li>
            </ul>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5 bg-white dark:bg-gray-800 shadow-[0_0_80px_rgba(16,185,129,0.18),0_0_180px_rgba(16,185,129,0.12),0_0_90px_rgba(255,255,255,0.10)] transition-shadow hover:shadow-[0_0_0_2px_rgba(16,185,129,0.35)]">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Seus dados são protegidos por políticas de linha por usuário (RLS) no banco. Cada escritório só enxerga o que é dele.
              Log de ações críticas e duplo fator disponíveis sob demanda.
            </div>
          </div>
        </div>
      </section>

      {/* Casos de uso */}
      <section className="py-12 px-6 bg-gray-50 dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-lg font-semibold text-center">Casos de uso para o dia a dia</h3>
          <div className="mt-6 grid md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5 bg-white dark:bg-gray-800 shadow-[0_0_80px_rgba(16,185,129,0.18),0_0_180px_rgba(16,185,129,0.12),0_0_90px_rgba(255,255,255,0.10)] transition-shadow hover:shadow-[0_0_0_2px_rgba(16,185,129,0.35)]">
              <h4 className="font-semibold">Contencioso Cível</h4>
              <ul className="mt-3 text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <li>• Captura de intimações por e‑mail</li>
                <li>• Lançamento de prazos com alertas</li>
                <li>• Minutas de petições e recursos</li>
              </ul>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5 bg-white dark:bg-gray-800 shadow-[0_0_80px_rgba(16,185,129,0.18),0_0_180px_rgba(16,185,129,0.12),0_0_90px_rgba(255,255,255,0.10)] transition-shadow hover:shadow-[0_0_0_2px_rgba(16,185,129,0.35)]">
              <h4 className="font-semibold">Trabalhista</h4>
              <ul className="mt-3 text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <li>• Planilha de horas e reflexos</li>
                <li>• Minutas iniciais e acordos</li>
                <li>• Alertas de audiências</li>
              </ul>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5 bg-white dark:bg-gray-800 shadow-[0_0_80px_rgba(16,185,129,0.18),0_0_180px_rgba(16,185,129,0.12),0_0_90px_rgba(255,255,255,0.10)] transition-shadow hover:shadow-[0_0_0_2px_rgba(16,185,129,0.35)]">
              <h4 className="font-semibold">Família / Previdenciário</h4>
              <ul className="mt-3 text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <li>• Guarda, alimentos e convivência</li>
                <li>• Cálculos com CNIS e modelos</li>
                <li>• Checklist e documentos por caso</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ jurídico */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold text-center">Perguntas frequentes</h3>
          <div className="mt-6 space-y-3">
            {[
              {q:'Funciona com meu tribunal?', a:'Sim. Integra com PJe, e‑SAJ e Projudi via e‑mail/andamentos e organização por caso.'},
              {q:'Como entram os e‑mails?', a:'Conectamos Gmail/Outlook. As mensagens são classificadas e o que vira prazo é lançado com alerta.'},
              {q:'Posso exportar documentos?', a:'Sim. Geração de minutas em PDF/DOCX e organização no módulo de Documentos.'},
              {q:'Quem tem acesso aos meus dados?', a:'Apenas seu usuário/equipe. RLS garante escopo por escritório; há logs e controles.'},
              {q:'Como cancelo?', a:'Sem fidelidade. É só solicitar pelo suporte. Seus dados podem ser exportados.'},
            ].map((item, idx) => (
              <details key={idx} className="group rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 ring-1 ring-emerald-500/40 hover:ring-2 hover:ring-emerald-500/70 shadow-[0_0_60px_rgba(16,185,129,0.16),0_0_140px_rgba(16,185,129,0.10),0_0_80px_rgba(255,255,255,0.08)] transition-all">
                <summary className="cursor-pointer font-medium list-none">{item.q}</summary>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Planos com preços */}
      <section className="py-12 px-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-lg font-semibold">Planos</h3>
            <div className="mt-4 flex items-center justify-center gap-4 text-sm">
              <span className="text-gray-600 dark:text-gray-400">👥 Usado por 50+ advogados em SP, RJ e MG</span>
              <span className="text-amber-500">⭐ 4.8/5 estrelas</span>
            </div>
          </div>
          <div className="mt-6 grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800 ring-1 ring-emerald-500/40 hover:ring-2 hover:ring-emerald-500/70 shadow-[0_0_80px_rgba(16,185,129,0.18),0_0_180px_rgba(16,185,129,0.12),0_0_100px_rgba(255,255,255,0.10)] transition-all">
              <div className="text-sm uppercase tracking-wide text-emerald-600 font-semibold">Solo</div>
              <div className="mt-1 text-2xl font-bold">Para advogados(as) independentes</div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-600">R$ 197</span>
                <span className="text-gray-500">/mês</span>
              </div>
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                ou <span className="font-semibold text-emerald-600">R$ 1.892/ano</span> (2 meses grátis)
              </div>
              <ul className="mt-4 text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <li>• Chat com IA jurídica especializada</li>
                <li>• Calendário inteligente com alertas</li>
                <li>• Geração de documentos e minutas</li>
                <li>• Integração e-mail (Gmail/Outlook)</li>
                <li>• Setup e treinamento incluídos</li>
              </ul>
              <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-xs text-emerald-700 dark:text-emerald-300">
                ✅ Garantia de 30 dias ou dinheiro de volta<br/>
                ✅ Demo gratuita de 10 minutos<br/>
                ✅ Implementação sem custo adicional
              </div>
              <div className="mt-5">
                <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-md bg-emerald-500 hover:bg-emerald-600 px-4 py-2 font-semibold text-white w-full">Falar no WhatsApp</a>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800 ring-1 ring-emerald-500/40 hover:ring-2 hover:ring-emerald-500/70 shadow-[0_0_80px_rgba(16,185,129,0.18),0_0_180px_rgba(16,185,129,0.12),0_0_100px_rgba(255,255,255,0.10)] transition-all">
              <div className="text-sm uppercase tracking-wide text-emerald-600 font-semibold">Escritório</div>
              <div className="mt-1 text-2xl font-bold">Para pequenas equipes</div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-600">R$ 147</span>
                <span className="text-gray-500">/usuário/mês</span>
              </div>
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                ou <span className="font-semibold text-emerald-600">R$ 1.412/usuário/ano</span> (2 meses grátis)
              </div>
              <ul className="mt-4 text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <li>• Tudo do Solo para cada usuário</li>
                <li>• Segmentação por unidade/equipe</li>
                <li>• Relatórios e exportação avançada</li>
                <li>• Suporte prioritário e consultoria</li>
                <li>• Implementação completa incluída</li>
              </ul>
              <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-xs text-emerald-700 dark:text-emerald-300">
                ✅ Garantia de 30 dias ou dinheiro de volta<br/>
                ✅ Demo personalizada para equipe<br/>
                ✅ Migração de dados sem custo
              </div>
              <div className="mt-5">
                <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-md bg-emerald-500 hover:bg-emerald-600 px-4 py-2 font-semibold text-white w-full">Falar no WhatsApp</a>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            💬 <em>"Economizei 12h/semana com o JurIA. Melhor investimento que fiz."</em> - Dra. Ana Costa, Belo Horizonte
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 px-6 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto text-center">
          <h4 className="text-2xl md:text-3xl font-bold">Veja o JurIA funcionando em 10 minutos</h4>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Você já sai da demo com uma minuta e um prazo lançado no calendário.</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-md bg-emerald-500 hover:bg-emerald-600 px-5 py-3 font-semibold text-white"
            >
              Falar no WhatsApp
            </a>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 px-5 py-3 font-semibold"
            >
              Agendar demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} JurIA — Todos os direitos reservados
      </footer>
    </div>
  );
}
