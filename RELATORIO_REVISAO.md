# Relatório de revisão — MedAgenda

## Correções aplicadas
- Autenticação do frontend agora descarta JWT ausente, malformado ou expirado e encerra a sessão ao receber HTTP 401.
- Mocks ficam desligados por padrão e só são ativados com `VITE_USE_MOCKS=true`.
- Timeout HTTP e `AbortSignal` externo passam a atuar juntos; cancelamento externo é distinguido de timeout.
- CORS passou a usar allowlist por `CORS_ORIGINS`; localhost continua aceito em desenvolvimento.
- Adicionados headers básicos de segurança, limite do JSON e rate limiting das rotas `/auth`.
- `JWT_SECRET` é validado na inicialização e `.env.example` não contém segredo/ID real.
- Datas do dashboard e validação de nascimento usam `APP_TIME_ZONE`, evitando dependência do timezone do servidor/SQLite.
- Validações de atualização foram aproximadas das validações de criação em pacientes, médicos, especialidades e consultas.
- Mantidos os filtros por `usuario_id`, vínculos N:N e triggers de proteção contra relações entre contas.
- Metadados do `package.json` do backend foram corrigidos de biblioteca para MedAgenda.
- Removido banco de backup do pacote final para não distribuir dados locais; o banco é criado automaticamente.

## Decisão sobre JWT
O Bearer JWT foi mantido para evitar uma migração parcial para cookies entre domínios Vercel/Railway, que exigiria também estratégia CSRF e mudanças coordenadas no contrato. O armazenamento atual foi endurecido com validação local de expiração e limpeza automática em 401. Para uma evolução futura, cookie HttpOnly deve ser feito como migração completa de autenticação, não parcialmente.

## Produção
No Railway, configure `CORS_ORIGINS` com a origem exata do frontend, por exemplo `https://medagenda-rust.vercel.app`, e mantenha `NODE_ENV=production`, `APP_TIME_ZONE=America/Sao_Paulo`, `DATABASE_PATH=/data/banco.db`, `JWT_SECRET` forte e `GOOGLE_CLIENT_ID` real. Na Vercel, mantenha `VITE_USE_MOCKS=false`, `VITE_API_URL` apontando ao Railway e o client ID público do Google.

## Verificações executadas
- `node --check` passou em `index.js`, banco, helpers, middlewares e todas as rotas do backend.
- Busca por credenciais/URLs reais no pacote revisado não encontrou os valores anteriormente presentes nos exemplos.
- A instalação do frontend foi tentada, mas o ambiente de execução excedeu o limite de tempo durante `npm ci`; por isso lint/build completos não puderam ser comprovados aqui e não são declarados como aprovados.
- Não foi feito teste real do Google OAuth nem teste E2E em navegador, pois dependem das credenciais/origens do ambiente de produção.
