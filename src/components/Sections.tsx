import { useState, type ReactNode } from 'react'
import { profile, type Experience } from '../data/portfolio'
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
          {navigation.map(({ href, label }, index) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)}>
              <span className="nav-index" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}.
              </span>
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

function CodeLine({
  number,
  children,
}: {
  number: number
  children: ReactNode
}) {
  return (
    <span className="code-line">
      <span className="line-number" aria-hidden="true">
        {number}
      </span>
      <span className="line-content">{children}</span>
    </span>
  )
}

function ProfileEditor() {
  return (
    <div className="profile-editor">
      <div className="editor-titlebar">
        <span className="file-label">
          <span className="file-icon" aria-hidden="true">
            TS
          </span>
          profile.ts
        </span>
        <span className="editor-language">TypeScript</span>
      </div>
      <pre
        className="code-body"
        aria-label="A short profile written as TypeScript"
      >
        <code>
          <CodeLine number={1}>
            <span className="token-comment">{'// A little about me'}</span>
          </CodeLine>
          <CodeLine number={2}>
            <span className="token-keyword">const</span>{' '}
            <span className="token-name">isaac</span>
            {' = {'}
          </CodeLine>
          <CodeLine number={3}>
            {'  '}
            <span className="token-property">name</span>
            {': '}
            <span className="token-string">{JSON.stringify(profile.name)}</span>
            ,
          </CodeLine>
          <CodeLine number={4}>
            {'  '}
            <span className="token-property">interests</span>
            {': ['}
          </CodeLine>
          <CodeLine number={5}>
            {'    '}
            <span className="token-string">'Interfaces'</span>,
          </CodeLine>
          <CodeLine number={6}>
            {'    '}
            <span className="token-string">'Systems'</span>,
          </CodeLine>
          <CodeLine number={7}>{'  ],'}</CodeLine>
          <CodeLine number={8}>
            {'  '}
            <span className="token-property">learning</span>
            {': '}
            <span className="token-string">'Software architecture'</span>,
          </CodeLine>
          <CodeLine number={9}>{'};'}</CodeLine>
        </code>
      </pre>
    </div>
  )
}

export function Hero() {
  const [firstName, ...remainingNames] = profile.name.split(' ')

  return (
    <section className="hero container" id="home" aria-labelledby="hero-title">
      <div className="eyebrow hero-eyebrow">{'// HELLO, WORLD'}</div>
      <div className="hero-grid">
        <div>
          <h1 id="hero-title" aria-label={profile.name}>
            {firstName}
            <br />
            <span>{remainingNames.join(' ')}</span>
          </h1>
          <p className="hero-role">Software development</p>
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
        <div className="hero-aside">
          <ProfileEditor />
        </div>
      </div>
      <div className="hero-foot">
        <span>{'// always learning'}</span>
        <a href="#work">
          Scroll to explore <Arrow down />
        </a>
      </div>
    </section>
  )
}

function ExperienceGroup({
  id,
  title,
  entries,
}: {
  id: string
  title: string
  entries: Experience[]
}) {
  return (
    <section className="experience-group" aria-labelledby={id}>
      <h3 id={id}>{title}</h3>
      <div className="experience-list">
        {entries.map((entry) => (
          <article
            className="experience-entry"
            key={`${entry.organisation}-${entry.role}-${entry.period}`}
          >
            <h4>{entry.organisation}</h4>
            <p className="experience-role">{entry.role}</p>
            <p className="experience-meta">
              <span>{entry.period}</span>
              {entry.location && <span> · {entry.location}</span>}
            </p>
            <p className="experience-summary">{entry.summary}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export function About() {
  return (
    <section className="about-section" id="about" aria-labelledby="about-title">
      <div className="container about-grid">
        <div>
          <p className="eyebrow section-label">02 / about</p>
          <h2 id="about-title">About me</h2>
          <section
            className="education-panel"
            aria-labelledby="education-title"
          >
            <h3 className="education-label" id="education-title">
              education.md
            </h3>
            <p className="education-qualification">
              {profile.education.qualification}
            </p>
            <p className="education-institution">
              {profile.education.institution}
            </p>
            <p className="education-period">{profile.education.period}</p>
            <p className="education-gpa">GPA: {profile.education.gpa}</p>
          </section>
        </div>
        <div className="about-copy">
          {profile.about.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <div className="skills">
            <h3 className="skills-title">
              <span className="file-icon" aria-hidden="true">
                {'{}'}
              </span>
              skills.json
              <span className="sr-only"> — tools I’ve worked with</span>
            </h3>
            {profile.skills.map((group) => (
              <div className="skill-group" key={group.label}>
                <h4>{group.label}</h4>
                <p>{group.items.join(' · ')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="container background-grid">
        <ExperienceGroup
          id="employment-title"
          title="Work experience"
          entries={profile.employment}
        />
        <ExperienceGroup
          id="community-title"
          title="Community"
          entries={profile.community}
        />
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
        <p className="eyebrow section-label">03 / contact</p>
        <h2 id="contact-title">Get in touch.</h2>
        <p>
          Have an opportunity or a question about my work?
          <br className="desktop-break" /> You can reach me on LinkedIn.
        </p>
      </div>
      <div className="contact-links">
        <a href={profile.linkedin}>
          <span>
            <small>Get in touch</small>LinkedIn
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
      <span>React · TypeScript · Vite</span>
      <a className="text-link" href="#home">
        Back to top <Arrow diagonal />
      </a>
    </footer>
  )
}
