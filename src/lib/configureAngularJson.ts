export interface AngularProject {
	architect?: {
		build?: {
			options?: Record<string, unknown>;
			builder?: string;
			configurations?: Record<string, Record<string, unknown>>;
		};
	};
}

export interface AngularJson {
	projects?: Record<string, AngularProject>;
}

// Orçamento do build: o bundle inicial do PO UI + Angular (~3 MB) excede o
// orçamento padrão do Angular (500 kB de warning, 1 MB de erro).
const BUILD_BUDGETS = [
	{ type: 'initial', maximumWarning: '3mb', maximumError: '5mb' },
	{ type: 'anyComponentStyle', maximumWarning: '6kb', maximumError: '10kb' },
];

// Função pura: recebe o angular.json do projeto gerado (parseado) e devolve uma
// cópia com o builder, as opções de build e o budget ajustados para o Angular 21
// com PO UI. Não muta a entrada. Lança erro se não houver chave de projeto.
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
		styles: ['node_modules/@po-ui/style/css/po-theme-default.min.css', 'src/styles.css'],
		polyfills: ['zone.js'],
	};
	build.builder = '@angular-devkit/build-angular:application';

	const configurations = build.configurations ?? {};
	configurations.production = { ...(configurations.production ?? {}), budgets: BUILD_BUDGETS };
	build.configurations = configurations;

	architect.build = build;
	project.architect = architect;

	return result;
}
