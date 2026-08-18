import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { apiRequest, assertApiSuccess } from '../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Operação',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['noteClient'] } },
		options: [
			{ name: 'Listar', value: 'list', description: 'Listar notas do cliente', action: 'Listar notas do cliente' },
			{ name: 'Buscar', value: 'get', description: 'Buscar nota por ID do cliente', action: 'Buscar nota do cliente' },
			{ name: 'Criar', value: 'post', description: 'Criar uma nova nota', action: 'Criar nota do cliente' },
			{ name: 'Editar', value: 'put', description: 'Editar uma nota existente', action: 'Editar nota do cliente' },
			{ name: 'Excluir', value: 'delete', description: 'Excluir uma nota pelo ID', action: 'Excluir nota do cliente' },
		],
		default: 'list',
	},

	// ── Buscar ───────────────────────────────────────────────────────────────────
	{
		displayName: 'ID do Cliente',
		name: 'noteClientId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: { show: { resource: ['noteClient'], operation: ['get'] } },
		description: 'ID do cliente para buscar as notas',
	},

	// ── Criar ────────────────────────────────────────────────────────────────────
	{
		displayName: 'ID do Cliente',
		name: 'noteClientId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: { show: { resource: ['noteClient'], operation: ['post'] } },
		description: 'ID do cliente ao qual a nota será vinculada',
	},
	{
		displayName: 'Nota',
		name: 'noteText',
		type: 'string',
		typeOptions: { rows: 3 },
		default: '',
		required: true,
		displayOptions: { show: { resource: ['noteClient'], operation: ['post'] } },
	},

	// ── Editar ───────────────────────────────────────────────────────────────────
	{
		displayName: 'ID da Nota',
		name: 'noteId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: { show: { resource: ['noteClient'], operation: ['put'] } },
		description: 'ID da nota a editar',
	},
	{
		displayName: 'ID do Cliente',
		name: 'noteClientId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: { show: { resource: ['noteClient'], operation: ['put'] } },
	},
	{
		displayName: 'Nota',
		name: 'noteText',
		type: 'string',
		typeOptions: { rows: 3 },
		default: '',
		required: true,
		displayOptions: { show: { resource: ['noteClient'], operation: ['put'] } },
	},

	// ── Excluir ──────────────────────────────────────────────────────────────────
	{
		displayName: 'ID da Nota',
		name: 'noteId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: { show: { resource: ['noteClient'], operation: ['delete'] } },
		description: 'ID da nota a excluir',
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
		const { statusCode, body } = await apiRequest.call(this, {
			method: 'POST',
			url: `${baseUrl}/api/v1/noteClient/list`,
			headers: authHeaders,
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	if (operation === 'get') {
		const idClient = this.getNodeParameter('noteClientId', i) as number;

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'GET',
			url: `${baseUrl}/api/v1/noteClient/get?idClient=${idClient}`,
			headers: authHeaders,
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	if (operation === 'post') {
		const idClient = this.getNodeParameter('noteClientId', i) as number;
		const note = this.getNodeParameter('noteText', i) as string;

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'POST',
			url: `${baseUrl}/api/v1/noteClient/post`,
			headers: authHeaders,
			body: { idClient, note },
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	if (operation === 'put') {
		const id = this.getNodeParameter('noteId', i) as number;
		const idClient = this.getNodeParameter('noteClientId', i) as number;
		const note = this.getNodeParameter('noteText', i) as string;

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'PUT',
			url: `${baseUrl}/api/v1/noteClient/put`,
			headers: authHeaders,
			body: { id, idClient, note },
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	if (operation === 'delete') {
		const id = this.getNodeParameter('noteId', i) as number;

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'DELETE',
			url: `${baseUrl}/api/v1/noteClient/delete?id=${id}`,
			headers: authHeaders,
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	throw new NodeOperationError(this.getNode(), `Operação desconhecida: ${operation}`);
}
