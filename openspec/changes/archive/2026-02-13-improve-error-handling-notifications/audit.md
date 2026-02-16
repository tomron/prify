# Catch Block Audit

## User-Facing Operations (need notifications)

### ui/reorder-modal.js
- Line 93: Export ✅ HAS notification
- Line 120: Import ✅ HAS notification
- Line 138: Share ✅ HAS notification
- Line 168: **Preset application ❌ MISSING notification** - user clicks preset, needs feedback

### content/content.js
- Line 282: View orders ✅ Uses alert() (should migrate to showNotification but works)

## Internal Operations (console-only is OK)

### content/github-api.js
- Line 132: Parse order comment - returns null on error, graceful degradation ✅ OK

### utils/parser.js
- Lines 159, 236, 324: DOM parsing errors - graceful degradation ✅ OK

### utils/export-import.js
- Lines 60, 107: Throws errors up to caller - handled by UI layer ✅ OK

### content/dom-manipulator.js
- Line 286: DOM manipulation error - internal ✅ OK

### utils/loading-state.js
- Line 182: Notification system internal error - meta-level ✅ OK

### utils/sanitizer.js
- Line 128: Sanitization fallback - graceful ✅ OK

### utils/cleanup-manager.js
- Lines 98, 109, 120, 142: Cleanup errors - logged, non-critical ✅ OK

### utils/error-handler.js
- Lines 210, 266, 287: Error handler meta-errors ✅ OK

## Summary

**Needs fixing:**
1. ui/reorder-modal.js:168 - Add notification for preset application failure

**Consider migrating:**
1. content/content.js:282 - Replace alert() with showNotification() for consistency
