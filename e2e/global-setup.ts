import { exec } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { scaffold } from '../out/lib/scaffold';
import type { ScaffoldDeps } from '../out/lib/scaffold';

// Diretório fixo, conhecido também por `e2e/serve.mjs`. Não usamos `process.env`:
// o globalSetup do Playwright roda em processo separado do webServer, então env vars
// definidas aqui não propagam.
const E2E_PARENT_DIR = path.join(os.tmpdir(), 'poui-e2e');
const E2E_PROJECT_NAME = 'poui-e2e-app';
const E2E_APP_DIR = path.join(E2E_PARENT_DIR, E2E_PROJECT_NAME);

function runCommand(command: string, cwd: string): Promise<void> {
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
function makeNodeDeps(): ScaffoldDeps {
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

export default async function globalSetup(): Promise<void> {
	fs.rmSync(E2E_PARENT_DIR, { recursive: true, force: true });
	fs.mkdirSync(E2E_PARENT_DIR, { recursive: true });

	await scaffold({
		projectName: E2E_PROJECT_NAME,
		parentPath: E2E_PARENT_DIR,
		projectPath: E2E_APP_DIR,
		extensionPath: process.cwd(),
		deps: makeNodeDeps(),
	});

	// Instala e builda o projeto gerado; qualquer falha derruba a suíte.
	await runCommand('npm install --force', E2E_APP_DIR);
	await runCommand('npx ng build', E2E_APP_DIR);
}
