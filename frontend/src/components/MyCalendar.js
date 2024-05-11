import Calendar from "react-calendar";
import { useState, useEffect } from "react";
import "react-calendar/dist/Calendar.css";
import { baseUrl } from "../global";
import { useNavigate, useLocation } from "react-router-dom";

export default function MyCalendar() {
  const [selectedDate] = useState(new Date());
  const [isCalendarNow, setIsCalendarNow] = useState(true);
  const [datas, setDatas] = useState([]);
  const [calendarCurrentDate, setCalendarCurrentDate] = useState(new Date());
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const url =
      baseUrl +
      "home/" +
      calendarCurrentDate.getFullYear() +
      "/" +
      (calendarCurrentDate.getMonth() + 1);
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
        }
        if (!response.ok) {
          navigate("/404");
          return;
        }
        return response.json();
      })
      .then((data) => {
        setDatas(data);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarCurrentDate]);

  const handleDateChange = (date) => {
    const today = new Date();
    if (date > today) {
      return;
    }

    const formattedDate = `${date.getFullYear()}/${
      date.getMonth() + 1
    }/${date.getDate()}`;
    navigate(`/logging/${formattedDate}`);
  };

  function handleOnActiveStartDateChange({ activeStartDate, view }) {
    if (view === "month") {
      setIsCalendarNow(true);
    } else {
      setIsCalendarNow(false);
    }
    setCalendarCurrentDate(activeStartDate);
  }

  const getDayColor = (value) => {
    switch (value) {
      case 0:
        return "bg-white"; // Missing days (red background)
      case 1:
        return "bg-green-500"; // Completed days (green background)
      default:
        return "bg-white"; // Default color (white background)
    }
  };

  const tileContent = ({ date, view }) => {
    const dayValue = datas[date.getDate() - 1] || 0;
    const color = getDayColor(dayValue);
    if (!isCalendarNow) {
      return;
    }

    return (
      <div
        className={`w-6 h-6 rounded-full ${color} mx-auto shadow-lg transition-all duration-50 transform hover:scale-110 hover:shadow-xl`}
      ></div>
    );
  };

  return (
    <>
      <div className="calendar-container">
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          calendarType="iso8601"
          locale="hu-HU"
          //maxDate={new Date(2030, 11, 31)}
          minDate={new Date(2022, 0, 1)}
          tileContent={tileContent}
          onActiveStartDateChange={handleOnActiveStartDateChange}
          //showDoubleView={true}
          showNeighboringMonth={false}
        />
      </div>

      {isCalendarNow ? (
        <div className="flex justify-center m-2">
          <p className="mx-4">
            Naplózott napok: <b>{datas.filter((num) => num === 1).length}</b>
          </p>
        </div>
      ) : null}
    </>
  );
}
