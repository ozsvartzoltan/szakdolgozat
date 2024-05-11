import { Disclosure } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Footer from "./Footer";
import { NavLink } from "react-router-dom";

const navigation = [
  { name: "Főoldal", href: "/home" },
  { name: "Beállítások", href: "/settings" },
  { name: "Fiókom", href: "/user" },
  { name: "Kijelentkezés", href: "/logout" },
];

export default function Header({ children }) {
  return (
    <>
      <Disclosure as="nav" className="bg-gray-800">
        {({ open }) => (
          <>
            <div className="max-w-full px-2 sm:px-6 lg:px-8">
              <div className="relative flex items-center justify-between h-16">
                <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                  {/* Mobile menu button */}
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
                <div className="flex-1 flex items-center justify-center sm:justify-start">
                  <NavLink
                    to="/home"
                    className="flex-shrink-0 flex items-center"
                  >
                    <img
                      className="block h-10 w-auto"
                      src="logo.webp"
                      alt="Health Diary Logo"
                    />
                  </NavLink>
                  <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
                    {navigation.map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        className={({ isActive }) =>
                          "rounded-md px-3 py-2 text-sm font-medium no-underline " +
                          (isActive
                            ? "bg-gray-900 text-white"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white")
                        }
                      >
                        {item.name}
                      </NavLink>
                    ))}
                  </div>
                </div>
                <div className="flex items-center pl-4 sm:pl-0">
                  <span className="text-white font-medium">
                    Üdvözöljük, {localStorage.getItem("username")}!
                  </span>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="sm:hidden">
              <div className="px-2 pb-3 space-y-1">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      "block rounded-md px-3 py-2 text-base font-medium no-underline " +
                      (isActive
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white")
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
      <div className="bg-gray-300">
        <div className="mx-auto min-h-screen p-4 max-w-7xl bg-gray-300">
          {children}
        </div>
      </div>
      <Footer />
    </>
  );
}
