# MOVIES — Catálogo + botão “Assistir” com opções

Um **catálogo leve e rápido** para pesquisar **Filmes / Séries / Animes**, ver detalhes (trailer, relacionados) e ter um botão **“Assistir”** com **opções configuráveis** (por tipo) via `config.js`.

> **Este projeto não hospeda conteúdo protegido.**  
> O objetivo é **encontrar informações e direcionar para meios oficiais** (ou para sua biblioteca pessoal).

---

## ✅ Recursos

- **Filmes / Séries / Animes**
  - Filmes/Séries via **TMDb**
  - Animes via **AniList**
- **Busca rápida**
- **Página de detalhes**
  - Trailer (quando disponível)
  - Títulos relacionados
- **Onde assistir**
  - Link **oficial do TMDb** quando existir
- **✅ Botão “Assistir” com opções configuráveis**
  - Abre uma lista de opções por tipo: `movie / tv / anime`
  - Configuração feita em `config.js` (`WATCH_OPTIONS`)
  - **Bloqueio por domínios permitidos** (`WATCH_ALLOWED_DOMAINS`)
- **✅ Minha Biblioteca (player interno)**
  - Você cola links:
    - **MP4**
    - **HLS** (`.m3u8`)
    - **Embeds oficiais permitidos** (ex.: YouTube/Vimeo)
  - Salva no navegador (**localStorage**)
  - Assiste dentro do modal

---

## ⚠️ Importante

- Eu **não integro** e **não automatizo** sites de terceiros **não autorizados**.
- O botão **“Assistir”** foi feito para você configurar **opções legais/oficiais**  
  **ou** usar a sua **biblioteca pessoal** com links próprios.

---

## ⚙️ Configuração

### 1) Abra o arquivo `config.js`
Você vai configurar:

- `TMDB_API_KEY` (v3)
- `WATCH_OPTIONS` (opções de assistir por tipo)
- `WATCH_ALLOWED_DOMAINS` (domínios permitidos)

### 2) Coloque sua TMDb API Key (v3)
No `config.js`, cole sua chave:
```js
TMDB_API_KEY: "SUA_CHAVE_AQUI"
