#!/bin/bash
# Script para preparar deploy para produção

echo "🚀 Preparando aplicação para deploy..."

# 1. Backup do schema atual
echo "📦 Fazendo backup do schema.prisma..."
cp prisma/schema.prisma prisma/schema.backup.prisma

# 2. Trocar para schema de produção (PostgreSQL)
echo "🔄 Trocando para PostgreSQL..."
cp prisma/schema.production.prisma prisma/schema.prisma

# 3. Instalar dependências
echo "📥 Instalando dependências..."
npm install

# 4. Gerar Prisma Client
echo "⚙️ Gerando Prisma Client..."
npx prisma generate

# 5. Build da aplicação
echo "🏗️ Buildando aplicação..."
npm run build

echo "✅ Aplicação pronta para deploy!"
echo ""
echo "📋 Próximos passos:"
echo "1. Crie uma conta em https://neon.tech"
echo "2. Copie a connection string do PostgreSQL"
echo "3. Configure as env vars na Vercel"
echo "4. Faça push para o GitHub"
echo "5. Deploy automático será iniciado!"
