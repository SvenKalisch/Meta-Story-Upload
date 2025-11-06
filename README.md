# „- Anzeige -“ Web-App (für Browser / GitHub Pages)

**Funktion:** Vorlage (JPG) hochladen, im **1080×1920**-Rahmen per Drag positionieren (Cover). Text **„- Anzeige -“** wird oben links gesetzt (x=60, y=60, eingepasst in 170×40). Farbe Schwarz/Weiß wählbar. Download als **JPG 1080×1920**. Firmenlogo oben sichtbar (nur im UI).

## Dateien
- `index.html` – UI & Layout
- `styles.css` – Styles (responsive, helles UI)
- `script.js` – Logic (Drag, Render, Download)
- `assets/logo.png` – Firmenlogo (nur UI, nicht im Export)

## Deployment auf GitHub Pages
1. Neues Repo erstellen (z. B. `anzeige-webapp`).
2. Diese Dateien hochladen/committen.
3. Repo → **Settings → Pages** → „Deploy from branch“ → `main` + `/ (root)` → **Save**.
4. URL: `https://<DEIN_USERNAME>.github.io/<DEIN_REPO>/`

## Nutzung
- Seite öffnen → **Vorlage hochladen (JPG)** → **ziehen zum Verschieben** → **Farbe** wählen → **Dateiname** setzen → **Download**.

## Hinweise
- Alles läuft **client-seitig**, keine Server-Uploads.
- Das Logo wird **nur im UI** angezeigt, **nicht** ins fertige Bild gerendert.
