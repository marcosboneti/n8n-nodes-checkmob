import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { apiRequest, assertApiSuccess } from '../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Operação',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['temperature'] } },
		options: [
			{ name: 'Listar', value: 'list', description: 'Listar temperaturas com paginação', action: 'Listar temperaturas' },
		],
		default: 'list',
	},
	{
		displayName: 'Número de Registros',
		name: 'tempNumberOfRows',
		type: 'number',
		default: 50,
		required: true,
		typeOptions: { minValue: 1 },
		displayOptions: { show: { resource: ['temperature'], operation: ['list'] } },
		description: 'Quantidade de registros a retornar (mínimo 1)',
	},
	{
		displayName: 'Registros a Pular',
		name: 'tempNumberOfRowsSkipped',
		type: 'number',
		default: 0,
		required: true,
		typeOptions: { minValue: 0 },
		displayOptions: { show: { resource: ['temperature'], operation: ['list'] } },
		description: 'Quantidade de registros a pular (paginação)',
	},
	{
		displayName: 'Busca',
		name: 'tempSearch',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['temperature'], operation: ['list'] } },
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

	if (operation === 'list') {
		const numberOfRows = this.getNodeParameter('tempNumberOfRows', i) as number;
		const numberOfRowsSkipped = this.getNodeParameter('tempNumberOfRowsSkipped', i) as number;
		const search = this.getNodeParameter('tempSearch', i, '') as string;

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'POST',
			url: `${baseUrl}/api/v1/temperature/list`,
			headers: authHeaders,
			body: { numberOfRows, numberOfRowsSkipped, search },
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	throw new NodeOperationError(this.getNode(), `Operação desconhecida: ${operation}`);
}
