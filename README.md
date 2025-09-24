# PO UI Project Creator

This extension for Visual Studio Code helps you create new Angular projects with PO UI and Protheus configurations quickly and easily.

## Features

*   **PO UI: Criar Novo Projeto Protheus**: This is the main command of the extension. It automates the entire process of creating and configuring a new Angular project with PO UI, ready to be used with Protheus.

## Improvements in v0.0.5

*   **Git Initialization Validation**: The extension now checks if the selected project directory is already under version control. If it is, `git init` will be skipped to prevent unnecessary reinitialization.
*   **External Templates**: Project templates have been moved to external files in a `templates` folder. This makes the codebase cleaner and simplifies future updates to templates without altering the core extension logic.

## How to Use

1.  Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on macOS).
2.  Type `PO UI: Criar Novo Projeto Protheus` and press `Enter`.
3.  Follow the prompts to enter the project name and select the parent directory where the project will be created.
4.  The extension will take care of the rest, and you will see the progress in the notifications.

## What it Does

The extension performs the following steps:

1.  Creates a new Angular project using the Angular CLI.
2.  Adds the PO UI components (`@po-ui/ng-components`).
3.  Adds the PO UI templates (`@po-ui/ng-templates`).
4.  Installs the Protheus Lib Core (`@totvs/protheus-lib-core`).
5.  Installs the Protheus theme (`@totvs/po-theme`).
6.  Generates the environment files.
7.  Creates a development module and an interceptor service for Protheus integration.
8.  Configures the `angular.json` file with the necessary styles and assets.
9.  Creates and configures several files in your project, including `app.config.ts`, `app.component.ts`, and environment files.
10. Installs all the project dependencies using `npm install`.

## Requirements

Before using this extension, make sure you have the following tools installed on your system:

*   [Node.js](https://nodejs.org/) (which includes `npm`)
*   [Angular CLI](https://angular.io/cli)

---

**Enjoy!**