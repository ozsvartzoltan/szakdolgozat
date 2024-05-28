const Toggle = ({ isChecked, onChange }) => {
  return (
    <label className="flex cursor-pointer select-none items-center">
      <div className="relative">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={onChange}
          className="sr-only"
        />
        <div
          className={`block h-8 w-14 rounded-full transition-colors duration-300 ${
            isChecked ? "bg-green-400" : "bg-gray-300"
          }`}
        />
        <div
          className={`dot absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white transition-all duration-300 ${
            isChecked ? "translate-x-6" : ""
          }`}
        >
          {isChecked ? (
            <span className="sr-only">Enabled</span>
          ) : (
            <span className="sr-only">Disabled</span>
          )}
        </div>
      </div>
    </label>
  );
};

export default Toggle;
