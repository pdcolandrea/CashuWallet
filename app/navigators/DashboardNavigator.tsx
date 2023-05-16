import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { TransactionItemScreen } from "app/screens/Dashboard/TxItemScreen"
import { CompositeScreenProps } from "@react-navigation/native"
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import { AppStackParamList, AppStackScreenProps } from "."
import { DashboardScreen, DemoDebugScreen } from "app/screens"

export type DashboardScreenParamList = {
  DemoCommunityScreen: undefined
  DemoDebug: undefined
  TransactionItem: {
    data: string
  }
}

export type DashboardTabScreenProps<T extends keyof DashboardScreenParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<DashboardScreenParamList, T>,
    AppStackScreenProps<keyof AppStackParamList>
  >

const Dashboard = createNativeStackNavigator<DashboardScreenParamList>()
export function DashboardNavigator() {
  return (
    <Dashboard.Navigator screenOptions={{ headerShown: false }}>
      <Dashboard.Screen name="DemoCommunityScreen" component={DashboardScreen} />
      <Dashboard.Screen name="TransactionItem" component={TransactionItemScreen} />
      <Dashboard.Screen name="DemoDebug" component={DemoDebugScreen} />
    </Dashboard.Navigator>
  )
}
