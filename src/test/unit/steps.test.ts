import { strict as assert } from 'node:assert';
import { buildSteps } from '../../lib/steps';

describe('buildSteps', () => {
	it('começa com o ng new via Angular CLI 21', () => {
		const steps = buildSteps('app', '/pai', '/pai/app', false);
		assert.strictEqual(steps[0].command, 'npx -p @angular/cli@21 ng new app --style=css --skip-install');
		assert.strictEqual(steps[0].cwd, '/pai');
	});

	it('inclui git init quando não é repositório', () => {
		const steps = buildSteps('app', '/pai', '/pai/app', false);
		assert.strictEqual(steps[1].command, 'git init');
		assert.strictEqual(steps[1].cwd, '/pai/app');
	});

	it('omite git init quando já é repositório', () => {
		const steps = buildSteps('app', '/pai', '/pai/app', true);
		assert.ok(!steps.some((s) => s.command === 'git init'));
		assert.strictEqual(steps[1].command, 'ng add @po-ui/ng-components --skip-confirmation --sidemenu');
	});

	it('termina nos passos de geração do Angular (npm install é do scaffold)', () => {
		const steps = buildSteps('app', '/pai', '/pai/app', false);
		const last = steps[steps.length - 1];
		assert.strictEqual(last.command, 'ng generate service services/lib-core-dev-interceptor');
	});

	it('numera os passos sequencialmente, sem lacunas', () => {
		for (const isGitRepo of [false, true]) {
			const steps = buildSteps('app', '/pai', '/pai/app', isGitRepo);
			steps.forEach((step, index) => {
				const number = Number(/^Passo (\d+)\//.exec(step.message)?.[1]);
				assert.strictEqual(number, index + 1, step.message);
			});
		}
	});

	it('reporta o total de passos incluindo configurar e npm install', () => {
		const steps = buildSteps('app', '/pai', '/pai/app', false);
		const total = Number(/^Passo \d+\/(\d+)/.exec(steps[0].message)?.[1]);
		assert.strictEqual(total, steps.length + 2);
	});
});
