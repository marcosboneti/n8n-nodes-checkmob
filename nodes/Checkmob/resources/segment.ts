import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { apiRequest, assertApiSuccess } from '../transport';

function toNumArray(raw: string): number[] {
	return raw.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
}

const LINK_OPS: Record<string, { method: string; path: string }> = {
	linkSegmentToClient: { method: 'POST',   path: 'linksegmenttoclient' },
	deleteLinkClient:    { method: 'DELETE', path: 'deletelinkclient' },
	linkGroup:           { method: 'POST',   path: 'linkgroup' },
	deleteLinkGroup:     { method: 'DELETE', path: 'deletelinkgroup' },
	linkUser:            { method: 'POST',   path: 'linkuser' },
	deleteLinkUser:      { method: 'DELETE', path: 'deletelinkuser' },
};

export const description: INodeProperties[] = [
	{
		displayName: 'Operação',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['segment'] } },
		options: [
			{ name: 'Buscar', value: 'get', description: 'Buscar segmento pelo ID', action: 'Buscar segmento' },
			{ name: 'Listar', value: 'list', description: 'Listar segmentos', action: 'Listar segmentos' },
			{ name: 'Criar', value: 'post', description: 'Criar segmento', action: 'Criar segmento' },
			{ name: 'Editar', value: 'put', description: 'Editar segmento', action: 'Editar segmento' },
			{ name: 'Excluir', value: 'delete', description: 'Excluir segmentos pelos IDs', action: 'Excluir segmentos' },
			{ name: 'Obter Vínculos', value: 'getLinks', description: 'Obter vínculos do segmento', action: 'Obter vínculos do segmento' },
			{ name: 'Vincular ao Cliente', value: 'linkSegmentToClient', description: 'Vincular segmento a clientes', action: 'Vincular segmento a clientes' },
			{ name: 'Remover Vínculo de Cliente', value: 'deleteLinkClient', description: 'Remover vínculo de clientes do segmento', action: 'Remover vínculo de clientes' },
			{ name: 'Vincular Grupo', value: 'linkGroup', description: 'Vincular grupos ao segmento', action: 'Vincular grupos ao segmento' },
			{ name: 'Remover Vínculo de Grupo', value: 'deleteLinkGroup', description: 'Remover vínculo de grupos do segmento', action: 'Remover vínculo de grupos' },
			{ name: 'Vincular Usuário', value: 'linkUser', description: 'Vincular usuários ao segmento', action: 'Vincular usuários ao segmento' },
			{ name: 'Remover Vínculo de Usuário', value: 'deleteLinkUser', description: 'Remover vínculo de usuários do segmento', action: 'Remover vínculo de usuários' },
		],
		default: 'list',
	},

	// ── Buscar / Obter Vínculos ───────────────────────────────────────────────────
	{
		displayName: 'ID do Segmento',
		name: 'segmentId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: { show: { resource: ['segment'], operation: ['get', 'getLinks'] } },
	},

	// ── Listar ───────────────────────────────────────────────────────────────────
	{
		displayName: 'Número de Registros',
		name: 'segNumberOfRows',
		type: 'number',
		default: 50,
		required: true,
		typeOptions: { minValue: 1 },
		displayOptions: { show: { resource: ['segment'], operation: ['list'] } },
	},
	{
		displayName: 'Registros a Pular',
		name: 'segNumberOfRowsSkipped',
		type: 'number',
		default: 0,
		required: true,
		typeOptions: { minValue: 0 },
		displayOptions: { show: { resource: ['segment'], operation: ['list'] } },
	},
	{
		displayName: 'Ativo',
		name: 'segActive',
		type: 'options',
		options: [
			{ name: 'Todos', value: 'all' },
			{ name: 'Ativo', value: 'true' },
			{ name: 'Inativo', value: 'false' },
		],
		default: 'all',
		displayOptions: { show: { resource: ['segment'], operation: ['list'] } },
	},

	// ── Criar ────────────────────────────────────────────────────────────────────
	{
		displayName: 'Nome',
		name: 'segName',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { resource: ['segment'], operation: ['post'] } },
	},
	{
		displayName: 'IDs de Usuários (separados por vírgula)',
		name: 'segIdsUsers',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['segment'], operation: ['post'] } },
		placeholder: '1,2,3',
	},
	{
		displayName: 'IDs de Grupos (separados por vírgula)',
		name: 'segIdsGroups',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['segment'], operation: ['post'] } },
		placeholder: '1,2,3',
	},

	// ── Editar ───────────────────────────────────────────────────────────────────
	{
		displayName: 'ID do Segmento',
		name: 'segmentId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: { show: { resource: ['segment'], operation: ['put'] } },
	},
	{
		displayName: 'Campos',
		name: 'segPutFields',
		type: 'collection',
		placeholder: 'Adicionar campo',
		default: {},
		displayOptions: { show: { resource: ['segment'], operation: ['put'] } },
		options: [
			{ displayName: 'Nome', name: 'name', type: 'string', default: '' },
			{ displayName: 'Status', name: 'status', type: 'boolean', default: true },
		],
	},

	// ── Excluir ──────────────────────────────────────────────────────────────────
	{
		displayName: 'IDs dos Segmentos (separados por vírgula)',
		name: 'segDeleteIds',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { resource: ['segment'], operation: ['delete'] } },
		placeholder: '1,2,3',
	},

	// ── Operações de Vínculo ─────────────────────────────────────────────────────
	{
		displayName: 'ID do Segmento',
		name: 'segmentId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: { show: { resource: ['segment'], operation: ['linkSegmentToClient', 'deleteLinkClient', 'linkGroup', 'deleteLinkGroup', 'linkUser', 'deleteLinkUser'] } },
	},
	{
		displayName: 'IDs (separados por vírgula)',
		name: 'segIdsLinked',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { resource: ['segment'], operation: ['linkSegmentToClient', 'deleteLinkClient', 'linkGroup', 'deleteLinkGroup', 'linkUser', 'deleteLinkUser'] } },
		description: 'IDs dos clientes, grupos ou usuários. Ex: 1,2,3',
		placeholder: '1,2,3',
	},
];

export async function execute(
	this: IExecuteFunctions,
	i: number,
	baseUrl: string,
	authHeaders: IDataObject,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', i) as string;

	if (operation === 'get' || operation === 'getLinks') {
		const id = this.getNodeParameter('segmentId', i) as number;
		const path = operation === 'getLinks' ? 'getlinks' : 'get';

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'GET',
			url: `${baseUrl}/api/v1/segment/${path}?id=${id}`,
			headers: authHeaders,
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	if (operation === 'list') {
		const numberOfRows = this.getNodeParameter('segNumberOfRows', i) as number;
		const numberOfRowsSkipped = this.getNodeParameter('segNumberOfRowsSkipped', i) as number;
		const activeParam = this.getNodeParameter('segActive', i, 'all') as string;

		const reqBody: IDataObject = { numberOfRows, numberOfRowsSkipped };
		if (activeParam !== 'all') reqBody.active = activeParam === 'true';

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'POST',
			url: `${baseUrl}/api/v1/segment/list`,
			headers: authHeaders,
			body: reqBody,
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	if (operation === 'post') {
		const name = this.getNodeParameter('segName', i) as string;
		const idsUsersRaw = this.getNodeParameter('segIdsUsers', i, '') as string;
		const idsGroupsRaw = this.getNodeParameter('segIdsGroups', i, '') as string;

		const reqBody: IDataObject = { name };
		if (idsUsersRaw.trim()) reqBody.idsUsers = toNumArray(idsUsersRaw);
		if (idsGroupsRaw.trim()) reqBody.idsGroups = toNumArray(idsGroupsRaw);

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'POST',
			url: `${baseUrl}/api/v1/segment/post`,
			headers: authHeaders,
			body: reqBody,
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	if (operation === 'put') {
		const id = this.getNodeParameter('segmentId', i) as number;
		const fields = this.getNodeParameter('segPutFields', i, {}) as IDataObject;

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'PUT',
			url: `${baseUrl}/api/v1/segment/put`,
			headers: authHeaders,
			body: { id, ...fields },
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	if (operation === 'delete') {
		const ids = toNumArray(this.getNodeParameter('segDeleteIds', i) as string);

		const res = await this.helpers.httpRequest({
			method: 'DELETE',
			url: `${baseUrl}/api/v1/segment/delete`,
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

	if (LINK_OPS[operation]) {
		const { method, path } = LINK_OPS[operation];
		const idSegment = this.getNodeParameter('segmentId', i) as number;
		const idsClients = toNumArray(this.getNodeParameter('segIdsLinked', i) as string);

		const { statusCode, body } = await apiRequest.call(this, {
			method,
			url: `${baseUrl}/api/v1/segment/${path}`,
			headers: authHeaders,
			body: { idSegment, idsClients } as IDataObject,
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	throw new NodeOperationError(this.getNode(), `Operação desconhecida: ${operation}`);
}
