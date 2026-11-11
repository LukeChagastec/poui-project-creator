import { strict as assert } from 'node:assert';
import { configurePackageJson } from '../../lib/configurePackageJson';

describe('configurePackageJson', () => {
	it('mescla dependências sem perder as existentes', () => {
		const input = {
			name: 'meu-app',
			dependencies: { zonejs: '^1.0.0', '@angular/core': '0.0.0' },
			devDependencies: { ferramenta: '1.0.0' },
		};
		const result = configurePackageJson(input);
		assert.ok(result.dependencies);
		assert.ok(result.devDependencies);

		assert.strictEqual(result.dependencies['zonejs'], '^1.0.0'); // preserva
		assert.strictEqual(result.dependencies['@angular/core'], '~21.0.3'); // sobrescreve
		assert.strictEqual(result.dependencies['@po-ui/ng-components'], '^21.0.1'); // adiciona
		assert.strictEqual(result.devDependencies['ferramenta'], '1.0.0'); // preserva
		assert.strictEqual(result.devDependencies['@angular/cli'], '~21.0.3'); // adiciona
	});

	it('define a seção overrides', () => {
		const result = configurePackageJson({});
		assert.ok(result.overrides);
		assert.strictEqual(result.overrides['@angular/core'], '$@angular/core');
		assert.strictEqual(result.overrides['@angular/router'], '$@angular/router');
	});

	it('suporta package.json sem dependencies/devDependencies', () => {
		const result = configurePackageJson({ name: 'x' });
		assert.ok(result.dependencies);
		assert.ok(result.devDependencies);
		assert.strictEqual(result.dependencies['@angular/core'], '~21.0.3');
		assert.strictEqual(result.devDependencies['@angular/cli'], '~21.0.3');
	});

	it('não muta a entrada', () => {
		const input = { dependencies: { foo: '1.0.0' } };
		configurePackageJson(input);
		assert.deepStrictEqual(input, { dependencies: { foo: '1.0.0' } });
	});
});
