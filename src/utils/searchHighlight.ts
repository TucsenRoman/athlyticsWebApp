export function searchHighlight(text: string, query: string) {
  if (!query) return text;

  const safe = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${safe})`, "gi");

  return text.replace(
    regex,
    `<span class="search-highlight">$1</span>`
  );
}
