import { useState, useEffect } from "react";
import axios from "axios";
import ApiKeyInput from "../components/ApiKeyInput";

function WeaponSkinsPage() {
  const [apiKey, setApiKey] = useState(null);
  const [allSkins, setAllSkins] = useState([]);
  const [userSkins, setUserSkins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedWeaponType, setSelectedWeaponType] = useState("all");
  const [selectedRarity, setSelectedRarity] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all weapon skins when component loads
  useEffect(() => {
    const fetchAllWeaponSkins = async () => {
      try {
        setLoading(true);

        // Helper function to clean item names
        const cleanItemName = (name) => {
          const statPrefixes = [
            "Mighty",
            "Precise",
            "Vigorous",
            "Malign",
            "Healing",
            "Tough",
            "Vital",
            "Hearty",
            "Ravaging",
            "Rejuvenating",
            "Honed",
            "Strong",
            "Potent",
            "Enduring",
            "Forsaken",
            "Berserker's",
            "Rampager's",
            "Soldier's",
            "Settler's",
            "Cleric's",
            "Magi's",
            "Shaman's",
            "Knight's",
            "Cavalier's",
            "Nomad's",
            "Sentinel's",
            "Giver's",
            "Carrion",
            "Rabid",
            "Dire",
            "Mending",
            "Apothecary's",
            "Sinister",
            "Celestial",
            "Trailblazer's",
            "Commander's",
            "Wanderer's",
            "Marauder's",
            "Crusader's",
            "Viper's",
            "Seraph's",
            "Marshal's",
            "Harrier's",
            "Grieving",
            "Zealot's",
            "Minstrel's",
            "Diviner's",
            "Valkyrie",
            "Assassin's",
          ];

          // Try to remove stat prefix from the beginning
          for (const prefix of statPrefixes) {
            if (name.startsWith(prefix + " ")) {
              return name.substring(prefix.length + 1); // Remove prefix + space
            }
          }

          return name; // No prefix found, return original
        };

        // ===== CACHING LOGIC - ADD THIS =====
        const CACHE_KEY = "weaponSkinsCache";
        const CACHE_TIME_KEY = "weaponSkinsCacheTime";
        const ONE_DAY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        // Check for cached data
        const cachedData = localStorage.getItem(CACHE_KEY);
        const cacheTimestamp = localStorage.getItem(CACHE_TIME_KEY);
        const now = Date.now();

        // If cache exists and is less than 24 hours old, use it!
        if (cachedData && cacheTimestamp) {
          const cacheAge = now - parseInt(cacheTimestamp);
          if (cacheAge < ONE_DAY) {
            console.log(
              "✅ Loading from cache (cache age: " +
                Math.round(cacheAge / 1000 / 60) +
                " minutes)",
            );
            setAllSkins(JSON.parse(cachedData));
            setLoading(false);
            return; // Exit early - don't fetch!
          } else {
            console.log("⏰ Cache expired, fetching fresh data...");
          }
        } else {
          console.log("🔄 No cache found, fetching fresh data...");
        }
        // ===== END CACHING LOGIC =====

        // Step 1: Get all item IDs
        const itemIdsResponse = await axios.get(
          "https://api.guildwars2.com/v2/items",
        );
        const allItemIds = itemIdsResponse.data;

        // Step 2: Fetch items in batches
        const batchSize = 200;
        const allItemsData = [];

        console.log("Fetching items... this will take a while");

        for (let i = 0; i < allItemIds.length; i += batchSize) {
          const batch = allItemIds.slice(i, i + batchSize);
          const response = await axios.get(
            `https://api.guildwars2.com/v2/items?ids=${batch.join(",")}`,
          );
          allItemsData.push(...response.data);

          // Log progress
          if (i % 2000 === 0) {
            console.log(`Fetched ${i} / ${allItemIds.length} items...`);
          }
        }

        console.log("All items fetched! Processing weapons...");

        // DEBUG: Find all Hero items in raw data BEFORE filtering
        const allHeroItems = allItemsData.filter(
          (item) =>
            item.type === "Weapon" && item.name && item.name.includes("Hero"),
        );
        console.log(
          "🔍 ALL Hero weapons in API (before filtering):",
          allHeroItems,
        );
        console.log("🔍 Count:", allHeroItems.length);

        // DEBUG: Check one specific Hero item in detail
        const heroGreatsword = allItemsData.find(
          (item) => item.name === "Hero's Greatsword" && item.rarity === "Rare",
        );

        if (heroGreatsword) {
          console.log("🔍 Found Hero's Greatsword:", {
            name: heroGreatsword.name,
            type: heroGreatsword.type,
            hasDefaultSkin: !!heroGreatsword.default_skin,
            hasDetails: !!heroGreatsword.details,
            hasWeaponType: !!heroGreatsword.details?.type,
            weaponType: heroGreatsword.details?.type,
            hasMinPower: !!heroGreatsword.details?.min_power,
            hasinfix_upgrade: !!heroGreatsword.details?.infix_upgrade,
            hasStatChoices: !!heroGreatsword.details?.stat_choices,
            statChoicesLength: heroGreatsword.details?.stat_choices?.length,
            rarity: heroGreatsword.rarity,
            flags: heroGreatsword.flags,
          });
        }

        // Step 3: Filter to only REAL weapons that have skins
        const weaponItems = allItemsData.filter((item) => {
          // Must be a weapon with a skin
          if (item.type !== "Weapon" || !item.default_skin) {
            return false;
          }

          // Must have a valid name (not blank, not just numbers)
          if (
            !item.name ||
            item.name.trim() === "" ||
            /^\(\(\d+\)\)$/.test(item.name)
          ) {
            return false;
          }

          // Must have weapon details (real weapons have this)
          if (!item.details || !item.details.type) {
            return false;
          }

          // Only include items that are actually usable in combat
          // Real weapons have min_power and max_power
          if (!item.details.min_power || !item.details.max_power) {
            return false;
          }

          // NEW: Exclude quest/story/special items
          // These often have "NoSell" flag but no tradeable equivalent
          if (
            item.flags &&
            item.flags.includes("NoSell") &&
            item.flags.includes("AccountBound")
          ) {
            // If it's both NoSell AND AccountBound, likely a quest item
            // UNLESS it also has SoulbindOnAcquire (which real weapons have)
            if (
              !item.flags.includes("SoulbindOnAcquire") &&
              !item.flags.includes("SoulBindOnUse")
            ) {
              return false;
            }
          }

          // NEW: Exclude items with specific "junk" keywords
          const excludeKeywords = [
            "fireworks",
            "scanner",
            "adjuster",
            "polarizer",
            "box of fun",
            "caladbolg", // Story-specific, not normally obtainable
            "gladiator weapon", // PvP only
          ];

          const nameLower = item.name.toLowerCase();
          if (excludeKeywords.some((keyword) => nameLower.includes(keyword))) {
            return false;
          }

          // NEW: Must have an infix upgrade OR be ascended/legendary
          // Real weapons have stats (infix_upgrade) or are special (ascended/legendary)
          if (
            !item.details.infix_upgrade &&
            !item.details.stat_choices &&
            item.rarity !== "Ascended" &&
            item.rarity !== "Legendary"
          ) {
            return false;
          }

          // NEW: Must have a valid weapon type
          const validWeaponTypes = [
            "Axe",
            "Dagger",
            "Mace",
            "Pistol",
            "Scepter",
            "Sword",
            "Focus",
            "Shield",
            "Torch",
            "Warhorn",
            "Greatsword",
            "Hammer",
            "Longbow",
            "Rifle",
            "ShortBow",
            "Staff",
            "Harpoon",
            "Speargun",
            "Trident",
          ];

          if (!validWeaponTypes.includes(item.details.type)) {
            return false;
          }

          return true;
        });

        // Step 4: Get unique skins (multiple items can share the same skin)
        // We'll keep the LOWEST rarity item for each skin (easiest to obtain)
        const skinMap = new Map();

        const rarityOrder = {
          Junk: 0,
          Basic: 1,
          Fine: 2,
          Masterwork: 3,
          Rare: 4,
          Exotic: 5,
          Ascended: 6,
          Legendary: 7,
        };

        weaponItems.forEach((item) => {
          const skinId = item.default_skin;
          const existingSkin = skinMap.get(skinId);

          if (
            !existingSkin ||
            rarityOrder[item.rarity] < rarityOrder[existingSkin.rarity]
          ) {
            // Store item data with skin ID (lowest rarity wins)
            skinMap.set(skinId, {
              id: skinId,
              name: cleanItemName(item.name), // ← Clean the name!
              icon: item.icon,
              rarity: item.rarity,
              chat_link: item.chat_link,
              weapon_type: item.details?.type,
            });
          }
        });

        // Step 5: Convert map to array
        const weaponSkins = Array.from(skinMap.values());

        console.log("✅ Weapon skins processed:", weaponSkins.length);

        // DEBUG: Check how many Hero items survived filtering
        const heroSkins = weaponSkins.filter((s) => s.name.includes("Hero"));
        console.log(
          "🔍 Hero items AFTER filtering and deduplication:",
          heroSkins,
        );
        console.log("🔍 Hero skins count AFTER:", heroSkins.length);

        // ===== SAVE TO CACHE - ADD THIS =====
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(weaponSkins));
          localStorage.setItem(CACHE_TIME_KEY, now.toString());
          console.log("💾 Saved to cache!");
        } catch (e) {
          console.error("❌ Failed to save to cache:", e);
        }
        // ===== END SAVE TO CACHE =====

        setAllSkins(weaponSkins);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch weapon skins");
        setLoading(false);
        console.error(err);
      }
    };

    fetchAllWeaponSkins();
  }, []);
  // Fetch user's unlocked skins when API key changes
  useEffect(() => {
    const resetAndFetch = async () => {
      if (!apiKey) {
        setUserSkins([]); // Clear skins when no key
        return;
      }

      try {
        const response = await axios.get(
          `https://api.guildwars2.com/v2/account/skins?access_token=${apiKey}`,
        );
        setUserSkins(response.data);
      } catch (err) {
        console.error("Failed to fetch user skins:", err);
        setUserSkins([]); // Clear on error too
      }
    };

    resetAndFetch();
  }, [apiKey]); // Runs when apiKey changes

  // Check if user owns a skin
  const isUnlocked = (skinId) => {
    return userSkins.includes(skinId);
  };

  // Filter skins based on selected filters
  const filteredSkins = allSkins.filter((skin) => {
    // Weapon type filter
    if (
      selectedWeaponType !== "all" &&
      skin.weapon_type !== selectedWeaponType
    ) {
      return false;
    }

    // Rarity filter
    if (selectedRarity !== "all" && skin.rarity !== selectedRarity) {
      return false;
    }

    // Search filter
    if (
      searchQuery &&
      !skin.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  // DEBUG: Let's see what's happening with filters
  console.log("Selected weapon type:", selectedWeaponType);
  console.log("Selected rarity:", selectedRarity);
  console.log("Filtered results:", filteredSkins.length);
  if (selectedWeaponType !== "all") {
    const exampleSkin = allSkins.find(
      (s) => s.details?.type === selectedWeaponType,
    );
    console.log("Example skin with this weapon type:", exampleSkin);

    // NEW DEBUG: Check rarities of daggers
    const daggerSkins = allSkins.filter(
      (s) => s.details?.type === selectedWeaponType,
    );
    const daggerRarities = [...new Set(daggerSkins.map((s) => s.rarity))];
    console.log("Rarities found in daggers:", daggerRarities);
    console.log("Number of daggers per rarity:");
    daggerRarities.forEach((rarity) => {
      const count = daggerSkins.filter((s) => s.rarity === rarity).length;
      console.log(`  ${rarity}: ${count}`);
    });
  }

  // Get unique weapon types for the filter
  const weaponTypes = [
    ...new Set(allSkins.map((s) => s.details?.type).filter(Boolean)),
  ].sort();

  // Calculate stats
  const totalWeaponSkins = allSkins.length;
  const unlockedCount = allSkins.filter((skin) => isUnlocked(skin.id)).length;
  const percentage =
    totalWeaponSkins > 0
      ? Math.round((unlockedCount / totalWeaponSkins) * 100)
      : 0;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-xl text-gray-400 mb-4">
            Loading weapon skins...
          </div>
          <div className="text-sm text-gray-500">
            This may take a moment (fetching 1,500+ skins)
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-200">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back Link */}
      <a
        href="/"
        className="text-blue-400 hover:text-blue-300 mb-6 inline-block"
      >
        ← Back to Categories
      </a>

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">⚔️ Weapon Skins</h1>
        <p className="text-gray-400">
          Track all weapon skin unlocks in Guild Wars 2
        </p>
      </div>

      {/* API Key Input */}
      <ApiKeyInput onApiKeyChange={setApiKey} />

      {/* Stats Bar */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">
              {unlockedCount} / {totalWeaponSkins}
            </h2>
            <p className="text-gray-400">Weapon Skins Unlocked</p>
          </div>
          <div className="text-4xl font-bold text-blue-400">{percentage}%</div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Weapon Type Filter */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Weapon Type
            </label>
            <select
              value={selectedWeaponType}
              onChange={(e) => setSelectedWeaponType(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Types</option>
              {weaponTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Rarity Filter */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Rarity</label>
            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Rarities</option>
              <option value="Junk">Junk</option>
              <option value="Basic">Basic</option>
              <option value="Fine">Fine</option>
              <option value="Masterwork">Masterwork</option>
              <option value="Rare">Rare</option>
              <option value="Exotic">Exotic</option>
              <option value="Ascended">Ascended</option>
              <option value="Legendary">Legendary</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name..."
              className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Active Filters Info */}
        <div className="mt-4 text-sm text-gray-400">
          Showing {filteredSkins.length} of {totalWeaponSkins} weapon skins
        </div>
      </div>

      {/* Skins Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredSkins.map((skin) => {
          const unlocked = isUnlocked(skin.id);

          return (
            <div
              key={skin.id}
              className={`
                relative group
                bg-gray-800 rounded-lg p-3
                border-2 transition-all
                ${
                  unlocked
                    ? "border-green-500 hover:border-green-400"
                    : "border-gray-700 hover:border-gray-600 opacity-60"
                }
              `}
            >
              {/* Skin Icon */}
              <div className="aspect-square mb-2">
                <img
                  src={skin.icon}
                  alt={skin.name}
                  className={`w-full h-full object-contain rounded ${!unlocked && "grayscale"}`}
                />
              </div>

              {/* Skin Name */}
              <div className="text-xs text-center truncate" title={skin.name}>
                {skin.name}
              </div>

              {/* Rarity Indicator */}
              <div
                className={`text-xs text-center mt-1 ${
                  skin.rarity === "Legendary"
                    ? "text-purple-400"
                    : skin.rarity === "Ascended"
                      ? "text-pink-400"
                      : skin.rarity === "Exotic"
                        ? "text-orange-400"
                        : skin.rarity === "Rare"
                          ? "text-yellow-400"
                          : "text-gray-500"
                }`}
              >
                {skin.rarity}
              </div>

              {/* Unlock Status Badge */}
              {unlocked && (
                <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                  ✓
                </div>
              )}

              {/* Hover Tooltip */}
              <div className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 border border-gray-700 rounded p-2 text-xs whitespace-nowrap z-10">
                {skin.name}
                <br />
                <span className="text-gray-400">
                  {skin.weapon_type || "Unknown"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* No Results Message */}
      {filteredSkins.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No weapon skins match your filters. Try adjusting your search
          criteria.
        </div>
      )}
    </div>
  );
}

export default WeaponSkinsPage;
