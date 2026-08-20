import { config } from '@n8n/node-cli/eslint';

export default [
	...config,
	{
		files: ['nodes/**/*.ts', 'credentials/**/*.ts'],
		rules: {
			// Regras de title/sentence-case do preset assumem inglês e corrompem
			// acentuação em PT-BR (ex.: "questionários" -> "question rios") quando
			// aplicado --fix. Textos do node são em português, então ficam desligadas.
			'n8n-nodes-base/node-param-display-name-miscased': 'off',
			'n8n-nodes-base/node-param-operation-option-action-miscased': 'off',
			// Ordenação alfabética das opções não é aplicável ao agrupamento
			// funcional/lógico já usado nas listas de operação e filtros do node.
			'n8n-nodes-base/node-param-options-type-unsorted-items': 'off',
			'n8n-nodes-base/node-param-collection-type-unsorted-items': 'off',
			// Ícone atual é PNG único (checkmob.png); não há SVG nem variantes
			// light/dark do logo disponíveis.
			'n8n-nodes-base/node-class-description-icon-not-svg': 'off',
			'@n8n/community-nodes/icon-prefer-themed-variants': 'off',
		},
	},
];
