# Phase two data preservation

The preserved snapshot is from GIU Tracking System on 11 November 2026.
It contains 8 requests, 6 profiles, and 1 counter row. Operational exports and
record-level comparison reports are stored in the ignored private-backups/phase-two
directory of the GIU project workspace, outside this public source checkout.

## Reconciliation results

All 7 request UUIDs in the August 25 archive exist in the current database.
Six records match on every archived field. One differs in assignee and updated.
The current database has one additional request. There are no archive-only UUIDs
or cross-ID display-ID conflicts in the compared inputs.
The archived CSV matches the JSON on all 7 rows and all exported fields.
All 8 requests in the pre-hardening export match the fresh snapshot.

Treat historic differences as review items. The current shared data remains the
reference for comparison; the tools never write to the database or select a winning
value automatically. A source-only record may be an old seeded example and requires
review against the originating app version before any proposed import.

## Browser inventory and capture

Browser capture remains open. Computer Use could not verify Chrome's URL and ended.
Record each browser, profile label, device, exact GIU origin, capture time, and export
filename. Ask staff about older file-based builds and localhost ports as well as the
hosted site. A snapshot with all four keys absent is useful inventory evidence.

In the correct browser profile, open the GIU Tracker page and verify its address.
Open Developer Tools, select Console, and run the reviewed contents of
tools/export-browser-storage.js. If the browser blocks pasted code with a security
warning, stop and use a supported/manual export route rather than bypassing the warning.
The script downloads a JSON file using four explicit GIU keys. It preserves the raw
strings even if stored JSON is damaged. It reads no Supabase session/auth-token keys
and performs no storage writes or network requests.
Keep the downloaded file in restricted local storage and note its browser/profile
provenance separately. Localhost/file origins are allowed for older GIU builds;
verify the page is the intended tracker before using it there.

The exporter has passed mocked browser tests. A real-browser download is still
unverified because browser automation was blocked.

## Repeatable comparison

Run from the source checkout, substituting actual paths.

```powershell
node tools/reconcile-data.mjs DATABASE.json SOURCE.json PRIVATE-REPORT.json
node --test tests/reconcile-data.test.mjs tests/export-browser-storage.test.mjs
```

The source may be an archived request array, an application database export, or a
browser snapshot. Reports preserve UUIDs and display IDs, compare only fields present
in the source, and compare requester-cache entries independently. Blank values remain
explicit differences. Duplicate UUIDs, conflicting field aliases, corrupt JSON, and
unsupported input shapes fail visibly. Cross-ID display collisions are reported.
Reports are created exclusively and refuse to overwrite an existing output file.
Detailed reports contain operational data and belong outside this public repository.

## Recovery validation and limits

All exported application rows were restored into isolated tables cloned from the live
table definitions and compared field-for-field. All three tables passed. The transaction
was rolled back. This check verifies typed application-row round trips and copied
constraints. Foreign keys, triggers, authentication recovery, full schema restoration,
and storage services require a separate full disaster-recovery rehearsal.
The captured snapshot excludes Auth passwords/tokens and browser storage.

Before any migration, reconcile every inventoried browser export, review conflicts and
seeded examples, preserve original IDs and source files, and agree on the final write
freeze and recovery point. Phase two remains open until the browser inventory and
captures are complete.
