<img src="src/icon128.png" alt="Eagler Mobile Logo" align="left" width="53px"></img>
# VerQuill

#### Interactive LaTeX editing in Overleaf, using a custom build of MathQuill

## Keyboard Shortcuts
<b>Open Editor:</b> <kbd>Alt + t</kbd> - Open the in-editor MathQuill editor
 - Must be editing inside the Overleaf code editor 
 - Shortcut can be configured in the extension's options menu

<b>LaTeX Command:</b> <kbd>\\</kbd> - Invoke one of MathQuill's LaTeX commands
 - Must be editing inside the MathQuill editor
 - Suggestions will be displayed below the editor for all registered LaTeX commands and Environment commands

<b>Add Matrix Row:</b> <kbd>Command + Up Arrow</kbd> - Add a row to the current Matrix
- Must be editing inside the MathQuill editor and inside a matrix environment

<b>Add Matrix Column:</b> <kbd>Command + Right Arrow</kbd> - Add a column to the current Matrix
- Must be editing inside the MathQuill editor and inside a matrix environment

<b>Remove Matrix Row:</b> <kbd>Command + Down Arrow</kbd> - Remove a row to the current Matrix
- Must be editing inside the MathQuill editor and inside a matrix environment

<b>Add Matrix Column:</b> <kbd>Command + Left Arrow</kbd> - Remove a column to the current Matrix
- Must be editing inside the MathQuill editor and inside a matrix environment

<b>Use Suggested LaTeX Command:</b> <kbd>Tab</kbd> - Call a suggested LaTeX command 
- Must be editing inside the MathQuill editor and writing a command
- By default, the first suggestion will be used to complete the command
- Other suggestions can be navigated through with <kbd>Up Arrow</kbd> and <kbd>Down Arrow</kbd>, or by mouse
- If no suggestions exist, it will default to MathQuill's default behavior

<b>Use Written LaTeX Command:</b> <kbd>Space</kbd> - Call the LaTeX command without suggestions
- Must be editing inside the MathQuill editor and writing a command
- Uses MathQuill's default behavior for LaTeX commands

<b>Insert LaTeX Into Overleaf</b> <kbd>Return</kbd> - Insert LaTeX into the Overleaf document
- Must be editing inside the MathQuill editor

<b>Exit Editor</b> <kbd>Escape</kbd> - Exit the MathQuill Editor
- Must be editing inside the MathQuill editor
- Any LaTeX written inside the editor will be discarded

## Credits

- [MathQuill Interactive Tweaks](https://github.com/FlamedDogo99/mathquill/tree/interactive-tweaks) - A fork of MathQuill used for [MathQuill Interactive](https://flameddogo99.github.io/Mathquill-Ineractive/)
- [uFuzzy](https://github.com/leeoniya/uFuzzy) - A tiny, efficient fuzzy search that doesn't suck
  - Fuzzy searching used for suggesting LaTeX commands
- [jQuery](https://github.com/jquery/jquery) - jQuery JavaScript Library
  - Needed for MathQuill
- [Shortleaf](https://github.com/andre-al/shortleaf) - Chrome browser extension that adds customizable keyboard shortcuts to the Overleaf online latex editor
  - Shortleaf is the original project that this was built from 

## License

OverQuill is licensed under the terms of the MIT license.

