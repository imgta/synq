import { type NextConfig } from 'next';
import path from 'path';

const EXTERNALS = [
  '@huggingface/transformers',
  'onnxruntime-node',
  'sharp',
];

export default {
  outputFileTracingIncludes: { '/api/**/*': ['./node_modules/**/*.wasm'] },
  // serverExternalPackages: EXTERNALS,
  webpack: cfg => {
    cfg.resolve.alias = {
      ...cfg.resolve.alias,
      "sharp$": false,
      "onnxruntime-node$": false,
    };
    return cfg;
  },
  experimental: {
    reactCompiler: true, // enable `babel-plugin-react-compiler@rc`
  },
  turbopack: {
    root: path.join(__dirname, '..'), // set root directory in monorepos
  }
} satisfies NextConfig;