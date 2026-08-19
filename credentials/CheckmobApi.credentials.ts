import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class CheckmobApi implements ICredentialType {
	name = 'checkmobApi';
	displayName = 'Checkmob API';
	documentationUrl = 'https://api-integration.checkmob.com/index.html';
	icon = 'file:checkmob.png' as const;

	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'hidden',
			default: 'https://api-integration.checkmob.com',
		},
		{
			displayName: 'Login',
			name: 'login',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'digite o seu login (usuário ou e-mail)',
		},
		{
			displayName: 'Senha',
			name: 'password',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			placeholder: 'digite a sua senha',
		},
	];
}
