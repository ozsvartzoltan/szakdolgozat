export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-screen-xl mx-auto px-4 py-0 flex items-center justify-between h-20">
        <div className="flex items-center h-full">
          <img
            src="logo.webp"
            alt="Health logo"
            className="h-full object-cover"
          />
        </div>
        <span className="text-sm text-gray-400">
          © 2024
          <a
            href="/home"
            className="text-blue-300 hover:text-blue-500 hover:underline ml-1"
          >
            Health Diary
          </a>
          . All Rights Reserved.
        </span>
      </div>
    </footer>
  );
}
