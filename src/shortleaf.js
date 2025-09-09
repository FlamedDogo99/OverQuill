// Note to self: use this when the API changes to explore the new one
// const dispatchEvent_original = EventTarget.prototype.dispatchEvent;
// EventTarget.prototype.dispatchEvent = function (event) {
    // console.log('Event type: ', event.type);
    // console.log('Event detail: ', event.detail);
    // dispatchEvent_original.apply(this, arguments);
// };
let cm, view, keymap, kb_compartment;
let Prec = null;


// Get the bindings for the codemirror API
let get_codemirror = new Promise( 
  (resolve) => { 
    window.addEventListener( 'UNSTABLE_editor:extensions',
      (e)=>{
        cm = e.detail.CodeMirror;
        keymap = cm.keymap;
        resolve();
      }, {once: true});
  });

function get_view(){
  return new Promise( async (resolve)=>{
    await get_codemirror;
    
    view = cm.EditorView.findFromDOM(document);
    // Check every 100ms if view is configured. Resolve promise when it is.
    let conf_interval = setInterval( 
      () =>{ if( view.state.config.base.length > 0 ) resolve(true); clearInterval(conf_interval); }
      , 100);
  });
}

let shortcuts = [];

// Prebinds (pending dispatch) a function to a key shortcut. 
// General function to be used by other specialized binding functions.
function bind_function(shortcut, func){
  shortcuts.push( {key: shortcut.replace( /(ctrl|cmd)/i, 'mod' ), run: func} )
}

// Bind a symbol
function bind_symbol(shortcut, symbol){
  bind_function( 
    shortcut,
    function(){ view.dispatch( view.state.replaceSelection(symbol) ); return true; }
  );
}

// Bind a command, like \srqt{}, separating left-right at the first { } or [ ] automatically.
function bind_command( shortcut, command ){
  
  // ** Smart insertion: **
  let insert_pos = command.indexOf('%.%');
  // If selection insertion point unmarked, mark by searching for first empty (i.e only whitespaces) curly or square brackets
  if (insert_pos === -1){
    const curly = command.search( /(?<!\\){\s*(?<!\\)}/ );
    const square = command.search( /(?<!\\)\[\s*(?<!\\)]/ );
    if( curly !== -1 ){
      if( square !== -1 ){ insert_pos = Math.min( curly, square ) + 1 }
      else{ insert_pos = curly + 1}
    } else{
      if( square !== -1 ){ insert_pos = square + 1 }
      else{ insert_pos = command.length }
    }
    // Should probably come back to this treatment of whitespaces and adjust for tabs in multiline commands
    const whitespace_count = command.substring(insert_pos).match( /^\s*/ )[0].length
    insert_pos = insert_pos + Math.trunc( whitespace_count / 2 )
  }
  command = command.replace('%.%', '');
  // Pre-calculate insertion halves
  let command_left = command.substring( 0, insert_pos ).replaceAll( '%|%', '' );
  let command_right = command.substring( insert_pos ).replaceAll( '%|%', '' );
  
  // ** Smart selection: **  
  let move_range; // Edit end range according to smart selection. Does this in place, returns void.
  {
    let selection_from, selection_to, delta_from, delta_to;
    
    selection_from = command.indexOf('%|%');
    selection_to = command.indexOf('%|%', selection_from+3);
    
    delta_from = selection_from - insert_pos
    delta_to = selection_to - insert_pos
    
    if(selection_from === -1){ // Keep selection
      move_range = function(){};
    } else if (selection_to === -1){ // Cursor-type selection
      move_range = (r)=>{
        r.from = ( delta_from < 0 ? r.from + 3 : r.to ) + delta_from
        r.to = r.from
      }
    }
    else{
      move_range = (r)=>{
        let r_from = ( delta_from < 0 ? r.from + 3 : r.to ) + delta_from + ( delta_to < 0 ? 3 : 0 ) 
        r.to = ( delta_to < 0 ? r.from + 3 : r.to ) + delta_to - ( delta_from >= 0 ? 3 : 0 )
        r.from = r_from

      }
    }
  }
  
  bind_function( 
    shortcut,
    function(){
      const changes = view.state.changeByRange(
        (range)=>{
          view.state.sliceDoc( range.from, range.to );
// let indent_string = view.state.doc.lineAt( range.from ).text.match( /^(\s*)/ );
          // console.log(indent_string[0]);

          let chgs = view.state.changes( {from: range.from, insert: command_left} );
          let end_range = range.map( chgs.desc, assoc=1 )
          chgs = [ chgs, view.state.changes( {from: range.to, insert: command_right} ) ];

          move_range(end_range);

          return{
            range: end_range,
            changes: chgs
          }
        }
      );
      view.dispatch( changes );   
      return true;
    }
  )
}

function bind_environment( shortcut, environment){
  bind_command( shortcut, "\\begin{"+environment+"}\n\t%.%\n\\end{"+environment+"}\n" );
}



function load_symbols( symbols ){
  for (const s of symbols){
    bind_symbol( s.shortcut, s.command );
  }
}

function load_commands( commands ){
  for (const c of commands){
    bind_command( c.shortcut, c.command );
  }
}

function load_envs( environments ){
  for (const e of environments){
    bind_environment( e.shortcut, e.env );
  }
}
function getCommandWrapper(editorInstance) {
  const cursor = editorInstance?.__controller?.cursor;
  if(!cursor) return false;
  const wrapper = cursor?.parent?.parent;
  if(!wrapper) return false;
  return wrapper._el.classList.contains("mq-latex-command-input-wrapper") ? wrapper : false;
}
function resultSpanClick(commandWrapper, editorInstance, command) {
  commandWrapper.setDOM(commandWrapper.domFrag().children().lastElement());
  commandWrapper.remove();
  const cursor = editorInstance.__controller.cursor;
  if (commandWrapper[1]) {
    cursor.insLeftOf(commandWrapper[1]);
  } else {
    cursor.insAtRightEnd(commandWrapper.parent);
  }
  editorInstance.cmd(command);
}

function load_editor( editor ){
  let editorShown = false;

  const editorDiv = document.createElement('div');
  editorDiv.id = "editorDiv";
  const mathSpan = document.createElement('span');
  mathSpan.id = "mq-editor-field";
  const resultsDiv = document.createElement('div');
  resultsDiv.id = "resultsDiv"
  editorDiv.appendChild(mathSpan);
  document.body.appendChild(editorDiv);
  editorDiv.style.display = "none"

  const editorSpan = document.getElementById('mq-editor-field');
  const MQ = MathQuill.getInterface(2);
  let cmds = [];
  //TODO: Implement autofill navigation with keyboard events
  let closestCommands = []
  let highlightedSuggestionIndex = false;
  let maxResultCount = 8
  const editorInstance = MQ.MathField(editorSpan, {
    spaceBehavesLikeTab: false,
    restrictMismatchedBrackets: false,
    autoCommands:
      "alpha beta sqrt theta phi rho pi tau nthroot cbrt sum prod integral percent infinity infty cross ans frac int gamma Gamma delta Delta epsilon zeta eta Theta iota kappa lambda Lambda mu Xi xi Pi sigma Sigma upsilon Upsilon Phi chi psi Psi omega Omega",
    charsThatBreakOutOfSupSub: "",
    handlers: {
      edit: function() {
        resultsDiv.replaceChildren();
        closestCommands = [];
        highlightedSuggestionIndex = false;
        const commandWrapper = getCommandWrapper(editorInstance);
        if(commandWrapper) {
          const text = commandWrapper.text()
          if(text.length > 1) {
            const partialCommand = text.slice(1);
            let ufuzzy = new UfuzzyMin();

            let idxs = ufuzzy.filter(cmds, partialCommand);
            let info = ufuzzy.info(idxs, cmds, partialCommand);
            let order = ufuzzy.sort(info, cmds, partialCommand);

            const mark = (part, matched) => matched ? '<b>' + part + '</b>' : part;
            for (let i = 0; i < Math.min(maxResultCount, order.length); i++) {
              let infoIdx = order[i];
              const command = cmds[info.idx[infoIdx]]
              closestCommands.push(command);
              const resultSpan = document.createElement("span");
              resultSpan.id = "result-" + i;
              resultSpan.classList.add("resultSpan")
              resultSpan.innerHTML = UfuzzyMin.highlight(cmds[info.idx[infoIdx]], info.ranges[infoIdx], mark);
              resultSpan.addEventListener("click", ()=>{
                resultSpanClick(commandWrapper, editorInstance, command);
              },{once: true});
              resultsDiv.appendChild(resultSpan);
            }
            if(order.length > 0) {
              highlightedSuggestionIndex = 1;
            }
          }
        }
      }
    }
  })
  cmds = editorInstance.getCommandKeys();

  editorSpan.appendChild(resultsDiv)
  editorDiv.addEventListener("keydown", function(event) {
    if(!editorShown) return;
    const isReturn = event.key === "Enter";
    const isEscape = event.key === "Escape";
    if(isReturn || isEscape) {
      event.preventDefault();
      event.stopPropagation();
      isReturn && view.dispatch( view.state.replaceSelection(editorInstance.latex()));
      editorInstance.latex("");
      editorShown = false;
      editorDiv.style.display = "none";
      view.focus()
      return false;
    }

    if(!event.metaKey) return;
    if(event.key === "ArrowUp") {
      debugger;
      event.preventDefault();
      event.stopPropagation();
      editorInstance.matrixCmd("addRow", -1);
      return false;
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      event.stopPropagation()
      editorInstance.matrixCmd('deleteRow');
      return false;
    } else if (event.key === "ArrowRight") {
      debugger;
      event.preventDefault();
      event.stopPropagation()
      editorInstance.matrixCmd('addColumn', -1);
      return false;
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      event.stopPropagation()
      editorInstance.matrixCmd('deleteColumn');
      return false;
    }
  })

  bind_function(editor[0].shortcut, function() {
    editorShown = editorShown === false;
    editorDiv.style.display = editorShown ? "" : "none";
    editorInstance.focus();
    return true;
  })
}


get_codemirror.then( ()=>{
  let kb_compartment_load = get_view().then( ()=>{
      // Define new compartment to hold keybindings by finding any old compartment,
      let old_compartment = view.state.config.compartments.keys().next();
      // Compartmenting an empty set of keymaps using the .of method of the old compartment
      kb_compartment = old_compartment.value.of( keymap.of([]) );
      // And using the compartment constructor method to assign this task to a new compartment
      kb_compartment.compartment =  new old_compartment.value.constructor;
      
      function get_Prec(a){
        if( Array.isArray(a) ){
          for(const a_i of a.values() ){
            get_Prec(a_i)
            if( Prec !== null ) return;
          }
        } else{
          if( "prec" in a ){
            Prec = a.constructor;
          }

        }
      }
      get_Prec( view.state.config.base);
    });

  document.addEventListener('shortleaf_config_send', (e)=>{   
    let shortleaf_config = e.detail.shortleaf_config;
    shortcuts = [];
    load_symbols( shortleaf_config.symbols );
    load_commands( shortleaf_config.commands );
    load_envs( shortleaf_config.environments );
    load_editor( shortleaf_config.editor );

    view.dispatch( {effects: kb_compartment.compartment.reconfigure( new Prec( keymap.of(shortcuts), 1 ) )} ); 
  });

  async function prepare_for_shortcuts(){
      await get_view();
      
      await kb_compartment_load;
      view.dispatch( {effects: cm.StateEffect.appendConfig.of( [ kb_compartment ] ) });

      document.dispatchEvent(new CustomEvent('shortleaf_config_listen'));
  }

  prepare_for_shortcuts();
  window.addEventListener( 'doc:after-opened', prepare_for_shortcuts );
});