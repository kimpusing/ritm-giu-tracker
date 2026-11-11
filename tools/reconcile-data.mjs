import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

const aliases = { displayId: 'display_id', requisitionerName: 'requisitioner_name',
  requisitionerSection: 'requisitioner_section', requiredAssistance: 'required_assistance', nextStep: 'next_step' };

function normalize(row) {
  if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error('Invalid record');
  const result = {};
  for (const [key, value] of Object.entries(row)) {
    const target = aliases[key] || key;
    if (Object.hasOwn(result, target) && JSON.stringify(result[target]) !== JSON.stringify(value)) {
      throw new Error('Conflicting field aliases for ' + target);
    }
    result[target] = value;
  }
  return result;
}

export function extract(data) {
  if (Array.isArray(data)) return { requests: data.map(normalize), cache: [] };
  if (data && Array.isArray(data.giu_requests)) return { requests: data.giu_requests.map(normalize), cache: [] };
  if (data?.format === 'giu-browser-storage-v1' && data.storage) {
    const rawRequests = data.storage['giu-nrl-status-tracker'];
    const rawCache = data.storage['giu-requester-details-cache'];
    const requests = rawRequests === null ? [] : JSON.parse(rawRequests);
    const cache = rawCache === null ? {} : JSON.parse(rawCache);
    if (!Array.isArray(requests) || !cache || typeof cache !== 'object' || Array.isArray(cache)) {
      throw new Error('Unexpected browser storage structure');
    }
    return {
      requests: requests.map(normalize),
      cache: Object.entries(cache).map(([id, fields]) => ({ ...normalize(fields), id }))
    };
  }
  throw new Error('Unsupported snapshot format');
}

function indexRows(rows, label) {
  const result = new Map();
  for (const row of rows) {
    if (typeof row.id !== 'string' || !row.id.trim()) throw new Error(label + ' has a missing record ID');
    if (result.has(row.id)) throw new Error(label + ' has a duplicate record ID');
    result.set(row.id, row);
  }
  return result;
}

function compareRecords(reference, rows) {
  indexRows(rows, 'Source');
  return rows.map(row => {
    const existing = reference.get(row.id);
    const collisions = [...reference.values(), ...rows].filter(candidate =>
      candidate.id !== row.id && row.display_id &&
      candidate.display_id?.trim().toLowerCase() === row.display_id.trim().toLowerCase());
    if (!existing) return { id: row.id, displayId: row.display_id ?? null,
      outcome: collisions.length ? 'display-id-conflict' : 'source-only',
      conflictingIds: [...new Set(collisions.map(candidate => candidate.id))], source: row };
    const changes = Object.entries(row).filter(([key, value]) =>
      JSON.stringify(value) !== JSON.stringify(existing[key])).map(([field, value]) =>
      ({ field, source: value, database: existing[field] ?? null, databaseFieldPresent: Object.hasOwn(existing, field) }));
    return { id: row.id, displayId: row.display_id ?? existing.display_id,
      outcome: changes.length ? 'different' : 'matching', changes };
  });
}

export function reconcile(database, source) {
  const current = extract(database);
  const incoming = extract(source);
  const reference = indexRows(current.requests, 'Database');
  const incomingIds = indexRows(incoming.requests, 'Source');
  const requests = compareRecords(reference, incoming.requests);
  const requesterCache = compareRecords(reference, incoming.cache);
  return {
    requests, requesterCache,
    databaseOnlyIds: current.requests.filter(row => !incomingIds.has(row.id)).map(row => row.id),
    summary: {
      databaseRows: current.requests.length, sourceRows: incoming.requests.length,
      matching: requests.filter(row => row.outcome === 'matching').length,
      different: requests.filter(row => row.outcome === 'different').length,
      sourceOnly: requests.filter(row => row.outcome === 'source-only').length,
      displayIdConflicts: requests.filter(row => row.outcome === 'display-id-conflict').length,
      databaseOnly: current.requests.filter(row => !incomingIds.has(row.id)).length,
      requesterCacheEntries: requesterCache.length,
      requesterCacheDifferences: requesterCache.filter(row => row.outcome !== 'matching').length
    }
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [databasePath, sourcePath, outputPath] = process.argv.slice(2);
  if (!databasePath || !sourcePath || !outputPath) throw new Error('Usage: node tools/reconcile-data.mjs DATABASE.json SOURCE.json PRIVATE-REPORT.json');
  const read = path => {
    const bytes = readFileSync(path);
    return { data: JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/, '')),
      sha256: createHash('sha256').update(bytes).digest('hex') };
  };
  const database = read(databasePath);
  const source = read(sourcePath);
  const report = { generatedAt: new Date().toISOString(), databasePath, sourcePath,
    databaseSHA256: database.sha256, sourceSHA256: source.sha256,
    ...reconcile(database.data, source.data) };
  writeFileSync(outputPath, JSON.stringify(report, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  console.log(JSON.stringify(report.summary));
}
