import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { apiRequest, assertApiSuccess } from '../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Operação',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['objective'] } },
		options: [
			{ name: 'Buscar', value: 'get', description: 'Buscar objetivo pelo ID', action: 'Buscar objetivo' },
			{ name: 'Listar', value: 'list', description: 'Listar objetivos com paginação', action: 'Listar objetivos' },
		],
		default: 'list',
	},
	{
		displayName: 'ID do Objetivo',
		name: 'objectiveId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: { show: { resource: ['objective'], operation: ['get'] } },
		description: 'ID do objetivo a buscar',
	},
	{
		displayName: 'Número de Registros',
		name: 'objNumberOfRows',
		type: 'number',
		default: 50,
		required: true,
		typeOptions: { minValue: 1 },
		displayOptions: { show: { resource: ['objective'], operation: ['list'] } },
		description: 'Quantidade de registros a retornar (mínimo 1)',
	},
	{
		displayName: 'Registros a Pular',
		name: 'objNumberOfRowsSkipped',
		type: 'number',
		default: 0,
		required: true,
		typeOptions: { minValue: 0 },
		displayOptions: { show: { resource: ['objective'], operation: ['list'] } },
		description: 'Quantidade de registros a pular (paginação)',
	},
	{
		displayName: 'Busca',
		name: 'objSearch',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['objective'], operation: ['list'] } },
		description: 'Filtro de busca por nome',
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
		const id = this.getNodeParameter('objectiveId', i) as number;

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'GET',
			url: `${baseUrl}/api/v1/objective/get?id=${id}`,
			headers: authHeaders,
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	if (operation === 'list') {
		const numberOfRows = this.getNodeParameter('objNumberOfRows', i) as number;
		const numberOfRowsSkipped = this.getNodeParameter('objNumberOfRowsSkipped', i) as number;
		const search = this.getNodeParameter('objSearch', i, '') as string;

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'POST',
			url: `${baseUrl}/api/v1/objective/list`,
			headers: authHeaders,
			body: { numberOfRows, numberOfRowsSkipped, search },
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	throw new NodeOperationError(this.getNode(), `Operação desconhecida: ${operation}`);
}
