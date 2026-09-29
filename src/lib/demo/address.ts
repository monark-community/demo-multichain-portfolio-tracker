export type AddressCheck = "ok" | "empty" | "invalid"

export function checkAddress(input: string): AddressCheck {
  const v = input.trim()
  if (!v) return "empty"
  return /^0x[0-9a-fA-F]{40}$/.test(v) ? "ok" : "invalid"
}

export function normalizeAddress(input: string): string {
  return input.trim().toLowerCase()
}

export function shortAddress(address: string, start = 6, end = 4): string {
  if (address.length <= start + end + 1) return address
  return `${address.slice(0, start)}…${address.slice(-end)}`
}
