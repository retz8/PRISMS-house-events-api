const fs = require("fs");

const readXlsxFile = require("read-excel-file/node");
const {
  albemarle_sl,
  albemarle_fl,
  lambert_sl,
  lambert_fl,
  hobler_fl,
  hobler_sl,
  ettl_fl,
  ettl_sl,
} = require("../config/houseLeaders");

const cols = {
  AlbemarleGrade: "AlbemarleGrade",
  Albemarle: "Albemarle",
  LambertGrade: "LambertGrade",
  Lambert: "Lambert",
  HoblerGrade: "HoblerGrade",
  Hobler: "Hobler",
  EttlGrade: "EttlGrade",
  Ettl: "Ettl",
};

const createBaseInfoMap = () => {
  readXlsxFile("./assets/HouseRosters.xlsx").then((rows) => {
    const myMap = new Map();
    let jsonData = [];
    for (let i = 0; i < rows.length; i++) {
      if (i != 0) {
        const inputData = {
          AlbemarleGrade: rows[i][0],
          Albemarle: rows[i][1],
          LambertGrade: rows[i][2],
          Lambert: rows[i][3],
          HoblerGrade: rows[i][4],
          Hobler: rows[i][5],
          EttlGrade: rows[i][6],
          Ettl: rows[i][7],
        };
        jsonData.push(inputData);
      }
    }

    for (const [key, value] of Object.entries(jsonData)) {
      const albemarlePerson = value["Albemarle"];
      const albemarleGrade = value["AlbemarleGrade"].toString();
      const lambertPerson = value["Lambert"];
      const lambertGrade = value["LambertGrade"].toString();
      const hoblerPerson = value["Hobler"];
      const hoblerGrade = value["HoblerGrade"].toString();
      const ettlPerson = value["Ettl"];
      const ettlGrade = value["EttlGrade"].toString();
      if (albemarlePerson !== null) {
        let albemarleEmail = "";
        if (!albemarleGrade.includes("F") && !albemarleGrade.includes("S")) {
          albemarleEmail = albemarlePerson.includes("(")
            ? albemarlePerson
                .toLowerCase()
                .split(/[()]/)
                .map((s, i) => (i === 1 || i === 2 ? s.replace(" ", "") : null))
                .join(".")
                .replace(/^\./, "") + "@prismsus.org"
            : albemarlePerson.toLowerCase().replace(/\s+/g, ".") +
              "@prismsus.org";
          if (albemarleEmail === albemarle_sl)
            myMap.set(
              albemarleEmail,
              `${albemarleGrade} HouseLeader Albemarle`
            );
          else myMap.set(albemarleEmail, `${albemarleGrade} Student Albemarle`);
        } else {
          if (albemarlePerson === albemarle_fl)
            myMap.set(
              albemarlePerson.split(" ")[1],
              `Faculty HouseLeader Albemarle`
            );
          else
            myMap.set(
              albemarlePerson.split(" ")[1],
              `Faculty Faculty Albemarle`
            );
        }
      }
      if (lambertPerson !== null) {
        let lambertEmail = "";
        if (!lambertGrade.includes("F") && !lambertGrade.includes("S")) {
          lambertEmail = lambertPerson.includes("(")
            ? lambertPerson
                .toLowerCase()
                .split(/[()]/)
                .map((s, i) => (i === 1 || i === 2 ? s.replace(" ", "") : null))
                .join(".")
                .replace(/^\./, "") + "@prismsus.org"
            : lambertPerson.toLowerCase().replace(/\s+/g, ".") +
              "@prismsus.org";
          if (lambertEmail === lambert_sl)
            myMap.set(lambertEmail, `${lambertGrade} HouseLeader Lambert`);
          else myMap.set(lambertEmail, `${lambertGrade} Student Lambert`);
        } else {
          if (lambertPerson === lambert_fl)
            myMap.set(
              lambertPerson.split(" ")[1],
              `Faculty HouseLeader Lambert`
            );
          else
            myMap.set(lambertPerson.split(" ")[1], `Faculty Faculty Lambert`);
        }
      }
      if (hoblerPerson !== null) {
        let hoblerEmail = "";
        if (!hoblerGrade.includes("F") && !hoblerGrade.includes("S")) {
          hoblerEmail = hoblerPerson.includes("(")
            ? hoblerPerson
                .toLowerCase()
                .split(/[()]/)
                .map((s, i) => (i === 1 || i === 2 ? s.replace(" ", "") : null))
                .join(".")
                .replace(/^\./, "") + "@prismsus.org"
            : hoblerPerson.toLowerCase().replace(/\s+/g, ".") + "@prismsus.org";
          if (hoblerEmail === hobler_sl)
            myMap.set(hoblerEmail, `${hoblerGrade} HouseLeader Hobler`);
          else myMap.set(hoblerEmail, `${hoblerGrade} Student Hobler`);
        } else {
          if (hoblerPerson === hobler_fl)
            myMap.set(hoblerPerson.split(" ")[1], `Faculty HouseLeader Hobler`);
          else myMap.set(hoblerPerson.split(" ")[1], `Faculty Faculty Hobler`);
        }
      }
      if (ettlPerson !== null) {
        let ettlEmail = "";
        if (!ettlGrade.includes("F") && !ettlGrade.includes("S")) {
          ettlEmail = ettlPerson.includes("(")
            ? ettlPerson
                .toLowerCase()
                .split(/[()]/)
                .map((s, i) => (i === 1 || i === 2 ? s.replace(" ", "") : null))
                .join(".")
                .replace(/^\./, "") + "@prismsus.org"
            : ettlPerson.toLowerCase().replace(/\s+/g, ".") + "@prismsus.org";
          if (ettlEmail === ettl_sl)
            myMap.set(ettlEmail, `${ettlGrade} HouseLeader Ettl`);
          else myMap.set(ettlEmail, `${ettlGrade} Student Ettl`);
        } else {
          if (ettlPerson === ettl_fl)
            myMap.set(ettlPerson.split(" ")[1], `Faculty HouseLeader Ettl`);
          else myMap.set(ettlPerson.split(" ")[1], `Faculty Faculty Ettl`);
        }
      }
    }
    const mapObj = Object.fromEntries(myMap);
    // Convert object to JSON string
    const jsonString = JSON.stringify(mapObj);
    // Write JSON string to file
    fs.writeFileSync("./config/myMap.json", jsonString);
  });
};

const createBaseInfoMapTest = () => {
  console.log("check");
};

module.exports = createBaseInfoMapTest;

// module.exports = createBaseInfoMap;
