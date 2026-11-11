import { DEPENDENCIES, DEV_DEPENDENCIES, OVERRIDES } from './versions';

export interface PackageJson {
	name?: string;
	version?: string;
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
	overrides?: Record<string, string>;
	[key: string]: unknown;
}

// Função pura: recebe o package.json do projeto gerado (parseado) e devolve uma
// cópia com dependencies/devDependencies/overrides ajustados a partir de versions.ts.
// Não muta a entrada.
//
// Ex.: configurePackageJson({ name: 'meu-app' }).dependencies['@angular/core'] === '~21.2.26'
export function configurePackageJson(packageJson: PackageJson): PackageJson {
	const result = structuredClone(packageJson);

	result.dependencies = { ...(result.dependencies ?? {}), ...DEPENDENCIES };
	result.devDependencies = { ...(result.devDependencies ?? {}), ...DEV_DEPENDENCIES };
	result.overrides = { ...OVERRIDES };

	return result;
}
