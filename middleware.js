// Basic Auth para o guia: valida no edge antes de servir qualquer arquivo.
// Usuário e senha vêm das variáveis de ambiente GUIA_USER / GUIA_PASS (Vercel > Settings > Environment Variables).
// Molde: middleware dos dashboards do Lucas (401 sem credencial, 200 com credencial, Cache-Control no-store).
export const config = { matcher: "/(.*)" };

function unauthorized() {
  return new Response("Acesso restrito. Guia interno OdontoRise.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Guia de IA OdontoRise"',
      "Cache-Control": "no-store",
    },
  });
}

export default function middleware(req) {
  const U = process.env.GUIA_USER, P = process.env.GUIA_PASS;
  if (!U || !P) return unauthorized(); // sem as duas variáveis definidas, ninguém entra

  const auth = req.headers.get("authorization") || "";
  const [scheme, encoded] = auth.split(" ");
  if (scheme !== "Basic" || !encoded) return unauthorized();

  let decoded = "";
  try {
    // atob devolve bytes; decodificar como UTF-8 para aceitar senha com acento
    const bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
    decoded = new TextDecoder().decode(bytes);
  } catch (_) {
    return unauthorized();
  }
  const i = decoded.indexOf(":");
  if (i < 0) return unauthorized();
  const user = decoded.slice(0, i), pass = decoded.slice(i + 1);
  if (user === U && pass === P) return; // autorizado: segue para o arquivo estático
  return unauthorized();
}
