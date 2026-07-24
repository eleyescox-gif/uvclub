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
      if (file.endsWith(".tsx") || file.endsWith(".ts")) {
        const content = fs.readFileSync(file, "utf8");
        if (content.includes("বরইতলী") || content.includes("অফিসিয়াল লেনদেন বিবরণী")) {
          results.push({ file, snippet: content.substring(content.indexOf("বিবরণী") - 50, content.indexOf("বিবরণী") + 100) });
        }
      }
    }
  });
  return results;
}

console.log("Matching files:", JSON.stringify(walk("./src"), null, 2));
