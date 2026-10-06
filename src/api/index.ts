/* ------------------------------------------------------------------ *
 *  FAIMESS API Core Entry Point
 *  Single import for 100% control over all platform sections.
 * ------------------------------------------------------------------ */

export * from "./types";
export * from "./client";
export * from "./faimessApi";
export { adminApi } from "./adminApi";
export { socialApi } from "./socialApi";
export { fastApi } from "./fastApi";

export { faimessApi as default } from "./faimessApi";
