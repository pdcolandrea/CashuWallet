import { CProof } from "app/utils/cashi"

export const calculateBalance = (proofs: CProof[]) => {
  return proofs.reduce((prev, curr) => prev + curr.amount, 0)
}
