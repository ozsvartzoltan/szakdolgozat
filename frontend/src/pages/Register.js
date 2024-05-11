import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "../global";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [isMale, setIsMale] = useState(true); // Assuming 'true' means male
  const [height, setHeight] = useState("");
  const [isMetric, setIsMetric] = useState(true);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.clear();
  }, []);

  const validateForm = () => {
    let tempErrors = {};
    let formIsValid = true;

    if (!name) {
      formIsValid = false;
      tempErrors["name"] = "A név mező nem lehet üres!";
    }

    if (!email) {
      formIsValid = false;
      tempErrors["email"] = "Az email mező nem lehet üres!";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      formIsValid = false;
      tempErrors["email"] = "Az email nem megfelelő formátumú!";
    }

    if (!password || password.length < 6) {
      formIsValid = false;
      tempErrors["password"] =
        "A jelszó legalább 6 karakter hosszúságúnak kell lennie!";
    }

    if (password !== confirmedPassword) {
      formIsValid = false;
      tempErrors["confirmPassword"] = "A jelszavak nem egyeznek";
    }

    setErrors(tempErrors);
    return formIsValid;
  };

  function onHandleCreateUser(e) {
    e.preventDefault();
    if (validateForm()) {
      const url = baseUrl + "user";
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          email: email,
          password: password,
          confirmedpassword: confirmedPassword,
          dateOfBirth: dateOfBirth,
          isMale: isMale,
          height: height,
          isMetric: isMetric,
        }),
      })
        .then((response) => {
          if (response.status === 400) {
            console.log("Bad request.");
            return;
          } else if (response.status === 409) {
            console.log("User already exists.");
            return;
          } else if (!response.ok) {
            console.log("Registration failed with status: ", response.status);
            return;
          }
          console.log("Registration successful.");
          return response.json();
        })
        .then((data) => {
          localStorage.setItem("username", data.name);
          localStorage.setItem("refreshToken", data.refreshToken);
          localStorage.setItem("accessToken", data.accessToken);
          navigate("/home");
        })
        .catch((error) => {
          console.error("Registration error:", error);
        });
    } else {
      console.log("Form has errors.");
    }
  }

  return (
    <div
      className="min-h-screen bg-no-repeat bg-cover bg-center flex items-center justify-center p-10"
      style={{ backgroundImage: "url('/background.jpg')" }}
    >
      <div className="w-full max-w-lg mx-auto bg-gray-100 rounded-lg px-8 py-10">
        <h2 className="text-center font-bold">Regisztráció</h2>
        <h5 className="text-center text-gray-600">Online Egészségügyi Napló</h5>
        <form onSubmit={onHandleCreateUser} className="mt-6">
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700">
              Név:
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 ${
                errors.name
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="Add meg a neved"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700">
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 ${
                errors.email
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="valaki@gmail.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700">
              Jelszó:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 ${
                errors.password
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block text-gray-700">
              Jelszó még egyszer:
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmedPassword}
              onChange={(e) => setConfirmedPassword(e.target.value)}
              className={`w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 ${
                errors.confirmPassword
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="dateOfBirth" className="block text-gray-700">
              Születési dátum:
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="gender" className="block text-gray-700">
              Nem:
            </label>
            <select
              id="gender"
              name="gender"
              value={isMale ? "F" : "N"}
              onChange={(e) => setIsMale(e.target.value === "F")}
              className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="F">Férfi</option>
              <option value="N">Nő</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="height" className="block text-gray-700">
              Magasság:
            </label>
            <input
              type="number"
              id="height"
              name="height"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add meg a magasságod"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="unitOfMeasurement" className="block text-gray-700">
              Mértékegységek:
            </label>
            <select
              id="unitOfMeasurement"
              name="unitOfMeasurement"
              value={isMetric ? "EU" : "US"}
              onChange={(e) => setIsMetric(e.target.value === "EU")}
              className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="EU">EU</option>
              <option value="US">US</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Regisztráció
          </button>
        </form>
        <div className="mt-4 text-center">
          <span className="text-sm text-gray-500 dark:text-gray-300">
            Már lézetik felhasználója?
          </span>
          <a
            href="/login"
            className=" pl-2 no-underline hover:underline text-black"
          >
            Belépés
          </a>
        </div>
      </div>
    </div>
  );
}
