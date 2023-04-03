const fs = require("fs");

// Read JSON string from file
const jsonString = fs.readFileSync("./config/myMap.json", "utf8");
const obj = JSON.parse(jsonString);

function getBaseInfo(username, email) {
  console.log(`username: ${username} email: ${email}`);
  const myMap = new Map(Object.entries(obj));

  if (email === "ekkicb71@gmail.com") {
    return { grade: "Admin", role: "Admin", house: "Albemarle" };
  } else if (email === "tiger.gao@prismsus.org") {
    return { grade: "Faculty", role: "Faculty", house: "Albemarle" };
  } else if (email === "jayjames.may@prismsus.org") {
    return { grade: "Faculty", role: "HouseLeader", house: "Hobler" };
  } else if (email === "kenneth.jones@prismsus.org") {
    return { grade: "Faculty", role: "Admin", house: "None" };
  } else if (email === "adrian.lopezdenis@prismsus.org") {
    return { grade: "Faculty", role: "Faculty", house: "Ettl" };
  }

  if (myMap.has(email)) {
    // student
    const vals = myMap.get(email).split(" ");
    return { grade: vals[0], role: vals[1], house: vals[2] };
  } else {
    // faculty
    // find by last name
    if (myMap.has(username.split(" ")[1])) {
      const vals = myMap.get(username.split(" ")[1]).split(" ");
      return { grade: vals[0], role: vals[1], house: vals[2] };
    } else if (myMap.has(username.split(" ")[0])) {
      const vals = myMap.get(username.split(" ")[0]).split(" ");
      return { grade: vals[0], role: vals[1], house: vals[2] };
    } else {
      return { grade: "9", role: "Student", house: "None" };
    }
  }
}

module.exports = getBaseInfo;
