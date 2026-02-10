# Extensão de Chave PIX Brasileira para Directus

Extensão bundle para Directus focada na comunidade brasileira, com interface de entrada e display para chaves PIX com validação, formatação e experiência de uso otimizada.

## O que esta extensão faz

### Interface de Chave PIX

- Suporte completo aos tipos de chave:
  - CPF
  - CNPJ
  - Telefone (com ou sem +55)
  - E-mail
  - EVP (chave aleatória em formato UUID)
- Detecção automática do tipo da chave
- Validação em tempo real por tipo
- Formatação automática durante digitação
- Seletor de tipo configurável
- Armazenamento estruturado com `key` e `type`

### Display de Chave PIX

- Exibição formatada por tipo
- Ícone do tipo de chave (opcional)
- Cópia para área de transferência com feedback visual
- Máscara parcial para CPF/CNPJ (opcional)
- Compatibilidade com valores antigos (string simples) e novos (JSON)

## Instalação

### Via npm

```bash
npm install directus-brazilian-pix
```

### Instalação manual

1. Baixe a release mais recente.
2. Extraia para a pasta de extensões do Directus.
3. Reinicie sua instância do Directus.

## Uso

### Configurando a interface

1. Acesse `Settings > Data Model`.
2. Selecione a coleção e o campo (tipo string).
3. Escolha a interface `Brazilian PIX Key`.
4. Ajuste as opções conforme necessário.

#### Opções da interface

| Opção | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| Placeholder | String | `Digite ou cole sua chave PIX` | Placeholder do input |
| Disabled | Boolean | `false` | Desabilita o campo |
| Required | Boolean | `false` | Torna o campo obrigatório |
| Auto-detect PIX Key Type | Boolean | `true` | Detecta automaticamente o tipo da chave |
| Allowed PIX Key Types | Array | Todos | Restringe tipos permitidos (`cpf`, `cnpj`, `phone`, `email`, `evp`) |
| Default PIX Key Type | String | `cpf` | Tipo padrão ao criar novo item |
| Show Type Selector | Boolean | `true` | Mostra/oculta seletor de tipo |
| Validate Key Format | Boolean | `true` | Ativa/desativa validação por tipo |

### Configurando o display

1. Abra o layout da coleção.
2. Selecione o campo da chave PIX.
3. Escolha o display `Brazilian PIX Key Display`.
4. Ajuste as opções.

#### Opções do display

| Opção | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| Show Type Badge | Boolean | `true` | Exibe ícone do tipo de chave |
| Format Key | Boolean | `true` | Aplica formatação visual |
| Hide Partial Key | Boolean | `false` | Mascara parcialmente CPF/CNPJ |
| Enable Copy to Clipboard | Boolean | `true` | Permite copiar a chave ao clicar |
| Show QR Code Option | Boolean | `false` | Exibe botão para modal de QR Code (placeholder) |

## Tipos de chave suportados

| Tipo | Descrição | Exemplo |
|------|-----------|---------|
| CPF | Pessoa física | `123.456.789-01` |
| CNPJ | Pessoa jurídica | `12.345.678/0001-90` |
| Telefone | Celular/fixo | `+55 (11) 99999-9999` |
| E-mail | Endereço de e-mail | `usuario@email.com` |
| EVP | Chave aleatória (UUID) | `123e4567-e89b-12d3-a456-426614174000` |

## Regras de validação

### CPF

- Valida os 11 dígitos
- Rejeita sequências repetidas
- Calcula e valida os dois dígitos verificadores

### CNPJ

- Valida os 14 dígitos
- Rejeita sequências repetidas
- Calcula e valida os dois dígitos verificadores

### Telefone

- Aceita números nacionais com 10 ou 11 dígitos
- Aceita prefixo `55` (país)
- Valida DDD brasileiro
- Para 11 dígitos, exige `9` como terceiro dígito

### E-mail

- Validação de formato via regex
- Normalização para minúsculas e trim

### EVP

- Validação de UUID (versões 1-5)
- Normalização para minúsculas e trim

## Formato de armazenamento

As chaves são salvas como string JSON:

```json
{
  "key": "12345678901",
  "type": "cpf"
}
```

### Exemplos

```json
{"key":"12345678901","type":"cpf"}
{"key":"12345678000190","type":"cnpj"}
{"key":"5511999999999","type":"phone"}
{"key":"user@example.com","type":"email"}
{"key":"123e4567-e89b-12d3-a456-426614174000","type":"evp"}
```

## Desenvolvimento

### Requisitos

- Node.js `20.19+`
- Directus `11+`

### Comandos

```bash
# instalar dependências
npm install

# build da extensão
npm run build

# validação da extensão
npm run validate

# desenvolvimento (watch)
npm run dev

# link local para instância Directus
npm run link
```

## Funções utilitárias (`src/utils/pix-validators.ts`)

### Formatação

- `formatCPF(value: string)`
- `formatCNPJ(value: string)`
- `formatPhone(value: string)`
- `formatPixKey(value: string, type: PixKeyType)`

### Validação

- `isValidCPF(cpf: string)`
- `isValidCNPJ(cnpj: string)`
- `isValidPhone(phone: string)`
- `isValidEmail(email: string)`
- `isValidEVP(value: string)`
- `validatePixKey(value: string, type: PixKeyType)`

### Utilitários

- `detectPixKeyType(value: string)`
- `cleanCPF(value: string)`
- `cleanCNPJ(value: string)`
- `cleanPhone(value: string)`
- `cleanPixKey(value: string, type: PixKeyType)`

## Compatibilidade de navegador

- Navegadores modernos: cópia via Clipboard API
- Fallback para navegadores legados: `document.execCommand('copy')`

## Contribuição

Contribuições são bem-vindas via Pull Request.

## Licença

MIT. Veja o arquivo `LICENSE`.

## Suporte

Abra uma issue em:

`https://github.com/brunribeiro/directus-brazilian-pix/issues`

## Roadmap

- Geração real de QR Code PIX
- Internacionalização
- Mais opções de formato de cópia
- Testes integrados mais completos
