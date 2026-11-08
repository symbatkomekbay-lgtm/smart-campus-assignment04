## Project
Smart Campus room availability checker; multi-room fictional catalog, fictional data.
## Constraints
Preserve AC1-AC6 and F1-F5; no backend, login or booking creation.
## Engineering rules
Prefer pure functions and minimal changes; use at most 2 justified patterns.
Do not mutate booking fixtures; keep responsive UI feedback.
## Verification
Run existing tests and add focused regression tests.
Report changed files, rationale and test evidence.

## Acceptance criteria
- AC1 Times must be integers between 0 and 1440.
- AC2 start < end and start > now.
- AC3 Duration must not exceed 120 minutes.
- AC4 Blocked rooms are unavailable.
- AC5 Reject overlapping bookings but allow touching endpoints.
- AC6 Do not mutate input data.

## Filter criteria (Task 02)
- F1 A room matches only when capacity >= attendees.
- F2 A room must contain ALL selected equipment (conjunction).
- F3 Blocked rooms are never reported as available.
- F4 Display only matching rooms; show a clear message when none match.
- F5 Selecting a room checks availability using only that room's bookings;
  changing rooms refreshes or clears the previous result.
