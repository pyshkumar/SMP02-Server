require("dotenv").config();
const oracledb = require("oracledb");

console.log("hello from db");

let pool;
let poolInitialized = false;

async function initialize() {
  try {
    pool = await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SID}`,
    });
    poolInitialized = true;
    console.log("Oracle DB connection pool started");
  } catch (err) {
    console.error("init() error: " + err.message);
  }
}

const waitForPoolInitialization = () => {
  return new Promise((resolve) => {
    const checkPool = setInterval(() => {
      if (poolInitialized) {
        clearInterval(checkPool);
        resolve();
      }
    }, 100);
  });
};

const query = async (sql, params = []) => {
  let connection;
  try {
    if (!poolInitialized) {
      await waitForPoolInitialization();
    }
    connection = await pool.getConnection();
    const result = await connection.execute(sql, params, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });
    await connection.commit();
    return result.rows;
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
};

initialize();

module.exports = {
  query,
};
