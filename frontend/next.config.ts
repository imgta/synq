import { type NextConfig } from 'next';
import path from 'path';

export default {
  serverExternalPackages: ['@huggingface/transformers'],
  experimental: {
    reactCompiler: true, // enable `babel-plugin-react-compiler@rc`
  },
  turbopack: {
    root: path.join(__dirname, '..'), // set root directory in monorepos
  }
} satisfies NextConfig;