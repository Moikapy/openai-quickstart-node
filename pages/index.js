import Head from 'next/head';
import React, {useState, useEffect} from 'react';
import styles from './index.module.css';

export default function Home() {
  const [textInput, setTextInput] = useState('');
  const [result, setResult] = useState();
  useEffect(() => {}, [result]);

  async function onSubmit(event) {
    event.preventDefault();
     function getLastTen(arr) {
       // Check if the array has less than 10 items
       if (arr.length <= 25) {
         return arr;
       } else {
         // Return the last 10 items in the array
         return arr.slice(-25);
       }
     }
    const prev_text = getLastTen(getFromLocalStorage());
    try {
      let arr=[];
      prev_text.map(({prompt,result})=>{
        arr.push(`USER: ${prompt}. ${result}.`)
      });
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({text: arr.join(' ') +'USER: '+ textInput}),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw (
          data.error ||
          new Error(`Request failed with status ${response.status}`)
        );
      }

      setResult(data.result);
      saveToLocalStorage(textInput, data.result);
      setTextInput('');
    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }

  return (
    <div>
      <Head>
        <title>OpenAI Quickstart</title>
      </Head>

      <main className={styles.main}>
        <form onSubmit={onSubmit}>
          <input
            type='text'
            name='_text'
            placeholder='Enter Text'
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
          <input type='submit' value='Generate results' />
        </form>
        <div className={styles.result}>
          <TextWithLineBreaks text={result} />
        </div>
      </main>
    </div>
  );
}
const TextWithLineBreaks = ({text = ''}) => {
  const lines = text.split('\n');

  return (
    <p>
      {lines.map((line, index) => (
        <React.Fragment key={index}>
          {line}
          <br />
        </React.Fragment>
      ))}
    </p>
  );
};

// Save a new prompt and result to LocalStorage
function saveToLocalStorage(prompt, result) {
  if (typeof window === 'undefined') return;
  // Get the existing data from LocalStorage
  let data = JSON.parse(localStorage.getItem('data')) || [];
  // Add the new prompt and result to the data
  data.push({prompt: prompt, result: result});
  // Save the data to LocalStorage
  localStorage.setItem('data', JSON.stringify(data));
}

// Get the data from LocalStorage
function getFromLocalStorage() {
  if (typeof window === 'undefined') return;
  const data = JSON.parse(localStorage.getItem('data')) || [];
  return data;
}

// Remove the data from LocalStorage
function removeFromLocalStorage() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('data');
}