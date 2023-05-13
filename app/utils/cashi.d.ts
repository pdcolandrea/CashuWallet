import { Proof } from "@cashu/cashu-ts"

type Status = "pending" | "paid"

interface CProof extends Proof {
  status?: Status
}

interface Token {
  amount: number
  status: Status
  date: number
  token: string
  mint: string
}
