# Garage System — Frontend

Interface web do Garage System, em React + Vite. Consome a API REST do backend, que vive em um repositório separado: [garage-system-backend](https://github.com/Peaguinha/garage-system-backend). Parâmetro visual e funcional: `garage-system-Prototipo/V2-GarageSystem.html`, no hub do projeto no Obsidian.

Plano completo (stack, estrutura, divisão de features por pessoa): ver **Garage System - Fase 2 Frontend.md** no hub do projeto no Obsidian.

## Como rodar

```bash
npm install
cp .env.example .env   # ajuste VITE_API_URL se o backend não estiver em localhost:3000
npm run dev
```

Precisa do backend rodando em paralelo (clone e instruções em [garage-system-backend](https://github.com/Peaguinha/garage-system-backend)) para o login e as chamadas de API funcionarem.

## Estrutura

```text
src/
├── app/            # rotas, layout (rail/topbar/bottom-nav), contexto de autenticação
├── features/        # uma pasta por feature (auth, dashboard, clientes, veiculos,
│                     # ordens-servico, servicos, pecas, usuarios)
└── shared/
    ├── components/  # Icon, RequireRole, FeaturePlaceholder...
    ├── api/          # cliente HTTP (client.js) — importar `api` daqui, não usar fetch direto
    ├── hooks/         # useAuth, useTheme
    └── styles/        # tokens.css + base.css, extraídos do protótipo V2
```

**Regra de ouro:** se um componente for usado por mais de uma feature, ele vive em `shared/components/`, não duplicado dentro de cada feature.

## Estado atual

O shell (login, layout, tema, roteamento, guarda de papel) está funcional e consumindo `POST /api/auth/login` de verdade. As demais telas (Dashboard, Clientes, Veículos, Ordens de Serviço, Serviços, Peças, Usuários) estão como placeholder — cada uma já roteada e com a feature/responsável indicados na própria tela — prontas para cada pessoa da equipe substituir pelo conteúdo real, seguindo o protótipo V2.
