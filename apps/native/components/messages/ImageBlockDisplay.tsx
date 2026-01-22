import { Text } from '@/components/ui/text';
import type { ImageBlock } from '@/lib/types/session';
import { Image, View } from 'react-native';

interface ImageBlockDisplayProps {
  block: ImageBlock;
}

export function ImageBlockDisplay({ block }: ImageBlockDisplayProps) {
  const uri = `data:${block.source.media_type};base64,${block.source.data}`;

  return (
    <View className="overflow-hidden rounded-sm border border-border bg-muted/30">
      <View className="border-b border-border bg-muted/50 px-3 py-1">
        <Text className="text-xs text-muted-foreground">{block.source.media_type}</Text>
      </View>
      <View className="p-2">
        <Image
          source={{ uri }}
          style={{ width: '100%', height: 200 }}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}
