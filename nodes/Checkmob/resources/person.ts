import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { apiRequest, assertApiSuccess, parseJson } from '../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Operação',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['person'] } },
		options: [
			{ name: 'Listar', value: 'list', description: 'Listar pessoas com paginação', action: 'Listar pessoas' },
			{ name: 'Buscar', value: 'get', description: 'Buscar pessoa pelo ID', action: 'Buscar pessoa' },
			{ name: 'Criar', value: 'post', description: 'Criar uma nova pessoa', action: 'Criar pessoa' },
			{ name: 'Editar', value: 'put', description: 'Editar uma pessoa existente', action: 'Editar pessoa' },
			{ name: 'Excluir', value: 'delete', description: 'Excluir pessoas pelos IDs', action: 'Excluir pessoas' },
			{ name: 'Vincular Cliente', value: 'linkClient', description: 'Vincular pessoa a um cliente', action: 'Vincular pessoa a cliente' },
		],
		default: 'list',
	},

	// ── Listar ───────────────────────────────────────────────────────────────────
	{
		displayName: 'Número de Registros',
		name: 'personNumberOfRows',
		type: 'number',
		default: 50,
		required: true,
		typeOptions: { minValue: 1 },
		displayOptions: { show: { resource: ['person'], operation: ['list'] } },
		description: 'Quantidade de registros a retornar (mínimo 1)',
	},
	{
		displayName: 'Registros a Pular',
		name: 'personNumberOfRowsSkipped',
		type: 'number',
		default: 0,
		required: true,
		typeOptions: { minValue: 0 },
		displayOptions: { show: { resource: ['person'], operation: ['list'] } },
		description: 'Quantidade de registros a pular (paginação)',
	},
	{
		displayName: 'Busca',
		name: 'personSearch',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['person'], operation: ['list'] } },
	},

	// ── Buscar ───────────────────────────────────────────────────────────────────
	{
		displayName: 'ID da Pessoa',
		name: 'personId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: { show: { resource: ['person'], operation: ['get'] } },
		description: 'ID da pessoa a buscar',
	},

	// ── Criar ────────────────────────────────────────────────────────────────────
	{
		displayName: 'Nome',
		name: 'personName',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { resource: ['person'], operation: ['post'] } },
	},
	{
		displayName: 'Campos Opcionais',
		name: 'personOptional',
		type: 'collection',
		placeholder: 'Adicionar campo',
		default: {},
		displayOptions: { show: { resource: ['person'], operation: ['post'] } },
		options: [
			{ displayName: 'E-mail', name: 'email', type: 'string', default: '' },
			{ displayName: 'Celular', name: 'cellphone', type: 'string', default: '' },
			{ displayName: 'Telefone', name: 'telephone', type: 'string', default: '' },
		],
	},
	{
		displayName: 'Endereço',
		name: 'personAddress',
		type: 'fixedCollection',
		typeOptions: { multipleValues: false },
		placeholder: 'Adicionar endereço',
		default: {},
		displayOptions: { show: { resource: ['person'], operation: ['post'] } },
		options: [
			{
				name: 'values',
				displayName: 'Endereço',
				values: [
					{ displayName: 'Logradouro', name: 'address', type: 'string', default: '' },
					{ displayName: 'Número', name: 'number', type: 'string', default: '' },
					{ displayName: 'Complemento', name: 'complement', type: 'string', default: '' },
					{ displayName: 'Bairro', name: 'neighborhood', type: 'string', default: '' },
					{ displayName: 'CEP', name: 'zipCode', type: 'string', default: '' },
					{ displayName: 'Cidade', name: 'city', type: 'string', default: '' },
					{ displayName: 'Estado', name: 'state', type: 'string', default: '' },
					{ displayName: 'País', name: 'country', type: 'string', default: '' },
					{ displayName: 'Latitude', name: 'latitude', type: 'number', default: 0 },
					{ displayName: 'Longitude', name: 'longitude', type: 'number', default: 0 },
				],
			},
		],
	},
	{
		displayName: 'Campos Personalizados (JSON)',
		name: 'personFields',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '[]',
		displayOptions: { show: { resource: ['person'], operation: ['post'] } },
		description: 'Array JSON. Ex: [{"idField":1,"idFieldOption":0,"value":"texto"}]',
	},
	{
		displayName: 'IDs de Clientes (separados por vírgula)',
		name: 'personIdsClients',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['person'], operation: ['post'] } },
		placeholder: '1,2,3',
	},

	// ── Editar ───────────────────────────────────────────────────────────────────
	{
		displayName: 'ID da Pessoa',
		name: 'personId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: { show: { resource: ['person'], operation: ['put'] } },
		description: 'ID da pessoa a editar',
	},
	{
		displayName: 'Campos',
		name: 'personPutFields',
		type: 'collection',
		placeholder: 'Adicionar campo',
		default: {},
		displayOptions: { show: { resource: ['person'], operation: ['put'] } },
		options: [
			{ displayName: 'Nome', name: 'name', type: 'string', default: '' },
			{ displayName: 'E-mail', name: 'email', type: 'string', default: '' },
			{ displayName: 'Celular', name: 'cellphone', type: 'string', default: '' },
			{ displayName: 'Telefone', name: 'telephone', type: 'string', default: '' },
		],
	},
	{
		displayName: 'Endereço',
		name: 'personAddress',
		type: 'fixedCollection',
		typeOptions: { multipleValues: false },
		placeholder: 'Adicionar endereço',
		default: {},
		displayOptions: { show: { resource: ['person'], operation: ['put'] } },
		options: [
			{
				name: 'values',
				displayName: 'Endereço',
				values: [
					{ displayName: 'Logradouro', name: 'address', type: 'string', default: '' },
					{ displayName: 'Número', name: 'number', type: 'string', default: '' },
					{ displayName: 'Complemento', name: 'complement', type: 'string', default: '' },
					{ displayName: 'Bairro', name: 'neighborhood', type: 'string', default: '' },
					{ displayName: 'CEP', name: 'zipCode', type: 'string', default: '' },
					{ displayName: 'Cidade', name: 'city', type: 'string', default: '' },
					{ displayName: 'Estado', name: 'state', type: 'string', default: '' },
					{ displayName: 'País', name: 'country', type: 'string', default: '' },
					{ displayName: 'Latitude', name: 'latitude', type: 'number', default: 0 },
					{ displayName: 'Longitude', name: 'longitude', type: 'number', default: 0 },
				],
			},
		],
	},
	{
		displayName: 'Campos Personalizados (JSON)',
		name: 'personFields',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '[]',
		displayOptions: { show: { resource: ['person'], operation: ['put'] } },
		description: 'Array JSON. Ex: [{"name":"campo","idField":1,"idFieldOption":0,"value":"texto"}]',
	},

	// ── Excluir ──────────────────────────────────────────────────────────────────
	{
		displayName: 'IDs das Pessoas (separados por vírgula)',
		name: 'personDeleteIds',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { resource: ['person'], operation: ['delete'] } },
		description: 'IDs das pessoas a excluir. Ex: 1,2,3',
		placeholder: '1,2,3',
	},

	// ── Vincular Cliente ─────────────────────────────────────────────────────────
	{
		displayName: 'ID da Pessoa',
		name: 'personId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: { show: { resource: ['person'], operation: ['linkClient'] } },
	},
	{
		displayName: 'ID do Cliente',
		name: 'personLinkClientId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: { show: { resource: ['person'], operation: ['linkClient'] } },
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
		const numberOfRows = this.getNodeParameter('personNumberOfRows', i) as number;
		const numberOfRowsSkipped = this.getNodeParameter('personNumberOfRowsSkipped', i) as number;
		const search = this.getNodeParameter('personSearch', i, '') as string;

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'POST',
			url: `${baseUrl}/api/v1/person/list`,
			headers: authHeaders,
			body: { numberOfRows, numberOfRowsSkipped, search },
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	if (operation === 'get') {
		const id = this.getNodeParameter('personId', i) as number;

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'GET',
			url: `${baseUrl}/api/v1/person/get?idPerson=${id}`,
			headers: authHeaders,
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	if (operation === 'post') {
		const name = this.getNodeParameter('personName', i) as string;
		const optional = this.getNodeParameter('personOptional', i, {}) as IDataObject;
		const addressData = (this.getNodeParameter('personAddress', i, {}) as IDataObject).values as IDataObject | undefined;
		const fieldsRaw = this.getNodeParameter('personFields', i, '[]') as string;
		const idsClientsRaw = this.getNodeParameter('personIdsClients', i, '') as string;

		const reqBody: IDataObject = { name, ...optional };
		if (addressData && Object.keys(addressData).length) reqBody.address = addressData;
		reqBody.fields = parseJson(fieldsRaw, this.getNode(), 'Campos Personalizados');
		if (idsClientsRaw.trim()) {
			reqBody.idsClients = idsClientsRaw.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
		}

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'POST',
			url: `${baseUrl}/api/v1/person/post`,
			headers: authHeaders,
			body: reqBody,
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	if (operation === 'put') {
		const id = this.getNodeParameter('personId', i) as number;
		const fields = this.getNodeParameter('personPutFields', i, {}) as IDataObject;
		const addressData = (this.getNodeParameter('personAddress', i, {}) as IDataObject).values as IDataObject | undefined;
		const fieldsRaw = this.getNodeParameter('personFields', i, '[]') as string;

		const reqBody: IDataObject = { id, ...fields };
		if (addressData && Object.keys(addressData).length) reqBody.address = addressData;
		reqBody.fields = parseJson(fieldsRaw, this.getNode(), 'Campos Personalizados');

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'PUT',
			url: `${baseUrl}/api/v1/person/put`,
			headers: authHeaders,
			body: reqBody,
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	if (operation === 'delete') {
		const idsRaw = this.getNodeParameter('personDeleteIds', i) as string;
		const ids = idsRaw.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));

		const res = await this.helpers.httpRequest({
			method: 'DELETE',
			url: `${baseUrl}/api/v1/person/delete`,
			headers: authHeaders,
			body: ids,
			json: true,
			returnFullResponse: true,
			ignoreHttpStatusErrors: true,
		});

		assertApiSuccess(res.statusCode as number, res.body, this.getNode());

		const data = (res.body as IDataObject)?.data ?? res.body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	if (operation === 'linkClient') {
		const idPerson = this.getNodeParameter('personId', i) as number;
		const idClient = this.getNodeParameter('personLinkClientId', i) as number;

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'POST',
			url: `${baseUrl}/api/v1/person/link-client`,
			headers: authHeaders,
			body: { idPerson, idClient },
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	throw new NodeOperationError(this.getNode(), `Operação desconhecida: ${operation}`);
}
