const fs = require("fs");
const path = require("path");

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
      const content = fs.readFileSync(file, "utf8");
      if (content.includes("charAt(0)") || content.includes("roleTitles")) {
        results.push(file);
      }
    }
  });
  return results;
}

console.log("FILES_WITH_CHARAT:", walk("./src"));
