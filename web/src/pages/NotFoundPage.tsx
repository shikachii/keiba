import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div>
      <h1>ページが見つかりません</h1>
      <Link to="/">一覧に戻る</Link>
    </div>
  );
}
