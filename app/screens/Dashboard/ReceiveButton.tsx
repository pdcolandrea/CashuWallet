import React from "react"
import { Button, Text } from "app/components"
import Animated, { FadeIn, FadeOut } from "react-native-reanimated"

interface ReceiveButtonProps {
  sat?: number
}

export const ReceiveButton = ({ sat }: ReceiveButtonProps) => {
  const isValid = Number.isInteger(sat)
  let text = "Token Not Valid"
  if (isValid) {
    text = `Receive ${sat} sat`
  }

  return (
    <Button
      preset="filled"
      text={isValid ? `Receive ${sat}sat` : `Token Not Valid`}
      disabled={!isValid}
    >
      <Animated.Text exiting={FadeOut}>{text}</Animated.Text>
    </Button>
  )
}
