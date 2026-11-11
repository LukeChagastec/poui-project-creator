// Mapeia o caminho de destino (dentro do projeto gerado) para o arquivo de template.
// A primeira linha de cada template é um comentário `// src/...` com o destino.
export const templateMap: Record<string, string> = {
	'src/app/app-initializer.ts': 'app-initializer.ts.template',
	'src/environments/environment.local.ts': 'env-local.ts.template',
	'src/environments/environment.development.ts': 'env-dev.ts.template',
	'src/environments/environment.ts': 'env-prod.ts.template',
	'src/app/app.config.ts': 'app-config-ts.ts.template',
	'src/app/services/lib-core-dev-interceptor.service.ts': 'interceptor.ts.template',
	'src/app/app.component.ts': 'app-component-ts.ts.template',
	'src/app/app.html': 'app.html.template',
	'src/app/modules/lib-core-dev/lib-core-dev.module.ts': 'lib-core-dev-module.ts.template',
};
