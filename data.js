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

  var MOTIFS = [
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
    { name: "Ancient Elf", stone: "Palladium" },
    { name: "Daedric", stone: "Daedra Heart" },
    { name: "Dwemer", stone: "Dwemer Frame" },
    { name: "Glass", stone: "Malachite" },
    { name: "Xivkyn", stone: "Charcoal of Remorse" }
  ];

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
    baseResearchHours: baseResearchHours,
    traitsFor: traitsFor
  };
})(typeof window !== "undefined" ? window : this);
