import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import WeaponSkinsPage from "./pages/WeaponSkinsPage";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        <header className="bg-gray-800 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <a
              href="/"
              className="text-3xl font-bold hover:text-blue-400 transition-colors"
            >
              GW2 Collection Tracker
            </a>
          </div>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/weapon-skins" element={<WeaponSkinsPage />} />
          </Routes>
        </main>

        <footer className="bg-gray-800 mt-20 py-8">
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-400">
            <p>Built with ❤️ for the Guild Wars 2 community</p>
            <p className="text-sm mt-2">
              Not affiliated with ArenaNet or NCSOFT
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
