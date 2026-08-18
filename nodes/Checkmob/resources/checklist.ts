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
		displayOptions: { show: { resource: ['checklist'] } },
		options: [
			{ name: 'Listar', value: 'list', description: 'Listar questionários', action: 'Listar questionários' },
			{ name: 'Vincular Grupo', value: 'linkGroup', description: 'Vincular grupos ao questionário', action: 'Vincular grupo ao questionário' },
			{ name: 'Remover Vínculo de Grupo', value: 'deleteLinkGroup', description: 'Remover vínculo de grupos do questionário', action: 'Remover vínculo de grupo' },
			{ name: 'Vincular Segmento', value: 'linkSegment', description: 'Vincular segmentos ao questionário', action: 'Vincular segmento ao questionário' },
			{ name: 'Remover Vínculo de Segmento', value: 'deleteLinkSegment', description: 'Remover vínculo de segmentos do questionário', action: 'Remover vínculo de segmento' },
		],
		default: 'list',
	},

	// ── Listar ───────────────────────────────────────────────────────────────────
	{
		displayName: 'Número de Registros',
		name: 'clNumberOfRows',
		type: 'number',
		default: 50,
		required: true,
		typeOptions: { minValue: 1 },
		displayOptions: { show: { resource: ['checklist'], operation: ['list'] } },
		description: 'Quantidade de registros a retornar (mínimo 1)',
	},
	{
		displayName: 'Registros a Pular',
		name: 'clNumberOfRowsSkipped',
		type: 'number',
		default: 0,
		required: true,
		typeOptions: { minValue: 0 },
		displayOptions: { show: { resource: ['checklist'], operation: ['list'] } },
	},
	{
		displayName: 'Busca',
		name: 'clSearch',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['checklist'], operation: ['list'] } },
	},
	{
		displayName: 'Ativo',
		name: 'clActive',
		type: 'options',
		options: [
			{ name: 'Todos', value: 'all' },
			{ name: 'Ativo', value: 'true' },
			{ name: 'Inativo', value: 'false' },
		],
		default: 'all',
		displayOptions: { show: { resource: ['checklist'], operation: ['list'] } },
	},

	// ── Vincular / Remover Grupo e Segmento ──────────────────────────────────────
	{
		displayName: 'ID do Questionário',
		name: 'clId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: { show: { resource: ['checklist'], operation: ['linkGroup', 'deleteLinkGroup', 'linkSegment', 'deleteLinkSegment'] } },
		description: 'ID do questionário',
	},
	{
		displayName: 'IDs Vinculados (separados por vírgula)',
		name: 'clIdsLinked',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { resource: ['checklist'], operation: ['linkGroup', 'deleteLinkGroup', 'linkSegment', 'deleteLinkSegment'] } },
		description: 'IDs dos grupos ou segmentos. Ex: 1,2,3',
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
		const numberOfRows = this.getNodeParameter('clNumberOfRows', i) as number;
		const numberOfRowsSkipped = this.getNodeParameter('clNumberOfRowsSkipped', i) as number;
		const search = this.getNodeParameter('clSearch', i, '') as string;
		const activeParam = this.getNodeParameter('clActive', i, 'all') as string;

		const reqBody: IDataObject = { numberOfRows, numberOfRowsSkipped, search };
		if (activeParam !== 'all') reqBody.active = activeParam === 'true';

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'POST',
			url: `${baseUrl}/api/v1/checklist/list`,
			headers: authHeaders,
			body: reqBody,
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	const linkOperations: Record<string, { method: string; path: string }> = {
		linkGroup:         { method: 'POST',   path: 'linkgroup' },
		deleteLinkGroup:   { method: 'DELETE', path: 'deletelinkgroup' },
		linkSegment:       { method: 'POST',   path: 'linksegment' },
		deleteLinkSegment: { method: 'DELETE', path: 'deletelinksegment' },
	};

	if (linkOperations[operation]) {
		const { method, path } = linkOperations[operation];
		const id = this.getNodeParameter('clId', i) as number;
		const idsLinked = toNumArray(this.getNodeParameter('clIdsLinked', i) as string);

		const { statusCode, body } = await apiRequest.call(this, {
			method,
			url: `${baseUrl}/api/v1/checklist/${path}`,
			headers: authHeaders,
			body: { id, idsLinked } as IDataObject,
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	throw new NodeOperationError(this.getNode(), `Operação desconhecida: ${operation}`);
}
