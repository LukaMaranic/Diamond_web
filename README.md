# Diamond band website

Jednostavna statična web-stranica bez backenda i bez build koraka. Izvorne fotografije u workspace rootu ostaju netaknute; optimizirane kopije nalaze se u `dist/assets/`, a provjereni javni paket u `production-dist/`.

Live stranica: [diamondbandcroatia.com](https://diamondbandcroatia.com/)

## Lokalni pregled

U PowerShellu:

```powershell
cd "C:\projects\DIAMOND WEB\diamond-site"
python -m http.server 4173 --directory .\dist
```

Zatim otvori `http://localhost:4173/`.

## Zaštita testne verzije od indeksiranja

Testna verzija namjerno ima:

- HTML `robots` i `googlebot` meta oznake s `noindex`;
- Cloudflare `_headers` datoteku s `X-Robots-Tag: noindex`;
- nema sitemap ni canonical adresu prema testnom URL-u.

Ne koristimo `robots.txt` s `Disallow: /`, jer crawler mora moći učitati stranicu kako bi vidio `noindex`. `noindex` nije zaštita lozinkom: svatko tko zna URL i dalje može otvoriti stranicu.

## Besplatni online testni URL, ručni Cloudflare Pages upload

1. Otvori besplatni račun na `https://dash.cloudflare.com/`.
2. U izborniku otvori **Workers & Pages**.
3. Odaberi **Create application** → **Get started** → **Drag and drop your files**.
4. Daj projektu staging naziv, primjerice `diamond-band-staging` ili drugu dostupnu varijantu.
5. Prenesi cijelu mapu `dist` ili ZIP njezina sadržaja i odaberi **Deploy site**.
6. Cloudflare će dati javni URL oblika `naziv-projekta.pages.dev`.
7. Za svaku novu verziju odaberi **Create a new deployment** i prenesi novu `dist` verziju.

Za početak korisnik treba samo besplatni Cloudflare račun i jednokratni ručni upload. GitHub nije potreban. Cloudflare Direct Upload projekt kasnije se ne može pretvoriti u Git-integrirani projekt; za automatske GitHub objave napravili bismo novi projekt ili nastavili Direct Upload kroz Wrangler.

## Produkcijski paket

Mapa `production-dist/` zaseban je paket spreman za domenu
`https://diamondbandcroatia.com/`. Za razliku od staging mape `dist/`, produkcijski
paket dopušta indeksiranje i sadrži:

- canonical i Open Graph URL-ove s konačnom domenom;
- apsolutne slike za dijeljenje i Twitter Card metapodatke;
- `MusicGroup` i `WebSite` JSON-LD strukturirane podatke;
- `robots.txt` koji dopušta indeksiranje;
- `sitemap.xml` s canonical početnom stranicom;
- sigurnosne headere bez produkcijskog `X-Robots-Tag: noindex` pravila.

`404.html` namjerno ostaje `noindex`. Za produkciju uvijek prenesi sadržaj
`production-dist/`, a za staging sadržaj `dist/`.

Lokalni pregled produkcijske verzije:

```powershell
cd "C:\projects\DIAMOND WEB\diamond-site"
python -m http.server 4174 --directory .\production-dist
```

Zatim otvori `http://localhost:4174/`, `http://localhost:4174/robots.txt` i
`http://localhost:4174/sitemap.xml`.

Nakon produkcijskog uploada na zaseban Cloudflare Pages projekt treba spojiti
`diamondbandcroatia.com`, preusmjeriti `www` i produkcijski `pages.dev` hostname na
canonical domenu te tek tada verificirati domenu u Google Search Consoleu i poslati
`sitemap.xml`.

## Ponovna optimizacija fotografija

Ako se zamijene originali ili dodaju nove varijante, postojeće fotografije ponovno se generiraju naredbom:

```powershell
& .\scripts\optimize-images.ps1
```

## Promjena redoslijeda galerije

Redoslijed određuju `<figure data-gallery-slide>` elementi u `dist/index.html`, unutar
elementa `<div class="gallery-stage">`. Prvi `<figure>` je fotografija koja se prva
prikazuje. Za promjenu redoslijeda premjesti cijeli `<figure>...</figure>` blok; nazive
datoteka ne treba mijenjati. Na prvom bloku ukloni atribut `hidden`, a dodaj ga svim
ostalima. JavaScript automatski ponovno izračunava brojeve slajdova i pristupačne oznake.
