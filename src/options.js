function resetConfig(){
  chrome.runtime.sendMessage({name: "resetSettings"})
    .catch(reason => {
      throw new Error(reason);
    })
}

function updateOverquillConfig(keybind){
	chrome.storage.sync.set( { 
		'overquill_config':
			{
        shortcuts: {
          'openEditor': keybind
        }
			}
	})
    .catch(reason => {
      console.error(reason);
    });
}

function optionsPage(){
  let settings  = {};
  chrome.storage.sync.get({'overquill_config': null})
    .then(data => {
      settings = data.overquill_config;
      if(settings === null){
        resetConfig();
        return;
      }
      const shortcutInput = document.getElementById("editorShortcut");
      shortcutInput.value = settings.shortcuts.openEditor
      shortcutInput.addEventListener("input", function(event) {
        updateOverquillConfig(event.target.value)
      })
	  });
	document.getElementById('reset_config').addEventListener("click", resetConfig);
}

optionsPage();