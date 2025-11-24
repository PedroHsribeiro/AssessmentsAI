# PowerShell version of prepare-deploy script
# Execute com: .\prepare-deploy.ps1

Write-Host "🚀 Preparando aplicação para deploy..." -ForegroundColor Green

# 1. Backup do schema atual
Write-Host "📦 Fazendo backup do schema.prisma..." -ForegroundColor Yellow
Copy-Item "prisma\schema.prisma" "prisma\schema.backup.prisma"

# 2. Trocar para schema de produção (PostgreSQL)
Write-Host "🔄 Trocando para PostgreSQL..." -ForegroundColor Yellow
Copy-Item "prisma\schema.production.prisma" "prisma\schema.prisma" -Force

# 3. Instalar dependências
Write-Host "📥 Instalando dependências..." -ForegroundColor Yellow
npm install

# 4. Gerar Prisma Client
Write-Host "⚙️ Gerando Prisma Client..." -ForegroundColor Yellow
npx prisma generate

# 5. Build da aplicação
Write-Host " 🏗️ Buildando aplicação..." -ForegroundColor Yellow
npm run build

Write-Host ""
Write-Host "✅ Aplicação pronta para deploy!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Crie uma conta em https://neon.tech" -ForegroundColor White
Write-Host "2. Copie a connection string do PostgreSQL" -ForegroundColor White
Write-Host "3. Configure as env vars na Vercel" -ForegroundColor White
Write-Host "4. Faça push para o GitHub" -ForegroundColor White
Write-Host "5. Deploy automático será iniciado!" -ForegroundColor White
