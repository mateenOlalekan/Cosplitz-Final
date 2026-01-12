const COUNTRY_API = 'https://restcountries.com/v3.1';

export const fetchCountries = async (query = '') => {
  try {
    const url = query.trim()
      ? `${COUNTRY_API}/name/${encodeURIComponent(query)}?fields=name,cca2`
      : `${COUNTRY_API}/all?fields=name,cca2`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch countries');

    const data = await res.json();
    return data
      .map(c => ({ name: c.name.common, code: c.cca2 }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (e) {
    console.error('Country fetch error:', e);
    return [];
  }
};

let cache = null;
export const getAllCountries = async () => {
  if (cache) return cache;
  cache = await fetchCountries();
  return cache;
};