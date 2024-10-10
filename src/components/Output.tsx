import React, { useState, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import axios from "axios"

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const QueryOutputTable = ({ queryOutput }) => {
  // Get the column names from the keys of the queryOutput
  const columnNames = Object.keys(queryOutput);
  
  // Determine the maximum number of rows across all columns
  const maxRows = Math.max(...Object.values(queryOutput).map(arr => arr.length));

  return (
    <div  className="text-black w-full flex flex-col  items-center p-4">
      <div className='m-4 text-3xl font-bold text-black flex justify-center '>Query Output</div>
      <table border="1" cellPadding="8" cellSpacing="0" className="w-full">
        <thead>
          <tr className="text-md font-semibold tracking-wide text-left text-gray-900 bg-gray-100 uppercase border-b border-gray-600">
            {columnNames.map((key) => (
              <th key={key} className="px-4 py-3">{key}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {Array.from({ length: maxRows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="text-gray-700">
              {columnNames.map((key) => (
                <td key={key} className="px-4 py-3 border">
                  {queryOutput[key][rowIndex] ? queryOutput[key][rowIndex].text : '-'} {/* Display '-' for empty cells */}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

var resolution = [1693, 2180]
function WordHighlight({words, width, height}) {
  const [hoveredWord, setHoveredWord] = useState(null);

  return (
    <div className="top-0 left-0 absolute w-full h-full" style = {{width, height}}>
      <div className="relative w-full h-full">
        {words.map(word => {
          return (
            <div 
            className="absolute bg-[#fa0000] opacity-[50%]" 
            style={{
              left: `${100*word.bounding_box.topleft.x/word.resolution[0]}%`, 
              top: `${100*word.bounding_box.topleft.y/word.resolution[1]}%`, 
              width: `${100*(-word.bounding_box.topleft.x + word.bounding_box.bottomright.x)/word.resolution[0]}%`,
              height: `${100*(-word.bounding_box.topleft.y + word.bounding_box.bottomright.y)/word.resolution[1]}%`
            }}
            key={word.center.x + word.center.y}
            onMouseEnter={() => setHoveredWord(word)}
            onMouseLeave={() => setHoveredWord(null)}
            >
            </div>)
        })}
        {hoveredWord && (
          <div
            className="absolute bg-white text-black p-2 rounded shadow-lg"
            style={{
              left: `${100 * (hoveredWord.bounding_box.topleft.x + 20)/ hoveredWord.resolution[0]}%`,
              top: `${100 * (hoveredWord.bounding_box.topleft.y + 20) / hoveredWord.resolution[1]}%`,
            }}
          >
            {/* Display word details here */}
            <p><strong>Word:</strong> {hoveredWord.text}</p>
            <p><strong>Location:</strong> ({hoveredWord.center.x}, {hoveredWord.center.y})</p>
          </div>
        )}
      </div>
    </div>
  )
}

function Output({ query , viewTable}) {
  const [pdfData, setPdfData] = useState(null);
  const [pdfWidth, setPdfWidth] = useState(400);
  const [pdfHeight, setPdfHeight] = useState(400);

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const [words, setWords] = useState([]);
  const [queryOutput, setQueryOutput] = useState({})

  const [selectedKeys, setSelectedKeys] = useState([]);

  const handleCheckboxChange = (key) => {
    if (selectedKeys.includes(key)) {
      const newSelectedKeys = selectedKeys.filter((k) => k !== key);
      setSelectedKeys(newSelectedKeys);
      const newWords = words.filter(word => !queryOutput[key].includes(word));
      setWords(newWords);
    } else {
      console.log(queryOutput[key])
      setSelectedKeys([...selectedKeys, key]);
      setWords([...words, ...queryOutput[key]]);
    }
  };

  useEffect(() => {
    setPdfWidth(document.getElementById("pdf").clientWidth)
    addEventListener("resize", (event) => {
      setPdfWidth(document.getElementById("pdf").clientWidth)
    });

    const fetchWords = async () => {
      const response = await axios.post("http://127.0.0.1:5000/run_query", {query})
      setQueryOutput(response.data)
      setWords([])
    };

    const fetchPdf = async () => {
      const response = await fetch('http://127.0.0.1:5000/pdf', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/pdf',
        },
      });
      const blob = await response.blob();
      const pdfUrl = URL.createObjectURL(blob);
      setPdfData(pdfUrl);
      setPdfWidth(document.getElementById("pdf").clientWidth)
      setTimeout(() => {
        setWidth(document.getElementsByClassName("react-pdf__Document")[0].clientWidth)
        setHeight(document.getElementsByClassName("react-pdf__Document")[0].clientHeight)
      }, 1000)
      fetchWords();
    };
    fetchPdf();
  }, [query]);
  
  if(!viewTable) {
    return (
        <div id="pdf" className="relative w-full overflow-auto">
          <div className="absolute top-24 w-full">
            <div className="relative flex flex-col w-full overflow-auto">
              {pdfData && (
                <Document file={pdfData}>
                  <Page width={pdfWidth} pageNumber={1} renderAnnotationLayer={false} renderTextLayer={false}/>
                </Document>
              )}
              <WordHighlight words={words} width={width} height={height}/>
            </div>
          </div>
          <div className="fixed top-0 w-1/2 h-20 bg-white text-black flex justify-evenly">
            {Object.keys(queryOutput).map((key) => (
              <div key={key}>
                <label>
                  <input
                    type="checkbox"
                    className="m-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600
                    value={key}"
                    checked={selectedKeys.includes(key)}
                    onChange={() => handleCheckboxChange(key)}
                  />
                  {key}
                </label>
              </div>
            ))}
          </div>
        </div>
    );
  } else {
    return (
      <QueryOutputTable queryOutput={queryOutput}/>
    );
  }
}

export default Output;
