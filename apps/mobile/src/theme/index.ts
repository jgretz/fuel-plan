import {useColorScheme, StyleSheet} from 'react-native';
import {useMemo} from 'react';

import {type ColorPalette, lightColors, darkColors} from './colors';

export type {ColorPalette} from './colors';

export function useColors(): ColorPalette {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkColors : lightColors;
}

type StyleFactory<T extends StyleSheet.NamedStyles<T>> = (colors: ColorPalette) => T;

const cache = new Map<StyleFactory<any>, Map<ColorPalette, any>>();

export function createThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: StyleFactory<T>,
): () => T {
  return function useThemedStyles(): T {
    const colors = useColors();
    return useMemo(() => {
      let paletteCache = cache.get(factory);
      if (!paletteCache) {
        paletteCache = new Map();
        cache.set(factory, paletteCache);
      }
      let styles = paletteCache.get(colors);
      if (!styles) {
        styles = StyleSheet.create(factory(colors));
        paletteCache.set(colors, styles);
      }
      return styles;
    }, [colors]);
  };
}
