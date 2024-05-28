"use strict";
const { baseDatas, dataTypes } = require("../global");
const db = require("./../models");
const { faker } = require("@faker-js/faker");
const { User, UserInfo, EntryLog, JournalInfo } = db;
const bcrypt = require("bcrypt");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = [];
    let u = await User.create({
      name: "admin",
      email: "admin@gmail.com",
      password: bcrypt.hashSync("admin", 10),
      isAdmin: true,
      dateOfBirth: Date.now(),
      isMale: true,
      height: 1,
      isMetric: true,
    });
    users.push(u);

    let for_test = await User.create({
      name: "test",
      email: "test@gmail.com",
      password: bcrypt.hashSync("admin", 10),
      isAdmin: false,
      dateOfBirth: Date.now(),
      isMale: true,
      height: 1,
      isMetric: true,
    });
    users.push(for_test);

    /*
    const userCount = faker.number.int({ min: 5, max: 10 });
    for (let i = 0; i < userCount; i++) {
      users.push(
        await User.create({
          name: faker.person.fullName(),
          email: faker.internet.email(),
          password: bcrypt.hashSync("admin", 10),
          isAdmin: false,
          dateOfBirth: faker.date.between({
            from: "1930-01-01",
            to: "2006-01-01",
          }),
          isMale: faker.datatype.boolean(0.5),
          height: faker.number.float({ min: 110, max: 210, fractionDigits: 1 }),
          isMetric: faker.datatype.boolean(0.9),
        })
      );
    }*/

    const userInfoCount = faker.number.int({ min: 10, max: 20 });
    const userInfos = [];
    for (let i = 0; i < userInfoCount; i++) {
      userInfos.push(
        await UserInfo.create({
          dataName: faker.lorem.word(),
          dataValue: faker.lorem.paragraph(),
          UserId: faker.helpers.arrayElement(users).id,
        })
      );
    }

    const journalInfos = [];
    for (let category in baseDatas) {
      for (let data of baseDatas[category]) {
        journalInfos.push(
          await JournalInfo.create({
            name: data.Name,
            unitOfMeasurement: data.unitOfMeasurement,
            description: "",
            //UserId: faker.helpers.arrayElement(users).id,
            UserId: 1,
            dataType: dataTypes[category],
          })
        );
      }
    }

    const entryLogs = [];
    const entryLogCount = faker.number.int({ min: 20, max: 50 });
    for (let i = 0; i < entryLogCount; i++) {
      entryLogs.push(
        await EntryLog.create({
          dataValue: faker.number.int({ min: 1, max: 10 }),
          JournalInfoId: faker.helpers.arrayElement(journalInfos).id,
          createdAt: "2024-04-20 18:17:10",
        })
      );
    }

    const entryLogCount2 = faker.number.int({ min: 20, max: 50 });
    for (let i = 0; i < entryLogCount2; i++) {
      entryLogs.push(
        await EntryLog.create({
          dataValue: faker.number.int({ min: 1, max: 10 }),
          JournalInfoId: faker.helpers.arrayElement(journalInfos).id,
          createdAt: "2024-04-26 18:17:10",
        })
      );
    }
  },

  async down(queryInterface, Sequelize) {},
};
