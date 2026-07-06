import type { RoadmapDetailMap } from './types';

export const CloudContent: RoadmapDetailMap = {
	'AWS Basics': {
		definition:
			'Amazon Web Services (AWS) is the market-leading cloud computing platform that rents compute, storage, database, networking, and hundreds of other IT services on-demand over the internet, billed by usage instead of upfront hardware purchase.',
		useCase:
			'A startup launches a product without buying a single server — it spins up a few EC2 instances and an RDS database, and can scale both up or down as traffic changes.',
		detailedMarkdown: `
# AWS Basics

**Amazon Web Services** is the original and largest public cloud provider, launched in 2006. Instead of buying, racking, and maintaining physical servers, you rent exactly the compute, storage, and networking capacity you need, when you need it, and pay only for what you use.

## Why cloud instead of your own data center?
- **No capital expenditure** — no buying servers, no data center leases.
- **Elasticity** — scale from 1 server to 10,000 in minutes, then scale back down.
- **Global reach** — deploy in a region close to your users without building anything physically there.
- **Managed services** — AWS operates the undifferentiated heavy lifting (patching an OS, replicating a database) so your team focuses on the product.

## The main service categories
| Category | Purpose | Flagship Services |
|---|---|---|
| Compute | Run code/VMs | EC2, Lambda, ECS, EKS |
| Storage | Store files/objects | S3, EBS, EFS |
| Database | Managed data stores | RDS, DynamoDB, Aurora |
| Networking | Connect everything | VPC, Route53, CloudFront |
| Security/Identity | Control access | IAM, KMS, Cognito |
| Messaging | Decouple services | SQS, SNS, EventBridge |

You'll see each of these broken out into its own topic — this entry is the map, the others are the territory.

## Regions and Availability Zones
AWS infrastructure is physically organized in a hierarchy:
- A **Region** is a geographic area (e.g., \`us-east-1\` in Virginia, \`eu-west-1\` in Ireland). Choose a region close to your users for latency, or to satisfy data-residency laws.
- Each region contains multiple **Availability Zones (AZs)** — physically separate data centers (with independent power, cooling, and networking) a few miles apart, connected by low-latency links.

The reason AZs exist is fault isolation: if you deploy across two or three AZs, a single data center outage (fire, flood, power loss) doesn't take your whole application down. **"Multi-AZ" is the single most common high-availability pattern you'll be asked about in interviews** — for EC2 fleets behind a load balancer, for RDS with a standby replica, for anything that must survive one data center failing.

## The Shared Responsibility Model
This is a favorite interview question because it defines where your job ends and AWS's begins:
- **AWS is responsible for security *of* the cloud** — physical data center security, the hardware, the network infrastructure, and (for managed services) the underlying software.
- **You are responsible for security *in* the cloud** — your IAM policies, your data encryption choices, your security group rules, your OS patching (on EC2, since it's unmanaged compute), and your application code.

The split moves depending on the service: for EC2 (infrastructure-as-a-service) you own the guest OS and everything above it; for Lambda or RDS (managed services) AWS takes on more (patching the OS/runtime), but you're still responsible for your code, your data, and your access policies.

## Why interviewers ask about this
Most engineering interviews don't expect you to recite AWS's full service catalog — they want to know you've actually *used* the cloud: that you understand elasticity, that you know regions/AZs affect availability and latency, and that you can reason about who's responsible for a given security failure. "Have you used AWS?" is really asking "do you think about infrastructure as a design constraint, not an afterthought?"
	`
	},

	'Azure Basics': {
		definition:
			'Microsoft Azure is the second-largest public cloud platform, offering a similar breadth of compute, storage, database, and networking services to AWS, with especially strong integration into enterprise Microsoft tooling (Active Directory, .NET, Windows Server).',
		useCase:
			'A large enterprise already running on Windows Server and Active Directory migrates to Azure to get single sign-on and hybrid on-prem/cloud identity almost for free via Azure AD.',
		detailedMarkdown: `
# Azure Basics

**Microsoft Azure** launched in 2010 and has grown into the #2 public cloud by market share, behind AWS. Conceptually it offers the same building blocks — virtual machines, object storage, managed databases, serverless functions — but with its own naming, its own portal, and deep hooks into the Microsoft ecosystem enterprises already run (Windows Server, Active Directory, SQL Server, .NET, Office 365).

## The organizing concept: Resource Groups
Where AWS resources just exist inside an account/region, Azure asks you to organize almost everything into a **Resource Group** — a logical container that holds related resources (a VM, its disk, its network interface, its database) that share the same lifecycle. Delete the resource group, and everything inside it is deleted together. This is a genuinely different mental model from AWS and is one of the first things people notice when switching platforms — it makes "tear down this whole environment" a one-click/one-command operation.

Above resource groups sits a **Subscription** (billing + access boundary, roughly analogous to an AWS account), and above that a Management Group for organizing many subscriptions (roughly analogous to AWS Organizations).

## Azure vs. AWS: rough service mapping
| Purpose | AWS | Azure |
|---|---|---|
| Virtual machines | EC2 | Virtual Machines |
| Object storage | S3 | Blob Storage |
| Relational DB | RDS | Azure SQL Database |
| NoSQL DB | DynamoDB | Cosmos DB |
| Serverless functions | Lambda | Azure Functions |
| CDN | CloudFront | Azure CDN / Front Door |
| Virtual network | VPC | Virtual Network (VNet) |
| DNS | Route53 | Azure DNS |
| Message queue | SQS | Queue Storage / Service Bus |
| Identity | IAM | Azure Active Directory (Entra ID) + RBAC |

## What Azure is genuinely strong at
- **Enterprise identity**: Azure Active Directory (now branded **Microsoft Entra ID**) is the backbone of identity for most large corporations already, so Azure workloads inherit single sign-on almost for free.
- **Hybrid cloud**: Azure Arc and Azure Stack let companies run Azure-consistent management on their *own* on-prem hardware — a genuine differentiator for regulated industries that can't fully leave their data centers.
- **.NET and Windows workloads**: naturally the best-supported platform for legacy Windows Server and .NET applications.

## Why interviewers ask about this
Fewer companies run Azure than AWS in the startup/product-engineering world, but it dominates traditional enterprises, banks, and government contracts. If a job posting mentions Azure, the interviewer usually just wants to confirm you can map your AWS (or general cloud) knowledge across — that you know a VM is a VM and a managed Postgres is a managed Postgres regardless of vendor logo. Lead with the concepts that transfer (resource organization, managed vs. unmanaged services, regions) rather than memorizing Azure's specific portal UI.
	`
	},

	'GCP Basics': {
		definition:
			"Google Cloud Platform (GCP) is Google's public cloud offering, built on the same infrastructure that runs Google Search and YouTube, known for strong data analytics/ML tooling and for originating Kubernetes.",
		useCase:
			'A data-heavy company chooses GCP so its analytics team can query terabytes of data in seconds with BigQuery without provisioning any infrastructure.',
		detailedMarkdown: `
# GCP Basics

**Google Cloud Platform** is Google's public cloud, running on the same global network and infrastructure Google built for Search, Gmail, and YouTube. It's the third-largest of the "big three" clouds, and it differentiates less on breadth of services than AWS, and more on the depth of a few specific areas: data analytics, machine learning, and container orchestration.

## The organizing concept: Projects
Every resource in GCP lives inside a **Project** — the fundamental unit of billing, permissions, and organization, identified by a globally-unique project ID. Projects sit under optional **Folders**, which sit under an **Organization**. This is conceptually closer to AWS accounts than to Azure's resource groups — a project is a hard isolation boundary, not just a logical folder.

## GCP vs. AWS vs. Azure: rough service mapping
| Purpose | AWS | Azure | GCP |
|---|---|---|---|
| Virtual machines | EC2 | Virtual Machines | Compute Engine |
| Object storage | S3 | Blob Storage | Cloud Storage |
| Relational DB | RDS | Azure SQL Database | Cloud SQL |
| NoSQL DB | DynamoDB | Cosmos DB | Firestore / Bigtable |
| Serverless functions | Lambda | Azure Functions | Cloud Functions |
| Managed Kubernetes | EKS | AKS | GKE |
| Pub/sub messaging | SNS + SQS | Service Bus | Pub/Sub |
| Data warehouse | Redshift | Synapse Analytics | BigQuery |

## Where GCP genuinely leads
- **Kubernetes**: Google *invented* the ideas behind Kubernetes internally (as "Borg") before open-sourcing them, and **GKE (Google Kubernetes Engine)** is widely regarded as the most polished managed Kubernetes offering — it was the first, and container orchestration is arguably GCP's home turf.
- **Data & analytics**: **BigQuery** is a serverless data warehouse that can run SQL over petabytes with no cluster to manage, and is frequently cited as best-in-class for ad-hoc analytics at scale.
- **AI/ML**: Google's ML research (TensorFlow, Vertex AI, TPUs — custom silicon built specifically for machine learning) gives GCP a strong pitch for ML-heavy workloads.
- **Global network**: Google's private backbone network connecting its data centers is one of the largest in the world, which shows up as consistently low latency between GCP regions.

## Where it trails
GCP has a smaller service catalog and smaller market share than AWS or Azure, which in practice means a smaller talent pool, fewer third-party integrations, and less enterprise sales/support muscle — though for startups building data- or ML-heavy products, that trade-off is often worth it.

## Why interviewers ask about this
The signal an interviewer is looking for is the same across all three clouds: do you understand elasticity, managed vs. self-managed trade-offs, and can you reason about a service by its *purpose* rather than its brand name. If you know AWS well, the fastest way to sound credible on GCP is to describe things by mapping — "GKE is basically their EKS, but it's the platform Kubernetes itself came from" — rather than pretending deep hands-on GCP experience you don't have.
	`
	},

	EC2: {
		definition:
			'Amazon EC2 (Elastic Compute Cloud) provides resizable virtual machines ("instances") in the cloud that you can launch, configure, and scale on demand, paying only for the compute time you use.',
		useCase:
			"Running a web application server that needs full OS-level control (installing custom system packages, tuning kernel parameters) that a fully-managed service like Lambda wouldn't allow.",
		detailedMarkdown: `
# EC2 (Elastic Compute Cloud)

**EC2** is AWS's core Infrastructure-as-a-Service (IaaS) offering: a virtual machine you fully control, running in AWS's data centers instead of your own. It's the cloud equivalent of buying a server, except you can provision one in under a minute and destroy it just as fast.

## Launching an instance — the key choices
1. **AMI (Amazon Machine Image)** — the template: OS + pre-installed software the instance boots from (Amazon Linux, Ubuntu, Windows Server, or a custom AMI you baked yourself with your app pre-installed).
2. **Instance type** — how much CPU/RAM/network you get.
3. **Storage** — an **EBS (Elastic Block Store)** volume, a persistent virtual hard disk attached to the instance.
4. **Security Group** — a virtual firewall controlling inbound/outbound traffic (see the VPC topic).
5. **Key pair** — the SSH keypair used to log in.

## Instance type families
Instance types are named like \`m5.large\` — the letter/number is the family+generation, the suffix is the size.
| Family | Optimized for | Examples | Typical use |
|---|---|---|---|
| General purpose | Balanced CPU/RAM | \`t3\`, \`m5\` | Web servers, small/medium databases |
| Compute optimized | High CPU-to-RAM ratio | \`c5\`, \`c6g\` | Batch processing, video encoding, gaming servers |
| Memory optimized | High RAM-to-CPU ratio | \`r5\`, \`x1\` | In-memory caches, large databases |
| Storage optimized | High-speed local disk I/O | \`i3\`, \`d2\` | Data warehousing, distributed file systems |
| Accelerated computing | GPUs/FPGAs | \`p4\`, \`g5\` | ML training, rendering |

## Pricing models
This is one of the most commonly asked EC2 interview questions:
| Model | How it works | Best for |
|---|---|---|
| **On-Demand** | Pay per second/hour, no commitment | Unpredictable or short-term workloads |
| **Reserved Instances / Savings Plans** | Commit to 1 or 3 years for up to ~70% discount | Steady, predictable baseline load |
| **Spot Instances** | Bid for spare AWS capacity at up to 90% off, but AWS can reclaim it with 2 minutes' notice | Fault-tolerant, interruptible workloads (batch jobs, CI runners, stateless workers) |
| **Dedicated Hosts/Instances** | Physical server dedicated to you | Strict compliance/licensing requirements |

## Scaling EC2
A single instance is a single point of failure. In practice, EC2 is almost always paired with:
- An **Auto Scaling Group (ASG)** — automatically adds/removes instances based on load or a schedule, and replaces unhealthy ones.
- An **Elastic Load Balancer (ALB/NLB)** — spreads incoming traffic across all healthy instances in the group.

Deploying across multiple AZs inside an ASG is the standard way to survive a single data center outage.

## Why interviewers ask about this
EC2 is the "default" building block, so questions usually probe whether you can reason about **trade-offs**, not just definitions: "Would you use Spot for this workload?" (only if it can tolerate interruption), "How would you scale this service?" (ASG + load balancer, not a bigger single box — that's the classic vertical vs. horizontal scaling distinction), and "How do you patch 500 running instances?" (you don't SSH into each one — you bake a new AMI and roll it out via the ASG).
	`
	},

	S3: {
		definition:
			'Amazon S3 (Simple Storage Service) is an object storage service that lets you store and retrieve any amount of data — files, images, backups, logs — as "objects" inside "buckets," accessible over HTTP(S) with virtually unlimited scale and 99.999999999% ("eleven nines") durability.',
		useCase:
			"Hosting a company's static marketing website, storing every user-uploaded profile picture, and archiving years of application logs — all in the same service, at a fraction of the cost of a traditional file server.",
		detailedMarkdown: `
# S3 (Simple Storage Service)

**S3** is object storage: instead of a file system with directories you mount, you store discrete **objects** (a file plus metadata) inside **buckets**, addressed by a unique **key** (essentially the "path"). There's no real limit on total storage, individual objects can be up to 5 TB, and S3 is one of the oldest and most battle-tested AWS services (launched in 2006).

## The core model
- **Bucket** — a globally-uniquely-named container (e.g., \`my-company-user-uploads\`). Buckets live in one region.
- **Object** — the actual data (a file), plus metadata, addressed by a **key** (e.g., \`avatars/user-42.png\`). Keys can contain slashes, which the S3 console renders as "folders," but under the hood S3 is a flat key-value store, not a hierarchical file system.
- **Versioning** (optional) — keeps every version of an object instead of overwriting it, protecting against accidental deletes/overwrites.

## Uploading with the CLI
\`\`\`bash
aws s3 cp ./report.pdf s3://my-company-reports/2026/q1/report.pdf
\`\`\`

## Storage classes — the interview favorite
S3 lets you pick a storage class per object to trade off cost against retrieval speed/frequency:
| Class | Retrieval | Typical cost | Use case |
|---|---|---|---|
| **S3 Standard** | Milliseconds | Highest | Frequently accessed data |
| **S3 Intelligent-Tiering** | Milliseconds | Auto-optimized | Unknown/changing access patterns |
| **S3 Standard-IA** (Infrequent Access) | Milliseconds | Lower storage, retrieval fee | Backups, older but occasionally-needed data |
| **S3 One Zone-IA** | Milliseconds | Even lower (single AZ, less durable) | Easily-reproducible infrequent data |
| **S3 Glacier Instant Retrieval** | Milliseconds | Very low | Rarely accessed archives needing instant access |
| **S3 Glacier Flexible Retrieval** | Minutes to hours | Very low | Archives, compliance data |
| **S3 Glacier Deep Archive** | Up to 12 hours | Lowest of all | Long-term regulatory archives (7–10+ year retention) |

**Lifecycle policies** automate this: e.g., "move objects to Standard-IA after 30 days, then to Glacier Deep Archive after 1 year, then delete after 7 years."

## Common real-world use cases
- **Static website hosting** — serve HTML/CSS/JS directly from a bucket (often paired with CloudFront in front of it).
- **Backups and disaster recovery** — cheap, durable, off-site storage.
- **Data lake** — the landing zone for raw data before it's processed by analytics tools (Athena, EMR, Redshift Spectrum can all query S3 directly).
- **Application asset storage** — user uploads, images, videos, logs.

## Access control
S3 access is governed by a combination of **bucket policies** (JSON, attached to the bucket), **IAM policies** (attached to users/roles), and (legacy) **ACLs**. A huge number of real-world data breaches trace back to an S3 bucket accidentally left public — "block all public access" is now on by default for new buckets specifically because of this history.

## Why interviewers ask about this
S3 questions test whether you understand **object storage vs. block/file storage** (you can't mount S3 and run a database directly on it the way you would an EBS volume — there's no random-access file locking), whether you know how to control cost at scale (storage classes/lifecycle rules), and whether you're security-conscious about the single most common cloud misconfiguration: an accidentally public bucket.
	`
	},

	IAM: {
		definition:
			'AWS Identity and Access Management (IAM) is the service that controls *who* (users, groups, roles, or other AWS services) can do *what* (which actions) to *which* resources, via JSON policy documents, following the principle of least privilege.',
		useCase:
			"Giving a Lambda function permission to read from one specific S3 bucket and write to one specific DynamoDB table — nothing else — so a bug or compromise in that function can't touch unrelated resources.",
		detailedMarkdown: `
# IAM (Identity and Access Management)

**IAM** is how AWS answers "is this request allowed?" for literally every API call made against your account. Get it wrong, and you either lock yourself out of your own infrastructure, or — far more commonly in real incidents — leave a door wide open for anyone to walk through.

## The four building blocks
- **User** — an identity for a person (or a service that predates roles), with long-lived credentials (password, access keys).
- **Group** — a collection of users, used to apply the same policies to many people at once (e.g., all "Developers").
- **Role** — an identity *without* long-lived credentials, assumed temporarily by a user, an AWS service (e.g., an EC2 instance or Lambda function), or even an account outside your own. This is the preferred way to grant permissions to *services* — never hard-code an access key into application code when a role can be attached instead.
- **Policy** — a JSON document that defines permissions: which actions, on which resources, are Allowed or Denied.

## Anatomy of a policy
\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject"],
      "Resource": "arn:aws:s3:::my-app-uploads/*"
    }
  ]
}
\`\`\`
This policy allows reading and writing objects, but **only** inside the \`my-app-uploads\` bucket — nothing else in the account. That scoping is the whole point.

## Principle of least privilege
Grant the *minimum* set of permissions needed to do a job, nothing more. In practice this means:
- Never attach \`AdministratorAccess\` to a service role "just to make it work" and move on.
- Prefer roles scoped to specific resource ARNs over wildcard \`"Resource": "*"\`.
- Use **IAM Access Analyzer** to detect policies that are broader than what's actually used.
- Enforce **MFA (multi-factor authentication)** on human users, especially the root account, and avoid using the root account for day-to-day work entirely.

## Users vs. Roles — the interview distinction
A **User** has permanent credentials that live until someone rotates or deletes them — a real liability if leaked. A **Role** is assumed on demand and issues short-lived, auto-expiring temporary credentials via AWS STS (Security Token Service). This is why the modern best practice is: humans get roles via SSO/federation, services get roles, and long-lived IAM user access keys are avoided wherever possible.

## Why IAM misconfiguration is a leading cause of real breaches
Almost every major cloud data breach in the last decade traces back to an identity/access failure, not a zero-day exploit: an overly-permissive role attached to a public-facing server, a leaked access key committed to a public GitHub repo, or a policy with \`"Resource": "*"\` that let a single compromised credential pivot into the entire account. Compare that to, say, a kernel vulnerability — attackers overwhelmingly go for the door someone left unlocked, because it's far easier than finding a genuine zero-day.

## Why interviewers ask about this
"How would you grant this Lambda access to that S3 bucket?" is really testing whether you reach for least-privilege by instinct — a scoped role with a narrow policy — rather than the fastest-to-type answer of a wildcard admin policy. IAM fluency is one of the clearest signals of production cloud experience versus "I clicked around a tutorial once."
	`
	},

	RDS: {
		definition:
			"Amazon RDS (Relational Database Service) is a managed relational database service that automates the operational grunt work of running a database — provisioning, patching, backups, and failover — for engines like PostgreSQL, MySQL, MariaDB, SQL Server, Oracle, and AWS's own Aurora.",
		useCase:
			"A team needs a production Postgres database with nightly backups and automatic failover, but doesn't want to spend engineering time patching the OS or babysitting replication — RDS handles all of that.",
		detailedMarkdown: `
# RDS (Relational Database Service)

**RDS** takes the database engines you already know (Postgres, MySQL, etc.) and removes the operational burden of running them yourself on a server. You still design your schema and write your queries — AWS handles everything underneath.

## Self-managed EC2 database vs. RDS
| Task | DB on EC2 (self-managed) | RDS (managed) |
|---|---|---|
| OS patching | You do it | AWS does it |
| DB engine patching | You do it (careful scheduling) | AWS does it (configurable maintenance window) |
| Backups | You script and test it | Automated daily snapshots + point-in-time recovery |
| High availability | You build replication yourself | One setting: **Multi-AZ** |
| Scaling reads | You configure replication manually | One click: **Read Replicas** |
| Root/OS access | Full access | No OS-level access — RDS is a black box you configure via the AWS API |

The trade-off is the last row: you give up low-level control (custom kernel tuning, unsupported extensions, direct filesystem access) in exchange for AWS handling everything else. For the vast majority of applications, that trade is an easy win.

## Multi-AZ: high availability
Enabling **Multi-AZ** provisions a **synchronous standby replica** of your database in a *different* Availability Zone. If the primary fails (hardware fault, AZ outage, even a routine patch), RDS automatically fails over to the standby, typically in under a minute, and updates the DNS endpoint your app already uses — no application code change required. This is purely for **availability**, not for offloading read traffic (the standby isn't queryable).

## Read Replicas: scaling reads
A **Read Replica** is a separate, asynchronously-replicated copy of your database that *can* serve read queries, letting you horizontally scale read-heavy workloads by pointing reporting/analytics traffic at replicas instead of the primary. Because replication is asynchronous, replicas can lag slightly behind the primary — an important caveat for any "read your own write" scenario. RDS supports both Multi-AZ *and* Read Replicas simultaneously for a database that needs both.

## Supported engines
MySQL, PostgreSQL, MariaDB, Oracle, Microsoft SQL Server, and **Aurora** — AWS's own MySQL/Postgres-compatible engine re-engineered for the cloud, offering higher throughput and storage that scales automatically and separately from compute.

## Backups
- **Automated backups**: daily full snapshot + continuous transaction log capture, enabling **point-in-time recovery** to any second within your retention window (up to 35 days).
- **Manual snapshots**: user-triggered, retained until you delete them — useful before a risky schema migration.

## Why interviewers ask about this
RDS questions usually probe two things: whether you know the difference between **Multi-AZ (availability)** and **Read Replicas (read scaling)** — a very common mix-up — and whether you can articulate *why* a team would pay the managed-service premium instead of just running Postgres on an EC2 box (answer: because patching, backup testing, and failover engineering are real, recurring costs in engineer-hours that RDS eliminates).
	`
	},

	Lambda: {
		definition:
			'AWS Lambda is a serverless compute service that runs your code in response to events — an HTTP request, a file upload, a schedule — without you provisioning or managing any servers, billed per invocation and per millisecond of execution time.',
		useCase:
			'Automatically resizing every image uploaded to an S3 bucket into thumbnail versions, running a tiny function only when a new upload event fires, with zero servers sitting idle between uploads.',
		detailedMarkdown: `
# Lambda

**Lambda** is AWS's flagship "serverless" offering: you upload a function (a chunk of code with a handler), and AWS runs it in response to events, automatically provisioning whatever compute it needs, then tearing it down when it's done. There's no server to patch, scale, or pay for while it's idle.

## How it works
1. You write a **handler function** in a supported runtime (Node.js, Python, Java, Go, .NET, Ruby, or a custom container image).
2. You configure a **trigger** — the event source that invokes it.
3. AWS provisions an **execution environment**, runs your code, and bills you for exactly the time it ran.

## Common triggers
| Trigger | Example |
|---|---|
| **API Gateway** | An HTTP request hits an endpoint, Lambda handles it — a whole REST/GraphQL API with zero servers |
| **S3 event** | A file is uploaded → trigger a thumbnail-generation function |
| **EventBridge (scheduled)** | Run a cleanup job every night at 2am, cron-style |
| **SQS** | Process messages off a queue as they arrive |
| **DynamoDB Streams** | React to every insert/update/delete in a table |

## Cold starts
When Lambda hasn't run recently (or needs to scale up to handle more concurrent invocations), it must provision a *fresh* execution environment — download your code, start the runtime, run any top-level initialization — before it can execute your handler. This added latency is called a **cold start**, and it's one of the most-discussed Lambda trade-offs:
- Interpreted/lightweight runtimes (Node.js, Python) cold-start faster than JVM-based ones (Java).
- **Provisioned Concurrency** keeps a pool of execution environments pre-warmed and ready, eliminating cold starts for latency-sensitive workloads at an extra cost (you're now paying to keep something "idle," which cuts against Lambda's core pay-per-use pitch).
- Once "warm," an environment can be reused for subsequent invocations, so cold starts are the exception under sustained traffic, not the norm.

## Pricing
You pay for two things, and *only* while your code is actually running:
1. **Number of requests** (invocations).
2. **Duration** — GB-seconds, i.e. memory allocated × execution time.

There is no charge at all when your function isn't invoked — the defining trait of "serverless" and the reason Lambda is so cost-effective for spiky or infrequent workloads.

## Limits to know
- Max execution time: **15 minutes** per invocation (not built for long-running jobs — use ECS/Fargate or Step Functions for those).
- Functions are **stateless** — nothing persists between invocations except what you explicitly store elsewhere (S3, DynamoDB, etc.). Don't rely on local disk or in-memory caches surviving between calls.

## Why interviewers ask about this
Lambda questions probe whether you understand *when* serverless is the right call. It shines for event-driven, bursty, short-lived work (image processing, webhooks, glue code between services) where you don't want to pay for idle capacity. It's a poor fit for long-running processes, workloads needing consistent sub-10ms latency without paying for provisioned concurrency, or anything requiring heavy local state. Being able to say "I'd use Lambda here, but not there, because..." is the actual signal being tested.
	`
	},

	CloudFront: {
		definition:
			"Amazon CloudFront is AWS's Content Delivery Network (CDN) — it caches your content at edge locations around the world, so users are served from a nearby location instead of your origin server, cutting latency and offloading traffic.",
		useCase:
			'A global news site serves its images and JavaScript bundles through CloudFront so a reader in Tokyo gets them from a nearby edge location in milliseconds, instead of round-tripping to the origin server in Virginia.',
		detailedMarkdown: `
# CloudFront

**CloudFront** is AWS's CDN: a globally-distributed network of caching servers ("edge locations") that sit between your users and your **origin** (where the real content lives — an S3 bucket, an EC2/ALB-backed web server, or any HTTP endpoint). The first request for a piece of content fetches it from the origin and caches it at the nearest edge; every subsequent request from anyone nearby is served directly from that cache.

## Why this matters
Without a CDN, *every* request — no matter where the user is — travels all the way to your origin server's region. With CloudFront:
- **Lower latency**: content is served from one of hundreds of edge locations, geographically close to the user.
- **Reduced origin load**: cache hits never even reach your origin server, freeing it to handle only cache misses and dynamic requests.
- **DDoS resilience**: absorbing traffic across a globally distributed edge network makes volumetric attacks much harder to land directly on your origin.
- **HTTPS/TLS termination**: CloudFront can handle TLS at the edge, close to the user, rather than forcing every connection to negotiate TLS all the way back to origin.

## Origins
- **S3 bucket** — the classic pattern for a static website or media files.
- **Custom origin** — any HTTP server, including an Application Load Balancer in front of an EC2 fleet, letting CloudFront accelerate a fully dynamic application too.

## Cache behaviors
A **cache behavior** is a rule mapping a URL path pattern to caching settings — you can, for example, cache \`/images/*\` aggressively for a year, while forwarding \`/api/*\` straight to origin with no caching at all (because it's dynamic and user-specific). This lets a single distribution serve both static assets and live API traffic sensibly.

Cache duration is governed by **TTL (Time To Live)**, either set explicitly or driven by \`Cache-Control\`/\`Expires\` headers from the origin. When you deploy a new version of an asset, you either version the filename (e.g. \`app.a1b2c3.js\`) or issue a manual **invalidation** to purge stale cached copies early.

## A common pattern: private/signed content
For content that shouldn't be public (a paid video course, a user's private files), CloudFront supports **signed URLs** and **signed cookies** — cryptographically signed, time-limited access tokens that grant temporary access to otherwise restricted content, without making the underlying S3 bucket public.

## Why interviewers ask about this
CloudFront questions are really testing your understanding of **caching trade-offs in a distributed system**: what's cacheable vs. what must always hit origin (dynamic, personalized, or frequently-changing data), how cache invalidation works and why it's "one of the two hard problems in computer science," and why pushing static content to the edge is one of the highest-leverage, lowest-effort performance wins available — you get global latency improvements without touching your application code at all.
	`
	},

	VPC: {
		definition:
			'Amazon VPC (Virtual Private Cloud) is your own logically isolated slice of the AWS network — a private virtual network where you control the IP address range, subnets, routing, and firewalls for everything you launch inside it.',
		useCase:
			"Running a database on a private subnet with no route to the internet at all, reachable only from application servers inside the same VPC — so it's never directly exposed to the public internet no matter how it's misconfigured.",
		detailedMarkdown: `
# VPC (Virtual Private Cloud)

A **VPC** is your own private network inside AWS — every EC2 instance, RDS database, or Lambda-in-a-VPC you launch lives inside one. It's the networking foundation everything else in AWS sits on top of.

## The building blocks
- **CIDR block** — the IP address range for the whole VPC (e.g., \`10.0.0.0/16\`), which you then carve into smaller ranges for subnets.
- **Subnet** — a subdivision of the VPC's IP range, tied to a *single* Availability Zone. You typically create at least one subnet per AZ for redundancy.
- **Internet Gateway (IGW)** — attached to the VPC, it's what allows resources to communicate with the public internet at all.
- **NAT Gateway** — lets resources in a *private* subnet initiate outbound connections to the internet (e.g., to download a package update) **without** being reachable *from* the internet.
- **Route Table** — a set of rules determining where network traffic from a subnet is directed.

## Public vs. private subnets
This distinction is the single most important VPC concept for interviews:
| | Public Subnet | Private Subnet |
|---|---|---|
| Route table has a route to | Internet Gateway | NAT Gateway (or nothing) |
| Reachable directly from internet | Yes (if resource has a public IP) | No |
| Typical resident | Load balancers, bastion hosts | Application servers, databases |

The standard three-tier pattern: put your load balancer in public subnets, your app servers in private subnets (reachable only from the load balancer), and your database in private subnets with *no* route out at all — each layer only exposed to the layer that legitimately needs to reach it.

## Security Groups vs. Network ACLs
Both are firewalls, but they operate at different scopes and with different semantics — a classic interview comparison:
| | Security Group | Network ACL |
|---|---|---|
| Scope | Instance-level (attached to ENI) | Subnet-level |
| State | **Stateful** — a response to an allowed inbound request is automatically allowed out | **Stateless** — inbound and outbound rules must both explicitly allow the traffic |
| Rules | Allow rules only | Allow *and* Deny rules |
| Evaluation | All rules evaluated together | Rules evaluated in order by rule number |

In practice, most teams do the bulk of their filtering with Security Groups (simpler, stateful) and use NACLs sparingly for coarse subnet-wide rules or explicit denies (e.g., blocking a specific malicious IP range at the subnet level).

## Why interviewers ask about this
VPC design questions test whether you can reason about **defense in depth** for network architecture: why a database should never sit in a public subnet, why a NAT Gateway lets you patch private servers without exposing them, and whether you know the stateful/stateless distinction between Security Groups and NACLs (a frequent "gotcha" question, since forgetting NACLs are stateless is a classic cause of "why can't my server respond, the inbound rule is right there" debugging sessions).
	`
	},

	Route53: {
		definition:
			"Amazon Route 53 is AWS's highly available DNS web service and domain registrar — it translates human-readable domain names into IP addresses, and can also route traffic intelligently based on latency, health, or geography.",
		useCase:
			"Automatically failing over 'api.example.com' to a backup region's load balancer if health checks detect the primary region is down, with zero manual intervention.",
		detailedMarkdown: `
# Route 53

**Route 53** (named after the standard DNS port, 53) is AWS's Domain Name System service. At its simplest, it does what any DNS provider does — resolve \`example.com\` to an IP address — but it also layers in domain registration and traffic-routing intelligence that goes well beyond a plain A record.

## Hosted Zones
A **Hosted Zone** is a container for all the DNS records for a domain (e.g., \`example.com\`) and its subdomains.
- **Public Hosted Zone** — resolvable over the public internet.
- **Private Hosted Zone** — resolvable only from within specified VPCs, useful for internal service discovery that should never leak externally.

## Key record types
- **A record** — maps a name to an IPv4 address.
- **CNAME** — maps a name to *another name* (can't be used at the zone apex, i.e. the bare domain).
- **Alias record** — a Route 53-specific extension that behaves like a CNAME but *can* be used at the zone apex, and (critically) can point directly at AWS resources like a CloudFront distribution, an ALB, or an S3 website endpoint, resolving to their IP at query time for free.

## Routing policies — the interview centerpiece
Beyond simple resolution, Route 53 supports several **routing policies** that decide *which* answer to give when multiple records exist for the same name:
| Policy | Behavior |
|---|---|
| **Simple** | Return one (or a random one of several) IP for the record — no logic |
| **Weighted** | Split traffic across multiple targets by assigned percentage (e.g., 90/10 for a canary release) |
| **Latency-based** | Route the user to whichever region responds fastest for them |
| **Failover** | Route to a primary target; automatically switch to a secondary if the primary's health check fails |
| **Geolocation** | Route based on the user's geographic location (e.g., EU users to an EU-compliant endpoint) |
| **Multivalue Answer** | Return multiple healthy records, giving basic DNS-level load distribution with health checking |

## Health checks
Route 53 can continuously probe an endpoint (HTTP/HTTPS/TCP) and mark it unhealthy after consecutive failures — this is what powers the **Failover** routing policy, and can also simply drive alerting via CloudWatch.

## Domain registration
Route 53 also functions as a domain registrar — you can buy and manage a domain name (e.g., \`mystartup.com\`) directly through it, with its DNS hosting wired up automatically.

## Why interviewers ask about this
Route 53 questions usually test whether you understand DNS as a **routing and resilience tool**, not just a name-lookup service: can you design a multi-region failover setup, do you know why an Alias record is preferred over a CNAME for pointing at a CloudFront distribution, and do you understand that DNS changes are subject to **TTL-based caching** across the internet — meaning a DNS failover is not instantaneous everywhere, an important caveat when someone asks "how fast can we fail over?"
	`
	},

	SQS: {
		definition:
			"Amazon SQS (Simple Queue Service) is a fully-managed message queue that lets independent components of a system send, store, and receive messages asynchronously, decoupling producers from consumers so a slow or failing consumer doesn't block the producer.",
		useCase:
			'A web app accepts a video upload and immediately responds to the user, while the actual (slow) video transcoding work is dropped onto an SQS queue and processed by a fleet of background workers at their own pace.',
		detailedMarkdown: `
# SQS (Simple Queue Service)

**SQS** solves a problem every system with variable load eventually hits: what happens when a producer generates work faster than a consumer can process it, or when the consumer is temporarily down? Without a queue, that mismatch either blocks the producer or drops the work. SQS puts a durable buffer in between.

## The core flow
1. A **producer** sends a message to a queue (\`SendMessage\`).
2. The message sits durably in the queue until a consumer is ready.
3. A **consumer** polls the queue (\`ReceiveMessage\`) and picks up the message.
4. After successfully processing it, the consumer explicitly **deletes** the message (\`DeleteMessage\`).

This "pull" model (consumers ask for work) is the key difference from SNS's "push" model (messages are pushed to subscribers) — see the SNS entry for that contrast.

## Standard vs. FIFO queues
| | Standard Queue | FIFO Queue |
|---|---|---|
| Ordering | Best-effort (not guaranteed) | Strict, preserved order |
| Delivery | At-least-once (duplicates possible) | Exactly-once processing |
| Throughput | Nearly unlimited | Up to 3,000 msg/sec with batching (per message group) |
| Use case | High-throughput, order doesn't matter | Order-sensitive workflows (e.g., processing bank transactions in sequence) |

Most workloads default to Standard queues and design their consumers to be **idempotent** (safe to process the same message twice) rather than pay FIFO's throughput cost for ordering guarantees they don't strictly need.

## Visibility timeout
When a consumer receives a message, SQS doesn't delete it — it becomes **invisible** to other consumers for a configurable **visibility timeout** (default 30 seconds), giving that consumer time to process it. If the consumer finishes and calls \`DeleteMessage\` in time, the message is gone for good. If it *doesn't* (the consumer crashed, or processing took longer than the timeout), the message becomes visible again and another consumer will pick it up — this is what makes SQS resilient to consumer failures, and also why consumers must be careful to set a visibility timeout longer than their worst-case processing time.

## Dead-letter queues
A message that fails processing repeatedly (exceeding a configured \`maxReceiveCount\`) can be automatically redirected to a **Dead-Letter Queue (DLQ)** — a separate queue for messages that are consistently failing, so you can inspect and debug them instead of letting them loop forever or silently vanish after they expire.

## Why interviewers ask about this
SQS is the canonical answer to "how would you decouple these two services?" It tests whether you understand **asynchronous, buffered communication** as an alternative to a synchronous API call — trading immediate consistency for resilience (the producer keeps working even if the consumer is down) and load-leveling (a traffic spike gets smoothed out over the queue instead of overwhelming the consumer). Being able to explain visibility timeout and idempotent consumers specifically signals real hands-on queue experience, not just "I know SQS is a queue."
	`
	},

	SNS: {
		definition:
			'Amazon SNS (Simple Notification Service) is a fully-managed pub/sub messaging service — publishers send a message once to a "topic," and SNS pushes a copy to every subscriber (email, SMS, Lambda, SQS, HTTP endpoint) automatically.',
		useCase:
			'An e-commerce order-placed event is published once to an SNS topic, and it simultaneously triggers an email confirmation, an inventory-update Lambda, and a shipping-service SQS queue — each subscriber gets its own copy, independently.',
		detailedMarkdown: `
# SNS (Simple Notification Service)

**SNS** implements the **publish/subscribe (pub/sub)** pattern: a publisher sends a message to a **topic** without knowing or caring who (if anyone) is listening, and SNS **pushes** a copy of that message to every current subscriber. Add a new subscriber tomorrow, and it starts receiving future messages with zero changes to the publisher.

## Push vs. pull — the key contrast with SQS
This is the single most important distinction for interviews:
- **SNS pushes**: as soon as a message is published, SNS immediately delivers it to every subscriber. Great for fan-out and notifications, but a subscriber that's down can miss delivery (retries happen, but there's no durable buffer the subscriber controls).
- **SQS pulls**: messages sit durably in a queue until a consumer polls for them. Great for buffering and load-leveling, but there's only one logical set of consumers competing for the same messages.

Because of this, they're frequently used **together**.

## Supported subscriber types
| Protocol | Delivers to |
|---|---|
| Email / Email-JSON | A human inbox |
| SMS | A phone number |
| Lambda | Directly invokes a function |
| SQS | Delivers the message into a queue |
| HTTP/HTTPS | Any webhook endpoint |
| Mobile push | Apple APNs, Firebase/FCM, etc. |

## The fan-out pattern: SNS + SQS
This is the pattern interviewers most often want to hear about. Imagine one event ("order placed") needs to trigger *three* independent, slow, decoupled processes — sending a confirmation email, updating inventory, and notifying the shipping partner. Instead of coupling the order service directly to three downstream systems (and having to change it every time a fourth is added), you:
1. Publish **one** message to an SNS topic (\`OrderPlaced\`).
2. Subscribe **three separate SQS queues** to that topic — one per downstream consumer.
3. SNS automatically delivers a copy of the message into *each* queue.
4. Each consumer polls its own queue at its own pace, fully decoupled from the other two and from the publisher.

This gives you the best of both: SNS's one-to-many fan-out, plus SQS's durable buffering and retry semantics on each branch — if the shipping service is down for an hour, its queue just holds the messages; the email and inventory paths are entirely unaffected.

## Delivery guarantees
SNS delivers **at-least-once** — a subscriber may occasionally receive the same message more than once, so (as with SQS) consumers should be designed to handle duplicates safely (idempotency).

## Why interviewers ask about this
"Design a notification system" or "how would one event trigger multiple independent downstream actions" is a very common system-design prompt, and the expected answer is almost always some version of the **SNS fan-out to multiple SQS queues** pattern. Knowing this by name — and being able to explain *why* it beats directly coupling the publisher to every consumer — is a strong, concrete signal of real distributed-systems experience.
	`
	},

	DynamoDB: {
		definition:
			'Amazon DynamoDB is a fully-managed, serverless NoSQL key-value and document database designed for consistent, single-digit-millisecond performance at virtually any scale, with no servers to provision or manage.',
		useCase:
			"A shopping cart service that needs to read and write a specific user's cart by user ID with predictable low-latency performance, at a scale of millions of users, without hand-managing database sharding.",
		detailedMarkdown: `
# DynamoDB

**DynamoDB** is AWS's managed NoSQL database, built to solve a different problem than RDS: instead of flexible relational queries, it optimizes for **predictable, extremely fast access by a known key**, at a scale that would require significant manual sharding effort with a traditional relational database.

## The data model: partition key + sort key
Every DynamoDB table has a **primary key**, which is either:
- **Simple primary key**: just a **Partition Key** (a.k.a. hash key) — e.g., \`userId\`. Every item with the same partition key must be unique on it.
- **Composite primary key**: a **Partition Key** + a **Sort Key** (a.k.a. range key) — e.g., \`userId\` (partition) + \`orderTimestamp\` (sort). This lets you store *multiple* related items under the same partition key, sorted and efficiently range-queryable by the sort key (e.g., "give me all of user 42's orders between these two dates").

DynamoDB uses the partition key to decide *which physical partition* (internal shard) an item lives on — good key design (high cardinality, evenly distributed values) is what lets DynamoDB scale horizontally without you thinking about sharding at all. A poorly chosen partition key (e.g., a fixed status value most items share) creates a "hot partition" that becomes a bottleneck.

## Schema flexibility
Unlike a relational table, items in the same DynamoDB table don't need identical attributes — one item might have 5 fields, another 20. Only the primary key attributes are required and fixed; everything else is schemaless, similar to a document store.

## Secondary indexes
- **Local Secondary Index (LSI)** — same partition key as the base table, different sort key. Must be defined at table creation.
- **Global Secondary Index (GSI)** — a completely different partition key (and optional sort key), letting you query the same data by an entirely different access pattern. Can be added after table creation.

Because DynamoDB has no general-purpose query language like SQL joins, **designing your access patterns and indexes up front** ("what queries will I actually run?") is a core part of using it well — this is the opposite workflow from relational modeling, where you normalize first and figure out queries later.

## Capacity modes
| Mode | How it works | Best for |
|---|---|---|
| **Provisioned** | You specify Read/Write Capacity Units (RCU/WCU); can enable auto-scaling within a range | Predictable, steady traffic — cheaper at sustained volume |
| **On-Demand** | Pay per request, scales instantly with no capacity planning | Unpredictable or spiky traffic, new applications without established traffic patterns |

## DynamoDB Streams
An optional, ordered log of every create/update/delete on a table, commonly consumed by a Lambda function to trigger side effects — e.g., updating a search index or sending a notification whenever an item changes, without the application code that wrote the item needing to know about any of it.

## Why interviewers ask about this
DynamoDB is the go-to answer for "design a database for X at massive scale with a known access pattern," and it's frequently contrasted against RDS in system-design interviews: DynamoDB trades relational flexibility (joins, ad-hoc queries) for near-limitless horizontal scale and consistent low latency, as long as you can design your key schema around your actual query patterns in advance. Being able to say *when* you'd reach for DynamoDB over RDS — and correctly identify partition-key design as the make-or-break decision — is the real signal being tested.
	`
	}
};
