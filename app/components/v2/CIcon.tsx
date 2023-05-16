import React from "react"
import { View, ViewStyle } from "react-native"
import { Icon } from "react-native-elements"
import { colors } from "app/theme"
import { Text } from "../Text"

interface CIconProps {
  showUnredeemedIcon: boolean
}

export const CIcon = (props: CIconProps) => {
  return (
    <View style={$container}>
      {/* <View style={$innerContainer}>
        <Text preset="bold" style={{ color: colors.background }}>
          +1
        </Text>
      </View> */}
      <Icon name="lightning-bolt-circle" type="material-community" size={31} />
      {props.showUnredeemedIcon && (
        <View style={$badge}>
          <Text size="xxs" preset="bold">
            P
          </Text>
        </View>
      )}
    </View>
  )
}

const $badge: ViewStyle = {
  position: "absolute",
  width: 20,
  height: 20,
  backgroundColor: "white",
  bottom: -8,
  right: -8,
  borderRadius: 320,
  justifyContent: "center",
  alignItems: "center",
}

const $container: ViewStyle = {
  height: 35,
  width: 35,
  borderRadius: 200,
  backgroundColor: colors.palette.neutral300,
  borderWidth: 1,
  borderColor: colors.palette.accent500,
  justifyContent: "center",
  alignItems: "center",
}

const $innerContainer: ViewStyle = {
  borderRadius: 350,
  height: 30,
  width: 30,
  backgroundColor: colors.text,
  justifyContent: "center",
  alignItems: "center",
}
