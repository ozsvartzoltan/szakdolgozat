"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class JournalInfo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User);
      this.hasMany(models.EntryLog);
    }
  }
  JournalInfo.init(
    {
      name: DataTypes.STRING,
      unitOfMeasurement: DataTypes.STRING,
      description: DataTypes.STRING,
      UserId: DataTypes.INTEGER,
      dataType: DataTypes.ENUM(
        "FizikaiAktivitás",
        "Étkezés",
        "Pihenés",
        "Fizikai",
        "Mentális"
      ),
    },
    {
      sequelize,
      modelName: "JournalInfo",
    }
  );
  return JournalInfo;
};
