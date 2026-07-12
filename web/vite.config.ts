import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { apiMiddleware } from './server/apiHandlers.ts';

const GH_PAGES_REPO = 'keiba';

// races/ ビューア用。`npm run dev` はローカル閲覧用（Vite middlewareがraces/を都度読む）。
// `npm run build:pages` はGitHub Pagesデプロイ用（事前にbuild-data.mjsで静的JSONを生成し、
// public/api/配下の静的ファイルをそのまま配信する。base はGitHub Pagesのプロジェクトページ
// URL (https://<user>.github.io/<repo>/) に合わせてリポジトリ名を含める）。
// `vite preview`でも本番同様のbaseを確認できるよう、command種別ではなく明示的な
// GH_PAGES環境変数（build:pages/deployスクリプトでのみ設定）で切り替える。
export default defineConfig(() => ({
  base: process.env.GH_PAGES === 'true' ? `/${GH_PAGES_REPO}/` : '/',
  plugins: [
    react(),
    {
      name: 'races-api',
      configureServer(server) {
        server.middlewares.use(apiMiddleware);
      },
    },
  ],
  server: {
    port: 5173,
  },
}));
