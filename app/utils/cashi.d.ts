import { Proof } from "@cashu/cashu-ts"

type Status = "pending" | "paid" | "expired"

interface CProof extends Proof {
  status?: Omit<Status, "expired">
}

interface CToken {
  amount: number
  status: Status
  date: number
  token: string
  mint: string
}

interface CInvoice {
  amount: number
  hash: string
  pr: string
  status: Status
  date: number
}
