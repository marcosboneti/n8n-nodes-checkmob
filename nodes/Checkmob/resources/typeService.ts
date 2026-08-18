import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { apiRequest, assertApiSuccess } from '../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Operação',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['typeService'] } },
		options: [
			{ name: 'Buscar', value: 'get', description: 'Buscar tipo de serviço pelo ID', action: 'Buscar tipo de serviço' },
			{ name: 'Listar', value: 'list', description: 'Listar tipos de serviço com paginação', action: 'Listar tipos de serviço' },
		],
		default: 'list',
	},
	{
		displayName: 'ID do Tipo de Serviço',
		name: 'idTypeService',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: { show: { resource: ['typeService'], operation: ['get'] } },
		description: 'ID do tipo de serviço a buscar',
	},
	{
		displayName: 'Número de Registros',
		name: 'numberOfRows',
		type: 'number',
		default: 50,
		required: true,
		typeOptions: { minValue: 1 },
		displayOptions: { show: { resource: ['typeService'], operation: ['list'] } },
		description: 'Quantidade de registros a retornar (mínimo 1)',
	},
	{
		displayName: 'Registros a Pular',
		name: 'numberOfRowsSkipped',
		type: 'number',
		default: 0,
		required: true,
		typeOptions: { minValue: 0 },
		displayOptions: { show: { resource: ['typeService'], operation: ['list'] } },
		description: 'Quantidade de registros a pular (paginação)',
	},
	{
		displayName: 'Pesquisa',
		name: 'pesquisa',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['typeService'], operation: ['list'] } },
		description: 'Filtro de pesquisa por nome',
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
		const idTypeService = this.getNodeParameter('idTypeService', i) as number;

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'GET',
			url: `${baseUrl}/api/v1/typeservice/get?idTypeService=${idTypeService}`,
			headers: authHeaders,
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	if (operation === 'list') {
		const numberOfRows = this.getNodeParameter('numberOfRows', i) as number;
		const numberOfRowsSkipped = this.getNodeParameter('numberOfRowsSkipped', i) as number;
		const pesquisa = this.getNodeParameter('pesquisa', i, '') as string;

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'POST',
			url: `${baseUrl}/api/v1/typeservice/list`,
			headers: authHeaders,
			body: { numberOfRows, numberOfRowsSkipped, pesquisa },
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	throw new NodeOperationError(this.getNode(), `Operação desconhecida: ${operation}`);
}
