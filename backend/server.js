const buildFastify = require("./app");

const startServer = async () => {
  const fastify = buildFastify();

  try {
    await fastify.listen({ port: 3000 });
    console.log(`Server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

startServer();
