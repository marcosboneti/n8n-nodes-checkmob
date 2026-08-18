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
import * as client from './resources/client';
import * as addressClient from './resources/addressClient';
import * as addressPerson from './resources/addressPerson';
import * as user from './resources/user';
import * as typeService from './resources/typeService';
import * as step from './resources/step';
import * as temperature from './resources/temperature';
import * as serviceStatus from './resources/serviceStatus';
import * as marketSector from './resources/marketSector';
import * as group from './resources/group';
import * as noteClient from './resources/noteClient';
import * as objective from './resources/objective';
import * as serviceOrder from './resources/serviceOrder';
import * as person from './resources/person';
import * as service from './resources/service';
import * as checklist from './resources/checklist';
import * as answerChecklist from './resources/answerChecklist';
import * as segment from './resources/segment';

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
	client,
	addressClient,
	addressPerson,
	user,
	typeService,
	step,
	temperature,
	serviceStatus,
	marketSector,
	group,
	noteClient,
	objective,
	serviceOrder,
	person,
	service,
	checklist,
	answerChecklist,
	segment,
};

const resourceSelector: INodeProperties = {
	displayName: 'Recurso',
	name: 'resource',
	type: 'options',
	noDataExpression: true,
	options: [
		{ name: 'Categoria', value: 'category', description: 'Método para listar categorias' },
		{ name: 'Campo Personalizado', value: 'customField', description: 'Método para listar campos personalizados' },
		{ name: 'Cliente', value: 'client', description: 'Gerenciar clientes' },
		{ name: 'Endereço do Cliente', value: 'addressClient', description: 'Buscar e editar endereço do cliente' },
		{ name: 'Endereço de Pessoa', value: 'addressPerson', description: 'Buscar e editar endereço de pessoa' },
		{ name: 'Etapa', value: 'step', description: 'Método para listar etapas' },
		{ name: 'Grupo', value: 'group', description: 'Gerenciar grupos' },
		{ name: 'Nota do Cliente', value: 'noteClient', description: 'Gerenciar notas do cliente' },
		{ name: 'Objetivo', value: 'objective', description: 'Buscar e listar objetivos' },
		{ name: 'Ordem de Serviço', value: 'serviceOrder', description: 'Gerenciar ordens de serviço' },
		{ name: 'Segmento', value: 'segment', description: 'Gerenciar segmentos' },
		{ name: 'Setor de Mercado', value: 'marketSector', description: 'Método para listar setores de mercado' },
		{ name: 'Status de Serviço', value: 'serviceStatus', description: 'Método para listar status de serviço' },
		{ name: 'Questionario', value: 'checklist', description: 'Gerenciar questionários' },
		{ name: 'Questionario Servico', value: 'answerChecklist', description: 'Respostas de checklists' },
		{ name: 'Registro', value: 'service', description: 'Gerenciar registros' },
		{ name: 'Temperatura', value: 'temperature', description: 'Método para listar temperaturas' },
		{ name: 'Pessoa', value: 'person', description: 'Gerenciar pessoas' },
		{ name: 'Tipo de Serviço', value: 'typeService', description: 'Método para listar tipos de serviço' },
		{ name: 'Usuário', value: 'user', description: 'Método para listar Usuários' },
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
		description: 'Interact with the Checkmob Field Service API',
		defaults: { name: 'Checkmob' },
		inputs: ['main'],
		outputs: ['main'],
		credentials: [{ name: 'checkmobApi', required: true, testedBy: 'testCheckmobApi' }],
		properties: [
			resourceSelector,
			languageSelector,
			...category.description,
			...customField.description,
			...client.description,
			...addressClient.description,
			...addressPerson.description,
			...user.description,
			...typeService.description,
			...step.description,
			...temperature.description,
			...serviceStatus.description,
			...marketSector.description,
			...group.description,
			...noteClient.description,
			...objective.description,
			...serviceOrder.description,
			...person.description,
			...service.description,
			...checklist.description,
			...answerChecklist.description,
			...segment.description,
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
					const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json', 'Accept-Language': 'pt-BR' },
						body: JSON.stringify({ login: creds.login, password: creds.password }),
					});
					const data = await res.json() as { success?: boolean; errors?: string[] };

					if (res.ok && data?.success === true) {
						return { status: 'OK', message: 'Autenticação realizada com sucesso.' };
					}

					const msg = Array.isArray(data?.errors) && data.errors!.length > 0
						? data.errors![0]
						: 'Login falhou. Verifique e-mail e senha.';
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
			const doLogin = async () => this.helpers.httpRequest({
				method: 'POST',
				url: `${baseUrl}/api/v1/auth/login`,
				headers: { 'Content-Type': 'application/json', 'Accept-Language': 'pt-BR' },
				body: {
					login: credentials.login as string,
					password: credentials.password as string,
				},
				json: true,
			});
			const loginResponse = await doLogin();

			if (!loginResponse?.success || !loginResponse?.data?.token?.accessToken) {
				throw new NodeOperationError(
					this.getNode(),
					'Login falhou. Verifique seu e-mail e senha nas configurações da credencial.',
				);
			}

			staticData.accessToken = loginResponse.data.token.accessToken as string;

			const expiresIn = loginResponse.data.token.expiresIn as string | undefined;
			const expiryMs = expiresIn
				? new Date(expiresIn).getTime() - 60_000
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
