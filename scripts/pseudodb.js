const fs = require("fs");

const DB_FILE = "db.txt";

function readStored() {
  if (fs.existsSync(`./DB/${DB_FILE}`)) {
    let content = fs.readFileSync(`./DB/${DB_FILE}`).toString();

    if (content.length > 0) {
      return Number(content);
    }
  }

  return 0;
}

function storeValue(val) {
  fs.writeFileSync(`./DB/${DB_FILE}`, String(val));
}

module.exports = {
  readStored,
  storeValue,
};
