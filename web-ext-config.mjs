export default {
  ignoreFiles: [
    'node_modules',
    'dist',
    'docs',
    '.github',
    '*.md',
    'package.json',
    'package-lock.json',
    'web-ext-config.mjs',
    '.prettierrc.json',
    '.prettierignore',
    '.stylelintrc.json'
  ],
  build: {
    overwriteDest: true,
    filename: '{name}-{version}.zip'
  },
  artifactsDir: 'dist',
  run: {
    startUrl: ['https://codeforces.com/problemset']
  }
};
