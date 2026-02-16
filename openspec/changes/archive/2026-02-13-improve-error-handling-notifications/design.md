# Error Handling Improvement Design

## Context

The extension already has a robust notification system (`showNotification()`) imported from `utils/loading-state.js`. Some catch blocks use it correctly, while others only use `console.error()`, creating silent failures.

## Goals / Non-Goals

**Goals:**
- Ensure all user-facing errors show notifications
- Maintain console logging for debugging
- Use consistent error message patterns
- Include helpful error details when available

**Non-Goals:**
- Changing the notification system itself
- Adding new error handling infrastructure
- Comprehensive error taxonomy (use simple success/error for now)

## Decisions

### Decision 1: Audit all catch blocks systematically

Review all JavaScript files containing catch blocks and categorize:
- User-facing operations → Add `showNotification()` if missing
- Internal operations → Keep console-only if graceful degradation works
- Mixed operations → Use judgment based on user impact

### Decision 2: Include error.message when available

Where the error object has useful information, include it in the notification:
```javascript
showNotification(`Operation failed: ${error.message}`, 'error');
```

### Decision 3: Keep console.error() for all cases

Always log to console even when showing notifications, for debugging support.
