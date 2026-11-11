import { strict as assert } from 'node:assert';
import { buildAppConfig } from '../../lib/appConfig';

describe('buildAppConfig', () => {
	it('gera JSON com nome, versão e productLine Protheus', () => {
		const parsed = JSON.parse(buildAppConfig('meu-projeto'));
		assert.strictEqual(parsed.name, 'meu-projeto');
		assert.strictEqual(parsed.version, '1.0.0');
		assert.strictEqual(parsed.api_baseUrl, '/');
		assert.strictEqual(parsed.productLine, 'Protheus');
	});
});
