import { type NextConfig } from 'next';
import path from 'path';

const EXTERNALS = [
  'sharp',
  'onnxruntime-node',
];

export default {
  outputFileTracingIncludes: { '/api/**/*': ['./node_modules/**/*.wasm'] },
  serverExternalPackages: EXTERNALS,
  // webpack(cfg) {
  //   cfg.experiments = { asyncWebAssembly: true, layers: true };
  //   cfg.externals ||= [];
  //   cfg.externals.push({ zipfile: 'commonjs zipfile' });
  //   return cfg;
  // },
  experimental: {
    reactCompiler: true, // enable `babel-plugin-react-compiler@rc`
  },
  turbopack: {
    root: path.join(__dirname, '..'), // set root directory in monorepos
  }
} satisfies NextConfig;