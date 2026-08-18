import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { apiRequest, assertApiSuccess } from '../transport';

function toNumArray(raw: string): number[] {
	return raw.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
}

export const description: INodeProperties[] = [
	{
		displayName: 'Operação',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['serviceOrder'] } },
		options: [
			{ name: 'Listar', value: 'list', description: 'Listar ordens de serviço', action: 'Listar ordens de serviço' },
			{ name: 'Buscar', value: 'get', description: 'Buscar ordem de serviço pelo ID', action: 'Buscar ordem de serviço' },
			{ name: 'Criar', value: 'post', description: 'Criar ordem de serviço', action: 'Criar ordem de serviço' },
			{ name: 'Listar Status', value: 'listStatus', description: 'Listar status disponíveis das OS', action: 'Listar status de OS' },
			{ name: 'Alterar Status', value: 'changeStatus', description: 'Alterar status de uma OS', action: 'Alterar status de OS' },
			{ name: 'Excluir', value: 'delete', description: 'Excluir ordens de serviço pelos IDs', action: 'Excluir ordens de serviço' },
		],
		default: 'list',
	},

	// ── Listar ───────────────────────────────────────────────────────────────────
	{
		displayName: 'Número de Registros',
		name: 'soNumberOfRows',
		type: 'number',
		default: 50,
		required: true,
		typeOptions: { minValue: 1 },
		displayOptions: { show: { resource: ['serviceOrder'], operation: ['list'] } },
		description: 'Quantidade de registros a retornar (mínimo 1)',
	},
	{
		displayName: 'Registros a Pular',
		name: 'soNumberOfRowsSkipped',
		type: 'number',
		default: 0,
		required: true,
		typeOptions: { minValue: 0 },
		displayOptions: { show: { resource: ['serviceOrder'], operation: ['list'] } },
		description: 'Quantidade de registros a pular (paginação)',
	},
	{
		displayName: 'Busca',
		name: 'soSearch',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['serviceOrder'], operation: ['list'] } },
	},
	{
		displayName: 'Ativo',
		name: 'soAtivo',
		type: 'options',
		options: [
			{ name: 'Todos', value: 'all' },
			{ name: 'Ativo', value: 'true' },
			{ name: 'Inativo', value: 'false' },
		],
		default: 'all',
		displayOptions: { show: { resource: ['serviceOrder'], operation: ['list'] } },
	},
	{
		displayName: 'Status (IDs separados por vírgula)',
		name: 'soStatusType',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['serviceOrder'], operation: ['list'] } },
		description: 'Filtrar por IDs de status. Ex: 1,2,3',
		placeholder: '1,2,3',
	},
	{
		displayName: 'Tipos de Atividade (IDs separados por vírgula)',
		name: 'soIdTipoAtividade',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['serviceOrder'], operation: ['list'] } },
		placeholder: '1,2,3',
	},
	{
		displayName: 'Contatos (IDs separados por vírgula)',
		name: 'soIdsContact',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['serviceOrder'], operation: ['list'] } },
		placeholder: '1,2,3',
	},
	{
		displayName: 'Grupos (IDs separados por vírgula)',
		name: 'soIdsGroup',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['serviceOrder'], operation: ['list'] } },
		placeholder: '1,2,3',
	},
	{
		displayName: 'Segmentos (IDs separados por vírgula)',
		name: 'soIdsSegment',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['serviceOrder'], operation: ['list'] } },
		placeholder: '1,2,3',
	},

	// ── Buscar ───────────────────────────────────────────────────────────────────
	{
		displayName: 'ID da OS',
		name: 'soId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: { show: { resource: ['serviceOrder'], operation: ['get'] } },
		description: 'ID da ordem de serviço',
	},

	// ── Criar ────────────────────────────────────────────────────────────────────
	{
		displayName: 'Nome',
		name: 'soName',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { resource: ['serviceOrder'], operation: ['post'] } },
	},
	{
		displayName: 'Campos Opcionais',
		name: 'soOptional',
		type: 'collection',
		placeholder: 'Adicionar campo',
		default: {},
		displayOptions: { show: { resource: ['serviceOrder'], operation: ['post'] } },
		options: [
			{ displayName: 'Ativo', name: 'active', type: 'boolean', default: true },
			{ displayName: 'Finalizado', name: 'finished', type: 'boolean', default: false },
			{ displayName: 'ID do Cliente', name: 'idClient', type: 'number', default: 0 },
			{ displayName: 'ID do Grupo', name: 'idGroup', type: 'number', default: 0 },
			{ displayName: 'ID do Segmento', name: 'idSegment', type: 'number', default: 0 },
			{ displayName: 'ID do Contato', name: 'idContact', type: 'number', default: 0 },
			{ displayName: 'ID do Tipo de Serviço', name: 'idTypeService', type: 'number', default: 0 },
			{ displayName: 'Data Início Agendada', name: 'scheduledStartDate', type: 'dateTime', default: '' },
			{ displayName: 'Data Agendada', name: 'scheduledDate', type: 'dateTime', default: '' },
			{ displayName: 'Comentário', name: 'comment', type: 'string', default: '' },
			{ displayName: 'Criado Para Mim', name: 'createdForMe', type: 'boolean', default: false },
			{ displayName: 'Exigir Checklist', name: 'requireFinishChecklist', type: 'boolean', default: false },
			{ displayName: 'Prioridade', name: 'priority', type: 'number', default: 0 },
		],
	},
	{
		displayName: 'Usuários (IDs separados por vírgula)',
		name: 'soIdsUsers',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['serviceOrder'], operation: ['post'] } },
		placeholder: '1,2,3',
	},
	{
		displayName: 'Checklists (IDs separados por vírgula)',
		name: 'soIdsChecklists',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['serviceOrder'], operation: ['post'] } },
		placeholder: '1,2,3',
	},

	// ── Alterar Status ───────────────────────────────────────────────────────────
	{
		displayName: 'ID da OS',
		name: 'soId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: { show: { resource: ['serviceOrder'], operation: ['changeStatus'] } },
		description: 'ID da ordem de serviço',
	},
	{
		displayName: 'ID do Status',
		name: 'soIdStatus',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: { show: { resource: ['serviceOrder'], operation: ['changeStatus'] } },
		description: 'ID do novo status',
	},

	// ── Excluir ──────────────────────────────────────────────────────────────────
	{
		displayName: 'IDs das OS (separados por vírgula)',
		name: 'soDeleteIds',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { resource: ['serviceOrder'], operation: ['delete'] } },
		description: 'IDs das ordens de serviço a excluir. Ex: 1,2,3',
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

	if (operation === 'list') {
		const numberOfRows = this.getNodeParameter('soNumberOfRows', i) as number;
		const numberOfRowsSkipped = this.getNodeParameter('soNumberOfRowsSkipped', i) as number;
		const search = this.getNodeParameter('soSearch', i, '') as string;
		const ativoParam = this.getNodeParameter('soAtivo', i, 'all') as string;
		const statusTypeRaw = this.getNodeParameter('soStatusType', i, '') as string;
		const tipoAtivRaw = this.getNodeParameter('soIdTipoAtividade', i, '') as string;
		const contactsRaw = this.getNodeParameter('soIdsContact', i, '') as string;
		const groupsRaw = this.getNodeParameter('soIdsGroup', i, '') as string;
		const segmentsRaw = this.getNodeParameter('soIdsSegment', i, '') as string;

		const reqBody: IDataObject = { numberOfRows, numberOfRowsSkipped, search };
		if (ativoParam !== 'all') reqBody.ativo = ativoParam === 'true';
		if (statusTypeRaw.trim()) reqBody.statusType = toNumArray(statusTypeRaw);
		if (tipoAtivRaw.trim()) reqBody.idTipoAtividade = toNumArray(tipoAtivRaw);
		if (contactsRaw.trim()) reqBody.idsContact = toNumArray(contactsRaw);
		if (groupsRaw.trim()) reqBody.idsGroup = toNumArray(groupsRaw);
		if (segmentsRaw.trim()) reqBody.idsSegment = toNumArray(segmentsRaw);

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'POST',
			url: `${baseUrl}/api/v1/serviceorder/list`,
			headers: authHeaders,
			body: reqBody,
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	if (operation === 'get') {
		const id = this.getNodeParameter('soId', i) as number;

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'GET',
			url: `${baseUrl}/api/v1/serviceorder/get?id=${id}`,
			headers: authHeaders,
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	if (operation === 'post') {
		const name = this.getNodeParameter('soName', i) as string;
		const optional = this.getNodeParameter('soOptional', i, {}) as IDataObject;
		const idsUsersRaw = this.getNodeParameter('soIdsUsers', i, '') as string;
		const idsChecklistsRaw = this.getNodeParameter('soIdsChecklists', i, '') as string;

		const reqBody: IDataObject = { name, ...optional };
		if (idsUsersRaw.trim()) reqBody.idsUsers = toNumArray(idsUsersRaw);
		if (idsChecklistsRaw.trim()) reqBody.idsChecklists = toNumArray(idsChecklistsRaw);

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'POST',
			url: `${baseUrl}/api/v1/serviceorder/post`,
			headers: authHeaders,
			body: reqBody,
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	if (operation === 'listStatus') {
		const { statusCode, body } = await apiRequest.call(this, {
			method: 'GET',
			url: `${baseUrl}/api/v1/serviceorder/liststatusos`,
			headers: authHeaders,
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	if (operation === 'changeStatus') {
		const idOs = this.getNodeParameter('soId', i) as number;
		const idStatus = this.getNodeParameter('soIdStatus', i) as number;

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'POST',
			url: `${baseUrl}/api/v1/serviceorder/changestatusos?idOs=${idOs}&idStatus=${idStatus}`,
			headers: authHeaders,
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	if (operation === 'delete') {
		const idsRaw = this.getNodeParameter('soDeleteIds', i) as string;
		const ids = toNumArray(idsRaw);

		const res = await this.helpers.httpRequest({
			method: 'DELETE',
			url: `${baseUrl}/api/v1/serviceorder/delete`,
			headers: authHeaders,
			body: ids,
			json: true,
			returnFullResponse: true,
			ignoreHttpStatusErrors: true,
		});

		const statusCode = res.statusCode as number;
		const body = res.body;
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	throw new NodeOperationError(this.getNode(), `Operação desconhecida: ${operation}`);
}
