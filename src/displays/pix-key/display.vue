<template>
	<div class="pix-key-display" :class="{ 'clickable': copyToClipboard }" @click="handleCopy">
		<div class="pix-key-content">
			<!-- Type Icon Only -->
			<div v-if="pixKeyType" class="type-icon">
				<v-icon :name="getTypeIcon(pixKeyType)" size="16" />
			</div>
			
			<!-- PIX Key Value -->
			<div class="pix-key-value">
				<span v-if="displayValue" :title="copyToClipboard ? 'Clique para copiar' : ''">
					{{ displayValue }}
				</span>
				<span v-else class="no-value">—</span>
			</div>
			
			<!-- Actions -->
			<div class="pix-key-actions" v-if="pixKey && (copyToClipboard || showQrCode)">
				<!-- Copy Icon -->
				<v-icon 
					v-if="copyToClipboard"
					:name="copyIcon" 
					size="16"
					class="action-icon"
					@click.stop="handleCopy"
					v-tooltip="copyButtonTooltip"
				/>
				
				<!-- QR Code Icon -->
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

		<!-- Copy Success Notification -->
		<div v-if="showCopySuccess" class="copy-success">
			<v-icon name="check" size="12" />
			<span>Copiado!</span>
		</div>

		<!-- QR Code Dialog -->
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
import { ref, computed } from 'vue';
import {
	PixKeyType,
	PIX_KEY_TYPE_LABELS,
	PIX_KEY_TYPE_ICONS,
	formatPixKey,
	detectPixKeyType
} from '../../utils/pix-validators';

interface Props {
	value?: string | null;
	showTypeBadge?: boolean;
	formatKey?: boolean;
	hideKeyPartial?: boolean;
	copyToClipboard?: boolean;
	showQrCode?: boolean;
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

// Parse PIX key data
const pixData = computed(() => {
	if (!props.value) return null;
	
	try {
		// Try to parse as JSON (stored format)
		const parsed = JSON.parse(props.value);
		if (parsed.key && parsed.type) {
			return {
				key: parsed.key,
				type: parsed.type as PixKeyType
			};
		}
	} catch {
		// If not JSON, try to auto-detect
		const detectedType = detectPixKeyType(props.value);
		if (detectedType) {
			return {
				key: props.value,
				type: detectedType
			};
		}
	}
	
	return {
		key: props.value,
		type: null
	};
});

// Get PIX key
const pixKey = computed(() => pixData.value?.key || null);

// Get PIX key type
const pixKeyType = computed(() => pixData.value?.type || null);

// Get display value with formatting and privacy
const displayValue = computed(() => {
	if (!pixKey.value || !pixKeyType.value) return pixKey.value;
	
	let formatted = pixKey.value;
	
	// Apply formatting if enabled
	if (props.formatKey) {
		formatted = formatPixKey(pixKey.value, pixKeyType.value);
	}
	
	// Apply privacy mask if enabled
	if (props.hideKeyPartial && [PixKeyType.CPF, PixKeyType.CNPJ].includes(pixKeyType.value)) {
		formatted = maskPrivateKey(formatted, pixKeyType.value);
	}
	
	return formatted;
});

// Get type icon
const getTypeIcon = (type: PixKeyType): string => {
	return PIX_KEY_TYPE_ICONS[type] || 'qr_code';
};

// Get type label
const getTypeLabel = (type: PixKeyType): string => {
	return PIX_KEY_TYPE_LABELS[type] || type.toUpperCase();
};

// Copy button state
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

// Mask private keys (CPF/CNPJ) for privacy
const maskPrivateKey = (value: string, type: PixKeyType): string => {
	if (type === PixKeyType.CPF) {
		// CPF: 123.456.789-01 -> ***.***.***-01
		return value.replace(/\d{3}\.\d{3}\.\d{3}/, '***.***.***');
	}
	
	if (type === PixKeyType.CNPJ) {
		// CNPJ: 12.345.678/0001-90 -> **.***.***/****-90
		return value.replace(/\d{2}\.\d{3}\.\d{3}\/\d{4}/, '**.***.***/****');
	}
	
	return value;
};

// Handle copy to clipboard
const handleCopy = async () => {
	if (!props.copyToClipboard || !pixKey.value || copying.value) return;
	
	try {
		copying.value = true;
		
		// Use the unformatted key for copying
		await navigator.clipboard.writeText(pixKey.value);
		
		showCopySuccess.value = true;
		
		// Hide success message after 2 seconds
		setTimeout(() => {
			showCopySuccess.value = false;
		}, 2000);
		
	} catch (error) {
		console.error('Failed to copy PIX key:', error);
		
		// Fallback for older browsers
		try {
			const textArea = document.createElement('textarea');
			textArea.value = pixKey.value;
			document.body.appendChild(textArea);
			textArea.select();
			document.execCommand('copy');
			document.body.removeChild(textArea);
			
			showCopySuccess.value = true;
			setTimeout(() => {
				showCopySuccess.value = false;
			}, 2000);
		} catch (fallbackError) {
			console.error('Fallback copy also failed:', fallbackError);
		}
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
	color: rgba(0, 0, 0, 0.6);
	flex-shrink: 0;
}

.pix-key-value {
	font-family: var(--family-sans-serif);
	font-size: 13px;
	min-width: 0;
	flex: 1;
	color: rgba(0, 0, 0, 0.8);
}

.pix-key-value span {
	word-break: break-all;
}

.no-value {
	color: rgba(0, 0, 0, 0.4);
	font-style: italic;
}

.pix-key-actions {
	display: flex;
	align-items: center;
	gap: 4px;
	flex-shrink: 0;
}

.action-icon {
	color: rgba(0, 0, 0, 0.6);
	cursor: pointer;
	transition: color 0.2s ease;
}

.action-icon:hover {
	color: rgba(0, 0, 0, 0.8);
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
	background: rgba(0, 0, 0, 0.8);
	color: white;
	border-radius: 4px;
	font-size: 11px;
	white-space: nowrap;
	z-index: 1000;
	animation: fadeInOut 2s ease-in-out;
}

@keyframes fadeInOut {
	0%, 100% { opacity: 0; transform: translateX(-50%) translateY(4px); }
	20%, 80% { opacity: 1; transform: translateX(-50%) translateY(0); }
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
	color: rgba(0, 0, 0, 0.4);
}

.qr-code-placeholder p {
	margin: 8px 0;
}

.pix-key-text {
	font-family: var(--family-sans-serif);
	font-size: 12px;
	background: rgba(0, 0, 0, 0.05);
	padding: 8px;
	border-radius: 4px;
	word-break: break-all;
}

/* Responsive design */
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