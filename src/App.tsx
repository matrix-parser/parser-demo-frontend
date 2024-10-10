import './App.css'
import Output from "./components/Output"
import Editor from "./components/Editor"

import { useState, useEffect } from "react"

function App() {
  const [queries, setQueries] = useState([
    `set quantity_minimum = 2
    select keys from words as word where 180 < word.center.x < 200 and word.center.y > 800
    select prices from words as word where 1000 < word.center.x < 1200 and 1100 > word.center.y > 800
    select amounts from words as word with keys as key where 1400 < word.center.x < 1500 and -20 < (key.center.y - word.center.y) < 20
    export keys as keys
    export amounts as amounts
    export prices as prices`
  ])

  const [query, setQuery] = useState(
    `
`

)




const [viewTable, setViewTable] = useState(false);

  return (
    <div className="flex flex-row w-screen h-screen bg-white">
      <Output query={query} viewTable={viewTable}/>
      <Editor query={query} setQuery={setQuery} viewTable={viewTable} setViewTable={setViewTable}/>
    </div>
  )
}

export default App
