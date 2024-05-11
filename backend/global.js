const db = require("./models");
const { User, UserInfo, EntryLog, JournalInfo } = db;

const activities = ["FizikaiAktivitás", "Étkezés", "Pihenés"];

const health = ["Fizikai", "Mentális"];

const dataTypes = {
  FizikaiAktivitás: "FizikaiAktivitás",
  Étkezés: "Étkezés",
  Pihenés: "Pihenés",
  Fizikai: "Fizikai",
  Mentális: "Mentális",
};

const baseDatas = {
  FizikaiAktivitás: [
    { Name: "Séta", unitOfMeasurement: "méter" },
    { Name: "Futás", unitOfMeasurement: "méter" },
    { Name: "Megtett lépések", unitOfMeasurement: "db" },
    { Name: "Úszás", unitOfMeasurement: "méter" },
    { Name: "Labdarúgás", unitOfMeasurement: "perc" },
    { Name: "Konditermi edzés", unitOfMeasurement: "perc" },
    { Name: "Kerékpár", unitOfMeasurement: "perc" },
    { Name: "Tánc", unitOfMeasurement: "perc" },
    { Name: "Jóga", unitOfMeasurement: "perc" },
    { Name: "Pilates", unitOfMeasurement: "perc" },
    { Name: "Kosárlabda", unitOfMeasurement: "perc" },
    { Name: "Röplabda", unitOfMeasurement: "perc" },
  ],
  Étkezés: [
    { Name: "Bevitt kalória", unitOfMeasurement: "kalória" },
    { Name: "Étkezések száma", unitOfMeasurement: "db" },
    { Name: "Bevitt zsír", unitOfMeasurement: "gramm" },
    { Name: "Bevitt fehérje", unitOfMeasurement: "gramm" },
    { Name: "Koffein bevitel", unitOfMeasurement: "kávé" },
    { Name: "Napi folyadékbevitel", unitOfMeasurement: "liter" },
  ],
  Pihenés: [
    { Name: "Alvás", unitOfMeasurement: "óra" },
    { Name: "Alvás minőség", unitOfMeasurement: "1-5" },
    { Name: "Ledolgozott órák", unitOfMeasurement: "óra" },
    { Name: "Sport", unitOfMeasurement: "óra" },
    { Name: "Cigaretta", unitOfMeasurement: "db" },
  ],
  Fizikai: [
    { Name: "Vérnyomás", unitOfMeasurement: "sys" },
    { Name: "Vércukor szint", unitOfMeasurement: "mmol" },
    { Name: "Véroxigén", unitOfMeasurement: "%" },
    { Name: "Vérnyomás", unitOfMeasurement: "dia" },
    { Name: "Pulzus", unitOfMeasurement: "" },
    { Name: "Hemoglobin AC1", unitOfMeasurement: "%" },
    { Name: "Súly", unitOfMeasurement: "kg" },
  ],
  Mentális: [
    { Name: "Boldogság", unitOfMeasurement: "1-10" },
    { Name: "Fáradtság", unitOfMeasurement: "1-10" },
    { Name: "Ledolgozott órák", unitOfMeasurement: "óra" },
    { Name: "Közérzet", unitOfMeasurement: "1-10" },
    { Name: "Szabadidő", unitOfMeasurement: "1-10" },
    { Name: "Egészség", unitOfMeasurement: "1-10" },
    { Name: "Stressz", unitOfMeasurement: "1-10" },
    { Name: "Munka", unitOfMeasurement: "1-10" },
  ],
};

//helper functions
const getModelAccessorMethods = (model) => {
  console.log(`${model.name}:`);
  Object.entries(model.associations).forEach(([_, associatedModel]) => {
    Object.entries(associatedModel.accessors).forEach(([action, accessor]) => {
      console.log(`  ${action}: ${model.name}.${accessor}(...)`);
    });
  });
};

// (async () => {
//   getModelAccessorMethods(User);
//   getModelAccessorMethods(UserInfo);
//   getModelAccessorMethods(EntryLog);
//   getModelAccessorMethods(JournalInfo);
// })();

module.exports = { dataTypes, baseDatas };
