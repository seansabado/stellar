import React from "react";
import useInstallPrompt from "../hooks/useInstallPrompt";

const AddToHomeScreenBanner: React.FC = () => {
  const { showPrompt, promptToInstall, isInstalled } = useInstallPrompt();
  if (isInstalled || !showPrompt) return null;
  return (
    <div className="install-banner">
      <span>Install this app for a better experience.</span>
      <button className="btn btn-primary" onClick={promptToInstall}>
        Add to Home Screen
      </button>
    </div>
  );
};

export default AddToHomeScreenBanner;
