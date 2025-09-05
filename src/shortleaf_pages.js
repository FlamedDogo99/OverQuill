async function reset_config(){
  await fetch( '/default-config.json' )
    .then( (r)=>{ return r.json() } )
    .then( (r)=>{ 
      chrome.storage.sync.set( { shortleaf_config: r } ); 
      window.location.reload();
    });
}

function controls(){
  let fcontrols = document.createElement('span');
  fcontrols.className = 'controls';
  
  let fmoveup = document.createElement('span');
  fmoveup.className = 'moveupper'
  fmoveup.innerHTML = '&#x1F871;'
  fmoveup.addEventListener( 'click', function(){
    const entry = this.parentNode.parentNode;
    const prev_entry = entry.previousElementSibling;
    if(prev_entry.tagName === 'FORM'){
      entry.after( prev_entry );
      update_shortleaf_config();
    }
  } );
  fcontrols.appendChild(fmoveup);
  
  let fmovedown = document.createElement('span');
  fmovedown.className = 'movedowner'
  fmovedown.innerHTML = '&#x1F873;'
  fmovedown.addEventListener( 'click', function(){
    const entry = this.parentNode.parentNode;
    const next_entry = entry.nextElementSibling;
    if(next_entry.tagName === 'FORM'){
      next_entry.after( entry );
      update_shortleaf_config();
    }
  } );
  fcontrols.appendChild(fmovedown);
  
  
  let fremove = document.createElement('span')
	fremove.className = 'remover';
	fremove.innerHTML = '&#x1F5D9;';
	fremove.addEventListener( 'click', function(){
		this.parentNode.parentNode.remove();
		update_shortleaf_config();
	} );
  
  fcontrols.appendChild( fremove );
  return fcontrols
}

function symb_form( s ){
	let f = document.createElement('form');
	
	let blank = document.createElement('span');
	blank.className = 'blank';
	f.appendChild(blank);
	
	let fname = document.createElement('input');
	fname.className = 'name';
	fname.type = 'text';
	fname.defaultValue = s.name;
	f.appendChild(fname);
	
	let fcommand = document.createElement('input');
	fcommand.className = 'command';	
	fcommand.type = 'text';
	fcommand.defaultValue = s.command;
	f.appendChild(fcommand);
	
	let fshortcut = document.createElement('input');
	fshortcut.className = 'shortcut';	
	fshortcut.type = 'text';
	fshortcut.defaultValue = s.shortcut;
	f.appendChild(fshortcut);
	
	f.oninput = function(){ update_shortleaf_config(); };
	
  let fcontrols = controls();
  f.appendChild( fcontrols );
	
	return( f );
}

function comm_form( s ){
	let f = document.createElement('form');
		
	let blank = document.createElement('span');
	blank.className = 'blank';
	f.appendChild(blank);
	
	let fname = document.createElement('input');
	fname.className = 'name';
	fname.type = 'text';
	fname.defaultValue = s.name;
	f.appendChild(fname);
	
	let fcommand = document.createElement('input');
	fcommand.className = 'command';	
	fcommand.type = 'text';
	fcommand.defaultValue = s.command;
	f.appendChild(fcommand);
	
	let fshortcut = document.createElement('input');
	fshortcut.className = 'shortcut';	
	fshortcut.type = 'text';
	fshortcut.defaultValue = s.shortcut;
	f.appendChild(fshortcut);
	
	f.oninput = function(){ update_shortleaf_config(); };
	
  let fcontrols = controls();
  f.appendChild( fcontrols );
	
	return( f );
}

function env_form( s ){
	let f = document.createElement('form');
		
	let blank = document.createElement('span');
	blank.className = 'blank';
	f.appendChild(blank);
	
	let fname = document.createElement('input');
	fname.className = 'name';
	fname.type = 'text';
	fname.defaultValue = s.name;
	f.appendChild(fname);
	
	let fenv = document.createElement('input');
	fenv.className = 'env';	
	fenv.type = 'text';
	fenv.defaultValue = s.env;
	f.appendChild(fenv);
	
	let fshortcut = document.createElement('input');
	fshortcut.className = 'shortcut';	
	fshortcut.type = 'text';
	fshortcut.defaultValue = s.shortcut;
	f.appendChild(fshortcut);
	
	f.oninput = function(){ update_shortleaf_config(); };
	
  let fcontrols = controls();
  f.appendChild( fcontrols );
	
	return( f );
}
function editor_form( s ){
  let f = document.createElement('form');

  let blank = document.createElement('span');
  blank.className = 'blank';
  f.appendChild(blank);

  let fshortcut = document.createElement('input');
  fshortcut.className = 'shortcut';
  fshortcut.type = 'text';
  fshortcut.defaultValue = s.shortcut;
  f.appendChild(fshortcut);

  f.oninput = function(){ update_shortleaf_config(); };

  let fcontrols = controls();
  f.appendChild( fcontrols );

  return( f );
}

function read_div_forms(div){
	let obj = []; // Create empty array
	for (const f of div.getElementsByTagName('form') ) { // Loop over forms
		let aux = {}; // Auxiliary object
		for (const i of f ){ // Loop over input fields
			if(i.tagName === 'INPUT'){
				aux[i.className] = i.value; // Add input entry to auxiliary object
			}
		}
		obj.push( aux ); // Commit auxiliary object to array
	}
	
	return( obj );
}

function update_shortleaf_config(){
	let symbols = read_div_forms( document.getElementById('symbols') );
	let commands = read_div_forms( document.getElementById('commands') );
	let envs = read_div_forms( document.getElementById('envs') );
  let editor = read_div_forms( document.getElementById('editor') );
	
	chrome.storage.sync.set( { 
		'shortleaf_config':
			{
				'symbols': symbols,
				'commands': commands,
				'environments': envs,
        'editor': editor
			}
	} );
}

function hide_toggle(){
	let right_tri = String.fromCharCode( 9654 );
	let down_tri = String.fromCharCode( 9660 );
  
  this.innerHTML = this.innerHTML.replace( 
    RegExp('[' + right_tri + '|' + down_tri + ']' ), 
    ( match ) => { if(match === right_tri) return down_tri; else return right_tri; }
  );
  
  this.nextElementSibling.classList.toggle( 'collapsed' );
}


async function options_page(){
  let shortleaf_config  = {};
	
	// Load configs from sync storage or default
  await chrome.storage.sync.get( { 'shortleaf_config': null } ).then(
	  (data) => {
		shortleaf_config = data.shortleaf_config;
    // If no config set, set default ones
    if(shortleaf_config === null){
      reset_config();
      return;
    }

		// Symbols menu
		{
			let symbols_div = document.getElementById('symbols');
			
			for (const s of shortleaf_config.symbols){
				symbols_div.appendChild( symb_form(s) );
			}
			let add = document.createElement('button')
			add.innerHTML = 'Add new'
			add.addEventListener("click", 
				function(){
					this.parentElement.insertBefore( symb_form( {name: '', command: '', shortcut: ''} ), this );
				}
			);
			symbols_div.appendChild( add );
			
			symbols_div.appendChild( document.createElement('br') );
			symbols_div.appendChild( document.createElement('hr') );
			symbols_div.appendChild( document.createElement('br') );
		}
		
		// Commands menu
		{
			let commands_div = document.getElementById('commands');
			for (const c of shortleaf_config.commands){
				commands_div.appendChild( comm_form(c) );
			}
			let add = document.createElement('button')
			add.innerHTML = 'Add new'
			add.addEventListener("click", 
				function(){
					this.parentElement.insertBefore( comm_form( {name: '', command: '', shortcut: ''} ), this );
				}
			);
			commands_div.appendChild( add );
			
			commands_div.appendChild( document.createElement('br') );
			commands_div.appendChild( document.createElement('hr') );
			commands_div.appendChild( document.createElement('br') );
		}
		
		// Environments menu
		{
			let env_div = document.getElementById('envs');
			for (const e of shortleaf_config.environments){
				env_div.appendChild( env_form(e) );
			}
			let add = document.createElement('button')
			add.innerHTML = 'Add new'
			add.addEventListener("click", 
				function(){
					this.parentElement.insertBefore( env_form( {name: '', env: '', shortcut: ''} ), this );
				}
			);
			env_div.appendChild( add );
			
			env_div.appendChild( document.createElement('br') );
			env_div.appendChild( document.createElement('hr') );
			env_div.appendChild( document.createElement('br') );
		}

      // Editor menu
      {
        let editor_div = document.getElementById('editor');
        for (const e of shortleaf_config.editor){
          editor_div.appendChild( editor_form(e) );
        }
        let add = document.createElement('button')
        add.innerHTML = 'Add new'
        add.addEventListener("click",
          function(){
            this.parentElement.insertBefore( editor_form( {shortcut: ''} ), this );
          }
        );
        editor_div.appendChild( add );

        editor_div.appendChild( document.createElement('br') );
        editor_div.appendChild( document.createElement('hr') );
        editor_div.appendChild( document.createElement('br') );
      }
		
	  });
    
	// Add functionality to reset config button
	document.getElementById('reset_config').addEventListener("click", reset_config);
}

function changelog_page(){
  chrome.runtime.onMessage.addListener(
    (msg) => {
      console.log(msg)
      if(msg.updated) document.getElementById('subtitle').innerHTML = 'Shortleaf has been updated! This is what is new:'
    }
  )
}

window.addEventListener('load', async () => {
  
  for(const t of document.getElementsByClassName('toggle') ){
    t.addEventListener( 'click', hide_toggle ) 
  }
  
  let path = window.location.pathname;
  if ( path === '/options.html') await options_page();
  else if ( path === '/changelog.html' ) changelog_page();
});

