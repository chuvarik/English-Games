const fs = require("fs");
const vm = require("vm");

const html = fs.readFileSync("games/syllable-runner/index.html", "utf8");

function extractArray(name) {
  const marker = `const ${name} = [`;
  const start = html.indexOf(marker);
  const arrayStart = html.indexOf("[", start);
  let depth = 0;

  for (let index = arrayStart; index < html.length; index += 1) {
    if (html[index] === "[") depth += 1;
    if (html[index] === "]") {
      depth -= 1;
      if (depth === 0) return html.slice(arrayStart, index + 1);
    }
  }

  throw new Error(`Could not extract ${name}`);
}

const words = vm.runInNewContext(extractArray("words"));
const skins = vm.runInNewContext(extractArray("skins"));
const vocabScript = fs.readFileSync("assets/images/vocab/vocab-icons.js", "utf8");
const vocabSandbox = {
  window: {},
  document: {
    currentScript: {
      src: "file:///C:/Users/chuva/OneDrive/Desktop/English Games/assets/images/vocab/vocab-icons.js",
    },
  },
  URL,
};
vm.runInNewContext(vocabScript, vocabSandbox);
const alphabet = new Set([
  "apple", "bear", "castle", "dragon", "elf", "fairy", "guard", "hero",
  "island", "jump", "king", "lake", "magic", "near", "orange", "princess",
  "queen", "river", "sword", "tree", "under", "village", "wizard",
  "xylophone", "yellow", "zoo",
]);
const overlap = words.map((item) => item.word).filter((word) => alphabet.has(word));
const missingIcons = words
  .map((item) => item.word)
  .filter((word) => !vocabSandbox.window.KINGDOM_VOCAB_ICONS.find(word));
const scriptBlocks = [...html.matchAll(/<script(?: src="[^"]+")?>([\s\S]*?)<\/script>/g)]
  .map((match) => match[1])
  .filter(Boolean);

scriptBlocks.forEach((script) => new vm.Script(script));

console.log(JSON.stringify({
  wordCount: words.length,
  overlap,
  missingIcons,
  skins: skins.map((skin) => skin.name),
  scriptBlocks: scriptBlocks.length,
}, null, 2));
