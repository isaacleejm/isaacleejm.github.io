export interface Profile {
  name: string
  shortName: string
  github: string
  linkedin: string
  intro: string
  about: string[]
  skills: { label: string; items: string[] }[]
}

interface ProjectScreenshot {
  src: string
  alt: string
  width: number
  height: number
}

export type ProjectMedia =
  | {
      kind: 'screenshots'
      desktop: ProjectScreenshot
      mobile: ProjectScreenshot
      caption: string
    }
  | {
      kind: 'diagram'
      variant: 'analysis' | 'ingestion'
    }

export interface Project {
  id: string
  number: string
  title: string
  category: string
  status: string
  tagline: string
  description: string
  stack: string[]
  roleLabel: string
  contribution: string
  details: { heading: string; text: string }[]
  media?: ProjectMedia
  repoUrl?: string
}

export const profile: Profile = {
  name: 'Isaac Jo Min Lee',
  shortName: 'Isaac Lee',
  github: 'https://github.com/isaacleejm',
  linkedin: 'https://www.linkedin.com/in/isaac-jo-min-lee/',
  intro:
    'I’m curious about how software works — from the interface you touch to the systems behind it.',
  about: [
    'My projects span calendars, code analysis, document processing, and a smart-collar prototype. Some are personal explorations; others are collaborations where my contribution is one part of a larger idea.',
    'I like learning in small steps: get something working, understand the decisions behind it, then improve its structure. Architecture is part of that learning, and I want my projects to show the process as well as the result.',
  ],
  skills: [
    {
      label: 'Interfaces',
      items: ['React', 'TypeScript', 'Flutter', 'Dart', 'React Native'],
    },
    {
      label: 'Services & data',
      items: ['Python', 'Flask', 'Node.js', 'PostgreSQL', 'SQLite'],
    },
    {
      label: 'Cloud & workflow',
      items: ['AWS', 'Docker', 'Git', 'GitHub'],
    },
  ],
}

export const projects: Project[] = [
  {
    id: 'telly-space',
    number: '01',
    title: 'Telly-Space',
    category: 'Calendar & task planning',
    status: 'In development',
    tagline: 'Give a task a place in your day.',
    description:
      'An offline-first calendar and task planner for web and Android. Tasks can become scheduled time, calendar files can move in and out, and the data stays on the device.',
    stack: ['Flutter', 'Dart', 'Drift', 'SQLite', 'Kalender', 'Docker'],
    roleLabel: 'My contribution',
    contribution:
      'I worked on responsive layouts, task scheduling and cancellation, filters and archives, and drag-and-resize previews. I also contributed Docker workflows and tests for the Flutter app.',
    details: [
      {
        heading: 'From a list to a plan',
        text: 'Managing a task and finding time for it are connected actions. The app brings a task list and calendar together so tasks can be placed into a schedule and adjusted as plans change.',
      },
      {
        heading: 'Different screens, familiar actions',
        text: 'Phone, tablet, and desktop layouts support the same planning workflow. My work included adapting those layouts and making scheduling, cancellation, and drag previews easier to follow.',
      },
      {
        heading: 'Local by default',
        text: 'Drift and SQLite keep tasks and events on the device. Working ICS import and export support calendar exchange; accounts and cloud synchronization are outside the current app.',
      },
    ],
    media: {
      kind: 'screenshots',
      desktop: {
        src: '/projects/telly-tasks-desktop.png',
        alt: 'Telly-Space desktop task list with search, priorities, reusable tasks, and task selection.',
        width: 1440,
        height: 900,
      },
      mobile: {
        src: '/projects/telly-tasks-mobile.png',
        alt: 'The same Telly-Space task list adapted to a mobile screen.',
        width: 390,
        height: 844,
      },
      caption: 'Task views · Desktop & mobile · Development screenshots',
    },
  },
  {
    id: 'pyhelper',
    number: '02',
    title: 'PyHelper',
    category: 'Collaborative coursework',
    status: 'Coursework project',
    tagline: 'A clearer view of what your Python code needs.',
    description:
      'A Python code-analysis application with a React interface and a cloud processing workflow. It brings code-quality, security, and complexity checks into one upload-and-review experience.',
    stack: [
      'React',
      'TypeScript',
      'Node.js',
      'Flask',
      'AWS',
      'PostgreSQL',
      'Docker',
    ],
    roleLabel: 'My contribution',
    contribution:
      'I contributed S3 uploads and downloads, queue-based processing, failed-job handling, notifications, and sign-in. I also worked on secret configuration, the production client container, and load testing.',
    details: [
      {
        heading: 'Make analysis approachable',
        text: 'The team application combines tools including pylint, Bandit, and Radon so users can inspect quality, security, and complexity findings through a web interface.',
      },
      {
        heading: 'Keep requests moving',
        text: 'My work used presigned S3 links for uploads and downloads and SQS for stateless processing. Failed jobs had a dead-letter queue and a notification path, rather than disappearing from the workflow.',
      },
      {
        heading: 'Connect the application to its environment',
        text: 'I contributed Cognito and Google sign-in integration, configuration through Secrets Manager and Parameter Store, and Docker and load-testing work for the production client.',
      },
    ],
    media: { kind: 'diagram', variant: 'analysis' },
    repoUrl: 'https://github.com/Digital2512/PyHelper',
  },
  {
    id: 'rescan',
    number: '03',
    title: 'Rescan',
    category: 'AI hackathon',
    status: 'Hackathon prototype',
    tagline: 'From uploaded documents to a reviewable workflow.',
    description:
      'A document-ingestion and processing prototype for a résumé-review workflow. Uploads, text extraction, OCR, and background processing connect incoming documents to the review stage.',
    stack: ['Java', 'Spring Boot', 'Python', 'AWS', 'Redis', 'Docker'],
    roleLabel: 'Project context & attribution',
    contribution:
      'Rescan was part of the MentorME Agentic-AI Hackathon in Brisbane. The implementation was generated using AI coding agents; I did not hand-write it.',
    details: [
      {
        heading: 'Start with the documents',
        text: 'Uploads and batch ingestion feed a document-processing pipeline. Text extraction and OCR turn different source files into material the résumé-review workflow can use.',
      },
      {
        heading: 'Separate intake from processing',
        text: 'Object storage, queues, and background workers let the system handle document processing beyond the upload request. The project connects these pieces to progress tracking and review.',
      },
      {
        heading: 'Be clear about how it was made',
        text: 'This is an AI-generated implementation from a hackathon project. I include it with that attribution so its purpose, technology, and development context are all visible.',
      },
    ],
    media: { kind: 'diagram', variant: 'ingestion' },
    repoUrl: 'https://github.com/CameronBadman/Rescan',
  },
]

export const supportingProject: Project = {
  id: 'pawsense',
  number: '04',
  title: 'PawSense',
  category: 'Collaborative prototype',
  status: 'Simulated collar data',
  tagline: 'Connect a smart-collar idea to a working dashboard.',
  description:
    'A smart dog-collar prototype showing health, activity, location, and behavior information through a mobile interface, using simulated collar data.',
  stack: ['React Native', 'Expo', 'JavaScript', 'Python', 'Flask'],
  roleLabel: 'My contribution',
  contribution:
    'I built and refined the mock collar data source, connected it to a Flask endpoint, and wired the results into the React Native dashboard for health metrics, activity, and location.',
  details: [
    {
      heading: 'Connect the parts of a team project',
      text: 'My work linked the simulated data source, API, and dashboard. It let the interface display values returned by the service in place of disconnected placeholders.',
    },
    {
      heading: 'A prototype with simulated inputs',
      text: 'The data represents a possible collar workflow. It does not come from a physical collar, and I do not claim authorship of the team’s machine-learning model.',
    },
  ],
  repoUrl: 'https://github.com/Digital2512/PawSense',
}
