import React from "react"
import { ShareTextModal } from "./ShareText"
import { useNavigation, useRoute } from "@react-navigation/native"

export const TransactionItemScreen = () => {
  const params = useRoute().params
  const navigation = useNavigation()
  return (
    <ShareTextModal
      data={params?.data || ""}
      onBackgroundPress={() => {
        navigation.goBack()
      }}
    />
  )
}
