/* eslint-disable react/display-name */
import { BottomSheetModal, BottomSheetTextInput } from "@gorhom/bottom-sheet"
import { ListItem, Text } from "app/components"
import { colors, spacing, typography } from "app/theme"
import React, { forwardRef, useCallback, useMemo, useState } from "react"
import { Keyboard, TextStyle, TouchableOpacity, View } from "react-native"
import { Icon } from "react-native-elements"
import Animated, { FadeIn, FadeOut } from "react-native-reanimated"
import { ReceiveButton } from "./ReceiveButton"
import { getDecodedToken } from "@cashu/cashu-ts"
import Clipboard from "@react-native-clipboard/clipboard"

const ReceiveECash = ({ expand, input, setInput }) => {
  let sats: number

  try {
    const { token } = getDecodedToken(input)
    sats = token[0].proofs[0].amount
  } catch (err) {
    console.log(err)
  }

  const onPastePressed = async () => {
    const cashu = await Clipboard.getString()
    if (cashu.startsWith("cashu")) {
      setInput(cashu)
    } else {
      console.log("not valid token")
    }
  }

  const onCameraPressed = () => {
    console.log("camera: todo ")
  }

  return (
    <TouchableOpacity
      style={{ flex: 1, padding: spacing.medium }}
      onPress={() => {
        Keyboard.dismiss()
        expand()
      }}
      activeOpacity={1}
    >
      <Animated.View entering={FadeIn.delay(300)} style={{ flex: 1, marginBottom: 20 }}>
        <Text preset="subheading">Input Token</Text>
        <BottomSheetTextInput
          style={$inputStyle}
          onChangeText={(text) => setInput(text)}
          autoCorrect={false}
          autoCapitalize="none"
          autoComplete="off"
          autoFocus
          placeholder="cashu....."
          multiline
        />

        <View
          style={{ flexDirection: "row", marginTop: spacing.small, justifyContent: "flex-end" }}
        >
          <Icon
            name="clipboard"
            type="feather"
            onPress={onPastePressed}
            containerStyle={{ backgroundColor: colors.background, borderRadius: 120 }}
            iconStyle={{ padding: 10 }}
            color={colors.text}
          />
          <Icon
            name="camera"
            type="feather"
            onPress={() => {}}
            containerStyle={{
              backgroundColor: colors.background,
              borderRadius: 120,
              marginLeft: spacing.small,
            }}
            iconStyle={{ padding: 10 }}
            color={colors.text}
          />
        </View>

        <View style={{ flex: 1 }} />

        <ReceiveButton sat={sats} />
      </Animated.View>
    </TouchableOpacity>
  )
}

const ReceiveLightning = () => {}

interface ReceiveModalProps {
  onChange: (index: number) => void
}

export const ReceiveModal = forwardRef<BottomSheetModal, ReceiveModalProps>((props, ref) => {
  const [input, setInput] = useState("")
  const [currentStep, setCurrentStep] = useState(0)
  const snapPoints = useMemo(() => ["25%", "50%"], [])
  const fadeOutDuration = 500

  const openModal = () => {
    ref.current?.expand()
  }

  const onEcashPressed = () => {
    // trigger jank layout animation
    setCurrentStep(-1)

    setTimeout(() => {
      ref.current.expand()
      setCurrentStep(1)
    }, fadeOutDuration)
  }
  const onLightningPressed = () => {}

  const onModalChange = useCallback((index: number) => {
    props.onChange(index)

    if (index === -1) {
      setCurrentStep(0)
    }
  }, [])

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      onChange={onModalChange}
      keyboardBehavior="interactive"
      // enablePanDownToClose={currentStep === 0}
    >
      {currentStep === 0 && (
        <Animated.View exiting={FadeOut} style={{ padding: spacing.medium }}>
          <Text preset="subheading">Method</Text>
          <ListItem
            text="Fund using ECash"
            leftIcon="ladybug"
            rightIcon="caretRight"
            topSeparator
            onPress={onEcashPressed}
          />
          <ListItem text="Fund using Lightning Network" leftIcon="ladybug" rightIcon="caretRight" />
        </Animated.View>
      )}

      {currentStep === 1 && <ReceiveECash expand={openModal} setInput={setInput} input={input} />}
    </BottomSheetModal>
  )
})

const $inputStyle: TextStyle = {
  fontFamily: typography.primary.normal,
  color: colors.text,
  fontSize: 16,
  height: 130,
  minHeight: 60,
  backgroundColor: colors.background,
  borderColor: colors.border,
  borderWidth: 1,
  borderRadius: 4,
  // https://github.com/facebook/react-native/issues/21720#issuecomment-532642093
  paddingVertical: 6,
  paddingHorizontal: 6,
}
