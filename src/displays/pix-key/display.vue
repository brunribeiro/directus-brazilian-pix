<template>
	<div class="pix-key-display" :class="{ clickable: canCopy }" @click="handleCopy">
		<div class="pix-key-content">
			<div v-if="showTypeBadge && pixKeyType" class="type-icon">
				<v-icon :name="getTypeIcon(pixKeyType)" size="16" />
			</div>

			<div class="pix-key-value">
				<span v-if="displayValue" :title="canCopy ? 'Clique para copiar' : ''">
					{{ displayValue }}
				</span>
				<span v-else class="no-value">—</span>
			</div>

			<div class="pix-key-actions" v-if="pixKey && (canCopy || showQrCode)">
				<v-icon
					v-if="canCopy"
					:name="copyIcon"
					size="16"
					class="action-icon"
					@click.stop="handleCopy"
					v-tooltip="copyButtonTooltip"
				/>

				<v-icon
					v-if="showQrCode"
					name="qr_code"
					size="16"
					class="action-icon"
					@click.stop="showQRDialog = true"
					v-tooltip="'Gerar QR Code'"
				/>
			</div>
		</div>

		<div v-if="showCopySuccess" class="copy-success">
			<v-icon name="check" size="12" />
			<span>Copiado!</span>
		</div>

		<v-dialog v-model="showQRDialog" @esc="showQRDialog = false">
			<v-card>
				<v-card-title>
					<div class="dialog-title">
						<v-icon name="qr_code" />
						<span>QR Code - Chave PIX</span>
					</div>
				</v-card-title>
				<v-card-text>
					<div class="qr-code-container">
						<div class="qr-code-placeholder">
							<v-icon name="qr_code" size="120" />
							<p>QR Code seria gerado aqui</p>
							<p class="pix-key-text">{{ pixKey }}</p>
						</div>
					</div>
				</v-card-text>
				<v-card-actions>
					<v-button @click="showQRDialog = false">Fechar</v-button>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { detectPixKeyType, formatPixKey, PixKeyType, PIX_KEY_TYPE_ICONS } from '../../utils/pix-validators';

interface Props {
	value?: string | null;
	showTypeBadge?: boolean;
	show_type_badge?: boolean;
	formatKey?: boolean;
	format_key?: boolean;
	hideKeyPartial?: boolean;
	hide_key_partial?: boolean;
	copyToClipboard?: boolean;
	copy_to_clipboard?: boolean;
	showQrCode?: boolean;
	show_qr_code?: boolean;
}

interface ParsedPixData {
	key: string;
	type: PixKeyType | null;
}

const ALL_PIX_KEY_TYPES = Object.values(PixKeyType) as PixKeyType[];

function toPixType(value: unknown): PixKeyType | null {
	if (typeof value !== 'string') return null;
	return ALL_PIX_KEY_TYPES.includes(value as PixKeyType) ? (value as PixKeyType) : null;
}

function parsePixData(rawValue: string | null | undefined): ParsedPixData | null {
	if (!rawValue) return null;

	try {
		const parsed = JSON.parse(rawValue);
		if (parsed && typeof parsed === 'object' && 'key' in parsed) {
			const key = typeof parsed.key === 'string' ? parsed.key : '';
			const explicitType = toPixType(parsed.type);
			return {
				key,
				type: explicitType ?? detectPixKeyType(key),
			};
		}
	} catch {
		// Keep backward compatibility with plain string values
	}

	return {
		key: rawValue,
		type: detectPixKeyType(rawValue),
	};
}

const props = withDefaults(defineProps<Props>(), {
	value: null,
	showTypeBadge: true,
	formatKey: true,
	hideKeyPartial: false,
	copyToClipboard: true,
	showQrCode: false,
});

const copying = ref(false);
const showCopySuccess = ref(false);
const showQRDialog = ref(false);

const showTypeBadge = computed(() => props.showTypeBadge ?? props.show_type_badge ?? true);
const formatKey = computed(() => props.formatKey ?? props.format_key ?? true);
const hideKeyPartial = computed(() => props.hideKeyPartial ?? props.hide_key_partial ?? false);
const copyToClipboard = computed(() => props.copyToClipboard ?? props.copy_to_clipboard ?? true);
const showQrCode = computed(() => props.showQrCode ?? props.show_qr_code ?? false);

const pixData = computed(() => parsePixData(props.value));
const pixKey = computed(() => pixData.value?.key || null);
const pixKeyType = computed(() => pixData.value?.type || null);
const canCopy = computed(() => copyToClipboard.value && !!pixKey.value);

const displayValue = computed(() => {
	if (!pixKey.value) return null;

	let formatted = pixKey.value;
	if (formatKey.value && pixKeyType.value) {
		formatted = formatPixKey(pixKey.value, pixKeyType.value);
	}

	if (hideKeyPartial.value && pixKeyType.value && [PixKeyType.CPF, PixKeyType.CNPJ].includes(pixKeyType.value)) {
		formatted = maskPrivateKey(formatted, pixKeyType.value);
	}

	return formatted;
});

const getTypeIcon = (type: PixKeyType): string => PIX_KEY_TYPE_ICONS[type] || 'qr_code';

const copyIcon = computed(() => {
	if (copying.value) return 'hourglass_empty';
	if (showCopySuccess.value) return 'check';
	return 'content_copy';
});

const copyButtonTooltip = computed(() => {
	if (copying.value) return 'Copiando...';
	if (showCopySuccess.value) return 'Copiado!';
	return 'Copiar chave PIX';
});

const maskPrivateKey = (value: string, type: PixKeyType): string => {
	if (type === PixKeyType.CPF) {
		return value.replace(/\d{3}\.\d{3}\.\d{3}/, '***.***.***');
	}

	if (type === PixKeyType.CNPJ) {
		return value.replace(/\d{2}\.\d{3}\.\d{3}\/\d{4}/, '**.***.***/****');
	}

	return value;
};

const handleCopy = async () => {
	if (!canCopy.value || !pixKey.value || copying.value) return;

	try {
		copying.value = true;

		if (navigator.clipboard?.writeText) {
			await navigator.clipboard.writeText(pixKey.value);
		} else {
			const textArea = document.createElement('textarea');
			textArea.value = pixKey.value;
			document.body.appendChild(textArea);
			textArea.select();
			document.execCommand('copy');
			document.body.removeChild(textArea);
		}

		showCopySuccess.value = true;
		setTimeout(() => {
			showCopySuccess.value = false;
		}, 2000);
	} catch (error) {
		console.error('Failed to copy PIX key:', error);
	} finally {
		copying.value = false;
	}
};
</script>

<style scoped>
.pix-key-display {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	max-width: 100%;
	position: relative;
}

.pix-key-display.clickable {
	cursor: pointer;
}

.pix-key-content {
	display: flex;
	align-items: center;
	gap: 8px;
	min-width: 0;
	flex: 1;
}

.type-icon {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	color: var(--foreground-subdued);
	flex-shrink: 0;
}

.pix-key-value {
	font-family: var(--family-sans-serif);
	font-size: 13px;
	min-width: 0;
	flex: 1;
	color: var(--foreground);
}

.pix-key-value span {
	word-break: break-all;
}

.no-value {
	color: var(--foreground-subdued);
	font-style: italic;
}

.pix-key-actions {
	display: flex;
	align-items: center;
	gap: 4px;
	flex-shrink: 0;
}

.action-icon {
	color: var(--foreground-subdued);
	cursor: pointer;
	transition: color 0.2s ease;
}

.action-icon:hover {
	color: var(--foreground);
}

.copy-success {
	position: absolute;
	top: -30px;
	left: 50%;
	transform: translateX(-50%);
	display: flex;
	align-items: center;
	gap: 4px;
	padding: 4px 8px;
	background: var(--background-normal-alt);
	color: var(--foreground);
	border: 1px solid var(--border-normal);
	border-radius: 4px;
	font-size: 11px;
	white-space: nowrap;
	z-index: 1000;
	animation: fadeInOut 2s ease-in-out;
}

@keyframes fadeInOut {
	0%,
	100% {
		opacity: 0;
		transform: translateX(-50%) translateY(4px);
	}
	20%,
	80% {
		opacity: 1;
		transform: translateX(-50%) translateY(0);
	}
}

.dialog-title {
	display: flex;
	align-items: center;
	gap: 8px;
}

.qr-code-container {
	display: flex;
	justify-content: center;
	padding: 20px;
}

.qr-code-placeholder {
	text-align: center;
	color: var(--foreground-subdued);
}

.qr-code-placeholder p {
	margin: 8px 0;
}

.pix-key-text {
	font-family: var(--family-sans-serif);
	font-size: 12px;
	background: var(--background-normal-alt);
	padding: 8px;
	border-radius: 4px;
	word-break: break-all;
}

@media (max-width: 600px) {
	.pix-key-content {
		flex-direction: column;
		align-items: flex-start;
		gap: 4px;
	}

	.type-icon {
		align-self: flex-start;
	}
}
</style>
