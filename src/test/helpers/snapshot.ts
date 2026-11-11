import * as fs from 'node:fs';
import * as path from 'node:path';

const SNAPSHOT_DIR = path.join(process.cwd(), 'src', 'test', 'regression', '__snapshots__');

// Snapshot leve: compara o valor serializado contra `__snapshots__/<name>.json`.
// Em modo UPDATE_SNAPSHOTS=1, (re)escreve o arquivo em vez de comparar.
export function snapshot(name: string, value: unknown): void {
	const file = path.join(SNAPSHOT_DIR, `${name}.json`);
	const serialized = `${JSON.stringify(value, null, 2)}\n`;

	if (process.env.UPDATE_SNAPSHOTS === '1') {
		fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
		fs.writeFileSync(file, serialized, 'utf8');
		return;
	}

	if (!fs.existsSync(file)) {
		throw new Error(`Snapshot ausente: ${file}. Rode UPDATE_SNAPSHOTS=1 npm run test:regression para gerar.`);
	}

	const expected = fs.readFileSync(file, 'utf8');
	if (expected !== serialized) {
		throw new Error(`Snapshot divergente: ${name}. Rode UPDATE_SNAPSHOTS=1 npm run test:regression para atualizar.`);
	}
}
