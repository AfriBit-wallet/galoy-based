import * as React from "react"
import { View } from "react-native"

import OnchainIcon from "@app/assets/icons-redesign/bitcoin.svg"
import DollarIcon from "@app/assets/icons-redesign/dollar.svg"
import LightningIcon from "@app/assets/icons-redesign/lightning.svg"
import { WalletCurrency } from "@app/graphql/generated"
import { useTheme } from "@rneui/themed"

type Props = {
  isReceive: boolean
  pending?: boolean
  walletCurrency: WalletCurrency
  onChain: boolean
}

export const IconTransaction: React.FC<Props> = ({
  walletCurrency,
  onChain = false,
  pending = false,
}) => {
  const {
    theme: { colors },
  } = useTheme()

  switch (walletCurrency) {
    case WalletCurrency.Btc:
      if (onChain && pending) return <OnchainIcon color={colors.grey3} />
      if (onChain && !pending) return <OnchainIcon color={colors.primary} />
      return <LightningIcon color={colors.primary} />
    case WalletCurrency.Usd:
      if (onChain && pending) return <DollarIcon color={colors.grey3} />
      if (onChain && !pending) return <DollarIcon color={colors._green} />
      return <DollarIcon color={colors._green} />
    default:
      return <View />
  }
}
