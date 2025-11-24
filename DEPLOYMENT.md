# Deployment Guide - Vercel + Neon PostgreSQL

## 🎯 Por que essa Stack?

- **Vercel**: Hospedagem gratuita ilimitada para Next.js
- **Neon**: PostgreSQL gratuito e serverless (até 512MB)
- **Total: 100% GRATUITO** 🎉

---

## 📝 Passo a Passo

### 1. Criar Conta na Neon (Banco de Dados)

1. Acesse: https://neon.tech
2. Clique em "Sign Up" → Use GitHub
3. Crie um novo projeto: 
   - Nome: `site-trabalho-db`
   - Região: `US East (Ohio)` (mais próxima do Brasil)
4. **COPIE a connection string** que aparece:
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### 2. Atualizar `.env` Local

Crie um arquivo `.env.production`:

```env
# Production Database (Neon PostgreSQL)
DATABASE_URL="cole_aqui_a_connection_string_da_neon"

# NextAuth
NEXTAUTH_URL="https://seu-site.vercel.app"
NEXTAUTH_SECRET="gere_uma_string_aleatoria_aqui"

# AI Provider Keys (se usar)
GEMINI_API_KEY="sua_chave_gemini"
OPENAI_API_KEY="sua_chave_openai"
```

**Para gerar o NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Atualizar `schema.prisma`

O arquivo já está configurado! Apenas verifique que o datasource está assim:

```prisma
datasource db {
  provider = "postgresql"  // ← deve ser postgresql, não sqlite
  url      = env("DATABASE_URL")
}
```

### 4. Fazer Deploy

#### A. Via Vercel Dashboard (Mais Fácil)

1. Acesse: https://vercel.com/signup
2. Conecte sua conta GitHub
3. Clique em "Add New" → "Project"
4. Selecione o repositório do seu projeto
5. Configure as **Environment Variables**:
   - `DATABASE_URL` = sua connection string da Neon
   - `NEXTAUTH_URL` = deixe vazio por enquanto
   - `NEXTAUTH_SECRET` = sua secret gerada
   - `GEMINI_API_KEY` = sua chave (se usar)
6. Clique em "Deploy"
7. Aguarde ~2 minutos ⏳
8. Volte em Settings → Environment Variables
9. Edite `NEXTAUTH_URL` e coloque a URL que a Vercel gerou (ex: `https://site-trabalho.vercel.app`)
10. Faça "Redeploy" nas últimas deployments

#### B. Via CLI (Avançado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer deploy
vercel

# Seguir os prompts
# Adicionar env vars quando solicitado
```

### 5. Rodar Migrações no Banco de Produção

Após o primeiro deploy:

```bash
# Definir a DATABASE_URL para produção temporariamente
$env:DATABASE_URL="postgresql://..."

# Rodar migrations
npx prisma db push

# Rodar seed (criar usuários)
npx tsx prisma/seed.ts
```

Ou use o Prisma Studio online: https://cloud.prisma.io

---

## 🔒 Controlar Indexação (SEO)

### Opção 1: Via `robots.txt`

Crie `public/robots.txt`:

```txt
# Bloquear todos os bots
User-agent: *
Disallow: /

# OU permitir indexação
User-agent: *
Allow: /
```

### Opção 2: Via Meta Tags

Em `app/layout.tsx`, adicione:

```tsx
export const metadata = {
  robots: {
    index: false,  // false = não indexar
    follow: false,
  }
}
```

### Opção 3: Via Headers (Next.js config)

Em `next.config.mjs`:

```js
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Robots-Tag',
          value: 'noindex, nofollow',
        },
      ],
    },
  ]
}
```

### Opção 4: Via Vercel Dashboard

1. Vá em Settings → "Search Engine Indexing"
2. Toggle para "Disabled"

---

## ✅ Checklist Final

- [ ] Conta Neon criada + Connection String copiada
- [ ] `.env.production` configurado localmente
- [ ] `schema.prisma` usando `postgresql`
- [ ] Código commitado no GitHub
- [ ] Deploy na Vercel configurado
- [ ] Environment variables adicionadas na Vercel
- [ ] `NEXTAUTH_URL` atualizado após primeiro deploy
- [ ] Migrations rodadas no banco produção
- [ ] Seed executado (usuários criados)
- [ ] Indexação configurada conforme desejado
- [ ] Testado login em produção

---

## 🆘 Troubleshooting

### "Database not found"
- Verifique a `DATABASE_URL` nas env vars da Vercel
- Rode `npx prisma db push` com a URL de produção

### "Cannot find module '@prisma/client'"
- Adicione nas env vars da Vercel: `PRISMA_GENERATE_DATAPROXY=true`

### "Session callback error"
- Verifique se `NEXTAUTH_URL` está correto
- Deve ser exatamente a URL da Vercel (sem barra no final)

### "CORS errors"
- Em `next.config.mjs`, adicione:
```js
async headers() {
  return [{
    source: '/api/:path*',
    headers: [
      { key: 'Access-Control-Allow-Origin', value: '*' },
    ],
  }]
}
```

---

## 💡 Dicas Extras

1. **Domínio Customizado**: Vercel permite domínio .com.br grátis
2. **Analytics**: Vercel Analytics é gratuito
3. **Preview Deployments**: Cada PR cria uma URL de preview
4. **Logs**: Veja logs em tempo real na Vercel
5. **Rollback**: Volte para deploy anterior com 1 clique

---

## 📊 Limites do Plano Gratuito

### Vercel:
- ✅ Bandwidth: 100GB/mês
- ✅ Invocações: 100k/mês
- ✅ Builds: Ilimitados
- ✅ Projetos: Ilimitados

### Neon (PostgreSQL):
- ✅ Storage: 512MB
- ✅ Compute: 0.25 vCPU
- ✅ Conexões: 100 simultâneas
- ✅ 1 projeto ativo

Para a maioria dos casos, é mais que suficiente! 🚀
