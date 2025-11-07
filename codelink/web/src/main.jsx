import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import Home from "./pages/Home.jsx";
import EditorPage from "./pages/EditorPage.jsx";
import ProjectPage from "./pages/ProjectPage.jsx";
import TeamsPage from "./pages/TeamsPage.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
			<Route path="/" element={<Home />} />
			<Route path="/teams" element={<TeamsPage />} />
			<Route path="/app" element={<EditorPage />} />
			<Route path="/project" element={<ProjectPage />}/>
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
