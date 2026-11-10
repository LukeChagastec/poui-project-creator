import { strict as assert } from 'node:assert';
import { configureAngularJson, AngularJson } from '../../lib/configureAngularJson';

const fixture = (): AngularJson => ({
	projects: {
		'meu-app': {
			architect: {
				build: { options: { outputPath: 'dist/meu-app' }, builder: 'antigo' },
			},
		},
	},
});

describe('configureAngularJson', () => {
	it('aplica o builder de application e as opções de build', () => {
		const result = configureAngularJson(fixture());
		const build = result.projects?.['meu-app']?.architect?.build;
		assert.ok(build);
		assert.ok(build.options);

		assert.strictEqual(build.builder, '@angular-devkit/build-angular:application');
		assert.strictEqual(build.options.outputPath, 'dist/meu-app');
		assert.strictEqual(build.options.index, 'src/index.html');
		assert.strictEqual(build.options.browser, 'src/main.ts');
		assert.strictEqual(build.options.tsConfig, 'tsconfig.app.json');
		assert.deepStrictEqual(build.options.polyfills, ['zone.js']);
		assert.deepStrictEqual(build.options.assets, ['src/assets/images/favicon.ico', 'src/assets']);

		assert.ok(Array.isArray(build.options.styles));
		const styles = build.options.styles as string[];
		assert.ok(styles.includes('node_modules/@po-ui/style/css/po-theme-core.min.css'));
		assert.ok(styles.includes('src/styles.css'));
	});

	it('lança erro se não houver chave de projeto', () => {
		assert.throws(() => configureAngularJson({ projects: {} }), /Chave do projeto não encontrada/);
	});

	it('lança erro quando projects está ausente', () => {
		assert.throws(() => configureAngularJson({}), /Chave do projeto não encontrada/);
	});

	it('cria architect/build quando ausentes', () => {
		const result = configureAngularJson({ projects: { x: {} } });
		const build = result.projects?.['x']?.architect?.build;
		assert.ok(build);
		assert.ok(build.options);
		assert.strictEqual(build.builder, '@angular-devkit/build-angular:application');
		assert.strictEqual(build.options.outputPath, 'dist/x');
	});

	it('não muta a entrada', () => {
		const input = fixture();
		configureAngularJson(input);
		assert.strictEqual(input.projects?.['meu-app']?.architect?.build?.builder, 'antigo');
	});
});
