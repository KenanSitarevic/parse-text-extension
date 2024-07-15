import  * as msal from "@azure/msal-browser";

// Set the redirect URI to the chromiumapp.com provided by Chromium
const redirectUri = typeof chrome !== "undefined" && chrome.identity ?
    chrome.identity.getRedirectURL() : 
    `${window.location.origin}/sidepanel.html`;

const msalInstance = new msal.PublicClientApplication({
    auth: {
        authority: "https://login.microsoftonline.com/common/",
        clientId: "1fcabda9-395e-4812-a1af-dadc72769e9b",
        redirectUri,
        postLogoutRedirectUri: redirectUri
    },
    cache: {
        cacheLocation: "localStorage"
    }
});

msalInstance.initialize().then(() => {
    msalInstance.handleRedirectPromise().then(()=>{
        // Set currently logged in account
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length) {
            console.log(accounts[0].username)
        }
    }).catch(err => {
        console.error(err);
    });
});


//  Generates a login url
export async function getLoginUrl(request, reject) {
    return new Promise((resolve) => {
        msalInstance.loginRedirect({
            ...request,
            onRedirectNavigate: (url) => {
                resolve(url);
                return false;
            }
        }).catch(reject);
    });
}


// Generates a logout url
export async function getLogoutUrl(request) {
    return new Promise((resolve, reject) => {
        msalInstance.logout({
            ...request,
            onRedirectNavigate: (url) => {
                resolve(url);
                return false;
            }
        }).catch(reject);
    });
}


// Makes an http request to the MS graph Me endpoint
export async function callGraphMeEndpoint() {
    const {
        accessToken
    } = await acquireToken({
        scopes: [ "user.read" ],
        account: msalInstance.getAllAccounts()[0]
    });
    return callMSGraph("https://graph.microsoft.com/v1.0/me", accessToken);
}


// Makes an http request to the given MS graph endpoint

async function callMSGraph(endpoint, accessToken) {
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);

    const options = {
        method: "GET",
        headers
    };

    return fetch(endpoint, options)
        .then(response => response.json())
        .catch(error => console.log(error));
}


// Attempts to silent acquire an access token, falling back to interactive.
async function acquireToken(request) {
    return msalInstance.acquireTokenSilent(request)
        .catch(async (error) => {
            console.error(error);
            const acquireTokenUrl = await getAcquireTokenUrl(request);

            return launchWebAuthFlow(acquireTokenUrl);
        })
}

// Generates an acquire token url
async function getAcquireTokenUrl(request) {
    return new Promise((resolve, reject) => {
        msalInstance.acquireTokenRedirect({
            ...request,
            onRedirectNavigate: (url) => {
                resolve(url);
                return false;
            }
        }).catch(reject);
    });
}


// Launch the Chromium web auth UI.
// @param {*} url AAD url to navigate to.
// @param {*} interactive Whether or not the flow is interactive
export async function launchWebAuthFlow(url) {
    return new Promise((resolve, reject) => {
        chrome.identity.launchWebAuthFlow({
            interactive: true,
            url
        }, (responseUrl) => {
            // Response urls includes a hash (login, acquire token calls)
            if (responseUrl.includes("#")) {
                msalInstance.handleRedirectPromise(`#${responseUrl.split("#")[1]}`)
                    .then(resolve)
                    .catch(reject)
            } else {
                // Logout calls
                resolve();
            }
        })
    })
}


// Returns the user sign into the browser.
async function getSignedInUser() {
    return new Promise((resolve, reject) => {
        if (chrome && chrome.identity) {
            // Running in extension popup
            chrome.identity.getProfileUserInfo((user) => {
                if (user) {
                    resolve(user);
                } else {
                    resolve(null);
                }
            });
        } else {
            // Running on localhost
            resolve(null);
        }
    })
}