import { useEffect, useState } from "react";
import { dataTypes, separateCapitalLetters, baseUrl } from "../global";
import Snackbar from "../components/Snackbar";
import { useNavigate, useLocation } from "react-router-dom";

export default function Settings() {
  const [dataName, setDataName] = useState("");
  const [dataType, setDataType] = useState("");
  const [unitOfMeasurement, setUnitOfMeasurement] = useState("");
  const [description, setDescription] = useState("");
  const [journalInfos, setJournalInfos] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    color: "green",
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const url = baseUrl + "journalinfo";
    fetch(url, {
      headers: {
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
          return;
        }
        if (!response.ok) {
          navigate("/404");
          throw new Error("Failed to fetch journal info");
        }
        return response.json();
      })
      .then((data) => {
        setJournalInfos(data);
      });
    // eslint-disable-next-line
  }, []);

  function AddNewJournalInfo(e) {
    e.preventDefault();
    if (!dataName || !dataType || !unitOfMeasurement) {
      showSnackbar(
        "Név, adat típusa és mértékegység mezőket kötelező kitölteni!",
        "red"
      );
      return;
    }

    const newJournalInfo = {
      name: dataName,
      dataType: dataType,
      unitOfMeasurement: unitOfMeasurement,
      description: description,
    };

    const url = baseUrl + "journalinfo";
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("refreshToken")}`,
      },
      body: JSON.stringify(newJournalInfo),
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
          throw new Error("Failed to add new journal info");
        }
        return response.json();
      })
      .then((addedJournalInfo) => {
        console.log(addedJournalInfo);
        setJournalInfos((journalInfos) => [...journalInfos, addedJournalInfo]);
        showSnackbar("Naplózási adat sikeresen felvéve!", "green");
      })
      .catch((e) => {
        showSnackbar("Sikertelen naplózási adat hozzáadás!", "red");
      });

    setDataName("");
    setDataType("");
    setUnitOfMeasurement("");
    setDescription("");
  }

  const showSnackbar = (message, color) => {
    setSnackbar({ open: true, message, color });
    setTimeout(() => {
      setSnackbar({ open: false, message: "", color: "green" });
    }, 3000);
  };

  function deleteJournalInfo(id) {
    const url = baseUrl + "journalinfo/" + id;
    fetch(url, {
      method: "DELETE",
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
        showSnackbar("Naplózási adat sikeresen törölve!", "green");
        setJournalInfos(
          journalInfos.filter((journalinfo) => journalinfo.id !== id)
        );
      })
      .catch((e) => {
        console.log(e);
      });
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 rounded">
      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        color={snackbar.color}
      />
      <div className="min-h-screen bg-gray-50 py-10 rounded">
        <h1 className="text-center mb-6">Naplózási adatok</h1>
        <div className="max-w-lg w-full mx-auto bg-white p-4 sm:p-6 rounded-lg shadow-lg">
          <h3 className="text-lg sm:text-xl font-semibold text-center mb-4">
            Naplózási adat felvétele
          </h3>
          <form onSubmit={AddNewJournalInfo} className="space-y-4">
            <div className="space-y-1">
              <label className="font-medium">Adat megnevezés</label>
              <input
                type="text"
                value={dataName}
                onChange={(e) => setDataName(e.target.value)}
                placeholder="Futás"
                maxLength="128"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium">Kategória típusa</label>
              <select
                value={dataType}
                onChange={(e) => setDataType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select...</option>
                {dataTypes.map((dataType) => (
                  <option key={dataType} value={dataType}>
                    {separateCapitalLetters(dataType)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-medium">Mértékegység</label>
              <input
                type="text"
                value={unitOfMeasurement}
                onChange={(e) => setUnitOfMeasurement(e.target.value)}
                placeholder="Méter"
                maxLength="128"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium">Adat leírás</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Egy napon futott lefutott méter."
                rows="4"
                maxLength="128"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Új naplózási adat hozzáadása
            </button>
          </form>
        </div>

        {journalInfos ? (
          <div className="max-w-lg w-full mx-auto mt-8 bg-white p-4 rounded-lg shadow-lg">
            <h2 className="text-lg sm:text-xl font-semibold text-center mb-4">
              Naplózási adat törlése
            </h2>
            {journalInfos.map((journalinfo) => (
              <div
                key={journalinfo.id}
                className="flex items-center justify-between p-3 border-b last:border-b-0"
              >
                <div className="flex items-center space-x-3">
                  <span className="font-medium">{journalinfo.name}</span>
                  <span>{separateCapitalLetters(journalinfo.dataType)}</span>
                  <div className="relative flex items-center">
                    <div className="group relative flex items-center">
                      <button className="rounded-full bg-blue-500 w-8 h-8 text-sm text-white shadow-sm ">
                        i
                      </button>
                      <span className="absolute left-10 scale-0 transition-all rounded-md bg-black p-2 text-xs text-white group-hover:scale-100">
                        {journalinfo.description}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteJournalInfo(journalinfo.id)}
                  className="w-6 h-6 bg-red-500 flex items-center justify-center rounded-full text-white"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>Nincs naplózási adatod.</p>
        )}
      </div>
    </div>
  );
}
