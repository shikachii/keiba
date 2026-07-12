import { HashRouter, Route, Routes } from 'react-router-dom';
import { RaceListPage } from './pages/RaceListPage.tsx';
import { RaceDetailPage } from './pages/RaceDetailPage.tsx';
import { RulesLogPage } from './pages/RulesLogPage.tsx';
import { NotFoundPage } from './pages/NotFoundPage.tsx';

export function App() {
  return (
    <HashRouter>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<RaceListPage />} />
          <Route path="/races/:date/:dir" element={<RaceDetailPage />} />
          <Route path="/rules-log" element={<RulesLogPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </HashRouter>
  );
}
