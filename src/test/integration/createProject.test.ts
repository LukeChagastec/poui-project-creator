import { strict as assert } from 'node:assert';
import * as vscode from 'vscode';
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as os from 'node:os';
import { activate } from '../../extension';

type TaskEndEvent = { execution: { task: vscode.Task }; exitCode: number };

// Monkey-patch na fronteira do `vscode` (único ponto de mock de API externa), sem `any`.
function patch(target: object, key: string, value: unknown): () => void {
	const record = target as Record<string, unknown>;
	const original = record[key];
	record[key] = value;
	return () => {
		record[key] = original;
	};
}

// Testa o comando registrado no Extension Host com prompts e execução de shell
// stubados. A árvore de arquivos é criada em um diretório temporário.
describe('comando poui-project-creator.createProject', () => {
	let parentDir: string;

	beforeEach(() => {
		parentDir = fs.mkdtempSync(path.join(os.tmpdir(), 'poui-int-'));
		const projectDir = path.join(parentDir, 'meu-projeto');
		// Pré-cria a árvore que o `ng new` criaria (o shell é stubado).
		fs.mkdirSync(path.join(projectDir, 'src'), { recursive: true });
		fs.writeFileSync(
			path.join(projectDir, 'package.json'),
			JSON.stringify({ name: 'meu-projeto', dependencies: {}, devDependencies: {} }),
		);
		fs.writeFileSync(
			path.join(projectDir, 'angular.json'),
			JSON.stringify({ projects: { 'meu-projeto': { architect: { build: { options: {} } } } } }),
		);
		fs.writeFileSync(path.join(projectDir, 'src', 'favicon.ico'), 'ico');
	});

	afterEach(() => {
		fs.rmSync(parentDir, { recursive: true, force: true });
	});

	it('registra o comando e cria a árvore de arquivos esperada', async () => {
		let endCb: ((e: TaskEndEvent) => void) | undefined;

		const restore = [
			patch(vscode.window, 'showInputBox', async () => 'meu-projeto'),
			patch(vscode.window, 'showOpenDialog', async () => [vscode.Uri.file(parentDir)]),
			patch(vscode.window, 'showInformationMessage', async () => undefined),
			patch(vscode.tasks, 'onDidEndTaskProcess', (cb: (e: TaskEndEvent) => void) => {
				endCb = cb;
				return { dispose() {} };
			}),
			patch(vscode.tasks, 'executeTask', async (task: vscode.Task) => {
				setTimeout(() => endCb?.({ execution: { task }, exitCode: 0 }), 0);
			}),
		];

		const extensionPath = path.resolve(__dirname, '..', '..', '..');
		const context = {
			subscriptions: [] as Array<{ dispose(): void }>,
			extensionPath,
		} as unknown as vscode.ExtensionContext;

		try {
			activate(context);
			await vscode.commands.executeCommand('poui-project-creator.createProject');
		} finally {
			restore.reverse().forEach((restoreFn) => restoreFn());
			context.subscriptions.forEach((disposable) => disposable.dispose());
		}

		const projectDir = path.join(parentDir, 'meu-projeto');
		assert.ok(fs.existsSync(path.join(projectDir, 'src', 'assets', 'data', 'appConfig.json')), 'appConfig.json criado');
		assert.ok(fs.existsSync(path.join(projectDir, 'src', 'app', 'app.component.ts')), 'template app.component.ts criado');
		assert.ok(fs.existsSync(path.join(projectDir, 'src', 'app', 'app-initializer.ts')), 'template app-initializer.ts criado');
		assert.ok(fs.existsSync(path.join(projectDir, 'src', 'assets', 'images', 'favicon.ico')), 'favicon movido');

		const angularJson = JSON.parse(fs.readFileSync(path.join(projectDir, 'angular.json'), 'utf8')) as {
			projects: Record<string, { architect: { build: { builder: string } } }>;
		};
		assert.strictEqual(
			angularJson.projects['meu-projeto'].architect.build.builder,
			'@angular-devkit/build-angular:application',
		);
	});
});
