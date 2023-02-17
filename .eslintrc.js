module.exports = {
  root: true,
  extends: ["standard"],
  globals: {
    IS_DEVELOPMENT: "readonly",
  },
  parserOptions: {
    ecmasVersion: 2020,
  },
  rules: {
    avoidEscape: true,
    allowTemplateLiterals: true,
  },
};
