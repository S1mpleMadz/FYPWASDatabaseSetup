// Imports --------------------------------
import express from "express";
import database from "./database.js";

// Configure express app ------------------
const app = new express();

// Configure middleware -------------------

// Controllers ----------------------------

const usersPositionController = async (req, res) => {};

const usersTypeController = async (req, res) => {
  const id = req.params.utid;

  // Build SQL

  const table = "Users";
  const whereField = "Users.UserTypeID";
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
  ];
  const extendedTable = `${table}
    LEFT JOIN UserTypes ON Users.UserTypeID = UserTypes.UserTypeID
    LEFT JOIN Positions ON Users.PositionID = Positions.PositionID
    LEFT JOIN Departments ON Users.DepartmentID = Departments.DepartmentID
    LEFT JOIN WorkStatus ON Users.WorkStatusID = WorkStatus.WorkStatusID`;

  // FIX: Add the new fields from the joined tables
  const extendedFields = `${fields.join(", ")},
    TypeName AS UserTypeName,
    PositionName,
    DepartmentName,
    WorkTypeName`;

  const sql = `SELECT ${extendedFields} FROM ${extendedTable}  WHERE ${whereField}=${id} `;

  // Execute Query

  let isSuccess = false;

  let message = "";

  let result = null;

  try {
    [result] = await database.query(sql);

    if (result.length === 0) message = "No records(s) found";
    else {
      isSuccess = true;
      message = "record(s) successfully recovered";
    }
  } catch (error) {
    message = `Faield to execute query: ${error.message}`;
  }

  // responses

  isSuccess ? res.status(200).json(result) : res.status(400).json({ message });
};

const usersController = async (req, res) => {
  const id = req.params.uid;

  // Build SQL

  const table = "Users";
  const whereField = "UserID";
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
  ];
  const extendedTable = `${table}
    LEFT JOIN UserTypes ON Users.UserTypeID = UserTypes.UserTypeID
    LEFT JOIN Positions ON Users.PositionID = Positions.PositionID
    LEFT JOIN Departments ON Users.DepartmentID = Departments.DepartmentID
    LEFT JOIN WorkStatus ON Users.WorkStatusID = WorkStatus.WorkStatusID`;

  // FIX: Add the new fields from the joined tables
  const extendedFields = `${fields.join(", ")},
    TypeName AS UserTypeName,
    PositionName,
    DepartmentName,
    WorkTypeName`;

  let sql = `SELECT ${extendedFields} FROM ${extendedTable}`;

  if (id) sql += ` WHERE ${whereField}=${id} `;

  // Execute Query

  let isSuccess = false;

  let message = "";

  let result = null;

  try {
    [result] = await database.query(sql);

    if (result.length === 0) message = "No records(s) found";
    else {
      isSuccess = true;
      message = "record(s) successfully recovered";
    }
  } catch (error) {
    message = `Faield to execute query: ${error.message}`;
  }

  // responses

  isSuccess ? res.status(200).json(result) : res.status(400).json({ message });
};

// Endpoints ------------------------------

app.get("/api/users", usersController);

app.get("/api/users/:uid", usersController);

app.get("/api/users/type/:utid", usersTypeController);

app.get("/api/users/position/:pid", usersPositionController);

// Start server ---------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
