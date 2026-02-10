# Brazilian PIX Key Extension for Directus

A comprehensive Directus extension bundle for handling Brazilian PIX keys with validation, formatting, and beautiful displays. This extension provides both an interface for data input and a display for presenting PIX keys throughout your Directus application.

## 🚀 Features

### PIX Key Interface Component
The interface component provides a complete PIX key input experience with:

- **Multi-type Support**: Full support for all Brazilian PIX key types:
  - CPF (Individual taxpayer ID) with official algorithm validation
  - CNPJ (Company taxpayer ID) with official algorithm validation
  - Phone numbers (landline and mobile, with optional +55 country code) with area code validation
  - Email addresses with standard format validation
  - EVP random keys (UUID format)

- **Smart Auto-detection**: Automatically detects PIX key type based on input patterns
  - CPF: 11 digits
  - CNPJ: 14 digits
  - Phone: 10-11 digits (or +55 prefixed) with area code recognition
  - Email: Standard email format
  - EVP: UUID format

- **Real-time Validation**: 
  - Validates CPF using official Brazilian algorithm (mod 11 check digits)
  - Validates CNPJ using official Brazilian algorithm
  - Validates phone numbers against all valid Brazilian area codes
  - Validates email format with regex pattern
  - Validates EVP random keys with UUID format validation
  - Shows instant feedback with success/error indicators

- **Intelligent Formatting**: 
  - CPF: Formats as XXX.XXX.XXX-XX as you type
  - CNPJ: Formats as XX.XXX.XXX/XXXX-XX as you type
  - Phone: Formats as +55 (XX) XXXXX-XXXX or (XX) XXXX-XXXX
  - Email: Automatically lowercases and trims whitespace
  - EVP: Lowercases and trims whitespace
  - Restricts input to numbers only for CPF/CNPJ/Phone

- **Type Selection Dropdown**: 
  - Visual dropdown with icons for each PIX key type
  - Manual type override capability
  - Configurable allowed types restriction

- **Input Features**:
  - Keyboard restrictions for numeric-only types
  - Max length enforcement per type
  - Copy/paste support with automatic formatting
  - Blur event validation
  - Visual feedback with icons and messages

### PIX Key Display Component
The display component provides rich visualization features:

- **Type Identification**: 
  - Automatic type detection from stored data
  - Visual type icons (person for CPF, business for CNPJ, etc.)
  - Support for both JSON and plain string storage formats

- **Copy to Clipboard**: 
  - One-click copying with visual feedback
  - Animated success notification
  - Fallback for older browsers
  - Copies unformatted key value

- **Privacy Features**: 
  - Optional masking for sensitive data
  - CPF: Masks as ***.***.***-XX
  - CNPJ: Masks as **.***.***/****-XX
  - Configurable per display instance

- **QR Code Support**: 
  - QR code generation button (placeholder for future implementation)
  - Modal dialog for QR code display
  - Shows formatted PIX key value

- **Responsive Design**: 
  - Adapts to different screen sizes
  - Mobile-optimized layout
  - Flexible container widths

## 📦 Installation

### From NPM (Recommended)
```bash
npm install directus-brazilian-pix
```

### Manual Installation
1. Download the latest release
2. Extract to your Directus extensions folder
3. Restart your Directus instance

## 🔧 Usage

### Interface Configuration

Add the Brazilian PIX Key interface to any string field:

1. Go to Settings > Data Model
2. Select your collection and field
3. Choose "Brazilian PIX Key" as the interface
4. Configure the options as needed

#### Interface Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| **Placeholder** | String | `Digite ou cole sua chave PIX` | Custom placeholder text for the input field |
| **Disabled** | Boolean | `false` | Disable the input field |
| **Required** | Boolean | `false` | Make the field required with validation message |
| **Auto-detect PIX Key Type** | Boolean | `true` | Automatically detect PIX key type based on input format |
| **Allowed PIX Key Types** | Array | All types | Restrict which PIX key types are allowed (CPF, CNPJ, Phone, Email, EVP) |
| **Default PIX Key Type** | String | `cpf` | Default type when creating new items |
| **Show Type Selector** | Boolean | `true` | Show/hide the type selector dropdown |
| **Validate Key Format** | Boolean | `true` | Enable validation using official Brazilian algorithms |

### Display Configuration

Configure the display to show PIX keys with type badges:

1. Go to your collection layout
2. Select the PIX key field
3. Choose "Brazilian PIX Key Display" as the display
4. Configure the display options

#### Display Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| **Show Type Badge** | Boolean | `true` | Display a type icon showing the PIX key type (CPF, CNPJ, Phone, Email, EVP) |
| **Format Key** | Boolean | `true` | Apply proper Brazilian formatting to CPF, CNPJ, and phone numbers |
| **Hide Partial Key** | Boolean | `false` | Mask part of the key for privacy (CPF and CNPJ only) |
| **Enable Copy to Clipboard** | Boolean | `true` | Allow users to copy the PIX key by clicking with visual feedback |
| **Show QR Code Option** | Boolean | `false` | Show a button to generate QR code for the PIX key |

## 📋 PIX Key Types

### Supported Types

| Type | Description | Format | Example |
|------|-------------|--------|---------|
| **CPF** | Individual taxpayer ID | XXX.XXX.XXX-XX | 123.456.789-01 |
| **CNPJ** | Company taxpayer ID | XX.XXX.XXX/XXXX-XX | 12.345.678/0001-90 |
| **Phone** | Mobile/landline number | +55 (XX) XXXXX-XXXX | +55 (11) 99999-9999 |
| **Email** | Email address | user@domain.com | usuario@email.com |
| **EVP** | Random PIX key | UUID | 123e4567-e89b-12d3-a456-426614174000 |

### Validation Rules

#### CPF Validation
- Uses the official Brazilian CPF algorithm (mod 11 check digits)
- Validates that all 11 digits aren't the same
- Calculates and verifies both check digits
- Automatically formats as XXX.XXX.XXX-XX

#### CNPJ Validation
- Uses the official Brazilian CNPJ algorithm
- Validates that all 14 digits aren't the same
- Calculates and verifies both check digits
- Automatically formats as XX.XXX.XXX/XXXX-XX

#### Phone Validation
- Validates against all 67 valid Brazilian area codes
- Supports both mobile (11 digits) and landline (10 digits) formats, with optional +55 prefix
- Mobile numbers must have 9 as the 3rd digit (after area code)
- Automatically formats as +55 (XX) XXXXX-XXXX or (XX) XXXX-XXXX

#### Email Validation
- Standard email format validation using regex
- Automatically lowercases and trims whitespace
- Maximum length of 254 characters (RFC standard)

#### EVP Validation
- Validates random PIX keys in UUID format
- Automatically lowercases and trims whitespace

## 🎨 Styling & UI Features

The extension uses Directus design tokens and follows the system theme automatically.

### Visual Elements

#### Icons by Type
- **CPF**: Person icon (`person`)
- **CNPJ**: Business icon (`business`)
- **Phone**: Phone icon (`phone`)
- **Email**: Email icon (`email`)
- **EVP**: Key icon (`key`)
- **Default**: QR Code icon (`qr_code`)

#### Interactive Features
- **Success Indicator**: Green checkmark when validation passes
- **Error Indicator**: Red error icon with descriptive message
- **Auto-detect Indicator**: Shows when type is automatically detected
- **Copy Animation**: Smooth fade-in/out animation on successful copy
- **Loading State**: Hourglass icon during copy operation

#### Responsive Behavior
- **Desktop**: Side-by-side layout for type selector and input
- **Mobile**: Stacked vertical layout below 600px width
- **Flexible Width**: Components adapt to container width

## 📊 Data Storage

### Storage Format

PIX keys are stored as JSON strings containing both the key and its type:

```json
{
  "key": "12345678901",
  "type": "cpf"
}
```

### Benefits of JSON Storage
- **Type Preservation**: Maintains the PIX key type for proper validation
- **Clean Values**: Stores unformatted values (numbers only for CPF/CNPJ/Phone)
- **Backward Compatibility**: Display component can auto-detect type from plain strings
- **Flexibility**: Easily extendable for future PIX key types

### Data Examples

```json
// CPF
{"key": "12345678901", "type": "cpf"}

// CNPJ
{"key": "12345678000190", "type": "cnpj"}

// Phone
{"key": "5511999999999", "type": "phone"}

// Email
{"key": "user@example.com", "type": "email"}

// EVP
{"key": "123e4567-e89b-12d3-a456-426614174000", "type": "evp"}
```

## 🔧 Development

### Prerequisites
- Node.js 20.19+
- Directus 11+

### Local Development
```bash
# Clone the repository
git clone https://github.com/brunribeiro/directus-brazilian-pix.git

# Install dependencies
cd directus-brazilian-pix
npm install

# Build the extension
npm run build

# Link for development
npm run link
```

### Building
```bash
npm run build
```

### Validation
```bash
npm run validate
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines
- Follow the existing code style
- Add tests for new features
- Update documentation
- Ensure all validations pass

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues & Support

Found a bug or need help? Please [open an issue](https://github.com/brunribeiro/directus-brazilian-pix/issues) on GitHub.

## 🙏 Acknowledgments

- Brazilian Central Bank for PIX key specifications
- Directus team for the amazing extension SDK
- The Brazilian development community

## 🛠️ Technical Details

### Utility Functions

The extension provides a comprehensive set of utility functions in `pix-validators.ts`:

#### Formatting Functions
- `formatCPF(value: string)`: Formats CPF as XXX.XXX.XXX-XX
- `formatCNPJ(value: string)`: Formats CNPJ as XX.XXX.XXX/XXXX-XX
- `formatPhone(value: string)`: Formats phone as +55 (XX) XXXXX-XXXX
- `formatPixKey(value: string, type: PixKeyType)`: Universal formatter

#### Validation Functions
- `isValidCPF(cpf: string)`: Validates CPF using official algorithm
- `isValidCNPJ(cnpj: string)`: Validates CNPJ using official algorithm
- `isValidPhone(phone: string)`: Validates phone with area code check
- `isValidEmail(email: string)`: Validates email format
- `isValidEVP(value: string)`: Validates EVP keys as UUID
- `validatePixKey(value: string, type: PixKeyType)`: Universal validator

#### Utility Functions
- `detectPixKeyType(value: string)`: Auto-detects PIX key type
- `cleanCPF/CNPJ/Phone(value: string)`: Removes formatting
- `cleanPixKey(value: string, type: PixKeyType)`: Universal cleaner

### Browser Compatibility

- **Modern Browsers**: Full support with Clipboard API
- **Legacy Browsers**: Fallback copy mechanism using textarea
- **Mobile Support**: Touch-optimized with responsive layouts
- **Vue 3**: Built with Vue 3 Composition API

### Performance Optimizations

- **Real-time Formatting**: Efficient string manipulation without lag
- **Debounced Validation**: Validates on blur to avoid excessive checks
- **Computed Properties**: Reactive updates with Vue 3 reactivity
- **Minimal Re-renders**: Optimized component updates

## 📈 Roadmap

### Planned Features
- [ ] **Real QR Code Generation**: Generate actual PIX payment QR codes
- [ ] **PIX API Integration**: Validate keys against banking APIs
- [ ] **Bulk Operations**: Import/export multiple PIX keys
- [ ] **Webhooks**: Trigger actions on PIX key changes
- [ ] **Advanced Formatting**: Custom formatting templates
- [ ] **Multi-language Support**: Internationalization
- [ ] **Copy Format Options**: Choose between formatted/unformatted copy
- [ ] **PIX Key History**: Track changes to PIX keys
- [ ] **Integration Tests**: Comprehensive test coverage 
