<template>
	<div class="pix-key-container">
		<div class="pix-key-input-group">
			<!-- PIX Key Type Dropdown -->
			<div class="pix-type-selector">
				<v-select
					v-model="selectedType"
					:items="availableTypes"
					item-text="label"
					item-value="value"
					:disabled="disabled"
					:placeholder="'Tipo de chave'"
					class="type-dropdown"
				>
					<template #selection="{ item }">
						<div class="type-selection">
							<v-icon :name="item.icon" small />
							<span>{{ item.label }}</span>
						</div>
					</template>
					<template #item="{ item }">
						<div class="type-option">
							<v-icon :name="item.icon" small />
							<span>{{ item.label }}</span>
						</div>
					</template>
				</v-select>
			</div>

			<!-- PIX Key Input -->
			<div class="pix-key-input">
				<v-input
					:model-value="displayValue"
					:placeholder="props.placeholder"
					:disabled="props.disabled"
					:class="{ 'has-error': hasError }"
					@update:model-value="updateValue"
					@blur="onBlur"
					@keydown="onKeyDown"
					:maxlength="getMaxLength()"
				>
					<template #prepend>
						<v-icon :name="getCurrentIcon()" class="key-type-icon" />
					</template>
					<template #append v-if="hasError">
						<v-icon name="error" class="error-icon" />
					</template>
					<template #append v-else-if="isValid && value">
						<v-icon name="check_circle" class="success-icon" />
					</template>
				</v-input>
			</div>
		</div>
		
		<!-- Validation Messages -->
		<div v-if="hasError && errorMessage" class="error-message">
			<v-icon name="error" />
			{{ errorMessage }}
		</div>
		
		<div v-else-if="isValid && value" class="success-message">
			{{ getSuccessMessage() }}
		</div>

		<!-- Auto-detection indicator -->
		<div v-if="autoDetectType && autoDetected && selectedType" class="auto-detect-indicator">
			<v-icon name="auto_awesome" small />
			<span>Tipo detectado automaticamente</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import {
	PixKeyType,
	PIX_KEY_TYPE_LABELS,
	PIX_KEY_TYPE_ICONS,
	PIX_KEY_TYPE_PLACEHOLDERS,
	formatPixKey,
	validatePixKey,
	cleanPixKey,
	detectPixKeyType
} from '../../utils/pix-validators';

interface Props {
	value?: string | null;
	placeholder?: string;
	disabled?: boolean;
	required?: boolean;
	autoDetectType?: boolean;
	allowedTypes?: string[];
	defaultType?: string;
	validateKey?: boolean;
}

interface Emits {
	(event: 'input', value: string | null): void;
}

const props = withDefaults(defineProps<Props>(), {
	value: null,
	placeholder: 'Selecione o tipo de chave PIX...',
	disabled: false,
	required: false,
	autoDetectType: true,
	allowedTypes: () => [],
	defaultType: 'cpf',
	validateKey: true,
});

const emit = defineEmits<Emits>();

const selectedType = ref<PixKeyType | null>(null);
const hasError = ref(false);
const errorMessage = ref('');
const isValid = ref(false);
const autoDetected = ref(false);

// Available PIX key types based on allowed types
const availableTypes = computed(() => {
	const allTypes = Object.values(PixKeyType);
	const allowed = props.allowedTypes?.length ? props.allowedTypes : allTypes;
	
	return allowed.map(type => ({
		value: type,
		label: PIX_KEY_TYPE_LABELS[type as PixKeyType],
		icon: PIX_KEY_TYPE_ICONS[type as PixKeyType]
	}));
});

// Current placeholder based on selected type
const currentPlaceholder = computed(() => {
	if (selectedType.value) {
		return PIX_KEY_TYPE_PLACEHOLDERS[selectedType.value];
	}
	return props.placeholder;
});

// Display value with formatting
const displayValue = computed(() => {
	if (!props.value || !selectedType.value) return '';
	
	try {
		// Try to parse as JSON first
		const pixData = JSON.parse(props.value);
		if (pixData.key) {
			return formatPixKey(pixData.key, selectedType.value);
		}
	} catch {
		// If not JSON, format as plain string
		return formatPixKey(props.value, selectedType.value);
	}
	
	return '';
});

// Get max length based on type
const getMaxLength = (): number => {
	switch (selectedType.value) {
		case PixKeyType.CPF:
			return 14; // 123.456.789-01
		case PixKeyType.CNPJ:
			return 18; // 12.345.678/0001-90
		case PixKeyType.PHONE:
			return 15; // (11) 99999-9999
		case PixKeyType.EMAIL:
			return 254; // RFC standard
		default:
			return 255;
	}
};

// Get current icon
const getCurrentIcon = (): string => {
	if (selectedType.value) {
		return PIX_KEY_TYPE_ICONS[selectedType.value];
	}
	return 'qr_code';
};

// Get type label
const getTypeLabel = (type: PixKeyType): string => {
	return PIX_KEY_TYPE_LABELS[type];
};

// Get success message
const getSuccessMessage = (): string => {
	return 'Chave PIX válida';
};

// Validate the current value
const validateValue = (value: string): boolean => {
	hasError.value = false;
	errorMessage.value = '';
	isValid.value = false;
	
	// Check if value is required
	if (!value && props.required) {
		hasError.value = true;
		errorMessage.value = 'Chave PIX é obrigatória';
		return false;
	}
	
	// If no value, no validation needed
	if (!value) return true;
	
	// Check if type is selected
	if (!selectedType.value) {
		hasError.value = true;
		errorMessage.value = 'Selecione o tipo de chave PIX';
		return false;
	}
	
	// Validate the key if validation is enabled
	if (props.validateKey) {
		if (!validatePixKey(value, selectedType.value)) {
			hasError.value = true;
			errorMessage.value = `Chave PIX ${getTypeLabel(selectedType.value)} inválida`;
			return false;
		}
		
		isValid.value = true;
	}
	
	return true;
};

// Handle value updates
const updateValue = (newValue: string) => {
	// Reset auto-detection flag when user types
	if (autoDetected.value) {
		autoDetected.value = false;
	}
	
	// Handle empty/null values
	if (!newValue || newValue.trim() === '') {
		emit('input', null);
		hasError.value = false;
		errorMessage.value = '';
		isValid.value = false;
		return;
	}
	
	// Auto-detect type if enabled and no type is selected
	if (props.autoDetectType && newValue && !selectedType.value) {
		const detectedType = detectPixKeyType(newValue);
		if (detectedType && (!props.allowedTypes?.length || props.allowedTypes.includes(detectedType))) {
			selectedType.value = detectedType;
			autoDetected.value = true;
		}
	}
	
	// Format the value based on type
	let formattedValue = newValue;
	if (selectedType.value) {
		formattedValue = formatPixKey(newValue, selectedType.value);
	}
	
	// Validate the value
	validateValue(formattedValue);
	
	// Emit the clean value for storage
	const cleanValue = selectedType.value ? cleanPixKey(formattedValue, selectedType.value) : newValue;
	
	// Store as JSON to include both key and type
	const pixData = {
		key: cleanValue || null,
		type: selectedType.value || null
	};
	
	emit('input', JSON.stringify(pixData));
};

// Handle blur event
const onBlur = () => {
	if (props.value && selectedType.value) {
		try {
			const pixData = JSON.parse(props.value);
			if (pixData.key) {
				const formatted = formatPixKey(pixData.key, selectedType.value);
				validateValue(formatted);
				return;
			}
		} catch {
			// Continue with original logic
		}
		
		const formatted = formatPixKey(props.value, selectedType.value);
		validateValue(formatted);
	}
};

// Handle keydown for numeric types
const onKeyDown = (event: KeyboardEvent) => {
	// For CPF, CNPJ, and Phone, restrict to numbers only
	if (selectedType.value && [PixKeyType.CPF, PixKeyType.CNPJ, PixKeyType.PHONE].includes(selectedType.value)) {
		// Allow: backspace, delete, tab, escape, enter
		if ([8, 9, 27, 13, 46].indexOf(event.keyCode) !== -1 ||
			// Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
			(event.ctrlKey === true && [65, 67, 86, 88, 90].indexOf(event.keyCode) !== -1) ||
			// Allow: Cmd+A, Cmd+C, Cmd+V, Cmd+X, Cmd+Z (Mac)
			(event.metaKey === true && [65, 67, 86, 88, 90].indexOf(event.keyCode) !== -1) ||
			// Allow: home, end, left, right, down, up
			(event.keyCode >= 35 && event.keyCode <= 40)) {
			return;
		}
		
		// Only allow numbers
		if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && 
			(event.keyCode < 96 || event.keyCode > 105)) {
			event.preventDefault();
		}
	}
};

// Watch for type changes (manual selection)
watch(selectedType, (newType) => {
	// Reset auto-detection flag when user manually selects type
	autoDetected.value = false;
	
	if (props.value && newType) {
		try {
			const pixData = JSON.parse(props.value);
			if (pixData.key) {
				const formatted = formatPixKey(pixData.key, newType);
				validateValue(formatted);
				return;
			}
		} catch {
			// Continue with original logic
		}
		
		const formatted = formatPixKey(props.value, newType);
		validateValue(formatted);
	}
});

// Watch for external value changes
watch(() => props.value, (newValue) => {
	if (newValue) {
		try {
			// Try to parse as JSON (stored format)
			const pixData = JSON.parse(newValue);
			if (pixData.key && pixData.type) {
				selectedType.value = pixData.type;
				const formatted = formatPixKey(pixData.key, pixData.type);
				validateValue(formatted);
				return;
			}
		} catch {
			// If not JSON, treat as plain string
		}
		
		// Auto-detect type if enabled and no type selected
		if (props.autoDetectType && !selectedType.value) {
			const detectedType = detectPixKeyType(newValue);
			if (detectedType && (!props.allowedTypes?.length || props.allowedTypes.includes(detectedType))) {
				selectedType.value = detectedType;
				autoDetected.value = true;
			}
		}
		
		if (selectedType.value) {
			const formatted = formatPixKey(newValue, selectedType.value);
			validateValue(formatted);
		}
	} else {
		hasError.value = false;
		errorMessage.value = '';
		isValid.value = false;
	}
});

// Initialize on mount
onMounted(() => {
	// Set default type if no value and conditions are met
	if (!props.value && props.defaultType) {
		const defaultType = props.defaultType as PixKeyType;
		if (!props.allowedTypes?.length || props.allowedTypes.includes(defaultType)) {
			selectedType.value = defaultType;
		}
	}
});
</script>

<style scoped>
.pix-key-container {
	width: 100%;
}

.pix-key-input-group {
	display: flex;
	gap: 8px;
	align-items: flex-start;
}

.pix-type-selector {
	min-width: 140px;
	flex-shrink: 0;
}

.pix-key-input {
	flex: 1;
}

.type-dropdown {
	border-radius: 6px 0 0 6px;
}

.type-selection,
.type-option {
	display: flex;
	align-items: center;
	gap: 8px;
}

.type-selection .v-icon,
.type-option .v-icon {
	color: var(--foreground-subdued);
}

.key-type-icon {
	color: var(--foreground-subdued);
}

.has-error {
	border-color: var(--danger) !important;
}

.error-icon {
	color: var(--danger);
}

.success-icon {
	color: var(--success);
}

.message {
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 12px;
	margin-top: 6px;
}

.error-message {
	font-size: 12px;
	margin-top: 4px;
}

.success-message {
	font-size: 12px;
	margin-top: 4px;
}

.auto-detect-indicator {
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 11px;
	color: var(--foreground-subdued);
	margin-top: 4px;
}

@media (max-width: 600px) {
	.pix-key-input-group {
		flex-direction: column;
		gap: 12px;
	}
	
	.pix-type-selector {
		min-width: unset;
		width: 100%;
	}
}
</style> 