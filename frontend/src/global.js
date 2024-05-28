export const baseUrl = "http://localhost:3000/";

//export const baseUrl = "http://10.200.196.6:8000/";

export const activities = ["FizikaiAktivitás", "Étkezés", "Pihenés"];

export const health = ["Fizikai", "Mentális"];

export const dataTypes = [
  "FizikaiAktivitás",
  "Étkezés",
  "Pihenés",
  "Fizikai",
  "Mentális",
];

export const separateCapitalLetters = (inputString) => {
  let separatedString = "";
  for (let i = 0; i < inputString.length; i++) {
    const currentChar = inputString[i];
    if (currentChar === currentChar.toUpperCase() && i > 0) {
      separatedString += " ";
    }
    separatedString += currentChar;
  }
  return separatedString;
};
