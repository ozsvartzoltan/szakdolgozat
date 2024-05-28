//import backGroundImage from "./../images/book1.jpg";
import { activities, health, baseUrl } from "../global";
import { useState, useEffect } from "react";
import BookLeftSide from "./BookLeftSide";
import BookRightSide from "./BookRightSide";
import { v4 as uuidv4 } from "uuid";
import { Link, useNavigate } from "react-router-dom";
import Snackbar from "../components/Snackbar";

export default function Book(props) {
  const [visibleEntryLogs, setVisibleEntryLogs] = useState([]); // ez a megjelenites
  const [existingEntryLogs, setExistingEntryLogs] = useState([]);
  const [newEntryLogs, setNewEntryLogs] = useState([]);
  const [deletedEntryLogs, setDeletedEntryLogs] = useState([]);
  const [journalInfos, setJournalInfos] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    color: "green",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const url =
      baseUrl + "home/" + props.year + "/" + props.month + "/" + props.day;
    fetch(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("refreshToken")}`,
      },
    })
      .then((response) => {
        if (response.status === 401) {
          navigate("/login");
          return null;
        } else if (response.status === 404) {
          navigate("/404");
          return null;
        } else if (!response.ok) {
          navigate("/404");
          return;
        }
        return response.json();
      })
      .then((data) => {
        if (data) {
          setExistingEntryLogs(data);
          setVisibleEntryLogs(data);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetch(baseUrl + "journalinfo", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("refreshToken")}`,
      },
    })
      .then((response) => {
        if (response.status === 401) {
          navigate("/login");
          return null;
        }
        if (!response.ok) {
          navigate("/404");
          return;
        }
        return response.json();
      })
      .then((data) => {
        setJournalInfos(data);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showSnackbar = (message, color) => {
    setSnackbar({ open: true, message, color });
    setTimeout(() => {
      setSnackbar({ open: false, message: "", color: "green" });
    }, 3000);
  };

  function getJournalInfoByName(activity) {
    if (!journalInfos || journalInfos.length === 0) {
      return [];
    } else {
      let journalinformations = [];
      for (let i = 0; i < journalInfos.length; i++) {
        if (journalInfos[i].dataType === activity) {
          journalinformations.push(journalInfos[i]);
        }
      }
      return journalinformations;
    }
  }

  const handleActivitySelect = (
    journalinfoid,
    name,
    dataType,
    unitOfMeasurement,
    description,
    UserId
  ) => {
    const entrylog = visibleEntryLogs.find(
      (entrylog) => entrylog.JournalInfoId === journalinfoid
    );

    if (entrylog) {
      showSnackbar("A napló már létezik!", "orange");
    } else {
      const newEntryLog = {
        id: uuidv4(),
        JournalInfoId: journalinfoid,
        dataValue: 0,
        JournalInfo: {
          id: journalinfoid,
          name: name,
          dataType: dataType,
          unitOfMeasurement: unitOfMeasurement,
          description: description,
          UserId: UserId,
        },
      };
      setNewEntryLogs([...newEntryLogs, newEntryLog]);
      setVisibleEntryLogs([...visibleEntryLogs, newEntryLog]);
    }
  };

  const removeActivityBox = (id) => {
    /* removing log from visible elements */
    setVisibleEntryLogs((currentLogs) =>
      currentLogs.filter((log) => log.id !== id)
    );
    /* removing log from new elements */
    setNewEntryLogs((currentLogs) =>
      currentLogs.filter((log) => log.id !== id)
    );

    const logExists = existingEntryLogs.some((log) => log.id === id);
    if (logExists) {
      setDeletedEntryLogs((currentDeletedLogs) => [
        ...currentDeletedLogs,
        existingEntryLogs.find((log) => log.id === id),
      ]);
    }
    /* removing log from existing elements */
    setExistingEntryLogs((currentLogs) =>
      currentLogs.filter((log) => log.id !== id)
    );
  };

  function onDataValueChange(value, id) {
    // Updating dataValue in visibleEntryLogs
    setVisibleEntryLogs((visibleEntryLogs) =>
      visibleEntryLogs.map((log) =>
        log.id === id ? { ...log, dataValue: value } : log
      )
    );

    // Updating dataValue in newEntryLogs
    setNewEntryLogs((visibleEntryLogs) =>
      visibleEntryLogs.map((log) =>
        log.id === id ? { ...log, dataValue: value } : log
      )
    );

    // Updating dataValue in existingEntryLogs
    setExistingEntryLogs((visibleEntryLogs) =>
      visibleEntryLogs.map((log) =>
        log.id === id ? { ...log, dataValue: value } : log
      )
    );
  }

  /* Delete existing entryLog from DB */
  useEffect(() => {
    if (deletedEntryLogs[0]) {
      const url = baseUrl + "entrylog/" + deletedEntryLogs[0].id;
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
            return null;
          }
          if (response.status === 404) {
            navigate("/404");
            return;
          }
          if (!response.ok) {
            navigate("/404");
            return;
          }
          setDeletedEntryLogs([]);
          return response.json();
        })
        .then((data) => {
          return data;
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deletedEntryLogs]);

  function onHandleLogging() {
    if (!visibleEntryLogs || visibleEntryLogs.length === 0) {
      showSnackbar("Nincs naplózható adat!", "orange");
      return;
    }

    // Create all new logs
    newEntryLogs.forEach((log) => {
      const url = baseUrl + "entrylog";
      const newEntryLog = {
        JournalInfoId: log.JournalInfoId,
        dataValue: log.dataValue,
        createdAt: `${props.year}-${props.month}-${props.day}`,
      };
      if (!log.dataValue) {
        showSnackbar("Naplónak nincs értéke!", "red");
        return;
      }
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("refreshToken")}`,
        },
        body: JSON.stringify(newEntryLog),
      })
        .then((response) => {
          if (response.status === 401) {
            navigate("/login");
            return null;
          }
          if (!response.ok) {
            navigate("/404");
            return;
          }
          return response.json();
        })
        .then((data) => {
          showSnackbar("Sikeres naplózás!", "green");
        })
        .catch((error) => {
          showSnackbar("Sikertelen naplózás!", "red");
        });
    });

    // Update all existing logs
    existingEntryLogs.forEach((log) => {
      const url = baseUrl + "entrylog/" + log.id;
      fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("refreshToken")}`,
        },
        body: JSON.stringify({
          dataValue: log.dataValue,
        }),
      })
        .then((response) => {
          if (response.status === 401) {
            navigate("/login");
            return null;
          }
          if (!response.ok) {
            navigate("/404");
            throw new Error("Failed to update log");
          }
          return response.json();
        })
        .then((data) => {
          showSnackbar("Napló sikeresen módosítva!", "green");
        })
        .catch((error) => {
          console.error("Error updating log:", error);
          showSnackbar("Sikertelen napló modosítás!", "red");
        });
    });
  }

  return (
    <>
      <div className="min-h-screen">
        <Snackbar
          open={snackbar.open}
          message={snackbar.message}
          color={snackbar.color}
        />
        <div className="flex justify-center items-center min-h-screen bg-gray-100 rounded-lg p-8">
          {/* Left Side */}
          <div
            className="w-full max-w-6xl bg-white shadow-lg flex flex-col md:flex-row pt-4"
            style={{ minHeight: "85vh" }}
          >
            <div className="w-full md:w-1/2 px-2 border-b md:border-b-0 md:border-r border-gray-300">
              <h2 className="text-center mb-4">Tevékenység</h2>
              {activities.map((activity) => (
                <BookLeftSide
                  key={activity.id}
                  activity={activity}
                  activities={getJournalInfoByName(activity)}
                  onActivitySelect={handleActivitySelect}
                />
              ))}
              <h2 className="text-center m-4">Egészségi mutatók</h2>
              {health.map((activity) => (
                <BookLeftSide
                  activity={activity}
                  activities={getJournalInfoByName(activity)}
                  onActivitySelect={handleActivitySelect}
                />
              ))}
            </div>

            {/* Right Side */}
            <div
              className="w-full md:w-1/2 pl-2 overflow-auto"
              style={{ height: "75vh" }}
            >
              <h2 className="mb-4 text-center">Napló</h2>
              {visibleEntryLogs.map((entrylog) => (
                <BookRightSide
                  key={entrylog.id}
                  id={entrylog.id}
                  dataType={entrylog.JournalInfo.dataType}
                  name={entrylog.JournalInfo.name}
                  description={entrylog.JournalInfo.description}
                  unitOfMeasurement={entrylog.JournalInfo.unitOfMeasurement}
                  dataValue={entrylog.dataValue}
                  onRemove={() => removeActivityBox(entrylog.id)}
                  onDataValueChange={onDataValueChange}
                />
              ))}
            </div>
          </div>
        </div>
        <Link
          className="bn632-hover bn19 block text-center mx-auto no-underline my-6 py-3"
          onClick={onHandleLogging}
        >
          Naplózás
        </Link>
      </div>
    </>
  );
}
