import { Header, Hero, About, Contact, Footer } from './components/Sections'
import { Projects } from './components/Projects'
import { ChatWidget } from './features/chat/ChatWidget'
import { getChatConfig } from './features/chat/config'
import './App.css'

const chat = getChatConfig(
  import.meta.env.DEV,
  import.meta.env.VITE_CHAT_API_URL,
)

function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Projects />
        <About />
        <Contact />
      </main>
      <Footer />
      {chat.enabled && <ChatWidget apiUrl={chat.apiUrl} />}
    </>
  )
}

export default App
