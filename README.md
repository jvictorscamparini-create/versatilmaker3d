# Versátil Maker 3D

Gestão de impressão 3D em React, TypeScript e Vite, com servidor Express para o Estúdio Criativo e a Análise de Mercado.

## Executar

Use Node.js 22.12 ou superior (22 ou 24) e npm.

```sh
npm ci
npm run dev
```

Abra http://localhost:3000. Para testar a versão de produção:

```sh
npm run lint
npm run build
npm run test:smoke
npm start
```

`npm start` serve o frontend compilado e as APIs no mesmo endereço, respeitando `PORT` (3000 por padrão). `npm run preview` usa esse mesmo servidor e inclui as APIs. `npm run clean` remove somente os diretórios gerados `dist` e `build` do projeto.

## Variáveis de ambiente

Copie `.env.example` para `.env` se precisar configurar a IA:

- `GEMINI_API_KEY`: opcional. Sem chave, as duas ferramentas respondem com modelos locais de texto/análise. O resultado indica sua origem e deve ser revisado antes do uso.
- `GEMINI_MODEL`: modelo de texto, padrão `gemini-3.8-flash`.
- `PORT`: porta do servidor. Railway fornece este valor automaticamente.

A chave da IA é lida apenas no servidor; nunca use variáveis `VITE_` para segredos. A IA real depende de uma chave válida e das permissões/quota da conta. Não foi necessário incluir uma chave no repositório.

## Dados e funcionalidades

- Vendas, clientes, filamentos, impressoras, fila e cálculos são mantidos no armazenamento local do navegador. Os dados iniciais são exemplos para demonstração.
- Configurações da loja são salvas neste navegador. Exporte o backup JSON pela tela Configurações para guardar uma cópia. Ainda não há importação/restauração de backup na interface.
- Despesas e histórico de análises também são salvos localmente e incluídos no backup. Os gráficos usam os cadastros, e os relatórios financeiros filtram mês/ano. Custos do painel e taxas de marketplace são estimativas identificadas na interface.
- Não há banco compartilhado, contas de usuário ou sincronização entre dispositivos. Limpar os dados do site remove os cadastros locais.
- O Gerador 3D exporta geometria STL real para vaso, placa, suporte de mesa e chaveiro. A prévia é ilustrativa; confira o arquivo, orientação, dimensões em milímetros e os suportes no fatiador. Peso e tempo são estimativas. Texto em relevo usa caracteres latinos básicos, sem acentos.
- Shopee e Mercado Livre ainda não possuem OAuth nem chamadas às APIs oficiais. Suas telas indicam que as integrações não estão configuradas. Pedidos podem ser cadastrados manualmente.
- A preferência de WhatsApp é salva, mas envio de mensagens ainda não está integrado.
- Análise de mercado usa os dados informados pelo usuário; não coleta anúncios automaticamente. Modelos locais e texto de IA não são dados verificados de marketplaces.
- As últimas 50 análises ficam salvas neste navegador. O botão Análises Salvas permite rever os resultados. Extensão de captura e vídeo tutorial não estão disponíveis.

## Deploy

### Railway

Conecte este repositório a um serviço Node. `railway.json` configura `npm run build`, `npm start` e o health check `/api/health`. O servidor escuta em `0.0.0.0` e usa a porta fornecida pela plataforma. Configure `GEMINI_API_KEY` nas variáveis do serviço se quiser usar IA real.

### Vercel

Importe o repositório com o preset Vite. `vercel.json` configura a instalação via `npm ci`, o build, o frontend em `dist` e encaminha `/api/*` para a função Express em `api/index.ts`. Os outros caminhos abrem a SPA. Configure `GEMINI_API_KEY` nas variáveis de ambiente do projeto se necessário.

Respeite os limites de tamanho de requisição da plataforma; uploads grandes de imagem podem exceder os limites de funções Vercel. O frontend não necessita publicar código-fonte do servidor: seu build fica separado em `build`.

Na auditoria inicial não havia hooks, deployments ou workflows no GitHub, configuração local de Railway/Vercel, nem projeto na conta/equipe Vercel conectada. As configurações de deploy foram adicionadas; não foi criado um novo serviço remoto.

Referências: [Vite na Vercel](https://vercel.com/docs/frameworks/frontend/vite), [configuração Railway](https://docs.railway.com/config-as-code/reference), [modelos Gemini](https://ai.google.dev/gemini-api/docs/models).

## Validação automática

O workflow do GitHub verifica instalação, tipos, build e execução em Node 22 e 24. O teste de execução cobre o frontend, arquivos estáticos, navegação SPA, health check, APIs, respostas sem chave de IA, compatibilidade da resposta do Estúdio Criativo com a tela e entradas inválidas. A validação de STL cobre as quatro geometrias, dimensões, escala e orientação das faces.
