import EditUserInfo from "./EditUserInfo";
import { useEffect } from "react";

export default function UserInfo(props) {
  function handleDeleteUserInfo() {
    props.handleDeleteUserInfo(props.id);
  }

  return (
    <div className="mx-auto my-4 p-4 bg-white rounded-xl shadow-lg max-w-[450px]">
      <div className="space-y-1">
        <div className="">
          <p className="text-lg text-black font-semibold">{props.dataName}</p>
          <p className="text-slate-500 font-medium">{props.dataValue}</p>
        </div>
        <EditUserInfo
          id={props.id}
          dataName={props.dataName}
          dataValue={props.dataValue}
          updateUserInfo={props.updateUserInfo}
          handleDeleteUserInfo={handleDeleteUserInfo}
        />
      </div>
    </div>
  );
}
