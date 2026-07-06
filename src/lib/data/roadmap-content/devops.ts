import type { RoadmapDetailMap } from './types';

export const DevopsContent: RoadmapDetailMap = {
	Docker: {
		definition:
			'A platform for packaging an application together with all its dependencies, libraries, and configuration into a lightweight, portable unit called a container, so it runs the same way everywhere.',
		useCase:
			'Shipping a Node.js API that depends on an exact Node version and native libraries, so it behaves identically on a developer laptop, in CI, and in production.',
		detailedMarkdown: `
# Docker

**Docker** is a platform for building, shipping, and running applications inside **containers** — isolated, lightweight units that bundle an application's code together with everything it needs to run: the runtime, system libraries, and configuration. The core promise is that "it works on my machine" becomes "it works everywhere," because the container carries its own environment with it instead of depending on whatever happens to be installed on the host.

## Containers vs. Virtual Machines

Before containers, the standard way to isolate applications was **virtual machines (VMs)**. Both solve a similar problem — running isolated workloads on shared hardware — but very differently:

| | **Virtual Machine** | **Container** |
|---|---|---|
| Isolation unit | Full guest OS with its own kernel | A process, isolated via kernel namespaces/cgroups |
| Kernel | Each VM has its own kernel | Shares the host machine's kernel |
| Size | Gigabytes (full OS image) | Megabytes (just the app + deps) |
| Startup time | Tens of seconds to minutes (boots an OS) | Milliseconds to a couple of seconds |
| Resource overhead | High — a hypervisor plus a full OS per VM | Low — no duplicated OS, just process-level isolation |
| Managed by | A hypervisor (VMware, KVM, Hyper-V) | A container runtime (containerd, runc) via Docker |

Because containers share the host kernel instead of virtualizing an entire OS, you can run dozens of containers on a machine that could only comfortably host a handful of VMs.

## Image vs. Container

These two terms get used loosely but mean different things:

- An \`image\` is a read-only, versioned *blueprint* — a set of filesystem layers plus metadata describing how to run the app. It's built once from a \`Dockerfile\` and can be pushed to a registry (like Docker Hub) and pulled anywhere.
- A **container** is a *running instance* of an image — the same relationship a class has to an object. You can start many containers from the same image, each with its own writable layer and isolated process, but they all share the same underlying image.

## A Real Dockerfile

Here's a minimal, real Dockerfile for a Node.js API:

\`\`\`dockerfile
# 1. Start from an official, small base image
FROM node:20-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy only dependency manifests first (better layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

# 4. Copy the rest of the application source
COPY . .

# 5. Document the port the app listens on
EXPOSE 3000

# 6. Command that runs when the container starts
CMD ["node", "server.js"]
\`\`\`

The order matters: copying \`package.json\` and installing dependencies *before* copying the rest of the source means Docker can reuse the cached \`npm ci\` layer on rebuilds as long as dependencies haven't changed — only source code edits will trigger a fast rebuild of the later layers.

## Key Commands

\`\`\`bash
docker build -t my-api:1.0 .              # Build an image from the Dockerfile in this directory
docker images                              # List images stored locally
docker run -d -p 3000:3000 my-api:1.0      # Start a container in the background, mapping host:container ports
docker ps                                  # List running containers
docker ps -a                               # List all containers, including stopped ones
docker logs <container-id>                 # View a container's stdout/stderr
docker exec -it <container-id> sh          # Open a shell inside a running container
docker stop <container-id>                 # Gracefully stop a running container
\`\`\`

## Why This Matters for Interviews

Docker questions usually probe whether you understand *why* containers exist (kernel-level isolation vs. full virtualization), the image/container distinction, and layer caching — not just command memorization. Be ready to explain how a \`Dockerfile\`'s instruction order affects build speed, and why containers are considered "immutable infrastructure": instead of patching a running container, you rebuild the image and redeploy.
	`
	},
	'Docker Compose': {
		definition:
			'A tool for defining and running multi-container Docker applications using a single YAML file, so an entire local stack (app, database, cache, and so on) can be started with one command.',
		useCase:
			'Spinning up a local development environment with a Node.js API and a PostgreSQL database that are networked together and start with a single command.',
		detailedMarkdown: `
# Docker Compose

A real application is rarely just one container. A typical backend needs an API server, a database, maybe a cache like Redis, and perhaps a background worker — each running in its own container but needing to talk to the others. **Docker Compose** lets you define that entire multi-container setup declaratively in one YAML file, and bring it all up (or tear it all down) with a single command.

## Why Not Just Run Several \`docker run\` Commands?

You could manually run one \`docker run\` per service, remembering to create a shared network and wire up environment variables and volumes correctly every time — but that's tedious and easy to get wrong. Compose captures all of that configuration once, in version control, so anyone on the team gets an identical environment by running one command.

## A Real docker-compose.yml

\`\`\`yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - '3000:3000'
    environment:
      - DATABASE_URL=postgres://app_user:app_pass@db:5432/app_db
    depends_on:
      - db
    volumes:
      - .:/app
      - /app/node_modules

  db:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: app_user
      POSTGRES_PASSWORD: app_pass
      POSTGRES_DB: app_db
    ports:
      - '5432:5432'
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
\`\`\`

A few things worth calling out:

- Compose automatically creates a shared **network** for all services in the file, so \`api\` can reach the database simply by hostname \`db\` — that's why \`DATABASE_URL\` points at \`db:5432\` rather than \`localhost:5432\`.
- \`depends_on\` controls **start order** (the \`db\` container starts before \`api\`), but it does **not** wait for Postgres to actually be ready to accept connections — for that, apps typically add their own retry/backoff logic on startup, or a proper healthcheck.
- The named volume \`pgdata\` persists database data across container restarts; without it, \`docker-compose down\` would wipe the database every time.

## Key Commands

\`\`\`bash
docker-compose up            # Build (if needed) and start all services in the foreground
docker-compose up -d         # Start all services in the background
docker-compose ps            # List running services in this project
docker-compose logs -f api   # Follow logs for a specific service
docker-compose down          # Stop and remove containers + network (volumes kept by default)
docker-compose down -v       # Also remove named volumes (wipes persisted data)
\`\`\`

## Compose vs. Kubernetes

This is the comparison that comes up most in interviews: **Compose is for local development and small single-host setups**, not production-grade orchestration. It has no concept of running across multiple machines, no built-in self-healing (a crashed container just stays crashed until you restart it manually), and no rolling deployments.

| | **Docker Compose** | **Kubernetes** |
|---|---|---|
| Scope | A single host | A cluster of many machines |
| Primary use | Local dev, small demos, CI test environments | Production orchestration at scale |
| Self-healing | No (manual restart) | Yes (automatically replaces failed Pods) |
| Scaling | Manual (\`--scale\`) | Automatic, declarative |
| Config format | \`docker-compose.yml\` | Multiple YAML manifests (Pod, Deployment, Service, ...) |

In practice, many teams use Compose to mirror their production stack locally — matching service names and environment variables to what runs in Kubernetes — so the mental model transfers even though the tooling doesn't.
	`
	},
	'Kubernetes Basics': {
		definition:
			'An open-source container orchestration platform that automates deploying, scaling, networking, and healing containerized applications across a cluster of machines.',
		useCase:
			'Running a production e-commerce API across dozens of servers, where Kubernetes automatically restarts crashed instances, adds more replicas during a traffic spike, and routes requests to healthy instances only.',
		detailedMarkdown: `
# Kubernetes Basics

## The Problem It Solves

Docker Compose is great for running a handful of containers on one machine, but it falls apart at production scale. What happens when your app needs to run across 50 machines, a server dies at 3am, traffic triples during a sale, and you need to deploy a new version without downtime? Doing all of that by hand — or with custom scripts — doesn't scale. **Kubernetes (K8s)** is a container orchestration platform that automates exactly this: scheduling containers onto machines, restarting ones that crash, scaling the number of running copies up or down, and routing traffic to healthy instances, across a whole cluster of servers treated as a single pool of compute.

This is a genuinely deep topic — production Kubernetes involves networking, storage, RBAC, and Helm charts — so treat this as the essential vocabulary you need to reason about it in an interview, not the full picture.

## Core Objects

### Pod

The smallest deployable unit in Kubernetes. A **Pod** wraps one or (occasionally) more tightly-coupled containers that share networking and storage. You almost never create Pods directly in production — you let a higher-level object manage them.

\`\`\`yaml
apiVersion: v1
kind: Pod
metadata:
  name: api-pod
  labels:
    app: my-api
spec:
  containers:
    - name: api
      image: my-registry/my-api:1.0
      ports:
        - containerPort: 3000
\`\`\`

### Deployment

A **Deployment** describes the *desired state* of a set of Pods: which image to run, how many replicas, and how to roll out updates. Kubernetes continuously works to make reality match this desired state — if a Pod dies, the Deployment's controller notices and creates a replacement automatically. This is the essence of **self-healing**.

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-api
  template:
    metadata:
      labels:
        app: my-api
    spec:
      containers:
        - name: api
          image: my-registry/my-api:1.0
          ports:
            - containerPort: 3000
\`\`\`

Want more capacity? Change \`replicas: 3\` to \`replicas: 10\` (or let a **HorizontalPodAutoscaler** do it automatically based on CPU/memory) — Kubernetes schedules the extra Pods onto available nodes for you.

### Service

Pods are ephemeral — they get replaced constantly and each new Pod gets a new IP address. A **Service** gives a stable, single network address that automatically load-balances traffic across whichever Pods currently match its label selector, so nothing else in the system needs to track individual Pod IPs.

\`\`\`yaml
apiVersion: v1
kind: Service
metadata:
  name: api-service
spec:
  selector:
    app: my-api
  ports:
    - port: 80
      targetPort: 3000
  type: ClusterIP
\`\`\`

## How They Fit Together

\`Deployment\` → creates/manages → \`Pods\` → exposed via → \`Service\`

The **label selector** mechanism (\`app: my-api\`) is what glues these objects together: the Service doesn't know or care which specific Pods exist at any moment — it just finds whatever Pods currently carry the matching label and routes to them. When the Deployment replaces a Pod, the new one picks up the same label automatically, and the Service seamlessly starts routing to it.

## Self-Healing and Scaling, in Plain Terms

Kubernetes runs a continuous **reconciliation loop**: it compares the desired state you declared (3 replicas of this image) against the actual state of the cluster, and takes action to close any gap — killing extra Pods, starting missing ones, rescheduling Pods off a node that went offline. You never issue an imperative "restart this" command; you declare what you want, and the control plane keeps making it true.

## Why This Matters for Interviews

Interviewers usually want to see that you understand the *shape* of the system — that Pods are ephemeral and disposable, Deployments manage Pod lifecycle and enable zero-downtime rolling updates, and Services solve the stable-networking problem created by that ephemerality. You don't need to have memorized every \`kubectl\` flag to demonstrate that.
	`
	},
	'CI/CD': {
		definition:
			'A set of practices — Continuous Integration and Continuous Delivery/Deployment — that automate building, testing, and releasing code every time it changes, instead of doing those steps manually and infrequently.',
		useCase:
			'A team of ten engineers merging to the main branch several times a day, where every push is automatically built, tested, and (once approved) deployed, catching integration bugs within minutes instead of during a painful release week.',
		detailedMarkdown: `
# CI/CD

**CI/CD** stands for **Continuous Integration** and **Continuous Delivery/Deployment** — twin practices that automate the path from "a developer wrote code" to "that code is running in production," replacing manual, infrequent, error-prone releases with small, frequent, automated ones.

## Continuous Integration (CI)

**Continuous Integration** means every developer merges their changes into a shared branch frequently (multiple times a day, ideally), and each merge automatically triggers a build and a test suite run. The goal is to catch integration problems — two people's changes conflicting, a regression slipping in — within minutes of the change being made, while it's still cheap and easy to fix, rather than discovering it days later during a dreaded "merge week."

Before CI became standard practice, teams would often let branches diverge for weeks and then face brutal, multi-day merge conflicts right before a release. CI turns that one big risky event into many small, low-risk ones.

## Continuous Delivery vs. Continuous Deployment

These two terms are often confused, and the difference is one word's worth of automation:

- **Continuous Delivery**: every change that passes the pipeline is automatically packaged into a releasable artifact and is *ready* to deploy at any time — but an actual human still clicks "deploy" to push it to production.
- **Continuous Deployment**: goes one step further and removes the human gate entirely — every change that passes all automated checks is deployed to production automatically, with no manual approval step.

| | **Continuous Delivery** | **Continuous Deployment** |
|---|---|---|
| Release to production | Manual trigger (a person approves) | Fully automatic |
| Common in | Regulated industries, enterprise software | High-velocity SaaS, feature-flagged products |
| Risk profile | Slightly slower, adds a safety gate | Fastest feedback loop, requires strong test coverage |

## A Typical Pipeline

Most CI/CD pipelines run a similar sequence of stages, each one gating the next — if a stage fails, the pipeline stops and the change never reaches production:

\`\`\`text
Lint  ->  Unit Tests  ->  Build  ->  Integration Tests  ->  Deploy (staging)  ->  Deploy (production)
\`\`\`

- **Lint**: static analysis catches style issues and obvious bugs (unused variables, type errors) before spending time on a full test run.
- **Unit tests**: fast, isolated tests of individual functions/modules run on every push.
- **Build**: compile the app / build the Docker image — the artifact that will actually get deployed.
- **Integration tests**: slower tests that exercise the app against real (or realistic) dependencies like a test database.
- **Deploy to staging**: an automatic deploy to a production-like environment for final verification, sometimes including manual QA or smoke tests.
- **Deploy to production**: the final release, either gated by a human approval (Delivery) or fully automatic (Deployment).

## Why It Reduces Risk

The core insight is that **smaller, more frequent changes are safer than big, infrequent ones**. If you deploy fifty small changes a week and something breaks, you know it's almost certainly one of a handful of recent commits — rollback and root-causing are fast. If you deploy once a month with hundreds of changes bundled together, a regression could be caused by anything, and rolling back means losing a month of unrelated work too. Automating the build/test/deploy steps also removes human error from repetitive manual release checklists — the pipeline runs the exact same steps, in the exact same order, every single time.

## Why This Matters for Interviews

Be ready to clearly distinguish CI (automating build+test on every change) from CD (automating the release), and Delivery from Deployment specifically (human gate or not). Interviewers also like probing on rollback strategy and feature flags — CI/CD makes frequent releases safe, but you still need a plan for when a bad change does slip through: fast rollback, canary releases, or feature flags to disable new code without a redeploy.
	`
	},
	'GitHub Actions': {
		definition:
			'A CI/CD platform built directly into GitHub that runs automated workflows — defined as YAML files in the repository — in response to repo events like pushes, pull requests, or a schedule.',
		useCase:
			'Running the full test suite and linter automatically on every pull request, blocking the merge button until all checks pass.',
		detailedMarkdown: `
# GitHub Actions

**GitHub Actions** is GitHub's built-in CI/CD platform. Instead of configuring a separate CI server, you commit a YAML file describing a **workflow** directly into the repository (under \`.github/workflows/\`), and GitHub runs it automatically whenever the events you specify occur — a push, a pull request, a new tag, a schedule, or even a manual button click.

## Workflow YAML Structure

Every workflow file has three key top-level sections:

- **\`on\`** — which events trigger this workflow (\`push\`, \`pull_request\`, \`schedule\`, \`workflow_dispatch\` for manual runs, and so on).
- **\`jobs\`** — one or more independent units of work; by default jobs run in parallel unless you declare dependencies between them.
- **\`steps\`** — inside each job, the ordered list of commands or reusable **actions** to run.

## A Real Example: Run Tests on Every Push

\`\`\`yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test
\`\`\`

Reading this: on every push to \`main\` or every pull request targeting \`main\`, GitHub spins up a fresh Ubuntu virtual machine (a **runner**), checks out the repo, installs Node 20, and runs \`npm ci\`, then lint, then tests — in that order, stopping immediately if any step fails.

## Runners and the Actions Marketplace

A **runner** is the machine that actually executes a job. \`runs-on: ubuntu-latest\` requests one of GitHub's **hosted runners** — a fresh VM provisioned for the duration of the job and destroyed afterward. Teams with special hardware or networking needs can instead register their own **self-hosted runners**.

Steps that use \`uses:\` (like \`actions/checkout@v4\`) are pulling in a reusable **Action** — a packaged, versioned unit of automation — from the **GitHub Marketplace**. Rather than hand-writing the shell commands to clone a repo or set up a language runtime, you reference a community- or vendor-maintained action, pin it to a version (\`@v4\`), and it handles the details. This is one of GitHub Actions' biggest strengths: a huge ecosystem of ready-made building blocks for deploying to AWS, publishing Docker images, sending Slack notifications, and far more.

## Secrets and Deploy Jobs

Sensitive values (API tokens, cloud credentials) are stored as **encrypted secrets** in the repo/org settings and referenced with the \`\\\${{ secrets.NAME }}\` expression syntax — never hardcoded in the YAML:

\`\`\`yaml
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Deploy
        run: ./deploy.sh
        env:
          DEPLOY_TOKEN: \\\${{ secrets.DEPLOY_TOKEN }}
\`\`\`

The \`needs: test\` line makes this job wait for the \`test\` job to succeed first, and \`if:\` restricts it to only run on \`main\` — a simple way to build a real lint-then-test-then-deploy pipeline out of independent jobs.

## Why This Matters for Interviews

GitHub Actions questions usually test whether you understand that workflows are event-driven and declarative (YAML, not scripts), that jobs run on isolated runners, and how job dependencies (\`needs\`) and conditionals (\`if\`) let you build multi-stage pipelines out of simple building blocks — plus knowing never to put secrets directly in a workflow file.
	`
	},
	Jenkins: {
		definition:
			'An open-source, self-hosted automation server that runs build, test, and deployment pipelines, historically configured through a plugin-heavy UI or a Jenkinsfile written in Groovy-based pipeline syntax.',
		useCase:
			'A large enterprise with strict on-premises infrastructure requirements running its entire release pipeline on internally-hosted Jenkins servers, integrated with a custom internal artifact repository and approval system.',
		detailedMarkdown: `
# Jenkins

**Jenkins** is one of the oldest and most widely deployed CI/CD tools, first released in 2011 (as a fork of Hudson). Unlike GitHub Actions or other cloud-native CI platforms, Jenkins is **self-hosted**: you install and maintain the Jenkins server yourself (on your own infrastructure or a VM), and it predates the now-common convention of defining pipelines as YAML files living in the repository.

## The Jenkinsfile

Modern Jenkins pipelines are defined in a **Jenkinsfile** — a text file, checked into the repository, written in a Groovy-based **declarative pipeline** syntax (an older, more flexible but harder-to-read **scripted pipeline** syntax also exists).

\`\`\`groovy
pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                sh 'npm ci'
                sh 'npm run build'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sh './deploy.sh'
            }
        }
    }

    post {
        always {
            junit 'test-results/*.xml'
        }
        failure {
            mail to: 'team@example.com', subject: 'Build failed', body: 'Check Jenkins.'
        }
    }
}
\`\`\`

This should look conceptually familiar if you know GitHub Actions: \`stages\`/\`stage\` play the same role as \`jobs\`/\`steps\`, \`when { branch 'main' }\` is analogous to an \`if:\` condition, and \`post\` defines cleanup/notification behavior that runs regardless of (or depending on) the pipeline's outcome — similar to a \`finally\` block.

## Why Teams Still Choose Jenkins

Jenkins earned its dominance through **extensibility**: it has an enormous plugin ecosystem (thousands of plugins) covering nearly any tool, source control system, or notification service imaginable. Because it's self-hosted, organizations also get full control over the build environment, network access, and compliance posture — often a hard requirement in banking, healthcare, or government settings where code and credentials can't touch a third-party cloud service.

## Jenkins vs. GitHub Actions

| | **Jenkins** | **GitHub Actions** |
|---|---|---|
| Hosting | Self-hosted (you run the server) | Cloud-hosted by GitHub (or self-hosted runners) |
| Configuration | Jenkinsfile (Groovy) + heavy plugin/UI configuration | YAML file directly in the repo |
| Setup burden | High — install, patch, and maintain the server yourself | Low — nothing to provision, works out of the box on GitHub |
| Extensibility | Massive plugin ecosystem, very flexible | Marketplace of reusable Actions, growing fast |
| Best fit | On-prem/compliance-heavy environments, complex legacy pipelines | Projects already on GitHub wanting minimal ops overhead |
| Maintenance cost | You own upgrades, security patches, and scaling the server | Effectively zero — GitHub manages the infrastructure |

Neither is strictly "better" — Jenkins trades setup and maintenance burden for maximum control and flexibility, while GitHub Actions trades some of that flexibility for near-zero operational overhead when your code already lives on GitHub.

## Why This Matters for Interviews

You're unlikely to be asked to write a full Jenkinsfile from memory, but you should be able to explain *why* an organization might still run Jenkins in a world with cloud-native CI (compliance, legacy investment, plugin ecosystem, on-prem requirements) and recognize the declarative pipeline structure — \`pipeline\` → \`stages\` → \`stage\` → \`steps\` — if you see one.
	`
	},
	Nginx: {
		definition:
			'A high-performance web server that is also commonly used as a reverse proxy, load balancer, and static file server sitting in front of application servers.',
		useCase:
			'Terminating HTTPS traffic and forwarding requests to a Node.js app running on an internal port, while serving pre-built static assets directly without ever touching the application process.',
		detailedMarkdown: `
# Nginx

**Nginx** (pronounced "engine-x") is a high-performance, event-driven web server that has become the default piece of infrastructure sitting in front of application servers. It plays three related roles depending on how it's configured: a plain **web server** for static files, a **reverse proxy** that forwards requests to backend application processes, and a **load balancer** that spreads traffic across multiple backend instances.

## Reverse Proxy

A normal ("forward") proxy sits in front of clients, forwarding their requests outward. A **reverse proxy** does the opposite: it sits in front of one or more backend servers, and clients only ever talk to the proxy — they never connect to the application server directly. Nginx receives the request, forwards it to the appropriate backend (often on \`localhost\` or an internal network address), and relays the backend's response back to the client.

This is useful for several reasons: Nginx can terminate **TLS/HTTPS** once at the edge (so the application server only ever has to speak plain HTTP internally), it can serve static assets itself without waking up the application process at all, and it decouples the public-facing address/port from wherever the app actually runs — you can restart or move the backend without clients noticing.

## Load Balancer

When you have more than one instance of a backend running (for capacity or redundancy), Nginx can distribute incoming requests across all of them using an **upstream** block, so no single instance gets overwhelmed and a crashed instance can be taken out of rotation.

## A Real nginx.conf

\`\`\`nginx
upstream app_servers {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
}

server {
    listen 80;
    server_name example.com;

    # Serve pre-built static assets directly - never touches the app
    location /static/ {
        root /var/www/myapp;
        expires 30d;
    }

    # Everything else is reverse-proxied to the app servers
    location / {
        proxy_pass http://app_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
\`\`\`

Walking through it: the \`upstream\` block names a pool of two backend instances (a basic form of load balancing — Nginx defaults to round-robin between them). The \`/static/\` location is handled entirely by Nginx reading files off disk, while every other request falls through to the \`location /\` block, which proxies to \`app_servers\` and forwards along the original client IP and protocol via headers the backend can read (\`X-Real-IP\`, \`X-Forwarded-For\`), since from the app's point of view every request now technically comes from Nginx itself.

## Why It's Everywhere

Nginx's event-driven, non-blocking architecture lets a single instance handle tens of thousands of concurrent connections with a small, predictable memory footprint — a very different model from spawning a thread or process per connection. Combined with the fact that it solves three common problems at once (static file serving, TLS termination, and load balancing) with one lightweight, battle-tested piece of software, it has become close to a default choice for "the thing that sits in front of my app" across the industry — often paired with application servers written in Node.js, Python (Gunicorn), Ruby (Puma), or Java (Tomcat), none of which are typically built to be exposed directly to the public internet.

## Why This Matters for Interviews

Be ready to explain the reverse-proxy vs. forward-proxy distinction, why TLS termination and static asset serving are commonly pushed to Nginx rather than the app server, and how the \`upstream\` block enables basic load balancing. It's also a good topic to mention offhand when discussing production deployment architecture — "the app sits behind Nginx" signals you understand a standard, real-world topology.
	`
	}
};
