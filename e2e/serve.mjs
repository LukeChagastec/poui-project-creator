import { exec, spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { scaffold } = require('../out/lib/scaffold.js');

// Diretório fixo do projeto gerado. O Playwright sobe o `webServer` ANTES do
// `globalSetup`, então a geração precisa acontecer aqui, dentro do comando do
// próprio webServer (que fica vivo enquanto o Playwright aguarda a `url`).
const PARENT_DIR = path.join(os.tmpdir(), 'poui-e2e');
const PROJECT_NAME = 'poui-e2e-app';
const APP_DIR = path.join(PARENT_DIR, PROJECT_NAME);

function runCommand(command, cwd) {
	return new Promise((resolve, reject) => {
		exec(command, { cwd, env: process.env }, (error, _stdout, stderr) => {
			if (error) {
				reject(new Error(`Comando falhou (${command}): ${stderr || error.message}`));
			} else {
				resolve();
			}
		});
	});
}

// Adaptadores de I/O reais (Node), sem `vscode` — reusa a mesma orquestração da extensão.
function makeNodeDeps() {
	return {
		isGitRepository: async (dir) => fs.existsSync(path.join(dir, '.git')),
		runCommand,
		createDirectory: async (dirPath) => {
			fs.mkdirSync(dirPath, { recursive: true });
		},
		fileExists: async (filePath) => fs.existsSync(filePath),
		rename: async (source, dest) => {
			fs.mkdirSync(path.dirname(dest), { recursive: true });
			fs.renameSync(source, dest);
		},
		readFile: async (filePath) => fs.readFileSync(filePath, 'utf8'),
		writeFile: async (filePath, content) => {
			fs.mkdirSync(path.dirname(filePath), { recursive: true });
			fs.writeFileSync(filePath, content, 'utf8');
		},
		readTemplate: async (absolutePath) => fs.readFileSync(absolutePath, 'utf8'),
	};
}

async function generateApp() {
	fs.rmSync(PARENT_DIR, { recursive: true, force: true });
	fs.mkdirSync(PARENT_DIR, { recursive: true });

	await scaffold({
		projectName: PROJECT_NAME,
		parentPath: PARENT_DIR,
		projectPath: APP_DIR,
		extensionPath: process.cwd(),
		deps: makeNodeDeps(),
	});

	// Instala e builda o projeto gerado; qualquer falha derruba a suíte.
	await runCommand('npm install --force', APP_DIR);
	await runCommand('npx ng build', APP_DIR);
}

async function main() {
	console.log('Gerando o projeto E2E (ng new + dependências + build; pode demorar alguns minutos)...');
	await generateApp();

	const ng = spawn('npx', ['ng', 'serve', '--port', '4200'], {
		cwd: APP_DIR,
		stdio: 'inherit',
		shell: true,
	});

	for (const sig of ['SIGINT', 'SIGTERM']) {
		process.on(sig, () => ng.kill(sig));
	}

	ng.on('exit', (code) => process.exit(code ?? 0));
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
});
