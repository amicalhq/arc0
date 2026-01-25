import { SvgProps } from 'react-native-svg';

import ClaudeIcon from '@/assets/images/claude_icon.svg';
import CursorIconDark from '@/assets/images/cursor_icon_dark.svg';
import CursorIconLight from '@/assets/images/cursor_icon_light.svg';
import GeminiIcon from '@/assets/images/gemini_icon.svg';
import KiloCodeIconDark from '@/assets/images/kilo_code_icon_dark.svg';
import KiloCodeIconLight from '@/assets/images/kilo_code_icon_light.svg';
import OpenAIIconDark from '@/assets/images/openai_icon_dark.svg';
import OpenAIIconLight from '@/assets/images/openai_icon_light.svg';
import OpenCodeIcon from '@/assets/images/opencode.svg';

export type ProviderAsset = {
  Icon: React.FC<SvgProps>;
  IconDark?: React.FC<SvgProps>;
  color: string;
};

export const PROVIDER_ASSETS: Record<string, ProviderAsset> = {
  claude: {
    Icon: ClaudeIcon,
    color: '#E87443',
  },
  codex: {
    Icon: OpenAIIconLight,
    IconDark: OpenAIIconDark,
    color: '#6B7280',
  },
  gemini: {
    Icon: GeminiIcon,
    color: '#4285F4',
  },
  cursor: {
    Icon: CursorIconLight,
    IconDark: CursorIconDark,
    color: '#6B7280',
  },
  kilo: {
    Icon: KiloCodeIconLight,
    IconDark: KiloCodeIconDark,
    color: '#6B7280',
  },
  opencode: {
    Icon: OpenCodeIcon,
    color: '#6B7280',
  },
};

export function getProviderInfo(providerId: string): ProviderAsset | null {
  return PROVIDER_ASSETS[providerId] || null;
}
