# FlowSentinel — Monitor n8n em Tempo Real

Dashboard de monitoramento para instâncias n8n. Exibe saúde dos workflows, alertas automáticos, mapa de dependências e histórico de execuções — tudo atualizado em tempo real via SSE.

## Pré-requisitos

- Node.js 18+
- Uma instância n8n acessível com a API habilitada

## Configuração rápida

### 1. Instalar dependências

```bash
cd n8n-radar
npm install
```

### 2. Criar o arquivo de variáveis de ambiente

Copie o exemplo e preencha com seus dados:

```bash
cp .env.local.example .env.local
```

Edite `.env.local`:

```env
# URL da sua instância n8n (sem barra no final)
N8N_BASE_URL=https://seu-n8n.exemplo.com

# Chave de API do n8n (Settings → API → Create API Key)
N8N_API_KEY=n8n_api_xxxxxxxxxxxx

# Credenciais de acesso ao dashboard
DASHBOARD_USER=admin
DASHBOARD_PASSWORD=senha_segura_aqui
DASHBOARD_KEY=chave_de_sessao_min_16_chars

# URL pública do n8n (para links diretos nas execuções)
NEXT_PUBLIC_N8N_BASE_URL=https://seu-n8n.exemplo.com

# Intervalo de atualização em ms (padrão: 30000 = 30s)
NEXT_PUBLIC_POLL_INTERVAL=30000

# Opcional: Supabase para persistência de alertas
# SUPABASE_URL=https://xxxx.supabase.co
# SUPABASE_ANON_KEY=eyJ...
```

### 3. Iniciar em desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### 4. Build para produção

```bash
npm run build
npm start
```

## Funcionalidades

| Tela | Descrição |
|------|-----------|
| **Overview** | KPIs de saúde, gráfico de distribuição, lista de todos os workflows |
| **Execuções** | Timeline de execuções com status em tempo real, alerta de execuções presas |
| **Dependências** | Mapa de microserviços e workflows dependentes |
| **Alertas** | Histórico de alertas detectados automaticamente |

### Dados em tempo real

O dashboard usa **Server-Sent Events (SSE)** — a conexão é mantida aberta e os dados chegam automaticamente a cada 30 segundos, sem necessidade de recarregar a página. O indicador "Ao Vivo" no topo mostra o estado da conexão.

### Alertas automáticos detectados

- `error_spike` — pico de erros nas últimas 24h
- `waiting_stuck` — execuções presas em "waiting" por mais de 1h
- `retry_storm` — tempestade de retentativas
- `dependency_down` — microserviço central fora do ar
- `schedule_missed` — workflow agendado sem execução recente
- `sendflow_loop` — loop recursivo detectado

## Estrutura do projeto

```
n8n-radar/
├── app/
│   ├── (dashboard)/          # Páginas do dashboard
│   │   ├── page.tsx          # Overview
│   │   ├── executions/       # Execuções
│   │   ├── dependencies/     # Mapa de dependências
│   │   └── alerts/           # Alertas
│   └── api/n8n/              # API Routes (proxy para n8n)
│       ├── sse/              # Stream SSE de saúde
│       ├── workflows/        # Lista de workflows + saúde
│       ├── executions/       # Execuções filtradas
│       └── health/           # Health check pontual
├── components/dashboard/     # Componentes visuais
├── hooks/                    # useSSE, useWorkflows, useExecutions
└── lib/                      # Motor de saúde, regras de alerta, cliente n8n
```

## Variáveis de ambiente — referência completa

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `N8N_BASE_URL` | ✅ | URL base da instância n8n |
| `N8N_API_KEY` | ✅ | Chave de API do n8n |
| `DASHBOARD_USER` | ✅ | Usuário do dashboard |
| `DASHBOARD_PASSWORD` | ✅ | Senha (mín. 8 caracteres) |
| `DASHBOARD_KEY` | ✅ | Segredo de sessão (mín. 16 caracteres) |
| `NEXT_PUBLIC_N8N_BASE_URL` | — | URL pública do n8n (links externos) |
| `NEXT_PUBLIC_POLL_INTERVAL` | — | Intervalo de polling em ms (padrão: 30000) |
| `SUPABASE_URL` | — | URL do Supabase para persistir alertas |
| `SUPABASE_ANON_KEY` | — | Chave anon do Supabase |

> Sem Supabase, os alertas ficam em memória e são perdidos ao reiniciar o servidor.
