window.APP_CONFIG = {
  TMDB_API_KEY: "2db8038b6b62a4cc045f29cf5519676f",
  TMDB_LANG: "pt-BR",
  TMDB_REGION: "BR",
  SITE_NAME: "SRIGAMER MOVIES",

  // Domínios permitidos para EMBED (iframe) na "Minha Biblioteca"
  ALLOWED_EMBED_DOMAINS: [
    "www.youtube.com",
    "youtube.com",
    "player.vimeo.com",
    "animesonline.cloud",
    "redecanais.cafe",
    "www13.redecanais.in",
    "goyabu.io",
  ],

  // Domínios permitidos para o botão "Assistir" (links em nova aba).
  WATCH_ALLOWED_DOMAINS: [
    "www.google.com",
    "google.com",
    "www.justwatch.com",
    "justwatch.com",
    "www.youtube.com",
    "youtube.com",
    "anilist.co",
    "www.netflix.com",
    "netflix.com",
    "www.primevideo.com",
    "primevideo.com",
    "www.disneyplus.com",
    "disneyplus.com",
    "play.max.com",
    "www.max.com",
    "globoplay.globo.com",
    "www.crunchyroll.com",
    "crunchyroll.com",
    "localhost",
    "animesonline.cloud",
    "redecanais.cafe",
    "www13.redecanais.in",
    "goyabu.io",
    "127.0.0.1"
  ],

  /**
   * Botão "Assistir" (opções) — por tipo:
   * Use {q} no link pra substituir pelo título (URL encoded).
   *
   * Dica: quando não souber a busca do serviço, use Google com "site:dominio".
   */
  WATCH_OPTIONS: {
    movie: [
      { label: "Google (onde assistir)", url: "https://www.google.com/search?q={q}+onde+assistir" },
      { label: "Netflix (Google)", url: "https://www.google.com/search?q={q}+site:netflix.com" },

      { label: "REDES CANAIS (BH)", url: "https://redecanais.cafe/search.php?keywords={q}" },
      { label: "REDES CANAIS (in)", url: "https://www13.redecanais.in/?s={q}" },


    ],
    tv: [
      { label: "Google (onde assistir)", url: "https://www.google.com/search?q={q}+onde+assistir" },
      { label: "Netflix (Google)", url: "https://www.google.com/search?q={q}+site:netflix.com" },
    
      { label: "REDES CANAIS (BH)", url: "https://redecanais.cafe/search.php?keywords={q}" },
      { label: "REDES CANAIS (in)", url: "https://www13.redecanais.in/?s={q}" },
    ],
    anime: [
      { label: "Crunchyroll (Google)", url: "https://www.google.com/search?q={q}+site:crunchyroll.com" },
      { label: "YouTube (trailer)", url: "https://www.youtube.com/results?search_query=trailer+{q}" },
      
      { label: "animesonline (cloud)", url: "https://animesonline.cloud/?s={q}" },
      { label: "Goyabu (io)", url: "https://goyabu.io/?s={q}" },
    ]
  }
};
