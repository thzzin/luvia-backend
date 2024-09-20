const sequelize = require('./config/db');
const Admin = require('./models/Admin');

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    await sequelize.sync({ force: true }); // Cria as tabelas com base nos modelos
    console.log('Database synchronized.');
  } catch (error) {
    console.error('Error connecting to the database:', error);
  } finally {
    await sequelize.close();
  }
}

migrate();
