import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { apiRequest, assertApiSuccess } from '../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Operação',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['addressPerson'] } },
		options: [
			{ name: 'Buscar', value: 'get', description: 'Buscar endereço da pessoa pelo ID do contato', action: 'Buscar endereço de pessoa' },
			{ name: 'Editar', value: 'put', description: 'Editar endereço da pessoa', action: 'Editar endereço de pessoa' },
		],
		default: 'get',
	},
	{
		displayName: 'ID do Contato',
		name: 'addrPersonId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: { show: { resource: ['addressPerson'], operation: ['get'] } },
		description: 'ID do contato para buscar o endereço',
	},
	{
		displayName: 'ID do Contato',
		name: 'addrPersonId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: { show: { resource: ['addressPerson'], operation: ['put'] } },
		description: 'ID do contato cujo endereço será editado',
	},
	{
		displayName: 'Título (Logradouro)',
		name: 'addrTitle',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['addressPerson'], operation: ['put'] } },
	},
	{
		displayName: 'Número',
		name: 'addrNumber',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['addressPerson'], operation: ['put'] } },
	},
	{
		displayName: 'Complemento',
		name: 'addrComplement',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['addressPerson'], operation: ['put'] } },
	},
	{
		displayName: 'Bairro',
		name: 'addrNeighborhood',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['addressPerson'], operation: ['put'] } },
	},
	{
		displayName: 'CEP',
		name: 'addrZipCode',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['addressPerson'], operation: ['put'] } },
	},
	{
		displayName: 'Latitude',
		name: 'addrLatitude',
		type: 'number',
		default: 0,
		displayOptions: { show: { resource: ['addressPerson'], operation: ['put'] } },
	},
	{
		displayName: 'Longitude',
		name: 'addrLongitude',
		type: 'number',
		default: 0,
		displayOptions: { show: { resource: ['addressPerson'], operation: ['put'] } },
	},
	{
		displayName: 'ID da Cidade',
		name: 'addrIdCity',
		type: 'number',
		default: 0,
		displayOptions: { show: { resource: ['addressPerson'], operation: ['put'] } },
	},
	{
		displayName: 'ID do Estado',
		name: 'addrIdState',
		type: 'number',
		default: 0,
		displayOptions: { show: { resource: ['addressPerson'], operation: ['put'] } },
	},
	{
		displayName: 'ID do País',
		name: 'addrIdCountry',
		type: 'number',
		default: 0,
		displayOptions: { show: { resource: ['addressPerson'], operation: ['put'] } },
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
		const addrPersonId = this.getNodeParameter('addrPersonId', i) as number;

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'GET',
			url: `${baseUrl}/api/v1/addressperson/get?idContact=${addrPersonId}`,
			headers: authHeaders,
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	if (operation === 'put') {
		const addrPersonId = this.getNodeParameter('addrPersonId', i) as number;
		const reqBody: IDataObject = {
			idContact: addrPersonId,
			title: this.getNodeParameter('addrTitle', i, '') as string,
			number: this.getNodeParameter('addrNumber', i, '') as string,
			complement: this.getNodeParameter('addrComplement', i, '') as string,
			neighborhood: this.getNodeParameter('addrNeighborhood', i, '') as string,
			zipCode: this.getNodeParameter('addrZipCode', i, '') as string,
			latitude: this.getNodeParameter('addrLatitude', i, 0) as number,
			longitude: this.getNodeParameter('addrLongitude', i, 0) as number,
			idCity: this.getNodeParameter('addrIdCity', i, 0) as number,
			idState: this.getNodeParameter('addrIdState', i, 0) as number,
			idCountry: this.getNodeParameter('addrIdCountry', i, 0) as number,
		};

		const { statusCode, body } = await apiRequest.call(this, {
			method: 'PUT',
			url: `${baseUrl}/api/v1/addressperson/put`,
			headers: authHeaders,
			body: reqBody,
		});
		assertApiSuccess(statusCode, body, this.getNode());

		const data = (body as IDataObject)?.data ?? body;
		return this.helpers.returnJsonArray(Array.isArray(data) ? data : [data as IDataObject]);
	}

	throw new NodeOperationError(this.getNode(), `Operação desconhecida: ${operation}`);
}
