SRIGAMER MOVIES — HTML puro (Catálogo + botão "Assistir" com opções)
===================================================================

✅ O que tem:
- Filmes / Séries / Animes (TMDb + AniList)
- Busca
- Detalhes com trailer e relacionados
- Onde assistir (link oficial TMDb quando existir)
- ✅ Botão "Assistir" que abre opções configuráveis por tipo (movie/tv/anime) no config.js
- ✅ Minha Biblioteca (player interno):
  - você cola link MP4 / HLS (.m3u8) / Embed oficial (YouTube/Vimeo permitido)
  - salva no navegador (localStorage)
  - assiste dentro do modal

IMPORTANTE:
- Eu não integro nem automatizo sites de terceiros não autorizados.
- O botão "Assistir" foi feito para você configurar opções legais/oficiais (ou sua biblioteca pessoal).

CONFIG:
1) Abra config.js
2) Cole sua TMDB_API_KEY v3
3) Edite WATCH_OPTIONS (movie/tv/anime)
4) Se o domínio não estiver em WATCH_ALLOWED_DOMAINS, ele não aparece

RODAR (Windows):
- VS Code + Live Server, ou:
  python -m http.server 5500
  abrir http://localhost:5500
