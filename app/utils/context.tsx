import { CashuMint, CashuWallet, Token, getDecodedToken, getEncodedToken } from "@cashu/cashu-ts"
import * as storage from "../utils/v2/fast-storage"
import React, { createContext, useEffect, useState } from "react"
import { calculateBalance } from "app/lib/wallet-util"
import { CInvoice, CToken } from "./cashi"
import dayjs from "dayjs"

interface WalletData {
  balance: number
  history: CToken[] | CInvoice[]
}

interface CContext {
  wallet: WalletData
  loading: boolean
  refreshWallet: () => void
  deposit: {
    ecash: (cashu: string) => Promise<Token>
    generateLNInvoice: (amount: number) => Promise<{ pr: string; hash: string }>
    ln: (amount: number, hash: string) => Promise<string>
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
  const [loading, setLoading] = useState(false)
  const [w, setW] = useState({ balance: 0, history: [] })

  useEffect(() => {
    // every 1min recalc balance using proof
    rescanInvoices()
    setInterval(() => {
      // rescanInvoices()
    }, 60000)
  }, [])

  useEffect(() => {
    console.log("init storage")
    const proofs = storage.getProofs()
    const tokens = storage.getTokenHistory()
    const invoices = storage.getLNInvoices()
    console.log({ tokens })
    console.log({ proofs })
    console.log({ invoices })
    setW({
      balance: calculateBalance(tokens),
      history: [...tokens, ...invoices].sort((token, invoice) => {
        return invoice.date - token.date
      }),
    })
  }, [])

  const refreshWallet = async () => {
    console.warn("todo: refresh wallet")
  }

  const checkInvoiceHasBeenPaid = async (amount: number, hash: string) => {
    try {
      // if we pass here - invoice was paid
      const { proofs, newKeys } = await wallet.requestTokens(amount, hash)
      storage.updateLNInvoice(hash, "paid")

      for (const p of proofs) {
        storage.insertProof({
          amount,
          C: p.C,
          id: p.id,
          secret: p.secret,
        })
      }

      console.log(JSON.stringify(newKeys))

      const encoded = getEncodedToken({
        token: [{ mint: MINT_URL, proofs }],
      })
      console.log({ encoded })
      storage.insertTokenHistory({
        amount,
        status: "paid",
        token: encoded,
        date: +new Date(),
        mint: MINT_URL,
      })
      return encoded
    } catch (err) {
      console.log("Waiting on LN invoice to be paid")
      // console.error(err);
    }
  }

  const rescanInvoices = async () => {
    const invoices = storage.getLNInvoices().filter((i) => i.status === "pending")
    console.log(`[rescanInv] Searching for invoices:`)
    for (const invoice of invoices) {
      console.log(`[rescanInv] ${invoice.hash}`)
      // check if older than 3 days

      const expiredDate = dayjs(invoice.date).add(1, "day")

      if (dayjs(new Date()).isAfter(expiredDate)) {
        storage.updateLNInvoice(invoice.hash, "expired")
        continue
      }

      const token = await checkInvoiceHasBeenPaid(invoice.amount, invoice.hash)
      if (token) {
        rescanTokenHistory()
      }
    }
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

  // this would be better named as refresh token history
  const rescanTokenHistory = () => {
    const tokens = storage.getTokenHistory()
    const balance = calculateBalance(tokens)
    setW((wal) => {
      return {
        ...wal,
        balance,
      }
    })
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

    rescanTokenHistory()

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

  const generateLNInvoice = async (amount: number) => {
    const { pr, hash } = await wallet.requestMint(amount)
    console.log(`[requestMint] Pay this invoice for ${amount} sat: `, {
      pr,
      hash,
    })

    storage.insertINInvoice({
      amount,
      hash,
      pr,
      status: "pending",
      date: +new Date(),
    })

    // search for hash

    return { pr, hash }
  }

  return (
    <CashiContext.Provider
      value={{
        wallet: w,
        loading,
        refreshWallet,
        deposit: {
          ecash: depositECash,
          generateLNInvoice,
          ln: checkInvoiceHasBeenPaid,
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
