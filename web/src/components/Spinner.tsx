export function Spinner() {
  return <div className="spinner">読み込み中...</div>;
}

export function ErrorBox({ message }: { message: string }) {
  return <div className="error-box">エラー: {message}</div>;
}
