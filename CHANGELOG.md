# Histórico de Alterações

Todas as mudanças notáveis para a extensão "poui-project-creator" serão documentadas neste arquivo.

Consulte [Mantenha um Changelog](http://keepachangelog.com/) para recomendações sobre como estruturar este arquivo.

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