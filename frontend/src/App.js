import "./index.css";
import Header from "./components/Header";
import User from "./pages/User";
import NotFound from "./components/NotFound";
import Home from "./pages/Home";
import Logging from "./pages/Logging";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import Logout from "./pages/Logout";
import Register from "./pages/Register";
import Upgrade from "./pages/Upgrade";
import Statistics from "./pages/Statistics";
import PDF from "./pages/StatisticsGenerator";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { createContext, useEffect, useState } from "react";
import { baseUrl } from "./global";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

export const LogInContext = createContext();

export default function App() {
  const [stripeLoaded, setStripeLoaded] = useState(null);
  useEffect(() => {
    loadStripe(
      "pk_test_51P87j2BlXo2jssADrtiF7AJuLbir5mYIP5juU51szboKnu1Q66wAbmi8r1M1fe9Mm5o9olhzeTcHkW3ZONL9Dg5z00Pi3qsMWQ"
    )
      .then((stripe) => {
        setStripeLoaded(stripe);
      })
      .catch((error) => {
        console.error("Stripe loading error:", error);
        setStripeLoaded(false);
      });
  }, []);
  //8.23.59

  useEffect(() => {
    function refreshTokens() {
      if (localStorage.refreshToken) {
        const url = baseUrl + "refresh_token";
        fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refreshToken: localStorage.refreshToken,
          }),
        })
          .then((response) => {
            if (!response.ok) {
              window.location.href = "/404";
              return;
            }
            return response.json();
          })
          .then((data) => {
            if (!data || !data.refreshToken) {
              window.location.href = "/404";
            }
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.refreshToken = data.refreshToken;
          });
      }
    }
    const minute = 1000 * 60;
    refreshTokens();
    setInterval(refreshTokens, minute * 3);
  });
  return (
    <LogInContext.Provider value={{ stripeLoaded }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/register" element={<Register />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/" element={<Login />} />

          <Route element={<LayoutWithHeaderFooter />}>
            <Route path="/user" element={<User />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/home" element={<Home />} />
            <Route path="/logging/:year/:month/:day" element={<Logging />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/pdf" element={<PDF />} />
            <Route
              path="/upgrade"
              element={
                <Elements stripe={stripeLoaded}>
                  <Upgrade />
                </Elements>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </LogInContext.Provider>
  );
}

function LayoutWithHeaderFooter() {
  return (
    <>
      <Header>
        <Outlet />
      </Header>
    </>
  );
}
