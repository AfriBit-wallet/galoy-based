import * as React from "react"
import { Text, View } from "react-native"
import { Divider } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { CloseCross } from "../../components/close-cross"
import { colorTypeFromIconType, IconTransaction } from "../../components/icon-transactions"
import { Screen } from "../../components/screen"
import { TextCurrency } from "../../components/text-currency"
import { translate } from "../../i18n"
import { palette } from "../../theme/palette"
import { AccountDetailItemProps } from "../account-detail-screen"


const styles = EStyleSheet.create({
  screen: {
    backgroundColor: palette.white
  },

  amountText: {
    fontSize: "18rem",
    marginVertical: "6rem",
    color: palette.white,
  },

  amount: {
    fontSize: "32rem",
    color: palette.white,
  },

  amountSecondary: {
    fontSize: "16rem",
    color: palette.white,
  },

  amountView: {
    alignItems: "center",
    paddingTop: "48rem",
    paddingBottom: "24rem",
  },

  description: {
    marginVertical: 12,
  },

  map: {
    height: 150,
    marginBottom: 12,
    marginLeft: "auto",
    marginRight: 30,
    width: 150,
  },

  entry: {
    color: palette.midGrey,
    marginBottom: "6rem",
  },

  value: {
    color: palette.darkGrey,
    fontSize: "14rem",
    fontWeight: "bold",
  },

  transactionDetailText: {
    color: palette.darkGrey,
    fontSize: "18rem",
    fontWeight: "bold",
  },

  transactionDetailView: {
    marginHorizontal: "24rem",
    marginVertical: "24rem",
  },

  divider: {
    backgroundColor: palette.midGrey,
    marginVertical: "12rem",
  }
})

const Row = ({ entry, value }) => (
  <View style={styles.description}>
    <Text style={styles.entry}>{entry}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
)

export const TransactionDetailScreen = ({ route, navigation }) => {
  
  const { currency, account, amount, date, hash, type, description, fee, isReceive,
    destination, id, usd, feeUsd } = route.params as AccountDetailItemProps

  const spendOrReceiveText = isReceive ? 
    translate("TransactionDetailScreen.received") : 
    translate("TransactionDetailScreen.spent")

  const options = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }

  const date_format = date.toLocaleString("en-US", options)

  return (
    <Screen style={styles.screen} unsafe={true}>
      <View style={[styles.amountView, {backgroundColor: colorTypeFromIconType(isReceive)}]}>
        <IconTransaction isReceive={isReceive} size={100} transparent={true} />
        <Text style={styles.amountText}>{spendOrReceiveText}</Text>
        {!!usd &&
          <TextCurrency amount={Math.abs(usd)} currency={"USD"} style={styles.amount} />
        }
        <TextCurrency amount={Math.abs(amount)} currency={currency} style={styles.amountSecondary} />
      </View>

      <View style={styles.transactionDetailView}>
        <Text style={styles.transactionDetailText}>{translate("TransactionDetailScreen.detail")}</Text>
        <Divider style={styles.divider} />
        <Row entry={translate("common.date")} value={date_format} />
        <Row entry={translate("common.description")} value={description} />
        {hash &&
          <Row entry={"Hash"} value={hash} />
        }
        {id &&
          <Row entry={"id"} value={id} />
        }
        {isReceive && !!fee &&
          <Row entry={translate("common.fee")} value={fee} />
        }
        {isReceive && !!feeUsd &&
          <Row entry={translate("common.fee")} value={feeUsd} />
        }
      </View>
      <CloseCross color={palette.white} onPress={() => navigation.goBack()} />
    </Screen>
  )
}
