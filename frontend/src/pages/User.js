import "./../index.css";
import { useState, useEffect } from "react";
import AddUserInfo from "./../components/AddUserInfo";
import UserInfo from "./../components/UserInfo";
import { baseUrl } from "../global";
import Snackbar from "../components/Snackbar";
import { useNavigate, useLocation } from "react-router-dom";
import DeleteUserButton from "../components/DeleteUserButton";
import PasswordChange from "../components/PasswordChange";

export default function User() {
  const [userDatas, setUserDatas] = useState([]);
  const [userInfos, setUserInfos] = useState([]);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userBirthDate, setUserBirthDate] = useState("");
  const [isMale, setIsMale] = useState(true);
  const [userHeight, setUserHeight] = useState("");
  const [isMetric, setIsMetric] = useState(true);
  const [originalUserName, setOriginalUserName] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");
  const [originalDateOfBirth, setOriginalDateOfBirth] = useState("");
  const [originalIsMale, setOriginalIsMale] = useState(true);
  const [originalHeight, setOriginalHeight] = useState("");
  const [originalIsMetric, setOriginalIsMetric] = useState(true);
  const [show, setShow] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    color: "green",
  });
  const navigate = useNavigate();
  const location = useLocation();
  const [isOnline] = useState(navigator.onLine);

  useEffect(() => {
    localStorage.setItem("username", userName);
  }, [userName]);

  useEffect(() => {
    const url = baseUrl + "user";
    fetch(url, {
      method: "GET",
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

        return response.json();
      })
      .then((data) => {
        setUserDatas(data);
        setUserInfos(data.UserInfos);
        setUpUserData(data);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showSnackbar = (message, color) => {
    setSnackbar({ open: true, message, color });
    setTimeout(() => {
      setSnackbar({ open: false, message: "", color: "green" });
    }, 3000);
  };

  function handleDeleteUserInfo(id) {
    const url = baseUrl + "userinfo/" + id;
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
        showSnackbar("Felhasználó adat sikeresen törölve!", "green");
      })
      .catch((e) => {
        showSnackbar("Felhasználói adat törlése sikertelen!", "red");
        console.log(e);
      });
    setUserInfos(userInfos.filter((data) => data.id !== id));
  }

  function setUpUserData(data) {
    setUserName(data.name);
    setUserEmail(data.email);
    const formattedUserBirthDate = data.dateOfBirth
      ? data.dateOfBirth.split("T")[0]
      : "";
    setUserBirthDate(formattedUserBirthDate);
    setIsMale(data.isMale);
    setUserHeight(data.height);
    setIsMetric(data.isMetric);
    setOriginalUserName(data.name);
    setOriginalEmail(data.email);
    setOriginalDateOfBirth(formattedUserBirthDate);
    setOriginalIsMale(data.isMale);
    setOriginalHeight(data.height);
    setOriginalIsMetric(data.isMetric);
  }

  function updateUserInfo(id, updatedUserInfoName, updatedUserInfoValue) {
    if (updatedUserInfoName === "" || updatedUserInfoValue === "") {
      showSnackbar("Kérjük ne hagyjon üresen egy mezőt sem!", "red");
      return;
    }
    const url = baseUrl + "userinfo/" + id;
    fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("refreshToken")}`,
      },
      body: JSON.stringify({
        dataName: updatedUserInfoName,
        dataValue: updatedUserInfoValue,
      }),
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
          showSnackbar("Sikertelen felhasználói adat módosítás!", "red");
          throw new Error("Failed to update user data");
        }
        showSnackbar("Felhasználói adat sikeresen módosítva!", "green");
        return response.json();
      })
      .catch((e) => {
        showSnackbar("Sikertelen felhasználói adat módosítás!", "red");
        console.log(e);
      });

    const updatedUserInfos = userInfos.map((data) => {
      if (data.id === id) {
        return {
          ...data,
          dataName: updatedUserInfoName,
          dataValue: updatedUserInfoValue,
        };
      }
      return data;
    });
    setUserInfos(updatedUserInfos);
  }

  function AddNewUserInfo(dataName, dataValue) {
    if (dataName === "" || dataValue === "") {
      return;
    }
    const newUserInfo = {
      dataName: dataName,
      dataValue: dataValue,
    };
    const url = baseUrl + "userinfo";
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("refreshToken")}`,
      },
      body: JSON.stringify(newUserInfo),
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
          showSnackbar("Sikertelen felhasználói adat hozzáadás!", "red");
          throw new Error("Failed to add new user data");
        }
        return response.json();
      })
      .then((data) => {
        if (data) {
          setUserInfos((prev) => [...prev, data]);
          showSnackbar("Felhasználói adat sikeresen hozzáadva!", "green");
        }
      })
      .catch((e) => {
        console.log(e);
        showSnackbar("Sikertelen felhasználói adat hozzáadás!", "red");
      });
    return;
  }

  const handleGenderChange = (event) => {
    setIsMale(event === "F");
  };

  const handleIsMetricChange = (event) => {
    setIsMetric(event === "EU");
  };

  const toggleShow = (event) => {
    setShow(!show);
  };

  function onClickUpdateUserData(e) {
    e.preventDefault();
    if (
      !userName ||
      !userEmail ||
      !userBirthDate ||
      userHeight === null ||
      isMale === null ||
      isMetric === null
    ) {
      //e.preventDefault();
      showSnackbar("Kérlek töltsd ki az összes mezőt!", "red");
      return;
    }

    const url = baseUrl + "user";
    fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("refreshToken")}`,
      },
      body: JSON.stringify({
        name: userName,
        email: userEmail,
        dateOfBirth: userBirthDate,
        isMale: isMale,
        height: userHeight,
        isMetric: isMetric,
      }),
    })
      .then((response) => {
        if (response.status === 401) {
          navigate("/login", {
            state: {
              previousUrl: location.pathname,
            },
          });
        }
        if (response.status === 400) {
          showSnackbar("Hibás adatok!", "red");
          return;
        }
        if (!response.ok) {
          navigate("/404");
          throw new Error("Failed to update user data");
        }
        showSnackbar("Sikeres felhasználó módosítás!", "green");
        localStorage.setItem("username", userName);
        return response.json();
      })
      .catch((e) => {
        showSnackbar("Sikertelen felhasználó módosítás!", "red");
        setUserName(originalUserName);
        setUserEmail(originalEmail);
        setUserBirthDate(originalDateOfBirth);
        setIsMale(originalIsMale);
        setUserHeight(originalHeight);
        setIsMetric(originalIsMetric);
      });
  }

  function onClickUpgradeUser() {
    navigate("/upgrade");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 rounded">
      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        color={snackbar.color}
      />
      <div className="my-0">
        <h1 className="text-center pb-2">Fiókom</h1>
        <div className="max-w-md mx-auto bg-white p-6 my-3 rounded-lg shadow-lg">
          <form
            onSubmit={onClickUpdateUserData}
            id="updateUserData"
            className="max-w-sm mx-auto"
          >
            <h5 className="block mb-1">Email</h5>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="Enter your email"
              maxLength="128"
              className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:border-blue-500"
            />

            <h5 className="block mb-1">Név</h5>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              maxLength="128"
              className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:border-blue-500"
            />

            <h5 className="block mb-1">Születési dátum</h5>
            <input
              type="date"
              value={userBirthDate}
              onChange={(e) => setUserBirthDate(e.target.value)}
              className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:border-blue-500"
            />

            <h5 className="block mb-1">Nem</h5>
            <select
              value={isMale ? "F" : "N"}
              onChange={(e) => handleGenderChange(e.target.value)}
              className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">Select...</option>
              <option value="F">Férfi</option>
              <option value="N">Nő</option>
            </select>

            <h5 className="block mb-1">Magasság</h5>
            <input
              type="number"
              value={userHeight}
              onChange={(e) => setUserHeight(e.target.value)}
              placeholder="Add meg a magasságod"
              className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:border-blue-500"
            />

            <h5 className="block mb-1">Mértékegységek</h5>
            <select
              value={isMetric ? "EU" : "US"}
              onChange={(e) => handleIsMetricChange(e.target.value)}
              className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">Select...</option>
              <option value="EU">EU</option>
              <option value="US">US</option>
            </select>
          </form>

          <button
            form="updateUserData"
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Adatok frissítése
          </button>
        </div>

        <h1
          className="text-center relative overflow-hidden px-4 text-xl title-container"
          style={{
            lineHeight: "1.6em", // Ensures there is enough vertical space for the line without touching the text.
          }}
        >
          <span className="relative z-10 px-2">Felhasználói adatok</span>
          <div className="absolute top-1/2 left-8 transform -translate-y-1/2 w-1/3 max-w-[50%] h-[2px] bg-black rounded-md responsive-line"></div>
          <div className="absolute top-1/2 right-8 transform -translate-y-1/2 w-1/3 max-w-[50%] h-[2px] bg-black rounded-md responsive-line"></div>
        </h1>

        {userInfos ? (
          <>
            {userInfos.map((data) => (
              <UserInfo
                key={data.id}
                id={data.id}
                dataName={data.dataName}
                dataValue={data.dataValue}
                updateUserInfo={updateUserInfo}
                handleDeleteUserInfo={handleDeleteUserInfo}
              />
            ))}
          </>
        ) : (
          <h1 className="block mx-auto">Nincs elérhető információ</h1>
        )}

        <AddUserInfo
          AddNewUserInfo={AddNewUserInfo}
          show={show}
          toggleShow={toggleShow}
        />
      </div>

      {userDatas.isAdmin ? (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => navigate("/statistics")}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Statisztika
          </button>
        </div>
      ) : isOnline ? (
        <div className="flex justify-center mt-4">
          <button
            onClick={onClickUpgradeUser}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Előfizetés
          </button>
        </div>
      ) : (
        <></>
      )}
      <PasswordChange />
      <DeleteUserButton />
    </div>
  );
}
