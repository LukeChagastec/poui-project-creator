// Versões fixadas das dependências do projeto gerado. Fonte de verdade única:
// nenhum número de versão solto em configurePackageJson, configureAngularJson ou
// nos templates. Mudar qualquer valor aqui exige snapshot de regressão atualizado e E2E verde.
//
// Nota: `@totvs/po-theme` está descontinuado e não aparece aqui (nem no angular.json).

export const DEPENDENCIES: Record<string, string> = {
	'@angular/animations': '~21.0.3',
	'@angular/common': '~21.0.3',
	'@angular/compiler': '~21.0.3',
	'@angular/core': '~21.0.3',
	'@angular/forms': '~21.0.3',
	'@angular/platform-browser': '~21.0.3',
	'@angular/platform-browser-dynamic': '~21.0.3',
	'@angular/router': '~21.0.3',
	'@po-ui/ng-components': '^21.0.1',
	'@po-ui/ng-templates': '21.0.1',
	'@totvs/protheus-lib-core': '^19.0.3',
	'rxjs': '~7.8.0',
	'tslib': '^2.3.0',
};

export const DEV_DEPENDENCIES: Record<string, string> = {
	'@angular-devkit/build-angular': '~21.0.3',
	'@angular-devkit/schematics': '~21.0.0',
	'@angular/cli': '~21.0.3',
	'@angular/compiler-cli': '~21.0.0',
	'@po-ui/ng-templates': '^21.0.1',
	'jsdom': '^27.1.0',
	'typescript': '~5.9.3',
	'vitest': '^4.0.8',
};

export const OVERRIDES: Record<string, string> = {
	'@angular/animations': '$@angular/animations',
	'@angular/common': '$@angular/common',
	'@angular/compiler': '$@angular/compiler',
	'@angular/core': '$@angular/core',
	'@angular/forms': '$@angular/forms',
	'@angular/platform-browser': '$@angular/platform-browser',
	'@angular/platform-browser-dynamic': '$@angular/platform-browser-dynamic',
	'@angular/router': '$@angular/router',
};
