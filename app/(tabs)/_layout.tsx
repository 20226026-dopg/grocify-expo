import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import {
  Icon,
  Label,
  NativeTabs,
  VectorIcon,
} from "expo-router/unstable-native-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useColorScheme } from "react-native";
import { useGroceryStore } from "@/store/grocery-store";
import { useEffect } from "react";

export default function TabsLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const colorScheme = useColorScheme();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  const isDark = colorScheme === "dark";
  const activeColor = isDark ? "#38DC74" : "#15934E";
  const inactiveColor = isDark ? "#A0BBA9" : "#4C8162";

  return (
    <NativeTabs
      tintColor={activeColor}
      iconColor={{ default: inactiveColor, selected: activeColor }}
      labelStyle={{
        default: { color: inactiveColor },
        selected: { color: activeColor },
      }}
    >
      <NativeTabs.Trigger name="index">
        <Label>List</Label>
        <Icon
          sf={{ default: "list.bullet", selected: "list.bullet" }}
          androidSrc={{
            default: <VectorIcon family={Ionicons} name="list-outline" />,
            selected: <VectorIcon family={Ionicons} name="list" />,
          }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="planner">
        <Label>Planner</Label>
        <Icon
          sf={{ default: "calendar", selected: "calendar" }}
          androidSrc={{
            default: <VectorIcon family={Ionicons} name="calendar-outline" />,
            selected: <VectorIcon family={Ionicons} name="calendar" />,
          }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="insights">
        <Label>Insights</Label>
        <Icon
          sf={{ default: "chart.bar", selected: "chart.bar.fill" }}
          androidSrc={{
            default: (
              <VectorIcon family={Ionicons} name="stats-chart-outline" />
            ),
            selected: <VectorIcon family={Ionicons} name="stats-chart" />,
          }}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
