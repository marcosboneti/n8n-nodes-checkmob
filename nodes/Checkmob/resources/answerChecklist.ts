import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { apiRequest, assertApiSuccess } from '../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Operação',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['answerChecklist'] } },
		options: [
			{ name: 'Buscar por Registro', value: 'get', description: 'Buscar respostas pelo ID do registro', action: 'Buscar respostas por registro' },
			{ name: 'Buscar por Ordem de Serviço', value: 'getByServiceOrder', description: 'Buscar respostas pelo ID da ordem de serviço', action: 'Buscar respostas por OS' },
			{ name: 'Listar', value: 'list', description: 'Listar checklists respondidos', action: 'Listar checklists respondidos' },
		],
		default: 'list',
	},

	// ── Buscar por Registro ───────────────────────────────────────────────────────
	{
		displayName: 'ID do Registro',
		name: 'acIdService',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: { show: { resource: ['answerChecklist'], operation: ['get'] } },
	},

	// ── Buscar por Ordem de Serviço ───────────────────────────────────────────────
	{
		displayName: 'ID da Ordem de Serviço',
		name: 'acIdServiceOrder',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: { show: { resource: ['answerChecklist'], operation: ['getByServiceOrder'] } },
	},

	// ── Listar ───────────────────────────────────────────────────────────────────
	{
		displayName: 'Número de Registros',
		name: 'acNumberOfRows',
		type: 'number',
		default: 50,
		required: true,
		typeOptions: { minValue: 1 },
		displayOptions: { show: { resource: ['answerChecklist'], operation: ['list'] } },
		description: 'Quantidade de registros a retornar (mínimo 1)',
	},
	{
		displayName: 'Registros a Pular',
		name: 'acNumberOfRowsSkipped',
		type: 'number',
		default: 0,
		required: true,
		typeOptions: { minValue: 0 },
		displayOptions: { show: { resource: ['answerChecklist'], operation: ['list'] } },
	},
	{
		displayName: 'Data de Atualização',
		name: 'acUpdateDate',
		type: 'dateTime',
		default: '',
		displayOptions: { show: { resource: ['answerChecklist'], operation: ['list'] } },
		description: 'Filtrar registros atualizados a partir desta data',
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
		const idService = this.getNodeParameter('acIdService', i) as number;

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'GET',
			url: `${baseUrl}/api/v1/answerchecklist/get?idService=${idService}`,
			headers: authHeaders,
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	if (operation === 'getByServiceOrder') {
		const idServiceOrder = this.getNodeParameter('acIdServiceOrder', i) as number;

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'GET',
			url: `${baseUrl}/api/v1/answerchecklist/getByServiceOrderId?idServiceOrder=${idServiceOrder}`,
			headers: authHeaders,
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	if (operation === 'list') {
		const numberOfRows = this.getNodeParameter('acNumberOfRows', i) as number;
		const numberOfRowsSkipped = this.getNodeParameter('acNumberOfRowsSkipped', i) as number;
		const updateDate = this.getNodeParameter('acUpdateDate', i, '') as string;

		const reqBody: IDataObject = { numberOfRows, numberOfRowsSkipped };
		if (updateDate) reqBody.updateDate = updateDate;

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'POST',
			url: `${baseUrl}/api/v1/answerchecklist/list`,
			headers: authHeaders,
			body: reqBody,
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	throw new NodeOperationError(this.getNode(), `Operação desconhecida: ${operation}`);
}
