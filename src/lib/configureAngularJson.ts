export interface AngularProject {
	architect?: {
		build?: {
			options?: Record<string, unknown>;
			builder?: string;
		};
	};
}

export interface AngularJson {
	projects?: Record<string, AngularProject>;
}

// Função pura: recebe o angular.json do projeto gerado (parseado) e devolve uma
// cópia com o builder e as opções de build ajustadas para o Angular 21. Não muta a entrada.
// Lança erro se não houver chave de projeto.
//
// Ex.: configureAngularJson({ projects: { app: { architect: { build: {} } } } })
export function configureAngularJson(angularJson: AngularJson): AngularJson {
	const result = structuredClone(angularJson);

	const projects = result.projects ?? {};
	const projectKey = Object.keys(projects)[0];
	if (!projectKey) {
		throw new Error('Chave do projeto não encontrada no angular.json');
	}

	const project = projects[projectKey];
	const architect = project.architect ?? {};
	const build = architect.build ?? {};

	build.options = {
		outputPath: `dist/${projectKey}`,
		index: 'src/index.html',
		browser: 'src/main.ts',
		tsConfig: 'tsconfig.app.json',
		assets: ['src/assets/images/favicon.ico', 'src/assets'],
		styles: ['node_modules/@po-ui/style/css/po-theme-core.min.css', 'src/styles.css'],
		polyfills: ['zone.js'],
	};
	build.builder = '@angular-devkit/build-angular:application';

	architect.build = build;
	project.architect = architect;

	return result;
}
