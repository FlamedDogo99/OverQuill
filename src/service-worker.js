// Open config page if just installed or updated from 0.1.
chrome.runtime.onInstalled.addListener(function (e){
  if(e.reason === 'install'){
    chrome.tabs.create({url: '/options.html'});
	}
  if(e.reason === 'update'){
    if( e.previousVersion === '0.1' || e.previousVersion === '0.1.1' ){
      chrome.storage.sync.remove( 'shortleaf_config' )
      chrome.tabs.create({url: '/options.html'});
    }
    chrome.tabs.create({url: '/changelog.html'})
      .then( tab => {
      chrome.tabs.onUpdated.addListener( (id, chg)=>{
        if(id === tab.id && chg.status === 'complete')
          chrome.tabs.sendMessage( tab.id, {updated: true, previousVersion: e.previousVersion} ) 
        })
      });
  }
});

chrome.runtime.onMessage.addListener((msg)=> {
  if(msg.open_options) chrome.tabs.create({url: '/options.html'});
});
