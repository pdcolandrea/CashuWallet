// to be used in ecash send and ln receive

/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/display-name */
import { BottomSheetModal, BottomSheetTextInput } from "@gorhom/bottom-sheet"
import { Button, Card, ListItem, Text } from "app/components"
import { colors, spacing, typography } from "app/theme"
import React, {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  ActivityIndicator,
  Keyboard,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
} from "react-native"
import Animated, { FadeIn, FadeOut } from "react-native-reanimated"
import QRCode from "react-native-qrcode-svg"
import { CashiContext } from "app/utils/context"
import Clipboard from "@react-native-clipboard/clipboard"
import { Icon } from "react-native-elements"

interface SendInvoiceProps {
  expand: () => void
  goLastStep: () => void
  sat: string
}

const SendInvoice = ({ expand, sat, goLastStep }: SendInvoiceProps) => {
  const [token, setToken] = useState("")
  const { send } = useContext(CashiContext)

  const startSendProcess = async () => {
    const tx = await send.ecash(parseInt(sat))
    if (tx) {
      setToken(tx)
    } else {
      console.error("something went wrong")
      goLastStep()
    }
  }

  const copyTokenToClipboard = () => Clipboard.setString(token)

  const onSharePressed = () => {}

  useEffect(() => {
    startSendProcess()
  }, [])

  return (
    <TouchableOpacity
      style={{ flex: 1, padding: spacing.medium, paddingTop: spacing.extraLarge }}
      onPress={() => {
        Keyboard.dismiss()
        expand()
      }}
      activeOpacity={1}
    >
      <Animated.View entering={FadeIn.delay(300)} style={{ flex: 1, marginBottom: 20 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
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
          heading="Cashu Token"
          onPress={copyTokenToClipboard}
          content={token ? "token" : "..."}
          footer="Only share this token with users you'd like to pay"
        />
        <Card
          heading="Cashu Token"
          onPress={copyTokenToClipboard}
          ContentComponent={token ? <QRCode value={token} size={150} /> : <ActivityIndicator />}
          style={{ marginTop: spacing.large }}
          footer="Only share this token with users you'd like to pay"
        />

        <View style={{ flex: 1 }} />

        <Button preset="filled" text="Done" />
      </Animated.View>
    </TouchableOpacity>
  )
}

interface SendModalProps {
  onChange?: (index: number) => void
  option: string
}

const sendOptions = ["Generate Lightning Invoice", "Generate Cashu Invoice"]

export const InputSatModal = forwardRef<BottomSheetModal, SendModalProps>((props, ref) => {
  const { wallet } = useContext(CashiContext)
  const [input, setInput] = useState("")
  const [currentStep, setCurrentStep] = useState(0)
  const inputRef = useRef<TextInput>()
  const snapPoints = useMemo(() => ["35%", "100%"], [])

  const parsedInput = parseInt(input)
  const isInputValid = parsedInput && parsedInput > 0
  const hasEnoughBalance = parsedInput && parsedInput >= wallet.balance

  useEffect(() => {
    if (props.option !== "Lightning Network") {
      sendOptions.reverse()
    }
  }, [props.option])

  const openModal = () => {
    ref.current?.expand()
  }

  const onModalChange = useCallback((index: number) => {
    props.onChange(index)

    if (index === -1) {
      setCurrentStep(0)
    }
  }, [])

  const handleFundingMethodPressed = (continueWithFunding: boolean) => {
    if (!continueWithFunding) {
      ref.current.close()
    } else {
      // trigger jank layout animation
      setCurrentStep(-1)

      setTimeout(() => {
        openModal()
        setCurrentStep(1)
      }, 500)
    }
  }

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
            {sendOptions.map((opt, index) => {
              const isSelected = opt.includes(props.option.split(" ")[0])
              return (
                <ListItem
                  leftIcon="ladybug"
                  key={opt}
                  rightIcon={isSelected && !hasEnoughBalance ? "x" : "caretRight"}
                  disabled={!isInputValid}
                  topSeparator={index === 0}
                  onPress={() => handleFundingMethodPressed(isSelected)}
                >
                  <Text preset={isSelected ? "bold" : "default"}>{opt}</Text>
                </ListItem>
              )
            })}
          </TouchableOpacity>
        </Animated.View>
      )}

      {currentStep === 1 && (
        <SendInvoice
          expand={openModal}
          sat={input}
          goLastStep={() => {
            setCurrentStep((step) => (step -= 1))
          }}
        />
      )}
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
