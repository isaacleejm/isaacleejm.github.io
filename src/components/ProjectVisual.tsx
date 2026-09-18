import type { ProjectMedia } from '../data/portfolio'
import { Arrow } from './Icons'

function FlowNode({
  step,
  title,
  detail,
}: {
  step: string
  title: string
  detail: string
}) {
  return (
    <div className="flow-node">
      <span className="flow-step">{step}</span>
      <strong>{title}</strong>
      <span>{detail}</span>
    </div>
  )
}

export function ProjectVisual({ media }: { media: ProjectMedia }) {
  if (media.kind === 'screenshots') {
    return (
      <figure className="project-visual telly-visual">
        <div className="visual-heading">
          <span className="visual-title">Task workspace</span>
          <span className="visual-note">Flutter / Local storage</span>
        </div>
        <div className="telly-devices">
          <div className="desktop-window">
            <div className="window-bar">
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <p>Workspace / My tasks</p>
            </div>
            <img {...media.desktop} loading="lazy" />
          </div>
          <div className="phone-window">
            <div className="phone-speaker" aria-hidden="true" />
            <img {...media.mobile} loading="lazy" />
          </div>
        </div>
        <figcaption>{media.caption}</figcaption>
      </figure>
    )
  }
  if (media.variant === 'capstone') {
    return (
      <figure className="project-visual capstone-visual">
        <div className="visual-heading">
          <span className="visual-title">Application & data</span>
          <span className="visual-note">Desktop / Cloud persistence</span>
        </div>
        <div className="capstone-system">
          <FlowNode
            step="APPLICATION"
            title="Milset + scenario analysis"
            detail="VB.NET · WinForms"
          />
          <div className="capstone-connector" aria-hidden="true">
            <Arrow down />
          </div>
          <div className="capstone-database">
            <span className="flow-step">SHARED DATABASE</span>
            <strong>PostgreSQL on Azure</strong>
            <div className="tenant-policies">
              <p>Row-level security policies</p>
              <div className="tenant-boundaries">
                <span>Tenant A data</span>
                <span>Tenant B data</span>
              </div>
            </div>
          </div>
        </div>
        <figcaption>
          Architecture overview · Logical tenant boundaries in one database
        </figcaption>
      </figure>
    )
  }
  if (media.variant === 'analysis') {
    return (
      <figure className="project-visual pyhelper-visual">
        <div className="visual-heading">
          <span className="visual-title">Analysis pipeline</span>
          <span className="visual-note">Python / Queue workers</span>
        </div>
        <div className="pipeline">
          <div className="pipeline-label">SOURCE → ANALYSIS → RESULTS</div>
          <div className="flow-row">
            <FlowNode step="01" title="Submit" detail="Python source" />
            <Arrow />
            <FlowNode step="02" title="Analyse" detail="Queued workers" />
            <Arrow />
            <FlowNode step="03" title="Understand" detail="Issues & metrics" />
          </div>
          <div className="pipeline-services">
            <span>S3 · Source files</span>
            <span>SQS · Analysis queue</span>
            <span>PostgreSQL · History</span>
          </div>
        </div>
        <figcaption>
          Architecture overview · Simplified analysis workflow
        </figcaption>
      </figure>
    )
  }
  return (
    <figure className="project-visual rescan-visual">
      <div className="visual-heading">
        <span className="visual-title">Document pipeline</span>
        <span className="visual-note">Storage / Extraction / Review</span>
      </div>
      <div className="rescan-pipeline">
        <div className="document-stack" aria-hidden="true">
          <div />
          <div />
          <div>
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>
        <div className="rescan-flow">
          <FlowNode
            step="01 / INGEST"
            title="Upload & verify"
            detail="Document batches · S3 storage"
          />
          <div className="flow-connector" aria-hidden="true" />
          <FlowNode
            step="02 / EXTRACT"
            title="Read & process"
            detail="Text extraction · OCR when needed"
          />
          <div className="flow-connector" aria-hidden="true" />
          <FlowNode
            step="03 / PREPARE"
            title="Structured output"
            detail="Ready for downstream review"
          />
        </div>
      </div>
      <figcaption>
        Architecture overview · AI-agent-generated implementation
      </figcaption>
    </figure>
  )
}
