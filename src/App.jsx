import './App.css'
import LandingPage from './LandingPage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CreatePage from './CreatePage';
import CollectionPage from './CollectionPage';
import PublicMintPage from './PublicMintPage';

function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/collection/:address" element={<CollectionPage />} />
        <Route path="/public/:address" element={<PublicMintPage/>}/>
      </Routes>
    </BrowserRouter>
  );

}

export default App;