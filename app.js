const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const databasePath = path.join(__dirname, "userData.db");
const bcrypt = require("bcrypt");
const app = express();
app.use(express.json());

let database = null;

const initializeDBAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => 
      console.log("Server Running at http://localhost:3000/");
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

app.get("/register", async (request, response) => {
    const {userName, name, password, gender, location} = request.body;
    const getUserQuery = {
        `SELECT * FROM user WHERE username = '${userName}';`;
    };
    const hashedPassword = await bcrypt.hash(request.body.password, 10);
    const databaseUser = await database.get(getUserQuery);
  if (databaseUser === undefined) {
    const createUserQuery = `
      INSERT INTO 
        user (username, name, password, gender, location) 
      VALUES 
        (
          '${username}', 
          '${name}',
          '${hashedPassword}', 
          '${gender}',
          '${location}'
        )`;
    if (password.length >=5){
    const databaseResponse = await database.run(createUserQuery);
    const newUserId = databaseResponse.lastID;
    response.send(`Created new user with ${newUserId}`);
        }else {
        response.status(400);
        response.send("Password is too short");
    }
    

  } else {
    response.status = 400;
    response.send("User already exists");
  }
});
app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}'`;
  const databaseUser = await database.get(selectUserQuery);
  if (databaseUser === undefined) {
    response.status(400);
    response.send("Invalid User");
  } else {
    const isPasswordMatched = await bcrypt.compare(password, databaseUser.password);
    if (isPasswordMatched === true) {
      response.send("Login Success!");
    } else {
      response.status(400);
      response.send("Invalid Password");
    }
  }
});
app.put("/change-password", async(request, response) => {
    const {userName, oldPassword, newPassword} = request.body;
    const selectUserQuery = `SELECT * FROM user WHERE username = '${userName}';`;
    const databaseUser = await database.get(selectUserQuery);
    if (databaseUser === undefined){
        response.status(400);
        response.send("Invalid User");
    }else {
        const isPasswordMatched = await bcrypt.compare(oldPassword,
            databaseUser.password);
        if (isPasswordMatched === true){
              if(newPassword.length >=5){
                  const hashedPassword = await bcrypt.hash(newPassword, 10);
                  const updatedPasswordQuery = `
                  UPDATED 
                    user 
                SET 
                   password = '${hashedPassword}'
                WHERE
                   username = '${username}';`;
              }else {
                  response.status(400);
                  response.send("Password is too short");
              }
        }else {
            response.status(400);
            response.send("Invalid current password");
        }
    }
}):
module.exports = app;
