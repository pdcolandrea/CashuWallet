import { CashuMint, CashuWallet, getDecodedToken, getEncodedToken } from "@cashu/cashu-ts"
import * as storage from "../utils/v2/fast-storage"

export const MINT_URL = "https://8333.space:3338"
const wallet = new CashuWallet(new CashuMint(MINT_URL))

export default class Cashi {
  balance = 0
  txCount = 0

  constructor() {
    const proofs = storage.getProofs()
    const txs = storage.getTokenHistory()
    this.balance = proofs.reduce((prev, curr) => prev + curr.amount, 0)
    this.txCount = txs.length
  }

  rescanInvoices = async () => {
    setTimeout(() => {
      this.balance = 5
      console.log("setting bal")
    }, 5000)
  }

  getBalance = () => this.balance

  rescanProofs = async () => {
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
  withdrawLN = async (invoice: string) => {
    const proofs = storage.getProofs()
    const tx = await wallet.payLnInvoice(invoice, proofs)
    console.log(JSON.stringify(tx))
    return tx
  }

  // fund db using ECash string
  depositECash = async (cashu: string) => {
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

  // send funds using ECash string
  withdrawECash = async (amount: number) => {
    const proofs = await storage.getProofs()
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

  // util
  generateLNInvoice = async (amount: number) => {
    const { pr, hash } = await wallet.requestMint(amount)
    console.log(`[requestMint] Pay this invoice for ${amount} sat: `, {
      pr,
      hash,
    })
    // showInvoiceQR(pr)

    storage.insertINInvoice({
      amount,
      hash,
      pr,
      status: "pending",
    })

    return { pr, hash }
  }

  /**
   *
   * @param amount
   * @param hash
   * @ ECASH that can be spent
   */
  checkInvoiceHasBeenPaid = async (amount: number, hash: string) => {
    try {
      // if we pass here - invoice was paid
      const { proofs, newKeys } = await wallet.requestTokens(amount, hash)
      await storage.updateLNInvoice(hash, { status: "paid" })

      for (const p of proofs) {
        await storage.insertProof({
          amount: amount,
          C: p.C,
          id: p.id,
          secret: p.secret,
        })
      }

      console.log(JSON.stringify(newKeys))

      const encoded = getEncodedToken({
        token: [{ mint: MINT_URL, proofs: proofs }],
      })
      console.log({ encoded })
      await storage.insertToken({ amount, status: "paid", token: encoded })
      return encoded
    } catch (err) {
      console.log("Waiting on LN invoice to be paid")
      // console.error(err);
    }
  }
}
