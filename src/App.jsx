import './App.css'
import LandingPage from './LandingPage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CreatePage from './CreatePage';
import CollectionPage from './CollectionPage';
import PublicMintPage from './PublicMintPage';
import PublicUtilityMintPage from './PublicUtilityMintPage';
import ExistingContractPage from './ExistingContractPage';
import EntryPage from './EntryPage';
import DashboardPage from './DashboardPage';
import CreatorProfilePage from './CreatorProfilePage';
import { useState, useEffect } from 'react';

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "dark"
  );

  useEffect(() => {
    document.body.className = theme === "light" ? "light-theme" : "";
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  };
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage
          walletAddress={walletAddress}
          setWalletAddress={setWalletAddress}
          toggleTheme={toggleTheme}
          theme={theme} />} />

        <Route path="/start" element={<EntryPage
          walletAddress={walletAddress}
          setWalletAddress={setWalletAddress}
          toggleTheme={toggleTheme}
          theme={theme} />} />

        <Route path="/existing" element={<ExistingContractPage
          walletAddress={walletAddress}
          setWalletAddress={setWalletAddress}
          toggleTheme={toggleTheme}
          theme={theme} />} />

        <Route path="/create" element={<CreatePage
          walletAddress={walletAddress}
          setWalletAddress={setWalletAddress}
          toggleTheme={toggleTheme}
          theme={theme} />} />

        <Route path="/collection/:address" element={<CollectionPage
          walletAddress={walletAddress}
          setWalletAddress={setWalletAddress}
          toggleTheme={toggleTheme}
          theme={theme} />} />

        <Route path="/public/:address" element={<PublicMintPage
          walletAddress={walletAddress}
          setWalletAddress={setWalletAddress}
          toggleTheme={toggleTheme}
          theme={theme} />} />

        <Route path="/utility/:address" element={<PublicUtilityMintPage
          walletAddress={walletAddress}
          setWalletAddress={setWalletAddress}
          toggleTheme={toggleTheme}
          theme={theme} />} />

        <Route path="/dashboard" element={<DashboardPage
          walletAddress={walletAddress}
          setWalletAddress={setWalletAddress}
          toggleTheme={toggleTheme}
          theme={theme} />} />

        <Route path="/creator/:address" element={<CreatorProfilePage
          walletAddress={walletAddress}
          setWalletAddress={setWalletAddress}
          toggleTheme={toggleTheme}
          theme={theme} />} />
      </Routes>
    </BrowserRouter>
  );

}

export default App;