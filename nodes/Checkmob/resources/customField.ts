import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { apiRequest, assertApiSuccess, toList } from '../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Operação',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['customField'] } },
		options: [
			{ name: 'Listar', value: 'list', description: 'Listar campos personalizados', action: 'Listar campos personalizados' },
		],
		default: 'list',
	},
	{
		displayName: 'Origem',
		name: 'cfOrigen',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['customField'], operation: ['list'] } },
		description: 'Escreva "Clientes" ou "Pessoas" para retornar os campos da origem desejada',
		placeholder: 'Clientes',
	},
	{
		displayName: 'Busca',
		name: 'cfSearch',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['customField'], operation: ['list'] } },
		description: 'Filtrar campos por nome ou palavra-chave',
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
		const origen = this.getNodeParameter('cfOrigen', i, '') as string;
		const search = this.getNodeParameter('cfSearch', i, '') as string;

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'POST',
			url: `${baseUrl}/api/v1/customfields/list`,
			headers: authHeaders,
			body: { origen, search },
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(toList(data));
	}

	throw new NodeOperationError(this.getNode(), `Operação desconhecida: ${operation}`);
}
