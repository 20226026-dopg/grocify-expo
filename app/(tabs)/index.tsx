import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface GroceryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  purchased: boolean;
  priority: "low" | "medium" | "high";
  updated_at: number;
}

const PRIORITY_WEIGHT: Record<string, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

function PriorityBadge({ priority }: { priority: "low" | "medium" | "high" }) {
  const bgClass: Record<string, string> = {
    low: "bg-priority-low",
    medium: "bg-priority-medium",
    high: "bg-priority-high",
  };
  const textClass: Record<string, string> = {
    low: "text-priority-low-foreground",
    medium: "text-priority-medium-foreground",
    high: "text-priority-high-foreground",
  };

  return (
    <View className={`rounded-full px-2.5 py-0.5 ${bgClass[priority]}`}>
      <Text
        className={`text-[11px] font-semibold uppercase tracking-wide ${textClass[priority]}`}
      >
        {priority}
      </Text>
    </View>
  );
}

function GroceryItemRow({ item }: { item: GroceryItem }) {
  const colorScheme = useColorScheme();
  const checkColor = item.purchased
    ? colorScheme === "dark"
      ? "#38DC74"
      : "#15934E"
    : colorScheme === "dark"
      ? "#A0BBA9"
      : "#4C8162";
  const metaColor = colorScheme === "dark" ? "#A0BBA9" : "#4C8162";

  return (
    <View
      className={`rounded-2xl border border-border bg-card p-4 ${
        item.purchased ? "opacity-60" : ""
      }`}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center">
          <Ionicons
            name={item.purchased ? "checkmark-circle" : "ellipse-outline"}
            size={22}
            color={checkColor}
          />
          <Text
            className={`ml-2.5 flex-1 text-base font-semibold text-card-foreground ${
              item.purchased ? "line-through" : ""
            }`}
            numberOfLines={1}
          >
            {item.name}
          </Text>
        </View>
        <PriorityBadge priority={item.priority} />
      </View>

      <View className="mt-2.5 flex-row items-center justify-between pl-8">
        <View className="flex-row items-center">
          <Ionicons name="pricetag-outline" size={14} color={metaColor} />
          <Text className="ml-1.5 text-xs text-muted-foreground">
            {item.category}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="layers-outline" size={14} color={metaColor} />
          <Text className="ml-1 text-xs text-muted-foreground">
            Qty: {item.quantity}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function Page() {
  const colorScheme = useColorScheme();
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const spinnerColor = colorScheme === "dark" ? "#38DC74" : "#15934E";
  const emptyIconColor = colorScheme === "dark" ? "#A0BBA9" : "#4C8162";

  const fetchItems = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const response = await fetch("/api/items");
      if (!response.ok) throw new Error("Failed to load grocery items");

      const data = await response.json();
      setItems(data.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [fetchItems]),
  );

  const onRefresh = useCallback(() => {
    fetchItems(true);
  }, [fetchItems]);

  const sortedItems = [...items].sort((a, b) => {
    if (a.purchased !== b.purchased) return a.purchased ? 1 : -1;
    const w =
      (PRIORITY_WEIGHT[b.priority] ?? 0) - (PRIORITY_WEIGHT[a.priority] ?? 0);
    if (w !== 0) return w;
    return b.updated_at - a.updated_at;
  });

  const remaining = items.filter((i) => !i.purchased).length;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="px-5 pb-3 pt-2">
        <Text className="text-2xl font-bold text-foreground">
          My Grocery List
        </Text>
        <Text className="mt-0.5 text-sm text-muted-foreground">
          {items.length === 0
            ? "No items yet"
            : `${remaining} of ${items.length} remaining`}
        </Text>
      </View>

      {loading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={spinnerColor} />
          <Text className="mt-3 text-sm text-muted-foreground">
            Loading your groceries...
          </Text>
        </View>
      )}

      {error && !loading && (
        <View className="flex-1 items-center justify-center px-8">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-destructive">
            <Ionicons name="alert-circle-outline" size={28} color="#D64545" />
          </View>
          <Text className="mt-4 text-center text-base font-semibold text-foreground">
            Oops, something went wrong
          </Text>
          <Text className="mt-1 text-center text-sm text-muted-foreground">
            {error}
          </Text>
        </View>
      )}

      {!loading && !error && items.length === 0 && (
        <View className="flex-1 items-center justify-center px-8">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <Ionicons name="cart-outline" size={32} color={emptyIconColor} />
          </View>
          <Text className="mt-4 text-center text-lg font-semibold text-foreground">
            Your list is empty
          </Text>
          <Text className="mt-1 text-center text-sm leading-5 text-muted-foreground">
            Add some items to get started with your grocery planning.
          </Text>
        </View>
      )}

      {!loading && !error && items.length > 0 && (
        <FlatList
          data={sortedItems}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-4 pb-4"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => <GroceryItemRow item={item} />}
          ItemSeparatorComponent={() => <View className="h-3" />}
        />
      )}
    </SafeAreaView>
  );
}
