import * as vscode from 'vscode';
import * as path from 'path';
import { dirname } from 'path';
import { TextDecoder, TextEncoder } from 'util';
import { scaffold, ScaffoldDeps } from './lib/scaffold';

// --- Adaptadores de I/O (VS Code). A lógica de negócio fica em `src/lib/`. ---

async function isGitRepository(directory: string): Promise<boolean> {
	try {
		await vscode.workspace.fs.stat(vscode.Uri.file(path.join(directory, '.git')));
		return true;
	} catch {
		return false;
	}
}

async function runCommand(command: string, cwd: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const task = new vscode.Task(
			{ type: 'shell', group: vscode.TaskGroup.Build },
			vscode.TaskScope.Workspace,
			command,
			'PO UI Project Creator',
			new vscode.ShellExecution(command, { cwd }),
		);
		task.presentationOptions = {
			reveal: vscode.TaskRevealKind.Always,
			showReuseMessage: false,
			clear: false,
		};

		const disposable = vscode.tasks.onDidEndTaskProcess((e) => {
			if (e.execution.task === task) {
				disposable.dispose();
				if (e.exitCode === 0) {
					resolve();
				} else {
					reject(new Error(`O comando '${command}' falhou com código de saída ${e.exitCode}.`));
				}
			}
		});

		vscode.tasks.executeTask(task);
	});
}

async function createDirectory(dirPath: string): Promise<void> {
	await vscode.workspace.fs.createDirectory(vscode.Uri.file(dirPath));
}

async function fileExists(filePath: string): Promise<boolean> {
	try {
		await vscode.workspace.fs.stat(vscode.Uri.file(filePath));
		return true;
	} catch {
		return false;
	}
}

async function rename(source: string, dest: string): Promise<void> {
	await vscode.workspace.fs.rename(vscode.Uri.file(source), vscode.Uri.file(dest), { overwrite: true });
}

async function readFile(filePath: string): Promise<string> {
	const bytes = await vscode.workspace.fs.readFile(vscode.Uri.file(filePath));
	return new TextDecoder('utf-8').decode(bytes);
}

async function readTemplate(absolutePath: string): Promise<string> {
	const bytes = await vscode.workspace.fs.readFile(vscode.Uri.file(absolutePath));
	return new TextDecoder('utf-8').decode(bytes);
}

async function writeFile(filePath: string, content: string): Promise<void> {
	await vscode.workspace.fs.createDirectory(vscode.Uri.file(dirname(filePath)));
	await vscode.workspace.fs.writeFile(vscode.Uri.file(filePath), new TextEncoder().encode(content));
}

export function activate(context: vscode.ExtensionContext): void {
	const disposable = vscode.commands.registerCommand('poui-project-creator.createProject', async () => {
		const projectName = await vscode.window.showInputBox({
			prompt: 'Qual é o nome do projeto?',
			placeHolder: 'ex: meu-projeto-poui',
			validateInput: (text) => (text ? null : 'O nome do projeto não pode ser vazio.'),
		});

		if (!projectName) {
			return;
		}

		const parentUri = await vscode.window.showOpenDialog({
			canSelectMany: false,
			canSelectFiles: false,
			canSelectFolders: true,
			openLabel: 'Selecione a pasta para criar o projeto',
		});

		if (!parentUri) {
			return;
		}

		const parentPath = parentUri[0].fsPath;
		const projectPath = path.join(parentPath, projectName);

		try {
			let progress: vscode.Progress<{ message?: string; increment?: number }> | undefined;

			const deps: ScaffoldDeps = {
				isGitRepository,
				runCommand,
				createDirectory,
				fileExists,
				rename,
				readFile,
				writeFile,
				readTemplate,
				onStep: (message) => progress?.report({ message }),
			};

			await vscode.window.withProgress(
				{
					location: vscode.ProgressLocation.Notification,
					title: `Criando projeto PO UI: ${projectName}`,
					cancellable: false,
				},
				async (p) => {
					progress = p;
					await scaffold({ projectName, parentPath, projectPath, extensionPath: context.extensionPath, deps });
				},
			);

			vscode.window.showInformationMessage(`Projeto '${projectName}' criado com sucesso!`);
			const openInNewWindow = 'Abrir em Nova Janela';
			vscode.window.showInformationMessage(`Deseja abrir o novo projeto?`, openInNewWindow).then((selection) => {
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

export function deactivate(): void {}
