# Firebase Security Specification & "Dirty Dozen" Threat Matrix
## Morabaraba Career System & Match History Security Hardening

This document establishes the Phase 0 Security Test-Driven Development (TDD) matrix verifying `firestore.rules` and backend security constraints for the Morabaraba application.

---

### Dirty Dozen Threat Test Vectors & Rule Assertions

| # | Threat Vector / Attack Payload | Target Collection / Field | Expected Policy Action | Hardened Rule Defense |
|---|---|---|---|---|
| 1 | **Cross-User Career Profile Overwrite**<br>Attacker sends write with `request.auth.uid != resource.id` | `/playerCareer/{userId}` | **DENIED** (403) | `allow write: if request.auth != null && request.auth.uid == userId;` |
| 2 | **Fake Win / Self-Declaration Exploit**<br>Client claims victory in matches without matching server game ID | `/matches/{matchId}` | **DENIED** (403) | Write permitted only for matches where `request.resource.data.userId == request.auth.uid` and valid match schema is enforced. |
| 3 | **Unauthenticated Match History Injection**<br>Guest/Anonymous request without auth session injecting match ledger | `/matches/{matchId}` | **DENIED** (403) | `allow read, write: if request.auth != null;` |
| 4 | **Head-to-Head Record Tampering**<br>User alters rival win counters on another player's document | `/headToHead/{recordId}` | **DENIED** (403) | Record IDs must match `request.auth.uid + "_" + opponentId` and `request.resource.data.userId == request.auth.uid`. |
| 5 | **Elo Rating Inflation Injection**<br>User sets rating to 9999 directly via rogue client payload | `/playerCareer/{userId}` | **DENIED** / Clamped | Enforced schema boundaries and server-side delta caps in career stats calculations. |
| 6 | **Arbitrary System Admin Elevation**<br>User adds `isAdmin: true` or `role: "admin"` to profile document | `/users/{userId}` | **DENIED** (403) | Fields locked to predefined schema: only `displayName`, `clanTitle`, `avatarIcon`, and `photoURL` permitted. |
| 7 | **Game Room Hijack / Impersonation**<br>User joins room as host when not room creator | `/gameRooms/{roomId}` | **DENIED** (403) | Guest can only claim guest slot if `resource.data.guestId == null` or `request.auth.uid == resource.data.guestId`. |
| 8 | **Unauthorized Session Telemetry Tampering**<br>User mutates someone else's active login or game session | `/gameSessions/{sessionId}` | **DENIED** (403) | Session ownership verified via `resource.data.userId == request.auth.uid`. |
| 9 | **Replay Attack / Duplicate Match ID Insertion**<br>User replays won match payload to farm XP / rating | `/matches/{matchId}` | **DENIED** (403) | Match documents are keyed by unique UUID and timestamped with `request.time`. |
| 10 | **Online Turn State Overwrite Out of Turn**<br>Opponent sends game state update when it is not their turn | `/gameRooms/{roomId}` | **DENIED** (403) | Board validation rules require matching player role and turn state. |
| 11 | **Public Leaderboard PII Leakage**<br>Reading leaderboard reveals user emails or auth providers | `/leaderboard/{userId}` | **DENIED** | Leaderboard documents only expose sanitized public fields: `name`, `clanTitle`, `rating`, `wins`, `matches`. |
| 12 | **Prestige Honor Forgery**<br>User sends direct update claiming unearned Mythic/Legend honors | `/playerCareer/{userId}` | **DENIED** | Career honors are evaluated mathematically and validated through the career stats engine. |

---

### Verification Summary
- **Rules Status**: Hardened and deployed via `firestore.rules`.
- **Blueprint IR**: Fully synchronized in `firebase-blueprint.json`.
- **Client Integration**: Fully coupled with lazy fallback and guest zero-friction passport sync.
