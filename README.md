# Morabaraba — Sesotho Fashioneng 2026

Sotho 25 Morabaraba client for the Sesotho Fashioneng campaign ladder.
Vite + React + TypeScript, with a campaign from Matenase to Morena Letsie.

## Sotho 25 house rules

- 25-point board with centre `d4` (orthogonal only).
- 12 cattle each. Place, then move to a directly connected empty point.
- No flying and no jumping, even at 3 cattle.
- A mill is three in a line. Only a **newly formed** mill awards a capture.
- Cattle in a mill are safe unless every opponent cow is in a mill.
- Double mill: two captures. Grand meridian: two mills on the same full axis.
- Trapping does not win. The opponent must open a path (forced opening).

## Develop

```bash
npm install
npm run dev
```

```bash
npm test          # engine rule suite
npm run lint      # tsc --noEmit
npm run build
```

Online play still trusts the client for board updates. Deploy the hardened
`firestore.rules` before inviting public matches.
