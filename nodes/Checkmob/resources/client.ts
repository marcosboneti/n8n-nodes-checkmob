import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { apiRequest, assertApiSuccess, toList, parseJson } from '../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Operação',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['client'] } },
		options: [
			{ name: 'Listar', value: 'list', description: 'Buscar clientes de forma paginada e com filtros', action: 'Listar clientes' },
			{ name: 'Buscar', value: 'get', description: 'Buscar um cliente pelo ID', action: 'Buscar cliente' },
			{ name: 'Criar', value: 'post', description: 'Criar um novo cliente', action: 'Criar cliente' },
			{ name: 'Criar em Lote', value: 'postBulk', description: 'Criar múltiplos clientes em uma única chamada', action: 'Criar clientes em lote' },
			{ name: 'Editar', value: 'put', description: 'Editar um cliente existente', action: 'Editar cliente' },
		],
		default: 'list',
	},

	// ── Listar ──────────────────────────────────────────────────────────────────
	{
		displayName: 'Número de Linhas',
		name: 'clientNumberOfRows',
		type: 'number',
		default: 50,
		typeOptions: { minValue: 0 },
		displayOptions: { show: { resource: ['client'], operation: ['list'] } },
		description: 'Quantidade de registros a retornar (0 = todos)',
	},
	{
		displayName: 'Pular',
		name: 'clientSkip',
		type: 'number',
		default: 0,
		typeOptions: { minValue: 0 },
		displayOptions: { show: { resource: ['client'], operation: ['list'] } },
		description: 'Número de registros a pular (paginação)',
	},
	{
		displayName: 'Busca',
		name: 'clientSearch',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['client'], operation: ['list'] } },
		description: 'Filtrar clientes por nome ou palavra-chave',
	},
	{
		displayName: 'Ativo',
		name: 'clientActive',
		type: 'options',
		options: [
			{ name: 'Todos', value: 'all' },
			{ name: 'Ativo', value: 'true' },
			{ name: 'Inativo', value: 'false' },
		],
		default: 'all',
		displayOptions: { show: { resource: ['client'], operation: ['list'] } },
		description: 'Filtrar por status ativo/inativo',
	},
	{
		displayName: 'IDs (separados por vírgula)',
		name: 'clientIds',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['client'], operation: ['list'] } },
		description: 'Filtrar por IDs específicos. Ex: 1,2,3',
		placeholder: '1,2,3',
	},
	{
		displayName: 'Códigos (separados por vírgula)',
		name: 'clientCodes',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['client'], operation: ['list'] } },
		description: 'Filtrar por códigos específicos. Ex: A001,A002',
		placeholder: 'A001,A002',
	},

	// ── Buscar ───────────────────────────────────────────────────────────────────
	{
		displayName: 'ID do Cliente',
		name: 'clientId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: { show: { resource: ['client'], operation: ['get'] } },
		description: 'ID do cliente a buscar',
	},

	// ── Criar / Editar ───────────────────────────────────────────────────────────
	{
		displayName: 'ID do Cliente',
		name: 'clientId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: { show: { resource: ['client'], operation: ['put'] } },
		description: 'ID do cliente a editar',
	},
	{
		displayName: 'Nome',
		name: 'clientName',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { resource: ['client'], operation: ['post'] } },
		description: 'Nome do cliente',
	},
	{
		displayName: 'Campos Adicionais',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Adicionar campo',
		default: {},
		displayOptions: { show: { resource: ['client'], operation: ['post', 'put'] } },
		options: [
			//{ displayName: 'Nome', name: 'name', type: 'string', default: '', description: 'Nome do cliente (obrigatório no PUT)' },
			{ displayName: 'Código', name: 'code', type: 'number', default: 0 },
			{ displayName: 'Tipo', name: 'type', type: 'string', default: '' },
			{ displayName: 'CNPJ', name: 'cnpj', type: 'string', default: '' },
			{ displayName: 'CPF', name: 'cpf', type: 'string', default: '' },
			{ displayName: 'E-mail', name: 'email', type: 'string', default: '' },
			{ displayName: 'Telefone', name: 'phone', type: 'string', default: '' },
			{ displayName: 'Celular', name: 'cellphone', type: 'string', default: '' },
			{ displayName: 'Cargo', name: 'role', type: 'string', default: '' },
			{ displayName: 'Responsável', name: 'responsible', type: 'string', default: '' },
			{ displayName: 'Telefone Responsável', name: 'responsiblePhone', type: 'string', default: '' },
			{ displayName: 'E-mail Responsável', name: 'responsibleEmail', type: 'string', default: '' },
			{ displayName: 'Cargo Responsável', name: 'responsibleRole', type: 'string', default: '' },
			{ displayName: 'Telefone Secundário', name: 'secondaryPhone', type: 'string', default: '' },
			{ displayName: 'Info Adicional', name: 'additionalInfo', type: 'string', default: '' },
			{ displayName: 'QR Code', name: 'qrCode', type: 'string', default: '' },
			{ displayName: 'Ativo', name: 'active', type: 'boolean', default: true },
			{ displayName: 'Range de Checkin', name: 'checkinRange', type: 'number', default: 0 },
			{ displayName: 'ID Etapa', name: 'idStep', type: 'number', default: 0 },
			{ displayName: 'Valor Negócio', name: 'businessValue', type: 'number', default: 0 },
			{ displayName: 'ID Categoria', name: 'idCategory', type: 'number', default: 0 },
			{ displayName: 'ID Temperatura', name: 'idTemperature', type: 'number', default: 0 },
			{ displayName: 'ID Setor Mercado', name: 'idMarketSector', type: 'number', default: 0 },
			{ displayName: 'CNPJ/CPF Fiscal', name: 'fiscalIdentifier', type: 'string', default: '' },
		],
	},
	{
		displayName: 'Endereço',
		name: 'address',
		type: 'fixedCollection',
		typeOptions: { multipleValues: false },
		placeholder: 'Adicionar endereço',
		default: {},
		displayOptions: { show: { resource: ['client'], operation: ['post', 'put'] } },
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
		name: 'clientFields',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '[]',
		displayOptions: { show: { resource: ['client'], operation: ['post', 'put'] } },
		description: 'Array JSON com campos personalizados. Ex: [{"idField":1,"idFieldOption":0,"value":"texto"}]',
	},

	// ── Criar em Lote ────────────────────────────────────────────────────────────
	{
		displayName: 'Clientes (JSON)',
		name: 'clientsBulkJson',
		type: 'string',
		typeOptions: { rows: 6 },
		default: '[]',
		required: true,
		displayOptions: { show: { resource: ['client'], operation: ['postBulk'] } },
		description: 'Array JSON com os clientes a criar. Mesma estrutura do endpoint Criar.',
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
		const numberOfRows = this.getNodeParameter('clientNumberOfRows', i, 50) as number;
		const numberOfSkipped = this.getNodeParameter('clientSkip', i, 0) as number;
		const search = this.getNodeParameter('clientSearch', i, '') as string;
		const activeParam = this.getNodeParameter('clientActive', i, 'all') as string;
		const idsRaw = this.getNodeParameter('clientIds', i, '') as string;
		const codesRaw = this.getNodeParameter('clientCodes', i, '') as string;

		const reqBody: IDataObject = { numberOfRows, numberOfRowsSkipped: numberOfSkipped, search };
		if (activeParam !== 'all') reqBody.active = activeParam === 'true';
		if (idsRaw.trim()) reqBody.ids = idsRaw.split(',').map((v) => Number(v.trim())).filter(Boolean);
		if (codesRaw.trim()) reqBody.code = codesRaw.split(',').map((v) => v.trim()).filter(Boolean);

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'POST',
			url: `${baseUrl}/api/v1/client/list`,
			headers: authHeaders,
			body: reqBody,
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(toList(data));
	}

	if (operation === 'get') {
		const id = this.getNodeParameter('clientId', i) as number;

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'GET',
			url: `${baseUrl}/api/v1/client/get?id=${id}`,
			headers: authHeaders,
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	if (operation === 'post') {
		const name = this.getNodeParameter('clientName', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
		const addressData = (this.getNodeParameter('address', i, {}) as IDataObject).values as IDataObject | undefined;
		const fieldsRaw = this.getNodeParameter('clientFields', i, '[]') as string;

		const reqBody: IDataObject = { name, ...additionalFields };
		if (addressData && Object.keys(addressData).length) reqBody.address = addressData;
		reqBody.fields = parseJson(fieldsRaw, this.getNode(), 'Campos Personalizados');

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'POST',
			url: `${baseUrl}/api/v1/client/post`,
			headers: authHeaders,
			body: reqBody,
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	if (operation === 'postBulk') {
		const clientsRaw = this.getNodeParameter('clientsBulkJson', i, '[]') as string;
		const clients = parseJson(clientsRaw, this.getNode(), 'Clientes (JSON)');

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'POST',
			url: `${baseUrl}/api/v1/client/postbulk`,
			headers: authHeaders,
			body: { clients },
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	if (operation === 'put') {
		const id = this.getNodeParameter('clientId', i) as number;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
		const addressData = (this.getNodeParameter('address', i, {}) as IDataObject).values as IDataObject | undefined;
		const fieldsRaw = this.getNodeParameter('clientFields', i, '[]') as string;

		const reqBody: IDataObject = { id, ...additionalFields };
		if (addressData && Object.keys(addressData).length) reqBody.address = addressData;
		reqBody.fields = parseJson(fieldsRaw, this.getNode(), 'Campos Personalizados');

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'PUT',
			url: `${baseUrl}/api/v1/client/put`,
			headers: authHeaders,
			body: reqBody,
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	throw new NodeOperationError(this.getNode(), `Operação desconhecida: ${operation}`);
}
