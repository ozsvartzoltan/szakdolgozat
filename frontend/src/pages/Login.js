import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { baseUrl } from "../global";
import ForgotPassword from "../components/ForgotPassword";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    localStorage.clear();
  }, []);

  function login(e) {
    e.preventDefault();
    setError("");
    const url = baseUrl + "login";

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email, password: password }),
    })
      .then((response) => {
        if (response.status === 400) {
          setError("Hibás formátum!");
        }
        if (response.status === 401) {
          setError("Hibás email vagy jelszó!");
          throw new Error("Invalid email or password.");
        } else if (!response.ok) {
          throw new Error(`Login failed with status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        localStorage.setItem("username", data.name);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("accessToken", data.accessToken);
        navigate(
          location?.state?.previousUrl ? location.state.previousUrl : "/home"
        );
      })
      .catch((error) => {
        console.error("Login error:", error);
      });
  }

  const toggleShow = (event) => {
    setShow(!show);
  };

  return (
    <div className="bg-gray-100 flex justify-center items-center h-screen">
      <div className="w-1/3 h-screen hidden lg:block">
        <img
          src="green.jpg"
          alt="Forest"
          className="object-cover w-full h-full"
        />
      </div>
      <div className="lg:p-36 md:p-52 sm:20 p-8 w-full lg:w-2/3">
        <h1 className="mb-20 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
          Online Egészség Napló
        </h1>
        <h1 className=" mb-4">Üdvözöljük!</h1>
        <form onSubmit={login} lang="hu">
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-600">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="valaki@email.com"
              required
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
              autoComplete="off"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-600">
              Jelszó
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
              autoComplete="off"
            />
          </div>
          {error && (
            <div className="mb-4 text-red-500 text-center">{error}</div>
          )}
          <div className="mb-6 hover:text-red-400  ">
            <ForgotPassword show={show} toggleShow={toggleShow} />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Bejelentkezés
          </button>
        </form>
        <div className="mt-6 text-center">
          <a
            href="/register"
            className="no-underline hover:underline text-black"
          >
            Regisztráció
          </a>
        </div>
      </div>
    </div>
  );
}
