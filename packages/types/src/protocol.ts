/**
 * Arc0 wire protocol versioning.
 *
 * The "wire protocol" is the encrypted Socket.IO payload shapes and semantics
 * exchanged between Base (daemon) and clients (Native/Web).
 *
 * Rules:
 * - Additive changes (new optional fields) SHOULD NOT bump the version.
 * - Breaking changes (rename/remove fields, change meaning) MUST bump the version.
 * - Base and clients must refuse to talk when versions mismatch to avoid silent data corruption.
 */

/**
 * Current Arc0 Base <-> Client wire protocol version.
 */
export const ARC0_PROTOCOL_VERSION = 1 as const;

export type Arc0ProtocolVersion = typeof ARC0_PROTOCOL_VERSION;
