import { useState } from "react";
import axios from "axios";

function TestApiPattern() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const testPattern = async () => {
    setLoading(true);
    try {
      // Test various ID ranges
      const ranges = [
        {
          name: "Early IDs (1-100)",
          ids: Array.from({ length: 20 }, (_, i) => i + 1),
        },
        {
          name: "Mid IDs (1000-1100)",
          ids: Array.from({ length: 20 }, (_, i) => i + 1000),
        },
        {
          name: "Later IDs (5000-5100)",
          ids: Array.from({ length: 20 }, (_, i) => i + 5000),
        },
        {
          name: "Recent IDs (8000-8100)",
          ids: Array.from({ length: 20 }, (_, i) => i + 8000),
        },
      ];

      const allResults = [];

      for (const range of ranges) {
        const response = await axios.get(
          `https://api.guildwars2.com/v2/skins?ids=${range.ids.join(",")}`,
        );

        allResults.push({
          rangeName: range.name,
          skins: response.data,
        });
      }

      setResults(allResults);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">API Pattern Test</h2>
      <p className="text-gray-400 mb-4">
        Let's see if skin IDs follow any pattern based on when they were added!
      </p>

      <button
        onClick={testPattern}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-semibold mb-6"
      >
        {loading ? "Testing..." : "Run Test"}
      </button>

      {results.map((range, idx) => (
        <div key={idx} className="mb-6 bg-gray-900 p-4 rounded">
          <h3 className="text-lg font-bold mb-3 text-blue-400">
            {range.rangeName}
          </h3>
          <div className="space-y-2">
            {range.skins.slice(0, 5).map((skin) => (
              <div key={skin.id} className="text-sm">
                <span className="text-gray-400">ID {skin.id}:</span>{" "}
                <span className="text-white">{skin.name}</span>{" "}
                <span className="text-gray-500">({skin.type})</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default TestApiPattern;
