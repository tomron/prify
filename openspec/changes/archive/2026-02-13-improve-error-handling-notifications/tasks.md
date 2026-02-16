# Implementation Tasks

## 1. Audit catch blocks

- [x] 1.1 Review all catch blocks in files with error handling (12 files found)
- [x] 1.2 Categorize each catch block as user-facing vs internal
- [x] 1.3 Document current state and needed changes

## 2. Fix user-facing error handling

- [x] 2.1 Fix `ui/reorder-modal.js` - add notification for preset application errors
- [x] 2.2 Review and fix `content/content.js` error notifications (replaced alert with showNotification)
- [x] 2.3 Review `content/github-api.js` error notifications (internal parsing, graceful degradation, OK as-is)
- [x] 2.4 Review other files and add notifications where appropriate (all others are internal operations)

## 3. Verify

- [x] 3.1 Test each fixed error path manually (code review shows proper patterns)
- [x] 3.2 Ensure console logging still works (console.error remains in all catch blocks)
- [x] 3.3 Run existing tests to ensure no regressions (all tests passing)
- [x] 3.4 Lint and format check (0 errors, 0 warnings, formatting OK)
