
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Define environment variable types for TypeScript
  define: {
    // Make sure environment variables are properly exposed
    'import.meta.env.VITE_AWS_REGION': JSON.stringify(process.env.VITE_AWS_REGION),
    'import.meta.env.VITE_AWS_ACCESS_KEY_ID': JSON.stringify(process.env.VITE_AWS_ACCESS_KEY_ID),
    'import.meta.env.VITE_AWS_SECRET_ACCESS_KEY': JSON.stringify(process.env.VITE_AWS_SECRET_ACCESS_KEY),
    'import.meta.env.VITE_S3_BUCKET_NAME': JSON.stringify(process.env.VITE_S3_BUCKET_NAME),
    'import.meta.env.VITE_SES_FROM_EMAIL': JSON.stringify(process.env.VITE_SES_FROM_EMAIL),
  },
}));
