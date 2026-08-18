import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { apiRequest, assertApiSuccess, toList } from '../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Operação',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['category'] } },
		options: [
			{ name: 'Listar', value: 'list', description: 'Listar todas as categorias', action: 'Listar categorias' },
		],
		default: 'list',
	},
	{
		displayName: 'Retornar Todos',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: { show: { resource: ['category'], operation: ['list'] } },
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limite',
		name: 'limit',
		type: 'number',
		default: 50,
		typeOptions: { minValue: 1, maxValue: 500 },
		displayOptions: { show: { resource: ['category'], operation: ['list'], returnAll: [false] } },
		description: 'Número máximo de resultados a retornar',
	},
	{
		displayName: 'Pular',
		name: 'skip',
		type: 'number',
		default: 0,
		typeOptions: { minValue: 0 },
		displayOptions: { show: { resource: ['category'], operation: ['list'] } },
		description: 'Número de linhas a pular (paginação)',
	},
	{
		displayName: 'Busca',
		name: 'search',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['category'], operation: ['list'] } },
		description: 'Filtrar categorias por nome ou palavra-chave',
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
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const limit = returnAll ? 0 : (this.getNodeParameter('limit', i, 50) as number);
		const skip = this.getNodeParameter('skip', i, 0) as number;
		const search = this.getNodeParameter('search', i, '') as string;

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'POST',
			url: `${baseUrl}/api/v1/category/list`,
			headers: authHeaders,
			body: { numberOfRows: limit, numberOfRowsSkipped: skip, search },
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(toList(data));
	}

	throw new NodeOperationError(this.getNode(), `Operação desconhecida: ${operation}`);
}
