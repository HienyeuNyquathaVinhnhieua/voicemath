import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 1. Load toàn bộ biến môi trường (trong đó có API_KEY từ Vercel)
  // process.cwd() lấy thư mục hiện tại
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // 2. Định nghĩa lại 'process.env.API_KEY' để trình duyệt có thể hiểu được
      // Vite sẽ thay thế cụm từ này bằng giá trị thực tế của key khi build
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});
