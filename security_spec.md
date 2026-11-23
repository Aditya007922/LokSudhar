# LokSudhar (लोक सुधार) Firestore Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. **Identity Integrity**: A user creating `/users/{userId}` must have `request.auth.uid == userId`, verified email, and `role == 'citizen'` unless created by an authenticated Administrator.
2. **PII Isolation**: Email addresses, phone numbers, and personal location details live exclusively in `/users/{userId}/private/info`, readable and writable only by the owner or an Administrator.
3. **Grievance Ownership**: Citizens creating a grievance in `/grievances/{grievanceId}` must set `citizenUid == request.auth.uid`, initial `status == 'Registered'`, and valid server `request.time` timestamps.
4. **Immutable Reference & Audit Trail**: `referenceNumber`, `citizenUid`, and `createdAt` cannot be modified after creation. Status history entries in `/grievances/{grievanceId}/history/{entryId}` are append-only and never edited or deleted by citizens or workers.
5. **Terminal State Locking**: Once a grievance reaches `status == 'Closed'`, only an Administrator may modify it.
6. **Role-Gated Assignment**: Only Administrators may assign `assignedDepartment` or `assignedWorkerId`. Assigned Workers may only update operational progress (`status` to `Dispatched`, `In Progress`, `Resolved`, and `resolutionNotes`, `updatedAt`).

## 2. Adversarial "Dirty Dozen" Payloads (Expected: PERMISSION_DENIED)
1. **Self-Assigned Admin Role**: Citizen creates `/users/{uid}` with `{ "role": "admin" }`.
2. **Role Escalation Update**: Citizen updates `/users/{uid}` changing `role` from `"citizen"` to `"worker"`.
3. **Shadow Ghost Field**: Citizen creates `/grievances/{id}` with extra field `"isVerified": true`.
4. **Spoofed Citizen UID**: Citizen creates `/grievances/{id}` with `"citizenUid": "other-user-uid"`.
5. **Status Shortcutting**: Citizen creates `/grievances/{id}` with `"status": "Resolved"`.
6. **Admin Impersonation (Unverified Email)**: Request with `email: "vishwanagar22@gmail.com"` and `email_verified: false`.
7. **PII Cross-Read**: Citizen A requests `get` on `/users/citizenB/private/info`.
8. **Blanket List Scraping**: Unauthenticated or unauthorized user lists `/users/{uid}/private/info`.
9. **Resource Poisoning ID**: Creating `/grievances/invalid$$id` or a 1,500-char document ID.
10. **Timestamp Forgery**: Creating a grievance with client-supplied past `createdAt` instead of `request.time`.
11. **Terminal State Tampering**: Worker attempts to update a grievance whose `existing().status == 'Closed'`.
12. **Orphaned History Entry**: Creating `/grievances/nonexistent/history/h1` without an existing parent grievance.
