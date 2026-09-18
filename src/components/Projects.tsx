import { projects, supportingProject, type Project } from '../data/portfolio'
import { Arrow } from './Icons'
import { ProjectVisual } from './ProjectVisual'

function ProjectPath({ id }: { id: string }) {
  return (
    <span className="project-file">
      <svg
        aria-hidden="true"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      >
        <path d="M3 6h6l2 2h10v11H3V6Z" />
      </svg>
      projects/{id}
    </span>
  )
}

function ProjectDetails({ project }: { project: Project }) {
  return (
    <details className="project-details">
      <summary>
        <span>
          <span className="readme-label" aria-hidden="true">
            README.md
          </span>
          Read project notes<span className="sr-only">: {project.title}</span>
        </span>
        <span className="disclosure-icon" aria-hidden="true" />
      </summary>
      <div className="details-content">
        {project.details.map((detail) => (
          <div key={detail.heading}>
            <h4>{detail.heading}</h4>
            <p>{detail.text}</p>
          </div>
        ))}
        {project.repoUrl && (
          <a className="text-link" href={project.repoUrl}>
            Explore the repository <Arrow diagonal />
          </a>
        )}
      </div>
    </details>
  )
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <article
      className={`project project-${project.id}`}
      id={project.id}
      aria-labelledby={`${project.id}-title`}
    >
      <div className="project-titlebar">
        <ProjectPath id={project.id} />
        <span className="project-category">{project.category}</span>
      </div>
      <div className="project-main">
        <div className="project-copy">
          <div className="project-meta">
            <span className="project-number">{project.number}</span>
            <span className="project-status">{project.status}</span>
          </div>
          <h3 id={`${project.id}-title`}>{project.title}</h3>
          <p className="project-tagline">{project.tagline}</p>
          <p className="project-description">{project.description}</p>
          <div className="project-contribution">
            <p className="eyebrow">{project.roleLabel}</p>
            <p>{project.contribution}</p>
          </div>
          <ul
            className="tech-list"
            aria-label={`${project.title} technologies`}
          >
            {project.stack.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
          {project.repoUrl && (
            <div className="project-bottom">
              <a
                className="text-link"
                href={project.repoUrl}
                aria-label={`${project.title} on GitHub`}
              >
                GitHub <Arrow diagonal />
              </a>
            </div>
          )}
        </div>
        {project.media && <ProjectVisual media={project.media} />}
      </div>
      <ProjectDetails project={project} />
    </article>
  )
}

export function Projects() {
  return (
    <section
      className="container work-section"
      id="work"
      aria-labelledby="work-title"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow section-label">01 / Selected work</p>
          <h2 id="work-title">Selected projects</h2>
        </div>
        <p>The context, the code, and my part in each project.</p>
      </div>
      <div className="projects-list">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
      <article className="supporting-project" aria-labelledby="pawsense-title">
        <div className="supporting-copy">
          <ProjectPath id={supportingProject.id} />
          <h3 id="pawsense-title">{supportingProject.title}</h3>
          <p className="eyebrow">{supportingProject.category}</p>
          <p>{supportingProject.description}</p>
          <p className="supporting-contribution">
            {supportingProject.contribution}
          </p>
          <ul className="tech-list" aria-label="PawSense technologies">
            {supportingProject.stack.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
        </div>
        {supportingProject.repoUrl && (
          <a
            className="text-link"
            href={supportingProject.repoUrl}
            aria-label="PawSense on GitHub"
          >
            GitHub <Arrow diagonal />
          </a>
        )}
      </article>
    </section>
  )
}
