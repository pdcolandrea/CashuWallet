import { MMKV } from "react-native-mmkv"
import { CInvoice, CProof, CToken, Status } from "../cashi"

const store = new MMKV()

//
// proof
//

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

export const getTokenHistory = (): CToken[] => {
  const p = store.getString("TOKENS_HIS")
  if (p) {
    return JSON.parse(p) as CToken[]
  }

  return []
}

const setTokenHistory = (token: CToken[]) => {
  if (typeof token !== "object") {
    console.log({ token })
    throw new Error("unable to setToken")
  }

  const json = JSON.stringify(token)
  return store.set("TOKENS_HIS", json)
}

export const insertTokenHistory = (token: CToken) => {
  const allTokens = getTokenHistory()
  const newTokens = allTokens.concat(token)

  return setTokenHistory(newTokens)
}

//
// invoice
//

const setLNInvoice = (invoice: CInvoice[]) => {
  const json = JSON.stringify(invoice)
  return store.set("LN_INVOICES", json)
}

export const getLNInvoices = (): CInvoice[] => {
  const invoices = store.getString("LN_INVOICES")
  if (invoices) {
    return JSON.parse(invoices) as CInvoice[]
  }

  return []
}

// TODO: DOES THIS WORK?
export const updateLNInvoice = (hash: string, status: Status) => {
  const invoices = getLNInvoices()
  let foundIndex: number
  const invoice = invoices.find((i, index) => {
    foundIndex = index
    return i.hash === hash
  })
  if (!invoice) {
    throw new Error("could not find hash to update invoice")
  }

  invoice.status = status
  invoices[foundIndex] = invoice

  return setLNInvoice(invoices)
}

export const insertINInvoice = (invoice: CInvoice) => {
  const allInvoices = getLNInvoices()
  const newInvoices = allInvoices.concat(invoice)
  return setLNInvoice(newInvoices)
}

export const _deleteAllStorage = () => store.clearAll()
