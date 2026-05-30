(function () {
  const scriptSrc = document.currentScript && document.currentScript.src
    ? document.currentScript.src
    : window.location.href;
  const baseUrl = new URL(".", scriptSrc);
  const spriteZoom = 1.08;

  const atlasDefinitions = [
    {
      id: "charactersAnimals",
      file: "characters-animals-atlas.png",
      cols: 5,
      rows: 5,
      words: [
        "castle", "king", "queen", "prince", "princess",
        "knight", "wizard", "witch", "dragon", "goblin",
        "elf", "fairy", "giant", "hero", "villager",
        "guard", "pirate", "captain", "monster", "friend",
        "horse", "wolf", "owl", "bear", "fox"
      ]
    },
    {
      id: "natureAnimals",
      file: "nature-animals-atlas.png",
      cols: 5,
      rows: 5,
      words: [
        "cat", "dog", "bird", "fish", "rabbit",
        "forest", "tree", "flower", "grass", "river",
        "lake", "mountain", "cave", "bridge", "village",
        "farm", "road", "camp", "tower", "dungeon",
        "island", "beach", "snow", "rain", "cloud"
      ]
    },
    {
      id: "objectsFood",
      file: "objects-food-atlas.png",
      cols: 5,
      rows: 5,
      words: [
        "sword", "shield", "bow", "arrow", "helmet",
        "armor", "ring", "key", "map", "treasure",
        "gold", "coin", "chest", "book", "letter",
        "bag", "torch", "table", "chair", "window",
        "apple", "bread", "cake", "milk", "water"
      ]
    },
    {
      id: "foodMagic",
      file: "food-magic-atlas.png",
      cols: 5,
      rows: 5,
      words: [
        "cheese", "soup", "fish", "meat", "egg",
        "carrot", "potato", "candy", "juice", "tea",
        "magic", "spell", "potion", "crystal", "gem",
        "portal", "quest", "battle", "adventure", "secret",
        "danger", "victory", "team", "level", "boss"
      ]
    },
    {
      id: "actionsAdjectives",
      file: "actions-adjectives-atlas.png",
      cols: 5,
      rows: 5,
      words: [
        "run", "walk", "jump", "swim", "fly",
        "open", "close", "take", "give", "eat",
        "drink", "sleep", "read", "write", "look",
        "find", "help", "fight", "play", "listen",
        "big", "small", "fast", "slow", "good"
      ]
    },
    {
      id: "adjectivesColors",
      file: "adjectives-colors-atlas.png",
      cols: 5,
      rows: 5,
      words: [
        "bad", "happy", "sad", "strong", "weak",
        "hot", "cold", "dark", "bright", "red",
        "blue", "green", "yellow", "black", "white",
        "orange", "purple", "pink", "brown"
      ]
    },
    {
      id: "numbers",
      file: "numbers-atlas.png",
      cols: 5,
      rows: 2,
      words: [
        "one", "two", "three", "four", "five",
        "six", "seven", "eight", "nine", "ten"
      ]
    },
    {
      id: "grammarPronounsPrepositions",
      file: "grammar-pronouns-prepositions-atlas.png",
      cols: 5,
      rows: 5,
      words: [
        "seven", "eight", "nine", "ten", "I",
        "you", "he", "she", "we", "they",
        "my", "your", "his", "her", "this",
        "that", "here", "there", "in", "on",
        "under", "behind", "near", "with", "and"
      ]
    },
    {
      id: "grammarQuestions",
      file: "grammar-questions-atlas.png",
      cols: 4,
      rows: 4,
      words: [
        "but", "can", "cannot", "is",
        "are", "the", "a", "an",
        "what", "where", "who", "when",
        "why", "how", "book", "letter"
      ]
    }
  ];

  function normalizeWord(word) {
    return String(word || "").trim().toLowerCase();
  }

  const atlases = {};
  const words = {};

  atlasDefinitions.forEach((definition) => {
    const atlas = {
      id: definition.id,
      src: new URL(definition.file, baseUrl).href,
      cols: definition.cols,
      rows: definition.rows,
      words: definition.words.slice()
    };

    atlases[definition.id] = atlas;

    definition.words.forEach((word, index) => {
      const key = normalizeWord(word);
      if (words[key]) return;

      words[key] = {
        word,
        atlas: definition.id,
        src: atlas.src,
        cols: definition.cols,
        rows: definition.rows,
        index,
        col: index % definition.cols,
        row: Math.floor(index / definition.cols)
      };
    });
  });

  function find(word) {
    return words[normalizeWord(word)] || null;
  }

  function backgroundPosition(icon) {
    const x = icon.cols === 1
      ? 50
      : ((0.5 - spriteZoom * (icon.col + 0.5)) / (1 - icon.cols * spriteZoom)) * 100;
    const y = icon.rows === 1
      ? 50
      : ((0.5 - spriteZoom * (icon.row + 0.5)) / (1 - icon.rows * spriteZoom)) * 100;
    return `${x}% ${y}%`;
  }

  function styleFor(word) {
    const icon = find(word);
    if (!icon) return "";

    return [
      `background-image:url("${icon.src}")`,
      `background-size:${icon.cols * spriteZoom * 100}% ${icon.rows * spriteZoom * 100}%`,
      `background-position:${backgroundPosition(icon)}`,
      "background-repeat:no-repeat",
      "background-origin:content-box",
      "background-clip:content-box",
      "background-color:#fff4c7",
      "border:2px solid #7d4a1c",
      "padding:2px",
      "box-sizing:border-box",
      "box-shadow:0 3px 0 rgba(72,34,9,.22)"
    ].join(";");
  }

  function escapeAttribute(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function markup(word, options = {}) {
    const icon = find(word);
    if (!icon) return "";

    const className = options.className || "kingdom-vocab-icon";
    const label = escapeAttribute(normalizeWord(word));
    const style = styleFor(word);

    return `<span class="${escapeAttribute(className)}" role="img" aria-label="${label}" style="${style}"></span>`;
  }

  function createIcon(word, options = {}) {
    const icon = find(word);
    const element = document.createElement("span");
    const className = options.className ? `kingdom-vocab-icon ${options.className}` : "kingdom-vocab-icon";
    const size = options.size || "64px";

    element.className = className;
    element.style.display = options.display || "inline-block";
    element.style.width = typeof size === "number" ? `${size}px` : size;
    element.style.aspectRatio = "1 / 1";
    element.style.verticalAlign = "middle";
    element.style.backgroundRepeat = "no-repeat";
    element.style.backgroundOrigin = "content-box";
    element.style.backgroundClip = "content-box";
    element.style.backgroundColor = options.backgroundColor || "#fff4c7";
    element.style.border = options.border || "2px solid #7d4a1c";
    element.style.padding = options.padding || "2px";
    element.style.boxSizing = "border-box";
    element.style.boxShadow = options.boxShadow || "0 3px 0 rgba(72,34,9,.22)";
    element.style.borderRadius = options.borderRadius || "14%";
    element.setAttribute("role", "img");
    element.setAttribute("aria-label", normalizeWord(word));

    if (!icon) {
      element.dataset.missingVocabIcon = normalizeWord(word);
      return element;
    }

    element.style.backgroundImage = `url("${icon.src}")`;
    element.style.backgroundSize = `${icon.cols * spriteZoom * 100}% ${icon.rows * spriteZoom * 100}%`;
    element.style.backgroundPosition = backgroundPosition(icon);

    return element;
  }

  window.KINGDOM_VOCAB_ICONS = {
    atlases,
    words,
    find,
    styleFor,
    markup,
    createIcon
  };
}());
