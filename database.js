// Imports ---------------------------
import mysql from "mysql2/promise";

// Database Connection ---------------

const dbConfig = {
  database: process.env.DB_NAME || "was",
  port: process.env.DB_PORT || 3306,
  host: process.env.DB_HOST || "localhost", // home.cattoindustries.com or  localhost
  user: process.env.DB_USER || "root", // was or root
  password: process.env.DB_PSWD || "", // ""  or Mad5C@ntC0d3f0rSh1t69
  namedPlaceholders: true,

  /*
  
  ssl: {
    // This allows connection even if you don't have the specific certificate file
    // (Commonly needed for self-hosted or cloud servers)
    rejectUnauthorized: false,
  },

  */
};

let database = null;

try {
  database = await mysql.createConnection(dbConfig);
} catch (error) {
  console.log("Error creating database connection: " + error.message);
  process.exit();
}
export default database;
