import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { DemoCommunityScreen } from "app/screens"

import { TransactionItemScreen } from "app/screens/Dashboard/TxItemScreen"
import { CompositeScreenProps } from "@react-navigation/native"
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import { AppStackParamList, AppStackScreenProps } from "."

export type DashboardScreenParamList = {
  DemoCommunityScreen: undefined
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
      <Dashboard.Screen name="DemoCommunityScreen" component={DemoCommunityScreen} />
      <Dashboard.Screen name="TransactionItem" component={TransactionItemScreen} />
    </Dashboard.Navigator>
  )
}
