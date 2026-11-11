import { strict as assert } from 'node:assert';
import { DEPENDENCIES, DEV_DEPENDENCIES, OVERRIDES } from '../../lib/versions';

describe('versions (versões do projeto gerado)', () => {
	it('fixa o ecossistema Angular 21.2', () => {
		assert.strictEqual(DEPENDENCIES['@angular/core'], '~21.2.26');
		assert.strictEqual(DEPENDENCIES['@angular/router'], '~21.2.26');
		assert.strictEqual(DEPENDENCIES['@angular/common'], '~21.2.26');
	});

	it('fixa PO UI 21.37 e Protheus 21', () => {
		assert.strictEqual(DEPENDENCIES['@po-ui/ng-components'], '^21.37.0');
		assert.strictEqual(DEPENDENCIES['@po-ui/ng-templates'], '^21.37.0');
		assert.strictEqual(DEPENDENCIES['@totvs/protheus-lib-core'], '^21.1.4');
	});

	it('declara @angular/cdk (peer de @po-ui/ng-components)', () => {
		assert.strictEqual(DEPENDENCIES['@angular/cdk'], '~21.2.14');
		assert.strictEqual(OVERRIDES['@angular/cdk'], '$@angular/cdk');
	});

	it('alinhar rxjs e tslib ao exigido pelo PO UI 21', () => {
		assert.strictEqual(DEPENDENCIES['rxjs'], '~7.8.1');
		assert.strictEqual(DEPENDENCIES['tslib'], '^2.6.2');
	});

	it('não contém @totvs/po-theme (descontinuado)', () => {
		assert.ok(!Object.keys(DEPENDENCIES).includes('@totvs/po-theme'));
		assert.ok(!Object.keys(DEV_DEPENDENCIES).includes('@totvs/po-theme'));
	});

	it('define devDependencies do build Angular 21.2', () => {
		assert.strictEqual(DEV_DEPENDENCIES['@angular/cli'], '~21.2.29');
		assert.strictEqual(DEV_DEPENDENCIES['@angular-devkit/build-angular'], '~21.2.29');
		assert.strictEqual(DEV_DEPENDENCIES['typescript'], '~5.9.3');
	});

	it('define overrides para forçar a resolução dos pacotes aninhados do Angular', () => {
		assert.strictEqual(Object.keys(OVERRIDES).length, 9);
		assert.strictEqual(OVERRIDES['@angular/core'], '$@angular/core');
	});
});
