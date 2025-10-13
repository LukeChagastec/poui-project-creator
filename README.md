# PO UI Project Creator

![Versão](https://img.shields.io/badge/version-0.0.16-red)
![Licença](https://img.shields.io/badge/license-MIT-green)
![Plataforma](https://img.shields.io/badge/platform-VSCode-blueviolet)

Uma extensão para o Visual Studio Code que automatiza a criação de novos projetos **Angular** com **PO UI**, pré-configurados para o ecossistema **Protheus**.

## Funcionalidades Principais ✨

* **Criação com um Comando:** Gere um projeto completo e configurado a partir de um único comando na paleta do VS Code.
* **Integração Protheus:** Instala e configura automaticamente as dependências essenciais como `@totvs/protheus-lib-core` e `@totvs/po-theme`.
* **Estrutura Organizada:** Move os templates para arquivos externos, mantendo o código da extensão limpo e facilitando futuras atualizações.
* **Inicialização Inteligente de Git:** A extensão verifica se a pasta de destino já é um repositório Git. O comando `git init` só é executado se necessário, evitando reinicializações acidentais.
* **Fluxo de Trabalho Amigável:** Acompanhe todo o processo através de notificações de progresso e, ao final, abra o novo projeto em uma nova janela com apenas um clique.

## Como Usar

1.  Abra a Paleta de Comandos (`Ctrl+Shift+P` ou `Cmd+Shift+P` no macOS).
2.  Digite `PO UI: Criar Novo Projeto Protheus` e pressione `Enter`.
3.  Informe o nome do seu novo projeto.
4.  Selecione a pasta onde o projeto será criado.
5.  A extensão cuidará de todo o resto!

## O Que a Extensão Faz? ⚙️

O comando automatiza os seguintes passos para você:

1.  Cria um novo projeto Angular com o Angular CLI.
2.  Inicializa um repositório **Git** (se ainda não existir).
3.  Adiciona os componentes do **PO UI** (`@po-ui/ng-components`).
4.  Adiciona os templates do **PO UI** (`@po-ui/ng-templates`).
5.  Instala a **Protheus Lib Core** (`@totvs/protheus-lib-core`).
6.  Instala o **tema do Protheus** (`@totvs/po-theme`).
7.  Configura o `angular.json` com os estilos e assets necessários, incluindo o `favicon.ico`.
8.  Cria arquivos essenciais para a integração, como `appConfig.json`, interceptors de desenvolvimento e módulos.
9.  Instala todas as dependências do projeto com `npm install`.
10. Ao final, **oferece para abrir o projeto recém-criado** em uma nova janela do VS Code.

## Pré-requisitos

Antes de usar a extensão, garanta que você tenha as seguintes ferramentas instaladas:

* [Node.js](https://nodejs.org/) (que inclui o `npm`)
* [Angular CLI](https://angular.io/cli) (`npm install -g @angular/cli`)

## Licença

Este projeto é distribuído sob a licença **MIT**. Veja o arquivo `LICENSE` para mais detalhes.