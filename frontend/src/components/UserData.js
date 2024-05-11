export default function UserData(props) {
  return (
    <>
      <div className="mt-0 min-w-[350px] max-w-[350px] m-4 p-8 mx-auto bg-white rounded-xl shadow-lg space-y-2 sm:py-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-6">
        <div className="text-center space-y-2 sm:text-left">
          <div className="space-y-0.5">
            <p className="text-lg text-black font-semibold">{props.dataName}</p>
            <p className="text-slate-500 font-medium">{props.dataValue}</p>
          </div>
          {props.editUserData}
        </div>
      </div>
    </>
  );
}
