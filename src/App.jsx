import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CardCreator from './pages/CardCreator';
import GameSession from './pages/GameSession';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CardCreator />} />
        <Route path="/play" element={<GameSession />} />
      </Routes>
    </Router>
  );
}

export default App;
