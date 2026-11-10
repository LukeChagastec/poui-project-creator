import { strict as assert } from 'node:assert';
import { templateMap } from '../../lib/templateMap';

describe('templateMap', () => {
	it('mapeia os 8 arquivos do projeto gerado', () => {
		assert.strictEqual(Object.keys(templateMap).length, 8);
		assert.strictEqual(templateMap['src/app/app.component.ts'], 'app-component-ts.ts.template');
		assert.strictEqual(templateMap['src/app/app.config.ts'], 'app-config-ts.ts.template');
		assert.strictEqual(templateMap['src/app/app-initializer.ts'], 'app-initializer.ts.template');
		assert.strictEqual(templateMap['src/environments/environment.ts'], 'env-prod.ts.template');
		assert.strictEqual(templateMap['src/app/modules/lib-core-dev/lib-core-dev.module.ts'], 'lib-core-dev-module.ts.template');
	});

	it('todo destino é um caminho relativo dentro de src/', () => {
		for (const dest of Object.keys(templateMap)) {
			assert.ok(!dest.startsWith('/'), `destino absoluto: ${dest}`);
			assert.ok(dest.startsWith('src/'), `destino fora de src/: ${dest}`);
		}
	});

	it('todo template termina em .ts.template', () => {
		for (const tpl of Object.values(templateMap)) {
			assert.ok(tpl.endsWith('.ts.template'), `extensão inesperada: ${tpl}`);
		}
	});
});
