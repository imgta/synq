import { type NextConfig } from 'next';
import path from 'path';

export default {
  turbopack: {
    root: path.join(__dirname, '..'),
  }
} satisfies NextConfig;
