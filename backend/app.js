const fastify = require("fastify")({ logger: true });
const { User, UserInfo, EntryLog, JournalInfo } = require("./models");
const { baseDatas } = require("./global");
const { Sequelize } = require("sequelize");
const bcrypt = require("bcrypt");
const stripe = require("stripe")(
  "sk_test_51P87j2BlXo2jssAD2u1U3AQQmUvDeIx0MomdTXWgSejouF5eQEAAcbn61NSaHUQntRcdd3hVedDYojHAu5LMBDuz00AbPAJBGI"
);
const qs = require("qs");
const PDFDocument = require("pdfkit");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const nodemailer = require("nodemailer");
const ChartDataLabels = require("chartjs-plugin-datalabels");

module.exports = function build(opts = {}) {
  fastify.register(require("@fastify/formbody"));
  fastify.register(require("@fastify/jwt"), {
    secret: "secret",
  });

  fastify.register(require("@fastify/cors"), (instance) => {
    return (req, callback) => {
      const corsOptions = {
        origin: true,
        credentials: true,
      };

      if (/^localhost$/m.test(req.headers.origin)) {
        corsOptions.origin = true;
      }
      callback(null, corsOptions);
    };
  });

  fastify.decorate("authenticate", async function (request, reply) {
    if (process.env.NODE_ENV === "test") {
      request.user = { id: 2 };
      return;
    }

    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  /* Generate PDF */
  fastify.post(
    "/generate-pdf",
    {
      onRequest: [fastify.authenticate],
      schema: {
        body: {
          type: "object",
          required: ["journalInfos"],
          properties: {
            journalInfos: { type: "array" },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const userId = request.user.id;
        if (!request.user.isAdmin) reply.status(403);
        const journalInfoIds = request.body.journalInfos.map(
          (journalInfo) => journalInfo.id
        );
        const today = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(today.getMonth() - 3);

        const doc = new PDFDocument();
        let buffers = [];
        doc.on("data", (data) => buffers.push(data));

        doc.fontSize(25).text("Jelentés", { align: "center" });
        doc.moveDown(1.5);

        doc
          .fontSize(12)
          .text(`Név: ${request.user.name}`, { align: "left" })
          .moveDown(0.5)
          .text(
            `Születési dátum: ${new Date(
              request.user.dateOfBirth
            ).toLocaleDateString("hu-HU")}`,
            { align: "left" }
          )
          .moveDown(2);

        const entryLogs = await getLogsFromDB(
          journalInfoIds,
          threeMonthsAgo,
          today
        );
        const stats = calculateStatistics(entryLogs, threeMonthsAgo);
        addStatisticsTable(doc, stats);

        // Generate a chart for each JournalInfo
        for (const journalInfoId of journalInfoIds) {
          const specificLogs = entryLogs.filter(
            (log) => log.JournalInfoId === journalInfoId
          );
          if (specificLogs.length > 0) {
            const journalInfoName = specificLogs[0].JournalInfo.name;
            doc.addPage(); // Start a new page for each chart
            doc
              .fontSize(16)
              .text(`${journalInfoName}`, { align: "center" })
              .moveDown(0.5);

            const chartData = prepareChartData(specificLogs);
            const chartBuffer = await generateChart(chartData);
            doc.image(chartBuffer, 50, doc.y, { width: 400 }); // Ensure the chart is positioned correctly after the title
          }
        }

        doc.end();
        await new Promise((resolve) => doc.on("end", resolve));

        // Send the PDF
        const pdfData = Buffer.concat(buffers);
        reply.header("Content-Type", "application/pdf");
        reply.header(
          "Content-Disposition",
          `attachment; filename="${request.user.name}_${today.getFullYear()}-${
            today.getMonth() + 1
          }-${today.getDate()}_statistics.pdf"`
        );
        reply.send(pdfData);
      } catch (error) {
        console.error("Error generating PDF data:", error);
        if (!reply.sent) {
          reply.status(500).send("Error generating report");
        }
      }
    }
  );

  async function getLogsFromDB(journalInfoIds, startDate, endDate) {
    return EntryLog.findAll({
      where: {
        JournalInfoId: {
          [Sequelize.Op.in]: journalInfoIds,
        },
        createdAt: {
          [Sequelize.Op.gte]: startDate,
          [Sequelize.Op.lte]: endDate,
        },
      },
      include: [
        {
          model: JournalInfo,
          attributes: ["name", "unitOfMeasurement", "dataType"],
        },
      ],
    });
  }

  function calculateStatistics(entryLogs, startDate) {
    const stats = entryLogs.reduce((acc, log) => {
      if (!acc[log.JournalInfoId]) {
        acc[log.JournalInfoId] = {
          total: 0,
          count: 0,
          min: log.dataValue,
          max: log.dataValue,
          journalInfo: log.JournalInfo,
        };
      }
      acc[log.JournalInfoId].total += log.dataValue;
      acc[log.JournalInfoId].count += 1;
      acc[log.JournalInfoId].min = Math.min(
        acc[log.JournalInfoId].min,
        log.dataValue
      );
      acc[log.JournalInfoId].max = Math.max(
        acc[log.JournalInfoId].max,
        log.dataValue
      );
      return acc;
    }, {});

    Object.keys(stats).forEach((key) => {
      const stat = stats[key];
      stat.average = stat.total / stat.count;
      // Assuming every day has a log for simplification, adjust as necessary
      stat.percentageDaysLogged =
        (stat.count / ((new Date() - startDate) / (24 * 3600 * 1000))) * 140;
    });

    return stats;
  }

  function addStatisticsTable(doc, stats) {
    const startY = 250; // Y-coordinate where the table starts
    const lineSpacing = 20;
    const columnSpacing = 70;
    const initialX = 50;

    // Titles for the columns
    const headers = ["Név", "Összeg", "Átlag", "Min", "Max", "Naplózott napok"];
    doc.fontSize(14).text("Adattáblázat", { align: "center" });

    // Header
    headers.forEach((header, index) => {
      doc.text(header, initialX + index * columnSpacing, startY, {
        width: 140,
        align: "center",
      });
    });

    let currentY = startY + lineSpacing;

    // Rows
    Object.values(stats).forEach((stat, lineIndex) => {
      const xOffset = lineIndex * columnSpacing;
      doc.fontSize(12).text(stat.journalInfo.name, initialX, currentY, {
        width: 140,
        align: "center",
      });
      doc.text(stat.total.toString(), initialX + 1 * columnSpacing, currentY, {
        width: 140,
        align: "center",
      });
      doc.text(
        stat.average.toFixed(2),
        initialX + 2 * columnSpacing,
        currentY,
        {
          width: 140,
          align: "center",
        }
      );
      doc.text(stat.min.toFixed(2), initialX + 3 * columnSpacing, currentY, {
        width: 140,
        align: "center",
      });
      doc.text(stat.max.toFixed(2), initialX + 4 * columnSpacing, currentY, {
        width: 140,
        align: "center",
      });
      doc.text(
        stat.percentageDaysLogged.toFixed(2) + "%",
        initialX + 5 * columnSpacing,
        currentY,
        { width: 140, align: "center" }
      );
      currentY += lineSpacing;
    });

    doc.moveDown(2);
    return currentY;
  }

  function prepareChartData(entryLogs) {
    // First, sort the logs by date in ascending order
    const sortedLogs = entryLogs.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    const labels = sortedLogs.map((log) =>
      new Date(log.createdAt).toLocaleDateString()
    );
    const values = sortedLogs.map((log) => log.dataValue);

    return {
      labels,
      values,
    };
  }

  async function generateChart(data) {
    const width = 800;
    const height = 600;
    const chartJSNodeCanvas = new ChartJSNodeCanvas({
      width,
      height,
      plugins: {
        modern: [ChartDataLabels], // Including the plugin here for usage
      },
    });

    const configuration = {
      type: "line",
      data: {
        labels: data.labels,
        datasets: [
          {
            label: "Értékek",
            data: data.values,
            borderColor: "rgb(75, 192, 192)",
            tension: 0.1,
            fill: false,
            backgroundColor: "rgb(75, 192, 192)",
            pointRadius: 5,
            // Enable datalabels for this dataset
            datalabels: {
              align: "end",
              anchor: "end",
              color: "#000",
              formatter: (value, context) => value,
            },
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
        plugins: {
          // Further configuration for datalabels globally
          datalabels: {
            color: "#555",
            display: true,
            font: {
              weight: "bold",
            },
            formatter: (value, ctx) => value,
          },
        },
      },
    };

    return chartJSNodeCanvas.renderToBuffer(configuration);
  }

  /* Forgot password */
  fastify.post(
    "/forgot-password",
    {
      schema: {
        body: {
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string", format: "email" },
          },
        },
      },
    },
    async (request, reply) => {
      const email = request.body.email;
      const user = await User.findOne({ where: { email: email } });
      if (!user) {
        reply.code(204).send();
        return;
      }

      const newPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await User.update(
        { password: hashedPassword },
        { where: { email: email } }
      );

      const transporter = nodemailer.createTransport({
        service: "outlook",
        auth: {
          user: "egeszsegnaplo@outlook.com",
          pass: "BookRightSide",
        },
      });

      const today = new Date();

      const mailOptions = {
        from: "egeszsegnaplo@outlook.com",
        to: user.email,
        subject: "Új jelszó igénylése",
        text: `Kedves ${
          user.name
        },\n\nAz új jelszód: ${newPassword}\nKérjük belépéskor változtasd meg!\n\nÜdvözlettel,\n©Egészség Napló\n${today.getFullYear()}.${
          today.getMonth() + 1
        }.${today.getDate()}`,
      };

      try {
        await transporter.sendMail(mailOptions);

        reply
          .status(200)
          .send({ message: "Password reset email sent successfully" });
      } catch (error) {
        console.log(error);
        reply.code(500).send({ message: "Failed to send email" });
      }
    }
  );

  /* Create payment */
  fastify.post(
    "/create-payment-intent",
    {
      onRequest: [fastify.authenticate],
      schema: {
        body: {
          type: "object",
          required: ["paymentMethodId", "amount"],
          properties: {
            paymentMethodId: { type: "string" },
            amount: { type: "number" },
          },
        },
      },
    },
    async (request, reply) => {
      const { paymentMethodId, amount } = request.body;
      const userid = request.user.id;
      const user = await User.findByPk(userid);
      if (user.isAdmin) {
        reply.status(403).send({ message: "User is already an admin" });
      }

      if (!user) {
        reply.status(404).send({ message: "User not found" });
      }
      try {
        // Create PaymentIntent with the specified amount, currency, and payment method
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount,
          currency: "usd",
          payment_method: paymentMethodId, //payment method ID from the client
          confirmation_method: "manual",
          confirm: false,
        });

        await user.update({ isAdmin: true });

        return reply.send({
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        });
      } catch (err) {
        fastify.log.error(err);
        return reply.status(500).send({ error: err.message });
      }
    }
  );

  /* LOGIN */
  fastify.post(
    "/login",
    {
      schema: {
        body: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;
      const user = await User.findOne({ where: { email: request.body.email } });
      if (!user || !bcrypt.compareSync(password, user.password)) {
        reply.status(401).send({ message: "Hibás email vagy jelszó!" });
        return;
      }
      const accessToken = fastify.jwt.sign(user.toJSON(), {
        expiresIn: "15m",
      });
      const refreshToken = fastify.jwt.sign(user.toJSON(), { expiresIn: "6h" });

      reply.send({
        accessToken: accessToken,
        refreshToken: refreshToken,
        name: user.name,
      });
    }
  );

  /* Get newAccesToken */
  fastify.post(
    "/refresh_token",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            refreshToken: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      const { refreshToken } = request.body;
      if (!refreshToken) {
        return reply.status(400).send({ error: "Refresh token is required" });
      }

      try {
        const decoded = fastify.jwt.verify(refreshToken);
        const user = await User.findByPk(decoded.id);
        if (!user) {
          return reply.status(404).send({ error: "User not found" });
        }
        const newAccessToken = fastify.jwt.sign(user.toJSON(), {
          expiresIn: "15m",
        });
        reply.send({ accessToken: newAccessToken, refreshToken: refreshToken });
      } catch (error) {
        reply.status(401).send({ error: "Invalid token" });
      }
    }
  );

  //NO
  /*Get EntryLog from date and UserId */
  fastify.get(
    "/entrylog/:id",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "integer" },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const entryLog = await EntryLog.findByPk(id);
      if (!entryLog) {
        reply.status(404).send({ message: "Log not found" });
      }
      reply.send(entryLog);
    }
  );

  /* User based on Id */
  fastify.get(
    "/user",
    {
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      const id = request.user.id;
      const user = await User.findByPk(id, {
        include: [{ model: UserInfo }],
      });
      if (!user) {
        reply.status(404).send({ message: "User not found" });
      }
      reply.send(user);
    }
  );

  //NO
  /* Home */
  fastify.get("/home", async (request, reply) => {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
      const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

      const entryLogs = await EntryLog.findAll({
        where: {
          createdAt: {
            [Sequelize.Op.gte]: firstDayOfMonth,
            [Sequelize.Op.lte]: lastDayOfMonth,
          },
        },
      });

      const calendar = Array(lastDayOfMonth.getDate()).fill(0);

      entryLogs.forEach((entryLog) => {
        const entryLogDate = new Date(entryLog.createdAt).getDate();
        calendar[entryLogDate - 1] = 1;
      });

      const todayDate = currentDate.getDate();
      calendar[todayDate - 1] = 2;

      reply.send(calendar);
    } catch (error) {
      console.error(error);
      reply.status(500).send({ message: "Internal server error" });
    }
  });

  /* Home/year/month */
  fastify.get(
    "/home/:year/:month",
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: {
          type: "object",
          required: ["year", "month"],
          properties: {
            year: { type: "integer" },
            month: { type: "integer" },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const year = parseInt(request.params.year);
        const month = parseInt(request.params.month) - 1;

        if (year < 2000 || year > 2050) {
          reply.status(400).send({ message: "Invalid year index" });
          return;
        }
        if (month < 0 || month > 11) {
          reply.status(400).send({ message: "Invalid month index" });
          return;
        }

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        const entryLogs = await EntryLog.findAll({
          where: {
            createdAt: {
              [Sequelize.Op.gte]: firstDayOfMonth,
              [Sequelize.Op.lte]: lastDayOfMonth,
            },
          },
        });

        const journalinfos = await JournalInfo.findAll({
          where: {
            UserId: request.user.id,
          },
        });

        const userEntryLogs = [];
        for (const entryLog of entryLogs) {
          for (const journalinfo of journalinfos) {
            if (entryLog.JournalInfoId === journalinfo.id) {
              userEntryLogs.push(entryLog);
            }
          }
        }

        const calendar = Array(lastDayOfMonth.getDate()).fill(0);

        userEntryLogs.forEach((entryLog) => {
          const entryLogDate = new Date(entryLog.createdAt).getDate();
          calendar[entryLogDate - 1] = 1;
        });

        reply.send(calendar);
      } catch (error) {
        console.error(error);
        reply.status(500).send({ message: "Internal server error" });
      }
    }
  );

  /* Calendar/year/month/day based on UserId */
  fastify.get(
    "/home/:year/:month/:day",
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: {
          type: "object",
          required: ["year", "month", "day"],
          properties: {
            year: { type: "integer" },
            month: { type: "integer" },
            day: { type: "integer" },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const year = parseInt(request.params.year);
        const month = parseInt(request.params.month) - 1;
        const day = parseInt(request.params.day) - 1;
        const userid = request.user.id;

        if (year < 2022 || year > 2030) {
          reply.status(400).send({ message: "Invalid year index" });
          return;
        }
        if (month < 0 || month > 11) {
          reply.status(400).send({ message: "Invalid month index" });
          return;
        }
        if (day < 0 || day > 30) {
          reply.status(400).send({ message: "Invalid day index" });
          return;
        }
        const user = await User.findByPk(userid);
        if (!user) {
          reply.status(404).send({ message: "User not found" });
          return;
        }

        const date = new Date(year, month, day + 2);
        const startOfDay = new Date(year, month, day, 25, 59, 59, 999);
        const endOfDay = new Date(year, month, day + 1, 25, 59, 59, 999);

        const entryLogs = await EntryLog.findAll({
          where: {
            createdAt: {
              [Sequelize.Op.gte]: startOfDay,
              [Sequelize.Op.lt]: endOfDay,
            },
          },
          include: [
            {
              model: JournalInfo,
              attributes: [
                "id",
                "UserId",
                "name",
                "unitOfMeasurement",
                "description",
                "dataType",
              ],
            },
          ],
        });

        const journalEntries = [];

        for (const entryLog of entryLogs) {
          if (entryLog.JournalInfo.UserId === userid) {
            journalEntries.push(entryLog);
          }
        }
        reply.send(journalEntries);

        // reply.send(journalEntries);
      } catch (error) {
        console.error(error);
        reply.status(500).send({ message: "Internal server error" });
      }
    }
  );

  /* JournalInfos based on UserId */
  fastify.get(
    "/journalinfo",
    {
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      const id = request.user.id;

      const journalinfo = await JournalInfo.findAll({ where: { UserId: id } });
      reply.send(journalinfo);
    }
  );

  /* JournalInfos based on UserId */
  fastify.get(
    "/journalinfo-stat",
    {
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      const id = request.user.id;
      if (!request.user.isAdmin) {
        reply.status(403);
      }

      const journalinfo = await JournalInfo.findAll({ where: { UserId: id } });
      reply.send(journalinfo);
    }
  );

  /* EntryLog created based on JournalInfoId and dataValue */
  fastify.post(
    "/entrylog",
    {
      onRequest: [fastify.authenticate],
      schema: {
        body: {
          type: "object",
          required: ["JournalInfoId", "dataValue"],
          properties: {
            JournalInfoId: { type: "integer" },
            dataValue: { type: "number" },
            createdAt: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      const userid = request.user.id;

      const journalInfo = await JournalInfo.findByPk(
        request.body.JournalInfoId
      );
      if (journalInfo.UserId !== userid) {
        reply.status(404).send({ message: "JournalInfo not found" });
        return;
      }

      let createdAtDate;
      if (request.body.createdAt) {
        createdAtDate = new Date(request.body.createdAt);
        createdAtDate.setHours(5, 0, 0);
      } else {
        createdAtDate = new Date();
      }

      const entryLog = await EntryLog.create({
        JournalInfoId: request.body.JournalInfoId,
        dataValue: request.body.dataValue,
        createdAt: createdAtDate,
      });
      reply.status(201).send(entryLog);
    }
  );

  /* JournalInfo created */
  fastify.post(
    "/journalinfo",
    {
      onRequest: [fastify.authenticate],
      schema: {
        body: {
          type: "object",
          required: ["name", "unitOfMeasurement", "dataType"],
          properties: {
            name: { type: "string" },
            unitOfMeasurement: { type: "string" },
            description: { type: "string" },
            dataType: {
              type: "string",
              enum: [
                "FizikaiAktivitás",
                "Étkezés",
                "Pihenés",
                "Fizikai",
                "Mentális",
              ],
            },
          },
        },
      },
    },
    async (request, reply) => {
      const id = request.user.id;
      const user = await User.findByPk(id);
      if (!user) {
        reply.status(404).send({ message: "User not found" });
      } else {
        const journalInfo = await JournalInfo.create({
          name: request.body.name,
          unitOfMeasurement: request.body.unitOfMeasurement,
          description: request.body.description,
          dataType: request.body.dataType,
          UserId: id,
        });
        reply.status(201).send(journalInfo);
      }
    }
  );

  /* User created */
  fastify.post(
    "/user",
    {
      schema: {
        body: {
          type: "object",
          required: [
            "name",
            "email",
            "password",
            "confirmedpassword",
            "dateOfBirth",
            "isMale",
            "height",
            "isMetric",
          ],
          properties: {
            name: { type: "string", minLength: 1 },
            email: { type: "string", format: "email" },
            password: { type: "string" }, //minLength: 8, maxLength: 140
            confirmedpassword: { type: "string" },
            dateOfBirth: { type: "string", format: "date" },
            isMale: { type: "boolean" },
            height: { type: "number", minLength: 1 },
            isMetric: { type: "boolean" },
          },
        },
      },
    },
    async (request, reply) => {
      if (request.body.password !== request.body.confirmedpassword) {
        reply.status(400).send({ message: "Passwords do not match" });
        return;
      }
      //check if user with given email already exists
      const userWithThisEmail = await User.findOne({
        where: { email: request.body.email },
      });

      if (userWithThisEmail) {
        reply
          .status(409)
          .send({ message: "User with this email already exists" });
        return;
      }

      const user = await User.create({
        name: request.body.name,
        email: request.body.email,
        password: bcrypt.hashSync(request.body.password, 10),
        dateOfBirth: request.body.dateOfBirth,
        isAdmin: false,
        isMale: request.body.isMale,
        height: request.body.height,
        isMetric: request.body.isMetric,
      });
      //find new user in database and save it to a variable

      const newUser = await User.findOne({
        where: { email: request.body.email },
      });

      const categories = Object.keys(baseDatas);

      for (const category of categories) {
        for (const data of baseDatas[category]) {
          await JournalInfo.create({
            UserId: newUser.id,
            dataType: category,
            name: data.Name,
            unitOfMeasurement: data.unitOfMeasurement,
            description: "",
          });
        }
      }
      const accessToken = fastify.jwt.sign(newUser.toJSON(), {
        expiresIn: "15m",
      });
      const refreshToken = fastify.jwt.sign(newUser.toJSON(), {
        expiresIn: "6h",
      });
      reply.status(201).send({
        accessToken: accessToken,
        refreshToken: refreshToken,
        name: newUser.name,
      });
    }
  );

  /* UserInfo created */
  fastify.post(
    "/userinfo",
    {
      onRequest: [fastify.authenticate],
      schema: {
        body: {
          type: "object",
          required: ["dataName", "dataValue"],
          properties: {
            dataName: { type: "string" },
            dataValue: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      const userid = request.user.id;
      const user = await User.findByPk(userid);
      if (!user) {
        reply.status(404).send({ message: "User not found" });
      } else {
        const userInfo = await UserInfo.create({
          UserId: userid,
          dataName: request.body.dataName,
          dataValue: request.body.dataValue,
        });
        console.log("\n\n\n");
        console.log(userInfo);
        console.log("\n\n\n");

        reply.status(201).send(userInfo);
      }
    }
  );

  /* EntryLog update*/
  fastify.patch(
    "/entrylog/:id",
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "integer" },
          },
        },
        body: {
          type: "object",
          properties: {
            JournalInfoId: { type: "integer" },
            dataValue: { type: "number" },
          },
        },
      },
    },
    async (request, reply) => {
      const userid = request.user.id;
      const entryLog = await EntryLog.findByPk(request.params.id);
      const journalinfo = await JournalInfo.findByPk(entryLog.JournalInfoId);
      if (journalinfo.UserId !== userid) {
        reply.status(404).send({ message: "JournalInfo not found" });
      }
      if (!entryLog) {
        reply.status(404).send({ message: "EntryLog not found" });
      } else {
        await entryLog.update(request.body);
        reply.status(201).send(entryLog);
      }
    }
  );

  //NO ilyen funkcio nincs jelenleg
  /* JournalInfo update */
  fastify.patch(
    "/journalinfo/:id",
    {
      schema: {
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "integer" },
          },
        },
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            unitOfMeasurement: { type: "string" },
            description: { type: "string" },
            UserId: { type: "integer" },
            dataType: {
              type: "string",
              enum: [
                "PhysicalActivity",
                "Nutrition",
                "Relaxation",
                "Health",
                "Mental",
              ],
            },
          },
        },
      },
    },
    async (request, reply) => {
      const journalInfo = await JournalInfo.findByPk(request.params.id);
      if (!journalInfo) {
        reply.status(404).send({ message: "JournalInfo not found" });
        return;
      }

      if (request.body.UserId) {
        const user = await User.findByPk(request.params.UserId);
        if (!user) {
          reply.status(404).send({ message: "User not found" });
          return;
        }
      }
      await journalInfo.update(request.body);
      reply.status(201).send(journalInfo);
    }
  );

  /* UserInfo update */
  fastify.patch(
    "/userinfo/:id",
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "integer" },
          },
        },
        body: {
          type: "object",
          properties: {
            UserId: { type: "integer" },
            dataName: { type: "string" },
            dataValue: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      const userInfo = await UserInfo.findByPk(request.params.id);
      if (!userInfo) {
        reply.status(404).send({ message: "UserInfo not found" });
        return;
      }
      if (request.body.UserId) {
        const user = await User.findByPk(request.body.UserId);
        if (!user) {
          reply.status(404).send({ message: "User not found" });
          return;
        }
      }
      await userInfo.update(request.body);
      reply.status(201).send(userInfo);
    }
  );

  /* User update */
  fastify.patch(
    "/user",
    {
      onRequest: [fastify.authenticate],
      schema: {
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            email: { type: "string", format: "email" },
            password: { type: "string" }, //minLength: 8, maxLength: 140
            isAdmin: { type: "boolean" },
            dateOfBirth: { type: "string", format: "date" },
            isMale: { type: "boolean" },
            height: { type: "number" },
            isMetric: { type: "boolean" },
          },
        },
      },
    },
    async (request, reply) => {
      const userid = request.user.id;
      const user = await User.findByPk(userid);
      if (!user) {
        reply.status(404).send({ message: "User not found" });
        return;
      }
      user.update(request.body);

      reply.status(201).send(user);
    }
  );

  fastify.patch(
    "/change-password",
    {
      onRequest: [fastify.authenticate],
      schema: {
        body: {
          type: "object",
          properties: {
            oldPassword: { type: "string" },
            oldPasswordAgain: { type: "string" },
            newPassword: { type: "string" },
          },
          required: ["oldPassword", "oldPasswordAgain", "newPassword"],
        },
      },
    },
    async (request, reply) => {
      const userid = request.user.id;
      const user = await User.findByPk(userid);
      if (!user) {
        reply.status(404).send({ message: "User not found" });
        return;
      }

      if (request.body.oldPassword !== request.body.oldPasswordAgain) {
        reply.status(410).send({ message: "Old passwords do not match" });
        return;
      }

      if (!bcrypt.compareSync(request.body.oldPassword, user.password)) {
        reply.status(411).send({ message: "Old password is incorrect" });
        return;
      }

      const hashedPassword = bcrypt.hashSync(request.body.newPassword, 10);
      await user.update({ password: hashedPassword });
      reply.status(201).send({ message: "Password changed successfully" });
    }
  );

  //NO
  /* Delete User by its id, delete the users JournalInfo and EntryLogs */
  fastify.delete(
    "/user",
    {
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      const user = await User.findByPk(request.user.id);
      if (!user) {
        reply.status(404).send({ message: "User not found" });
      }
      const infoIds = await JournalInfo.findAll({
        attributes: ["id"],
        where: { UserId: user.id },
      });

      //delete EntryLogs
      await EntryLog.destroy({
        where: {
          JournalInfoId: infoIds.map((info) => info.id),
        },
      });

      //delete JournalInfos
      await JournalInfo.destroy({ where: { UserId: user.id } });

      //delete User
      await User.destroy({ where: { id: user.id } });

      reply.code(204).send({
        message: "User with ID " + user.id + " deleted successfully",
      });
    }
  );

  /* Delete JournalInfo and the belonging EntryLogs */
  fastify.delete(
    "/journalinfo/:id",
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "integer" },
          },
        },
      },
    },
    async (request, reply) => {
      const userid = request.user.id;
      const user = await User.findByPk(userid);
      if (!user) {
        reply.status(404).send({ message: "User not found" });
      }
      const journalinfo = await JournalInfo.findAll({
        where: {
          UserId: userid,
          id: request.params.id,
        },
      });

      //const journalinfo = await JournalInfo.findByPk(request.params.id);
      if (!journalinfo) {
        reply.status(404).send({ message: "JournalInfo not found" });
        return;
      }
      //delete EntryLogs
      await EntryLog.destroy({
        where: { JournalInfoId: request.params.id },
      });
      //delete JournalInfo
      await JournalInfo.destroy({
        where: {
          id: request.params.id,
        },
      });

      reply.send({
        message:
          "JournalInfo with ID " + request.params.id + " deleted successfully",
      });
    }
  );

  /* Delete EntryLog */
  fastify.delete(
    "/entrylog/:id",
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "integer" },
          },
        },
      },
    },
    async (request, reply) => {
      const userid = request.user.id;

      const entrylog = await EntryLog.findByPk(request.params.id);
      if (!entrylog) {
        reply.status(404).send({ message: "EntryLog not found" });
      }

      const journalInfoByUser = await JournalInfo.findAll({
        where: { UserId: userid },
      });

      const journalInfoIds = journalInfoByUser.map(
        (journalInfo) => journalInfo.id
      );
      if (!journalInfoIds.includes(entrylog.JournalInfoId)) {
        reply.status(404).send({ message: "EntryLog not found" });
      }

      //delete EntryLogs
      await EntryLog.destroy({
        where: {
          id: request.params.id,
        },
      });

      reply.send({
        message:
          "EntryLog with ID " + request.params.id + " deleted successfully",
      });
    }
  );

  /* Delete UserInfo */
  fastify.delete(
    "/userinfo/:id",
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "integer" },
          },
        },
      },
    },
    async (request, reply) => {
      console.log("\n\n\n");
      console.log(request.params.id);
      console.log("\n\n\n");
      const userid = request.user.id;
      const user = await User.findByPk(userid);
      if (!user) {
        reply.status(404).send({ message: "User not found" });
      }

      const userInfo = await UserInfo.findAll({
        where: {
          UserId: userid,
          id: request.params.id,
        },
      });
      if (!userInfo) {
        reply.status(404).send({ message: "UserInfo not found" });
      }
      //delete UserInfo
      await UserInfo.destroy({
        where: {
          id: request.params.id,
        },
      });

      reply.send({
        message:
          "UserInfo with ID " + request.params.id + " deleted successfully",
      });
    }
  );

  return fastify; // Return the configured instance
};
