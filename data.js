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
    { name: "High Elf", num: "1", zone: "Base Game", stone: "Adamantite", src: "Random loot. Always found as the entire book." },
    { name: "Dark Elf", num: "2", zone: "Base Game", stone: "Obsidian", src: "Random loot; your race by default" },
    { name: "Wood Elf", num: "3", zone: "Base Game", stone: "Bone", src: "Random loot; your race by default" },
    { name: "Nord", num: "4", zone: "Base Game", stone: "Corundum", src: "Random loot; your race by default" },
    { name: "Breton", num: "5", zone: "Base Game", stone: "Molybdenum", src: "Random loot; your race by default" },
    { name: "Redguard", num: "6", zone: "Base Game", stone: "Starmetal", src: "Random loot; your race by default" },
    { name: "Khajiit", num: "7", zone: "Base Game", stone: "Moonstone", src: "Random loot; your race by default" },
    { name: "Orc", num: "8", zone: "Base Game", stone: "Manganese", src: "Random loot; your race by default" },
    { name: "Argonian", num: "9", zone: "Base Game", stone: "Flint", src: "Rare Racial Motifs" },
    { name: "Imperial", num: "10", zone: "Base Game", stone: "Nickel", src: "Random loot. Always found as the entire book." },
    { name: "Ancient Elf", num: "11", zone: "Base Game", stone: "Palladium", src: "Random loot. Always found as the entire book." },
    { name: "Barbaric", num: "12", zone: "Base Game", stone: null, src: null },
    { name: "Primal", num: "13", zone: "Base Game", stone: null, src: null },
    { name: "Daedric", num: "14", zone: "Base Game", stone: "Daedra Heart", src: "Craglorn" },
    { name: "Yokudan", num: "20", zone: "Base Game", stone: null, src: "Chapters can be obtained as a possible quest reward for completing Craglorn daily quests." },
    { name: "Ra Gada", num: "28", zone: "Base Game", stone: null, src: "Chapters can be obtained from:" },
    { name: "Celestial", num: "41", zone: "Base Game", stone: null, src: "Chapters can be obtained as a possible weekly quest reward for completing the Assaulting the Citadel Trial,…" },
    { name: "Dwemer", num: "15", zone: "Base Game", stone: "Dwemer Frame", src: "Chapters (or rarely the entire book) can be looted from Dwemer pots and Dwemer urns, usually found in Dwemer…" },
    { name: "Glass", num: "16", zone: "Base Game", stone: "Malachite", src: "The entire book can be bought from Rolis Hlaalu for 180 Writ Vouchers." },
    { name: "Mercenary", num: "19", zone: "Base Game", stone: null, src: "Chapters can be obtained as a possible drop from Mystery Coffers sold by Maj al-Ragath, Glirion the Redbeard…" },
    { name: "Soul-Shriven", num: "29", zone: "Base Game", stone: "Azure Plasm", src: "The entire book can only be obtained by completing Cadwell's Silver. The book is given to you by Cadwell upon…" },
    { name: "Ebony", num: "37", zone: "Base Game", stone: "Night Pumice", src: "Chapters or the entire book can be bought from Rolis Hlaalu with for Writ Vouchers. Chapters cost 25. The…" },
    { name: "Draugr", num: "38", zone: "Base Game", stone: null, src: "Chapters can be obtained as a quest reward by completing daily quests for the following factions:" },
    { name: "Xivkyn", num: "17", zone: "Cyrodiil and Imperial City", stone: "Charcoal of Remorse", src: "Chapters (or rarely the entire book) can be found in Trophy Vaults in the Imperial City. These vaults can…" },
    { name: "Akaviri", num: "18", zone: "Cyrodiil and Imperial City", stone: "Goldscale", src: "Chapters can be bought from War Researchers in Cyrodiil using Alliance Points." },
    { name: "Aldmeri Dominion", num: "25", zone: "Cyrodiil and Imperial City", stone: null, src: "Chapters can be found in Treasure Chests within the Imperial City and Cyrodiil, but only by members of the…" },
    { name: "Daggerfall Covenant", num: "26", zone: "Cyrodiil and Imperial City", stone: null, src: "Chapters can be found in Treasure Chests within the Imperial City and Cyrodiil, but only by members of the…" },
    { name: "Ebonheart Pact", num: "27", zone: "Cyrodiil and Imperial City", stone: null, src: "Chapters can be found in Treasure Chests within the Imperial City and Cyrodiil, but only by members of the…" },
    { name: "Ancient Orc", num: "21", zone: "Orsinium", stone: null, src: "Chapters (or rarely the entire book) may be dropped by enemies in Old Orsinium and Rkindaleft. Bosses have a…" },
    { name: "Trinimac", num: "22", zone: "Orsinium", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing Delve daily…" },
    { name: "Malacath", num: "23", zone: "Orsinium", stone: "Potash", src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing World Boss…" },
    { name: "Abah's Watch", num: "32", zone: "Thieves Guild", stone: null, src: "Chapters can be obtained as a possible quest reward for completing Thieves Guild Tip Board quests at the…" },
    { name: "Thieves Guild", num: "33", zone: "Thieves Guild", stone: null, src: "Chapters can be obtained as a possible quest reward for completing Heists at the highest tier of rewards.…" },
    { name: "Dro-m'Athra", num: "35", zone: "Thieves Guild", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from the Rakkhat in Maw of Lorkhaj on Normal or…" },
    { name: "Outlaw", num: "24", zone: "Thieves Guild", stone: null, src: "Chapters are possible drops from two World and two Delve bosses in Hew's Bane:" },
    { name: "Assassins League", num: "34", zone: "Dark Brotherhood", stone: null, src: "Chapters are possible drops from two World and two Delve bosses in the Gold Coast:" },
    { name: "Dark Brotherhood", num: "36", zone: "Dark Brotherhood", stone: null, src: "Chapters can be obtained as a possible quest reward for completing Dark Brotherhood Sacrament quests at any…" },
    { name: "Minotaur", num: "39", zone: "Dark Brotherhood", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing Looming…" },
    { name: "Order Hour", num: "40", zone: "Dark Brotherhood", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing The Roar of…" },
    { name: "Silken Ring", num: "44", zone: "Shadows of the Hist", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from Velidreth in the Cradle of Shadows on Normal or…" },
    { name: "Mazzatun", num: "45", zone: "Shadows of the Hist", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from Tree-Minder Na-Kesh in the Ruins of Mazzatun on…" },
    { name: "Buoyant Armiger", num: "47", zone: "Morrowind", stone: null, src: "Chapters can only be found in treasure chests around Vvardenfell or within the Halls of Fabrication. Earning…" },
    { name: "Ashlander", num: "48", zone: "Morrowind", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing hunting or…" },
    { name: "Militant Ordinator", num: "49", zone: "Morrowind", stone: null, src: "Chapters can be bought from Battleground Supplies Merchants using Alliance Points." },
    { name: "Morag Tong", num: "30", zone: "Morrowind", stone: null, src: "Chapters can be obtained as a possible quest reward for completing Hall of Justice daily quests given by…" },
    { name: "Telvanni", num: "50", zone: "Morrowind", stone: null, src: "Chapters can be obtained by pickpocketing NPCs or looted from Safeboxes and Thieves Troves in Vvardenfell." },
    { name: "Hlaalu", num: "51", zone: "Morrowind", stone: null, src: null },
    { name: "Redoran", num: "52", zone: "Morrowind", stone: null, src: null },
    { name: "Refabricated", num: "79", zone: "Morrowind", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from the Assembly General in Halls of Fabrication on…" },
    { name: "Bloodforge", num: "54", zone: "Horns of the Reach", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from Earthgore Amalgam in Bloodroot Forge on Normal…" },
    { name: "Dreadhorn", num: "55", zone: "Horns of the Reach", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from Domihaus the Bloody-Horned in Falkreath Hold on…" },
    { name: "Apostle", num: "56", zone: "Clockwork City", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing daily quests…" },
    { name: "Ebonshadow", num: "57", zone: "Clockwork City", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing Blackfeather…" },
    { name: "Fang Lair", num: "58", zone: "Dragon Bones", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from Thurvokun in Fang Lair on Normal or Veteran…" },
    { name: "Scalecaller", num: "59", zone: "Dragon Bones", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from Zaan the Scalecaller within Scalecaller Peak on…" },
    { name: "Psijic", num: "61", zone: "Summerset", stone: null, src: "Psijic motif chapters may be found in the following places:" },
    { name: "Sapiarch", num: "62", zone: "Summerset", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing Divine…" },
    { name: "Pyandonean", num: "64", zone: "Summerset", stone: null, src: "Chapters have a chance of being found inside a Pyandonean Bottle, which themselves can be obtained by fishing…" },
    { name: "Welkynar", num: "67", zone: "Summerset", stone: null, src: "Chapters can be crafted by collecting ten Welkynar Style Motif Fragments which can be obtained by killing…" },
    { name: "Huntsman", num: "65", zone: "Wolfhunter", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from Balorgh in March of Sacrifices on Normal or…" },
    { name: "Silver Dawn", num: "66", zone: "Wolfhunter", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from Vykosa the Ascendant in Moon Hunter Keep on…" },
    { name: "Honor Guard", num: "68", zone: "Murkmire", stone: null, src: "Chapters (or rarely the entire book) have a chance to drop for completing Blackrose Prison on any difficulty.…" },
    { name: "Dead-Water", num: "69", zone: "Murkmire", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing Murkmire daily…" },
    { name: "Elder Argonian", num: "70", zone: "Murkmire", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing Murkmire daily…" },
    { name: "Coldsnap", num: "71", zone: "Wrathstone", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from The Stonekeeper within Frostvault on Normal or…" },
    { name: "Meridian", num: "72", zone: "Wrathstone", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from Symphony of Blades within Depths of Malatar on…" },
    { name: "Anequina", num: "73", zone: "Elsweyr", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing World Boss and…" },
    { name: "Pellitine", num: "74", zone: "Elsweyr", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing Dragon Hunt…" },
    { name: "Sunspire", num: "75", zone: "Elsweyr", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from the Nahviintaas in Sunspire on Normal or…" },
    { name: "Stags of Z'en", num: "77", zone: "Scalebreaker", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from the Maarselok in Lair of Maarselok on Normal or…" },
    { name: "Moongrave Fane", num: "78", zone: "Scalebreaker", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from the Grundwulf in Moongrave Fane on Normal or…" },
    { name: "Dragonguard", num: "76", zone: "Dragonhold", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing Dragon hunts…" },
    { name: "Shield of Senchal", num: "80", zone: "Dragonhold", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing daily quests…" },
    { name: "New Moon Priest", num: "81", zone: "Dragonhold", stone: null, src: "Chapters (or rarely the entire book) have a relatively high chance to drop from the Dragonguard Supply Chest,…" },
    { name: "Icereach Coven", num: "82", zone: "Harrowstorm", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from Mother Ciannait in Icereach on Normal or…" },
    { name: "Pyre Watch", num: "83", zone: "Harrowstorm", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from Kjalnar Tombskald in Unhallowed Grave on Normal…" },
    { name: "Ancestral Nord", num: "87", zone: "Greymoor", stone: null, src: "Chapters can be found using Treasure Maps in Ebonheart Pact zones and the Antiquities system." },
    { name: "Ancestral Orc", num: "88", zone: "Greymoor", stone: null, src: "Chapters can be found using Treasure Maps in Daggerfall Covenant zones and the Antiquities system." },
    { name: "Ancestral High Elf", num: "89", zone: "Greymoor", stone: null, src: "Chapters can be found using Treasure Maps in Aldmeri Dominion zones and the Antiquities system." },
    { name: "Blackreach Vanguard", num: "84", zone: "Greymoor", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing Delve and…" },
    { name: "Greymoor", num: "85", zone: "Greymoor", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing Harrowstorm…" },
    { name: "Sea Giant", num: "86", zone: "Greymoor", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from the Lord Falgravn in Kyne's Aegis on Normal or…" },
    { name: "Thorn Legion", num: "90", zone: "Stonethorn", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from the Lady Thorn in Castle Thorn on Normal or…" },
    { name: "Hazardous Alchemy", num: "91", zone: "Stonethorn", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from the Arkasis the Mad Alchemist in Stone Garden…" },
    { name: "Ancestral Reach", num: "94", zone: "Markarth", stone: null, src: "Chapters can only be found using Treasure Maps in Western Skyrim, Blackreach: Greymoor Caverns, The Reach and…" },
    { name: "Nighthollow", num: "95", zone: "Markarth", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing Harrowstorm…" },
    { name: "Arkthzand Armory", num: "96", zone: "Markarth", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing World Boss and…" },
    { name: "Wayward Guardian", num: "97", zone: "Markarth", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing Wayward…" },
    { name: "Waking Flame", num: "99", zone: "Flames of Ambition", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from the Baron Zaudrus in The Cauldron on Normal or…" },
    { name: "True-Sworn", num: "100", zone: "Flames of Ambition", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from the Pyroturge Encratis in Black Drake Villa on…" },
    { name: "Ancestral Akaviri", num: "92", zone: "Blackwood", stone: null, src: "Chapters can only be found using Treasure Maps in Blackwood and the Antiquities system." },
    { name: "Ivory Brigade", num: "101", zone: "Blackwood", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing World Boss…" },
    { name: "Sul-Xan", num: "102", zone: "Blackwood", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from Xalvakka in Rockgrove on Normal or Veteran mode." },
    { name: "Black Fin Legion", num: "103", zone: "Blackwood", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing delve daily…" },
    { name: "Crimson Oath", num: "105", zone: "Waking Flame", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from the Magma Incarnate in The Dread Cellar on…" },
    { name: "Silver Rose", num: "106", zone: "Waking Flame", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from the Prior Thierric Sarazen in Red Petal Bastion…" },
    { name: "House Hexos", num: "98", zone: "Deadlands", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing Delve daily…" },
    { name: "Ancient Daedric", num: "104", zone: "Deadlands", stone: null, src: "Chapters can only be found using Treasure Maps in The Deadlands and the Antiquities system." },
    { name: "Annihilarch's Chosen", num: "107", zone: "Deadlands", stone: null, src: "Chapters can be obtained as a possible chest reward after defeating Havocrel Duke of Storms and deactivating…" },
    { name: "Fargrave Guardian", num: "108", zone: "Deadlands", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing World Boss…" },
    { name: "Dreadsails", num: "110", zone: "Ascending Tide", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from the Captain Numirril in Shipwright's Regret on…" },
    { name: "Ascendant Order", num: "111", zone: "Ascending Tide", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from the Varallion in Coral Aerie on Normal or…" },
    { name: "Ancestral Breton", num: "93", zone: "High Isle", stone: null, src: "Chapters can only be found using Treasure Maps in High Isle and the Antiquities system." },
    { name: "Syrabanic Marine", num: "112", zone: "High Isle", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from Tideborn Taleria in Dreadsail Reef on Normal or…" },
    { name: "Steadfast Society", num: "113", zone: "High Isle", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing World Boss…" },
    { name: "Systres Guardian", num: "114", zone: "High Isle", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing Delve daily…" },
    { name: "Y'ffre's Will", num: "115", zone: "Lost Depths", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from the Archdruid Devyric in Earthen Root Enclave…" },
    { name: "Drowned Mariner", num: "116", zone: "Lost Depths", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from the Zelvraak the Unbreathing in Graven Deep on…" },
    { name: "Firesong", num: "117", zone: "Firesong", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible reward for completing Volcanic Vents on…" },
    { name: "House Mornard", num: "118", zone: "Firesong", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing World Boss…" },
    { name: "Blessed Inheritor", num: "119", zone: "Scribes of Fate", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from Matriarch Lladi Telvanni in Bal Sunnar on…" },
    { name: "Scribes of Mora", num: "120", zone: "Scribes of Fate", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from Valinna in Scrivener's Hall on Normal or…" },
    { name: "Clan Dreamcarver", num: "121", zone: "Necrom", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from the Ansuul the Tormentor in Sanity's Edge on…" },
    { name: "Dead Keeper", num: "122", zone: "Necrom", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing Delve daily…" },
    { name: "Kindred's Concord", num: "123", zone: "Necrom", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from completing Bastion Nymic." },
    { name: "The Recollection", num: "124", zone: "Scions of Ithelia", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from Aradros the Awakened in Oathsworn Pit on Normal…" },
    { name: "Blind Path Cultist", num: "125", zone: "Scions of Ithelia", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from the Blind in Bedlam Veil on Normal or Veteran…" },
    { name: "Shardborn", num: "126", zone: "Gold Road", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing Delve daily…" },
    { name: "West Weald Legion", num: "127", zone: "Gold Road", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing Mirrormoor…" },
    { name: "Lucent Sentinel", num: "128", zone: "Gold Road", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from Xoryn in Lucent Citadel on Normal or Veteran…" },
    { name: "Exile's Revenge", num: "130", zone: "Fallen Banners", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from Squall of Retribution in Exiled Redoubt on…" },
    { name: "Militant Monk", num: "131", zone: "Fallen Banners", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from Orpheon the Tactician in Lep Seclusa on Normal…" },
    { name: "Stirk Fellowship", num: "132", zone: "Season of the Worm Cult", stone: null, src: "Chapters are a possible drop from Solstice Siege Camps" },
    { name: "Coldharbour Dominator", num: "133", zone: "Season of the Worm Cult", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from Overfiend Kazpian in Ossein Cage on Normal or…" },
    { name: "Tide-Born", num: "134", zone: "Season of the Worm Cult", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing Western…" },
    { name: "Black Soul Gem", num: "135", zone: "Feast of Shadows", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from High Soulbinder Vykand in Black Gem Foundry on…" },
    { name: "Voskrona Guardian", num: "136", zone: "Feast of Shadows", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from Talen-Lah in Naj-Caldeesh on Normal or Veteran…" },
    { name: "Koldane Cartel", num: "137", zone: "Season Zero: Dawn and Dusk", stone: null, src: "Chapters are a possible drop from completing daily jobs from the Reacquisition Board in the Daggerfall…" },
    { name: "Skinchanger", num: "31", zone: "Holiday Events", stone: null, src: "Chapters were originally found in New Life Gift Boxes, which were rewards for event-related quests during the…" },
    { name: "Hollowjack", num: "42", zone: "Holiday Events", stone: null, src: "Chapters were originally found in Plunder Skulls, which dropped from various bosses during the Witches…" },
    { name: "Worm Cult", num: "60", zone: "Holiday Events", stone: null, src: "Chapters were originally found in Anniversary Jubilee Gift Boxes, which were quest rewards for completing…" },
    { name: "Dremora", num: "63", zone: "Holiday Events", stone: null, src: "Found in Dremora Plunder Skulls, which dropped from various bosses during the Witches Festival event starting…" },
    { name: "Grim Harlequin", num: "43", zone: "Crown Store Exclusive", stone: null, src: null },
    { name: "Frostcaster", num: "46", zone: "Crown Store Exclusive", stone: null, src: null },
    { name: "Tsaesci", num: "53", zone: "Crown Store Exclusive", stone: null, src: null },
    { name: "Hircine Bloodhunter", num: "129", zone: "Crown Store Exclusive", stone: null, src: null }
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
