import { useState } from "react";
import Modal from "react-bootstrap/Modal";

export default function AddUserInfo(props) {
  const [dataName, setDataName] = useState("");
  const [dataValue, setDataValue] = useState("");

  return (
    <>
      <button
        onClick={props.toggleShow}
        className="block mx-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-2 rounded"
      >
        + Felhasználó adat hozzáadás
      </button>

      <Modal
        show={props.show}
        onHide={props.toggleShow}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Új felhasználó adat</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              props.AddNewUserInfo(dataName, dataValue);
              setDataName("");
              setDataValue("");
            }}
            id="newUserInfo"
            className="w-full max-w-sm"
          >
            <div className="md:flex md:items-center mb-6">
              <div className="md:w-1/3">
                <label
                  className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
                  for="dataName"
                >
                  Megnevezés
                </label>
              </div>
              <div className="md:w-2/3">
                <input
                  className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-2 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                  id="dataName"
                  type="text"
                  placeholder="Pills taken"
                  onChange={(e) => setDataName(e.target.value)}
                />
              </div>
            </div>
            <div className="md:flex md:items-center mb-6">
              <div className="md:w-1/3">
                <label
                  className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
                  for="dataValue"
                >
                  Leírás
                </label>
              </div>
              <div className="md:w-2/3">
                <textarea
                  id="message"
                  className="block p-2.5 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-2 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                  placeholder="Novorapid, Treshiba, duactan 40/5"
                  rows="4"
                  onChange={(e) => setDataValue(e.target.value)}
                ></textarea>
              </div>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <button
            onClick={props.toggleShow}
            className="bg-slate-400 hover:bg-slate-700 text-white font-bold py-2 px-2 rounded"
          >
            Bezárás
          </button>

          <button
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-2 rounded"
            form="newUserInfo"
            onClick={props.toggleShow}
          >
            Hozzáadás
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
