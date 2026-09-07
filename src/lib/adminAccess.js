const ACCESS_CODES = ["admin", "ihc2026"];

export function isValidAdminCode(code) {
  return ACCESS_CODES.includes(code.trim().toLowerCase());
}
