import React from "react";
import useInstallPrompt from "../hooks/useInstallPrompt";

const AddToHomeScreenBanner: React.FC = () => {
  const { showPrompt, promptToInstall, isInstalled } = useInstallPrompt();
  if (isInstalled || !showPrompt) return null;
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded px-4 py-2 flex items-center z-50">
      <span className="mr-2">Install this app for a better experience!</span>
      <button
        className="bg-blue-600 text-white px-3 py-1 rounded"
        onClick={promptToInstall}
      >
        Add to Home Screen
      </button>
    </div>
  );
};

export default AddToHomeScreenBanner;
