# n8n-nodes-checkmob

[![npm version](https://img.shields.io/npm/v/n8n-nodes-checkmob)](https://www.npmjs.com/package/n8n-nodes-checkmob)

Community node for **[Checkmob](https://checkmob.com)** — field service management platform.

Handles JWT authentication automatically: the node logs in using your credentials and reuses the token for 55 minutes before renewing.

---

## Installation

In your n8n instance go to **Settings → Community Nodes → Install** and enter:

```
n8n-nodes-checkmob
```

---

## Credentials

1. In n8n go to **Credentials → New → Checkmob API**
2. Fill in:
   - **Login** — seu Usuário ou E-mail
   - **Password** — sua Senha

The node connects to `https://api-integration.checkmob.com` and obtains the Bearer Token automatically.

---

## Resources & Operations

| Resource | Operations |
|---|---|
| **Categoria** | Listar |
| **Campo Personalizado** | Listar |
| **Cliente** | Listar · Buscar · Criar · Criar em Lote · Editar |
| **Endereço do Cliente** | Buscar · Editar |
| **Endereço de Pessoa** | Buscar · Editar |
| **Etapa** | Listar |
| **Grupo** | Listar · Buscar · Criar · Editar |
| **Nota do Cliente** | Listar · Buscar · Criar · Editar · Excluir |
| **Objetivo** | Buscar · Listar |
| **Ordem de Serviço** | Listar · Buscar · Criar · Listar Status · Alterar Status · Excluir |
| **Pessoa** | Listar · Buscar · Criar · Editar · Excluir · Vincular Cliente |
| **Questionario** | Listar · Vincular Grupo · Remover Vínculo de Grupo · Vincular Segmento · Remover Vínculo de Segmento |
| **Questionario Servico** | Buscar por Registro · Buscar por OS · Listar |
| **Registro** | Buscar · Listar · Editar |
| **Segmento** | Buscar · Listar · Criar · Editar · Excluir · Obter Vínculos · Vincular ao Cliente · Remover Vínculo de Cliente · Vincular Grupo · Remover Vínculo de Grupo · Vincular Usuário · Remover Vínculo de Usuário |
| **Setor de Mercado** | Listar |
| **Status de Serviço** | Listar |
| **Temperatura** | Listar |
| **Tipo de Serviço** | Listar · Buscar |
| **Usuário** | Listar · Buscar · Buscar Localização |

---

## Configuration

### Idioma

Each node instance exposes a **Idioma** (Language) dropdown:

| Option | Value |
|---|---|
| Português (default) | `pt-BR` |
| English | `en-US` |

This sets the `Accept-Language` header on every API request, controlling the language of error messages returned by Checkmob.

### Continue on Error

When **Continue on Error** is enabled, failed items return a JSON object instead of halting the workflow:

```json
{
  "error": "HTTP 400 — 'Name' deve ser informado.",
  "statusCode": 400,
  "details": ["'Name' deve ser informado."]
}
```

---

## API Reference

[https://api-integration.checkmob.com/index.html](https://api-integration.checkmob.com/index.html)

---

## License

MIT
