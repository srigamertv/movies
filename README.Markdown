# SRIGAMER MOVIES

Um site simples e direto feito em **HTML puro** para pesquisar **filmes, séries e animes**, ver detalhes (trailer, relacionados) e ter um botão **“Assistir”** com opções que você mesmo configura no `config.js`.

A ideia aqui é: **catálogo + atalhos** pra você encontrar **onde assistir** (meios oficiais quando existir) ou usar sua **biblioteca pessoal**.

---

## ✅ O que tem

- **Filmes / Séries / Animes**
  - Filmes e séries via **TMDb**
  - Animes via **AniList**
- **Busca** por título
- **Detalhes do título**
  - Trailer (quando disponível)
  - Relacionados / recomendados
- **Onde assistir (oficial)**
  - Link oficial do **TMDb** quando existir
- ✅ **Botão “Assistir” com opções configuráveis**
  - Opções separadas por tipo: `movie / tv / anime`
  - Tudo configurável no `config.js` (`WATCH_OPTIONS`)
  - **Somente domínios permitidos** aparecem (`WATCH_ALLOWED_DOMAINS`)
- ✅ **Minha Biblioteca (player interno)**
  - Cole link **MP4**
  - Cole link **HLS (.m3u8)**
  - Cole **embed oficial** (YouTube/Vimeo permitido)
  - Salva no navegador (**localStorage**)
  - Assiste dentro do modal

---

## ⚠️ Importante

- Este projeto **não hospeda** e **não transmite** vídeos.
- Eu **não integro** e **não automatizo** sites de terceiros **não autorizados**.
- O botão **“Assistir”** foi feito para você configurar **opções legais/oficiais**  
  ou usar sua **biblioteca pessoal** com links próprios.

---

## ⚙️ Configuração

### 1) Abra o arquivo `config.js`

### 2) Coloque sua chave do TMDb (v3)
No `config.js`, cole sua chave aqui:
```js
TMDB_API_KEY: "SUA_CHAVE_AQUI"
```

### 3) Configure o botão “Assistir” (WATCH_OPTIONS)
Você define as opções por tipo:

- `movie` → filmes  
- `tv` → séries  
- `anime` → animes  

Exemplo:
```js
WATCH_OPTIONS = {
  movie: [
    { label: "Netflix", url: "https://www.netflix.com/search?q={query}" },
    { label: "Prime Video", url: "https://www.primevideo.com/search/ref=atv_nb_sr?phrase={query}" }
  ],
  tv: [
    { label: "Max", url: "https://play.max.com/search?q={query}" }
  ],
  anime: [
    { label: "Crunchyroll", url: "https://www.crunchyroll.com/search?q={query}" }
  ]
}
```

> `{query}` é substituído pelo nome do título automaticamente (se o seu script estiver usando isso).

### 4) Domínios permitidos (WATCH_ALLOWED_DOMAINS)
Se o domínio não estiver na lista, a opção **não aparece** no botão “Assistir”.

Exemplo:
```js
WATCH_ALLOWED_DOMAINS = [
  "netflix.com",
  "primevideo.com",
  "disneyplus.com",
  "play.max.com",
  "crunchyroll.com",
  "youtube.com",
  "youtu.be",
  "vimeo.com"
]
```

---

## ▶️ Como rodar (Windows)

### Opção 1: VS Code + Live Server
1. Abra a pasta do projeto no VS Code
2. Clique em **Go Live**
3. Abra o link que aparecer

### Opção 2: Python (servidor simples)
Abra o terminal na pasta do projeto e rode:
```bash
python -m http.server 5500
```

Depois abra no navegador:
- `http://localhost:5500`

---

Feito por **SR.IGAMER TV**
