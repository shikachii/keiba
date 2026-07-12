import type { Training } from '../api/types.ts';

export function TrainingBlock({
  training,
  comment,
  evaluation,
}: {
  training: Training | null | undefined;
  comment: string | undefined;
  evaluation: string | undefined;
}) {
  return (
    <div className="training-block">
      {training ? (
        <dl className="training-dl">
          {training.日コース && (
            <>
              <dt>調教コース</dt>
              <dd>{training.日コース}</dd>
            </>
          )}
          {training.タイム && (
            <>
              <dt>タイム</dt>
              <dd>{training.タイム}</dd>
            </>
          )}
          {training.脚色 && (
            <>
              <dt>脚色</dt>
              <dd>{training.脚色}</dd>
            </>
          )}
          {training.評価 && (
            <>
              <dt>評価</dt>
              <dd>{training.評価}</dd>
            </>
          )}
        </dl>
      ) : (
        <p className="empty-note">調教データなし</p>
      )}
      {(comment || evaluation) && (
        <p className="stable-comment">
          {evaluation && <strong>厩舎評価: {evaluation}　</strong>}
          {comment}
        </p>
      )}
    </div>
  );
}
