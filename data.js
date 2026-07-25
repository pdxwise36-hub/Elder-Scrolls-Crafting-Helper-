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
  var MOTIFS = [
    // Racial styles
    { name: "Breton", stone: "Molybdenum" },
    { name: "Redguard", stone: "Starmetal" },
    { name: "Orc", stone: "Manganese" },
    { name: "Dark Elf", stone: "Obsidian" },
    { name: "Nord", stone: "Corundum" },
    { name: "Argonian", stone: "Flint" },
    { name: "High Elf", stone: "Adamantite" },
    { name: "Wood Elf", stone: "Bone" },
    { name: "Khajiit", stone: "Moonstone" },
    { name: "Imperial", stone: "Nickel" },
    // Core / faction styles
    { name: "Ancient Elf", stone: "Palladium" },
    { name: "Barbaric", stone: null },
    { name: "Primal", stone: null },
    { name: "Daedric", stone: "Daedra Heart" },
    { name: "Dwemer", stone: "Dwemer Frame" },
    { name: "Glass", stone: "Malachite" },
    { name: "Xivkyn", stone: "Charcoal of Remorse" },
    { name: "Akaviri", stone: "Goldscale" },
    { name: "Mercenary", stone: null },
    { name: "Soul-Shriven", stone: "Azure Plasm" },
    { name: "Ancient Orc", stone: null },
    { name: "Yokudan", stone: null },
    { name: "Ancestral High Elf", stone: null },
    { name: "Ancestral Nord", stone: null },
    { name: "Ancestral Orc", stone: null },
    // Guild / world styles
    { name: "Thieves Guild", stone: null },
    { name: "Dark Brotherhood", stone: null },
    { name: "Outlaw", stone: null },
    { name: "Order of the Hour", stone: null },
    { name: "Abah's Watch", stone: null },
    { name: "Assassin League", stone: null },
    { name: "Dro-m'Athra", stone: null },
    { name: "Ebony", stone: null },
    { name: "Draugr", stone: null },
    { name: "Bloodforge", stone: null },
    { name: "Skinchanger", stone: null },
    { name: "Silken Ring", stone: null },
    { name: "Hollowjack", stone: null },
    { name: "Grim Harlequin", stone: null },
    { name: "Pyandonean", stone: null },
    { name: "Ashlander", stone: null },
    { name: "Celestial", stone: null },
    { name: "Minotaur", stone: null },
    { name: "Ebonshadow", stone: null },
    { name: "Fang Lair", stone: null },
    { name: "Scalecaller", stone: null },
    { name: "Worm Cult", stone: null },
    { name: "Buoyant Armiger", stone: null },
    { name: "Huntsman", stone: null },
    { name: "Morag Tong", stone: null },
    { name: "Militant Ordinator", stone: null },
    { name: "Refabricated", stone: null },
    { name: "Trinimac", stone: null },
    { name: "Malacath", stone: null },
    { name: "Dwarven", stone: null },
    { name: "Sapiarch", stone: null },
    { name: "Dead-Water", stone: null },
    { name: "Honor Guard", stone: null },
    { name: "Welkynar", stone: null },
    { name: "Dremora", stone: null },
    { name: "Silver Dawn", stone: null },
    { name: "Order of Diagna", stone: null },
    { name: "Coldsnap", stone: null },
    { name: "Sunspire", stone: null },
    { name: "Frostcaster", stone: null },
    { name: "Apostle", stone: null },
    { name: "Meridian", stone: null }
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
