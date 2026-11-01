import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "#09090b",
        foreground: "#fafafa",
        line: "#27272a",
        surface: "#111113",
        muted: "#a1a1aa",
      },
    },
  },
  plugins: [],
};
export default config;
