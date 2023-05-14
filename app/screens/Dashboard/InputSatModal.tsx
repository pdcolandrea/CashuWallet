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
import { ShareTextModal } from "./ShareText"

interface SendInvoiceProps {
  expand: () => void
  goLastStep: () => void
  sat: string
  txType: "ln" | "ecash"
}

const SendInvoice = ({ expand, sat, goLastStep, txType }: SendInvoiceProps) => {
  const [token, setToken] = useState("")
  const { send, deposit } = useContext(CashiContext)

  useEffect(() => {
    startSendProcess()
  }, [])

  const startSendProcess = async () => {
    const amount = parseInt(sat)

    let tx = ""
    if (txType === "ecash") {
      tx = await send.ecash(amount)
    } else {
      const { pr } = await deposit.generateLNInvoice(amount)
      tx = pr
    }
    console.log({ tx })

    if (tx) {
      setToken(tx)
    } else {
      console.error("something went wrong")
      goLastStep()
    }
  }

  return (
    <ShareTextModal
      data={token}
      onBackgroundPress={() => {
        expand()
      }}
    />
  )
}

interface SendModalProps {
  onChange?: (index: number) => void
  option: string
}

export const InputSatModal = forwardRef<BottomSheetModal, SendModalProps>((props, ref) => {
  const sendOptions = ["Generate Lightning Invoice", "Generate Cashu Invoice"]
  const { wallet } = useContext(CashiContext)
  const [input, setInput] = useState("")
  const [currentStep, setCurrentStep] = useState(0)
  const inputRef = useRef<TextInput>()
  const snapPoints = useMemo(() => ["35%", "100%"], [])

  const isCashu = props.option === "Cashu Token"
  const parsedInput = parseInt(input)
  const isInputValid = parsedInput && parsedInput > 0
  const hasEnoughBalance = parsedInput && parsedInput <= wallet.balance

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

  const handleFundingMethodPressed = () => {
    if (isCashu && !hasEnoughBalance) {
      // show error
      console.warn("not enough balance")
      return
    }

    // trigger jank layout animation
    setCurrentStep(-1)

    setTimeout(() => {
      openModal()
      setCurrentStep(1)
    }, 500)
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
                value={input}
                onChangeText={(text) => {
                  if (parseInt(text) || (text.length === 0 && input.length === 1)) {
                    setInput(text)
                  }
                }}
              />
            </TouchableOpacity>
            <Text preset="subheading">Method</Text>

            {sendOptions.map((opt, index) => {
              const isSelected = opt.includes(props.option.split(" ")[0])
              return (
                <ListItem
                  leftIcon="ladybug"
                  key={opt}
                  rightIcon={
                    isSelected && props.option === "Cashu Token" && !hasEnoughBalance
                      ? "x"
                      : "caretRight"
                  }
                  disabled={!isInputValid}
                  topSeparator={index === 0}
                  onPress={() => {
                    if (index === 0) {
                      handleFundingMethodPressed()
                    } else {
                      ref.current.close()
                    }
                  }}
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
          txType={props.option === "Cashu Token" ? "ecash" : "ln"}
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
