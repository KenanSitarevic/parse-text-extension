chrome.identity.onSignInChanged.addListener((account, signedIn) => {
  if (signedIn) {
    console.log('Signed in:', account);
  } else {
    console.log('Signed out');
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  // Send a message to the sidepanel when the active tab changes
  chrome.runtime.sendMessage({ action: 'refreshSidepanel' });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    // Send a message to the sidepanel when the tab is updated
    chrome.runtime.sendMessage({ action: 'refreshSidepanel' });
  }
});

