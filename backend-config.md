# Backend e Banco de Dados - Configuração para Deploy

## 📋 Estrutura Recomendada para Backend

### 🗄️ Banco de Dados (PostgreSQL/MySQL)

```sql
-- Tabela de Usuários
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    oab VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Casos
CREATE TABLE cases (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    client VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    priority VARCHAR(20) DEFAULT 'medium',
    deadline DATE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Documentos
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    case_id INTEGER REFERENCES cases(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    file_path VARCHAR(500),
    size INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Eventos do Calendário
CREATE TABLE calendar_events (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    case_id INTEGER REFERENCES cases(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    type VARCHAR(50) DEFAULT 'meeting',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Notificações
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 🚀 Backend API (Node.js/Express)

```javascript
// package.json dependencies
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "pg": "^8.11.3", // PostgreSQL
  "multer": "^1.4.5", // Upload de arquivos
  "dotenv": "^16.3.1"
}

// Estrutura de pastas recomendada:
backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── casesController.js
│   │   ├── documentsController.js
│   │   ├── calendarController.js
│   │   └── notificationsController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Case.js
│   │   ├── Document.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── cases.js
│   │   ├── documents.js
│   │   ├── calendar.js
│   │   └── notifications.js
│   ├── config/
│   │   └── database.js
│   └── app.js
├── uploads/ (para arquivos)
├── .env
└── server.js
```

### 🔐 Variáveis de Ambiente (.env)

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=juriai_db
DB_USER=your_db_user
DB_PASS=your_db_password

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

# OpenRouter API
OPENROUTER_API_KEY=your_openrouter_api_key

# Server
PORT=3001
NODE_ENV=production

# Upload
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_PATH=./uploads
```

### 📡 Principais Endpoints da API

```javascript
// Autenticação
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile
PUT  /api/auth/profile

// Casos
GET    /api/cases
POST   /api/cases
GET    /api/cases/:id
PUT    /api/cases/:id
DELETE /api/cases/:id

// Documentos
GET    /api/documents
POST   /api/documents/upload
GET    /api/documents/:id/download
DELETE /api/documents/:id

// Calendário
GET    /api/calendar/events
POST   /api/calendar/events
PUT    /api/calendar/events/:id
DELETE /api/calendar/events/:id

// Notificações
GET    /api/notifications
POST   /api/notifications
PUT    /api/notifications/:id/read
DELETE /api/notifications/:id

// Chat IA
POST   /api/chat/message
```

## 🌐 Deploy - Opções Recomendadas

### 1. **Vercel + PlanetScale** (Recomendado)
- **Frontend**: Vercel (gratuito)
- **Backend**: Vercel Functions
- **Banco**: PlanetScale (MySQL gratuito)
- **Storage**: Vercel Blob ou AWS S3

### 2. **Netlify + Supabase**
- **Frontend**: Netlify (gratuito)
- **Backend**: Netlify Functions
- **Banco**: Supabase (PostgreSQL gratuito)
- **Storage**: Supabase Storage

### 3. **Railway** (Mais Simples)
- **Full Stack**: Railway
- **Banco**: PostgreSQL integrado
- **Deploy**: Git push automático

### 4. **Hostinger Cloud** (Seu Caso)
- **VPS**: Hostinger Cloud
- **Banco**: MySQL/PostgreSQL
- **Servidor**: Node.js + PM2
- **Proxy**: Nginx

## 🔧 Scripts de Deploy

```json
// package.json
{
  "scripts": {
    "build": "npm run build:frontend && npm run build:backend",
    "build:frontend": "cd frontend && npm run build",
    "build:backend": "cd backend && npm run build",
    "start": "node backend/server.js",
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\"",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && npm run dev"
  }
}
```

## 📝 Próximos Passos para Implementação

1. **Criar estrutura do backend**
2. **Configurar banco de dados**
3. **Implementar autenticação JWT**
4. **Conectar frontend com API**
5. **Configurar upload de arquivos**
6. **Deploy em produção**

## 🔍 Monitoramento e Logs

- **Logs**: Winston ou Morgan
- **Monitoramento**: PM2 (produção)
- **Backup**: Cron jobs para backup do banco
- **SSL**: Let's Encrypt (gratuito)

Esta configuração permitirá que sua aplicação JuriAI seja totalmente funcional em produção com persistência real dos dados.
