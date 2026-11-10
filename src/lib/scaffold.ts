import * as path from 'path';
import { templateMap } from './templateMap';
import { buildSteps } from './steps';
import { buildAppConfig } from './appConfig';
import { configurePackageJson } from './configurePackageJson';
import { configureAngularJson } from './configureAngularJson';

// Todo I/O de `scaffold` é injetado para que a orquestração possa rodar sem o
// `vscode` (testes unitários, E2E). `extension.ts` fornece os adaptadores reais.
export interface ScaffoldDeps {
	isGitRepository(directory: string): Promise<boolean>;
	runCommand(command: string, cwd: string): Promise<void>;
	createDirectory(dirPath: string): Promise<void>;
	fileExists(filePath: string): Promise<boolean>;
	rename(source: string, dest: string): Promise<void>;
	readFile(filePath: string): Promise<string>;
	writeFile(filePath: string, content: string): Promise<void>;
	readTemplate(absolutePath: string): Promise<string>;
	onStep?: (message: string) => void;
}

export interface ScaffoldOptions {
	projectName: string;
	parentPath: string;
	projectPath: string;
	extensionPath: string;
	deps: ScaffoldDeps;
}

export async function scaffold(options: ScaffoldOptions): Promise<void> {
	const { projectName, parentPath, projectPath, extensionPath, deps } = options;

	const isGitRepo = await deps.isGitRepository(projectPath);
	const steps = buildSteps(projectName, parentPath, projectPath, isGitRepo);
	const totalSteps = steps.length + 2;

	for (const step of steps) {
		deps.onStep?.(step.message);
		await deps.runCommand(step.command, step.cwd);
	}

	deps.onStep?.(`Passo ${steps.length + 1}/${totalSteps}: Configurando arquivos do projeto...`);

	const assetsPath = path.join(projectPath, 'src', 'assets');
	await deps.createDirectory(path.join(assetsPath, 'data'));
	await deps.createDirectory(path.join(assetsPath, 'images'));

	const faviconSource = path.join(projectPath, 'src', 'favicon.ico');
	const faviconDest = path.join(assetsPath, 'images', 'favicon.ico');
	if (await deps.fileExists(faviconSource)) {
		await deps.rename(faviconSource, faviconDest);
	}

	await deps.writeFile(path.join(assetsPath, 'data', 'appConfig.json'), buildAppConfig(projectName));

	const angularJsonRaw = await deps.readFile(path.join(projectPath, 'angular.json'));
	const angularJson = configureAngularJson(JSON.parse(angularJsonRaw));
	await deps.writeFile(path.join(projectPath, 'angular.json'), JSON.stringify(angularJson, null, 2));

	const packageJsonRaw = await deps.readFile(path.join(projectPath, 'package.json'));
	const packageJson = configurePackageJson(JSON.parse(packageJsonRaw));
	await deps.writeFile(path.join(projectPath, 'package.json'), JSON.stringify(packageJson, null, 2));

	for (const [relativePath, templateName] of Object.entries(templateMap)) {
		const content = await deps.readTemplate(path.join(extensionPath, 'src', 'templates', templateName));
		await deps.writeFile(path.join(projectPath, relativePath), content);
	}

	deps.onStep?.(`Passo ${totalSteps}/${totalSteps}: Instalando todas as dependências (npm install)...`);
	await deps.runCommand('npm install --force', projectPath);
}
