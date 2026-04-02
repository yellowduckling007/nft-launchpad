import './App.css'
import LandingPage from './LandingPage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CreatePage from './CreatePage';
import CollectionPage from './CollectionPage';
import PublicMintPage from './PublicMintPage';
import PublicUtilityMintPage from './PublicUtilityMintPage';
import ExistingContractPage from './ExistingContractPage';
import EntryPage from './EntryPage';
import { useState } from 'react';

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage
          walletAddress={walletAddress}
          setWalletAddress={setWalletAddress} />} />

          <Route path="/start" element={<EntryPage
          walletAddress={walletAddress}
          setWalletAddress={setWalletAddress} />} />

        <Route path="/existing" element={<ExistingContractPage
          walletAddress={walletAddress}
          setWalletAddress={setWalletAddress} />} />

        <Route path="/create" element={<CreatePage
          walletAddress={walletAddress}
          setWalletAddress={setWalletAddress} />} />

        <Route path="/collection/:address" element={<CollectionPage
          walletAddress={walletAddress}
          setWalletAddress={setWalletAddress} />} />
          
        <Route path="/public/:address" element={<PublicMintPage
          walletAddress={walletAddress}
          setWalletAddress={setWalletAddress} />} />

        <Route path="/utility/:address" element={<PublicUtilityMintPage
          walletAddress={walletAddress}
          setWalletAddress={setWalletAddress} />} />
      </Routes>
    </BrowserRouter>
  );

}

export default App;