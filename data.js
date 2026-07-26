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
    { name: "High Elf", num: "1", stone: "Adamantite", src: "Random loot. Always found as the entire book." },
    { name: "Dark Elf", num: "2", stone: "Obsidian", src: "Random loot; your race by default" },
    { name: "Wood Elf", num: "3", stone: "Bone", src: "Random loot; your race by default" },
    { name: "Nord", num: "4", stone: "Corundum", src: "Random loot; your race by default" },
    { name: "Breton", num: "5", stone: "Molybdenum", src: "Random loot; your race by default" },
    { name: "Redguard", num: "6", stone: "Starmetal", src: "Random loot; your race by default" },
    { name: "Khajiit", num: "7", stone: "Moonstone", src: "Random loot; your race by default" },
    { name: "Orc", num: "8", stone: "Manganese", src: "Random loot; your race by default" },
    { name: "Argonian", num: "9", stone: "Flint", src: "Rare Racial Motifs" },
    { name: "Imperial", num: "10", stone: "Nickel", src: "Random loot. Always found as the entire book." },
    { name: "Ancient Elf", num: "11", stone: "Palladium", src: "Random loot. Always found as the entire book." },
    { name: "Barbaric", num: "12", stone: null, src: null },
    { name: "Primal", num: "13", stone: null, src: null },
    { name: "Daedric", num: "14", stone: "Daedra Heart", src: "Craglorn" },
    { name: "Yokudan", num: "20", stone: null, src: "Chapters can be obtained as a possible quest reward for completing Craglorn daily quests." },
    { name: "Ra Gada", num: "28", stone: null, src: "Chapters can be obtained from:" },
    { name: "Celestial", num: "41", stone: null, src: "Chapters can be obtained as a possible weekly quest reward for completing the Assaulting the Citadel Trial,…" },
    { name: "Dwemer", num: "15", stone: "Dwemer Frame", src: "Chapters (or rarely the entire book) can be looted from Dwemer pots and Dwemer urns, usually found in Dwemer…" },
    { name: "Glass", num: "16", stone: "Malachite", src: "The entire book can be bought from Rolis Hlaalu for 180 Writ Vouchers." },
    { name: "Mercenary", num: "19", stone: null, src: "Chapters can be obtained as a possible drop from Mystery Coffers sold by Maj al-Ragath, Glirion the Redbeard…" },
    { name: "Soul-Shriven", num: "29", stone: "Azure Plasm", src: "The entire book can only be obtained by completing Cadwell's Silver. The book is given to you by Cadwell upon…" },
    { name: "Ebony", num: "37", stone: "Night Pumice", src: "Chapters or the entire book can be bought from Rolis Hlaalu with for Writ Vouchers. Chapters cost 25. The…" },
    { name: "Draugr", num: "38", stone: null, src: "Chapters can be obtained as a quest reward by completing daily quests for the following factions:" },
    { name: "Xivkyn", num: "17", stone: "Charcoal of Remorse", src: "Chapters (or rarely the entire book) can be found in Trophy Vaults in the Imperial City. These vaults can…" },
    { name: "Akaviri", num: "18", stone: "Goldscale", src: "Chapters can be bought from War Researchers in Cyrodiil using Alliance Points." },
    { name: "Aldmeri Dominion", num: "25", stone: null, src: "Chapters can be found in Treasure Chests within the Imperial City and Cyrodiil, but only by members of the…" },
    { name: "Daggerfall Covenant", num: "26", stone: null, src: "Chapters can be found in Treasure Chests within the Imperial City and Cyrodiil, but only by members of the…" },
    { name: "Ebonheart Pact", num: "27", stone: null, src: "Chapters can be found in Treasure Chests within the Imperial City and Cyrodiil, but only by members of the…" },
    { name: "Ancient Orc", num: "21", stone: null, src: "Chapters (or rarely the entire book) may be dropped by enemies in Old Orsinium and Rkindaleft. Bosses have a…" },
    { name: "Trinimac", num: "22", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing Delve daily…" },
    { name: "Malacath", num: "23", stone: "Potash", src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing World Boss…" },
    { name: "Abah's Watch", num: "32", stone: null, src: "Chapters can be obtained as a possible quest reward for completing Thieves Guild Tip Board quests at the…" },
    { name: "Thieves Guild", num: "33", stone: null, src: "Chapters can be obtained as a possible quest reward for completing Heists at the highest tier of rewards.…" },
    { name: "Dro-m'Athra", num: "35", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from the Rakkhat in Maw of Lorkhaj on Normal or…" },
    { name: "Outlaw", num: "24", stone: null, src: "Chapters are possible drops from two World and two Delve bosses in Hew's Bane:" },
    { name: "Assassins League", num: "34", stone: null, src: "Chapters are possible drops from two World and two Delve bosses in the Gold Coast:" },
    { name: "Dark Brotherhood", num: "36", stone: null, src: "Chapters can be obtained as a possible quest reward for completing Dark Brotherhood Sacrament quests at any…" },
    { name: "Minotaur", num: "39", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing Looming…" },
    { name: "Order Hour", num: "40", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing The Roar of…" },
    { name: "Silken Ring", num: "44", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from Velidreth in the Cradle of Shadows on Normal or…" },
    { name: "Mazzatun", num: "45", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from Tree-Minder Na-Kesh in the Ruins of Mazzatun on…" },
    { name: "Buoyant Armiger", num: "47", stone: null, src: "Chapters can only be found in treasure chests around Vvardenfell or within the Halls of Fabrication. Earning…" },
    { name: "Ashlander", num: "48", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing hunting or…" },
    { name: "Militant Ordinator", num: "49", stone: null, src: "Chapters can be bought from Battleground Supplies Merchants using Alliance Points." },
    { name: "Morag Tong", num: "30", stone: null, src: "Chapters can be obtained as a possible quest reward for completing Hall of Justice daily quests given by…" },
    { name: "Telvanni", num: "50", stone: null, src: "Chapters can be obtained by pickpocketing NPCs or looted from Safeboxes and Thieves Troves in Vvardenfell." },
    { name: "Hlaalu", num: "51", stone: null, src: null },
    { name: "Redoran", num: "52", stone: null, src: null },
    { name: "Refabricated", num: "79", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from the Assembly General in Halls of Fabrication on…" },
    { name: "Bloodforge", num: "54", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from Earthgore Amalgam in Bloodroot Forge on Normal…" },
    { name: "Dreadhorn", num: "55", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from Domihaus the Bloody-Horned in Falkreath Hold on…" },
    { name: "Apostle", num: "56", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing daily quests…" },
    { name: "Ebonshadow", num: "57", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing Blackfeather…" },
    { name: "Fang Lair", num: "58", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from Thurvokun in Fang Lair on Normal or Veteran…" },
    { name: "Scalecaller", num: "59", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from Zaan the Scalecaller within Scalecaller Peak on…" },
    { name: "Psijic", num: "61", stone: null, src: "Psijic motif chapters may be found in the following places:" },
    { name: "Sapiarch", num: "62", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing Divine…" },
    { name: "Pyandonean", num: "64", stone: null, src: "Chapters have a chance of being found inside a Pyandonean Bottle, which themselves can be obtained by fishing…" },
    { name: "Welkynar", num: "67", stone: null, src: "Chapters can be crafted by collecting ten Welkynar Style Motif Fragments which can be obtained by killing…" },
    { name: "Huntsman", num: "65", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from Balorgh in March of Sacrifices on Normal or…" },
    { name: "Silver Dawn", num: "66", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from Vykosa the Ascendant in Moon Hunter Keep on…" },
    { name: "Honor Guard", num: "68", stone: null, src: "Chapters (or rarely the entire book) have a chance to drop for completing Blackrose Prison on any difficulty.…" },
    { name: "Dead-Water", num: "69", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing Murkmire daily…" },
    { name: "Elder Argonian", num: "70", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing Murkmire daily…" },
    { name: "Coldsnap", num: "71", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from The Stonekeeper within Frostvault on Normal or…" },
    { name: "Meridian", num: "72", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from Symphony of Blades within Depths of Malatar on…" },
    { name: "Anequina", num: "73", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing World Boss and…" },
    { name: "Pellitine", num: "74", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing Dragon Hunt…" },
    { name: "Sunspire", num: "75", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from the Nahviintaas in Sunspire on Normal or…" },
    { name: "Stags of Z'en", num: "77", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from the Maarselok in Lair of Maarselok on Normal or…" },
    { name: "Moongrave Fane", num: "78", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from the Grundwulf in Moongrave Fane on Normal or…" },
    { name: "Dragonguard", num: "76", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing Dragon hunts…" },
    { name: "Shield of Senchal", num: "80", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing daily quests…" },
    { name: "New Moon Priest", num: "81", stone: null, src: "Chapters (or rarely the entire book) have a relatively high chance to drop from the Dragonguard Supply Chest,…" },
    { name: "Icereach Coven", num: "82", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from Mother Ciannait in Icereach on Normal or…" },
    { name: "Pyre Watch", num: "83", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from Kjalnar Tombskald in Unhallowed Grave on Normal…" },
    { name: "Ancestral Nord", num: "87", stone: null, src: "Chapters can be found using Treasure Maps in Ebonheart Pact zones and the Antiquities system." },
    { name: "Ancestral Orc", num: "88", stone: null, src: "Chapters can be found using Treasure Maps in Daggerfall Covenant zones and the Antiquities system." },
    { name: "Ancestral High Elf", num: "89", stone: null, src: "Chapters can be found using Treasure Maps in Aldmeri Dominion zones and the Antiquities system." },
    { name: "Blackreach Vanguard", num: "84", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing Delve and…" },
    { name: "Greymoor", num: "85", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing Harrowstorm…" },
    { name: "Sea Giant", num: "86", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from the Lord Falgravn in Kyne's Aegis on Normal or…" },
    { name: "Thorn Legion", num: "90", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from the Lady Thorn in Castle Thorn on Normal or…" },
    { name: "Hazardous Alchemy", num: "91", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from the Arkasis the Mad Alchemist in Stone Garden…" },
    { name: "Ancestral Reach", num: "94", stone: null, src: "Chapters can only be found using Treasure Maps in Western Skyrim, Blackreach: Greymoor Caverns, The Reach and…" },
    { name: "Nighthollow", num: "95", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing Harrowstorm…" },
    { name: "Arkthzand Armory", num: "96", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing World Boss and…" },
    { name: "Wayward Guardian", num: "97", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing Wayward…" },
    { name: "Waking Flame", num: "99", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from the Baron Zaudrus in The Cauldron on Normal or…" },
    { name: "True-Sworn", num: "100", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from the Pyroturge Encratis in Black Drake Villa on…" },
    { name: "Ancestral Akaviri", num: "92", stone: null, src: "Chapters can only be found using Treasure Maps in Blackwood and the Antiquities system." },
    { name: "Ivory Brigade", num: "101", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing World Boss…" },
    { name: "Sul-Xan", num: "102", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from Xalvakka in Rockgrove on Normal or Veteran mode." },
    { name: "Black Fin Legion", num: "103", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing delve daily…" },
    { name: "Crimson Oath", num: "105", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from the Magma Incarnate in The Dread Cellar on…" },
    { name: "Silver Rose", num: "106", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from the Prior Thierric Sarazen in Red Petal Bastion…" },
    { name: "House Hexos", num: "98", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing Delve daily…" },
    { name: "Ancient Daedric", num: "104", stone: null, src: "Chapters can only be found using Treasure Maps in The Deadlands and the Antiquities system." },
    { name: "Annihilarch's Chosen", num: "107", stone: null, src: "Chapters can be obtained as a possible chest reward after defeating Havocrel Duke of Storms and deactivating…" },
    { name: "Fargrave Guardian", num: "108", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing World Boss…" },
    { name: "Dreadsails", num: "110", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from the Captain Numirril in Shipwright's Regret on…" },
    { name: "Ascendant Order", num: "111", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from the Varallion in Coral Aerie on Normal or…" },
    { name: "Ancestral Breton", num: "93", stone: null, src: "Chapters can only be found using Treasure Maps in High Isle and the Antiquities system." },
    { name: "Syrabanic Marine", num: "112", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from Tideborn Taleria in Dreadsail Reef on Normal or…" },
    { name: "Steadfast Society", num: "113", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing World Boss…" },
    { name: "Systres Guardian", num: "114", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing Delve daily…" },
    { name: "Y'ffre's Will", num: "115", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from the Archdruid Devyric in Earthen Root Enclave…" },
    { name: "Drowned Mariner", num: "116", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from the Zelvraak the Unbreathing in Graven Deep on…" },
    { name: "Firesong", num: "117", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible reward for completing Volcanic Vents on…" },
    { name: "House Mornard", num: "118", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing World Boss…" },
    { name: "Blessed Inheritor", num: "119", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from Matriarch Lladi Telvanni in Bal Sunnar on…" },
    { name: "Scribes of Mora", num: "120", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from Valinna in Scrivener's Hall on Normal or…" },
    { name: "Clan Dreamcarver", num: "121", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from the Ansuul the Tormentor in Sanity's Edge on…" },
    { name: "Dead Keeper", num: "122", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing Delve daily…" },
    { name: "Kindred's Concord", num: "123", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from completing Bastion Nymic." },
    { name: "The Recollection", num: "124", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from Aradros the Awakened in Oathsworn Pit on Normal…" },
    { name: "Blind Path Cultist", num: "125", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from the Blind in Bedlam Veil on Normal or Veteran…" },
    { name: "Shardborn", num: "126", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing Delve daily…" },
    { name: "West Weald Legion", num: "127", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing Mirrormoor…" },
    { name: "Lucent Sentinel", num: "128", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from Xoryn in Lucent Citadel on Normal or Veteran…" },
    { name: "Exile's Revenge", num: "130", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from Squall of Retribution in Exiled Redoubt on…" },
    { name: "Militant Monk", num: "131", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from Orpheon the Tactician in Lep Seclusa on Normal…" },
    { name: "Stirk Fellowship", num: "132", stone: null, src: "Chapters are a possible drop from Solstice Siege Camps" },
    { name: "Coldharbour Dominator", num: "133", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from Overfiend Kazpian in Ossein Cage on Normal or…" },
    { name: "Tide-Born", num: "134", stone: null, src: "Chapters (or rarely the entire book) can be obtained as a possible quest reward for completing Western…" },
    { name: "Black Soul Gem", num: "135", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from High Soulbinder Vykand in Black Gem Foundry on…" },
    { name: "Voskrona Guardian", num: "136", stone: null, src: "Chapters (or rarely the entire book) are a possible drop from Talen-Lah in Naj-Caldeesh on Normal or Veteran…" },
    { name: "Koldane Cartel", num: "137", stone: null, src: "Chapters are a possible drop from completing daily jobs from the Reacquisition Board in the Daggerfall…" },
    { name: "Skinchanger", num: "31", stone: null, src: "Chapters were originally found in New Life Gift Boxes, which were rewards for event-related quests during the…" },
    { name: "Hollowjack", num: "42", stone: null, src: "Chapters were originally found in Plunder Skulls, which dropped from various bosses during the Witches…" },
    { name: "Worm Cult", num: "60", stone: null, src: "Chapters were originally found in Anniversary Jubilee Gift Boxes, which were quest rewards for completing…" },
    { name: "Dremora", num: "63", stone: null, src: "Found in Dremora Plunder Skulls, which dropped from various bosses during the Witches Festival event starting…" },
    { name: "Grim Harlequin", num: "43", stone: null, src: null },
    { name: "Frostcaster", num: "46", stone: null, src: null },
    { name: "Tsaesci", num: "53", stone: null, src: null },
    { name: "Hircine Bloodhunter", num: "129", stone: null, src: null }
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
