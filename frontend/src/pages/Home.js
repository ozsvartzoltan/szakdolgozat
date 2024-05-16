import MyCalendar from "../components/MyCalendar";

export default function Home() {
  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="block mx-auto">
        <h1>Főoldal</h1>
      </div>
      <div className="block mx-auto">
        <MyCalendar />
      </div>
    </div>
  );
}
