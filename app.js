// Imports --------------------------------
import express from "express";
import database from "./database.js";

// Configure express app ------------------
const app = new express();

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure middleware -------------------

// Controllers ----------------------------

//    ---------------------------- GET ----------------------------
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

// USER
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

const getUsersController = async (res, id, variant) => {
  // Build SQL
  const sql = buildUsersSelectSql(id, variant);

  // Validate request

  // Access Data
  const { isSuccess, result, message } = await read(sql);
  if (!isSuccess) return res.status(400).json({ message });

  // responses
  res.status(200).json(result);
};

// TYPES

const buildTypesSelectSql = (id, variant) => {
  let sql = "";
  const table = `UserTypes`;

  const fields = ["UserTypeID", "TypeName", "TypeDescription"];

  switch (variant) {
    default:
      sql = `SELECT ${fields} FROM ${table}`;
      if (id) sql += ` WHERE usertypes.UserTypeID=${id} `;
  }

  return sql;
};

const getTypesController = async (res, id, variant) => {
  // Build SQL
  const sql = buildTypesSelectSql(id, variant);

  // Validate request

  // Access Data
  const { isSuccess, result, message } = await read(sql);
  if (!isSuccess) return res.status(400).json({ message });

  // responses
  res.status(200).json(result);
};

// WORK Status

const buildWorkStatusSelectSql = (id, variant) => {
  let sql = "";
  const table = `WorkStatus`;

  const fields = ["WorkStatusID", "WorkTypeName", "WorkTypeDetail"];

  switch (variant) {
    default:
      sql = `SELECT ${fields} FROM ${table}`;
      if (id) sql += ` WHERE workstatus.WorkStatusID=${id} `;
  }

  return sql;
};

const getWorkStatusController = async (res, id, variant) => {
  // Build SQL
  const sql = buildWorkStatusSelectSql(id, variant);

  // Validate request

  // Access Data
  const { isSuccess, result, message } = await read(sql);
  if (!isSuccess) return res.status(400).json({ message });

  // responses
  res.status(200).json(result);
};

// Position

const buildPositionSelectSql = (id, variant) => {
  let sql = "";
  const table = `Positions`;

  const fields = ["PositionID", "PositionName", "PositionDescription"];

  switch (variant) {
    default:
      sql = `SELECT ${fields} FROM ${table}`;
      if (id) sql += ` WHERE positions.PositionID=${id} `;
  }

  return sql;
};

const getPositionController = async (res, id, variant) => {
  // Build SQL
  const sql = buildPositionSelectSql(id, variant);

  // Validate request

  // Access Data
  const { isSuccess, result, message } = await read(sql);
  if (!isSuccess) return res.status(400).json({ message });

  // responses
  res.status(200).json(result);
};

// Departments

const buildDepartmentsSelectSql = (id, variant) => {
  let sql = "";
  const table = `Departments`;

  const fields = ["DepartmentID", "DepartmentName", "DepartmentDesciption"];

  switch (variant) {
    default:
      sql = `SELECT ${fields} FROM ${table}`;
      if (id) sql += ` WHERE departments.DepartmentID=${id} `;
  }

  return sql;
};

const getDepartmentsController = async (res, id, variant) => {
  // Build SQL
  const sql = buildDepartmentsSelectSql(id, variant);

  // Validate request

  // Access Data
  const { isSuccess, result, message } = await read(sql);
  if (!isSuccess) return res.status(400).json({ message });

  // responses
  res.status(200).json(result);
};

//    ----------------------------  POST ------------------------------

const buildSetFields = (fields) =>
  fields.reduce(
    (setSQL, field, index) =>
      setSQL + `${field}=:${field}` + (index === fields.length - 1 ? "" : ", "),
    "SET "
  );

const buildUsersInsertSql = (record) => {
  let table = "Users";
  let mutableFields = [
    "UserTitle",
    "UserFirstname",
    "UserLastname",
    "UserEmail",
    "UserImageURL",
    "UserTypeID",
    "PositionID",
    "DepartmentID",
    "WorkStatusID",
  ];

  return `INSERT INTO ${table} ` + buildSetFields(mutableFields);
};

const createUsers = async (sql, record) => {
  try {
    const status = await database.query(sql, record);

    const recoveredRecordSql = buildUsersSelectSql(status[0].insertId, null);

    const { isSuccess, result, message } = await read(recoveredRecordSql);

    return isSuccess
      ? {
          isSuccess: true,
          result: result,
          message: "Record successfully created",
        }
      : {
          isSuccess: false,
          result: null,
          message: ` failed to recover inserted record: ${message}`,
        };
  } catch (error) {
    return {
      isSuccess: false,
      result: null,
      message: `Failed to execute query: ${error.message}`,
    };
  }
};

const postUsersController = async (req, res) => {
  // Build SQL
  const sql = buildUsersInsertSql(req.body);

  // Validate request

  // Access Data
  const { isSuccess, result, message } = await createUsers(sql, req.body);
  if (!isSuccess) return res.status(404).json({ message });

  // responses
  res.status(201).json(result);
};

//  PUT

// DELETE

// Endpoints ------------------------------
// GET

// User
app.get("/api/users", (req, res) => getUsersController(res, null, null));

app.get("/api/users/:id", (req, res) =>
  getUsersController(res, req.params.id, null)
);

app.get("/api/users/type/:id", (req, res) =>
  getUsersController(res, req.params.id, "Type")
);

app.get("/api/users/position/:id", (req, res) =>
  getUsersController(res, req.params.id, "Position")
);

app.get("/api/users/department/:id", (req, res) =>
  getUsersController(res, req.params.id, "Department")
);

app.get("/api/users/workstatus/:id", (req, res) =>
  getUsersController(res, req.params.id, "WorkStatus")
);

// Types
app.get("/api/types", (req, res) => getTypesController(res, null, null));

app.get("/api/types/:id", (req, res) =>
  getTypesController(res, req.params.id, null)
);

// Work status
app.get("/api/workstatus", (req, res) =>
  getWorkStatusController(res, null, null)
);

app.get("/api/workstatus/:id", (req, res) =>
  getWorkStatusController(res, req.params.id, null)
);

// Positions
app.get("/api/positions", (req, res) => getPositionController(res, null, null));

app.get("/api/positions/:id", (req, res) =>
  getPositionController(res, req.params.id, null)
);

// Departments
app.get("/api/departments", (req, res) =>
  getDepartmentsController(res, null, null)
);

app.get("/api/departments/:id", (req, res) =>
  getDepartmentsController(res, req.params.id, null)
);

// POST API

// User
app.post("/api/users", postUsersController);

// Start server ---------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
