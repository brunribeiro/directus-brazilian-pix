import { defineInterface } from '@directus/extensions-sdk';
import InterfaceComponent from './interface.vue';

export default defineInterface({
	id: 'pix-key',
	name: 'Brazilian PIX Key',
	description: 'With type selection and validation (CPF, CNPJ, Phone, Email, EVP)',
	icon: 'qr_code_2',
	component: InterfaceComponent,
	types: ['string'],
	group: 'standard',
	options: [
		{
			field: 'placeholder',
			name: 'Placeholder',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'input',
			},
			schema: {
				default_value: 'Digite ou cole sua chave PIX',
			},
		},
		{
			field: 'disabled',
			name: 'Disabled',
			type: 'boolean',
			meta: {
				width: 'half',
				interface: 'boolean',
			},
			schema: {
				default_value: false,
			},
		},
		{
			field: 'required',
			name: 'Required',
			type: 'boolean',
			meta: {
				width: 'half',
				interface: 'boolean',
			},
			schema: {
				default_value: false,
			},
		},
		{
			field: 'auto_detect_type',
			name: 'Auto-detect PIX Key Type',
			type: 'boolean',
			meta: {
				width: 'half',
				interface: 'boolean',
				note: 'Automatically detect PIX key type based on input format',
			},
			schema: {
				default_value: true,
			},
		},
		{
			field: 'allowed_types',
			name: 'Allowed PIX Key Types',
			type: 'json',
			meta: {
				width: 'full',
				interface: 'select-multiple-checkbox',
				options: {
					choices: [
						{ text: 'CPF', value: 'cpf' },
						{ text: 'CNPJ', value: 'cnpj' },
						{ text: 'Telefone', value: 'phone' },
						{ text: 'E-mail', value: 'email' },
						{ text: 'EVP (Aleatoria)', value: 'evp' }
					]
				},
				note: 'Select which PIX key types are allowed. Leave empty to allow all types.',
			},
		},
		{
			field: 'default_type',
			name: 'Default PIX Key Type',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'select-dropdown',
				options: {
					choices: [
						{ text: 'CPF', value: 'cpf' },
						{ text: 'CNPJ', value: 'cnpj' },
						{ text: 'Telefone', value: 'phone' },
						{ text: 'E-mail', value: 'email' },
						{ text: 'EVP (Aleatoria)', value: 'evp' }
					]
				},
				note: 'Default PIX key type when creating new items',
			},
			schema: {
				default_value: 'cpf',
			},
		},
		{
			field: 'show_type_selector',
			name: 'Show Type Selector',
			type: 'boolean',
			meta: {
				width: 'half',
				interface: 'boolean',
				note: 'Show or hide the PIX key type selector',
			},
			schema: {
				default_value: true,
			},
		},
		{
			field: 'validate_key',
			name: 'Validate Key Format',
			type: 'boolean',
			meta: {
				width: 'half',
				interface: 'boolean',
				note: 'Validar formato da chave',
			},
			schema: {
				default_value: true,
			},
		},
	],
}); 
