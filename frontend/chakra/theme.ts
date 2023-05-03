import { extendTheme, ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

export const theme = extendTheme(
  { config },
  {
    breakpoints: {
      sm: '0px',
      md: '600px',
      lg: '800px',
      xl: '80em',
      '2xl': '96em',
    },
    colors: {
      brand: {
        100: '#3D84F7',
      },
    },
    styles: {
      global: () => ({
        body: {
          bg: 'whiteAlpha.200',
        },
      }),
    },
  }
);
