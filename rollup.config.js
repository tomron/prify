import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'content/content.js',
  output: {
    file: 'dist/content.js',
    format: 'iife', // Immediately Invoked Function Expression for browser
    sourcemap: true,
  },
  plugins: [resolve()],
};
