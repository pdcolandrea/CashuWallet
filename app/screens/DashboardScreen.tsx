import React, { FC, useContext, useEffect, useRef, useState } from "react"
import {
  FlatList,
  ImageStyle,
  Pressable,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"
import { Button, Screen, Text } from "../components"
import { DemoTabScreenProps } from "../navigators/DemoNavigator"
import { colors, spacing } from "../theme"
import { BottomSheetModal } from "@gorhom/bottom-sheet"
import { CashiContext } from "app/utils/context"

import { AText } from "app/components/AnimatedText"
import { InputSatModal } from "./Dashboard/InputSatModal"
import { InputTextModal } from "./Dashboard/InputTextModal"
import Animated, {
  Easing,
  Extrapolate,
  FadeIn,
  FadeInLeft,
  FadeOut,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated"
import { CIcon } from "app/components/v2/CIcon"
import { isInvoice, timeSince } from "app/utils/format"

export const DashboardScreen: FC<DemoTabScreenProps<"DemoCommunity">> = function DashboardScreen(
  _props,
) {
  const { wallet } = useContext(CashiContext)
  const [viewingCurr, setViewingCurr] = useState<"Lightning Network" | "Cashu Token">("Cashu Token")
  const [viewingModal, setViewingModal] = useState<"receive" | "withdraw" | "">("")
  const debugCount = useRef(0)
  const receiveModal = useRef<BottomSheetModal>(null)
  const sendModal = useRef<BottomSheetModal>(null)
  const animation = useSharedValue(0)
  const animatedStyles = useAnimatedStyle(() => {
    const opacity = interpolate(animation.value, [0, 0.5, 1], [0.6, 0.2, 0], Extrapolate.CLAMP)
    return {
      opacity,
      transform: [{ scale: animation.value }],
    }
  })

  // We repeatedly doing shared value from 0 to 1
  useEffect(() => {
    animation.value = withRepeat(
      withTiming(1, {
        duration: 3000,
        easing: Easing.linear,
      }),
      -1,
      false,
    )
  }, [])

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
      <Screen contentContainerStyle={$container} safeAreaEdges={["top"]}>
        <Text
          onPress={() => {
            // debug for testing
            if (debugCount.current >= 5) {
              _props.navigation.navigate("DemoDebug")
            } else {
              debugCount.current += 1
            }
          }}
          style={$smallText}
        >
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
            style={$button}
            onPress={onReceivePressed}
          />

          <TouchableOpacity activeOpacity={1} onPress={switchCurrMethods}>
            {viewingCurr === "Lightning Network" ? (
              <>
                <Animated.Image
                  key={Math.random()}
                  entering={FadeIn}
                  exiting={FadeOut}
                  source={require("../../assets/images/ln.png")}
                  style={$headerImg}
                />
                <View style={$absolute}>
                  <Animated.View style={[$purpleCircle, animatedStyles]} />
                </View>
              </>
            ) : (
              <>
                <Animated.Image
                  key={Math.random()}
                  entering={FadeIn}
                  exiting={FadeOut}
                  source={require("../../assets/images/cashu.png")}
                  style={$headerImg}
                />
                <View style={$absolute}>
                  <Animated.View style={[$purpleCircle, animatedStyles]} />
                </View>
              </>
            )}
          </TouchableOpacity>

          <Button
            text="Send"
            preset={viewingModal === "withdraw" ? "reversed" : "default"}
            style={$button}
            onPress={onSendPressed}
          />
        </View>

        <View style={$flex}>
          <Text preset="heading" style={{ marginTop: spacing.medium, marginBottom: spacing.small }}>
            History
          </Text>

          <FlatList
            data={wallet.history}
            ItemSeparatorComponent={() => <View style={{ height: spacing.small }} />}
            renderItem={({ item, index }) => {
              let title: string
              let payment: string
              let subtitle: string
              let rightTitle: string

              if (item.amount < 0) {
                payment = `Sent`
              } else {
                payment = `Received`
              }

              if (isInvoice(item)) {
                if (item.amount < 0) {
                  title = `Invoice for ${item.amount}sat`
                } else {
                  title = `Invoice for ${item.amount}sat`
                }

                if (item.status === "pending") {
                  subtitle = `Awaiting Payment`
                } else if (item.status === "expired") {
                  subtitle = "Expired"
                  rightTitle = "❌"
                } else {
                  subtitle = `Paid`
                  rightTitle = "✔️"
                }
              } else {
                title = `${payment} ${item.amount}cashu`
                subtitle = `${timeSince(item.date)} ago`
                rightTitle = `${item.amount}`
              }

              return (
                <Pressable
                  onPress={() => {
                    _props.navigation.navigate("DemoCommunity", {
                      screen: "TransactionItem",
                      params: {
                        data: item.token || item.pr,
                      },
                    })
                  }}
                >
                  <Animated.View
                    key={index}
                    entering={FadeInLeft.delay(250 * index).springify()}
                    style={$centeredRow}
                  >
                    <CIcon showUnredeemedIcon={item.status === "pending"} />
                    <View style={$innerListCon}>
                      <View>
                        <Text preset="bold">{title}</Text>
                        <Text>{`${subtitle}`}</Text>
                      </View>

                      <Text preset="bold">{rightTitle}</Text>
                    </View>
                  </Animated.View>
                </Pressable>
              )
            }}
          />
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

const $absolute: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: "center",
  alignItems: "center",
}
const $button: ViewStyle = { width: "35%" }
const $centeredRow: ViewStyle = { flexDirection: "row", alignItems: "center", width: "100%" }
const $container: ViewStyle = {
  paddingTop: spacing.large + spacing.extraLarge,
  paddingHorizontal: spacing.large,
  flex: 1,
}
const $buttonCon: ViewStyle = {
  flexDirection: "row",
  marginTop: spacing.large,
  marginBottom: spacing.large,
  justifyContent: "space-between",
  alignItems: "center",
}
const $headerImg: ImageStyle = { height: 50, width: 50, borderRadius: 120, zIndex: 1 }
const $flex: ViewStyle = { flex: 1 }
const $title: TextStyle = {
  marginBottom: spacing.extraSmall,
  textAlign: "center",
}
const $innerListCon: ViewStyle = {
  flex: 1,
  marginLeft: spacing.small,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
}
const $purpleCircle: ViewStyle = {
  width: 80,
  height: 80,
  borderRadius: 120,
  borderColor: "#673ab6",
  borderWidth: 4,
  backgroundColor: "#825aca",
}
const $smallText: TextStyle = { color: colors.tint, alignSelf: "flex-end", marginBottom: 10 }
