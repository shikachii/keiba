const status = document.getElementById('status');
const SERVER = 'http://localhost:3500/save';

function setStatus(msg, isError = false) {
  status.textContent = msg;
  status.className = isError ? 'err' : 'ok';
}

async function run(file) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url?.includes('race.netkeiba.com')) {
    setStatus('race.netkeiba.com で実行してください', true);
    return;
  }

  setStatus('取得中...');
  let result;
  try {
    [result] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: [file] });
  } catch (e) {
    setStatus('スクリプトエラー: ' + e.message, true);
    return;
  }

  // スクリプトが JSON 文字列を返した場合はパース（キー順序保持のため）
  const raw = result?.result ?? {};
  const { path, data } = typeof raw === 'string' ? JSON.parse(raw) : raw;
  if (!path || !data) {
    setStatus('データ取得失敗', true);
    return;
  }

  try {
    const res = await fetch(SERVER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, data }),
    });
    const json = await res.json();
    if (json.ok) {
      setStatus('✓ 保存: races/' + path);
    } else {
      setStatus('サーバーエラー: ' + json.error, true);
    }
  } catch {
    setStatus('サーバーに接続できません\npython3 tools/server.py を起動してください', true);
  }
}

document.getElementById('btn-shutuba').addEventListener('click',   () => run('scripts/shutuba.js'));
document.getElementById('btn-newspaper').addEventListener('click', () => run('scripts/newspaper.js'));
document.getElementById('btn-result').addEventListener('click',    () => run('scripts/result.js'));
