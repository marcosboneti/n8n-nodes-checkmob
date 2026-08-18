import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { apiRequest, assertApiSuccess } from '../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Operação',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['group'] } },
		options: [
			{ name: 'Listar', value: 'list', description: 'Listar grupos com paginação', action: 'Listar grupos' },
			{ name: 'Buscar', value: 'get', description: 'Buscar grupo pelo ID', action: 'Buscar grupo' },
			{ name: 'Criar', value: 'post', description: 'Criar um novo grupo', action: 'Criar grupo' },
			{ name: 'Editar', value: 'put', description: 'Editar um grupo existente', action: 'Editar grupo' },
		],
		default: 'list',
	},
	{
		displayName: 'Número de Registros',
		name: 'groupNumberOfRows',
		type: 'number',
		default: 50,
		required: true,
		typeOptions: { minValue: 1 },
		displayOptions: { show: { resource: ['group'], operation: ['list'] } },
		description: 'Quantidade de registros a retornar (mínimo 1)',
	},
	{
		displayName: 'Registros a Pular',
		name: 'groupNumberOfRowsSkipped',
		type: 'number',
		default: 0,
		required: true,
		typeOptions: { minValue: 0 },
		displayOptions: { show: { resource: ['group'], operation: ['list'] } },
		description: 'Quantidade de registros a pular (paginação)',
	},
	{
		displayName: 'ID do Grupo',
		name: 'groupId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: { show: { resource: ['group'], operation: ['get'] } },
		description: 'ID do grupo a buscar',
	},
	{
		displayName: 'Nome',
		name: 'groupName',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { resource: ['group'], operation: ['post', 'put'] } },
		description: 'Nome do grupo',
	},
	{
		displayName: 'IDs dos Usuários (separados por vírgula)',
		name: 'groupIdsUser',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { resource: ['group'], operation: ['post', 'put'] } },
		description: 'IDs dos usuários que fazem parte do grupo. Ex: 1,2,3',
		placeholder: '1,2,3',
	},
	{
		displayName: 'ID de Origem',
		name: 'groupIdOrigem',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: { show: { resource: ['group'], operation: ['post'] } },
		description: 'ID de origem do grupo',
	},
	{
		displayName: 'ID do Grupo',
		name: 'groupIdEdit',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: { show: { resource: ['group'], operation: ['put'] } },
		description: 'ID do grupo a editar',
	},
];

export async function execute(
	this: IExecuteFunctions,
	i: number,
	baseUrl: string,
	authHeaders: IDataObject,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', i) as string;

	if (operation === 'list') {
		const numberOfRows = this.getNodeParameter('groupNumberOfRows', i) as number;
		const numberOfRowsSkipped = this.getNodeParameter('groupNumberOfRowsSkipped', i) as number;

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'POST',
			url: `${baseUrl}/api/v1/group/list`,
			headers: authHeaders,
			body: { numberOfRows, numberOfRowsSkipped },
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	if (operation === 'get') {
		const groupId = this.getNodeParameter('groupId', i) as number;

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'GET',
			url: `${baseUrl}/api/v1/group/get?idGroup=${groupId}`,
			headers: authHeaders,
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	if (operation === 'post') {
		const name = this.getNodeParameter('groupName', i) as string;
		const idsUserRaw = this.getNodeParameter('groupIdsUser', i) as string;
		const idsUser = idsUserRaw.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
		const idOrigem = this.getNodeParameter('groupIdOrigem', i) as number;

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'POST',
			url: `${baseUrl}/api/v1/group/post`,
			headers: authHeaders,
			body: { name, idsUser, idOrigem },
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	if (operation === 'put') {
		const idGroup = this.getNodeParameter('groupIdEdit', i) as number;
		const name = this.getNodeParameter('groupName', i) as string;
		const idsUserRaw = this.getNodeParameter('groupIdsUser', i) as string;
		const idsUser = idsUserRaw.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'PUT',
			url: `${baseUrl}/api/v1/group/put`,
			headers: authHeaders,
			body: { idGroup, name, idsUser },
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	throw new NodeOperationError(this.getNode(), `Operação desconhecida: ${operation}`);
}
