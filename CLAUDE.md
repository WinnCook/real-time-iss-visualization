# Claude Code Rules - Real-Time Geometric Visualization

## ⚠️ CRITICAL: Testing Requirements

**EVERY SINGLE TIME you modify JavaScript code in this project:**

1. **Start local server** (ES6 modules REQUIRE http://, not file://):
   ```bash
   cd real-time-geometric-visualization
   python -m http.server 8000
   ```

2. **Open in browser** at `http://localhost:8000`

3. **Check console** (F12) for errors before marking task complete

**Why?** This project uses ES6 modules (`import/export`). Browsers block module loading from `file://` URLs due to CORS security policy. Opening `index.html` directly WILL FAIL with CORS errors.

**Rule:** Do NOT mark any coding task complete without testing on localhost first!

## Project-Specific Rules

### File Structure
- Main coordinator: `src/main.js`
- UI modules: Split into 5 files (ui.js, ui-controls.js, ui-panels.js, ui-events.js, ui-modals.js)
- Keep each module < 850 LOC for maintainability

### Code Quality
- Use JSDoc comments for all functions
- Maintain backward compatibility when refactoring
- Extract magic numbers to `src/utils/constants.js`
- Follow existing import patterns (ES6 modules)

### Testing Checklist
Before marking task complete:
- [ ] Local server running (`python -m http.server 8000`)
- [ ] No CORS errors in browser console
- [ ] No JavaScript errors in console
- [ ] UI functionality works as expected
- [ ] FPS counter visible and updating

### Documentation
- Update `CURRENT_SPRINT.md` when completing tasks
- Log completed work in `COMPLETED.md`
- Update line counts when refactoring modules

## Change Management
- Read the file before editing (REQUIRED by Write tool)
- Show diffs for review when requested
- Test immediately after changes (see Testing Requirements above)
