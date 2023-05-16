import React, { useEffect } from "react"
import { ShareTextModal } from "../../components/ShareText"
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
