// Conteúdo do appConfig.json gravado em `src/assets/data/appConfig.json` do projeto gerado.
export function buildAppConfig(projectName: string): string {
	return JSON.stringify(
		{
			name: projectName,
			version: '1.0.0',
			api_baseUrl: '/',
			productLine: 'Protheus',
		},
		null,
		4,
	);
}
