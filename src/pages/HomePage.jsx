import { Link } from "react-router-dom";

function HomePage() {
  const categories = [
    {
      id: "weapon-skins",
      title: "Weapon Skins",
      icon: "⚔️",
      description: "Track all weapon skin unlocks",
      count: "~1,500 skins",
      color: "from-red-500 to-orange-500",
    },
    {
      id: "armor-skins",
      title: "Armor Skins",
      icon: "🛡️",
      description: "Track all armor skin unlocks",
      count: "~2,000 skins",
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "dyes",
      title: "Dyes",
      icon: "🎨",
      description: "Track all color unlocks",
      count: "~600 dyes",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "minis",
      title: "Minis",
      icon: "🐾",
      description: "Track all miniature unlocks",
      count: "~500 minis",
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "titles",
      title: "Titles",
      icon: "👑",
      description: "Track all title unlocks",
      count: "~400 titles",
      color: "from-yellow-500 to-amber-500",
    },
    {
      id: "novelties",
      title: "Novelties",
      icon: "✨",
      description: "Track toy and novelty unlocks",
      count: "~100 items",
      color: "from-indigo-500 to-violet-500",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4">Track Your GW2 Collections</h1>
        <p className="text-xl text-gray-400">
          Connect your API key and see what you've unlocked across all
          categories
        </p>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link key={category.id} to={`/${category.id}`} className="group">
            <div
              className={`
              bg-gradient-to-br ${category.color} 
              p-1 rounded-xl 
              hover:scale-105 transition-transform duration-200
            `}
            >
              <div className="bg-gray-900 rounded-lg p-6 h-full">
                <div className="text-6xl mb-4">{category.icon}</div>
                <h2 className="text-2xl font-bold mb-2 text-white">
                  {category.title}
                </h2>
                <p className="text-gray-400 mb-4">{category.description}</p>
                <p className="text-sm text-gray-500">{category.count}</p>
                <div className="mt-4 text-blue-400 group-hover:text-blue-300">
                  Explore →
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Info Section */}
      <div className="mt-16 text-center">
        <div className="bg-gray-800 rounded-lg p-8 max-w-2xl mx-auto">
          <h3 className="text-xl font-bold mb-4">How It Works</h3>
          <ol className="text-left text-gray-400 space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-blue-400 font-bold">1.</span>
              <span>Choose a category above</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 font-bold">2.</span>
              <span>Connect your Guild Wars 2 API key</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 font-bold">3.</span>
              <span>
                See which items you've unlocked and track your progress!
              </span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
