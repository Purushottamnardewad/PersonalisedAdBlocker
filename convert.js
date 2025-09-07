const fs = require("fs");

const inputFile = "easylist.txt";
const outputFile = "easylist.json";

let idCounter = 1;
function createRule(pattern) {
  return {
    id: idCounter++,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: pattern,
      resourceTypes: ["script", "image", "xmlhttprequest", "sub_frame"]
    }
  };
}

const rawData = fs.readFileSync(inputFile, "utf8").split("\n");

let rules = [];
rawData.forEach(line => {
  line = line.trim();
  if (!line || line.startsWith("!")) return;

  if (line.startsWith("||")) {
    let domain = line.replace("||", "").replace("^", "");
    rules.push(createRule(`*://${domain}/*`));
  } else if (/^[a-z0-9.-]+\.[a-z]{2,}$/.test(line)) {
    rules.push(createRule(`*://${line}/*`));
  }
});

fs.writeFileSync(outputFile, JSON.stringify(rules, null, 2));
console.log(`✅ Converted ${rules.length} rules to ${outputFile}`);