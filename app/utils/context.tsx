import { CashuMint, CashuWallet, Token, getDecodedToken, getEncodedToken } from "@cashu/cashu-ts"
import * as storage from "../utils/v2/fast-storage"
import React, { createContext, useEffect, useState } from "react"
import { calculateBalance } from "app/lib/wallet-util"
import { CToken } from "./cashi"

interface WalletData {
  balance: number
  history: CToken[]
}

interface CContext {
  wallet: WalletData
  refreshWallet: () => void
  deposit: {
    ecash: (cashu: string) => Promise<Token>
  }
  send: {
    ecash: (amount: number) => Promise<string>
  }
}

// const w = new Cashi()
export const MINT_URL = "https://legend.lnbits.com/cashu/api/v1/4gr9Xcmz3XEkUNwiBiQGoC"
const wallet = new CashuWallet(new CashuMint(MINT_URL))

export const CashiContext = createContext<CContext>(null)
export const CashiProvider = ({ children }: { children: JSX.Element }) => {
  const [w, setW] = useState({ balance: 0, history: [] })

  useEffect(() => {
    // every 1min recalc balance using proof
  }, [])

  useEffect(() => {
    console.log("init storage")
    const proofs = storage.getProofs()
    const tokens = storage.getTokenHistory()
    console.log(tokens.length)
    // console.log({ proofs })
    setW({ balance: calculateBalance(proofs), history: tokens })
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
    console.log("depositing ecash")
    const { token } = await wallet.receive(cashu)
    console.log(JSON.stringify(token))

    if (!token.token[0]) {
      throw new Error("Missing token elements")
    }

    // TODO: THINK THIS SHOULD ALSO INSEET INTO TOKEN_HIS
    // const decodedToken = getDecodedToken(cashu)
    // for (const t of decodedToken.token[0].proofs) {
    //   storage.insertTokenHistory({})
    // }

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

  // send funds using ECash string
  const withdrawECash = async (amount: number) => {
    const proofs = storage.getProofs()
    const { returnChange, send } = await wallet.send(amount, proofs)

    console.log(JSON.stringify(returnChange))
    console.log(JSON.stringify(send))

    const encoded = getEncodedToken({
      token: [
        {
          mint: MINT_URL,
          proofs: send,
        },
      ],
    })

    console.log({ encoded })

    // TODO: THINK I HAVE TO STORE PROOFS (RETURN CHANGE?)

    storage.insertTokenHistory({
      amount: amount * -1,
      status: "pending",
      token: encoded,
      mint: MINT_URL,
      date: +new Date(),
    })

    // let retries = 20;
    // const timer = setInterval(async () => {
    //   console.log(`Searching for hash: ${lnInvoice.hash}. ${retries} retries`);
    //   const encoded = await this.checkInvoiceHasBeenPaid(
    //     amount,
    //     lnInvoice.hash
    //   );
    //   if (encoded || retries === 0) {
    //     clearInterval(timer);
    //   }
    //   retries -= 1;
    // }, 5000);

    return encoded
    // start rescanProofs
  }

  return (
    <CashiContext.Provider
      value={{
        wallet: w,
        refreshWallet,
        deposit: {
          ecash: depositECash,
        },
        send: {
          ecash: withdrawECash,
        },
      }}
    >
      {children}
    </CashiContext.Provider>
  )
}
