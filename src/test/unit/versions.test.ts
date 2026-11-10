import { strict as assert } from 'node:assert';
import { DEPENDENCIES, DEV_DEPENDENCIES, OVERRIDES } from '../../lib/versions';

describe('versions (versões do projeto gerado)', () => {
	it('fixa o ecossistema Angular 21', () => {
		assert.strictEqual(DEPENDENCIES['@angular/core'], '~21.0.3');
		assert.strictEqual(DEPENDENCIES['@angular/router'], '~21.0.3');
		assert.strictEqual(DEPENDENCIES['@angular/common'], '~21.0.3');
	});

	it('fixa PO UI e Protheus', () => {
		assert.strictEqual(DEPENDENCIES['@po-ui/ng-components'], '^21.0.1');
		assert.strictEqual(DEPENDENCIES['@po-ui/ng-templates'], '21.0.1');
		assert.strictEqual(DEPENDENCIES['@totvs/protheus-lib-core'], '^19.0.3');
	});

	it('não contém @totvs/po-theme (descontinuado)', () => {
		assert.ok(!Object.keys(DEPENDENCIES).includes('@totvs/po-theme'));
		assert.ok(!Object.keys(DEV_DEPENDENCIES).includes('@totvs/po-theme'));
	});

	it('define devDependencies do build Angular 21', () => {
		assert.strictEqual(DEV_DEPENDENCIES['@angular/cli'], '~21.0.3');
		assert.strictEqual(DEV_DEPENDENCIES['@angular-devkit/build-angular'], '~21.0.3');
		assert.strictEqual(DEV_DEPENDENCIES['typescript'], '~5.9.3');
	});

	it('define overrides para forçar a resolução dos pacotes aninhados do Angular', () => {
		assert.strictEqual(Object.keys(OVERRIDES).length, 8);
		assert.strictEqual(OVERRIDES['@angular/core'], '$@angular/core');
	});
});
