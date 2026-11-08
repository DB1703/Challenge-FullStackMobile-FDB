// base64url (RFC 4648 §5) with Hermes' native btoa/atob. Only for ASCII strings, such as JWT JSON parts.

export function encodeBase64Url(value: string): string {
	return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Throws if the value isn't valid base64url. */
export function decodeBase64Url(value: string): string {
	const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
	return atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
}
