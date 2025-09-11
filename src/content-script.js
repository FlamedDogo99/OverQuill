function sendConfig(){
  chrome.storage.sync.get( { 'overquill_config': {} },
    function(data){
      document.dispatchEvent(new CustomEvent('overquill_config_send', { detail: data } ));
    }
  );
}
document.addEventListener('overquill_config_listen', sendConfig);

chrome.storage.onChanged.addListener(
  function( changes, area ){
    if( area === 'sync' && changes.overquill_config.newValue !== null ){
      sendConfig();
    }
  }
);

// Fix shortcuts with dead keys, by intercepting when pressed and relaying if space is pressed.
window.addEventListener('load', function(){
  injectIntoMain();
  document.addEventListener( 'keydown', (deadEvent) => {
    if(deadEvent.key === 'Dead') {
      document.addEventListener( 'keydown', spaceEvent=> {
          if(spaceEvent.code === 'Space') {
            const init = { code: deadEvent.code, key: spaceEvent.key, altKey: deadEvent.altKey, cancelable: true }
            let reformattedEvent = new KeyboardEvent( 'keydown', init);
            if(!spaceEvent.target.dispatchEvent( reformattedEvent )) spaceEvent.preventDefault()
          }
        },{once: true}
      );
    }
  });
});

function injectIntoMain() {
  const injectScript = document.createElement("script");
  injectScript.type = "module";
  injectScript.src = chrome.runtime.getURL("injected.js");
  document.body.appendChild(injectScript);
}