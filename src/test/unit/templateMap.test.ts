import { strict as assert } from 'node:assert';
import { templateMap } from '../../lib/templateMap';

describe('templateMap', () => {
	it('mapeia os 9 arquivos do projeto gerado', () => {
		assert.strictEqual(Object.keys(templateMap).length, 9);
		assert.strictEqual(templateMap['src/app/app.ts'], 'app.ts.template');
		assert.strictEqual(templateMap['src/app/app.html'], 'app.html.template');
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

	it('todo template termina em .template', () => {
		for (const tpl of Object.values(templateMap)) {
			assert.ok(tpl.endsWith('.template'), `extensão inesperada: ${tpl}`);
		}
	});
});
