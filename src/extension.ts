import * as vscode from 'vscode';
import * as path from 'path';
import { dirname } from 'path';
import { TextDecoder } from 'util';

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('poui-project-creator.createProject', async () => {

		const projectName = await vscode.window.showInputBox({
			prompt: "Qual é o nome do projeto?",
			placeHolder: "ex: meu-projeto-poui",
			validateInput: text => text ? null : "O nome do projeto não pode ser vazio."
		});

		if (!projectName) { return; }

		const parentUri = await vscode.window.showOpenDialog({
			canSelectMany: false,
			canSelectFiles: false,
			canSelectFolders: true,
			openLabel: 'Selecione a pasta para criar o projeto'
		});

		if (!parentUri) { return; }

		const parentPath = parentUri[0].fsPath;
		const projectPath = path.join(parentPath, projectName);

		try {
			const isGitRepo = await isGitRepository(projectPath);

			// Inicia a automação com uma notificação de progresso
			await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: `Criando projeto PO UI: ${projectName}`,
				cancellable: false
			}, async (progress) => {

				const steps = [
					{ command: `npx -p @angular/cli@19 ng new ${projectName} --style=css --skip-install`, cwd: parentPath, message: 'Passo 1/10: Criando estrutura com Angular CLI v19...' },
					...(isGitRepo ? [] : [{ command: 'git init', cwd: projectPath, message: 'Passo 2/10: Inicializando repositório Git...' }]),
					{ command: 'ng add @po-ui/ng-components@19 --skip-confirmation --sidemenu', cwd: projectPath, message: 'Passo 3/10: Instalando componentes PO UI v19...' },
					{ command: 'ng add @po-ui/ng-templates@19 --skip-confirmation', cwd: projectPath, message: 'Passo 4/10: Instalando templates PO UI v19...' },
					{ command: 'npm i @totvs/protheus-lib-core', cwd: projectPath, message: 'Passo 5/10: Instalando Protheus Lib Core...' },
					{ command: 'npm i @totvs/po-theme', cwd: projectPath, message: 'Passo 6/10: Instalando tema Protheus...' },
					{ command: 'ng generate environments', cwd: projectPath, message: 'Passo 7/10: Gerando environments...' },
					{ command: 'ng generate module modules/lib-core-dev', cwd: projectPath, message: 'Passo 8/10: Criando módulo de desenvolvimento...' },
					{ command: 'ng generate service services/lib-core-dev-interceptor', cwd: projectPath, message: 'Passo 9/10: Criando service interceptor...' }
				];

				for (const step of steps) {
					progress.report({ message: step.message });
					await executeShellCommand(step.command, step.cwd, step.message);
				}

				progress.report({ message: 'Passo 10/10: Configurando arquivos do projeto...' });

				const assetsPath = path.join(projectPath, 'src', 'assets');
				await vscode.workspace.fs.createDirectory(vscode.Uri.file(path.join(assetsPath, 'data')));
				await vscode.workspace.fs.createDirectory(vscode.Uri.file(path.join(assetsPath, 'images')));

				const faviconSourceUri = vscode.Uri.file(path.join(projectPath, 'src', 'favicon.ico'));
				const faviconDestUri = vscode.Uri.file(path.join(assetsPath, 'images', 'favicon.ico'));
				try {
					await vscode.workspace.fs.stat(faviconSourceUri); // Check if source favicon exists
					await vscode.workspace.fs.rename(faviconSourceUri, faviconDestUri, { overwrite: true });
				} catch (e) {
					console.warn(`Favicon not found at ${faviconSourceUri.fsPath}. Skipping rename.`);
				}

				const appConfigContent = JSON.stringify({
					name: projectName, version: "1.0.0", api_baseUrl: "/", "productLine": "Protheus"
				}, null, 4);
				await writeFile(path.join(assetsPath, 'data', 'appConfig.json'), appConfigContent);

				await configureAngularJson(projectPath);

				const templateMap = {
					'src/app/app-initializer.ts': 'app-initializer.ts.template',
					'src/environments/environment.local.ts': 'env-local.ts.template',
					'src/environments/environment.development.ts': 'env-dev.ts.template',
					'src/environments/environment.ts': 'env-prod.ts.template',
					'src/app/app.config.ts': 'app-config-ts.ts.template',
					'src/app/services/lib-core-dev-interceptor.service.ts': 'interceptor.ts.template',
					'src/app/app.component.ts': 'app-component-ts.ts.template',
					'src/app/modules/lib-core-dev/lib-core-dev.module.ts': 'lib-core-dev-module.ts.template',
				};

				// 2. Crie um array de promessas, onde cada uma lê um arquivo de template
				const readPromises = Object.values(templateMap).map(templateName => {
					const templatePath = path.join(context.extensionPath, 'src', 'templates', templateName);
					// Supondo que 'readTemplate' retorne a string do conteúdo do arquivo
					return readTemplate(templatePath);
				});

				// 3. Aguarde todas as leituras de arquivo terminarem
				const contents = await Promise.all(readPromises);

				// 4. Crie o objeto 'filesToCreate' combinando os caminhos de destino com o conteúdo lido
				const filesToCreate = Object.keys(templateMap).reduce((acc, key, index) => {
					acc[key] = contents[index];
					return acc;
				}, {} as { [key: string]: string });

				// Agora você pode usar o objeto 'filesToCreate' para escrever os arquivos
				for (const [relativePath, content] of Object.entries(filesToCreate)) {
					await writeFile(path.join(projectPath, relativePath), content);
				}

				progress.report({ message: 'Passo 10/10: Instalando todas as dependências (npm install)...', increment: 100 });
				await executeShellCommand('npm install', projectPath, 'NPM Install');
			});

			vscode.window.showInformationMessage(`Projeto '${projectName}' criado com sucesso!`);
			const openInNewWindow = 'Abrir em Nova Janela';
			vscode.window.showInformationMessage(`Deseja abrir o novo projeto?`, openInNewWindow).then(selection => {
				if (selection === openInNewWindow) {
					vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(projectPath), { forceNewWindow: true });
				}
			});

		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			vscode.window.showErrorMessage(`Ocorreu um erro durante a criação do projeto: ${errorMessage}`);
		}
	});

	context.subscriptions.push(disposable);
}


async function isGitRepository(directory: string): Promise<boolean> {
	try {
		const gitDir = vscode.Uri.file(path.join(directory, '.git'));
		await vscode.workspace.fs.stat(gitDir);
		return true;
	} catch {
		return false;
	}
}

async function readTemplate(absolutePath: string): Promise<string> {
	const decoder = new TextDecoder('utf-8');
	const fileUri = vscode.Uri.file(absolutePath);
	const contentBytes = await vscode.workspace.fs.readFile(fileUri);
	return decoder.decode(contentBytes);
}

async function executeShellCommand(command: string, cwd: string, message: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const task = new vscode.Task(
			{ type: 'shell', group: vscode.TaskGroup.Build },
			vscode.TaskScope.Workspace,
			message,
			'PO UI Project Creator',
			new vscode.ShellExecution(command, { cwd: cwd })
		);
		task.presentationOptions = {
			reveal: vscode.TaskRevealKind.Always,
			showReuseMessage: false,
			clear: false
		};

		const disposable = vscode.tasks.onDidEndTaskProcess(e => {
			if (e.execution.task === task) {
				disposable.dispose();
				if (e.exitCode === 0) {
					resolve();
				} else {
					reject(`O comando '${command}' falhou com código de saída ${e.exitCode}.`);
				}
			}
		});

		vscode.tasks.executeTask(task);
	});
}

async function writeFile(filePath: string, content: string): Promise<void> {
	try {
		const encoder = new TextEncoder();
		const contentBytes = encoder.encode(content);
		const fileUri = vscode.Uri.file(filePath);

		await vscode.workspace.fs.createDirectory(vscode.Uri.file(dirname(filePath)));
		await vscode.workspace.fs.writeFile(fileUri, contentBytes);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		return Promise.reject(`Falha ao escrever o arquivo ${path.basename(filePath)}: ${errorMessage}`);
	}
}

async function configureAngularJson(projectPath: string): Promise<void> {
	const decoder = new TextDecoder('utf-8');
	const encoder = new TextEncoder();
	const angularJsonUri = vscode.Uri.file(path.join(projectPath, 'angular.json'));

	try {
		const originalContentBytes = await vscode.workspace.fs.readFile(angularJsonUri);
		const angularJson = JSON.parse(decoder.decode(originalContentBytes));

		const projectKey = Object.keys(angularJson.projects)[0];
		if (!projectKey) { throw new Error('Chave do projeto não encontrada no angular.json'); }

		const buildOptions = angularJson.projects[projectKey].architect.build.options;
		angularJson.projects[projectKey].architect.build.builder = "@angular-devkit/build-angular:browser";
		delete buildOptions.browser;
		buildOptions.main = 'src/main.ts';
		buildOptions.assets = ["src/assets/images/favicon.ico", "src/assets"];
		buildOptions.styles = [
			"node_modules/@totvs/po-theme/css/po-theme-default-variables.min.css",
			"node_modules/@totvs/po-theme/css/po-theme-default.min.css",
			"node_modules/@po-ui/style/css/po-theme-core.min.css",
			"src/styles.css"
		];
		angularJson.projects[projectKey].architect.test.options.assets = buildOptions.assets;

		const modifiedContentBytes = encoder.encode(JSON.stringify(angularJson, null, 2));
		await vscode.workspace.fs.writeFile(angularJsonUri, modifiedContentBytes);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		return Promise.reject(`Falha ao configurar angular.json: ${errorMessage}`);
	}
}

export function deactivate() { }