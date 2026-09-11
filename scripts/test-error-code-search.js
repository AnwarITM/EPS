const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'error_codes.html'), 'utf8');
const records = fs.readFileSync(path.join(root, 'data/error_codes.jsonl'), 'utf8')
  .trim().split(/\r?\n/).map((line) => {
    const entry = JSON.parse(line);
    return { ...entry.metadata, source_record_id: entry.id };
  });
const calls = [];
function query(field) {
  const constraints = {};
  return {
    startAt(value) { constraints.start = value; return this; },
    endAt(value) { constraints.end = value; return this; },
    equalTo(value) { constraints.equal = value; return this; },
    limitToFirst(value) { constraints.limit = value; return this; },
    async once() {
      calls.push({ field, ...constraints });
      const matches = records.filter((record) =>
        (constraints.equal === undefined || record[field] === constraints.equal) &&
        (constraints.start === undefined || record[field] >= constraints.start) &&
        (constraints.end === undefined || record[field] <= constraints.end))
        .sort((a, b) => a[field].localeCompare(b[field]))
        .slice(0, constraints.limit);
      return { val: () => Object.fromEntries(matches.map((record) => [record.source_record_id, record])) };
    }
  };
}
const context = vm.createContext({
  cachedRecords: null, localSearchIndex: null, browserCacheMeta: null,
  APP_VERSION: 'test', BROWSER_CACHE_TTL_MS: 43200000,
  errorCodesRef: { orderByChild: query }
});
for (const name of ['staticPrefix', 'compactCode', 'prefixCandidates', 'snapshotToRecords',
  'buildLocalSearchIndex', 'indexedRecordsFor', 'isBrowserCacheFresh', 'uniqueRecords',
  'sortRecords', 'filterCodeMatches', 'loadMatchingRecords']) {
  const match = html.match(new RegExp(`    (?:async )?function ${name}\\([^]*?^    }`, 'm'));
  assert.ok(match, `Missing function ${name}`);
  vm.runInContext(match[0], context);
}
// Parse every inline script as well as exercising the actual search functions.
for (const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
  new vm.Script(match[1]);
}
async function main() {
  const terms = ['11FC167', '11FC999', '1704020', '1704A00', '11', '1704', '11FC1XX',
    '11-FC167', 'ZZ99999', ...records.filter((_, i) => i % 211 === 0).map((r) => r.error_code_pattern)];
  for (const term of terms) {
    const before = calls.length;
    const result = await context.loadMatchingRecords(term);
    const ids = (rows) => Array.from(context.sortRecords(term,
      context.uniqueRecords(context.filterCodeMatches(term, rows))).slice(0, 200), (r) => r.source_record_id).sort();
    assert.deepEqual(ids(result.records), ids(records), `Different results for ${term}`);
    assert.ok(calls.length > before, 'Cold search must use targeted queries');
  }
  context.cachedRecords = records;
  context.browserCacheMeta = { version: 'test', savedAt: Date.now() };
  const before = calls.length;
  assert.equal((await context.loadMatchingRecords('11FC167')).source, 'cache_browser');
  assert.equal(calls.length, before, 'Fresh cache must avoid the network');
  context.browserCacheMeta.savedAt = 1;
  await context.loadMatchingRecords('11FC167');
  assert.ok(calls.length > before, 'Expired cache must use targeted queries');
  context.cachedRecords = null;
  context.errorCodesRef = { orderByChild() { throw new Error('network failure'); } };
  await assert.rejects(context.loadMatchingRecords('11FC167'), /network failure/);
  console.log(`Passed: ${terms.length} searches match the full dataset, cache behavior, network failure, and inline script syntax.`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
