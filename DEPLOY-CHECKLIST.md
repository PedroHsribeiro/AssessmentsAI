# Deploy Checklist - Vercel + Neon

## ✅ Checklist de Deploy

### Fase 1: Preparação Local (5 minutos)
- [ ] 1.1 Trocar schema.prisma para PostgreSQL
- [ ] 1.2 Gerar novo Prisma Client
- [ ] 1.3 Testar build local
- [ ] 1.4 Commitar mudanças para GitHub

### Fase 2: Configurar Neon (3 minutos)
- [ ] 2.1 Criar conta em https://neon.tech
- [ ] 2.2 Criar novo projeto
- [ ] 2.3 Copiar connection string

### Fase 3: Configurar Vercel (5 minutos)
- [ ] 3.1 Criar conta em https://vercel.com
- [ ] 3.2 Importar projeto do GitHub
- [ ] 3.3 Adicionar variáveis de ambiente
- [ ] 3.4 Fazer primeiro deploy

### Fase 4: Finalização (3 minutos)
- [ ] 4.1 Rodar migrations no banco de produção
- [ ] 4.2 Criar usuários (seed)
- [ ] 4.3 Testar login
- [ ] 4.4 Configurar indexação SEO

---

## 📝 Anotações Durante o Deploy

**Neon Database URL:**
```
ANOTE AQUI: postgresql://...
```

**Vercel App URL:**
```
ANOTE AQUI: https://...vercel.app
```

**NEXTAUTH_SECRET:**
```
ANOTE AQUI: (gere com: openssl rand -base64 32)
```
