# Security Specification: MEI EventHub

## 1. Data Invariants

1. **User Identity Invariant**: A user document at `/users/{userId}` can only be created or modified if `request.auth.uid == userId`. Role escalation is prevented by validating role values.
2. **Event Author Invariant**: An event at `/events/{eventId}` can only be created by an authenticated user with verified credentials or role of organizer/hod/staff. `id` matches path variable.
3. **Event Immutability Invariant**: Event `id` and `creatorId` cannot be changed post-creation.
4. **Registration Ticket Invariant**: A registration at `/registrations/{registrationId}` cannot exist without referencing a valid `eventId`. Users can only create registrations for themselves or authorized desk managers.
5. **Feedback Integrity Invariant**: A feedback review at `/feedbacks/{feedbackId}` must have a rating between 1 and 5 and be associated with a valid `eventId`.
6. **Volunteer Assignment Invariant**: Volunteers can only have status `assigned`, `checked-in`, or `completed`.
7. **Venue Invariant**: Venues can only be modified by authorized organizers or administrative staff (`hod`, `organizer`).
8. **Notification Integrity Invariant**: Notifications can be read by target users or anyone when public/all.
9. **Denial of Wallet Guard**: All document IDs and text fields must have bounded sizes (`<= 128` chars for IDs, `<= 2000` chars for text).
10. **System Denial Catch-All**: All non-explicit paths default to `allow read, write: if false;`.

---

## 2. The "Dirty Dozen" Malicious Payloads

The following 12 payloads represent attacks designed to breach identity, integrity, state, and size boundaries:

1. **Payload 1: Identity Spoofing in User Profile**
   - Attempt: Attacker (`uid_attacker`) attempts to overwrite `/users/uid_victim`.
   - Result: `PERMISSION_DENIED`

2. **Payload 2: Role Escalation via Shadow Fields**
   - Attempt: Standard student submits arbitrary admin claims `{"isAdmin": true, "superUser": true}` in `/users/{userId}`.
   - Result: `PERMISSION_DENIED`

3. **Payload 3: Event Creator Forgery**
   - Attempt: Attacker writes an event with `creatorId: "other_faculty_uid"` to hijack event authority.
   - Result: `PERMISSION_DENIED`

4. **Payload 4: Giant ID Injection (Denial of Wallet / ID Poisoning)**
   - Attempt: Create document at `/events/{id}` where `{id}` is a 10KB string with special control characters.
   - Result: `PERMISSION_DENIED`

5. **Payload 5: Rating Value Poisoning in Feedback**
   - Attempt: Attacker submits feedback with `rating: 99999` or `rating: -50`.
   - Result: `PERMISSION_DENIED`

6. **Payload 6: Negative Capacity or Negative Fee Injection**
   - Attempt: Create event with `fee: -5000` or `totalSlots: -100`.
   - Result: `PERMISSION_DENIED`

7. **Payload 7: Unauthenticated Global Write**
   - Attempt: Unauthenticated client attempts to delete `/events/event_123`.
   - Result: `PERMISSION_DENIED`

8. **Payload 8: Immutable Field Overwrite**
   - Attempt: Existing event updated with a mutated `id` or mutated `creatorId`.
   - Result: `PERMISSION_DENIED`

9. **Payload 9: Volunteer Desk Unauthorized Deletion**
   - Attempt: Unauthenticated user attempts to delete volunteer crew assignment `/volunteers/vo_1`.
   - Result: `PERMISSION_DENIED`

10. **Payload 10: Registration Ticket Hijack**
    - Attempt: Non-desk participant attempts to mark other students' tickets as attended without authority.
    - Result: `PERMISSION_DENIED`

11. **Payload 11: Oversized Content Bomb**
    - Attempt: Submit an event description exceeding 2,000 characters.
    - Result: `PERMISSION_DENIED`

12. **Payload 12: Catch-All Infiltration**
    - Attempt: Client queries or writes to arbitrary private internal collections `/secret_admin_logs/config`.
    - Result: `PERMISSION_DENIED`

---

## 3. Test Runner Verification Plan

All dirty payloads are asserted in `firestore.rules.test.ts` to guarantee zero unauthorized state modifications.
