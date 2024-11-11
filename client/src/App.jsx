import "./App.css";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Home } from "./components/home";
import Navbar from "./components/navbar";

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
						<Route path="/auth" element={<></>} />
					</Routes>
				</div>
			</Router>
		</div>
	);
}

export default App;
