import React from 'react';
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { textVariants, type TextVariant } from '@/theme';

/**
 * Themed text primitive — the ONLY way text should be rendered in the UI
 * library, so Space Grotesk and the locked type scale are applied consistently.
 *
 * Dynamic type is on by default (`allowFontScaling`); pass it `false` only for
 * fixed-geometry glyphs (e.g. a logo lockup), never for body content.
 */
export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  /** Overrides the variant's default color. Pass a token, never a raw hex. */
  color?: string;
  style?: RNTextProps['style'];
}

export function Text({ variant = 'body', color, style, ...rest }: TextProps) {
  const base = textVariants[variant] as TextStyle;
  return <RNText {...rest} style={[base, color ? { color } : null, style]} />;
}
