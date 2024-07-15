import React, { useEffect, useState } from "react";
import { sendToContentScript } from "@plasmohq/messaging";
import { getLoginUrl, getLogoutUrl, launchWebAuthFlow, callGraphMeEndpoint } from '../authConfig';

function IndexSidePanel() {
  const [user, setUser] = useState(null);
  const [scrapedText, setScrapedText] = useState(null); 
  const [loading, setLoading] = useState(true); 

  const fetchScrapedText = async () => {
    setLoading(true);
    try {
      const text = await sendToContentScript({ name: 'scrape' });
      setScrapedText(text);
    } catch (error) {
      console.error("Error fetching scraped text:", error);
      setScrapedText('Error fetching data');
    } finally {
      setLoading(false); 
    }
  };


const signIn = async () => {
  const url = await getLoginUrl();
  const result = await launchWebAuthFlow(url);
  setUser(result.account)
};

// Sign out button
const signOut = async () => {
  const logoutUrl = await getLogoutUrl();
  await launchWebAuthFlow(logoutUrl);
  setUser(null)
};

// Call graph button
const callGraph = async () => {
  const graphResult = await callGraphMeEndpoint();
  console.log(graphResult.displayName);
};

  useEffect(() => {
    fetchScrapedText();
    // Listen for messages from the background script
    const handleMessage = (message) => {
      if (message.action === 'refreshSidepanel') {
        fetchScrapedText();
      }
    };
    chrome.runtime.onMessage.addListener(handleMessage);
    // Cleanup the message listener on component unmount
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []); 
  
  // Render loading state if loading is true
  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", padding: 16 }}>
        <h2>Loading...</h2>
      </div> 
    );
  }

  // Render content once scrapedText is fetched
  return (
    <div style={{ display: "flex", flexDirection: "column", padding: 16 }}>
      {!user && <button onClick={signIn}>Login with O365</button>}
      {user && (
                <div>
                    <h3>Welcome {user.username}</h3>
                    { <p>{scrapedText.text}</p>}
                </div>
            )}
    </div>
  );
}

export default IndexSidePanel;
