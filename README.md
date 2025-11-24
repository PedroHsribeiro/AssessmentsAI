# Internal AI Questionnaire Platform

Plataforma interna para gerenciamento de questionários de clientes com análise por IA.

## 🚀 Tecnologias
- **Frontend**: Next.js 15 + TypeScript + TailwindCSS + Shadcn/UI
- **Backend**: Next.js Server Actions + Prisma + SQLite
- **Auth**: NextAuth.js v5
- **IA**: OpenAI GPT-4o
- **Observabilidade**: Datadog

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Configurar banco de dados
npx prisma migrate dev

# Popular banco com dados iniciais
npx tsx prisma/seed.ts

# Iniciar servidor de desenvolvimento
npm run dev
```

## 🔐 Credenciais Padrão
- **Admin**: `admin@example.com` / `admin123`
- **Comercial**: `commercial@example.com` / `admin123`

## ⚙️ Configuração

Crie um arquivo `.env` com:
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="changeme"
NEXTAUTH_URL="http://localhost:3000"
OPENAI_API_KEY="sua-chave-aqui"
```

## 📖 Estrutura

- `/app/commercial` - Ambiente comercial (criar solicitações)
- `/app/admin` - Ambiente admin (aprovar, gerenciar usuários, configurar IA)
- `/lib/ai/agent.ts` - Lógica do agente de IA

## 🎯 Funcionalidades

### Comercial
- Dashboard com solicitações
- Criar nova solicitação (cliente + questionário PDF/DOCX)
- Visualizar status

### Admin
- Ver todas as solicitações
- Aprovar/Rejeitar respostas
- Gerenciar usuários e papéis
- Configurar IA (prompt, modelo, base de conhecimento)

## 🛡️ Segurança
- Autenticação com bcrypt
- Validação com Zod
- Proteção de rotas via middleware
- Upload seguro de arquivos
