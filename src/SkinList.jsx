import { useState, useEffect } from "react";
import axios from "axios";

function SkinList() {
  // State to store our skins
  const [skins, setSkins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // This runs when the component first loads
  useEffect(() => {
    const fetchSkins = async () => {
      try {
        setLoading(true);

        // Ask the API for skins with IDs 1-20
        const skinIds = Array.from({ length: 20 }, (_, i) => i + 1).join(",");
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
  }, []); // Empty array means "run once on mount"

  // Show loading message while fetching
  if (loading) {
    return <div>Loading skins...</div>;
  }

  // Show error if something went wrong
  if (error) {
    return <div>Error: {error}</div>;
  }

  // Display the skins
  return (
    <div>
      <h2>Guild Wars 2 Skins</h2>
      <p>Found {skins.length} skins</p>

      <ul>
        {skins.map((skin) => (
          <li key={skin.id}>
            <strong>ID {skin.id}:</strong> {skin.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SkinList;
