// PIX Key Types
export enum PixKeyType {
	CPF = 'cpf',
	CNPJ = 'cnpj',
	PHONE = 'phone',
	EMAIL = 'email',
	EVP = 'evp',
}

// PIX Key Type Labels
export const PIX_KEY_TYPE_LABELS = {
	[PixKeyType.CPF]: 'CPF',
	[PixKeyType.CNPJ]: 'CNPJ',
	[PixKeyType.PHONE]: 'Telefone',
	[PixKeyType.EMAIL]: 'E-mail',
	[PixKeyType.EVP]: 'EVP (Aleatoria)',
};

// PIX Key Type Icons
export const PIX_KEY_TYPE_ICONS = {
	[PixKeyType.CPF]: 'person',
	[PixKeyType.CNPJ]: 'business',
	[PixKeyType.PHONE]: 'phone',
	[PixKeyType.EMAIL]: 'email',
	[PixKeyType.EVP]: 'key',
};

// PIX Key Type Placeholders
export const PIX_KEY_TYPE_PLACEHOLDERS = {
	[PixKeyType.CPF]: '123.456.789-01',
	[PixKeyType.CNPJ]: '12.345.678/0001-90',
	[PixKeyType.PHONE]: '+55 (11) 99999-9999',
	[PixKeyType.EMAIL]: 'exemplo@email.com',
	[PixKeyType.EVP]: '123e4567-e89b-12d3-a456-426614174000',
};

export const BRAZILIAN_AREA_CODES = [
	11, 12, 13, 14, 15, 16, 17, 18, 19, // Sao Paulo
	21, 22, 24, // Rio de Janeiro
	27, 28, // Espirito Santo
	31, 32, 33, 34, 35, 37, 38, // Minas Gerais
	41, 42, 43, 44, 45, 46, // Parana
	47, 48, 49, // Santa Catarina
	51, 53, 54, 55, // Rio Grande do Sul
	61, // Distrito Federal
	62, 64, // Goias
	63, // Tocantins
	65, 66, // Mato Grosso
	67, // Mato Grosso do Sul
	68, // Acre
	69, // Rondonia
	71, 73, 74, 75, 77, // Bahia
	79, // Sergipe
	81, 87, // Pernambuco
	82, // Alagoas
	83, // Paraiba
	84, // Rio Grande do Norte
	85, 88, // Ceara
	86, 89, // Piaui
	91, 93, 94, // Para
	92, 97, // Amazonas
	95, // Roraima
	96, // Amapa
	98, 99, // Maranhao
];

function normalizePhoneDigits(value: string): { local: string; hasCountryCode: boolean } {
	const onlyDigits = value.replace(/\D/g, '');
	const hasCountryCode = onlyDigits.startsWith('55') && (onlyDigits.length === 12 || onlyDigits.length === 13);
	const local = hasCountryCode ? onlyDigits.slice(2) : onlyDigits;
	return { local, hasCountryCode };
}

// CPF Validation
export function formatCPF(value: string): string {
	const cleanValue = value.replace(/\D/g, '');

	if (cleanValue.length === 0) return '';
	if (cleanValue.length <= 3) return cleanValue;
	if (cleanValue.length <= 6) return cleanValue.replace(/(\d{3})(\d{1,3})/, '$1.$2');
	if (cleanValue.length <= 9) return cleanValue.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');

	return cleanValue.slice(0, 11).replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
}

export function isValidCPF(cpf: string): boolean {
	const cleanCPF = cpf.replace(/\D/g, '');

	if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF)) {
		return false;
	}

	let sum = 0;
	for (let i = 0; i < 9; i++) {
		sum += Number.parseInt(cleanCPF.charAt(i), 10) * (10 - i);
	}
	let digit1 = 11 - (sum % 11);
	if (digit1 > 9) digit1 = 0;

	sum = 0;
	for (let i = 0; i < 10; i++) {
		sum += Number.parseInt(cleanCPF.charAt(i), 10) * (11 - i);
	}
	let digit2 = 11 - (sum % 11);
	if (digit2 > 9) digit2 = 0;

	return digit1 === Number.parseInt(cleanCPF.charAt(9), 10) && digit2 === Number.parseInt(cleanCPF.charAt(10), 10);
}

export function cleanCPF(cpf: string): string {
	return cpf.replace(/\D/g, '');
}

// CNPJ Validation
export function formatCNPJ(value: string): string {
	const cleanValue = value.replace(/\D/g, '');

	if (cleanValue.length === 0) return '';
	if (cleanValue.length <= 2) return cleanValue;
	if (cleanValue.length <= 5) return cleanValue.replace(/(\d{2})(\d{1,3})/, '$1.$2');
	if (cleanValue.length <= 8) return cleanValue.replace(/(\d{2})(\d{3})(\d{1,3})/, '$1.$2.$3');
	if (cleanValue.length <= 12) return cleanValue.replace(/(\d{2})(\d{3})(\d{3})(\d{1,4})/, '$1.$2.$3/$4');

	return cleanValue.slice(0, 14).replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/, '$1.$2.$3/$4-$5');
}

export function isValidCNPJ(cnpj: string): boolean {
	const cleanCNPJ = cnpj.replace(/\D/g, '');

	if (cleanCNPJ.length !== 14 || /^(\d)\1{13}$/.test(cleanCNPJ)) {
		return false;
	}

	let size = cleanCNPJ.length - 2;
	let numbers = cleanCNPJ.substring(0, size);
	const digits = cleanCNPJ.substring(size);
	let sum = 0;
	let pos = size - 7;

	for (let i = size; i >= 1; i--) {
		sum += Number.parseInt(numbers.charAt(size - i), 10) * pos--;
		if (pos < 2) pos = 9;
	}

	let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
	if (result !== Number.parseInt(digits.charAt(0), 10)) {
		return false;
	}

	size += 1;
	numbers = cleanCNPJ.substring(0, size);
	sum = 0;
	pos = size - 7;

	for (let i = size; i >= 1; i--) {
		sum += Number.parseInt(numbers.charAt(size - i), 10) * pos--;
		if (pos < 2) pos = 9;
	}

	result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
	return result === Number.parseInt(digits.charAt(1), 10);
}

export function cleanCNPJ(cnpj: string): string {
	return cnpj.replace(/\D/g, '');
}

// Phone Validation
export function formatPhone(value: string): string {
	const { local, hasCountryCode } = normalizePhoneDigits(value);

	if (local.length === 0) return '';

	let formattedLocal = local;
	if (local.length <= 2) {
		formattedLocal = `(${local}`;
	} else if (local.length <= 6) {
		formattedLocal = local.replace(/(\d{2})(\d{1,4})/, '($1) $2');
	} else if (local.length <= 10) {
		formattedLocal = local.replace(/(\d{2})(\d{4})(\d{1,4})/, '($1) $2-$3');
	} else {
		formattedLocal = local.slice(0, 11).replace(/(\d{2})(\d{5})(\d{1,4})/, '($1) $2-$3');
	}

	return hasCountryCode ? `+55 ${formattedLocal}` : formattedLocal;
}

export function isValidPhone(phone: string): boolean {
	const { local } = normalizePhoneDigits(phone);

	if (local.length < 10 || local.length > 11) {
		return false;
	}

	const areaCode = Number.parseInt(local.substring(0, 2), 10);
	if (!BRAZILIAN_AREA_CODES.includes(areaCode)) {
		return false;
	}

	const thirdDigit = Number.parseInt(local.charAt(2), 10);
	if (local.length === 11 && thirdDigit !== 9) {
		return false;
	}

	if (local.length === 10 && ![2, 3, 4, 5, 6, 7, 8, 9].includes(thirdDigit)) {
		return false;
	}

	return true;
}

export function cleanPhone(phone: string): string {
	return phone.replace(/\D/g, '');
}

// Email Validation
export function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

// EVP Validation (Random PIX key UUID)
export function isValidEVP(value: string): boolean {
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	return uuidRegex.test(value.trim());
}

// PIX Key Auto-detection
export function detectPixKeyType(value: string): PixKeyType | null {
	if (!value) return null;

	const cleanValue = value.trim();

	if (isValidEmail(cleanValue)) {
		return PixKeyType.EMAIL;
	}

	if (isValidEVP(cleanValue)) {
		return PixKeyType.EVP;
	}

	const numbersOnly = cleanValue.replace(/\D/g, '');

	if ((numbersOnly.length === 12 || numbersOnly.length === 13) && numbersOnly.startsWith('55')) {
		return PixKeyType.PHONE;
	}

	if (numbersOnly.length === 11) {
		const areaCode = Number.parseInt(numbersOnly.substring(0, 2), 10);
		if (BRAZILIAN_AREA_CODES.includes(areaCode) && numbersOnly.charAt(2) === '9') {
			return PixKeyType.PHONE;
		}

		return PixKeyType.CPF;
	}

	if (numbersOnly.length === 10) {
		return PixKeyType.PHONE;
	}

	if (numbersOnly.length === 14) {
		return PixKeyType.CNPJ;
	}

	return null;
}

// PIX Key Formatting
export function formatPixKey(value: string, type: PixKeyType): string {
	switch (type) {
		case PixKeyType.CPF:
			return formatCPF(value);
		case PixKeyType.CNPJ:
			return formatCNPJ(value);
		case PixKeyType.PHONE:
			return formatPhone(value);
		case PixKeyType.EMAIL:
			return value.trim().toLowerCase();
		case PixKeyType.EVP:
			return value.trim().toLowerCase();
		default:
			return value;
	}
}

// PIX Key Validation
export function validatePixKey(value: string, type: PixKeyType): boolean {
	if (!value) return false;

	switch (type) {
		case PixKeyType.CPF:
			return isValidCPF(value);
		case PixKeyType.CNPJ:
			return isValidCNPJ(value);
		case PixKeyType.PHONE:
			return isValidPhone(value);
		case PixKeyType.EMAIL:
			return isValidEmail(value);
		case PixKeyType.EVP:
			return isValidEVP(value);
		default:
			return false;
	}
}

// PIX Key Cleaning (remove formatting)
export function cleanPixKey(value: string, type: PixKeyType): string {
	switch (type) {
		case PixKeyType.CPF:
			return cleanCPF(value);
		case PixKeyType.CNPJ:
			return cleanCNPJ(value);
		case PixKeyType.PHONE:
			return cleanPhone(value);
		case PixKeyType.EMAIL:
			return value.trim().toLowerCase();
		case PixKeyType.EVP:
			return value.trim().toLowerCase();
		default:
			return value;
	}
}
