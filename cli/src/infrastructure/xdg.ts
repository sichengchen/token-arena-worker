import { homedir } from "node:os";
import { join } from "node:path";

/**
 * XDG Base Directory specification helpers.
 * @see https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html
 */

/** User-specific configuration directory (`XDG_CONFIG_HOME`, default `~/.config`) */
export function getConfigHome(): string {
  return process.env.XDG_CONFIG_HOME || join(homedir(), ".config");
}

/** User-specific data directory (`XDG_DATA_HOME`, default `~/.local/share`) */
export function getDataHome(): string {
  return process.env.XDG_DATA_HOME || join(homedir(), ".local", "share");
}

/** User-specific cache directory (`XDG_CACHE_HOME`, default `~/.cache`) */
export function getCacheHome(): string {
  return process.env.XDG_CACHE_HOME || join(homedir(), ".cache");
}

/** User-specific state directory (`XDG_STATE_HOME`, default `~/.local/state`) */
export function getStateHome(): string {
  return process.env.XDG_STATE_HOME || join(homedir(), ".local", "state");
}

/**
 * User-specific runtime directory (`XDG_RUNTIME_DIR`).
 * Falls back to state home when not set (e.g. on macOS).
 */
export function getRuntimeDir(): string {
  return process.env.XDG_RUNTIME_DIR || getStateHome();
}
