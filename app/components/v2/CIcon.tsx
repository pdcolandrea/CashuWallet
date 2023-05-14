import React from "react"
import { View, ViewStyle } from "react-native"
import { Icon } from "react-native-elements"
import { colors } from "app/theme"

export const CIcon = () => {
  return (
    <View style={$container}>
      <Icon name="lightning-bolt-circle" type="material-community" size={31} />
    </View>
  )
}

const $container: ViewStyle = {
  height: 40,
  width: 40,
  borderRadius: 200,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: colors.palette.neutral300,
  borderWidth: 1,
  borderColor: colors.palette.accent500,
}
