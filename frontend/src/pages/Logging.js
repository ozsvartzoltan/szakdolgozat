import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import NotFound from "./../components/NotFound";
import Book from "../components/Book";

export default function Logging() {
  let { year, month, day, userid } = useParams();
  const [logs] = useState([]);
  const [notFound] = useState(false);
  const [formattedDate, setFormattedDate] = useState();

  // eslint-disable-next-line
  useEffect(() => {
    setFormattedDate(
      `${year}.${month.toString().padStart(2, "0")}.${day
        .toString()
        .padStart(2, "0")}`
    );
  });

  return (
    <>
      {notFound ? <NotFound></NotFound> : null}
      {logs ? (
        <>
          <div className="text-center">
            <h1>Naplózás</h1>
            <h4>{formattedDate}</h4>
          </div>
          {logs.map((log) => {
            return (
              <div key={log.id}>
                <h1>{log.JournalInfo.name}</h1>
              </div>
            );
          })}
        </>
      ) : null}
      <Book year={year} month={month} day={day} userid={userid} />

      <Link
        className="bn632-hover bn19 block mx-auto no-underline my-6 py-3"
        to="/home"
      >
        Vissza
      </Link>
    </>
  );
}
