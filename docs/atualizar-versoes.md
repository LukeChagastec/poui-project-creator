# Atualizar versões do projeto gerado

Fonte de verdade: documentação do PO UI (https://po-ui.io/) e o `peerDependencies` publicado do pacote.

1. **Alvo:** última versão estável de `@po-ui/ng-components`, salvo versão indicada na tarefa.
2. **Angular compatível:** `npm view @po-ui/ng-components@<versão> peerDependencies`.
3. **`@totvs/protheus-lib-core`:** versão compatível, pelo mesmo critério. Não adivinhe.
4. **Uma única constante:** todas as versões vivem em `src/lib/versions.ts`. Nenhum número de versão solto em `configurePackageJson`, `configureAngularJson` ou templates.
5. **`@totvs/po-theme`:** descontinuado, não pode aparecer no projeto gerado (dependências, `import`, `angular.json`). Um teste de regressão afirma a ausência. Se o estilo dependia dele, use o equivalente do PO UI da versão alvo; se não houver, pare e pergunte.
6. **Templates:** revise `src/templates/*` contra o modelo do Angular alvo (standalone, `provideRouter`, `app.config.ts`, etc.) e as boas práticas atuais, sem reescrever o que já funciona.
7. **Verificação:** TDD primeiro (ver `AGENTS.md`), atualize snapshots, rode `npm run test:all` (o E2E faz `npm ci` + `ng build` do projeto gerado).
8. **Registro:** `CHANGELOG.md`, `version` do `package.json` e badge do README, em pt-BR.

## Quando perguntar

- Não existe combinação compatível de PO UI, Angular e `protheus-lib-core`.
- Remover ou trocar uma dependência não tem substituta compatível.
- A atualização muda os prompts ou o fluxo percebido pelo usuário, ou a estrutura do projeto gerado.

O resto (versão exata, ajustes de template, nomes) a IA decide e registra em uma linha no PR.