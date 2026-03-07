const fs = require("fs");
const path = require("path");
const axios = require("axios");

const API_BASE = "https://api.kzarre.com/public/pages";

// list of cms pages to generate
const pages = [
  "contact",
  "legal",
  "about",
  "returns",
  "shipping",
  "faq",
  "sustainability",
  "accessibility"
];

// build output folder
const OUTPUT_DIR = path.join(__dirname, "../build");

async function generatePages() {
  try {
    console.log("Starting CMS export...");

    for (const key of pages) {

      console.log("Fetching:", key);

      const res = await axios.get(`${API_BASE}/${key}`);

      const page = res.data.page;

      if (!page) {
        console.log("Page not found:", key);
        continue;
      }

      const sectionsHTML = page.sections
        .map(section => section.html || "")
        .join("\n");

      const html = `
<!DOCTYPE html>
<html>

<head>

<meta charset="UTF-8">
<title>${page.title}</title>

<meta name="viewport" content="width=device-width, initial-scale=1">

<link rel="stylesheet" href="/styles.css">

</head>

<body>

<header>
  <a href="/">Kzarre</a>
</header>

<main>

<h1>${page.title}</h1>

${sectionsHTML}

</main>

<footer>
© ${new Date().getFullYear()} Kzarre
</footer>

</body>

</html>
`;

      const folder = path.join(OUTPUT_DIR, key);

      fs.mkdirSync(folder, { recursive: true });

      fs.writeFileSync(
        path.join(folder, "index.html"),
        html
      );

      console.log("Generated:", key);
    }

    console.log("All CMS pages exported successfully");

  } catch (error) {
    console.error("Export failed:", error.message);
  }
}

generatePages();