import { baseUrl } from "../global";
import { useState } from "react";
import Modal from "react-bootstrap/Modal";
import { useNavigate } from "react-router-dom";

export default function DeleteUserButton() {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const toggleShow = () => {
    setShow(!show);
  };

  function handleDeleteUser() {
    const url = baseUrl + "user";
    fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("refreshToken")}`,
      },
    })
      .then((response) => {
        if (response.status === 401) {
          navigate("/login");
          return;
        } else if (response.status === 204) {
          navigate("/login");
          return;
        } else {
          navigate("/404");
          return;
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
  return (
    <>
      <Modal
        show={show}
        onHide={toggleShow}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title centered>Biztosan törli a felhasználóját?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            A fiók törlésével az összes adata véglegesen elveszik. Ezt a
            műveletet nem lehet visszavonni.
          </p>
          <div className="flex justify-around">
            <button
              onClick={toggleShow}
              className="bg-slate-400 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded"
            >
              Bezárás
            </button>
            <button
              onClick={handleDeleteUser}
              className={`bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded `}
            >
              Törlés
            </button>
          </div>
        </Modal.Body>
      </Modal>
      <div onClick={toggleShow} className="flex justify-center mt-4">
        <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Fiók törlése
        </button>
      </div>
    </>
  );
}
