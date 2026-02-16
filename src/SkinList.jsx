import { useState, useEffect } from "react";
import axios from "axios";

function SkinList() {
  const [skins, setSkins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSkins = async () => {
      try {
        setLoading(true);

        const skinIds = Array.from({ length: 50 }, (_, i) => i + 1).join(",");
        const response = await axios.get(
          `https://api.guildwars2.com/v2/skins?ids=${skinIds}`,
        );

        setSkins(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch skins");
        setLoading(false);
        console.error(err);
      }
    };

    fetchSkins();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-400">Loading skins...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-200">
        Error: {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Guild Wars 2 Skins</h2>
        <p className="text-gray-400">Found {skins.length} skins</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skins.map((skin) => (
          <div
            key={skin.id}
            className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors border border-gray-700 hover:border-gray-600"
          >
            <div className="flex items-center gap-4">
              <img
                src={skin.icon}
                alt={skin.name}
                className="w-16 h-16 rounded"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">
                  {skin.name}
                </h3>
                <p className="text-sm text-gray-400">ID: {skin.id}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SkinList;
