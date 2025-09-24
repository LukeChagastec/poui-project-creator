import * as vscode from 'vscode';
import * as path from 'path';
import { dirname } from 'path';

// --- Conteúdo dos Arquivos ---
// (Certifique-se de que todas as suas constantes de conteúdo do script Python original estejam aqui)

const lib_core_dev_module_content = `
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LibCoreDevInterceptorService } from '../../services/lib-core-dev-interceptor.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

@NgModule({
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LibCoreDevInterceptorService,
      multi: true,
    },
  ],
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class LibCoreDevModule { }
`;

const app_initializer_content = `
// src/app/app-initializer.ts
import { inject } from '@angular/core';
import { ProAppConfigService } from '@totvs/protheus-lib-core';

// A função agora tem a assinatura correta: () => Promise<any>
// Ela usa 'inject' para obter o serviço de que precisa.
export const initializeApp = (): Promise<any> => {
    const proAppConfigService = inject(ProAppConfigService);
    return proAppConfigService.loadAppConfig();
};
`;

const env_local_content = `
// src/environments/environment.local.ts
export const localEnvironment = {
    user: "admin",
    password: "1234",
    tenantId: '99,01'
};
`;

const env_dev_content = `
import { localEnvironment } from "./environment.local";

export const environment = {
    production: false,
    apiUrl: 'http://localhost:9000/rest',
    path: {
        login: "/api/oauth2/v1/token"
    },
    ...localEnvironment,
    protheusLibCore: 'dev',
    iniApp: () => {
    }
};
`;

const env_prod_content = `
import { initializeApp } from "../app/app-initializer";

export const environment = {
    production: true,
    apiUrl: '',
    path: {
        login: ''
    },
    protheusLibCore: 'pro',
    iniApp: initializeApp
};
`;

const app_config_ts_content = `
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { ApplicationConfig, importProvidersFrom, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { PoHttpRequestModule, PoI18nConfig, PoI18nModule, PoNotificationModule } from '@po-ui/ng-components';
import { environment } from '../environments/environment';
import { LibCoreDevModule } from './modules/lib-core-dev/lib-core-dev.module';
import { ProtheusLibCoreModule } from '@totvs/protheus-lib-core';

const i18nConfig: PoI18nConfig = {
  default: {
    language: 'pt-BR',
    context: 'general'
  },
  contexts: {
    general: {}
  }
};

const protheusLibCore = environment.protheusLibCore === 'dev'
  ? LibCoreDevModule
  : ProtheusLibCoreModule;

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: "Window", useValue: window },
    importProvidersFrom([
      PoHttpRequestModule,
      PoI18nModule.config(i18nConfig),
      PoNotificationModule,
      protheusLibCore
    ]),
    [provideAppInitializer(environment.iniApp)],
    provideZoneChangeDetection({ eventCoalescing: true }),
  ]
};
`;

const interceptor_content = `
import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpHeaders, HttpRequest, HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom, from, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LibCoreDevInterceptorService {

  constructor(private http: HttpClient) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (req.url.includes(environment.path.login)) {
        return next.handle(req);
    }

    let requestToHandle = req;

    if (!req.url.startsWith('http') && !req.url.startsWith(environment.apiUrl)) {
        requestToHandle = req.clone({
            url: environment.apiUrl + req.url
        });
    }

    return from(this.montaHeader()).pipe(
        switchMap(headers => {
            const requestWithHeaders = requestToHandle.clone({ headers });
            return next.handle(requestWithHeaders);
        })
    );
  }

  private async obterToken(): Promise<any> {
    let retorno: any = {};

    if (!environment.production) {
	  const url = \`\${environment.apiUrl}\${environment.path.login}?grant_type=password&password=\${environment.password}&username=\${environment.user}\`;
      retorno = await firstValueFrom(this.http.post<any>(url, {}));
    }

    return retorno;
  }

  async montaHeader(): Promise<HttpHeaders> {
    let headersObj: { [key: string]: string };
    if (!environment.production) {
      const token = await this.obterToken();
      headersObj = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        "Accept-Encoding": "gzip, deflate, br",
        'tenantId': environment.tenantId,
        'Authorization': 'Bearer ' + token.access_token
      };
    } else {
      headersObj = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        "Accept-Encoding": "gzip, deflate, br"
      };
    }
    return new HttpHeaders(headersObj);
  }
}
`;

const app_component_ts_content = `
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import {
  PoMenuItem,
  PoMenuModule,
  PoPageModule,
  PoToolbarModule,
} from '@po-ui/ng-components';
import { ProAppConfigService } from '@totvs/protheus-lib-core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    PoToolbarModule,
    PoMenuModule,
    PoPageModule,
    RouterModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  readonly menus: Array<PoMenuItem> = [
    { label: 'Home', action: this.onClick.bind(this) },
  ];
 
  constructor(
    private proAppConfigService: ProAppConfigService
  ) {
    if (!this.proAppConfigService.insideProtheus()) {
      sessionStorage.setItem("insideProtheus", "0");
    }
    else {
      sessionStorage.setItem("insideProtheus", "1");
    }
  }

  private onClick() {
    alert('Clicked in menu item');
  }
}
`;


/**
 * Função de Ativação: Chamada quando a extensão é ativada.
 */
export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('poui-project-creator.createProject', async () => {

		const projectName = await vscode.window.showInputBox({
			prompt: "Qual é o nome do projeto?",
			placeHolder: "ex: meu-projeto-poui",
			validateInput: text => text ? null : "O nome do projeto não pode ser vazio."
		});

		if (!projectName) { return; }

		const parentUri = await vscode.window.showOpenDialog({
			canSelectMany: false,
			canSelectFiles: false,
			canSelectFolders: true,
			openLabel: 'Selecione a pasta para criar o projeto'
		});

		if (!parentUri) { return; }

		const parentPath = parentUri[0].fsPath;
		const projectPath = path.join(parentPath, projectName);

		try {
			// Inicia a automação com uma notificação de progresso
			await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: `Criando projeto PO UI: ${projectName}`,
				cancellable: false
			}, async (progress) => {

				const steps = [
					{ command: `ng new ${projectName} --directory=${projectName} --style=css --skip-install --ssr=false`, cwd: parentPath, message: 'Passo 1/10: Criando estrutura com Angular CLI...' },
					{ command: 'ng add @po-ui/ng-components --skip-confirmation --sidemenu', cwd: projectPath, message: 'Passo 2/10: Instalando componentes PO UI...' },
					{ command: 'ng add @po-ui/ng-templates --skip-confirmation', cwd: projectPath, message: 'Passo 3/10: Instalando templates PO UI...' },
					{ command: 'npm i @totvs/protheus-lib-core --force', cwd: projectPath, message: 'Passo 4/10: Instalando Protheus Lib Core...' },
					{ command: 'npm i @totvs/po-theme', cwd: projectPath, message: 'Passo 5/10: Instalando tema Protheus...' },
					{ command: 'ng generate environments', cwd: projectPath, message: 'Passo 6/10: Gerando environments...' },
					{ command: 'ng generate module modules/lib-core-dev', cwd: projectPath, message: 'Passo 7/10: Criando módulo de desenvolvimento...' },
					{ command: 'ng generate service services/lib-core-dev-interceptor', cwd: projectPath, message: 'Passo 8/10: Criando service interceptor...' }
				];

				for (const step of steps) {
					progress.report({ message: step.message });
					await runCommandInTerminal(step.message, step.command, step.cwd);
				}

				progress.report({ message: 'Passo 9/10: Configurando arquivos do projeto...' });

				const assetsPath = path.join(projectPath, 'src', 'assets');
				await vscode.workspace.fs.createDirectory(vscode.Uri.file(path.join(assetsPath, 'data')));
				await vscode.workspace.fs.createDirectory(vscode.Uri.file(path.join(assetsPath, 'images')));

				const faviconSourceUri = vscode.Uri.file(path.join(projectPath, 'src', 'favicon.ico'));
				const faviconDestUri = vscode.Uri.file(path.join(assetsPath, 'images', 'favicon.ico'));
				await vscode.workspace.fs.rename(faviconSourceUri, faviconDestUri, { overwrite: true });

				const appConfigContent = JSON.stringify({
					name: projectName, version: "1.0.0", api_baseUrl: "/", "productLine": "Protheus" }, null, 4);
				await writeFile(path.join(assetsPath, 'data', 'appConfig.json'), appConfigContent);

					await configureAngularJson(projectPath);

					const filesToCreate = {
						'src/app/app-initializer.ts': app_initializer_content,
						'src/environments/environment.local.ts': env_local_content,
						'src/environments/environment.development.ts': env_dev_content,
						'src/environments/environment.ts': env_prod_content,
						'src/app/app.config.ts': app_config_ts_content,
						'src/app/services/lib-core-dev-interceptor.service.ts': interceptor_content,
						'src/app/app.component.ts': app_component_ts_content,
						'src/app/modules/lib-core-dev/lib-core-dev.module.ts': lib_core_dev_module_content,
					};

					for(const [relativePath, content] of Object.entries(filesToCreate)) {
						await writeFile(path.join(projectPath, relativePath), content);
			}

				progress.report({ message: 'Passo 10/10: Instalando todas as dependências (npm install)...' });
			await runCommandInTerminal('NPM Install', 'npm install', projectPath);
		});

	vscode.window.showInformationMessage(`Projeto '${projectName}' criado com sucesso!`);
	const openInNewWindow = 'Abrir em Nova Janela';
	vscode.window.showInformationMessage(`Deseja abrir o novo projeto?`, openInNewWindow).then(selection => {
		if (selection === openInNewWindow) {
			vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(projectPath), { forceNewWindow: true });
		}
	});

} catch (error) {
	const errorMessage = error instanceof Error ? error.message : String(error);
	vscode.window.showErrorMessage(`Ocorreu um erro durante a criação do projeto: ${errorMessage}`);
}
	});

context.subscriptions.push(disposable);
}

// --- Funções de Ajuda ---

async function runCommandInTerminal(terminalName: string, command: string, cwd: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const terminal = vscode.window.createTerminal({ name: terminalName, cwd: cwd });
		terminal.sendText(command);
		terminal.sendText('exit $?');

		const disposable = vscode.window.onDidCloseTerminal(t => {
			if (t === terminal) {
				disposable.dispose();
				if (t.exitStatus && t.exitStatus.code !== 0) {
					reject(`O comando '${command}' falhou. Verifique o terminal '${terminalName}' para detalhes.`);
				} else {
					resolve();
				}
			}
		});
	});
}

async function writeFile(filePath: string, content: string): Promise<void> {
	try {
		const encoder = new TextEncoder();
		const contentBytes = encoder.encode(content);
		const fileUri = vscode.Uri.file(filePath);

		await vscode.workspace.fs.createDirectory(vscode.Uri.file(dirname(filePath)));
		await vscode.workspace.fs.writeFile(fileUri, contentBytes);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		return Promise.reject(`Falha ao escrever o arquivo ${path.basename(filePath)}: ${errorMessage}`);
	}
}

async function configureAngularJson(projectPath: string): Promise<void> {
	const decoder = new TextDecoder('utf-8');
	const encoder = new TextEncoder();
	const angularJsonUri = vscode.Uri.file(path.join(projectPath, 'angular.json'));

	try {
		const originalContentBytes = await vscode.workspace.fs.readFile(angularJsonUri);
		const angularJson = JSON.parse(decoder.decode(originalContentBytes));

		const projectKey = Object.keys(angularJson.projects)[0];
		if (!projectKey) { throw new Error('Chave do projeto não encontrada no angular.json'); }

		const buildOptions = angularJson.projects[projectKey].architect.build.options;
		angularJson.projects[projectKey].architect.build.builder = "@angular-devkit/build-angular:browser";
		delete buildOptions.browser;
		buildOptions.main = 'src/main.ts';
		buildOptions.assets = ["src/assets/images/favicon.ico", "src/assets"];
		buildOptions.styles = [
			"node_modules/@totvs/po-theme/css/po-theme-default-variables.min.css",
			"node_modules/@totvs/po-theme/css/po-theme-default.min.css",
			"node_modules/@po-ui/style/css/po-theme-core.min.css",
			"src/styles.css"
		];
		angularJson.projects[projectKey].architect.test.options.assets = buildOptions.assets;

		const modifiedContentBytes = encoder.encode(JSON.stringify(angularJson, null, 2));
		await vscode.workspace.fs.writeFile(angularJsonUri, modifiedContentBytes);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		return Promise.reject(`Falha ao configurar angular.json: ${errorMessage}`);
	}
}

export function deactivate() { }