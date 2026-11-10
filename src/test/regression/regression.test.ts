import { strict as assert } from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { templateMap } from '../../lib/templateMap';
import { configurePackageJson } from '../../lib/configurePackageJson';
import { configureAngularJson } from '../../lib/configureAngularJson';
import { buildSteps } from '../../lib/steps';
import { snapshot } from '../helpers/snapshot';

function sha256(content: string): string {
	return crypto.createHash('sha256').update(content).digest('hex');
}

describe('regressão do projeto gerado', () => {
	it('snapshot da lista ordenada de arquivos gerados', () => {
		const fixedFiles = ['angular.json', 'package.json', 'src/assets/data/appConfig.json', 'src/assets/images/favicon.ico'];
		const files = [...Object.keys(templateMap), ...fixedFiles].sort();
		snapshot('generated-files', files);

		assert.ok(files.includes('src/app/app.component.ts'));
		assert.ok(files.includes('src/assets/data/appConfig.json'));
	});

	it('snapshot do package.json resultante', () => {
		const fixture = {
			name: 'meu-app',
			dependencies: { '@angular/core': '0.0.0' },
			devDependencies: { '@angular/cli': '0.0.0' },
		};
		snapshot('package-json', configurePackageJson(fixture));
	});

	it('snapshot do angular.json resultante', () => {
		const fixture = {
			projects: {
				'meu-app': { architect: { build: { options: { outputPath: 'dist/meu-app' } } } },
			},
		};
		snapshot('angular-json', configureAngularJson(fixture));
	});

	it('snapshot do hash de cada template', () => {
		const hashes: Record<string, string> = {};
		for (const templateName of Object.values(templateMap)) {
			const abs = path.join(process.cwd(), 'src', 'templates', templateName);
			assert.ok(fs.existsSync(abs), `template ausente: ${abs}`);
			hashes[templateName] = sha256(fs.readFileSync(abs, 'utf8'));
		}
		snapshot('template-hashes', hashes);
	});

	it('não referencia @totvs/po-theme (descontinuado)', () => {
		const pkg = configurePackageJson({ dependencies: {}, devDependencies: {} });
		assert.ok(pkg.dependencies);
		assert.ok(pkg.devDependencies);
		assert.ok(!Object.keys(pkg.dependencies).includes('@totvs/po-theme'));
		assert.ok(!Object.keys(pkg.devDependencies).includes('@totvs/po-theme'));

		const angular = configureAngularJson({ projects: { x: { architect: { build: { options: {} } } } } });
		const build = angular.projects?.['x']?.architect?.build;
		assert.ok(build);
		assert.ok(Array.isArray(build.options?.styles));
		assert.ok(!(build.options?.styles as string[]).some((s) => s.includes('@totvs/po-theme')));

		const steps = buildSteps('x', '/pai', '/pai/x', false);
		assert.ok(!steps.some((s) => s.command.includes('@totvs/po-theme')));
	});
});
