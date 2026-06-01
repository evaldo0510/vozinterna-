# Firebase Rules Security Specification & Adverse TDD Specs

This document defines the strict transactional constraints and provides the "Dirty Dozen" adverse payloads to satisfy the audit criteria for secure Firestore operations.

## Data Invariants

1. **Self-Ownership Constraint**: Users can only perform `read` (get, list) and `write` (create, update, delete) operations on their own user profiles under `/users/{uid}`, where `uid` matches the authenticated `request.auth.uid`.
2. **Subcollection Inheritance Constraint**: Custom journal entries (`/users/{uid}/journals/{item}`) and plants (`/users/{uid}/plants/{plant}`) can only be written and read if the authenticated UID matches the parent path coordinate `{uid}`.
3. **No Self-Privilege-Escalation**: Users are strictly barred from modifying their own `isAdmin` or `plan` tier fields via direct client-side updates.
4. **ID Sanitization and Validation**: Subcollection document identifiers must match high-integrity regex patterns to prevent ID poisoning and denial-of-wallet resource issues.

---

## The "Dirty Dozen" Adversarial Payloads

### 1. Identity Spoof ID Bypass (Profile Creation)
*   **Target Path**: `/users/legit-user-123`
*   **Injected Payload**:
    ```json
    {
      "id": "attack-user-999",
      "name": "Attacker",
      "email": "hacker@evil.com",
      "isAdmin": false,
      "plan": "visitor",
      "registeredAt": "2026-06-01T00:00:00Z",
      "lastActive": "2026-06-01T00:00:00Z"
    }
    ```
*   **Underlying Attack Vector**: Placing a different UID in the body than the document-ID or authenticated auth UID.
*   **Required Outcome**: `PERMISSION_DENIED`

### 2. Privilege Escalation (Admin Flag Hijack)
*   **Target Path**: `/users/legit-user-123`
*   **Injected Payload**:
    ```json
    {
      "id": "legit-user-123",
      "name": "User",
      "email": "user@gmail.com",
      "isAdmin": true,   // <--- MALICIOUS CHANGE
      "plan": "guardian"
    }
    ```
*   **Underlying Attack Vector**: Modifying the roles or authority variables from client-sdk.
*   **Required Outcome**: `PERMISSION_DENIED`

### 3. Service Level Expansion (Plan Escalation)
*   **Target Path**: `/users/legit-user-123`
*   **Injected Payload**:
    ```json
    {
      "id": "legit-user-123",
      "plan": "guardian"  // <--- UNPAID LEVEL
    }
    ```
*   **Underlying Attack Vector**: Modifying membership level without making proper checkout operations.
*   **Required Outcome**: `PERMISSION_DENIED`

### 4. Cross-Tenant Profile Intrusion (Profile Reading)
*   **Target Path**: `/users/victim-user-456`
*   **Attempted Operation**: `GET` as `legit-user-123`
*   **Underlying Attack Vector**: Reading another user's personal details, violating isolation.
*   **Required Outcome**: `PERMISSION_DENIED`

### 5. Foreign Journal Creation (Spoofed Owner)
*   **Target Path**: `/users/victim-user-456/journals/hack-journal-9`
*   **Injected Payload**:
    ```json
    {
      "id": "hack-journal-9",
      "date": "2026-06-01T00:00:00Z",
      "text": "Stolen space write.",
      "userId": "victim-user-456"
    }
    ```
*   **Underlying Attack Vector**: Writing into another user's nest journals subcollection.
*   **Required Outcome**: `PERMISSION_DENIED`

### 6. Journal Cross-Modification (Editing Victim's Notes)
*   **Target Path**: `/users/victim-user-456/journals/victim-note-8`
*   **Attempted Operation**: `UPDATE` (with write payload) by user `legit-user-123`.
*   **Underlying Attack Vector**: Manipulating previous records and journal history.
*   **Required Outcome**: `PERMISSION_DENIED`

### 7. Journal Blanket Collection Query scraping (Client List-Poll)
*   **Target Collection Path**: `/users/victim-user-456/journals/`
*   **Attempted Operation**: `LIST` query by `legit-user-123`.
*   **Underlying Attack Vector**: Mass scraping other accounts' reflection history since the client-sdk might skip constraints.
*   **Required Outcome**: `PERMISSION_DENIED`

### 8. Journal Injection Oversize Payload (Denial-of-Wallet)
*   **Target Path**: `/users/legit-user-123/journals/note-idx-1`
*   **Injected Payload**:
    ```json
    {
      "id": "note-idx-1",
      "date": "2026-06-01T00:00:00Z",
      "text": "[A repetitive 2MB filler block of memory-consuming characters...]",
      "userId": "legit-user-123"
    }
    ```
*   **Underlying Attack Vector**: Writing excessively large text, exhausting project quota limit.
*   **Required Outcome**: `PERMISSION_DENIED` (Enforced via `.size() <= 10000` on text block).

### 9. Garden Growth Hijacking
*   **Target Path**: `/users/victim-user-456/plants/shrub123`
*   **Injected Payload**:
    ```json
    {
      "id": "shrub123",
      "type": "shrub",
      "name": "Compromised Flower",
      "stage": 3,
      "color": "#ff0000",
      "createdAt": "2026-06-01T00:00:00Z",
      "lastWatered": "2026-06-01T00:00:00Z",
      "userId": "victim-user-456"
    }
    ```
*   **Underlying Attack Vector**: Forcing mature stage values or updating other people's garden progress.
*   **Required Outcome**: `PERMISSION_DENIED`

### 10. Path ID Poisoning (Junk characters injection)
*   **Target Path**: `/users/legit-user-123/plants/POISONED_ID_<<<!!!_&&_>>>`
*   **Injected Payload**: Standard garden plant structure.
*   **Underlying Attack Vector**: Forcing characters that alter path delimiters or indexing files.
*   **Required Outcome**: `PERMISSION_DENIED` (Enforced via `isValidId()` matching `'^[a-zA-Z0-9_\\-]+$'`).

### 11. Temporal Hijacking (Spoofed dates)
*   **Target Path**: `/users/legit-user-123`
*   **Injected Payload (Update or Create)**:
    ```json
    {
      "id": "legit-user-123",
      "registeredAt": "2010-01-01T00:00:00Z" // Fake past date
    }
    ```
*   **Required Outcome**: `PERMISSION_DENIED` (Must bind checks to `request.time`).

### 12. Email Verification Spoof (Verify Check Bypass)
*   **Target Profile Path**: `/users/legit-user-123`
*   **User State**: Authenticated with unverified email token (`request.auth.token.email_verified == false`).
*   **Underlying Attack Vector**: Accessing database before confirming mail identity when verification is strictly enforced.
*   **Required Outcome**: `PERMISSION_DENIED`
