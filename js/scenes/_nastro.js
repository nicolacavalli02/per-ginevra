// Il fiocco rosso che chiude la pergamena. Il centro del rotolo sta nel punto (15, 12).
// Lo usano la scena 2 (dove si annoda) e la scena 3 (dove la pergamena è il gettone).

export const NASTRO = `
  <svg viewBox="0 0 30 34" aria-hidden="true">
    <defs>
      <linearGradient id="nastro-fascia" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#6f1213"/><stop offset=".3" stop-color="#c52c2e"/>
        <stop offset=".62" stop-color="#a8201f"/><stop offset="1" stop-color="#5f0f10"/>
      </linearGradient>
      <linearGradient id="nastro-anello" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#cf3335"/><stop offset="1" stop-color="#8a181a"/>
      </linearGradient>
    </defs>
    <rect class="nastro__fascia" x="12" y="7" width="6" height="10" rx=".5" fill="url(#nastro-fascia)"/>
    <g class="nastro__coda">
      <path d="M14 13L10.2 25.5L12.9 24.3L14.3 27L16 13Z" fill="#8e1b1d"/>
      <path d="M16 13L19.8 25.5L17.1 24.3L15.7 27L14 13Z" fill="#a8201f"/>
    </g>
    <g class="nastro__anello">
      <path d="M15 12C9 5.8 3.6 7.6 4.2 12C4.8 16.4 10 16 15 12Z" fill="url(#nastro-anello)"/>
      <path d="M15 12C21 5.8 26.4 7.6 25.8 12C25.2 16.4 20 16 15 12Z" fill="url(#nastro-anello)"/>
      <path d="M13.6 11.6C10.6 9.6 7.4 9.8 6.8 12C7.6 13.6 10.6 13.4 13.6 11.6Z" fill="#5f0f10" opacity=".55"/>
      <path d="M16.4 11.6C19.4 9.6 22.6 9.8 23.2 12C22.4 13.6 19.4 13.4 16.4 11.6Z" fill="#5f0f10" opacity=".55"/>
    </g>
    <g class="nastro__nodo">
      <rect x="13.1" y="9.7" width="3.8" height="4.6" rx="1.3" fill="#b3262a"/>
      <path d="M13.9 10.4C14.6 10 15.4 10 16.1 10.4" fill="none" stroke="#e0585a" stroke-width=".4" stroke-linecap="round"/>
    </g>
  </svg>`;
