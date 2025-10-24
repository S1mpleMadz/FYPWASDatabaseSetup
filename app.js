// Imports --------------------------------
import express from "express";
import database from "./database.js";

// Configure express app ------------------
const app = new express();

// Configure middleware -------------------

// Controllers ----------------------------

const buildUsersSelectSql = (id, variant) => {
  let sql = "";
  const table = `Users
  LEFT JOIN UserTypes ON Users.UserTypeID = UserTypes.UserTypeID
  LEFT JOIN Positions ON Users.PositionID = Positions.PositionID
  LEFT JOIN Departments ON Users.DepartmentID = Departments.DepartmentID
  LEFT JOIN WorkStatus ON Users.WorkStatusID = WorkStatus.WorkStatusID`;

  const fields = [
    "UserID",
    "UserTitle",
    "UserFirstname",
    "UserLastname",
    "UserEmail",
    "UserImageURL",
    "Users.UserTypeID",
    "Users.PositionID",
    "Users.DepartmentID",
    "Users.WorkStatusID",
    "TypeName AS UserTypeName",
    "PositionName",
    "DepartmentName",
    "WorkTypeName",
  ];

  switch (variant) {
    case "Type":
      sql = `SELECT ${fields} FROM ${table} WHERE Users.UserTypeID=${id}`;
      break;

    case "Position":
      sql = `SELECT ${fields} FROM ${table} WHERE Users.PositionID=${id}`;
      break;
    case "Department":
      sql = `SELECT ${fields} FROM ${table} WHERE Users.DepartmentID=${id}`;
      break;
    case "WorkStatus":
      sql = `SELECT ${fields} FROM ${table} WHERE Users.WorkStatusID=${id}`;
      break;

    default:
      sql = `SELECT ${fields} FROM ${table}`;
      if (id) sql += ` WHERE Users.UserID=${id} `;
  }

  return sql;
};

const read = async (selectSql) => {
  try {
    const [result] = await database.query(selectSql);

    return result.length === 0
      ? { isSuccess: false, result: null, message: "No record(s) found" }
      : {
          isSuccess: true,
          result: result,
          message: "Record(s) successfully recovered",
        };
  } catch (error) {
    return {
      isSuccess: false,
      result: null,
      message: `Faield to execute query: ${error.message}`,
    };
  }
};

const getUsersController = async (req, res, variant) => {
  const id = req.params.id;

  // Build SQL
  const sql = buildUsersSelectSql(id, variant);

  // Validate request

  // Access Data
  const { isSuccess, result, message } = await read(sql);
  if (!isSuccess) return res.status(404).json({ message });

  // responses
  res.status(200).json(result);
};

// Endpoints ------------------------------

app.get("/api/users", (req, res) => getUsersController(req, res, null));

app.get("/api/users/:id", (req, res) => getUsersController(req, res, null));

app.get("/api/users/type/:id", (req, res) =>
  getUsersController(req, res, "Type")
);

app.get("/api/users/position/:id", (req, res) =>
  getUsersController(req, res, "Position")
);

app.get("/api/users/department/:id", (req, res) =>
  getUsersController(req, res, "Department")
);

app.get("/api/users/workstatus/:id", (req, res) =>
  getUsersController(req, res, "WorkStatus")
);

// Start server ---------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
