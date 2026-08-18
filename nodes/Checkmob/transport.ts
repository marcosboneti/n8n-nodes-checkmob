import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export function toList(raw: unknown): IDataObject[] {
	if (Array.isArray(raw)) return raw as IDataObject[];
	if (Array.isArray((raw as IDataObject)?.items)) return (raw as IDataObject).items as IDataObject[];
	return raw != null ? [raw as IDataObject] : [];
}

export function parseJson(
	value: string,
	node: ReturnType<IExecuteFunctions['getNode']>,
	fieldName: string,
): IDataObject[] {
	try {
		return JSON.parse(value) as IDataObject[];
	} catch {
		throw new NodeOperationError(node, `Campo "${fieldName}" contém JSON inválido.`);
	}
}

export async function apiRequest(
	this: IExecuteFunctions,
	options: { method: string; url: string; headers: IDataObject; body?: IDataObject },
): Promise<{ statusCode: number; body: unknown }> {
	const res = await this.helpers.httpRequest({
		method: options.method as 'GET' | 'POST' | 'PUT' | 'DELETE',
		url: options.url,
		headers: options.headers,
		body: options.body,
		json: true,
		returnFullResponse: true,
		ignoreHttpStatusErrors: true,
	});
	return { statusCode: res.statusCode as number, body: res.body };
}

export function assertApiSuccess(
	statusCode: number,
	body: unknown,
	node: ReturnType<IExecuteFunctions['getNode']>,
): void {
	if (statusCode >= 400) {
		const errMsg = extractErrorMessage(body) ?? 'Erro retornado pela API.';
		const errors = (body as IDataObject)?.errors;
		const description = errors ? JSON.stringify(errors) : undefined;
		throw new NodeOperationError(
			node,
			`HTTP ${statusCode} — ${errMsg}`,
			{ description },
		);
	}
}

function extractErrorMessage(body: unknown): string | undefined {
	const item = (Array.isArray(body) ? body[0] : body) as IDataObject | undefined;
	if (!item) return undefined;

	const errors = item?.errors;
	if (errors && !Array.isArray(errors) && typeof errors === 'object') {
		return Object.values(errors as Record<string, string[]>).flat().join(' | ');
	}
	if (Array.isArray(errors) && errors.length > 0) return (errors as string[]).join(' | ');
	if (typeof item?.title === 'string') return item.title;
	return undefined;
}
