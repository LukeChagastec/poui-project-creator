import { spawn } from 'node:child_process';

const appDir = process.env.E2E_APP_DIR;
if (!appDir) {
	console.error('E2E_APP_DIR não definido; o global-setup deve gerar o projeto antes.');
	process.exit(1);
}

const ng = spawn('npx', ['ng', 'serve', '--port', '4200'], {
	cwd: appDir,
	stdio: 'inherit',
	shell: true,
});

for (const sig of ['SIGINT', 'SIGTERM']) {
	process.on(sig, () => ng.kill(sig));
}

ng.on('exit', (code) => process.exit(code ?? 0));
