# Testes: convenções, E2E e regressão

Complementa a seção "TDD" e a tabela de camadas do `AGENTS.md`.

## Convenções

- `src/test/**` termina em `.test.ts` (o runner carrega `out/test/**/*.test.js`). Specs Playwright terminam em `.spec.ts` e ficam **fora** de `src/`, para não colidir com o `tsc` da extensão.
- Testes não tocam no diretório do usuário nem na rede (exceto E2E): `fs.mkdtemp(os.tmpdir())` e limpe no `afterEach`.
- Teste comportamento observável (arquivos gerados e conteúdo), não implementação. Mock só na fronteira (`vscode`, fs, rede, relógio); nunca mocke o módulo sob teste.
- Determinístico: sem dependência de ordem, data atual ou dados de outro teste. F.I.R.S.T: rápido, independente, repetível, autovalidável, escrito a tempo.
- Nomes em pt-BR: `it('gera o angular.json com ...')`.
- Todo teste roda por comando único, sem setup manual nem credenciais, com saída que o agente consegue ler.
- Sem `.skip`, `.only` nem `test.fixme` em código mergeado (`no-only-tests` no lint; `forbidOnly: !!process.env.CI` no Playwright).

## E2E (Playwright)

Valida o produto real: o projeto que a extensão gera. Não automatiza a UI do VS Code (frágil); o fluxo de prompts é coberto na integração.

Fluxo:

1. `e2e/global-setup.ts` chama `out/lib/scaffold.js` (sem `vscode`, modo não interativo) para gerar o projeto em diretório temporário.
2. Roda `npm ci` (ou `npm install` se o gerado não tiver lockfile) e `ng build` no projeto gerado; qualquer falha derruba a suíte.
3. `playwright.config.ts` sobe o app via `webServer` (`ng serve --port 4200`, `reuseExistingServer: !process.env.CI`).
4. Specs rodam em Chromium.

Cobertura mínima:

- App carrega sem erros de console (`console` de tipo erro e `pageerror` falham o teste).
- Layout PO UI (`po-menu`, `po-toolbar`) renderiza.
- Navegação entre as rotas geradas funciona.
- Chamadas ao Protheus (`@totvs/protheus-lib-core`) são **mockadas** com `page.route`; E2E nunca depende de Protheus real.

Regras:

- Seletores por `role`/`data-testid`, nunca por classe CSS do PO UI.
- `retries: 1` no CI e `0` local; `trace: 'on-first-retry'`; `screenshot: 'only-on-failure'`.
- Mudou versão em `versions.ts`, `configurePackageJson`/`configureAngularJson` ou qualquer `src/templates/*`: rode `npm run test:e2e` localmente antes do PR.
- E2E é lento (instala e builda um Angular): poucos specs, só caminho crítico. Lógica fina vai para unitário.

## Regressão

- **Snapshots do projeto gerado** em `src/test/regression/__snapshots__/`: lista ordenada de arquivos gerados, `package.json` e `angular.json` resultantes e o hash de cada template.
- Mudança intencional em template, dependência ou `angular.json`: `UPDATE_SNAPSHOTS=1 npm run test:regression` e **revise o diff do snapshot no PR**. Snapshot alterado sem mudança correspondente em `src/` é erro.
- Cada bug corrigido adiciona um teste nomeado com o issue (`issue-<n>-<slug>.test.ts`), mantido para sempre.
- Todo PR roda a suíte completa (unit + integração + regressão + E2E); não há seleção parcial.
- Regressão só é declarada depois de confirmar que a falha não ocorre na `Master`.