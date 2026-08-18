import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { apiRequest, assertApiSuccess } from '../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Operação',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['addressClient'] } },
		options: [
			{ name: 'Buscar', value: 'get', description: 'Buscar endereço do cliente pelo ID', action: 'Buscar endereço do cliente' },
			{ name: 'Editar', value: 'put', description: 'Editar endereço do cliente', action: 'Editar endereço do cliente' },
		],
		default: 'get',
	},
	{
		displayName: 'ID do Cliente',
		name: 'addrClientId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: { show: { resource: ['addressClient'], operation: ['get'] } },
		description: 'ID do cliente para buscar o endereço',
	},
	{
		displayName: 'ID do Cliente',
		name: 'addrClientId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: { show: { resource: ['addressClient'], operation: ['put'] } },
		description: 'ID do cliente cujo endereço será editado',
	},
	{
		displayName: 'Endereço',
		name: 'address',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['addressClient'], operation: ['put'] } },
		description: 'Logradouro (rua, avenida, etc.)',
	},
	{
		displayName: 'Número',
		name: 'number',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['addressClient'], operation: ['put'] } },
	},
	{
		displayName: 'Complemento',
		name: 'complement',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['addressClient'], operation: ['put'] } },
	},
	{
		displayName: 'Bairro',
		name: 'neighborhood',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['addressClient'], operation: ['put'] } },
	},
	{
		displayName: 'CEP',
		name: 'zipCode',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['addressClient'], operation: ['put'] } },
	},
	{
		displayName: 'Latitude',
		name: 'latitude',
		type: 'number',
		default: 0,
		displayOptions: { show: { resource: ['addressClient'], operation: ['put'] } },
	},
	{
		displayName: 'Longitude',
		name: 'longitude',
		type: 'number',
		default: 0,
		displayOptions: { show: { resource: ['addressClient'], operation: ['put'] } },
	},
	{
		displayName: 'Cidade',
		name: 'city',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['addressClient'], operation: ['put'] } },
	},
	{
		displayName: 'Estado',
		name: 'state',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['addressClient'], operation: ['put'] } },
	},
	{
		displayName: 'País',
		name: 'country',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['addressClient'], operation: ['put'] } },
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
		const addrClientId = this.getNodeParameter('addrClientId', i) as number;

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'GET',
			url: `${baseUrl}/api/v1/addressclient/get?idClient=${addrClientId}`,
			headers: authHeaders,
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	if (operation === 'put') {
		const addrClientId = this.getNodeParameter('addrClientId', i) as number;
		const reqBody: IDataObject = {
			idClient: addrClientId,
			address: this.getNodeParameter('address', i, '') as string,
			number: this.getNodeParameter('number', i, '') as string,
			complement: this.getNodeParameter('complement', i, '') as string,
			neighborhood: this.getNodeParameter('neighborhood', i, '') as string,
			zipCode: this.getNodeParameter('zipCode', i, '') as string,
			latitude: this.getNodeParameter('latitude', i, 0) as number,
			longitude: this.getNodeParameter('longitude', i, 0) as number,
			city: this.getNodeParameter('city', i, '') as string,
			state: this.getNodeParameter('state', i, '') as string,
			country: this.getNodeParameter('country', i, '') as string,
		};

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'PUT',
			url: `${baseUrl}/api/v1/addressclient/put`,
			headers: authHeaders,
			body: reqBody,
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	throw new NodeOperationError(this.getNode(), `Operação desconhecida: ${operation}`);
}
