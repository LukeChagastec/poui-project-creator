import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Mesmo diretório fixo usado pelo e2e/global-setup.ts (o globalSetup roda em
// processo separado, então env vars não propagam até aqui).
const appDir = path.join(os.tmpdir(), 'poui-e2e', 'poui-e2e-app');

if (!fs.existsSync(path.join(appDir, 'package.json'))) {
	console.error(`Projeto E2E não encontrado em ${appDir}; o global-setup deve gerá-lo antes.`);
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
