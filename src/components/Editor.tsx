import { useState } from "react"
import QueryEditor from '@monaco-editor/react';

function Query({query}) {
  return (
    <div className="w-full h-20 p-2">
      <div className="query text-xl font-bold font-mono align-middle flex h-full p-4 bg-[#fafafa] text-black items-center rounded shadow" contentEditable={true}>
        {query}
      </div>
    </div>
 );
}

export default function Editor({query, setQuery, viewTable, setViewTable}) {
  const handleEditorWillMount = (monaco) => {
    // Register a new custom language
    monaco.languages.register({ id: 'parser' });

    // Define tokens and their syntax rules
    monaco.languages.setMonarchTokensProvider('parser', {
      tokenizer: {
        root: [
          [/\b(select|export|with|as|from|set|and|or|where)\b/, 'keyword'],
        ],
      },
    });

    // Define a custom theme to highlight keywords
    monaco.editor.defineTheme('parser-theme', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '0000FF', fontStyle: 'bold' }, // Blue for keywords
        { token: 'string', foreground: 'A31515' },                     // Red for strings
        { token: 'comment', foreground: '008000', fontStyle: 'italic' }, // Green italic for comments
        { token: 'number', foreground: '098658' },                     // Dark green for numbers
        { token: '@brackets', foreground: '000000' },                  // Black for brackets
      ],
      colors: {
        'editor.background': '#FFFFFF',        // White background
        'editor.lineHighlightBackground': '#FFFFFF', // Light gray for current line
        'editorLineNumber.foreground': '#237893', // Blue-gray for line numbers
        'editorCursor.foreground': '#000000', // Black cursor
        'editor.selectionBackground': '#ADD6FF', // Light blue for selection background
      },
    });
  };
  
  const [code, setCode] = useState(query)
    
  return (
    <div className='h-full w-full flex flex-col p-4'>
       <div className='m-4 text-3xl font-bold text-black flex justify-center '>Query Editor</div>
       <div className="p-4 border border-[#AAAAAA]">
        <QueryEditor 
          height="75vh"
          theme="parser-theme"
          language="parser"
          options={{fontSize: 20, minimap: {enabled: false}, wordWrap: 'on'}}
          value={code}
          onChange={(v, e) => setCode(v)}
          beforeMount={handleEditorWillMount}
        />
      </div>
      <div className="flex flex-row justify-between w-full">
        <button className="text-black font-bold border-[#aaaaaa] border border-t-0 shadow p-4 w-full" onClick={()=>{setQuery(code)}}>Execute Query</button>
        <button className="text-black font-bold border-[#aaaaaa] border border-t-0 border-l-0 shadow p-4 w-full" onClick={()=>{setViewTable(!viewTable)}}>{viewTable ? "View PDF" : "View Table"}</button>
      </div>
    </div>
  )
}
