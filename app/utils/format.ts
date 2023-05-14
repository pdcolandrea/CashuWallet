import { CInvoice } from "./cashi"

export function isInvoice(object: any): object is CInvoice {
  return "pr" in object
}
