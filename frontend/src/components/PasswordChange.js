import { useState } from "react";
import Modal from "react-bootstrap/Modal";
import { baseUrl } from "../global";
import Snackbar from "../components/Snackbar";
import { useNavigate } from "react-router-dom";

export default function PasswordChange() {
  const [show, setShow] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [oldPasswordAgain, setOldPasswordAgain] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    color: "green",
  });

  const toggleShow = () => {
    setShow(!show);
  };

  const showSnackbar = (message, color) => {
    setSnackbar({ open: true, message, color });
    setTimeout(() => {
      setSnackbar({ open: false, message: "", color: "green" });
    }, 3000);
  };

  const changePassword = (e) => {
    let isCompleted = true;
    e.preventDefault();
    if (!oldPassword || !oldPasswordAgain || !newPassword) {
      setError("Kérjük minden mezőt töltsön ki!", "red");
      return;
    }
    if (!oldPassword) {
      setError("Kérjük adja meg a régi jelszavát!", "red");
      //setError({ oldPassword: "Kérjük adja meg a régi jelszavát!" });
      isCompleted = false;
    }
    if (!oldPasswordAgain) {
      setError("Kérjük adja meg a régi jelszavát mégegyszer!", "red");
      //setError({oldPasswordAgain: "Kérjük adja meg a régi jelszavát mégegyszer!",});
      isCompleted = false;
    }
    if (!newPassword) {
      setError("Kérjük adja meg az új jelszavát!", "red");
      //setError({oldPasswordAgain: "Kérjük adja meg az új jelszavát!",});
      isCompleted = false;
    }

    if (oldPassword !== oldPasswordAgain) {
      setError("A két régi jelszó nem egyezik!", "red");
      //setError({ oldPasswordAgain: "A két régi jelszó nem egyezik!" });
      isCompleted = false;
    }
    if (isCompleted) {
      const url = baseUrl + "change-password";
      fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("refreshToken")}`,
        },
        body: JSON.stringify({
          oldPassword,
          oldPasswordAgain,
          newPassword,
        }),
      })
        .then((response) => {
          if (response.status === 404) {
            localStorage.clear();
            navigate("/login");
            return;
          } else if (response.status === 410) {
            setError("A régi jelszavak nem egyeznek!");
            return;
          } else if (response.status === 411) {
            setError("Helytelen régi jelszó!");
            return;
          } else if (response.status === 201) {
            localStorage.clear();
            navigate("/login");
            return response.json();
          } else {
            localStorage.clear();
            navigate("/login");
            showSnackbar("Jelszó sikeresen megváltoztatva!", "green");
            toggleShow();
            return;
          }
        })
        .catch((error) => {
          setOldPassword("");
          setOldPasswordAgain("");
          setNewPassword("");
          toggleShow();
        });
    }
  };

  return (
    <>
      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        color={snackbar.color}
      />
      <div className="flex justify-center mt-4">
        <button
          onClick={toggleShow}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Jelszó változtatás
        </button>
      </div>
      <Modal
        show={show}
        onHide={toggleShow}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Jelszó változtatás</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={changePassword} id="changePassword">
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="oldPassword"
              >
                Régi jelszó
              </label>
              <input
                type="password"
                id="oldPassword"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Jelszavad"
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="oldPasswordAgain"
              >
                Régi jelszó mégegyszer
              </label>
              <input
                type="password"
                id="oldPasswordAgain"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Jelszavad mégegyszer"
                onChange={(e) => setOldPasswordAgain(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="newPassword"
              >
                Új jelszó
              </label>
              <input
                type="password"
                id="newPassword"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Új jelszó"
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-xs italic">{error}</p>}
          </form>
        </Modal.Body>
        <Modal.Footer>
          <button onClick={toggleShow}>Bezárás</button>
          <button
            type="submit"
            form="changePassword"
            className={`bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded `}
          >
            Új jelszó küldése
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
