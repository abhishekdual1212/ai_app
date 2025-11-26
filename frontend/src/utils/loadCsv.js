import Papa from 'papaparse';

export async function loadCsvFromPublic(publicPath) {
	const res = await fetch(publicPath);
	if (!res.ok) throw new Error(`Failed to fetch: ${publicPath}`);
	const text = await res.text();
	const { data } = Papa.parse(text, { header: true, skipEmptyLines: true });
	const headers = data.length ? Object.keys(data[0]) : [];
	return { headers, rows: data };
}

