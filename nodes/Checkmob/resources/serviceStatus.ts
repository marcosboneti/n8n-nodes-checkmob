import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { apiRequest, assertApiSuccess } from '../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Operação',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['serviceStatus'] } },
		options: [
			{ name: 'Listar', value: 'list', description: 'Listar status de serviço', action: 'Listar status de serviço' },
		],
		default: 'list',
	},
	{
		displayName: 'Pesquisa',
		name: 'ssSearch',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['serviceStatus'], operation: ['list'] } },
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
		const search = this.getNodeParameter('ssSearch', i, '') as string;
		const pesquisa = search.trim() ? `?pesquisa=${encodeURIComponent(search)}` : '';

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'POST',
			url: `${baseUrl}/api/v1/servicestatus/list${pesquisa}`,
			headers: authHeaders,
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	throw new NodeOperationError(this.getNode(), `Operação desconhecida: ${operation}`);
}
