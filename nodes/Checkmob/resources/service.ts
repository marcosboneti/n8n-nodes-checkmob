import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { apiRequest, assertApiSuccess } from '../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Operação',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['service'] } },
		options: [
			{ name: 'Buscar', value: 'get', description: 'Buscar registro pelo ID', action: 'Buscar registro' },
			{ name: 'Listar', value: 'list', description: 'Listar registros com filtros', action: 'Listar registros' },
			{ name: 'Editar', value: 'put', description: 'Editar informações do registro', action: 'Editar registro' },
		],
		default: 'list',
	},

	// ── Buscar ───────────────────────────────────────────────────────────────────
	{
		displayName: 'ID do Registro',
		name: 'serviceId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: { show: { resource: ['service'], operation: ['get'] } },
	},

	// ── Listar ───────────────────────────────────────────────────────────────────
	{
		displayName: 'Número de Registros',
		name: 'svcNumberOfRows',
		type: 'number',
		default: 50,
		required: true,
		typeOptions: { minValue: 1 },
		displayOptions: { show: { resource: ['service'], operation: ['list'] } },
		description: 'Quantidade de registros a retornar (mínimo 1)',
	},
	{
		displayName: 'Registros a Pular',
		name: 'svcNumberOfRowsSkipped',
		type: 'number',
		default: 0,
		required: true,
		typeOptions: { minValue: 0 },
		displayOptions: { show: { resource: ['service'], operation: ['list'] } },
	},
	{
		displayName: 'Filtros',
		name: 'svcFilters',
		type: 'collection',
		placeholder: 'Adicionar filtro',
		default: {},
		displayOptions: { show: { resource: ['service'], operation: ['list'] } },
		options: [
			{ displayName: 'Data de Atualização', name: 'updateDate', type: 'dateTime', default: '' },
			{ displayName: 'ID da Ordem de Serviço', name: 'idServiceOrder', type: 'number', default: 0 },
			{ displayName: 'ID do Cliente', name: 'idClient', type: 'number', default: 0 },
		],
	},

	// ── Editar ───────────────────────────────────────────────────────────────────
	{
		displayName: 'ID do Registro',
		name: 'serviceId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: { show: { resource: ['service'], operation: ['put'] } },
	},
	{
		displayName: 'ID do Cliente',
		name: 'svcIdClient',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: { show: { resource: ['service'], operation: ['put'] } },
	},
	{
		displayName: 'ID do Objetivo',
		name: 'svcIdObjective',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: { show: { resource: ['service'], operation: ['put'] } },
	},
	{
		displayName: 'Campos Opcionais',
		name: 'svcPutOptional',
		type: 'collection',
		placeholder: 'Adicionar campo',
		default: {},
		displayOptions: { show: { resource: ['service'], operation: ['put'] } },
		options: [
			{ displayName: 'Checkin', name: 'checkin', type: 'dateTime', default: '' },
			{ displayName: 'Checkout', name: 'checkout', type: 'dateTime', default: '' },
			{ displayName: 'Comentário', name: 'comment', type: 'string', default: '' },
			{ displayName: 'Latitude', name: 'latitude', type: 'number', default: 0 },
			{ displayName: 'Longitude', name: 'longitude', type: 'number', default: 0 },
		],
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
		const idRegistro = this.getNodeParameter('serviceId', i) as number;

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'GET',
			url: `${baseUrl}/api/v1/service/get/${idRegistro}`,
			headers: authHeaders,
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	if (operation === 'list') {
		const numberOfRows = this.getNodeParameter('svcNumberOfRows', i) as number;
		const numberOfRowsSkipped = this.getNodeParameter('svcNumberOfRowsSkipped', i) as number;
		const filters = this.getNodeParameter('svcFilters', i, {}) as IDataObject;

		const reqBody: IDataObject = { numberOfRows, numberOfRowsSkipped, ...filters };

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'POST',
			url: `${baseUrl}/api/v1/service/list`,
			headers: authHeaders,
			body: reqBody,
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	if (operation === 'put') {
		const id = this.getNodeParameter('serviceId', i) as number;
		const idClient = this.getNodeParameter('svcIdClient', i) as number;
		const idObjective = this.getNodeParameter('svcIdObjective', i) as number;
		const optional = this.getNodeParameter('svcPutOptional', i, {}) as IDataObject;

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'PUT',
			url: `${baseUrl}/api/v1/service/put`,
			headers: authHeaders,
			body: { id, idClient, idObjective, ...optional },
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	throw new NodeOperationError(this.getNode(), `Operação desconhecida: ${operation}`);
}
