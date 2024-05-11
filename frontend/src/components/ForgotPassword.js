import { useState } from "react";
import Modal from "react-bootstrap/Modal";
import { baseUrl } from "../global";
import Snackbar from "../components/Snackbar";

export default function ForgotPassword(props) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    color: "green",
  });

  const toggleShow = () => {
    props.toggleShow();
    setError("");
  };

  const showSnackbar = (message, color) => {
    setSnackbar({ open: true, message, color });
    setTimeout(() => {
      setSnackbar({ open: false, message: "", color: "green" });
    }, 3000);
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!email) {
      showSnackbar("Kérjük, adjon meg egy e-mail címet.", "red");
      setError("Kérjük, adjon meg egy e-mail címet.");
      return;
    }
    setError("");

    const url = baseUrl + "forgot-password";
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
      .then((response) => {
        if (!response.ok) {
          setEmail("");
          toggleShow();
          return;
        } else if (response.status === 204) {
          return;
        } else {
          return response.json();
        }
      })
      .then((data) => {
        toggleShow();
        showSnackbar("Jelszó sikeresen elküldve!", "green");
      })
      .catch((error) => {
        //setError("Hiba történt a kérés feldolgozása során.");
        setEmail("");
        toggleShow();
      });
  };

  return (
    <>
      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        color={snackbar.color}
      />
      {/* eslint-disable-next-line*/}
      <a
        onClick={toggleShow}
        className="no-underline text-black hover:underline"
      >
        Elfelejtetted a jelszavad?
      </a>

      <Modal
        show={props.show}
        onHide={toggleShow}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Új jelszó igénylése</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleForgotPassword}>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="email"
              >
                E-mail cím
              </label>
              <input
                type="email"
                id="email"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Email címed"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-xs italic">{error}</p>}
          </form>
        </Modal.Body>
        <Modal.Footer>
          <button
            onClick={toggleShow}
            className="bg-slate-400 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded"
          >
            Bezárás
          </button>
          <button
            type="submit"
            className={`bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded `}
            onClick={handleForgotPassword}
          >
            Új jelszó küldése
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
