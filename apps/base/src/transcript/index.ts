/**
 * JSONL transcript tailing utilities.
 *
 * Base uses these utilities to tail provider session logs and convert them into
 * canonical timeline items before sending to clients.
 */

export { jsonlStore, type StoredLine } from "./store.js";
export { readJsonlFile, readJsonlFileFrom, parseJsonlLine } from "./reader.js";
export { jsonlWatcher } from "./watcher.js";
