import { Header, Hero, About, Contact, Footer } from './components/Sections'
import { Projects } from './components/Projects'
import { ChatWidget } from './features/chat/ChatWidget'
import './App.css'

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
      {import.meta.env.DEV && <ChatWidget />}
    </>
  )
}

export default App
