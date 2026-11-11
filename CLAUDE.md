# Biglietto di laurea "Omakase"

## Obiettivo
Pagina web interattiva di circa 2:30-3:00 per la laurea di Ginevra. Parte come un biglietto di congratulazioni e rivela a poco a poco il regalo: una cena omakase per due da Sonkei Omakase (Roncadelle, BS).

Viene consegnata di persona e lei la apre da un QR sul telefono di Nicola (Android). Le scene sono descritte in `STORYBOARD.md`.

## Vincoli
- HTML, CSS e JS statici, senza backend. Le librerie si usano solo se servono davvero: chiedi prima.
- Mobile-first, in verticale, ma deve funzionare anche su desktop. Tap e swipe devono funzionare anche col mouse.
- L'audio parte dopo il primo tap, e un pulsante mute è sempre disponibile.
- Deve girare bene su Android (Chrome), l'unico telefono di riferimento. iPhone/Safari non è un requisito.
- Leggera (meno di 5 MB), con `noindex` e nessun tracciamento.
- Il parametro `?scene=N` salta alla scena N durante i test.
- Testi, foto e didascalie stanno in un unico file di contenuti (`content.js`), separato dal codice.
- La scena 5 ha 4 ricordi, più il maki finale.
- Si pubblica su GitHub Pages. Titolo della pagina, nome del repo e URL devono essere neutri: niente "sushi" né "omakase".

## Sviluppo
- Anteprima locale: `node dev-server.js`, poi http://localhost:5173.
- Ogni scena è un file in `js/scenes/`. Finché non è costruita usa `_segnaposto.js`.

## Regole narrative
1. La parola "sushi" non compare prima della scena del bancone. "Omakase" compare solo al reveal.
2. Nessun indizio di viaggio in Giappone.
3. Ogni parte automatica dura al massimo 10 secondi. Il resto avanza solo quando interagisce lei.
4. Tono misto: ironico nella parte sulla tesi, tenero nel finale.
5. Ogni interazione deve capirsi senza istruzioni.

## Come lavoriamo
- Prima il piano, poi il codice.
- Per ogni scena proponi 2-3 idee visive diverse prima di costruirla. Scelgo io quale realizzare.
- Una scena alla volta: test, mio ok, commit git.
- Dove mancano foto o audio usa dei placeholder e vai avanti.
- Non aggiungere scene senza chiedere.
- Parliamo in italiano.
