import { strict as assert } from 'node:assert';
import { scaffold, ScaffoldDeps } from '../../lib/scaffold';

interface Rec {
	files: Map<string, string>;
	commands: string[];
	dirs: string[];
	renamed: Array<[string, string]>;
}

function makeDeps(overrides: Partial<ScaffoldDeps> = {}): { deps: ScaffoldDeps; rec: Rec } {
	const rec: Rec = { files: new Map(), commands: [], dirs: [], renamed: [] };
	const deps: ScaffoldDeps = {
		isGitRepository: async () => false,
		runCommand: async (command, cwd) => {
			rec.commands.push(`${cwd}: ${command}`);
		},
		createDirectory: async (dirPath) => {
			rec.dirs.push(dirPath);
		},
		fileExists: async (filePath) => filePath.endsWith('favicon.ico'),
		rename: async (source, dest) => {
			rec.renamed.push([source, dest]);
		},
		readFile: async (filePath) => {
			if (filePath.endsWith('package.json')) {
				return JSON.stringify({ name: 'app', dependencies: {}, devDependencies: {} });
			}
			if (filePath.endsWith('angular.json')) {
				return JSON.stringify({ projects: { app: { architect: { build: { options: {} } } } } });
			}
			throw new Error(`arquivo inesperado: ${filePath}`);
		},
		writeFile: async (filePath, content) => {
			rec.files.set(filePath, content);
		},
		readTemplate: async (absolutePath) => `conteúdo de ${absolutePath}`,
		...overrides,
	};
	return { deps, rec };
}

const opts = {
	projectName: 'app',
	parentPath: '/pai',
	projectPath: '/pai/app',
	extensionPath: '/ext',
};

describe('scaffold', () => {
	it('grava appConfig.json, angular.json e package.json', async () => {
		const { deps, rec } = makeDeps();
		await scaffold({ ...opts, deps });

		const appConfig = JSON.parse(rec.files.get('/pai/app/src/assets/data/appConfig.json')!);
		assert.strictEqual(appConfig.name, 'app');
		assert.strictEqual(appConfig.productLine, 'Protheus');

		const angularJson = JSON.parse(rec.files.get('/pai/app/angular.json')!);
		assert.strictEqual(angularJson.projects.app.architect.build.builder, '@angular-devkit/build-angular:application');

		const packageJson = JSON.parse(rec.files.get('/pai/app/package.json')!);
		assert.strictEqual(packageJson.dependencies['@angular/core'], '~21.2.26');
	});

	it('escreve os templates crus, sem substituição', async () => {
		const { deps, rec } = makeDeps();
		await scaffold({ ...opts, deps });

		assert.strictEqual(
			rec.files.get('/pai/app/src/app/app-initializer.ts'),
			'conteúdo de /ext/src/templates/app-initializer.ts.template',
		);
		assert.strictEqual(Object.keys(templateDestinations(rec)).length, 9);
	});

	it('cria os diretórios de assets', async () => {
		const { deps, rec } = makeDeps();
		await scaffold({ ...opts, deps });

		assert.ok(rec.dirs.includes('/pai/app/src/assets/data'));
		assert.ok(rec.dirs.includes('/pai/app/src/assets/images'));
	});

	it('renomeia o favicon quando existe', async () => {
		const { deps, rec } = makeDeps({ fileExists: async () => true });
		await scaffold({ ...opts, deps });

		assert.deepStrictEqual(rec.renamed, [['/pai/app/src/favicon.ico', '/pai/app/src/assets/images/favicon.ico']]);
	});

	it('não renomeia o favicon quando não existe', async () => {
		const { deps, rec } = makeDeps({ fileExists: async () => false });
		await scaffold({ ...opts, deps });

		assert.strictEqual(rec.renamed.length, 0);
	});

	it('inclui git init quando não é repositório e termina com npm install --force', async () => {
		const { deps, rec } = makeDeps({ isGitRepository: async () => false });
		await scaffold({ ...opts, deps });

		const commands = rec.commands.map((c) => c.split(': ')[1]);
		assert.ok(commands.includes('git init'));
		assert.strictEqual(commands[commands.length - 1], 'npm install --force');
	});

	it('omite git init quando já é repositório', async () => {
		const { deps, rec } = makeDeps({ isGitRepository: async () => true });
		await scaffold({ ...opts, deps });

		const commands = rec.commands.map((c) => c.split(': ')[1]);
		assert.ok(!commands.includes('git init'));
	});

	it('reporta progresso via onStep quando fornecido', async () => {
		const messages: string[] = [];
		const { deps } = makeDeps({ onStep: (m) => messages.push(m) });
		await scaffold({ ...opts, deps });

		assert.ok(messages.length > 0, 'onStep deveria ser chamado');
		assert.ok(messages.some((m) => m.includes('Instalando todas as dependências')));
	});
});

function templateDestinations(rec: Rec): Record<string, string> {
	const out: Record<string, string> = {};
	for (const [filePath, content] of rec.files) {
		if (content.startsWith('conteúdo de /ext/src/templates/')) {
			out[filePath] = content;
		}
	}
	return out;
}
