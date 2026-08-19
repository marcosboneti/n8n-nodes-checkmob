# n8n-nodes-checkmob

[![npm version](https://img.shields.io/npm/v/n8n-nodes-checkmob)](https://www.npmjs.com/package/n8n-nodes-checkmob)

Community node for **[Checkmob](https://checkmob.com)** — field service management platform.

Handles JWT authentication automatically: the node logs in using your credentials and reuses the token until it expires.

> **v1.0.0 — API v2 migration in progress.** This version connects to the Checkmob **API v2** (`/v2/...`), which is not backwards compatible with the old `/api/v1/...` endpoints. Only the **Categoria** resource has been migrated so far; the remaining resources will be added back incrementally in upcoming releases.

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
   - **Senha** — sua Senha

The node connects to `https://api-integration.checkmob.com` and obtains the Bearer Token automatically.

---

## Resources & Operations

| Resource | Operations |
|---|---|
| **Categoria** | Listar |

Remaining resources (Cliente, Pessoa, Ordem de Serviço, Registro, Grupo, Segmento, Questionário, Usuário, and the other reference tables) are being migrated to API v2 and will return in upcoming releases.

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
  "error": "HTTP 400 [ERRO_VALIDACAO] — nome: campo obrigatório",
  "statusCode": 400,
  "details": [{ "campo": "nome", "codigo": "obrigatorio", "mensagem": "campo obrigatório" }]
}
```

---

## API Reference

[https://api-integration.checkmob.com/swagger/v2/swagger.json](https://api-integration.checkmob.com/swagger/v2/swagger.json)

---

## License

MIT
