export interface Education {
  institution: string
  qualification: string
  period: string
  gpa: string
}

export interface Experience {
  organisation: string
  role: string
  period: string
  location: string
  summary: string
}

export interface Profile {
  name: string
  shortName: string
  github: string
  linkedin: string
  intro: string
  about: string[]
  skills: { label: string; items: string[] }[]
  education: Education
  employment: Experience[]
  community: Experience[]
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
      variant: 'analysis' | 'ingestion' | 'capstone'
    }

export interface Project {
  id: string
  number: string
  title: string
  category: string
  status: string
  period?: string
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
    'I’m a developer with a computer science background from QUT. I enjoy building practical software and working through problems with a team.',
  about: [
    'My projects span an industry capstone, calendars, code analysis, and hackathon experiments. Some are personal explorations; others are collaborations where my contribution is one part of a larger idea. I’m curious about how the interface, data, and systems fit together.',
    'I like learning in small steps: get something working, understand the decisions behind it, then improve its structure. Architecture is part of that learning, and I want my projects to show the process as well as the result.',
  ],
  skills: [
    {
      label: 'Languages',
      items: [
        'C',
        'C#',
        'C++',
        'Java',
        'Python',
        'JavaScript',
        'TypeScript',
        'SQL',
        'VB.NET',
        'Dart',
        'Go',
      ],
    },
    {
      label: 'Web & interfaces',
      items: [
        'React',
        'Next.js',
        'Flask',
        'Node.js',
        'REST APIs',
        'HTML',
        'CSS',
        'Vite',
        'Flutter',
        'React Native',
        'WinForms',
      ],
    },
    {
      label: 'Cloud & workflow',
      items: [
        'AWS',
        'Azure',
        'Docker',
        'Terraform',
        'Git',
        'GitHub',
        'CI/CD',
        'Jira',
      ],
    },
    {
      label: 'Databases',
      items: [
        'PostgreSQL',
        'MariaDB',
        'Microsoft SQL Server',
        'MySQL',
        'DynamoDB',
        'SQLite',
      ],
    },
  ],
  education: {
    institution: 'Queensland University of Technology (QUT)',
    qualification: 'Bachelor of Information Technology (Computer Science)',
    period: 'Jul 2024 – Jun 2026',
    gpa: '6.47/7.0',
  },
  employment: [
    {
      organisation: 'Woolworths Group',
      role: 'Team Member (Casual)',
      period: 'Aug 2025 – Present',
      location: 'Brisbane, Australia',
      summary:
        'I handle POS transactions, help customers with enquiries and returns, and support stock replenishment and daily store operations.',
    },
    {
      organisation: 'Lee Wah Trading Company',
      role: 'Customer Service and Sales Assistant',
      period: 'Jan 2019 – Jul 2024',
      location: 'Kuala Lumpur, Malaysia',
      summary:
        'I managed inventory and supported POS operations, troubleshooting transaction issues and store equipment to keep daily operations running.',
    },
  ],
  community: [
    {
      organisation: 'Code Network',
      role: 'General Executive',
      period: 'Sep 2024 – Sep 2025',
      location: 'Brisbane, Australia',
      summary:
        'I supported technical workshops, hackathons, and networking events, and worked with the Treasurer to restore a Square Reader for event payments.',
    },
    {
      organisation: 'AWS Community Day',
      role: 'Volunteer',
      period: 'Aug 2025',
      location: 'Brisbane, Australia',
      summary:
        'I helped with attendee registration and event logistics to support the organisers and community.',
    },
  ],
}

export const projects: Project[] = [
  {
    id: 'qut-capstone',
    number: '01',
    title: 'QUT Industry Capstone — Mill Configuration',
    category: 'Industry capstone',
    status: 'Industry project',
    period: 'Jul 2025 – Jun 2026',
    tagline: 'Compare mill configurations. Keep the data connected.',
    description:
      'An industry capstone with QUT’s Centre for Agriculture and the Bioeconomy, extending Milset, a VB.NET WinForms application for mill configuration, with scenario analysis and database persistence.',
    stack: ['VB.NET', 'WinForms', 'PostgreSQL', 'Azure', 'Jira'],
    roleLabel: 'My contribution',
    contribution:
      'I acted as project manager and industry liaison, designed the PostgreSQL database with row-level security and multi-tenancy, and added scenario comparison and Azure-hosted persistence to the VB.NET application.',
    details: [
      {
        heading: 'Extend an existing workflow',
        text: 'The project extended a legacy mill-configuration application so scenarios could be compared and their data saved. A shared database also needed to keep each tenant’s data separated.',
      },
      {
        heading: 'Application and database work',
        text: 'I designed the database architecture and diagram, implemented PostgreSQL policies for row-level security and multi-tenancy, and built the scenario-analysis tool in VB.NET WinForms with PostgreSQL persistence hosted on Azure.',
      },
      {
        heading: 'Delivery and documentation',
        text: 'I used Jira to coordinate tasks, clarify requirements, track progress, and communicate with the industry partner. As team secretary, I also managed correspondence, meeting minutes, handover material, and supporting technical documentation.',
      },
    ],
    media: { kind: 'diagram', variant: 'capstone' },
  },
  {
    id: 'telly-space',
    number: '02',
    title: 'Telly-Space',
    category: 'Calendar & task planning',
    status: 'In development',
    period: '2026 – Present',
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
        text: 'I co-designed Telly-Space after finding it difficult to manage events across multiple calendar apps and keep track of tasks and commitments. The app brings a task list and calendar together so tasks can be placed into a schedule and adjusted as plans change.',
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
    number: '03',
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
    number: '04',
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

export const supportingProjects: Project[] = [
  {
    id: 'turtlezard',
    number: '05',
    title: 'Turtlezard',
    category: 'Collaborative game hackathon',
    status: 'Three-day project',
    period: '2026',
    tagline: 'Make a game together in three days.',
    description:
      'A Go game developed with Ebitengine during the Code Network Winter Hackathon 2026, built over three days by a team of three.',
    stack: ['Go', 'Ebitengine'],
    roleLabel: 'My contribution',
    contribution:
      'I collaborated with two other developers to design and implement gameplay mechanics, in-game UI, and game systems.',
    details: [
      {
        heading: 'Build within the time available',
        text: 'The hackathon gave our three-person team three days to make the game. We worked together on the gameplay, interface, and supporting systems using Go and Ebitengine.',
      },
    ],
    repoUrl: 'https://github.com/isaacleejm/Turtlezard',
  },
  {
    id: 'pawsense',
    number: '06',
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
  },
]
