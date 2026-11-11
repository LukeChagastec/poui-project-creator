export interface Step {
	command: string;
	cwd: string;
	message: string;
}

interface StepSpec {
	command: string;
	cwd: string;
	label: string;
}

// Prefixo que executa o Angular CLI na versão 21 via npx. Usado em TODOS os
// comandos `ng` para que a extensão não dependa de um Angular CLI global
// (o `ng new` usa `--skip-install`, então não há `node_modules/.bin/ng` ainda).
const ANGULAR_CLI_NPX = 'npx -p @angular/cli@21 ng';

// Lista de comandos de shell executados na criação do projeto. O `git init` só
// entra quando a pasta de destino ainda não é um repositório Git.
//
// As mensagens são numeradas sequencialmente. O total soma os 2 passos finais do
// scaffold (configurar arquivos e npm install), que ficam fora daqui.
export function buildSteps(projectName: string, parentPath: string, projectPath: string, isGitRepo: boolean): Step[] {
	const specs: StepSpec[] = [
		{
			command: `${ANGULAR_CLI_NPX} new ${projectName} --style=css --skip-install`,
			cwd: parentPath,
			label: 'Criando estrutura com Angular CLI v21...',
		},
	];

	if (!isGitRepo) {
		specs.push({ command: 'git init', cwd: projectPath, label: 'Inicializando repositório Git...' });
	}

	specs.push(
		{ command: `${ANGULAR_CLI_NPX} add @po-ui/ng-components --skip-confirmation --sidemenu`, cwd: projectPath, label: 'Instalando componentes PO UI...' },
		{ command: `${ANGULAR_CLI_NPX} add @po-ui/ng-templates --skip-confirmation`, cwd: projectPath, label: 'Instalando templates PO UI...' },
		{ command: 'npm i @totvs/protheus-lib-core --legacy-peer-deps', cwd: projectPath, label: 'Instalando Protheus Lib Core...' },
		{ command: `${ANGULAR_CLI_NPX} generate environments`, cwd: projectPath, label: 'Gerando environments...' },
		{ command: `${ANGULAR_CLI_NPX} generate module modules/lib-core-dev`, cwd: projectPath, label: 'Criando módulo de desenvolvimento...' },
		{ command: `${ANGULAR_CLI_NPX} generate service services/lib-core-dev-interceptor`, cwd: projectPath, label: 'Criando service interceptor...' },
	);

	const total = specs.length + 2;
	return specs.map((spec, index) => ({
		command: spec.command,
		cwd: spec.cwd,
		message: `Passo ${index + 1}/${total}: ${spec.label}`,
	}));
}
