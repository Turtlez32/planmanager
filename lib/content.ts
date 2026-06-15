import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "br", "hr",
  "ul", "ol", "li",
  "strong", "em", "b", "i", "u", "s", "code", "pre", "blockquote",
  "table", "thead", "tbody", "tr", "th", "td",
  "a", "img",
  "div", "span", "section", "article", "header", "footer", "main", "nav", "aside",
  "details", "summary",
  "dl", "dt", "dd",
  "figure", "figcaption",
  "mark", "small", "sub", "sup",
  "style",
];

const ALLOWED_ATTRS: sanitizeHtml.IOptions["allowedAttributes"] = {
  "*": ["class", "id", "style"],
  "a": ["href", "target", "rel"],
  "img": ["src", "alt", "width", "height", "loading"],
  "th": ["colspan", "rowspan", "scope"],
  "td": ["colspan", "rowspan"],
  "col": ["span"],
  "colgroup": ["span"],
};

export function sanitize(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRS,
    allowedSchemes: ["https", "http", "mailto"],
    allowedSchemesByTag: {
      img: ["https", "data"],
    },
    allowVulnerableTags: false,
  });
}

export const SECURITY_HEADERS: Record<string, string> = {
  "Content-Security-Policy":
    "default-src 'none'; style-src 'self' 'unsafe-inline'; img-src https: data:; font-src https:;",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
};
