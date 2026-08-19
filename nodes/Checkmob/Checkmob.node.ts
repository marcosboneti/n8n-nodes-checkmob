import type {
	ICredentialTestFunctions,
	ICredentialsDecrypted,
	IExecuteFunctions,
	INodeCredentialTestResult,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	INodeProperties,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import * as category from './resources/category';
import * as customField from './resources/customField';
import * as typeService from './resources/typeService';
import * as step from './resources/step';
import * as temperature from './resources/temperature';
import * as serviceStatus from './resources/serviceStatus';
import * as marketSector from './resources/marketSector';
import * as objective from './resources/objective';
import * as group from './resources/group';
import * as segment from './resources/segment';
import * as client from './resources/client';
import * as person from './resources/person';
import * as addressClient from './resources/addressClient';
import * as addressPerson from './resources/addressPerson';
import * as user from './resources/user';
import * as noteClient from './resources/noteClient';
import * as serviceOrder from './resources/serviceOrder';
import * as service from './resources/service';
import * as checklist from './resources/checklist';
import * as answerChecklist from './resources/answerChecklist';
import * as travel from './resources/travel';

interface ResourceModule {
	description: INodeProperties[];
	execute(
		this: IExecuteFunctions,
		i: number,
		baseUrl: string,
		authHeaders: IDataObject,
	): Promise<INodeExecutionData[]>;
}

const resources: Record<string, ResourceModule> = {
	category,
	customField,
	typeService,
	step,
	temperature,
	serviceStatus,
	marketSector,
	objective,
	group,
	segment,
	client,
	person,
	addressClient,
	addressPerson,
	user,
	noteClient,
	serviceOrder,
	service,
	checklist,
	answerChecklist,
	travel,
};

const resourceSelector: INodeProperties = {
	displayName: 'Recurso',
	name: 'resource',
	type: 'options',
	noDataExpression: true,
	options: [
		{ name: 'Categoria', value: 'category', description: 'Listar categorias' },
		{ name: 'Campo Personalizado', value: 'customField', description: 'Listar campos personalizados' },
		{ name: 'Cliente', value: 'client', description: 'Gerenciar clientes' },
		{ name: 'Endereço do Cliente', value: 'addressClient', description: 'Listar e substituir endereço do cliente' },
		{ name: 'Endereço de Pessoa', value: 'addressPerson', description: 'Buscar e substituir endereço de pessoa' },
		{ name: 'Etapa', value: 'step', description: 'Listar etapas' },
		{ name: 'Grupo', value: 'group', description: 'Gerenciar grupos' },
		{ name: 'Nota do Cliente', value: 'noteClient', description: 'Gerenciar notas do cliente' },
		{ name: 'Objetivo', value: 'objective', description: 'Listar objetivos' },
		{ name: 'Ordem de Serviço', value: 'serviceOrder', description: 'Gerenciar ordens de serviço' },
		{ name: 'Pessoa', value: 'person', description: 'Gerenciar pessoas' },
		{ name: 'Questionário', value: 'checklist', description: 'Consultar questionários e gerenciar vínculos' },
		{ name: 'Registro', value: 'service', description: 'Gerenciar registros (visitas)' },
		{ name: 'Respostas de Questionário', value: 'answerChecklist', description: 'Consultar respostas de questionários' },
		{ name: 'Segmento', value: 'segment', description: 'Gerenciar segmentos' },
		{ name: 'Setor de Mercado', value: 'marketSector', description: 'Listar setores de mercado' },
		{ name: 'Status de Serviço', value: 'serviceStatus', description: 'Listar status de serviço' },
		{ name: 'Temperatura', value: 'temperature', description: 'Listar temperaturas' },
		{ name: 'Tipo de Serviço', value: 'typeService', description: 'Listar tipos de serviço' },
		{ name: 'Deslocamento', value: 'travel', description: 'Consultar quilometragem, custo e aprovação de deslocamentos' },
		{ name: 'Usuário', value: 'user', description: 'Listar usuários e localização' },
	],
	default: 'category',
};


const languageSelector: INodeProperties = {
	displayName: 'Idioma',
	name: 'language',
	type: 'options',
	noDataExpression: true,
	options: [
		{ name: 'Português (pt-BR)', value: 'pt-BR' },
		{ name: 'English (en-US)', value: 'en-US' },
	],
	default: 'pt-BR',
	description: 'Idioma das mensagens de erro retornadas pela API',
};

export class Checkmob implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Checkmob',
		name: 'checkmob',
		icon: 'file:checkmob.png',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the Checkmob Field Service API v2',
		defaults: { name: 'Checkmob' },
		inputs: ['main'],
		outputs: ['main'],
		credentials: [{ name: 'checkmobApi', required: true, testedBy: 'testCheckmobApi' }],
		properties: [
			resourceSelector,
			languageSelector,
			...category.description,
			...customField.description,
			...typeService.description,
			...step.description,
			...temperature.description,
			...serviceStatus.description,
			...marketSector.description,
			...objective.description,
			...group.description,
			...segment.description,
			...client.description,
			...person.description,
			...addressClient.description,
			...addressPerson.description,
			...user.description,
			...noteClient.description,
			...serviceOrder.description,
			...service.description,
			...checklist.description,
			...answerChecklist.description,
			...travel.description,
		],
	};

	methods = {
		credentialTest: {
			async testCheckmobApi(
				this: ICredentialTestFunctions,
				credential: ICredentialsDecrypted,
			): Promise<INodeCredentialTestResult> {
				const creds = credential.data as { baseUrl: string; login: string; password: string };
				const baseUrl = creds.baseUrl.replace(/\/$/, '');

				try {
					const res = await fetch(`${baseUrl}/v2/token`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json', 'Accept-Language': 'pt-BR' },
						body: JSON.stringify({ login: creds.login, senha: creds.password }),
					});
					const data = (await res.json()) as { token_acesso?: string; detalhe?: string; titulo?: string };

					if (res.ok && data?.token_acesso) {
						return { status: 'OK', message: 'Autenticação realizada com sucesso.' };
					}

					const msg = data?.detalhe ?? data?.titulo ?? 'Login falhou. Verifique login e senha.';
					return { status: 'Error', message: msg };
				} catch (err) {
					return { status: 'Error', message: `Erro de conexão: ${(err as Error).message}` };
				}
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('checkmobApi');
		const baseUrl = (credentials.baseUrl as string).replace(/\/$/, '');

		const staticData = this.getWorkflowStaticData('node');
		const now = Date.now();
		const tokenExpiry = (staticData.tokenExpiry as number) ?? 0;

		if (!staticData.accessToken || now >= tokenExpiry) {
			// httpRequestWithAuthentication não se aplica aqui: este é o próprio login que
			// gera o token (n8n's preAuthentication não funciona nesta versão — ver credencial).
			// eslint-disable-next-line @n8n/community-nodes/no-http-request-with-manual-auth
			const loginResponse = await this.helpers.httpRequest({
				method: 'POST',
				url: `${baseUrl}/v2/token`,
				headers: { 'Content-Type': 'application/json', 'Accept-Language': 'pt-BR' },
				body: {
					login: credentials.login as string,
					senha: credentials.password as string,
				},
				json: true,
			});

			if (!loginResponse?.token_acesso) {
				throw new NodeOperationError(
					this.getNode(),
					'Login falhou. Verifique seu login e senha nas configurações da credencial.',
				);
			}

			staticData.accessToken = loginResponse.token_acesso as string;

			const expiraEm = loginResponse.expira_em as string | undefined;
			const expiryMs = expiraEm
				? new Date(expiraEm).getTime() - 60_000
				: now + 59 * 60 * 1000;
			staticData.tokenExpiry = expiryMs;
		}

		const token = staticData.accessToken as string;
		const lang = this.getNodeParameter('language', 0, 'pt-BR') as string;
		const authHeaders: IDataObject = {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
			'Accept-Language': lang,
		};

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const handler = resources[resource];

				if (!handler) {
					throw new NodeOperationError(this.getNode(), `Recurso desconhecido: "${resource}"`);
				}

				returnData.push(...(await handler.execute.call(this, i, baseUrl, authHeaders)));
			} catch (error) {
				if (this.continueOnFail()) {
					const err = error as Error & { description?: string };
					const json: IDataObject = { error: err.message };
					const statusMatch = err.message.match(/^HTTP (\d+)/);
					if (statusMatch) json.statusCode = parseInt(statusMatch[1], 10);
					if (err.description) {
						try { json.details = JSON.parse(err.description); } catch { json.details = err.description; }
					}
					returnData.push({ json, pairedItem: { item: i } });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
