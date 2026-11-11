// Versões fixadas das dependências do projeto gerado. Fonte de verdade única:
// nenhum número de versão solto em configurePackageJson, configureAngularJson ou
// nos templates. Mudar qualquer valor aqui exige snapshot de regressão atualizado e E2E verde.
//
// Nota: `@totvs/po-theme` está descontinuado e não aparece aqui (nem no angular.json).

export const DEPENDENCIES: Record<string, string> = {
	'@angular/animations': '~21.2.26',
	'@angular/cdk': '~21.2.14',
	'@angular/common': '~21.2.26',
	'@angular/compiler': '~21.2.26',
	'@angular/core': '~21.2.26',
	'@angular/forms': '~21.2.26',
	'@angular/platform-browser': '~21.2.26',
	'@angular/platform-browser-dynamic': '~21.2.26',
	'@angular/router': '~21.2.26',
	'@po-ui/ng-components': '^21.37.0',
	'@po-ui/ng-templates': '^21.37.0',
	'@totvs/protheus-lib-core': '^21.1.4',
	'rxjs': '~7.8.1',
	'tslib': '^2.6.2',
};

export const DEV_DEPENDENCIES: Record<string, string> = {
	'@angular-devkit/build-angular': '~21.2.29',
	'@angular-devkit/schematics': '~21.2.29',
	'@angular/cli': '~21.2.29',
	'@angular/compiler-cli': '~21.2.26',
	'@po-ui/ng-templates': '^21.37.0',
	'jsdom': '^27.1.0',
	'typescript': '~5.9.3',
	'vitest': '^4.0.8',
};

export const OVERRIDES: Record<string, string> = {
	'@angular/animations': '$@angular/animations',
	'@angular/cdk': '$@angular/cdk',
	'@angular/common': '$@angular/common',
	'@angular/compiler': '$@angular/compiler',
	'@angular/core': '$@angular/core',
	'@angular/forms': '$@angular/forms',
	'@angular/platform-browser': '$@angular/platform-browser',
	'@angular/platform-browser-dynamic': '$@angular/platform-browser-dynamic',
	'@angular/router': '$@angular/router',
};
