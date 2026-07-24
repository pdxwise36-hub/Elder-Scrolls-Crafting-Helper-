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
  var WEAPON_TRAITS = [
    { name: "Powered", effect: "Increases healing done" },
    { name: "Charged", effect: "Increases chance to apply status effects" },
    { name: "Precise", effect: "Increases Weapon & Spell Critical" },
    { name: "Infused", effect: "Boosts weapon enchant & reduces its cooldown" },
    { name: "Defending", effect: "Increases Physical & Spell Resistance" },
    { name: "Training", effect: "Increases experience gained from kills" },
    { name: "Sharpened", effect: "Increases Physical & Spell Penetration" },
    { name: "Decisive", effect: "Increases Ultimate generation" },
    { name: "Nirnhoned", effect: "Increases Weapon & Spell Damage" }
  ];

  var ARMOR_TRAITS = [
    { name: "Sturdy", effect: "Reduces the cost of blocking" },
    { name: "Impenetrable", effect: "Increases Critical Resistance & durability" },
    { name: "Reinforced", effect: "Increases the armor value of the item" },
    { name: "Well-fitted", effect: "Reduces sprint & roll dodge cost" },
    { name: "Training", effect: "Increases experience gained from kills" },
    { name: "Infused", effect: "Increases the armor enchantment effect" },
    { name: "Invigorating", effect: "Increases Health, Magicka & Stamina recovery" },
    { name: "Divines", effect: "Increases the effect of your Mundus Stone" },
    { name: "Nirnhoned", effect: "Increases Physical & Spell Resistance" }
  ];

  var JEWELRY_TRAITS = [
    { name: "Arcane", effect: "Increases Maximum Magicka" },
    { name: "Healthy", effect: "Increases Maximum Health" },
    { name: "Robust", effect: "Increases Maximum Stamina" },
    { name: "Triune", effect: "Increases Max Magicka, Health & Stamina" },
    { name: "Infused", effect: "Increases the jewelry enchantment effect" },
    { name: "Protective", effect: "Increases Physical & Spell Resistance" },
    { name: "Swift", effect: "Increases Movement Speed" },
    { name: "Harmony", effect: "Increases synergy effectiveness" },
    { name: "Bloodthirsty", effect: "More damage vs. enemies below 90% health" }
  ];

  // -------------------------------------------------------------------------
  // Crafts -> item groups -> item types
  // Each item type researches traits independently.
  // -------------------------------------------------------------------------
  var CRAFTS = [
    {
      id: "blacksmithing",
      name: "Blacksmithing",
      passive: "Metallurgy",
      groups: [
        {
          name: "Weapons",
          traits: "weapon",
          items: ["Dagger", "Sword", "Mace", "Axe", "Greatsword", "Battle Axe", "Maul"]
        },
        {
          name: "Heavy Armor",
          traits: "armor",
          items: ["Helm", "Cuirass", "Pauldron", "Gauntlets", "Girdle", "Greaves", "Sabatons"]
        }
      ]
    },
    {
      id: "clothing",
      name: "Clothing",
      passive: "Stitching",
      groups: [
        {
          name: "Light Armor",
          traits: "armor",
          items: ["Hat", "Robe", "Epaulets", "Gloves", "Sash", "Breeches", "Shoes"]
        },
        {
          name: "Medium Armor",
          traits: "armor",
          items: ["Helmet", "Jack", "Arm Cops", "Bracers", "Belt", "Guards", "Boots"]
        }
      ]
    },
    {
      id: "woodworking",
      name: "Woodworking",
      passive: "Carpentry",
      groups: [
        {
          name: "Weapons",
          traits: "weapon",
          items: ["Bow", "Inferno Staff", "Ice Staff", "Lightning Staff", "Restoration Staff"]
        },
        {
          name: "Shield",
          traits: "armor",
          items: ["Shield"]
        }
      ]
    },
    {
      id: "jewelry",
      name: "Jewelry Crafting",
      passive: "Lapidary Research",
      groups: [
        {
          name: "Jewelry",
          traits: "jewelry",
          items: ["Ring", "Necklace"]
        }
      ]
    }
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
    CRAFTS: CRAFTS,
    baseResearchHours: baseResearchHours,
    traitsFor: traitsFor
  };
})(typeof window !== "undefined" ? window : this);
