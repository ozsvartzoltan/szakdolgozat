"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class EntryLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.JournalInfo);
    }
  }
  EntryLog.init(
    {
      JournalInfoId: DataTypes.INTEGER,
      dataValue: DataTypes.FLOAT,
    },
    {
      sequelize,
      modelName: "EntryLog",
    }
  );
  return EntryLog;
};
