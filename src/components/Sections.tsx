import { useState } from 'react'
import { profile } from '../data/portfolio'
import { Arrow, Mark } from './Icons'

const navigation = [
  { href: '#work', label: 'Work' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
]

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a
          className="brand"
          href="#home"
          aria-label={`${profile.shortName} — back to top`}
          onClick={() => setMenuOpen(false)}
        >
          <Mark />
          <span>{profile.shortName}</span>
        </a>
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? 'Close' : 'Menu'}
          <span aria-hidden="true">{menuOpen ? '−' : '+'}</span>
        </button>
        <nav
          id="main-navigation"
          aria-label="Main navigation"
          className={menuOpen ? 'navigation is-open' : 'navigation'}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setMenuOpen(false)
              document.querySelector<HTMLButtonElement>('.menu-toggle')?.focus()
            }
          }}
        >
          {navigation.map(({ href, label }) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)}>
              {label}
            </a>
          ))}
          <a className="nav-github" href={profile.github}>
            GitHub <Arrow diagonal />
          </a>
        </nav>
      </div>
    </header>
  )
}

export function Hero() {
  return (
    <section className="hero container" id="home" aria-labelledby="hero-title">
      <div className="eyebrow hero-eyebrow">
        <span className="status-dot" />A software development portfolio
      </div>
      <div className="hero-grid">
        <div>
          <p className="hero-intro">Hi, I’m {profile.name}.</p>
          <h1 id="hero-title">
            Curiosity,
            <br />
            turned into
            <br />
            <span>software.</span>
          </h1>
        </div>
        <div className="hero-aside">
          <div className="idea-art" aria-hidden="true">
            <svg viewBox="0 0 320 270" fill="none">
              <path
                className="art-grid"
                d="M0 60h320M0 120h320M0 180h320M0 240h320M40 0v270M100 0v270M160 0v270M220 0v270M280 0v270"
              />
              <path
                d="M72 186v-55l80-46 91 52v51l-80 47-91-49Z"
                fill="#dce6d8"
                stroke="#355442"
                strokeWidth="1.5"
              />
              <path
                d="m72 131 91 50 80-44M163 181v54"
                stroke="#355442"
                strokeWidth="1.5"
              />
              <path
                d="m86 104 77 43 66-38v-35l-77-43-66 38v35Z"
                fill="#f8f8f2"
                stroke="#355442"
                strokeWidth="1.5"
              />
              <path
                d="m86 69 77 43 66-38M163 112v35"
                stroke="#355442"
                strokeWidth="1.5"
              />
              <path
                d="m135 63-14 8 14 8m41-2 14 8-14 8m-16-36-9 38"
                stroke="#355442"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M34 196v-9m-5 4.5h10M269 63V49m-7 7h14M269 212v-8m-4 4h8"
                stroke="#355442"
                strokeWidth="1.5"
              />
              <circle cx="45" cy="85" r="4" fill="#b9cb75" />
              <circle cx="269" cy="169" r="6" fill="#b9cb75" />
            </svg>
            <span className="art-caption">
              An idea. A few moving parts. Something useful.
            </span>
          </div>
          <p className="hero-description">{profile.intro}</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#work">
              Explore my work <Arrow down />
            </a>
            <a className="text-link" href={profile.linkedin}>
              Let’s connect <Arrow diagonal />
            </a>
          </div>
        </div>
      </div>
      <div className="hero-foot">
        <span>Interfaces · Systems · Experiments</span>
        <a href="#work">
          Scroll to explore <Arrow down />
        </a>
      </div>
    </section>
  )
}

export function About() {
  return (
    <section className="about-section" id="about" aria-labelledby="about-title">
      <div className="container about-grid">
        <div>
          <p className="eyebrow section-label">02 / A little about me</p>
          <h2 id="about-title">
            Making things.
            <br />
            <span className="muted-heading">
              Making sense
              <br />
              of them.
            </span>
          </h2>
        </div>
        <div className="about-copy">
          {profile.about.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <div className="learning-note">
            <span aria-hidden="true">↳</span>
            <p>
              Currently curious about <strong>software architecture</strong> —
              getting things working, then understanding how to make them
              better.
            </p>
          </div>
          <div className="skills">
            <h3 className="eyebrow">Tools I’ve worked with</h3>
            {profile.skills.map((group) => (
              <div className="skill-group" key={group.label}>
                <h4>{group.label}</h4>
                <p>{group.items.join(' · ')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function Contact() {
  return (
    <section
      className="container contact-section"
      id="contact"
      aria-labelledby="contact-title"
    >
      <div>
        <p className="eyebrow section-label">03 / Let’s connect</p>
        <h2 id="contact-title">
          Good things start
          <br />
          with a <span>conversation.</span>
        </h2>
        <p>
          Have an opportunity, an idea, or a question about a project?
          <br className="desktop-break" /> I’d be glad to hear from you.
        </p>
      </div>
      <div className="contact-links">
        <a href={profile.linkedin}>
          <span>
            <small>Say hello</small>LinkedIn
          </span>
          <Arrow diagonal />
        </a>
        <a href={profile.github}>
          <span>
            <small>Explore the code</small>GitHub
          </span>
          <Arrow diagonal />
        </a>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="container site-footer">
      <a className="brand" href="#home">
        <Mark />
        <span>{profile.name}</span>
      </a>
      <span>Always a work in progress.</span>
      <a className="text-link" href="#home">
        Back to top <Arrow diagonal />
      </a>
    </footer>
  )
}
