# Local frontend verification — 12 November 2026

The frontend update is ready for release review on `codex/giu-frontend-polish`.
It follows the access-hardening, preservation-tooling, and save-safety commits
467e6f2, 839ba13, and da1e68e. No frontend changes have been published.

## Changes

- Responsive queue, filters, board, and form layouts, including narrow laptop screens.
- Visible keyboard focus, a skip link, named dialogs, and announced view selection.
- Notifications remain until dismissed or replaced by a later notification.
- Save errors remain in the editor and receive focus without clearing entries.
- New requests use Create Request; existing requests use Save Update.
- Request deletion uses a labeled dialog with Keep Request focused initially.
  The version captured before confirmation still guards the deletion.
- Reduced-motion preference disables UI transitions and animations.

## Verification completed

`node --test tests/request-save.test.mjs tests/reconcile-data.test.mjs tests/export-browser-storage.test.mjs`
passed all 26 tests. `node --check app.js` and `git diff --check` passed.
New regressions cover cancellation without a network write, version preservation
while a deletion confirmation is open, and repeated saves during an active save.

Browser checks used the actual frontend with a loopback-only synthetic API and
synthetic admin session. Production Auth and database endpoints were replaced
only by the local test server; production configuration files were unchanged.

- Desktop queue and editor rendered correctly.
- Keep Request and Escape cancelled deletion and retained the request.
- Stale save retained notes, kept the editor open, and focused the error message.
- Stale deletion retained the row and showed an error in the editor.
- Refreshed save succeeded and appeared in the queue.
- New request creation succeeded using Create Request.
- Confirmed deletion removed the synthetic request and displayed confirmation.
- Search, clear filters, and Queue / By NRL switching worked.
- Keyboard focus outlines and Skip to main content worked.
- At 390 px and 320 px, the page and request form had no horizontal overflow.
- At 1024 px, queue content fitted its container without horizontal overflow.
- Browser console contained no warnings or errors during these checks.

Screenshots and synthetic request logs are retained locally in the workspace's
ignored `private-backups/browser-verification` folder as `desktop-polish.jpg`,
`mobile-polish.jpg`, and `polish-server-state.json`.

These checks do not constitute a full screen-reader audit or production
sign-in/role smoke test. No live requests were created, edited, or deleted.

## Release steps still outstanding

1. Review the local frontend changes and screenshots.
2. Confirm release authorization before publishing. Check the current remote
   main branch and deployed commit, then reconcile intervening changes.
3. Publish the reviewed code through the repository's normal deployment path.
   The access-hardening migration was already applied in the preceding phase;
   this frontend update adds no migration and needs no production data import.
4. Verify production sign-in and expected Admin, GIU, and NRL visibility,
   followed by an authorized request workflow smoke test. Record the deployed
   commit and retain the previous deployed commit for frontend rollback.

Browser backup collection is excluded from this local update at the user's
request. Ma'am Bea's Excel work queue was mentioned by the user and has not
been inspected or imported.
