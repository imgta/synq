import { type NextConfig } from 'next';
import path from 'path';

const EXTERNALS = [
  'onnxruntime-node',
  'sharp',
];

export default {
  outputFileTracingIncludes: { '/api/**/*': ['./node_modules/**/*.wasm'] },
  serverExternalPackages: EXTERNALS,
  webpack(cfg) {
    cfg.resolve.alias = {
      ...(cfg.resolve.alias || {}),
      'onnxruntime-node': false,
      'sharp': false,
    };
    cfg.experiments = { ...(cfg.experiments || {}), asyncWebAssembly: true, layers: true };
    return cfg;
  },
  experimental: {
    reactCompiler: true, // enable `babel-plugin-react-compiler@rc`
  },
  // turbopack: {
  //   root: path.join(__dirname, '..'), // set root directory in monorepos
  // }
} satisfies NextConfig;