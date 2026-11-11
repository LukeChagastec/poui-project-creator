# Histórico de Alterações

Todas as mudanças notáveis para a extensão "poui-project-creator" serão documentadas neste arquivo.

Consulte [Mantenha um Changelog](http://keepachangelog.com/) para recomendações sobre como estruturar este arquivo.

## [0.1.0] - 2026-11-10

### Adicionado
- `@angular/cdk` ao projeto gerado (peer dependency de `@po-ui/ng-components`), incluindo entrada em `overrides`.
- Infraestrutura de testes: unitários (Mocha + c8, 100% de cobertura em `src/lib/`), integração (Extension Host) e regressão (snapshots do projeto gerado), além de E2E com Playwright.
- CI no GitHub Actions: `guard-tdd` → `test` → `e2e` → `package` → `publish` (publicação só por tag `v*`).

### Alterado
- Stack do projeto gerado atualizado: PO UI (`@po-ui/ng-components`/`@po-ui/ng-templates`) para **21.37.0**, Angular para **~21.2.26** (framework) / **~21.2.29** (CLI/devkit) e `@totvs/protheus-lib-core` para **^21.1.4**.
- `rxjs` para `~7.8.1` e `tslib` para `^2.6.2`, alinhados ao exigido pelo PO UI 21.
- Tema do `angular.json`: `po-theme-core.min.css` → `po-theme-default.min.css` (equivalente oficial do `@totvs/po-theme` no `@po-ui/style`).
- Flag do `ng add @po-ui/ng-components`: `--sidemenu` → `--configSideMenu` (nome real no schema do schematic).
- Lógica de criação do projeto extraída de `extension.ts` para `src/lib/`, com I/O injetado (testável sem `vscode`).
- Versões das dependências centralizadas em `src/lib/versions.ts`.
- Passos do scaffold renumerados sequencialmente.

### Removido
- Dependência descontinuada `@totvs/po-theme` do projeto gerado (dependências, `angular.json` e passos) e suas referências remanescentes no `README.md`.

## [0.0.16] - 2025-10-13

### Corrigido
- **fix:** Alinha as versões das dependências `@totvs/protheus-lib-core` e `@totvs/po-theme` para a release 19, garantindo a compatibilidade com o Angular 19.

## [0.0.15] - 2025-10-13

### Corrigido
- Versão dentro do README.MD.

## [0.0.14] - 2025-10-13

### Corrigido
- Resolvido um conflito crítico de dependência que ocorria durante a criação do projeto. A extensão agora garante a consistência da versão, criando projetos com Angular 19 e seu ecossistema compatível:
  - O comando `ng new` agora usa `npx` para executar o `@angular/cli@19`, garantindo uma base estável do Angular 19.
  - Os pacotes `@po-ui/ng-components` e `@po-ui/ng-templates` agora são instalados com a versão `19` para manter a compatibilidade.
  - A flag `--force` foi removida da instalação do `@totvs/protheus-lib-core`, pois as dependências alinhadas evitam erros de dependência de pares (peer dependency).

## [0.0.1] - 2025-10-13
### Adicionado
- Lançamento inicial
