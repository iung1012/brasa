#!/usr/bin/env bash
# ============================================================
# BRASA — Script de deploy no VPS
# Uso: bash deploy.sh seu_usuario@177.7.51.230
# ============================================================
set -euo pipefail

REMOTE=${1:-"root@177.7.51.230"}
APP_DIR="/opt/brasa"
DOMAIN="SEU_DOMINIO.com"   # troque pelo seu domínio

echo "→ Conectando em $REMOTE..."

ssh "$REMOTE" bash -s << ENDSSH
set -euo pipefail

# ── instala dependências no servidor (primeira vez) ──────────
if ! command -v docker &>/dev/null; then
  echo "→ Instalando Docker..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable --now docker
fi

if ! command -v docker compose &>/dev/null; then
  apt-get install -y docker-compose-plugin
fi

# ── clona ou atualiza o repositório ─────────────────────────
if [ ! -d "$APP_DIR" ]; then
  git clone https://github.com/iung1012/brasa.git "$APP_DIR"
else
  cd "$APP_DIR" && git pull --rebase
fi

cd "$APP_DIR"

# ── cria .env.production se não existir ──────────────────────
if [ ! -f .env.production ]; then
  cp .env.production.example .env.production 2>/dev/null || cp .env.example .env.production
  echo "⚠️  EDITE /opt/brasa/.env.production antes de continuar!"
  exit 1
fi

# ── SSL (primeira vez) ───────────────────────────────────────
mkdir -p nginx/ssl

if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
  echo "→ Obtendo certificado SSL para $DOMAIN..."
  docker compose -f docker-compose.prod.yml run --rm certbot certonly \\
    --webroot -w /var/www/certbot \\
    --email admin@$DOMAIN --agree-tos --no-eff-email \\
    -d $DOMAIN -d www.$DOMAIN
fi

# ── build e sobe os serviços ─────────────────────────────────
echo "→ Build e deploy..."
docker compose -f docker-compose.prod.yml pull --quiet
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d --remove-orphans

# ── migração do banco ────────────────────────────────────────
echo "→ Rodando migrations..."
docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy

echo "✅ Deploy concluído em https://$DOMAIN"
ENDSSH
