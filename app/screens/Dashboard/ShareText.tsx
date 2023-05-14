import React from "react"
import { colors, spacing } from "app/theme"
import { Button, Card, Text } from "app/components"
import { TouchableOpacity, Keyboard, View, ActivityIndicator, ViewStyle } from "react-native"
import QRCode from "react-native-qrcode-svg"
import Animated, { FadeIn } from "react-native-reanimated"
import { Icon } from "react-native-elements"
import Clipboard from "@react-native-clipboard/clipboard"

interface ShareTextModalProps {
  onBackgroundPress: () => void
  data: string
}

export const ShareTextModal = (props: ShareTextModalProps) => {
  const copyTokenToClipboard = () => Clipboard.setString(props.data)

  const onSharePressed = () => {
    console.warn("todo: share")
  }
  return (
    <TouchableOpacity
      style={$root}
      onPress={() => {
        Keyboard.dismiss()
        props.onBackgroundPress()
      }}
      activeOpacity={1}
    >
      <Animated.View entering={FadeIn.delay(300)} style={{ flex: 1, marginBottom: 20 }}>
        <View style={$headerRow}>
          <Text preset="heading">Send</Text>
          <Icon
            name="share"
            type="font-awesome-5"
            onPress={onSharePressed}
            containerStyle={{
              backgroundColor: colors.background,
              borderRadius: 120,
              padding: 6,
              justifyContent: "center",
              alignItems: "center",
            }}
            size={18}
            color={colors.text}
          />
        </View>
        <Card
          onPress={copyTokenToClipboard}
          ContentComponent={
            props.data ? (
              <View style={{ padding: 2 }}>
                <QRCode value={props.data} size={170} />
              </View>
            ) : (
              <ActivityIndicator />
            )
          }
          style={{ marginBottom: spacing.small }}
        />
        <Text preset="subheading">or</Text>

        <Card
          heading="Click Here to Copy"
          onPress={copyTokenToClipboard}
          style={{ marginTop: spacing.small }}
          // content={props.data.slice(-5)}
          footer="Only share this token with users you'd like to pay"
        />

        <View style={{ flex: 1 }} />

        <Button preset="filled" text="Done" onPress={props.onBackgroundPress} />
      </Animated.View>
    </TouchableOpacity>
  )
}

const $headerRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: spacing.medium,
}
const $root: ViewStyle = { flex: 1, padding: spacing.medium, marginTop: spacing.massive }
