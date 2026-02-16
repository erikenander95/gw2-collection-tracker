import { useState, useEffect } from "react";

function ApiKeyInput({ onApiKeyChange }) {
  const [apiKey, setApiKey] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Load saved API key when component mounts
  useEffect(() => {
    const loadSavedKey = async () => {
      const savedKey = localStorage.getItem("gw2ApiKey");
      if (savedKey) {
        setApiKey(savedKey);
        onApiKeyChange(savedKey);
      }
    };

    loadSavedKey();
  }, [onApiKeyChange]);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem("gw2ApiKey", apiKey.trim());
      onApiKeyChange(apiKey.trim());
      setIsEditing(false);
    }
  };

  const handleClear = () => {
    localStorage.removeItem("gw2ApiKey");
    setApiKey("");
    onApiKeyChange(null);
    setIsEditing(true);
  };

  if (!apiKey || isEditing) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-2">Connect Your Account</h3>
        <p className="text-gray-400 text-sm mb-4">
          Enter your Guild Wars 2 API key to see which items you've unlocked.
          <a
            href="https://account.arena.net/applications"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 ml-1"
          >
            Get your API key here →
          </a>
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX..."
            className="flex-1 bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-semibold transition-colors"
          >
            Save
          </button>
          {apiKey && (
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-400">API Key Connected</p>
        <p className="font-mono text-sm text-gray-300">
          {apiKey.slice(0, 8)}...{apiKey.slice(-8)}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setIsEditing(true)}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm transition-colors"
        >
          Change
        </button>
        <button
          onClick={handleClear}
          className="bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-2 rounded text-sm transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

export default ApiKeyInput;
