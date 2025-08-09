import { defineDisplay } from '@directus/extensions-sdk';
import DisplayComponent from './display.vue';

export default defineDisplay({
	id: 'brazilian-pix-key-display',
	name: 'Brazilian PIX Key Display',
	description: 'Display Brazilian PIX key with type badge and proper formatting',
	icon: 'qr_code',
	component: DisplayComponent,
	types: ['string'],
	options: [
		{
			field: 'show_type_badge',
			name: 'Show Type Badge',
			type: 'boolean',
			meta: {
				width: 'half',
				interface: 'boolean',
				note: 'Display a badge showing the PIX key type (CPF, CNPJ, Phone, Email)',
			},
			schema: {
				default_value: true,
			},
		},
		{
			field: 'format_key',
			name: 'Format Key',
			type: 'boolean',
			meta: {
				width: 'half',
				interface: 'boolean',
				note: 'Apply formatting to CPF, CNPJ, and phone numbers',
			},
			schema: {
				default_value: true,
			},
		},
		{
			field: 'hide_key_partial',
			name: 'Hide Partial Key',
			type: 'boolean',
			meta: {
				width: 'half',
				interface: 'boolean',
				note: 'Hide part of the key for privacy (CPF and CNPJ only)',
			},
			schema: {
				default_value: false,
			},
		},
		{
			field: 'copy_to_clipboard',
			name: 'Enable Copy to Clipboard',
			type: 'boolean',
			meta: {
				width: 'half',
				interface: 'boolean',
				note: 'Allow users to copy the PIX key by clicking on it',
			},
			schema: {
				default_value: true,
			},
		},
		{
			field: 'show_qr_code',
			name: 'Show QR Code Option',
			type: 'boolean',
			meta: {
				width: 'half',
				interface: 'boolean',
				note: 'Show a button to generate QR code for the PIX key',
			},
			schema: {
				default_value: false,
			},
		},
	],
}); 