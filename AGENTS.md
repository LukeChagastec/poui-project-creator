# AGENTS.md

Extensão VS Code (`poui-project-creator`) que cria um projeto Angular + PO UI + Protheus a partir de um comando da paleta. Orquestração em `src/extension.ts`; lógica testável (sem `vscode`) em `src/lib/`. Entry point compilado: `out/extension.js`.

Mudou comando, estrutura ou regra? Atualize este arquivo no mesmo PR. Instrução desatualizada é pior que nenhuma. Mantenha-o curto: detalhes vão para `docs/`.

## Estrutura

| Caminho | Conteúdo |
|---|---|
| `src/extension.ts` | Só liga a API do VS Code (prompts, progresso, notificações) à lib |
| `src/lib/` | Lógica pura ou com I/O injetado: `versions.ts`, `configurePackageJson`, `configureAngularJson`, `templateMap`, `scaffold` |
| `src/templates/*.ts.template` | Arquivos injetados no projeto gerado (distribuídos como fonte) |
| `src/test/unit/` · `integration/` · `regression/` | Testes da extensão (`*.test.ts`) |
| `e2e/` | Playwright (`*.spec.ts`), `tsconfig.json` próprio, `global-setup.ts` |
| `.github/workflows/ci.yml` | CI (regras nos comentários do topo) |
| `docs/testes.md` | Convenções de teste, E2E e regressão |
| `docs/atualizar-versoes.md` | Runbook para atualizar PO UI, Angular e `protheus-lib-core` |

**Estrutura alvo.** Se `src/lib/` ainda não existir, a primeira tarefa é extrair a lógica de `extension.ts` para ela, com testes de caracterização escritos **antes** (o comportamento atual é a especificação). É `refactor:`, sem mudança de comportamento.

## Comandos

| Comando | O que faz |
|---|---|
| `npm ci` | Instala dependências (CI; `npm install` só local) |
| `npm run compile` | `tsc -p ./`, emite em `out/` |
| `npm run watch` | tsc em watch (também é o preLaunchTask do F5) |
| `npm run lint` | `eslint src e2e` |
| `npm run test:unit` | Mocha + `c8` sobre `out/test/unit/**/*.test.js` (rápido, sem VS Code) |
| `npm test` | `@vscode/test-cli` sobre `out/test/integration/**/*.test.js`; o `pretest` roda `compile && lint` |
| `npm run test:regression` | `out/test/regression/**/*.test.js` (snapshots + bugs corrigidos) |
| `npm run test:e2e` | Playwright: gera um projeto, instala, builda, serve e testa no navegador |
| `npm run test:all` | `test:unit` + `npm test` + `test:regression` + `test:e2e` |

F5 ("Run Extension" em `launch.json`) depura a extensão em um Extension Development Host.

## Stack e dependências

- Sem dependência nova se a stack atual resolve. Exceção: devDependencies de teste previstas aqui (`@playwright/test`, `c8`, `mocha`, plugin de lint `no-only-tests`).
- Não invente APIs, flags, versões ou nomes de pacote: confirme no repositório, no `node_modules` ou com `npm view` antes de usar. Se não conseguir verificar, diga.
- Diff mínimo: só o que a tarefa exige. Sem refatoração oportunista, código morto, código comentado, `TODO` ou flag "para uso futuro".

## TDD (obrigatório)

Todo código novo ou alterado em `src/` (exceto `src/test/**`) nasce de um teste que falha antes.

1. **Red:** escreva o teste, rode e **veja falhar por asserção** (não por import ou sintaxe; se precisar, crie um esqueleto que lança erro). Guarde comando e saída para o PR.
2. **Green:** o mínimo para passar.
3. **Refactor:** com a suíte verde.

- **Bug fix = teste de regressão primeiro** em `src/test/regression/`. Nunca remova um teste de regressão.
- **Commits RED são locais.** Antes do primeiro push, incorpore cada RED ao seu GREEN (`git rebase -i` com `fixup`). Todo commit publicado compila e passa em lint e testes. A evidência do RED vai no PR.
- **Mudou uma decisão no meio do caminho:** atualize **primeiro** os testes afetados, veja falhar na nova regra, só então ajuste o código. Commit próprio: `test: ajusta <comportamento> conforme <decisão>`.
- **Sem lógica nova em `extension.ts`:** extraia para `src/lib/`.
- **Cobertura mínima em `src/lib/`:** 80% de linhas, branches e funções (`c8`, `.c8rc.json`). Não baixe o limite.
- **Guarda no PR:** o CI falha se o diff alterar `src/**` (fora de `src/test/**`) sem alterar `src/test/**` ou `e2e/**`. Alterar `src/templates/**` exige snapshots atualizados.
- Nunca enfraqueça, remova ou pule teste para fazê-lo passar.

| Camada | Local | Valida | Roda em |
|---|---|---|---|
| Unitário | `src/test/unit/` | `src/lib/`: versões, `angular.json`, `templateMap`, leitura crua dos templates | Mocha + c8 |
| Integração | `src/test/integration/` | Comando no Extension Host com prompts stubados; árvore criada em diretório temporário | `@vscode/test-cli` |
| Regressão | `src/test/regression/` | Snapshots do projeto gerado + um teste por bug corrigido | Mocha |
| E2E | `e2e/*.spec.ts` | O **projeto gerado** instala, compila, sobe e renderiza | Playwright |

Detalhes, convenções, E2E e regressão: `docs/testes.md`.

## Decisões

- **A IA decide** e registra em uma linha no PR: nomes de arquivos, estrutura interna, organização dos testes, mensagens técnicas, versão-alvo (última estável compatível).
- **A IA pergunta e para** quando a resposta muda o que um teste afirma e não há padrão no repositório: dependência sem substituta compatível, mudança nos prompts ou no fluxo percebido pelo usuário, mudança na estrutura do projeto gerado, lacuna ou divergência entre a tarefa e o comportamento atual. Na dúvida: se dois desenvolvedores razoáveis escreveriam asserções diferentes, pergunte.
- Pergunte uma vez, em um único lote, com opções e recomendação. Não implemente com a recomendação como premissa enquanto houver pergunta bloqueante aberta.

## Fluxo do comando

- O mais automatizado possível: mínimo de prompts (nome e destino), defaults sensatos, instalação de dependências e abertura do projeto ao final.
- A lógica de scaffold aceita todas as opções como parâmetros (modo não interativo), que é o que o E2E usa. Prompt novo só com justificativa.
- Atualização de versões: `docs/atualizar-versoes.md`.

## Git e PR

- Working tree limpa; `git checkout Master && git pull origin Master`; branch nova `<tipo>/<issue>` a partir da `Master` (`feat`, `fix`, `refactor`, `docs`, `chore`, `test`, `ci`). Nunca empilhe sobre outra branch; se depender de PR não mergeado, pare e avise.
- **Versionamento só pela skill `powerversion` (obrigatório).** Stage, commit e mensagem passam pela skill, sempre informando a issue; não rode `git commit` à mão. A skill manda na forma do commit (mensagem, granularidade); este arquivo manda no quê e quando (TDD, checks antes do push). Se a skill bloquear o push, não contorne: avise o mantenedor para fazer o push. Conflito entre a skill e este arquivo que não se resolva por essa regra: pare e pergunte.
- Um commit, uma intenção, revertível sozinho, sempre verde. Conventional Commits em português; `feat`/`fix` podem citar `Cobre: <teste/issue>`.
- Antes de cada push: `npm run compile && npm run lint && npm run test:all` e `npx @vscode/vsce ls`.
- Antes de abrir o PR: `git fetch origin && git merge origin/Master`, preservando o que a `Master` introduziu, e rode tudo de novo.
- PR com base `Master`, em pt-BR, `Closes #<issue>`, aberto como draft (o CI roda em draft). Corpo: o que mudou, evidência do RED, premissas decididas, perguntas respondidas, pendências.
- Acompanhe com `gh pr checks --watch` até o fim. Falha de CI: comente a causa, reproduza com teste, corrija, rode local, push.
- **Não faça merge, não publique no Marketplace e não marque o PR como pronto** sem confirmação.

## CI

Workflow em `.github/workflows/ci.yml`, com as regras comentadas no topo. Pontos que não mudam: branch padrão `Master` (M maiúsculo), jobs `guard-tdd` → `test` → `e2e` → `package` → `publish` (só tag `v*`), nunca publicar em push/PR. Editou o workflow? Mantenha os comentários e este resumo coerentes.

## Prática com agentes (Agile Vibe Coding, estilo Akita)

Base: posts de Fabio Akita "Do Zero à Pós-Produção em 1 Semana" (XP com agente) e "Clean Code pra Agentes de IA" (ver "Código"). O agente é o par de programação, não piloto automático; o que garante qualidade é processo de engenharia, não mais agentes ou prompt melhor. Em conflito com o padrão do repositório, vale o padrão do repositório; avise.

- **Sem one-shot.** Passos pequenos: um comportamento, um ciclo RED → GREEN → REFACTOR, um commit.
- **Humano decide, agente executa.** Escopo, arquitetura e trade-offs são do mantenedor. O agente não amplia escopo por conta própria.
- **Revise todo diff** (`git diff` inteiro) antes de cada commit. Código que você não entende não entra.
- **Commit é ponto de rollback.** Se o agente se perdeu, `git restore`/`git reset` e recomece o passo; não "conserte em cima".
- **Evidência, não afirmação.** O PR traz a saída real dos comandos, nunca "deve funcionar".
- **Sessões curtas, uma tarefa por sessão.** O estado vive em commits, PR, issue e neste arquivo, não na memória da conversa.
- **O CI é o juiz final.** Sem `--no-verify`, sem baixar limite de cobertura, sem pular teste.

## Código

Clean Code, SRP, DRY e injeção de dependência continuam valendo, porque o leitor primário agora é o agente. Não entra: arquitetura para futuro hipotético, camada ou pacote "por organização".

- Proibido `any`; `unknown` só na fronteira e estreitado logo. Sem `as` nem `@ts-ignore`/`@ts-expect-error` para calar o compilador sem justificativa na mesma linha.
- **Tipos explícitos:** assinatura completa (parâmetros e retorno) em toda função exportada.
- Sem `catch` vazio nem `catch` que engole o erro; capture só onde houver ação concreta. Mensagens dizem o que falhou, o valor recebido e o esperado.
- Sem `console.log` novo; use notificações/`OutputChannel` do VS Code onde já houver.
- **Tamanho:** guard clauses, no máximo 2 níveis de indentação; funções de um propósito, 4 a 20 linhas; arquivos abaixo de 500 linhas (ideal 200 a 300), divididos por responsabilidade.
- **Nomes específicos e únicos**, que o agente ache com `grep`: evite `data`, `handler`, `Manager`, `Util`, `Service`. Um conceito, um nome: não alterne sinônimos na mesma feature.
- **Sem duplicação:** lógica que precisa mudar junta vive em um lugar só (o agente atualiza uma cópia e esquece as outras). Não abstraia código apenas parecido, nem para uso futuro.
- **Dependências injetadas**, nunca instanciadas dentro da função. A API do `vscode` e libs de terceiros ficam atrás de uma interface fina própria em `src/lib/`; nos testes, fake nomeado (`FakeX`), não stub inline.
- **Versões e configuração** centralizadas em `versions.ts`. Sem números ou strings mágicos: constante nomeada.
- **Comentários:** explique o **porquê** (decisão, bug, restrição, workaround), com issue ou SHA quando existir; nunca o **o quê**. Não apague comentário de contexto ao refatorar, inclusive os escritos pelo agente, exceto os óbvios. Função pública leva TSDoc com a intenção e um exemplo de uso.
- **Formatação:** o formatador já configurado no repositório; sem discussão de estilo e sem reformatar o que a tarefa não toca.

Autoverificação antes de cada commit:

- [ ] O diff contém só o que a tarefa exige, com uma única intenção?
- [ ] Cada símbolo usado existe? Todo código novo nasceu de teste que falhou antes?
- [ ] Há `any`, `catch` vazio, log novo ou código morto?
- [ ] Alguma função passa de 20 linhas, algum arquivo de 500, nome genérico ou lógica duplicada?
- [ ] Algum comentário de contexto foi apagado, ou algum só descreve o óbvio?
- [ ] Alguma lacuna foi preenchida por suposição que deveria ser pergunta? Alguma decisão mudou sem os testes atualizarem antes?

## Gotchas

- **Compile antes de rodar/testar.** O VS Code e o Mocha carregam `out/`, nunca `src/`.
- O primeiro `npm test` baixa uma instância do VS Code em `.vscode-test/` (gitignored); o primeiro `test:e2e` baixa o Chromium. Ambos precisam de rede.
- `.vscode-test.mjs` aponta só para `out/test/integration/**/*.test.js`; unitários e regressão rodam no Mocha puro.
- E2E é lento e instala dependências: nunca no hook `pretest`.
- Se um teste exigir `vscode` para validar regra de negócio, a lógica está no lugar errado: mova para `src/lib/`.
- `apontamento_prd/` é rascunho não versionado. Ignore-o; nunca inclua no CI, nos testes ou no `.vsix`.
- `playwright-report/`, `test-results/`, `coverage/` e `.vscode-test/` ficam no `.gitignore`.

## Templates do projeto gerado

- Ficam em `src/templates/*.ts.template`, lidos **crus (UTF-8, sem substituição de variáveis)** e gravados como estão. O destino vem do `templateMap` (em `src/lib/`); a primeira linha de cada template é um comentário `// src/...` com o destino.
- Para alterar um arquivo gerado: ajuste o teste (snapshot, e E2E se afetar o runtime), edite o template e atualize `templateMap` se adicionar/remover entrada.
- São distribuídos como **fonte, não compilados**: `package.json` `files` inclui `src/templates` e a extensão lê de `context.extensionPath + 'src/templates'`. Não mova para `out/`.
- `configurePackageJson` e `configureAngularJson` fixam as dependências e as opções de build do projeto gerado, sempre a partir de `versions.ts`. Mudar versão exige snapshot atualizado e E2E verde.

## Convenções

- **pt-BR em tudo:** strings de UI, prompts, mensagens de progresso, comentários, nomes de testes, commits, PR/issue e CHANGELOG.
- **Versão duplicada** em `package.json` (`version`) e no badge do README (`![Versão](...version-X)`); atualize os dois juntos. `CHANGELOG.md` é manual. Tags de release seguem `vX.Y.Z` e batem com `package.json`.
- **Não commitar** mudanças em `.vscode/settings.json` na chave `totvsLanguageServer.editor.linter.includes` (a extensão TOTVS tds-vscode a reescreve com caminho local; valor versionado: `C:\totvs\includes`).