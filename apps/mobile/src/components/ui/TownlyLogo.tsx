import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import { palette } from '@/theme';

/**
 * Townly Sprout app mark — the rounded-square icon with the white "T + leaf".
 * Geometry is the exact data from assets/brand/townly-icon.svg (96×96 viewBox);
 * it is never redrawn. Use for compact in-app branding. For the horizontal
 * lockup with the word "Townly", use <TownlyWordmark/>.
 */

export type LogoTone = 'light' | 'dark';

export interface TownlyLogoProps {
  /** Rendered square size in px. Default 28. */
  size?: number;
  /** Box fill: 'light' = Slate (#3C4D59), 'dark' = Slate shade (#232E36). */
  tone?: LogoTone;
  accessibilityLabel?: string;
}

export function TownlyLogo({ size = 28, tone = 'light', accessibilityLabel = 'Townly' }: TownlyLogoProps) {
  const box = tone === 'dark' ? palette.slateShade : palette.slate;
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel || undefined}
    >
      <Path
        d="M22,0 H74 A22,22 0 0 1 96,22 V74 A22,22 0 0 1 74,96 H22 A22,22 0 0 1 0,74 V22 A22,22 0 0 1 22,0 Z"
        fill={box}
      />
      <Rect x={26} y={28} width={44} height={11} rx={3} fill={palette.white} />
      <Rect x={42.5} y={28} width={11} height={48} rx={3} fill={palette.white} />
      <Path d="M53,54 C61,53 69,46 71,37 C62,39 55,45 53,54 Z" fill={palette.white} />
    </Svg>
  );
}
