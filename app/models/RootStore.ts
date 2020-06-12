import AsyncStorage from "@react-native-community/async-storage"
import { values } from "mobx"
import { Instance, types, flow } from "mobx-state-tree"
import moment from "moment"
import { localStorageMixin } from "mst-gql"
import { AccountType, CurrencyType } from "../utils/enum"
import { Token } from "../utils/token"
import { RootStoreBase } from "./RootStore.base"
import { TransactionModel } from "./TransactionModel"
import { map, filter } from "lodash"
import { homeQuery } from "../screens/accounts-screen"

export const ROOT_STATE_STORAGE_KEY = "rootAppGaloy"


export interface RootStoreType extends Instance<typeof RootStore.Type> {}

export const OnboardingModel = types.model("Onboarding", {
    getStarted: types.optional(types.boolean, false),
  }).actions(self => ({
    getStartedCompleted() { self.getStarted = true },
  }))
  
  export const RootStore = RootStoreBase
  .extend(
    localStorageMixin({
      storage: AsyncStorage,
      // throttle: 1000,
      storageKey: ROOT_STATE_STORAGE_KEY
  }))
  .props({
      onboarding: types.optional(OnboardingModel, {}),
  })
  .actions(self => {
    // This is an auto-generated example action.
    const log = () => {
      console.log(JSON.stringify(self))
    }
    const earnComplete = (id) => {
      const token = new Token().has()
      const wallet = self.wallet("BTC")
      console.tron.log({wallet})

      if (!token) {
        const earn = self.earns.get(id)
        earn.completed = true
        self.earns.set(id, earn)

        const amount = earn.value

        const tx = TransactionModel.create({
          __typename: "Transaction",
          id,
          amount,
          description: id,
          created_at: moment().unix(),
          hash: null,
          type: "earn"
        })

        self.transactions.set(id, tx)
        console.tron.log("transaction:", self.transactions)

        self.wallet("BTC").transactions.push(id)
        self.wallet("BTC").balance += amount
      } else {
        self.mutateEarnCompleted({ids: [id]}, "__typename, id, completed")
        self.queryWallet()
      }
    }
    const loginSuccessful = flow(function*() {
      self.transactions.clear()

      const ids = map(filter(values(self.earns), {completed: true}), "id")
      yield self.mutateEarnCompleted({ids})

      console.tron.log("yield self.mutateEarnCompleted({ids}) done")
      
      // self.earns.clear()
      yield homeQuery(self)
      self.users.delete("incognito")
      console.tron.log("home query done")
    })
  
    return { log, earnComplete, loginSuccessful }
  })
  .views((self) => ({
    // workaround on the fact key can't be enum
    rate(currency: CurrencyType) {
      if (currency === CurrencyType.USD) {
        return 1
      } else if (currency === CurrencyType.BTC) {
        const p = values(self.prices)
        if (p.length > 0) {
          return p[p.length - 1].o
        } else {
          return 1 // FIXME
        }
      } else {
        throw Error(`currency ${currency} doesn't exist`)
      }
    },
    get user() {
      const users = values(self.users)
      // FIXME dirty way to manage incognito user
      return  users[users.length - 1]
    },
    get earnArray() {
      const earnsArray = values(self.earns)
      return earnsArray
    },
    get earnedSat() {
      return values(self.earns)
        .filter(item => item.completed)
        .reduce((acc, item) => item.value + acc, 0)
    },
    wallet(currency) {
      return values(self.wallets).filter(item => item.currency === currency)[0]
    },
    balance(currency) {
      const wallet = self.wallet(currency)
      return wallet.balance
    },
    balances({ currency, account }) {
      const balances = {}

      const btcConversion = self.rate("BTC") / self.rate(currency)

      balances[AccountType.Bitcoin] = self.balance("BTC") * btcConversion
      balances[AccountType.Bank] = self.balance("USD") / self.rate(currency)
      balances[AccountType.BankAndBitcoin] =
        balances[AccountType.Bank] + balances[AccountType.Bitcoin]

      return balances[account]
    },
  }))
    // return in BTC instead of SAT
    // get getInBTC() {
    //   return (self.BTC * Math.pow(10, 8))
    // }