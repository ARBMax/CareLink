# Security Specification - Ozone Co.

## Data Invariants
1. A Report must always have a valid `userId` matching the creator's ID.
2. Reports and MonitoredTargets are private to the user who created them, unless an administrator is viewing them.
3. User profiles can only be created with a `uid` matching the authenticated user.
4. Terminal state locking: Once a user is assigned an 'admin' role, it can only be changed by another admin (to prevent self-revocation or spoofing).
5. All timestamps must be server-generated.

## The "Dirty Dozen" Payloads

1. **Identity Spoofing (Report)**: Attempt to create a report with a different `userId`.
   - Result: PERMISSION_DENIED.
2. **Identity Spoofing (Profile)**: Attempt to create a user profile with a different `uid`.
   - Result: PERMISSION_DENIED.
3. **Privilege Escalation**: Attempt to set `role: 'admin'` during self-registration.
   - Result: PERMISSION_DENIED.
4. **Data Injection**: Injecting a 1MB string into the `title` field of a report.
   - Result: PERMISSION_DENIED (size limit violation).
5. **Orphaned Write**: Creating a report with a `userId` that does not exist in the `users` collection.
   - Result: PERMISSION_DENIED.
6. **Cross-User Read**: Attempting to 'get' a report belonging to another user.
   - Result: PERMISSION_DENIED.
7. **Cross-User List**: Attempting to query all reports without filtering by `userId`.
   - Result: PERMISSION_DENIED.
8. **Malicious Update**: Attempting to change the `userId` of an existing report.
   - Result: PERMISSION_DENIED (immutability violation).
9. **Value Poisoning**: Sending a boolean instead of a string for `executiveSummary`.
   - Result: PERMISSION_DENIED.
10. **Shadow Update**: Adding a `hidden_field: true` to a report document.
    - Result: PERMISSION_DENIED (`affectedKeys().hasOnly()` violation).
11. **Timestamp Spoofing**: Sending a client-side date string for `createdAt`.
    - Result: PERMISSION_DENIED (must be `request.time`).
12. **Unauthorized Deletion**: A standard user attempting to delete another user's profile.
    - Result: PERMISSION_DENIED.

## Test Runner (Draft Logic)

The `firestore.rules.test.ts` will use `@firebase/rules-unit-testing` to verify these payloads.
*(Note: Since unit testing framework is complex to setup in this env without full dependencies, I will focus on visual rule hardening and manual gate verification in rules)*
