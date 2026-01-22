import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { WelcomeEmpty } from '@/components/WelcomeEmpty';
import { useWorkstations } from '@/lib/store/hooks';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { MenuIcon, MessageSquareIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

export default function HomeScreen() {
  const navigation = useNavigation();
  const workstations = useWorkstations();
  const hasNoWorkstations = workstations.length === 0;

  // Show setup instructions when no workstations configured
  if (hasNoWorkstations) {
    return (
      <View className="bg-background flex-1">
        <WelcomeEmpty />
      </View>
    );
  }

  return (
    <View className="bg-background flex-1">
      <View className="flex-1 items-center justify-center gap-6 p-6">
        <View className="bg-muted rounded-full p-6">
          <Icon as={MessageSquareIcon} className="text-muted-foreground size-12" />
        </View>

        <View className="gap-2">
          <Text className="text-center text-xl font-semibold">Welcome to Arc0</Text>
          <Text className="text-muted-foreground text-center">
            Select a session from the sidebar to get started
          </Text>
        </View>

        <Pressable
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          className="bg-primary flex-row items-center gap-2 rounded-lg px-6 py-3 active:opacity-80">
          <Icon as={MenuIcon} className="text-primary-foreground size-5" />
          <Text className="text-primary-foreground font-medium">View Sessions</Text>
        </Pressable>
      </View>
    </View>
  );
}
