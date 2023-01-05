const express = require("express");
const path = require("path");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");

const dbpath = path.join(__dirname, "userData.db");

let db = null;

const initializedbandserver = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`db error: ${e.message}`);
    process.exit(1);
  }
};
initializedbandserver();

app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedPassword = await bcrypt.hash(request.body.password, 10);
  const lengthofhash = request.body.password.length;

  const isuserpresent = `select * from user where username ="${username}"`;
  const dbres = await db.get(isuserpresent);
  if (dbres === undefined) {
    const createnewuser = `insert into(username, name, password, gender, location)
        values ("${username}","{name}","{hashedPassword}","{gender}","{location}")`;
    const dbres = await db.run(createnewuser);
    const dblast = dbres.lstID;
    response.status(200);
    response.send("User created successfully");
  } else if (dbres !== undefined && lengthofhash <= 5) {
    response.status(400);
    response.send("Password is too short");
  } else {
    response.status(400);
    response.send("User already exists");
  }
});

app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const lengthofpsw = request.body.password.length;

  const checkuser = `select * from user where username= "${username}"`;

  const dbres = await db.get(checkuser);

  if (checkuser === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else if (lengthofpsw <= 5) {
    response.status(400);
    response.send("Invalid password");
  } else {
    pswmatch = await bcrypt.compare(password, dbres.password);
    if (pswmatch === true) {
      response.send("Login success!");
    } else {
      response.send("Wrong Psw");
    }
  }
});

app.put("/change-password", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  const lengthofpsw = request.body.oldPassword.length;
  const hashedpsw = await bcrypt.hash(request.body.newPassword, 10);
  const currentuserpsw = `select * from user where username = 
    "${username}"`;
  const getpsw = await db.get(currentuserpsw);
  if (getpsw === undefined) {
    response.status(400);
    response.send(" Invalid current password");
  } else if (lengthofpsw <= 5) {
    response.status(400);
    response.send("Password is too short");
  } else {
    updatepsw = `update user 
        set 
        password = "${hashedpsw}"`;
    await db.run(updatepsw);
    response.status(200);
    response.send("Password updated");
  }
});

module.exports = app;
