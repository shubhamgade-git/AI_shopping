const fs = require("fs");
const path = require("path");

function saveJson(data) {

    const folder = path.join(__dirname, "..", "output");

    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
    }

    const file = path.join(folder, "products.json");

    fs.writeFileSync(
        file,
        JSON.stringify(data, null, 2)
    );

    console.log("Saved JSON:", file);

}

module.exports = saveJson;