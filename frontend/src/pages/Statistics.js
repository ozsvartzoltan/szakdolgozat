import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { baseUrl } from "../global";
import Toggle from "../components/Toggle";
import Snackbar from "../components/Snackbar";

export default function Statistics() {
  const [userJournalInfos, setUserJournalInfos] = useState([]);
  const [toggleStates, setToggleStates] = useState({});
  const [toggledJournalInfoIds, setToggledJournalInfoIds] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    color: "green",
  });
  const showSnackbar = (message, color) => {
    setSnackbar({ open: true, message, color });
    setTimeout(() => {
      setSnackbar({ open: false, message: "", color: "green" });
    }, 3000);
  };

  useEffect(() => {
    const toggledJournalInfos = Object.keys(toggleStates).filter(
      (key) => toggleStates[key] === true
    );
    setToggledJournalInfoIds(toggledJournalInfos);
  }, [toggleStates]);

  useEffect(() => {
    fetch(`${baseUrl}journalinfo-stat`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("refreshToken")}`,
      },
    })
      .then((response) => {
        if (response.status === 401) {
          navigate("/login", {
            state: {
              previousUrl: location.pathname,
            },
          });
        }
        if (!response.ok) {
          navigate("/404");
          throw new Error("Failed to delete user data");
        }
        return response.json();
      })
      .then((data) => {
        setUserJournalInfos(data);
        const initialToggles = {};
        data.forEach((info) => {
          initialToggles[info.id] = false;
        });
        setToggleStates(initialToggles);
      })
      .catch((error) => console.error("Error:", error));
    // eslint-disable-next-line
  }, []);

  function onClickGenerateStatistics() {
    if (toggledJournalInfoIds.length === 0) {
      showSnackbar("Nincs kiválasztva egyetlen statisztika sem!", "red");
      return;
    }
    navigate(`/pdf`, {
      state: {
        journalInfos: userJournalInfos.filter((info) =>
          toggledJournalInfoIds.includes(info.id.toString())
        ),
      },
    });
  }

  const handleToggleChange = (id) => {
    setToggleStates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 rounded">
      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        color={snackbar.color}
      />
      <h1 className="text-xl sm:text-2xl font-bold text-center mb-6">
        Statisztika kiválasztása
      </h1>

      <div className="max-w-lg w-full mx-auto bg-white p-4 sm:p-6 rounded-lg shadow-lg">
        <div>
          {userJournalInfos.length === 0 ? (
            <p className="text-center">Nincsenek felhaszálható adatok!</p>
          ) : (
            <div className="divide-y divide-gray-300">
              {userJournalInfos.map((journalinfo) => (
                <div
                  key={journalinfo.id}
                  className="flex justify-between items-center py-2"
                >
                  <h5 className="text-gray-800">{journalinfo.name}</h5>
                  <Toggle
                    isChecked={toggleStates[journalinfo.id]}
                    onChange={() => handleToggleChange(journalinfo.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <button
            onClick={onClickGenerateStatistics}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          >
            Statisztika generálása
          </button>
        </div>
      </div>
    </div>
  );
}
