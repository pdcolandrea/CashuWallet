/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/display-name */
import { BottomSheetModal, BottomSheetTextInput } from "@gorhom/bottom-sheet"
import { ListItem, Text } from "app/components"
import { colors, spacing, typography } from "app/theme"
import React, { forwardRef, useCallback, useContext, useMemo, useRef, useState } from "react"
import { Keyboard, TextInput, TextStyle, TouchableOpacity, View } from "react-native"
import { Icon } from "react-native-elements"
import Animated, { FadeIn, FadeOut } from "react-native-reanimated"
import { ReceiveButton } from "./ReceiveButton"
import { getDecodedToken } from "@cashu/cashu-ts"
import Clipboard from "@react-native-clipboard/clipboard"
import { CashiContext } from "app/utils/context"

const SendECash = ({ expand, input, setInput }) => {
  const { deposit } = useContext(CashiContext)
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

        <ReceiveButton
          sat={sats}
          onPress={async () => {
            await deposit.ecash(input)
          }}
        />
      </Animated.View>
    </TouchableOpacity>
  )
}

interface SendModalProps {
  onChange: (index: number) => void
}

export const SendModal = forwardRef<BottomSheetModal, SendModalProps>((props, ref) => {
  const [input, setInput] = useState("")
  const [currentStep, setCurrentStep] = useState(0)

  const inputRef = useRef<TextInput>()
  const snapPoints = useMemo(() => ["35%"], [])
  const fadeOutDuration = 500

  const parsedInput = parseInt(input)
  const isInputValid = parsedInput && parsedInput > 0

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
        <Animated.View
          exiting={FadeOut}
          style={{ padding: spacing.medium, flex: 1, justifyContent: "flex-end" }}
        >
          <TouchableOpacity
            onPress={() => {
              Keyboard.dismiss()
              openModal()
            }}
            activeOpacity={1}
            style={{ flex: 1 }}
          >
            <TouchableOpacity activeOpacity={1} onPress={() => inputRef.current.focus()}>
              <Text
                preset="heading"
                size="xxxl"
                style={{
                  textAlign: "center",
                  marginBottom: spacing.medium,
                  opacity: isInputValid ? 1 : 0.3,
                }}
              >
                {isInputValid ? input : "0"}
                <Text style={{ opacity: 1 }}>{isInputValid ? "sats" : "sat"}</Text>
              </Text>
              <BottomSheetTextInput
                autoFocus
                keyboardType="number-pad"
                ref={inputRef}
                style={{ display: "none" }}
                onChangeText={(text) => setInput(text)}
              />
            </TouchableOpacity>
            <Text preset="subheading">Method</Text>
            <ListItem
              text="Generate ECash Invoice"
              leftIcon="ladybug"
              rightIcon="caretRight"
              disabled={!isInputValid}
              topSeparator
              onPress={onEcashPressed}
            />
            <ListItem
              text="Pay Lightning Invoice"
              leftIcon="ladybug"
              disabled={!isInputValid}
              rightIcon="caretRight"
            />
          </TouchableOpacity>
        </Animated.View>
      )}

      {currentStep === 1 && <SendECash expand={openModal} setInput={setInput} input={input} />}
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
