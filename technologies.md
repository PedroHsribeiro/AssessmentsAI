O botão add provider não está funcionando# Tecnologias Implementadas

## Frontend
- **Framework**: Next.js 15 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: TailwindCSS
- **Componentes UI**: Shadcn/UI (Radix UI)
- **Ícones**: Lucide React
- **Gerenciamento de Estado**: React Hooks (useState, useFormStatus)
- **Formulários**: React Hook Form + Zod

## Backend
- **Runtime**: Node.js
- **API**: Next.js Server Actions
- **Banco de Dados**: SQLite
- **ORM**: Prisma (v5)
- **Autenticação**: NextAuth.js v5 (Credentials Provider)

## Inteligência Artificial & Processamento
- **LLM**: Suporte multi-provider (OpenAI, Google Gemini, Anthropic)
- **Processamento de Arquivos**: 
  - `pdf-parse` (PDF)
  - `mammoth` (DOCX)
  - `archiver` (Geração de ZIP)
- **Agente**: Lógica customizada em `lib/ai/agent.ts` com capacidade de análise de questionários e geração de evidências visuais.

## Observabilidade
- **Monitoramento**: Datadog (`dd-trace`) para APM e rastreamento de IA.

## Medidas de Segurança
- **Autenticação**: Senhas hash com `bcryptjs`. Sessões JWT seguras.
- **Validação de Dados**: `zod` para validação rigorosa de inputs no servidor e cliente.
- **Proteção de Rotas**: Middleware para restringir acesso a páginas protegidas.
- **Upload Seguro**: Armazenamento local em diretório controlado (`storage/uploads`).
- **CSRF**: Proteção nativa do Next.js/NextAuth.
