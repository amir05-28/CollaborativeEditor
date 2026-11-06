import React from 'react'
import './App.css'
import {Editor} from '@monaco-editor/react'
import { MonacoBinding} from "y-monaco"
import {useRef, useMemo, useState, useEffect} from 'react'
import * as Y from "yjs"
import {SocketIOProvider} from "y-socket.io"


function App() {

  const editorRef = useRef(null)
  const [username, setUsername] = useState(()=>{
    return new URLSearchParams(window.location.search).get("username") || ""
  })

  const [ user, setUser] = useState([])
  

  const ydoc = useMemo(()=> new Y.Doc(), [])
  const yText = useMemo(()=> ydoc.getText("monaco"), [ydoc])

  const handleMount = (editor)=> {
    editorRef.current = editor

    const monacoBinding = new MonacoBinding(
        yText, 
        editorRef.current.getModel(), 
        new Set([editorRef.current]), 
    )
  }


  const handleJion = (e) => {
    e.preventDefault()
    setUsername(e.target.username.value)
    window.history.pushState({}, "", "?username=" + e.target.username.value)
  }

  useEffect(()=>{

      if (!username) return
      const serverUrl = import.meta.env.DEV ? "http://localhost:3000" : window.location.origin
      const provider = new SocketIOProvider(serverUrl, "monaco-demo", ydoc, {
        autoConnect: true,
      })

      const updateUsers = () => {
        const states = Array.from(provider.awareness.getStates().values())
        setUser(states.filter((s) => s.user && s.user.username).map((s) => s.user))
      }

      updateUsers()
      provider.awareness.on("change", updateUsers)

      const handleBeforeUnload = () => {
        provider.awareness.setLocalStateField("user", null)
      }

      window.addEventListener("beforeunload", handleBeforeUnload)


      
      return () => {
        provider.awareness.off("change", updateUsers)
        provider.disconnect()
        window.removeEventListener("beforeunload", handleBeforeUnload)
      }
  
  }, [username, ydoc  ])


  if(!username){
    return(
      <main className="h-screen w-full bg-gray-950 flex gap-4 p-2 items-center justify-center">
        <form 
          onSubmit={handleJion}
          className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Enter your username"
            className="p-2 rounded-lg bg-gray-800 text-white"
            name="username"
          />

          <button className="p-2 rounded-lg bg-amber-50 text-gray-950 font-bold">
              Join
          </button>

        </form>
      </main>
    )
  }


  return (
    <main className="h-screen w-full bg-gray-950 flex gap-4 p-2">

    <aside className="h-full w-1/4 bg-amber-50 rounded-lg">
      <h2 className="text-2xl font-bold p-4 border-b border-gray-300">Users</h2>
      <ul className="p-4">
        {user.map((user, index) => (
          <li key={index} className="p-2 bg-gray-800 text-white rounded mb-2">
            {u.username}
          </li>
        ))}

      </ul>

    </aside>

    <section className="w-3/4 bg-neutral-800 rounded-lg overflow-hidden">

    <Editor
      height="100%"
      defaultLanguage="javascript"
      defaultValue="// some comment"
      theme="vs-dark"
      onMount={handleMount}
    />

    </section>

    </main>
  )
}

export default App
