<template>
	<div class="pix-key-container">
		<div class="pix-key-input-group" :class="{ 'without-selector': !showTypeSelector }">
			<div v-if="showTypeSelector" class="pix-type-selector">
				<v-select
					v-model="selectedType"
					:items="availableTypes"
					item-text="label"
					item-value="value"
					:disabled="props.disabled"
					placeholder="Tipo de chave"
					class="type-dropdown"
					@update:model-value="onTypeSelected"
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

			<div class="pix-key-input">
				<v-input
					:model-value="displayValue"
					:placeholder="currentPlaceholder"
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
					<template #append v-else-if="isValid && props.value">
						<v-icon name="check_circle" class="success-icon" />
					</template>
				</v-input>
			</div>
		</div>

		<div v-if="hasError && errorMessage" class="error-message">
			<v-icon name="error" />
			{{ errorMessage }}
		</div>

		<div v-else-if="isValid && props.value" class="success-message">
			{{ getSuccessMessage() }}
		</div>

		<div v-if="autoDetectType && autoDetected && selectedType" class="auto-detect-indicator">
			<v-icon name="auto_awesome" small />
			<span>Tipo detectado automaticamente</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import {
	cleanPixKey,
	detectPixKeyType,
	formatPixKey,
	PixKeyType,
	PIX_KEY_TYPE_ICONS,
	PIX_KEY_TYPE_LABELS,
	PIX_KEY_TYPE_PLACEHOLDERS,
	validatePixKey,
} from '../../utils/pix-validators';

interface Props {
	value?: string | null;
	placeholder?: string;
	disabled?: boolean;
	required?: boolean;
	autoDetectType?: boolean;
	auto_detect_type?: boolean;
	allowedTypes?: string[] | string | null;
	allowed_types?: string[] | string | null;
	defaultType?: string;
	default_type?: string;
	validateKey?: boolean;
	validate_key?: boolean;
	showTypeSelector?: boolean;
	show_type_selector?: boolean;
}

interface Emits {
	(event: 'input', value: string | null): void;
}

interface StoredPixData {
	key: string;
	type: PixKeyType | null;
}

const ALL_PIX_KEY_TYPES = Object.values(PixKeyType) as PixKeyType[];

function toPixType(value: unknown): PixKeyType | null {
	if (typeof value !== 'string') return null;
	return ALL_PIX_KEY_TYPES.includes(value as PixKeyType) ? (value as PixKeyType) : null;
}

function parseAllowedTypes(value: unknown): PixKeyType[] {
	let rawValues: unknown[] = [];

	if (Array.isArray(value)) {
		rawValues = value;
	} else if (typeof value === 'string' && value.trim().length > 0) {
		try {
			const parsed = JSON.parse(value);
			if (Array.isArray(parsed)) rawValues = parsed;
		} catch {
			rawValues = value
				.split(',')
				.map((item) => item.trim())
				.filter(Boolean);
		}
	}

	return [...new Set(rawValues.map((item) => toPixType(item)).filter((item): item is PixKeyType => item !== null))];
}

function parseStoredPixData(rawValue: string | null | undefined): StoredPixData | null {
	if (!rawValue) return null;

	try {
		const parsed = JSON.parse(rawValue);
		if (parsed && typeof parsed === 'object' && 'key' in parsed) {
			const key = typeof parsed.key === 'string' ? parsed.key : '';
			return {
				key,
				type: toPixType(parsed.type),
			};
		}
	} catch {
		// Keep backward compatibility with plain string values
	}

	return {
		key: rawValue,
		type: null,
	};
}

const props = withDefaults(defineProps<Props>(), {
	value: null,
	placeholder: 'Digite ou cole sua chave PIX',
	disabled: false,
	required: false,
	autoDetectType: true,
	validateKey: true,
	showTypeSelector: true,
});

const emit = defineEmits<Emits>();

const selectedType = ref<PixKeyType | null>(null);
const hasError = ref(false);
const errorMessage = ref('');
const isValid = ref(false);
const autoDetected = ref(false);

const showTypeSelector = computed(() => props.showTypeSelector ?? props.show_type_selector ?? true);
const autoDetectType = computed(() => props.autoDetectType ?? props.auto_detect_type ?? true);
const validateKey = computed(() => props.validateKey ?? props.validate_key ?? true);

const allowedTypes = computed(() => {
	const parsed = parseAllowedTypes(props.allowedTypes ?? props.allowed_types);
	return parsed.length > 0 ? parsed : ALL_PIX_KEY_TYPES;
});

const defaultType = computed(() => {
	const configuredDefault = toPixType(props.defaultType ?? props.default_type);
	if (configuredDefault && allowedTypes.value.includes(configuredDefault)) return configuredDefault;
	return allowedTypes.value[0] ?? PixKeyType.CPF;
});

const availableTypes = computed(() =>
	allowedTypes.value.map((type) => ({
		value: type,
		label: PIX_KEY_TYPE_LABELS[type],
		icon: PIX_KEY_TYPE_ICONS[type],
	}))
);

const currentPlaceholder = computed(() => {
	if (selectedType.value) return PIX_KEY_TYPE_PLACEHOLDERS[selectedType.value];
	return props.placeholder;
});

const displayValue = computed(() => {
	if (!props.value) return '';

	const parsed = parseStoredPixData(props.value);
	if (!parsed?.key) return '';

	if (!selectedType.value) return parsed.key;
	return formatPixKey(parsed.key, selectedType.value);
});

const getMaxLength = (): number => {
	switch (selectedType.value) {
		case PixKeyType.CPF:
			return 14;
		case PixKeyType.CNPJ:
			return 18;
		case PixKeyType.PHONE:
			return 19;
		case PixKeyType.EMAIL:
			return 254;
		case PixKeyType.EVP:
			return 36;
		default:
			return 255;
	}
};

const getCurrentIcon = (): string => {
	if (selectedType.value) return PIX_KEY_TYPE_ICONS[selectedType.value];
	return 'qr_code';
};

const getTypeLabel = (type: PixKeyType): string => PIX_KEY_TYPE_LABELS[type];

const getSuccessMessage = (): string => 'Chave PIX valida';

const validateValue = (value: string): boolean => {
	hasError.value = false;
	errorMessage.value = '';
	isValid.value = false;

	if (!value && props.required) {
		hasError.value = true;
		errorMessage.value = 'Chave PIX e obrigatoria';
		return false;
	}

	if (!value) return true;

	if (!selectedType.value) {
		hasError.value = true;
		errorMessage.value = 'Selecione o tipo de chave PIX';
		return false;
	}

	if (validateKey.value && !validatePixKey(value, selectedType.value)) {
		hasError.value = true;
		errorMessage.value = `Chave PIX ${getTypeLabel(selectedType.value)} invalida`;
		return false;
	}

	if (validateKey.value) isValid.value = true;
	return true;
};

const maybeAutoDetectType = (value: string) => {
	if (!autoDetectType.value) return;

	const shouldDetect = !selectedType.value || autoDetected.value || !showTypeSelector.value;
	if (!shouldDetect) return;

	const detectedType = detectPixKeyType(value);
	if (detectedType && allowedTypes.value.includes(detectedType)) {
		selectedType.value = detectedType;
		autoDetected.value = true;
	}
};

const updateValue = (newValue: string) => {
	if (autoDetected.value) autoDetected.value = false;

	if (!newValue || newValue.trim() === '') {
		emit('input', null);
		hasError.value = false;
		errorMessage.value = '';
		isValid.value = false;
		return;
	}

	maybeAutoDetectType(newValue);

	const formattedValue = selectedType.value ? formatPixKey(newValue, selectedType.value) : newValue.trim();
	validateValue(formattedValue);

	const cleanedValue = selectedType.value ? cleanPixKey(formattedValue, selectedType.value) : formattedValue;
	const pixData = {
		key: cleanedValue || null,
		type: selectedType.value ?? null,
	};

	emit('input', JSON.stringify(pixData));
};

const onBlur = () => {
	const parsed = parseStoredPixData(props.value);
	if (!parsed?.key) return;

	const valueToValidate = selectedType.value ? formatPixKey(parsed.key, selectedType.value) : parsed.key;
	validateValue(valueToValidate);
};

const onTypeSelected = (type: PixKeyType | null) => {
	selectedType.value = type;
	autoDetected.value = false;
};

const onKeyDown = (event: KeyboardEvent) => {
	if (!selectedType.value || ![PixKeyType.CPF, PixKeyType.CNPJ, PixKeyType.PHONE].includes(selectedType.value)) return;

	const controlKeys = new Set(['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End']);
	if (controlKeys.has(event.key)) return;

	if ((event.ctrlKey || event.metaKey) && ['a', 'c', 'v', 'x', 'z'].includes(event.key.toLowerCase())) return;

	if (!/^\d$/.test(event.key)) {
		event.preventDefault();
	}
};

watch(selectedType, (newType) => {
	if (!newType) return;

	const parsed = parseStoredPixData(props.value);
	if (!parsed?.key) return;

	const formatted = formatPixKey(parsed.key, newType);
	validateValue(formatted);
});

watch(
	() => props.value,
	(newValue) => {
		if (!newValue) {
			hasError.value = false;
			errorMessage.value = '';
			isValid.value = false;
			return;
		}

		const parsed = parseStoredPixData(newValue);
		if (!parsed?.key) return;

		const parsedType = parsed.type;
		if (parsedType && allowedTypes.value.includes(parsedType)) {
			selectedType.value = parsedType;
		} else {
			maybeAutoDetectType(parsed.key);
		}

		if (!selectedType.value || !allowedTypes.value.includes(selectedType.value)) {
			selectedType.value = defaultType.value;
		}

		const formatted = selectedType.value ? formatPixKey(parsed.key, selectedType.value) : parsed.key;
		validateValue(formatted);
	},
	{ immediate: true }
);

watch(
	allowedTypes,
	() => {
		if (!selectedType.value || !allowedTypes.value.includes(selectedType.value)) {
			selectedType.value = defaultType.value;
		}
	},
	{ immediate: true }
);

onMounted(() => {
	if (!props.value && (!selectedType.value || !allowedTypes.value.includes(selectedType.value))) {
		selectedType.value = defaultType.value;
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

.pix-key-input-group.without-selector .pix-key-input {
	width: 100%;
}

.pix-type-selector {
	min-width: 160px;
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
.type-option .v-icon,
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

.error-message,
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
