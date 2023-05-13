import { CashuMint, CashuWallet, Token, getDecodedToken } from "@cashu/cashu-ts"
import * as storage from "../utils/v2/fast-storage"
import React, { createContext, useEffect, useState } from "react"
import { calculateBalance } from "app/lib/wallet-util"

interface WalletData {
  balance: number
}

interface CContext {
  wallet: WalletData
  refreshWallet: () => void
  deposit: {
    ecash: (cashu: string) => Promise<Token>
  }
}

// const w = new Cashi()
export const MINT_URL = "https://8333.space:3338"
const wallet = new CashuWallet(new CashuMint(MINT_URL))

export const CashiContext = createContext<CContext>(null)
export const CashiProvider = ({ children }: { children: JSX.Element }) => {
  const [w, setW] = useState({ balance: 0 })

  useEffect(() => {
    // every 1min recalc balance using proof
  }, [])

  useEffect(() => {
    console.log("init storage")
    const proofs = storage.getProofs()
    console.log({ proofs })
    setW({ balance: calculateBalance(proofs) })
  }, [])

  const refreshWallet = async () => {
    await rescanInvoices()
  }

  const rescanInvoices = async () => {
    setTimeout(() => {
      setW({ balance: 5 })
      console.log("setting bal")
    }, 5000)
  }

  const rescanProofs = async () => {
    const proofs = storage.getProofs().filter((p) => p.status === "pending")

    // proofs that have not been claimed
    const newProofs = await wallet.checkProofsSpent(proofs)
    console.log(JSON.stringify(newProofs))
    for (const p of newProofs) {
      console.log(`FOUND PROOF P TO DELETE: ${p.id}`)
      storage.deleteSingleProof(p.id)
    }
  }

  // fund db using LN
  //   depositLN = async (amount: number) => {
  //     const lnInvoice = await this.generateLNInvoice(amount)

  //     let retries = 20
  //     const timer = setInterval(async () => {
  //       console.log(`Searching for hash: ${lnInvoice.hash}. ${retries} retries`)
  //       const encoded = await this.checkInvoiceHasBeenPaid(amount, lnInvoice.hash)
  //       if (encoded || retries === 0) {
  //         clearInterval(timer)
  //       }
  //       retries -= 1
  //     }, 5000)
  //   }

  // send to LN Invoice
  const withdrawLN = async (invoice: string) => {
    const proofs = storage.getProofs()
    const tx = await wallet.payLnInvoice(invoice, proofs)
    console.log(JSON.stringify(tx))
    return tx
  }

  // fund db using ECash string
  const depositECash = async (cashu: string) => {
    const { token } = await wallet.receive(cashu)
    console.log(JSON.stringify(token))

    if (!token.token[0]) {
      throw new Error("Missing token elements")
    }

    // could try this instead of receive
    const t = getDecodedToken(cashu)
    console.log("not using t:")
    console.log(JSON.stringify(t))

    for (const p of token.token[0].proofs) {
      storage.insertProof({
        amount: p.amount,
        C: p.C,
        id: p.id,
        secret: p.secret,
      })

      storage.insertTokenHistory({
        amount: p.amount,
        status: "paid",
        mint: MINT_URL,
        token: cashu,
        date: +new Date(),
      })
    }

    return token
  }

  return (
    <CashiContext.Provider
      value={{
        wallet: w,
        refreshWallet,
        deposit: {
          ecash: depositECash,
        },
      }}
    >
      {children}
    </CashiContext.Provider>
  )
}
