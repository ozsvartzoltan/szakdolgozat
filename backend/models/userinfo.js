"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserInfo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User);
    }
  }
  UserInfo.init(
    {
      UserId: DataTypes.INTEGER,
      dataName: DataTypes.STRING,
      dataValue: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "UserInfo",
    }
  );
  return UserInfo;
};
