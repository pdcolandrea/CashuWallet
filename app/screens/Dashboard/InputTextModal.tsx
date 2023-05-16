/* eslint-disable react/display-name */
import { BottomSheetModal, BottomSheetTextInput } from "@gorhom/bottom-sheet"
import { Text } from "app/components"
import { colors, spacing, typography } from "app/theme"
import React, { forwardRef, useCallback, useContext, useMemo, useState } from "react"
import { Keyboard, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"
import { Icon } from "react-native-elements"
import Animated, { FadeIn } from "react-native-reanimated"
import { ReceiveButton } from "../../components/ReceiveButton"
import { getDecodedToken } from "@cashu/cashu-ts"
import Clipboard from "@react-native-clipboard/clipboard"
import { CashiContext } from "app/utils/context"

interface ReceiveModalProps {
  onChange: (index: number) => void
}

export const InputTextModal = forwardRef<BottomSheetModal, ReceiveModalProps>((props, ref) => {
  const [input, setInput] = useState("")
  const snapPoints = useMemo(() => ["70%"], [])

  const openModal = () => {
    ref.current?.expand()
  }

  const onModalChange = useCallback((index: number) => {
    props.onChange(index)
  }, [])

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
    // navigate to camera screen OR extend modal
    console.log("todo: camera opening")
  }

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      onChange={onModalChange}
      keyboardBehavior="interactive"
      // enablePanDownToClose={currentStep === 0}
    >
      <TouchableOpacity
        style={$modalRoot}
        onPress={() => {
          Keyboard.dismiss()
        }}
        activeOpacity={1}
      >
        <Animated.View entering={FadeIn.delay(300)} style={{ flex: 1, marginBottom: 20 }}>
          <Text preset="subheading" size="xl">
            Input Token or Invoice
          </Text>
          <Text preset="formLabel">
            Enter in your cashu token
            <Text preset="default">
              {" {"}cashux1jk...{"} "}
            </Text>
            or lightning invoice
            <Text preset="default">
              {" {"}ln1jsdi...{"} "}
            </Text>
          </Text>

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

          <View style={$buttonRow}>
            <Icon
              name="clipboard"
              type="feather"
              onPress={onPastePressed}
              containerStyle={$iconCon}
              iconStyle={$innerIcon}
              color={colors.text}
            />
            <Icon
              name="camera"
              type="feather"
              onPress={onCameraPressed}
              containerStyle={$iconCon}
              iconStyle={$innerIcon}
              color={colors.text}
            />
          </View>

          <View style={$flex} />

          <ReceiveButton
            sat={sats}
            onPress={async () => {
              await deposit.ecash(input)
            }}
          />
        </Animated.View>
      </TouchableOpacity>
    </BottomSheetModal>
  )
})

const $buttonRow: ViewStyle = {
  flexDirection: "row",
  marginTop: spacing.small,
  justifyContent: "flex-end",
}
const $modalRoot: ViewStyle = { flex: 1, padding: spacing.medium }
const $flex: ViewStyle = {
  flex: 1,
}
const $iconCon: ViewStyle = {
  backgroundColor: colors.background,
  borderRadius: 120,
  marginLeft: spacing.small,
}
const $innerIcon: ViewStyle = {
  padding: 10,
}
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
  marginTop: spacing.small,
}
