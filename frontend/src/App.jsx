import './App.css'

import Search from "./components/Pages/SearchWeb.jsx";
import ResultPage from "./components/Pages/ResultPage.jsx";
import Home from "./components/Pages/Home.jsx";
import SearchByTitle from './components/pages/SearchByTitle.jsx';
import { Routes, Route } from 'react-router-dom';

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/result" element={<ResultPage />}/>
            <Route path="/search-title" element={<SearchByTitle />} />
        </Routes>
  )
}

export default App
