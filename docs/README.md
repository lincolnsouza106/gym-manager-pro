# GymManager Pro — Manual de Instalação

> Sistema de Gerenciamento de Academias  
> **Desenvolvido por:** FitTech Solutions  
> **Cliente:** Academia LifeFit  
> **Versão:** 1.0.0

---

## 📋 Pré-requisitos

- **Node.js** v18 ou superior
- **npm** v9 ou superior
- **Git** (opcional)

---

## 🚀 Instalação

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd gym-manager-pro
```

### 2. Instalar dependências do Backend
```bash
cd backend
npm install
```

### 3. Configurar variáveis de ambiente
Crie um arquivo `.env` na pasta `backend/`:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="fittech-gymmanager-pro-secret-key-2024"
PORT=3001
NODE_ENV=development
```

### 4. Gerar o banco de dados e popular com dados de exemplo
```bash
# Dentro da pasta backend/
npx prisma generate      # Gera o client do Prisma
npx prisma db push       # Cria as tabelas no SQLite
npm run prisma:seed       # Popula com dados fictícios (30+ alunos, planos, etc.)
```

### 5. Instalar dependências do Frontend
```bash
cd ../frontend
npm install
```

---

## ▶️ Executando o Sistema

### Terminal 1 — Backend (API)
```bash
cd backend
npm run dev
```
O servidor iniciará em: **http://localhost:3001**

### Terminal 2 — Frontend (Interface)
```bash
cd frontend
npm run dev
```
A interface iniciará em: **http://localhost:5173**

---

## 🔑 Credenciais de Acesso (Seed)

| Perfil | Email | Senha |
|--------|-------|-------|
| Administrador | admin@lifefit.com | admin123 |
| Recepcionista | recepcao@lifefit.com | recepcao123 |
| Professora | ana.prof@lifefit.com | prof123 |
| Aluno | pedro.aluno@lifefit.com | aluno123 |

---

## 📚 Documentação da API

Após iniciar o backend, acesse a documentação Swagger em:

**http://localhost:3001/api-docs**

---

## 🛠️ Scripts Disponíveis

### Backend
| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor em modo desenvolvimento (hot-reload) |
| `npm run build` | Compila TypeScript para JavaScript |
| `npm run prisma:seed` | Popula o banco com dados de exemplo |
| `npm run prisma:studio` | Abre o Prisma Studio (visualizador do banco) |
| `npm run setup` | Gera client + cria tabelas + popula dados |

### Frontend
| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o Vite em modo desenvolvimento |
| `npm run build` | Gera build de produção |
| `npm run preview` | Pré-visualiza o build de produção |

---

## 📁 Estrutura do Projeto

```
gym-manager-pro/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Schema do banco de dados
│   │   └── seed.ts              # Script de seed
│   ├── src/
│   │   ├── controllers/         # Controllers (lógica de cada rota)
│   │   ├── middleware/           # Auth e Authorization
│   │   ├── routes/              # Definição de rotas Express
│   │   ├── validators/          # Schemas de validação (Zod)
│   │   ├── lib/                 # Prisma client singleton
│   │   └── index.ts             # Entry point do servidor
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/          # Componentes reutilizáveis
│   │   │   ├── layout/          # Sidebar, Header, AppLayout
│   │   │   └── ui/              # Toast, etc.
│   │   ├── contexts/            # AuthContext
│   │   ├── pages/               # Páginas da aplicação
│   │   ├── services/            # Axios API service
│   │   ├── App.tsx              # Roteamento principal
│   │   └── main.tsx             # Entry point React
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
└── docs/                        # Documentação do projeto
```

---

## 🔄 Resetar o Banco de Dados

Para limpar e repopular os dados:
```bash
cd backend
rm -f prisma/dev.db              # Remove o banco
npx prisma db push               # Recria as tabelas
npm run prisma:seed               # Repopula os dados
```

---

## 📱 Responsividade

O sistema é responsivo e funciona em:
- **Desktop** (1280px+)
- **Tablet** (768px - 1279px)
- **Mobile** (< 768px) — com menu lateral em drawer

---

## 🧪 Testabilidade

Todos os elementos interativos possuem atributos `data-testid` para facilitar automação de testes com:
- **Cypress**
- **Playwright**
- **Testing Library**

Padrão de nomenclatura:
- Botões: `btn-{ação}`
- Inputs: `input-{campo}`
- Tabelas: `table-{entidade}`
- Linhas: `{entidade}-row-{id}`
- Modais: `modal-{entidade}`
