/*
 * ESO Crafting Helper — game data
 *
 * All values reflect Elder Scrolls Online research mechanics.
 * Exposed as a single global `ESO` so the app works when the page is
 * opened directly from disk (file://) without ES modules.
 */
(function (global) {
  "use strict";

  // -------------------------------------------------------------------------
  // Research time progression
  // -------------------------------------------------------------------------
  // The 1st trait researched on an item type takes 6 hours. Each additional
  // trait on that *same item type* doubles the time. ESO caps any single
  // research at 30 days (720 hours), so the long tail flattens out.
  var MAX_RESEARCH_HOURS = 720; // 30 days

  // baseResearchHours(n) -> base hours for researching the n-th trait
  // (n = how many traits are already known + 1).
  function baseResearchHours(n) {
    if (n < 1) n = 1;
    var hours = 6 * Math.pow(2, n - 1);
    return Math.min(hours, MAX_RESEARCH_HOURS);
  }

  // -------------------------------------------------------------------------
  // Research-reduction passive (per craft skill line)
  // Blacksmithing = Metallurgy, Clothing = Stitching,
  // Woodworking = Carpentry, Jewelry = Lapidary Research.
  // Rank -> { reduction fraction, simultaneous research slots }.
  // -------------------------------------------------------------------------
  var PASSIVE_RANKS = {
    0: { reduction: 0.0, slots: 1 },
    1: { reduction: 0.05, slots: 2 },
    2: { reduction: 0.1, slots: 2 },
    3: { reduction: 0.2, slots: 3 },
    4: { reduction: 0.25, slots: 3 }
  };

  // ESO Plus membership reduces research time by 10%, stacking
  // multiplicatively with the crafting passive.
  var ESO_PLUS_REDUCTION = 0.1;

  // -------------------------------------------------------------------------
  // Trait sets
  // -------------------------------------------------------------------------
  // Each trait also lists the trait material (gem/stone) consumed when crafting
  // an item with that trait — 1 per item.
  var WEAPON_TRAITS = [
    { name: "Powered", effect: "Increases healing done", mat: "Chysolite" },
    { name: "Charged", effect: "Increases chance to apply status effects", mat: "Amethyst" },
    { name: "Precise", effect: "Increases Weapon & Spell Critical", mat: "Ruby" },
    { name: "Infused", effect: "Boosts weapon enchant & reduces its cooldown", mat: "Jade" },
    { name: "Defending", effect: "Increases Physical & Spell Resistance", mat: "Turquoise" },
    { name: "Training", effect: "Increases experience gained from kills", mat: "Carnelian" },
    { name: "Sharpened", effect: "Increases Physical & Spell Penetration", mat: "Fire Opal" },
    { name: "Decisive", effect: "Increases Ultimate generation", mat: "Citrine" },
    { name: "Nirnhoned", effect: "Increases Weapon & Spell Damage", mat: "Potent Nirncrux" }
  ];

  var ARMOR_TRAITS = [
    { name: "Sturdy", effect: "Reduces the cost of blocking", mat: "Quartz" },
    { name: "Impenetrable", effect: "Increases Critical Resistance & durability", mat: "Diamond" },
    { name: "Reinforced", effect: "Increases the armor value of the item", mat: "Sardonyx" },
    { name: "Well-fitted", effect: "Reduces sprint & roll dodge cost", mat: "Almandine" },
    { name: "Training", effect: "Increases experience gained from kills", mat: "Emerald" },
    { name: "Infused", effect: "Increases the armor enchantment effect", mat: "Bloodstone" },
    { name: "Invigorating", effect: "Increases Health, Magicka & Stamina recovery", mat: "Garnet" },
    { name: "Divines", effect: "Increases the effect of your Mundus Stone", mat: "Sapphire" },
    { name: "Nirnhoned", effect: "Increases Physical & Spell Resistance", mat: "Fortified Nirncrux" }
  ];

  var JEWELRY_TRAITS = [
    { name: "Arcane", effect: "Increases Maximum Magicka", mat: "Cobalt" },
    { name: "Healthy", effect: "Increases Maximum Health", mat: "Antimony" },
    { name: "Robust", effect: "Increases Maximum Stamina", mat: "Zinc" },
    { name: "Triune", effect: "Increases Max Magicka, Health & Stamina", mat: "Dawn-Prism" },
    { name: "Infused", effect: "Increases the jewelry enchantment effect", mat: "Aurbic Amber" },
    { name: "Protective", effect: "Increases Physical & Spell Resistance", mat: "Titanium" },
    { name: "Swift", effect: "Increases Movement Speed", mat: "Gilding Wax" },
    { name: "Harmony", effect: "Increases synergy effectiveness", mat: "Dibellium" },
    { name: "Bloodthirsty", effect: "More damage vs. enemies below 90% health", mat: "Slaughterstone" }
  ];

  // Quality tiers. improveIndex maps to a craft's improvement-material array.
  var QUALITIES = [
    { key: "normal", name: "Normal (White)", improveIndex: -1 },
    { key: "fine", name: "Fine (Green)", improveIndex: 0 },
    { key: "superior", name: "Superior (Blue)", improveIndex: 1 },
    { key: "epic", name: "Epic (Purple)", improveIndex: 2 },
    { key: "legendary", name: "Legendary (Gold)", improveIndex: 3 }
  ];

  // -------------------------------------------------------------------------
  // Crafts -> item groups -> item types
  // Each item type researches traits independently.
  // -------------------------------------------------------------------------
  // improvement: [ Fine(green), Superior(blue), Epic(purple), Legendary(gold) ]
  var CRAFTS = [
    {
      id: "blacksmithing",
      name: "Blacksmithing",
      passive: "Metallurgy",
      improvement: ["Honing Stone", "Dwarven Oil", "Grain Solvent", "Tempering Alloy"],
      groups: [
        {
          name: "Weapons",
          traits: "weapon",
          base: "Rubedite Ingot",
          items: ["Dagger", "Sword", "Mace", "Axe", "Greatsword", "Battle Axe", "Maul"]
        },
        {
          name: "Heavy Armor",
          traits: "armor",
          base: "Rubedite Ingot",
          items: ["Helm", "Cuirass", "Pauldron", "Gauntlets", "Girdle", "Greaves", "Sabatons"]
        }
      ]
    },
    {
      id: "clothing",
      name: "Clothing",
      passive: "Stitching",
      improvement: ["Hemming", "Embroidery", "Elegant Lining", "Dreugh Wax"],
      groups: [
        {
          name: "Light Armor",
          traits: "armor",
          base: "Ancestor Silk",
          items: ["Hat", "Robe", "Epaulets", "Gloves", "Sash", "Breeches", "Shoes"]
        },
        {
          name: "Medium Armor",
          traits: "armor",
          base: "Rubedo Leather",
          items: ["Helmet", "Jack", "Arm Cops", "Bracers", "Belt", "Guards", "Boots"]
        }
      ]
    },
    {
      id: "woodworking",
      name: "Woodworking",
      passive: "Carpentry",
      improvement: ["Pitch", "Turpen", "Mastic", "Rosin"],
      groups: [
        {
          name: "Weapons",
          traits: "weapon",
          base: "Sanded Ruby Ash",
          items: ["Bow", "Inferno Staff", "Ice Staff", "Lightning Staff", "Restoration Staff"]
        },
        {
          name: "Shield",
          traits: "armor",
          base: "Sanded Ruby Ash",
          items: ["Shield"]
        }
      ]
    },
    {
      id: "jewelry",
      name: "Jewelry Crafting",
      passive: "Lapidary Research",
      improvement: ["Terne Plating", "Iridium Plating", "Zircon Plating", "Chromium Plating"],
      groups: [
        {
          name: "Jewelry",
          traits: "jewelry",
          base: "Platinum Ounce",
          items: ["Ring", "Necklace"]
        }
      ]
    }
  ];

  // ---- Motifs -------------------------------------------------------------
  // A motif has 14 chapters, one per equipment slot. `stone` is the style
  // material consumed (1 per crafted item); left blank where it varies.
  var MOTIF_SLOTS = [
    "Axes", "Belts", "Boots", "Bows", "Chests", "Daggers", "Gloves",
    "Helmets", "Legs", "Maces", "Shields", "Shoulders", "Staves", "Swords"
  ];

  // A fuller catalogue. `stone` is filled where the style material is known;
  // where left null the app shows a generic "<motif> Style Item".
  // `src` = a short "where to find" note where reliably known (null otherwise;
  // every motif also gets a per-row lookup link in the UI).
  var MOTIFS = [
    // Racial styles — learned from racial motif books (drops / Crown Store)
    { name: "Breton", stone: "Molybdenum", src: "Racial motif (drops / Crown Store)" },
    { name: "Redguard", stone: "Starmetal", src: "Racial motif (drops / Crown Store)" },
    { name: "Orc", stone: "Manganese", src: "Racial motif (drops / Crown Store)" },
    { name: "Dark Elf", stone: "Obsidian", src: "Racial motif (drops / Crown Store)" },
    { name: "Nord", stone: "Corundum", src: "Racial motif (drops / Crown Store)" },
    { name: "Argonian", stone: "Flint", src: "Racial motif (drops / Crown Store)" },
    { name: "High Elf", stone: "Adamantite", src: "Racial motif (drops / Crown Store)" },
    { name: "Wood Elf", stone: "Bone", src: "Racial motif (drops / Crown Store)" },
    { name: "Khajiit", stone: "Moonstone", src: "Racial motif (drops / Crown Store)" },
    { name: "Imperial", stone: "Nickel", src: "Imperial Edition / Crown Store" },
    // Core / faction styles
    { name: "Ancient Elf", stone: "Palladium", src: null },
    { name: "Barbaric", stone: null, src: null },
    { name: "Primal", stone: null, src: null },
    { name: "Daedric", stone: "Daedra Heart", src: "Rare world drops" },
    { name: "Dwemer", stone: "Dwemer Frame", src: "Dwemer ruins / Crown Crates" },
    { name: "Glass", stone: "Malachite", src: null },
    { name: "Xivkyn", stone: "Charcoal of Remorse", src: "Imperial City (Tel Var / drops)" },
    { name: "Akaviri", stone: "Goldscale", src: null },
    { name: "Mercenary", stone: null, src: null },
    { name: "Soul-Shriven", stone: "Azure Plasm", src: "Cadwell (tutorial achievement)" },
    { name: "Ancient Orc", stone: null, src: null },
    { name: "Yokudan", stone: null, src: null },
    { name: "Ancestral High Elf", stone: null, src: null },
    { name: "Ancestral Nord", stone: null, src: null },
    { name: "Ancestral Orc", stone: null, src: null },
    { name: "Ancestral Reach", stone: null, src: "Antiquities (Markarth)" },
    // Justice / guild styles
    { name: "Thieves Guild", stone: null, src: "Thieves Guild DLC activities" },
    { name: "Abah's Watch", stone: null, src: "Thieves Guild DLC (Hew's Bane)" },
    { name: "Outlaw", stone: null, src: "Justice system / pickpocketing" },
    { name: "Dark Brotherhood", stone: null, src: "Dark Brotherhood DLC activities" },
    { name: "Order of the Hour", stone: null, src: "Gold Coast (Dark Brotherhood)" },
    { name: "Assassin League", stone: null, src: "Crown Store" },
    { name: "Order of Diagna", stone: null, src: "Crown Store" },
    { name: "Aldmeri Dominion", stone: null, src: "Alliance War / Crown Store" },
    { name: "Daggerfall Covenant", stone: null, src: "Alliance War / Crown Store" },
    { name: "Ebonheart Pact", stone: null, src: "Alliance War / Crown Store" },
    // Craglorn / trials
    { name: "Celestial", stone: null, src: "Craglorn" },
    { name: "Minotaur", stone: null, src: "Craglorn achievements" },
    { name: "Dro-m'Athra", stone: null, src: "Maw of Lorkhaj trial" },
    // Events
    { name: "Hollowjack", stone: null, src: "Witches Festival writs" },
    { name: "Grim Harlequin", stone: null, src: "Crown Store (Witches Festival)" },
    { name: "Skinchanger", stone: null, src: "New Life Festival event" },
    { name: "Frostcaster", stone: null, src: "New Life Festival event" },
    // Writs / crafting
    { name: "Ebony", stone: "Night Pumice", src: "Writ vouchers (~25/chapter)" },
    { name: "Nibenese", stone: null, src: "Crown Store" },
    { name: "Silver Rose", stone: null, src: "Vvardenfell / Crown Store" },
    { name: "Dark Seducer", stone: null, src: "Clockwork City / Crown Store" },
    { name: "Golden Saint", stone: null, src: "Clockwork City / Crown Store" },
    { name: "Dremora", stone: null, src: "Rewards for the Worthy (Cyrodiil)" },
    // Dungeon styles
    { name: "Silken Ring", stone: null, src: "Cradle of Shadows dungeon" },
    { name: "Mazzatun", stone: null, src: "Ruins of Mazzatun dungeon" },
    { name: "Bloodforge", stone: null, src: "Bloodroot Forge dungeon" },
    { name: "Dreadhorn", stone: null, src: "Falkreath Hold dungeon" },
    { name: "Draugr", stone: null, src: "Guild & Undaunted delve dailies" },
    { name: "Fang Lair", stone: null, src: "Fang Lair dungeon" },
    { name: "Scalecaller", stone: null, src: "Scalecaller Peak dungeon" },
    { name: "Ebonshadow", stone: null, src: "Moon Hunter Keep dungeon" },
    { name: "Huntsman", stone: null, src: "March of Sacrifices dungeon" },
    { name: "Silver Dawn", stone: null, src: "Wolfhunter DLC" },
    { name: "Honor Guard", stone: null, src: "Depths of Malatar dungeon" },
    { name: "Coldsnap", stone: null, src: "Frostvault dungeon" },
    { name: "Icereach Coven", stone: null, src: "Icereach dungeon" },
    { name: "Unfeathered", stone: null, src: "Unhallowed Grave dungeon" },
    { name: "Pyre Watch", stone: null, src: "Stonethorn DLC dungeon" },
    { name: "Nighthollow", stone: null, src: "Flames of Ambition dungeon" },
    { name: "True-Sworn", stone: null, src: "Ascending Tide dungeon" },
    // Morrowind / Vvardenfell
    { name: "Ashlander", stone: null, src: "Vvardenfell (drops)" },
    { name: "Buoyant Armiger", stone: null, src: "Vvardenfell (drops)" },
    { name: "Morag Tong", stone: null, src: "Vvardenfell (drops)" },
    { name: "Militant Ordinator", stone: null, src: "Vvardenfell (drops)" },
    // Wrothgar
    { name: "Trinimac", stone: null, src: "Wrothgar (Orsinium)" },
    { name: "Malacath", stone: "Potash", src: "Wrothgar world bosses" },
    // Clockwork City
    { name: "Refabricated", stone: null, src: "Clockwork City (drops)" },
    { name: "Apostle", stone: null, src: "Clockwork City (drops)" },
    // Summerset
    { name: "Sapiarch", stone: null, src: "Summerset (drops)" },
    { name: "Welkynar", stone: null, src: "Cloudrest trial (Summerset)" },
    { name: "Psijic", stone: null, src: "Summerset (Psijic Order)" },
    { name: "Pyandonean", stone: null, src: "Summerset (Maormer)" },
    // Murkmire
    { name: "Dead-Water", stone: null, src: "Murkmire (drops)" },
    { name: "Elder Argonian", stone: null, src: "Murkmire (drops)" },
    // Elsweyr / Dragonhold
    { name: "Anequina", stone: null, src: "Northern Elsweyr" },
    { name: "Pellitine", stone: null, src: "Southern Elsweyr" },
    { name: "Dragonguard", stone: null, src: "Elsweyr" },
    { name: "Sunspire", stone: null, src: "Sunspire trial (Elsweyr)" },
    // Greymoor / Western Skyrim
    { name: "Sea Giant", stone: null, src: "Western Skyrim (drops)" },
    { name: "Skaal Explorer", stone: null, src: "Greymoor (Antiquities)" },
    // Blackwood
    { name: "Waking Flame", stone: null, src: "Blackwood (drops)" },
    // High Isle
    { name: "Steadfast Society", stone: null, src: "High Isle (drops)" },
    { name: "Ascendant Order", stone: null, src: "High Isle (drops)" },
    { name: "House Mornard", stone: null, src: "High Isle (drops)" },
    { name: "Y'ffre's Will", stone: null, src: "High Isle (Druid)" },
    { name: "Dreadsails", stone: null, src: "Dreadsail Reef trial (High Isle)" },
    { name: "Firesong", stone: null, src: "Firesong DLC (High Isle)" },
    // Necrom
    { name: "Apocrypha", stone: null, src: "Necrom (drops)" },
    // Other
    { name: "Worm Cult", stone: null, src: null }
  ];

  // ---- Enchanting (glyphs) ------------------------------------------------
  // A glyph = 1 Potency rune + 1 Essence rune + 1 Aspect rune.
  // Aspect rune is chosen by quality; potency rune by additive/subtractive.
  var POTENCY_RUNES = { additive: "Repora", subtractive: "Itade" };
  var ASPECT_BY_QUALITY = {
    normal: "Ta",
    fine: "Jejota",
    superior: "Denata",
    epic: "Rekuta",
    legendary: "Kuta"
  };
  // slot: which item category the glyph goes on. essence: essence rune.
  var GLYPHS = [
    // Armor glyphs
    { name: "Glyph of Health", slot: "armor", essence: "Oko", potency: "additive" },
    { name: "Glyph of Magicka", slot: "armor", essence: "Makko", potency: "additive" },
    { name: "Glyph of Stamina", slot: "armor", essence: "Deni", potency: "additive" },
    { name: "Glyph of Prismatic Defense", slot: "armor", essence: "Hakeijo", potency: "additive" },
    // Weapon glyphs
    { name: "Glyph of Weapon Damage", slot: "weapon", essence: "Okori", potency: "additive" },
    { name: "Glyph of Flame Damage", slot: "weapon", essence: "Rakeipa", potency: "additive" },
    { name: "Glyph of Frost Damage", slot: "weapon", essence: "Dekeipa", potency: "additive" },
    { name: "Glyph of Shock Damage", slot: "weapon", essence: "Meip", potency: "additive" },
    { name: "Glyph of Poison Damage", slot: "weapon", essence: "Kuoko", potency: "additive" },
    { name: "Glyph of Disease Damage", slot: "weapon", essence: "Haoko", potency: "additive" },
    { name: "Glyph of Absorb Health", slot: "weapon", essence: "Oko", potency: "subtractive" },
    { name: "Glyph of Absorb Magicka", slot: "weapon", essence: "Makko", potency: "subtractive" },
    { name: "Glyph of Absorb Stamina", slot: "weapon", essence: "Deni", potency: "subtractive" },
    // Jewelry glyphs
    { name: "Glyph of Magicka Recovery", slot: "jewelry", essence: "Makkoma", potency: "additive" },
    { name: "Glyph of Stamina Recovery", slot: "jewelry", essence: "Denima", potency: "additive" },
    { name: "Glyph of Health Recovery", slot: "jewelry", essence: "Okoma", potency: "additive" },
    { name: "Glyph of Increase Physical Harm", slot: "jewelry", essence: "Taderi", potency: "additive" },
    { name: "Glyph of Increase Spell Harm", slot: "jewelry", essence: "Makderi", potency: "additive" },
    { name: "Glyph of Reduce Spell Cost", slot: "jewelry", essence: "Makko", potency: "subtractive" },
    { name: "Glyph of Reduce Feat Cost", slot: "jewelry", essence: "Deni", potency: "subtractive" }
  ];

  // Map an item's trait-kind to the glyph slot category.
  function glyphSlotFor(traitKind) {
    if (traitKind === "weapon") return "weapon";
    if (traitKind === "jewelry") return "jewelry";
    return "armor";
  }

  function traitsFor(kind) {
    if (kind === "weapon") return WEAPON_TRAITS;
    if (kind === "jewelry") return JEWELRY_TRAITS;
    return ARMOR_TRAITS;
  }

  global.ESO = {
    MAX_RESEARCH_HOURS: MAX_RESEARCH_HOURS,
    ESO_PLUS_REDUCTION: ESO_PLUS_REDUCTION,
    PASSIVE_RANKS: PASSIVE_RANKS,
    WEAPON_TRAITS: WEAPON_TRAITS,
    ARMOR_TRAITS: ARMOR_TRAITS,
    JEWELRY_TRAITS: JEWELRY_TRAITS,
    QUALITIES: QUALITIES,
    CRAFTS: CRAFTS,
    MOTIF_SLOTS: MOTIF_SLOTS,
    MOTIFS: MOTIFS,
    GLYPHS: GLYPHS,
    POTENCY_RUNES: POTENCY_RUNES,
    ASPECT_BY_QUALITY: ASPECT_BY_QUALITY,
    baseResearchHours: baseResearchHours,
    traitsFor: traitsFor,
    glyphSlotFor: glyphSlotFor
  };
})(typeof window !== "undefined" ? window : this);
