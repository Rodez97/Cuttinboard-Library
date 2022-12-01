export const Colors = {
  // paper & background
  paper: "#ffffff",
  Primary: {
    primaryLight: "#e3f2fd",
    primaryMain: "#2196f3",
    primaryDark: "#1e88e5",
    primary200: "#90caf9",
    primary800: "#1565c0",
  },
  Secondary: {
    secondaryLight: "#ede7f6",
    secondaryMain: "#673ab7",
    secondaryDark: "#5e35b1",
    secondary200: "#b39ddb",
    secondary800: "#4527a0",
  },
  Success: {
    successLight: "#b9f6ca",
    success200: "#69f0ae",
    successMain: "#00e676",
    successDark: "#00c853",
  },
  Error: {
    errorLight: "#ef9a9a",
    errorMain: "#f44336",
    errorDark: "#c62828",
  },
  Orange: {
    orangeLight: "#fbe9e7",
    orangeMain: "#ffab91",
    orangeDark: "#d84315",
  },
  Warning: {
    warningLight: "#fff8e1",
    warningMain: "#ffe57f",
    warningDark: "#ffc107",
  },
  Grey: {
    grey50: "#fafafa",
    grey100: "#f5f5f5",
    grey200: "#eeeeee",
    grey300: "#e0e0e0",
    grey500: "#9e9e9e",
    grey600: "#757575",
    grey700: "#616161",
    grey900: "#212121",
  },
  MainDark: "#121432",
  MainBlue: "#2B7DE9",
  SecundaryOnDark: "#C1BEBE",
  MainOnDark: "#FFFFFF",
  MainOnWhite: "#F7F7F7",
  MainBlack: "#000000",
  SecundaryBlack: "#61657E",
  Green: {
    Main: "#68AEA0",
    Light: "#E3F5F0",
  },
  Blue: {
    Main: "#94BDEA",
    Light: "#F3F8FF",
  },
  Yellow: {
    Main: "#EBD964",
    Light: "#FDFCED",
  },
  Notes: "#FFFB99",
  SecundaryOnWhite: "#C1BEBE",
  CalculateContrast: (hex: string) => {
    const threshold = 130;

    const colorBrightness =
      (hexToRed(hex) * 299 + hexToGreen(hex) * 587 + hexToBlue(hex) * 114) /
      1000;

    function cleanHex(h: string) {
      return h.charAt(0) == "#" ? h.substring(1, 7) : h;
    }
    function hexToRed(h: string) {
      return parseInt(cleanHex(h).substring(0, 2), 16);
    }
    function hexToGreen(h: string) {
      return parseInt(cleanHex(h).substring(2, 4), 16);
    }
    function hexToBlue(h: string) {
      return parseInt(cleanHex(h).substring(4, 6), 16);
    }

    return colorBrightness > threshold ? "#000000" : "#ffffff";
  },
};
