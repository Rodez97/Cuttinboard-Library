import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import { optimizeLodashImports } from "@optimize-lodash/rollup-plugin";
//import commonjs from "@rollup/plugin-commonjs";

const config = [
  {
    input: "src/index.ts",
    external: [
      "react",
      "react-dom",
      "lodash-es",
      "date-fns",
      "dayjs",
      "firebase",
      "firebase/firestore",
      "firebase/auth",
      "firebase/functions",
      "firebase/storage",
      "firebase/database",
      "react-firebase-hooks",
      "match-sorter",
      "dayjs-recur",
      "@cuttinboard-solutions/types-helpers",
      "nanoid",
      "rxfire",
      "rxfire/auth",
      "rxfire/firestore",
      "rxfire/database",
      "rxjs",
      "dayjs/plugin/utc.js",
      "dayjs/plugin/isoWeek.js",
      "dayjs/plugin/duration.js",
      "dayjs/plugin/advancedFormat.js",
      "dayjs/plugin/customParseFormat.js",
    ],
    output: {
      file: "dist/compiled/index.js",
      format: "es",
      sourcemap: true,
      globals: {
        react: "React",
        "react-dom": "ReactDOM",
        "lodash-es": "lodash-es",
        "date-fns": "dateFns",
        dayjs: "dayjs",
        firebase: "firebase",
        "react-firebase-hooks": "reactFirebaseHooks",
        "match-sorter": "matchSorter",
        "dayjs-recur": "dayjsRecur",
        "@cuttinboard-solutions/types-helpers": "typesHelpers",
        nanoid: "nanoid",
        rxfire: "rxfire",
        rxjs: "rxjs",
      },
    },
    plugins: [typescript() /**commonjs()**/, optimizeLodashImports()],
  },
  {
    input: "dist/index.d.ts",
    output: {
      file: "dist/compiled/index.d.ts",
      format: "es",
    },
    plugins: [dts()],
  },
];
export default config;
