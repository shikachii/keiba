import { useLocation, useNavigate } from 'react-router-dom';

// 一覧ページのステータス絞り込みはクエリパラメータ(?status=...)に保持されるため、
// 単純に "/" へリンクすると絞り込みが失われる。アプリ内遷移で来た場合は履歴を1つ戻ることで
// 絞り込み状態ごと一覧に復帰し、直リンクなど履歴がない場合のみ無条件の"/"にフォールバックする。
export function BackLink({ label }: { label: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const hasHistory = location.key !== 'default';

  return (
    <button
      type="button"
      className="header-link back-link"
      onClick={() => (hasHistory ? navigate(-1) : navigate('/'))}
    >
      {label}
    </button>
  );
}
