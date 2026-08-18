import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { apiRequest, assertApiSuccess } from '../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Operação',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['user'] } },
		options: [
			{ name: 'Buscar', value: 'get', description: 'Buscar um usuário pelo ID', action: 'Buscar usuário' },
			{ name: 'Listar', value: 'list', description: 'Listar usuários com paginação', action: 'Listar usuários' },
			{ name: 'Localizações', value: 'location', description: 'Buscar as localizações de um usuário pelo ID', action: 'Buscar localizações do usuário' },
		],
		default: 'get',
	},
	{
		displayName: 'ID do Usuário',
		name: 'idUser',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: { show: { resource: ['user'], operation: ['get', 'location'] } },
		description: 'ID do usuário',
	},
	{
		displayName: 'Número de Registros',
		name: 'numberOfRows',
		type: 'number',
		default: 50,
		required: true,
		typeOptions: { minValue: 1 },
		displayOptions: { show: { resource: ['user'], operation: ['list'] } },
		description: 'Quantidade de registros a retornar (mínimo 1)',
	},
	{
		displayName: 'Registros a Pular',
		name: 'numberOfRowsSkipped',
		type: 'number',
		default: 0,
		required: true,
		typeOptions: { minValue: 0 },
		displayOptions: { show: { resource: ['user'], operation: ['list'] } },
		description: 'Quantidade de registros a pular (paginação)',
	},
	{
		displayName: 'Busca',
		name: 'search',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['user'], operation: ['list'] } },
		description: 'Filtro de busca por nome ou e-mail',
	},
];

export async function execute(
	this: IExecuteFunctions,
	i: number,
	baseUrl: string,
	authHeaders: IDataObject,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', i) as string;

	if (operation === 'get') {
		const idUser = this.getNodeParameter('idUser', i) as number;

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'GET',
			url: `${baseUrl}/api/v1/user/get?idUser=${idUser}`,
			headers: authHeaders,
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	if (operation === 'list') {
		const numberOfRows = this.getNodeParameter('numberOfRows', i) as number;
		const numberOfRowsSkipped = this.getNodeParameter('numberOfRowsSkipped', i) as number;
		const search = this.getNodeParameter('search', i, '') as string;

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'POST',
			url: `${baseUrl}/api/v1/user/list`,
			headers: authHeaders,
			body: { numberOfRows, numberOfRowsSkipped, search },
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	if (operation === 'location') {
		const idUser = this.getNodeParameter('idUser', i) as number;

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'GET',
			url: `${baseUrl}/api/v1/user/location?idUser=${idUser}`,
			headers: authHeaders,
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	throw new NodeOperationError(this.getNode(), `Operação desconhecida: ${operation}`);
}
