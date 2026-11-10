import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
	files: 'out/test/integration/**/*.test.js',
	// O runner do @vscode/test-cli força `ui: 'tdd'` por padrão; definimos BDD para
	// manter `describe`/`it` consistentes com os testes unitários e de regressão.
	mocha: { ui: 'bdd' },
});
