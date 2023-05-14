import { CToken } from "app/utils/cashi"

export const calculateBalance = (tokens: CToken[]) => {
  return tokens.reduce((prev, curr) => prev + curr.amount, 0)
}
