import React from "react";
import ReactDOM from "react-dom";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import App from "./App.jsx";
import Home from "./Home.jsx";
import { Auth0Provider } from "@auth0/auth0-react";
import Auth from "./Auth.jsx";
import RootLayout from "./components/RootLayout.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
  <Auth0Provider
    domain={import.meta.env.VITE_AUTH0_DOMAIN}
    clientId={import.meta.env.VITE_CLIENT_ID}
    authorizationParams={{
      redirect_uri: window.location.origin,
    }}
  >
    <Auth />
    <Router>
      <RootLayout>
        <Routes>
          <Route path="/" exact element={<Home />} />
          {/* <Route
          path="/doc"
          exact
          element={<Navigate to={`/document/${uuidv4()}`} />}
        /> */}
          <Route path="/document/:id" element={<App />} />
        </Routes>
      </RootLayout>
    </Router>
  </Auth0Provider>
  // </React.StrictMode>
);
