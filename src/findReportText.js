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
    } else {
      if (file.endsWith(".tsx") || file.endsWith(".ts") || file.endsWith(".jsx") || file.endsWith(".js")) {
        const content = fs.readFileSync(file, "utf8");
        if (content.includes("বিবরণী") || content.includes("লেনদেন বিবরণী") || content.includes("অফিসিয়াল")) {
          results.push(file);
        }
      }
    }
  });
  return results;
}

console.log("Matching files:", walk("./src"));
