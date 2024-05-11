import { separateCapitalLetters } from "../global";

export default function BookLeftSide(props) {
  const handleSelectChange = (event) => {
    const selectedActivity = props.activities.find(
      (activity) => activity.name === event.target.value
    );

    if (selectedActivity) {
      props.onActivitySelect(
        selectedActivity.id,
        selectedActivity.name,
        selectedActivity.dataType,
        selectedActivity.unitOfMeasurement,
        selectedActivity.description,
        selectedActivity.UserId
      );
    }
  };

  return (
    <div className="m-2 mt-2 bg-blue-300 rounded-lg p-4 shadow-md">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <h4 className="font-semibold flex-grow">
          {separateCapitalLetters(props.activity)}
        </h4>
        <div className="mt-2 md:mt-0 md:w-48">
          <select
            onChange={handleSelectChange}
            className="appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
          >
            <option selected="selected">Keresés</option>
            {props.activities.map((activity) => (
              <option key={activity.id} value={activity.name}>
                {activity.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
