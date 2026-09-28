# Guia de Implementação de IA OdontoRise

Site estático (HTML + CSS + JS puros, sem build, sem dependência externa) com o guia interno de implementação de IA da OdontoRise. Molde de estrutura: guia de onboarding da Tendency; identidade e conteúdo próprios.

Projeto no vault: `🚀 Projetos/Implementação de IA OdontoRise/` (spec em `Guia HTML - Estrutura e Deploy - IA OdontoRise.md`).

## Páginas

| Caminho | Estado |
|---|---|
| `index.html` | capa: papéis e mapa das páginas |
| `onboarding/index.html` | Parte 2, pronta: 10 passos com checkpoint, macOS e Windows |
| `gestores/`, `head/`, `cs/`, `memoria/`, `docs/` | Partes 3 e 4, a criar |

## Ver localmente

```bash
cd "/Users/lucasteles/Claude Code/guia-ia-odontorise" && python3 -m http.server 8790
# abrir http://localhost:8790/
```

## Publicar na Vercel (mesmo fluxo dos dashboards)

```bash
cd "/Users/lucasteles/Claude Code/guia-ia-odontorise"
vercel --prod --yes                           # deploy (2 a 4 s); o projeto já está vinculado
```

Verificar: `curl -I https://guia-ia-odontorise.vercel.app/` deve dar 200; `README.md` deve dar 404; toda página tem `noindex`.

O guia é público pelo link, sem senha (decisão de 28/09/2026) e sem indexação por buscadores.

## O que nunca entra aqui

Token, senha, `.env`, print com credencial, dados de cliente, arquivos de configuração da conta do Claude. Só o nome do arquivo de credencial e o passo para cada pessoa gerar o próprio.

## Regras de texto

Sem travessão. Datas absolutas. IDs públicos internos (BM, app, workspace) podem constar; valores de token nunca.
