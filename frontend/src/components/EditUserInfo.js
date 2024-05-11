import { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";

export default function EditUserInfo(props) {
  const [show, setShow] = useState(false);
  const [originalDataName, setOriginalDataName] = useState(props.dataName);
  const [originalDataValue, setOriginalDataValue] = useState(props.dataValue);
  const [dataName, setDataName] = useState(originalDataName);
  const [dataValue, setDataValue] = useState(originalDataValue);

  useEffect(() => {
    setOriginalDataName(props.dataName);
    setOriginalDataValue(props.dataValue);
    setDataName(props.dataName);
    setDataValue(props.dataValue);
  }, [props.dataName, props.dataValue]);

  const handleClose = () => setShow(false);
  const handleShow = () => {
    setDataName(originalDataName);
    setDataValue(originalDataValue);
    setShow(true);
  };
  function handleDeleteUserInfo() {
    props.handleDeleteUserInfo(props.id);
    handleClose();
  }

  return (
    <>
      <button
        onClick={handleShow}
        className="px-4 py-1 text-sm text-purple-600 font-semibold rounded-full border border-purple-200 hover:text-white hover:bg-purple-600 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"
      >
        Szerkesztés
      </button>

      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Body>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              props.updateUserInfo(props.id, dataName, dataValue);
            }}
            id="updateUserInfo"
            className="w-full max-w-sm"
          >
            <div className="md:flex md:items-center mb-6">
              <div className="md:w-2/3">
                <label
                  className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
                  for={props.dataName}
                >
                  Új Megnevezés
                </label>
              </div>
              <div className="md:w-2/3">
                <input
                  className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-2 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                  id={props.dataName}
                  type="text"
                  value={dataName}
                  onChange={(e) => setDataName(e.target.value)}
                />
              </div>
            </div>
            <div className="md:flex md:items-center mb-6">
              <div className="md:w-2/3">
                <label
                  className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
                  for={props.dataValue}
                >
                  Új Leírás
                </label>
              </div>
              <div className="md:w-2/3">
                <textarea
                  id={props.dataValue}
                  className="block p-2.5 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-2 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                  placeholder="Novorapid, Treshiba, duactan 40/5"
                  rows="4"
                  onChange={(e) => setDataValue(e.target.value)}
                  value={dataValue}
                ></textarea>
              </div>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <button
            onClick={handleClose}
            className="bg-slate-400 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded"
          >
            Bezárás
          </button>
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
            form="updateUserInfo"
            onClick={handleClose}
          >
            Frissítés
          </button>
          <button
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleDeleteUserInfo}
          >
            Törlés
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
