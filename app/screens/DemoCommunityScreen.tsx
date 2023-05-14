import React, { FC, useContext, useRef, useState } from "react"
import { ImageStyle, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"
import { AutoImage, Button, Card, ListItem, Screen, Text } from "../components"
import { DemoTabScreenProps } from "../navigators/DemoNavigator"
import { colors, spacing } from "../theme"
import { BottomSheetModal } from "@gorhom/bottom-sheet"
import { CashiContext } from "app/utils/context"

import { AText } from "app/components/AnimatedText"
import { InputSatModal } from "./Dashboard/InputSatModal"
import { InputTextModal } from "./Dashboard/InputTextModal"
import dayjs from "dayjs"
import { Icon } from "react-native-elements"
import Animated, { FadeIn, FadeInLeft, FadeOut } from "react-native-reanimated"
import { Image } from "react-native"
import { CIcon } from "app/components/v2/CIcon"

export const DemoCommunityScreen: FC<DemoTabScreenProps<"DemoCommunity">> =
  function DemoCommunityScreen(_props) {
    const { wallet } = useContext(CashiContext)
    const [viewingCurr, setViewingCurr] = useState<"Lightning Network" | "Cashu Token">(
      "Cashu Token",
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
      if (viewingCurr === "Lightning Network") {
        sendModal.current.present()
      } else {
        receiveModal.current.present()
      }
    }

    const onSendPressed = () => {
      setViewingModal("withdraw")
      if (viewingCurr === "Lightning Network") {
        receiveModal.current.present()
      } else {
        sendModal.current.present()
      }
    }

    return (
      <>
        <Screen preset="scroll" contentContainerStyle={$container} safeAreaEdges={["top"]}>
          <Text style={{ color: colors.tint, alignSelf: "flex-end", marginBottom: 10 }}>
            15sat Pending
          </Text>
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
              style={{
                width: "35%",
              }}
              onPress={onReceivePressed}
            />

            <TouchableOpacity
              activeOpacity={1}
              onPress={switchCurrMethods}
              style={{ padding: 6, backgroundColor: colors.palette.neutral300, borderRadius: 300 }}
            >
              {viewingCurr === "Lightning Network" ? (
                <Animated.Image
                  key={Math.random()}
                  entering={FadeIn}
                  exiting={FadeOut}
                  source={require("../../assets/images/ln.png")}
                  style={{ height: 50, width: 50, borderRadius: 120 }}
                />
              ) : (
                <Animated.Image
                  key={Math.random()}
                  entering={FadeIn}
                  exiting={FadeOut}
                  source={require("../../assets/images/cashu.png")}
                  style={{ height: 50, width: 50, borderRadius: 120 }}
                />
              )}
            </TouchableOpacity>
            <Button
              text="Send"
              preset={viewingModal === "withdraw" ? "reversed" : "default"}
              style={{ width: "35%" }}
              onPress={onSendPressed}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              preset="heading"
              style={{ marginTop: spacing.medium, marginBottom: spacing.small }}
            >
              History
            </Text>

            {wallet.history.map((tx, index) => {
              return (
                <Animated.View
                  key={tx.token.toString()}
                  entering={FadeInLeft.delay(1000 * index)}
                  style={{ flexDirection: "row", alignItems: "center", width: "100%" }}
                >
                  <CIcon />
                  <View
                    style={{
                      flex: 1,
                      marginLeft: spacing.small,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <View style={{ flexDirection: "column" }}>
                      <Text preset="bold">{`Received ${tx.amount} cashu`}</Text>
                      <Text>{`{...${tx.token.slice(-5)}} : ${dayjs(tx.date).format(
                        "M/DD/YY",
                      )}`}</Text>
                    </View>

                    <View>
                      <Text preset="bold">+1</Text>
                    </View>
                  </View>
                </Animated.View>
              )
            })}
          </View>
        </Screen>

        <InputSatModal
          ref={sendModal}
          onChange={(index) => {
            if (index === -1) setViewingModal("")
          }}
          option={viewingCurr}
        />

        <InputTextModal
          ref={receiveModal}
          onChange={(index) => {
            if (index === -1) setViewingModal("")
          }}
        />
      </>
    )
  }

const $container: ViewStyle = {
  paddingTop: spacing.large + spacing.extraLarge,
  paddingHorizontal: spacing.large,
}

const $buttonCon: ViewStyle = {
  flexDirection: "row",
  marginTop: spacing.large,
  marginBottom: spacing.large,
  justifyContent: "space-between",
  alignItems: "center",
}

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
