import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // 3번째 인자 ''는 모든 접두사의 환경변수를 로드하겠다는 의미
  const env = loadEnv(mode, process.cwd(), '');
  
  // Vercel 등 배포 환경에서는 process.env에 직접 들어있을 수 있으므로 둘 다 확인
  const geminiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  return {
    base: '/',
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      // process.env.GEMINI_API_KEY를 코드 내에서 사용할 수 있도록 값 주입
      'process.env.GEMINI_API_KEY': JSON.stringify(geminiKey)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
