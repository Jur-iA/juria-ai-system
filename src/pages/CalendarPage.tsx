import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  User,
  AlertTriangle,
  Edit,
  Trash2
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'hearing' | 'deadline' | 'meeting' | 'other';
  location?: string;
  client?: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  // Carregar eventos do localStorage ou usar dados padrão
  const [events, setEvents] = useState<Event[]>(() => {
    const saved = localStorage.getItem('calendarEvents');
    return saved ? JSON.parse(saved) : [
    {
      id: '1',
      title: 'Audiência de Instrução',
      date: '2024-01-15',
      time: '14:00',
      type: 'hearing',
      location: 'Fórum Central - Sala 205',
      client: 'Maria Silva',
      description: 'Audiência de instrução e julgamento - Ação Trabalhista',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Prazo para Contestação',
      date: '2024-01-18',
      time: '17:00',
      type: 'deadline',
      client: 'João Santos',
      description: 'Prazo final para apresentação de contestação',
      priority: 'high'
    },
    {
      id: '3',
      title: 'Reunião com Cliente',
      date: '2024-01-20',
      time: '10:00',
      type: 'meeting',
      location: 'Escritório',
      client: 'Carlos Oliveira',
      description: 'Reunião para discussão de estratégia processual',
      priority: 'medium'
    },
    {
      id: '4',
      title: 'Entrega de Documentos',
      date: '2024-01-22',
      time: '16:00',
      type: 'deadline',
      client: 'Ana Costa',
      description: 'Prazo para entrega de documentos complementares',
      priority: 'medium'
    }
  ];
  });

  // Salvar eventos no localStorage sempre que houver mudanças
  const saveEvents = (newEvents: Event[]) => {
    setEvents(newEvents);
    localStorage.setItem('calendarEvents', JSON.stringify(newEvents));
    // Sincronizar "Prazos Próximos" no Dashboard
    try {
      const today = new Date();
      const toNum = (s?: string) => (s ? Number(s.replace(/-/g, '')) : 0);
      const todayNum = Number(`${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`);
      const upcoming = newEvents.filter(e => e.type === 'deadline' && toNum(e.date) >= todayNum).length;
      const saved = localStorage.getItem('dashboardStats');
      const current = saved ? JSON.parse(saved) as { activeCases: number; generatedDocs: number; upcomingDeadlines: number; monthlyRevenue: number } : {
        activeCases: 0,
        generatedDocs: 0,
        upcomingDeadlines: 0,
        monthlyRevenue: 0,
      };
      const next = { ...current, upcomingDeadlines: upcoming };
      localStorage.setItem('dashboardStats', JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  // Funções CRUD para eventos
  const handleAddEvent = (eventData: Omit<Event, 'id'>) => {
    const newEvent: Event = {
      ...eventData,
      id: Date.now().toString()
    };
    const updatedEvents = [newEvent, ...events];
    saveEvents(updatedEvents);
    setShowEventModal(false);
    alert('✅ Evento adicionado com sucesso!');
  };

  const handleEditEvent = (eventData: Omit<Event, 'id'>) => {
    if (!editingEvent) return;
    
    const updatedEvents = events.map(event => 
      event.id === editingEvent.id 
        ? { ...eventData, id: editingEvent.id }
        : event
    );
    saveEvents(updatedEvents);
    setEditingEvent(null);
    setShowEventModal(false);
    alert('✅ Evento atualizado com sucesso!');
  };

  const handleDeleteEvent = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    if (window.confirm(`Tem certeza que deseja excluir o evento "${event.title}"?`)) {
      const updatedEvents = events.filter(e => e.id !== eventId);
      saveEvents(updatedEvents);
      alert('✅ Evento excluído com sucesso!');
    }
  };

  const handleResetAllEvents = () => {
    if (window.confirm('Tem certeza que deseja excluir TODOS os eventos? Esta ação não pode ser desfeita.')) {
      saveEvents([]);
      setShowResetConfirm(false);
      alert('✅ Todos os eventos foram excluídos!');
    }
  };

  const openAddEventModal = (date?: string) => {
    setEditingEvent(null);
    if (date) setSelectedDate(date);
    setShowEventModal(true);
  };

  const openEditEventModal = (event: Event) => {
    setEditingEvent(event);
    setShowEventModal(true);
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const getEventsForDate = (dateString: string) => {
    return events.filter(event => event.date === dateString);
  };

  const getEventTypeColor = (type: Event['type']) => {
    const colors = {
      hearing: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      deadline: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      meeting: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    };
    return colors[type];
  };

  const getEventTypeLabel = (type: Event['type']) => {
    const labels = {
      hearing: 'Audiência',
      deadline: 'Prazo',
      meeting: 'Reunião',
      other: 'Outros'
    };
    return labels[type];
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="p-2 text-center text-gray-400">
        </div>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = getEventsForDate(dateString);
      const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
      const isSelected = selectedDate === dateString;

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(dateString)}
          className={`p-2 text-center cursor-pointer rounded-lg transition-colors ${
            isToday 
              ? 'bg-emerald-500 text-white' 
              : isSelected 
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <div className="font-medium">{day}</div>
          {dayEvents.length > 0 && (
            <div className="flex justify-center mt-1 space-x-1">
              {dayEvents.slice(0, 3).map((event, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    event.priority === 'high' ? 'bg-red-500' :
                    event.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                />
              ))}
              {dayEvents.length > 3 && (
                <div className="text-xs text-gray-500">+{dayEvents.length - 3}</div>
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendário</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gerencie seus prazos e compromissos processuais
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button 
            onClick={() => openAddEventModal()}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Evento
          </button>
          <button 
            onClick={() => setShowResetConfirm(true)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            title="Excluir todos os eventos"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            {/* Calendar Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatDate(currentDate)}
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-6">
              {/* Days of Week Header */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {renderCalendarDays()}
              </div>
            </div>
          </div>
        </div>

        {/* Events Sidebar */}
        <div className="space-y-6">
          {/* Selected Date Events */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {selectedDate ? `Eventos - ${new Date(selectedDate).toLocaleDateString('pt-BR')}` : 'Selecione uma data'}
              </h3>
            </div>
            <div className="p-4">
              {selectedDateEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateEvents.map(event => (
                    <div key={event.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          {event.title}
                        </h4>
                        {event.priority === 'high' && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      
                      <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {event.time}
                        </div>
                        {event.location && (
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {event.location}
                          </div>
                        )}
                        {event.client && (
                          <div className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {event.client}
                          </div>
                        )}
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getEventTypeColor(event.type)}`}>
                          {getEventTypeLabel(event.type)}
                        </span>
                        <div className="flex space-x-1">
                          <button 
                            onClick={() => openEditEventModal(event)}
                            className="text-gray-400 hover:text-blue-600 p-1 rounded transition-colors"
                            title="Editar evento"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => handleDeleteEvent(event.id)}
                            className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors"
                            title="Excluir evento"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  {selectedDate ? 'Nenhum evento para esta data' : 'Clique em uma data para ver os eventos'}
                </p>
              )}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Próximos Eventos
              </h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {events.slice(0, 4).map(event => (
                  <div key={event.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${
                      event.priority === 'high' ? 'bg-red-500' :
                      event.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {event.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(event.date).toLocaleDateString('pt-BR')} - {event.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Estatísticas
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Eventos este mês</span>
                <span className="font-semibold text-gray-900 dark:text-white">{events.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Prazos urgentes</span>
                <span className="font-semibold text-red-600">
                  {events.filter(e => e.priority === 'high').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Audiências</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {events.filter(e => e.type === 'hearing').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <EventModal
          event={editingEvent}
          selectedDate={selectedDate}
          onSave={editingEvent ? handleEditEvent : handleAddEvent}
          onClose={() => {
            setShowEventModal(false);
            setEditingEvent(null);
          }}
        />
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Confirmar Reset
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Tem certeza que deseja excluir TODOS os eventos do calendário? Esta ação não pode ser desfeita.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleResetAllEvents}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  Excluir Todos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Event Modal Component
function EventModal({ 
  event, 
  selectedDate, 
  onSave, 
  onClose 
}: {
  event: Event | null;
  selectedDate: string | null;
  onSave: (eventData: Omit<Event, 'id'>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    date: event?.date || selectedDate || new Date().toISOString().split('T')[0],
    time: event?.time || '09:00',
    type: event?.type || 'meeting' as Event['type'],
    location: event?.location || '',
    client: event?.client || '',
    description: event?.description || '',
    priority: event?.priority || 'medium' as Event['priority']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('❌ Por favor, insira um título para o evento.');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {event ? 'Editar Evento' : 'Novo Evento'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
              placeholder="Ex: Audiência de Instrução"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Horário *
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Event['type'] })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="hearing">Audiência</option>
                <option value="deadline">Prazo</option>
                <option value="meeting">Reunião</option>
                <option value="other">Outros</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prioridade
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Event['priority'] })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Local
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
              placeholder="Ex: Fórum Central - Sala 205"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cliente
            </label>
            <input
              type="text"
              value={formData.client}
              onChange={(e) => setFormData({ ...formData, client: e.target.value })}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
              placeholder="Ex: Maria Silva"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
              rows={3}
              placeholder="Descreva os detalhes do evento..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
            >
              {event ? 'Salvar Alterações' : 'Criar Evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}