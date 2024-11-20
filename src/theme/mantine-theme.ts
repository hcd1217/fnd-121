import { createTheme } from "@mantine/core";

export const theme = createTheme({
  headings: {
    fontWeight: "900",
    sizes: {
      h1: {
        fontSize: "2.6rem",
      },
    },
  },
  components: {},
  primaryColor: "primary",
  defaultRadius: "sm",
  colors: {
    // https://mantine.dev/colors-generator/?color=F06418
    primary: [
      "#fff0e4",
      "#ffe0cf",
      "#fac0a1",
      "#f69e6e",
      "#f28043",
      "#f06e27",
      "#f06418",
      "#d6530c",
      "#bf4906",
      "#a73c00",
    ],
  },
});
