const path = require('path')

// With `next lint`: https://nextjs.org/docs/basic-features/eslint#lint-staged
const buildEslintCommand = (filenames) =>
  `yarn lint:fix --file ${filenames.map((f) => path.relative(process.cwd(), f)).join(' --file ')}`

module.exports = {
  '*.{js,jsx,ts,tsx}': [buildEslintCommand],
  '*.{ts,tsx}': "bash -c 'npm run typecheck'", // running this via bash https://github.com/okonet/lint-staged/issues/825#issuecomment-727185296
}
