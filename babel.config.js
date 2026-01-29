module.exports = {
  plugins: ["macros"],
  presets: [
    [
      "next/babel",
      {
        "preset-env": {
          useBuiltIns: "entry",
          corejs: 3
        }
      }
    ]
  ]
};
