import { projects, supportingProject, type Project } from '../data/portfolio'
import { Arrow } from './Icons'
import { ProjectVisual } from './ProjectVisual'

function ProjectDetails({ project }: { project: Project }) {
  return (
    <details className="project-details">
      <summary>
        <span>
          Inside the project<span className="sr-only">: {project.title}</span>
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
      <div className="project-main">
        <div className="project-copy">
          <div className="project-meta">
            <span className="project-number">{project.number}</span>
            <span>{project.category}</span>
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
          <div className="project-bottom">
            <span className="project-status">
              <span />
              {project.status}
            </span>
            {project.repoUrl && (
              <a
                className="text-link"
                href={project.repoUrl}
                aria-label={`${project.title} on GitHub`}
              >
                GitHub <Arrow diagonal />
              </a>
            )}
          </div>
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
          <h2 id="work-title">
            A few things
            <br />
            I’ve been part of.
          </h2>
        </div>
        <p>
          Different problems. Different tools.
          <br />
          Something to learn in every project.
        </p>
      </div>
      <div className="projects-list">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
      <article className="supporting-project" aria-labelledby="pawsense-title">
        <div className="supporting-mark" aria-hidden="true">
          <svg viewBox="0 0 64 64" fill="currentColor">
            <ellipse
              cx="20"
              cy="20"
              rx="6"
              ry="8"
              transform="rotate(-20 20 20)"
            />
            <ellipse cx="36" cy="16" rx="6" ry="8" />
            <ellipse
              cx="49"
              cy="27"
              rx="5"
              ry="7"
              transform="rotate(20 49 27)"
            />
            <ellipse
              cx="10"
              cy="34"
              rx="5"
              ry="7"
              transform="rotate(-25 10 34)"
            />
            <path d="M18 43c2-8 9-16 16-13 8 3 15 17 8 22-5 4-9-1-14-1s-14 2-10-8Z" />
          </svg>
        </div>
        <div className="supporting-copy">
          <p className="eyebrow">
            Also in the workshop / {supportingProject.category}
          </p>
          <h3 id="pawsense-title">{supportingProject.title}</h3>
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
