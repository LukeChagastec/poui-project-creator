# feat(deps): atualiza o stack do projeto gerado (PO UI 21.37.0, Angular 21.2.x, protheus-lib-core 21.1.4)

## Resumo

Atualiza as versões fixadas em `src/lib/versions.ts` para alinhar o projeto gerado ao ecossistema estável mais recente do PO UI (dist-tag `latest` = 21.37.0). Além do bump de versão, ajusta o tema no `angular.json` para o equivalente oficial do `@totvs/po-theme` e corrige a flag do schematic no `ng add`.

## ⚙️ Detalhes Técnicos

### Versões adotadas (levantamento via `npm view`)

| Pacote | Antes | Depois |
|---|---|---|
| `@po-ui/ng-components` | `^21.0.1` | `^21.37.0` |
| `@po-ui/ng-templates` | `21.0.1` | `^21.37.0` |
| `@angular/*` (framework) | `~21.0.3` | `~21.2.26` |
| `@angular/cli`, `@angular-devkit/*` | `~21.0.x` | `~21.2.29` |
| `@angular/compiler-cli` | `~21.0.0` | `~21.2.26` |
| `@angular/cdk` | — (ausente) | `~21.2.14` (adicionado) |
| `@totvs/protheus-lib-core` | `^19.0.3` | `^21.1.4` |
| `rxjs` | `~7.8.0` | `~7.8.1` |
| `tslib` | `^2.3.0` | `^2.6.2` |

### Justificativa das versões

- **PO UI 21.37.0** é a `latest` estável. A `next` (22.0.0-rc.0) ainda é release candidate, então não é alvo de "última estável".
- **Angular `~21.2.x`**: `@po-ui/ng-components@21.37.0` declara `@angular/*: ^21` em `peerDependencies`. O framework mais recente da linha 21 é 21.2.26; CLI/devkit, 21.2.29.
- **`@totvs/protheus-lib-core@21.1.4`** (`latest`): exige Angular 21 e PO UI 21 via peer.
- **`@angular/cdk`**: peer dependency de `@po-ui/ng-components`; passou a ser declarado explicitamente (e em `overrides`) para evitar conflitos de peer e reduzir a dependência de `--force`.

### Tema

- O `angular.json` passou a usar `node_modules/@po-ui/style/css/po-theme-default.min.css` (equivalente oficial do `@totvs/po-theme` no `@po-ui/style`), no lugar de `po-theme-core.min.css`. O próprio schematic `ng-add` do PO UI e o guia de `PoThemeService` referenciam `po-theme-default.min.css`.

### Schematic

- A flag `--sidemenu` foi substituída por `--configSideMenu` no `ng add @po-ui/ng-components` — `configSideMenu` é o nome real da opção no `schema.json` do schematic (o default `true` configura o menu lateral).

## 🔗 Referências

- [PO UI — Primeiros passos](https://po-ui.io/guides/getting-started)
- [PO UI — Customização de temas (PoThemeService)](https://po-ui.io/guides/theme-service)
- `npm view @po-ui/ng-components@21.37.0 peerDependencies`
- Refs: #15
