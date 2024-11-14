import "./App.css";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Home } from "./components/home";
import Navbar from "./components/navbar";
import { Login } from './pages/Login';
import { Register } from './pages/Register';

function App() {
	return (
		<div>
			<Router className="header">
				<div className="content">
					<Navbar />
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/create-post" element={<></>} />
						<Route path="/saved-posts" element={<></>} />
						<Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
					</Routes>
				</div>
			</Router>
		</div>
	);
}

export default App;
