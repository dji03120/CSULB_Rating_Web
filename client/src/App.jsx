import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Home } from './components/home';

function App() {

  return (
    <div className="App">
      <Router>
        {/* <Navbar /> */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create-post" element={<></>} />
          <Route path="/saved-posts" element={<></>} />
          <Route path="/auth" element={<></>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App
