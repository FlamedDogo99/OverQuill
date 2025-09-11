
function resetSettings() {
  const url = chrome.runtime.getURL("defaultOptions.json");
  return new Promise((resolve, reject) => {
    fetch(url)
      .then(response => {return response.json()})
      .then(json => {return chrome.storage.sync.set({overquill_config: json})})
      .then(defaultSettings => resolve(defaultSettings))
      .catch(reason => reject(reason));
  });
}

chrome.runtime.onInstalled.addListener(function(details){
  if(details.reason === "install") {
    resetSettings()
      .catch(reason => {
        console.debug(reason);
        throw new Error("Couldn't set settings on install");
      })
  }
});
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({url: '/options.html'})
    .catch(reason => {
      console.error(reason)
    });
});

function overquillMessage(message, sender, sendResponse) {
  const messageName = message.name
  if (messageName === "resetSettings") {
    resetSettings()
      .then(data => sendResponse(data))
      .catch(reason => {
        console.error(reason);
      })
  }
}

chrome.runtime.onMessage.addListener(overquillMessage);