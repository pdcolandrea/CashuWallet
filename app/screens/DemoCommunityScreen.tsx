import React, { FC, useContext, useRef, useState } from "react"
import { ImageStyle, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"
import { Button, Screen, Text } from "../components"
import { DemoTabScreenProps } from "../navigators/DemoNavigator"
import { spacing } from "../theme"
import { BottomSheetModal } from "@gorhom/bottom-sheet"
import { ReceiveModal } from "./Dashboard/ReceiveModal"
import { CashiContext } from "app/utils/context"
import { SendModal } from "./Dashboard/SendModal"
import Animated, { FadeIn, FadeInRight, FadeOutRight } from "react-native-reanimated"
import { AText } from "app/components/AnimatedText"

export const DemoCommunityScreen: FC<DemoTabScreenProps<"DemoCommunity">> =
  function DemoCommunityScreen(_props) {
    const { wallet } = useContext(CashiContext)
    const [viewingCurr, setViewingCurr] = useState<"Lightning Network" | "Cashu Token">(
      "Lightning Network",
    )
    const [viewingModal, setViewingModal] = useState<"receive" | "withdraw" | "">("")
    const receiveModal = useRef<BottomSheetModal>(null)
    const sendModal = useRef<BottomSheetModal>(null)

    const switchCurrMethods = () =>
      setViewingCurr((val) => {
        if (val === "Cashu Token") return "Lightning Network"
        return "Cashu Token"
      })

    const onReceivePressed = () => {
      setViewingModal("receive")
      receiveModal.current.present()
    }

    const onSendPressed = () => {
      setViewingModal("withdraw")
      sendModal.current.present()
    }

    return (
      <>
        <Screen preset="scroll" contentContainerStyle={$container} safeAreaEdges={["top"]}>
          <Text preset="heading" style={$title}>
            {wallet.balance} Sats
          </Text>

          <AText onPress={switchCurrMethods} preset="subheading" style={{ textAlign: "center" }}>
            {viewingCurr}
          </AText>

          <View style={$buttonCon}>
            <Button
              preset={viewingModal === "receive" ? "reversed" : "default"}
              text="Receive"
              textStyle={{ paddingHorizontal: 20 }}
              onPress={onReceivePressed}
            />
            <Button
              text="Withdraw"
              preset={viewingModal === "withdraw" ? "reversed" : "default"}
              style={{ marginLeft: spacing.large }}
              textStyle={{ paddingHorizontal: 20 }}
              onPress={onSendPressed}
            />
          </View>
          <TouchableOpacity onPress={switchCurrMethods}>
            <Text>D</Text>
          </TouchableOpacity>
        </Screen>

        <SendModal
          ref={receiveModal}
          onChange={(index) => {
            if (index === -1) {
              setViewingModal("")
            }
          }}
        />

        <ReceiveModal
          ref={sendModal}
          onChange={(index) => {
            if (index === -1) {
              setViewingModal("")
            }
          }}
        />
      </>
    )
  }

const $container: ViewStyle = {
  paddingTop: spacing.large + spacing.extraLarge,
  paddingHorizontal: spacing.large,
  alignItems: "center",
}

const $buttonCon: ViewStyle = { flexDirection: "row", marginTop: spacing.large }

const $title: TextStyle = {
  marginBottom: spacing.extraSmall,
  textAlign: "center",
}

const $tagline: TextStyle = {
  marginBottom: spacing.huge,
}

const $description: TextStyle = {
  marginBottom: spacing.large,
}

const $sectionTitle: TextStyle = {
  marginTop: spacing.huge,
}

const $logoContainer: ViewStyle = {
  marginEnd: spacing.medium,
  flexDirection: "row",
  flexWrap: "wrap",
  alignContent: "center",
}

const $logo: ImageStyle = {
  height: 38,
  width: 38,
}

// @demo remove-file
