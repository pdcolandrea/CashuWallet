import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { DemoCommunityScreen } from "app/screens"
import { ReceiveModal } from "app/screens/Dashboard/ReceiveModal"

// export type DashboardScreenParamList = {
//   DemoCommunityScreen: undefined
//   ReceiveModal: undefined
// }

//   export type DemoTabScreenProps<T extends keyof DemoTabParamList> = CompositeScreenProps<
//     BottomTabScreenProps<DemoTabParamList, T>,
//     AppStackScreenProps<keyof AppStackParamList>
//   >

const Dashboard = createNativeStackNavigator<DashboardScreenParamList>()
export function DashboardNavigator() {
  return (
    <Dashboard.Navigator screenOptions={{ headerShown: false }}>
      <Dashboard.Screen name="DemoCommunityScreen" component={DemoCommunityScreen} />
    </Dashboard.Navigator>
  )
}
