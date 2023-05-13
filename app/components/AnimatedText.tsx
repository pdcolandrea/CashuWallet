import React from "react"
import Animated from "react-native-reanimated"
import { Text, TextProps } from "./Text"

class TextComponent extends React.Component<TextProps> {
  render() {
    return <Text {...this.props} />
  }
}

export const AText = Animated.createAnimatedComponent(TextComponent)
