import { separateCapitalLetters } from "../global";

export default function BookRightSide(props) {
  function onDataValueChange(e) {
    props.onDataValueChange(e, props.id);
  }

  return (
    <div className="m-2 flex flex-col bg-green-300 border-4 border-black rounded-lg px-2 py-2 shadow-md">
      <h4 className="font-semibold text-left text-xl">{props.name}</h4>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-left flex-1">
          {separateCapitalLetters(props.dataType)}
        </span>
        <input
          type="number"
          step="0.2"
          className="flex-1 border border-gray-300 rounded-lg p-2"
          value={props.dataValue || ""}
          placeholder={props.dataValue ? undefined : "Enter value"}
          onChange={(e) => onDataValueChange(e.target.value, props.id)}
        />
        <span className="text-center flex-1">{props.unitOfMeasurement}</span>
        <button
          onClick={props.onRemove}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          x
        </button>
      </div>
    </div>
  );
}
