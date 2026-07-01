import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import Reading from '@/pages/Reading';
import Result from '@/pages/Result';
import Tarot from '@/pages/Tarot';
import History from '@/pages/History';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reading" element={<Reading />} />
        <Route path="/result" element={<Result />} />
        <Route path="/tarot" element={<Tarot />} />
        <Route path="/history" element={<History />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}
