import { MMKV } from "react-native-mmkv"
import { CProof, Token } from "../cashi"

const store = new MMKV()

export const getProofs = () => {
  const p = store.getString("PROOFS")
  if (p) {
    return JSON.parse(p) as CProof[]
  }

  return []
}

const setProofs = (proofs: CProof[]) => {
  if (typeof proofs !== "object") {
    console.log({ proofs })
    throw new Error("setting proofs will destroy everything if wrong")
  }

  const json = JSON.stringify(proofs)
  return store.set("PROOFS", json)
}

export const deleteSingleProof = (id: string) => {
  const proofs = getProofs()
  const newProofs = proofs.filter((p) => p.id !== id)
  if (proofs.length === newProofs.length) {
    throw new Error("unable to delete")
  }

  return setProofs(newProofs)
}

export const insertProof = (proof: CProof) => {
  const allProofs = getProofs()
  const newProofs = allProofs.concat(proof)

  return setProofs(newProofs)
}

//
// token
//

export const getTokenHistory = (): Token[] => {
  const p = store.getString("TOKENS_HIS")
  if (p) {
    return JSON.parse(p) as Token[]
  }

  return []
}

const setTokenHistory = (token: Token[]) => {
  if (typeof token !== "object") {
    console.log({ token })
    throw new Error("unable to setToken")
  }

  const json = JSON.stringify(token)
  return store.set("TOKENS_HIS", json)
}

export const insertTokenHistory = (token: Token) => {
  const allTokens = getTokenHistory()
  const newTokens = allTokens.concat(token)

  return setTokenHistory(newTokens)
}
