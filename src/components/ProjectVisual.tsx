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
          <span className="visual-wordmark">
            telly<span>space</span>
            <span className="wordmark-dot">.</span>
          </span>
          <span className="visual-note">A little room for your day.</span>
        </div>
        <div className="telly-devices">
          <div className="desktop-window">
            <div className="window-bar">
              <span />
              <span />
              <span />
              <p>Workspace / My tasks</p>
            </div>
            <img {...media.desktop} loading="lazy" />
          </div>
          <div className="phone-window">
            <div className="phone-speaker" />
            <img {...media.mobile} loading="lazy" />
          </div>
        </div>
        <figcaption>{media.caption}</figcaption>
      </figure>
    )
  }
  if (media.variant === 'analysis') {
    return (
      <figure className="project-visual pyhelper-visual">
        <div className="visual-heading">
          <span className="visual-wordmark">
            <span className="code-glyph">{'</>'}</span> PyHelper
          </span>
          <span className="visual-note">A clearer view of your code.</span>
        </div>
        <div className="pipeline">
          <div className="pipeline-label">FROM PYTHON TO FEEDBACK</div>
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
        <span className="visual-wordmark">
          <span className="rescan-symbol" aria-hidden="true">
            ▤
          </span>{' '}
          Rescan
        </span>
        <span className="visual-note">From documents to structured data.</span>
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
          <div className="flow-connector" />
          <FlowNode
            step="02 / EXTRACT"
            title="Read & process"
            detail="Text extraction · OCR when needed"
          />
          <div className="flow-connector" />
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
