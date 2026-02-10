# Brazilian PIX Key Extension - Demo

This extension provides a comprehensive solution for handling Brazilian PIX keys in Directus.

## 🎯 Key Features Demo

### 1. Auto-Detection
The extension automatically detects the PIX key type based on input:

- **CPF**: `12345678901` → Detects as CPF, formats to `123.456.789-01`
- **CNPJ**: `12345678000190` → Detects as CNPJ, formats to `12.345.678/0001-90`
- **Phone**: `11999887766` → Detects as phone, formats to `(11) 99988-7766`
- **Email**: `user@example.com` → Detects as email, keeps as `user@example.com`
- **EVP**: `123e4567-e89b-12d3-a456-426614174000` → Detects as EVP

### 2. Real-time Validation
Each type uses official Brazilian validation algorithms:

- ✅ **Valid CPF**: `123.456.789-09` (passes CPF check-digit algorithm)
- ❌ **Invalid CPF**: `123.456.789-00` (fails validation)
- ✅ **Valid CNPJ**: `11.222.333/0001-81` (passes CNPJ validation)
- ❌ **Invalid Phone**: `(00) 99999-9999` (invalid area code)
- ✅ **Valid EVP**: `123e4567-e89b-12d3-a456-426614174000` (UUID format)

### 3. Type-specific Formatting
- **CPF**: 123.456.789-01
- **CNPJ**: 12.345.678/0001-90  
- **Phone**: (11) 99999-9999
- **Email**: user@domain.com (lowercased)
- **EVP**: 123e4567-e89b-12d3-a456-426614174000

### 4. Display with Type Badges
The display extension shows color-coded badges:

- 🔵 **CPF** - Blue badge
- 🟣 **CNPJ** - Purple badge  
- 🟢 **Phone** - Green badge
- 🟠 **Email** - Orange badge
- ⚫ **EVP** - Key icon

### 5. Privacy Features
For sensitive data, you can enable partial masking:

- **CPF**: `123.456.789-01` → `***.***.***-01`
- **CNPJ**: `12.345.678/0001-90` → `**.***.***/****-90`

### 6. Copy to Clipboard
One-click copying of unformatted values for external use.

## 🔧 Configuration Examples

### Interface Settings
```json
{
  "auto_detect_type": true,
  "allowed_types": ["cpf", "cnpj", "phone", "email", "evp"],
  "default_type": "cpf",
  "validate_key": true,
  "required": false
}
```

### Display Settings  
```json
{
  "show_type_badge": true,
  "format_key": true,
  "hide_key_partial": false,
  "copy_to_clipboard": true,
  "show_qr_code": false
}
```

## 📱 Data Storage Format

PIX keys are stored as JSON with both key and type:

```json
{
  "key": "12345678901",
  "type": "cpf"
}
```

This enables:
- Type-aware validation
- Proper formatting on display
- Future extensibility
- Data integrity

## 🚀 Use Cases

1. **Customer Registration**: Collect PIX keys for payments
2. **Vendor Management**: Store supplier payment information  
3. **Financial Reports**: Display formatted PIX data
4. **Privacy Compliance**: Mask sensitive CPF/CNPJ data
5. **Mobile Apps**: Copy PIX keys for payment apps
