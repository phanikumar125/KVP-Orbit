import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17201d",
        moss: "#496a5b",
        sage: "#dce7df",
        cream: "#f6f7f2",
        coral: "#e47b5f",
      },
      boxShadow: {
        soft: "0 22px 60px rgba(41, 63, 52, .10)",
        card: "0 10px 32px rgba(41, 63, 52, .07)",
      },
      keyframes: {
        float: { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
        shimmer: { "0%": { backgroundPosition: "200% 0" }, "100%": { backgroundPosition: "-200% 0" } },
      },
      animation: { float: "float 6s ease-in-out infinite", shimmer: "shimmer 3s linear infinite" },
    },
  },
  plugins: [],
};

export default config;

