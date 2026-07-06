import type { RoadmapDetailMap } from './types';

/**
 * TOPICS TO COVER IN THIS FILE (fill in every one as a key below):
  // - ATS Resume
  // - LinkedIn
  // - GitHub
  // - Portfolio
  // - Mock Coding Interviews
  // - Mock System Design
  // - Mock Behavioral
  // - Resume Review
 */
export const ResumeMocksContent: RoadmapDetailMap = {
	'ATS Resume': {
		definition:
			'An ATS (Applicant Tracking System) resume is a resume formatted and worded so that automated parsing software can correctly extract your experience, skills, and keywords before a human recruiter ever sees it.',
		useCase:
			'Every resume submitted through an online job application at a mid-to-large company passes through an ATS filter first — a resume that a machine cannot parse never reaches a human, no matter how strong the candidate is.',
		detailedMarkdown: `
# ATS Resume

Before any recruiter reads your resume, software reads it first. An **Applicant Tracking System (ATS)** ingests your resume, parses it into structured fields (name, experience, skills, education), scores it against the job description's keywords, and only then surfaces it to a human — often ranked or filtered. A beautifully designed resume that the parser mangles can get auto-rejected with zero human review.

## What the ATS Actually Does
- **Extracts text** from your file and slots it into fields it recognizes (Experience, Education, Skills).
- **Matches keywords** from the job description against your resume's text — exact phrase matches score higher than paraphrases.
- **Ranks or filters** candidates for the recruiter, sometimes before a human ever opens the file.

## Formatting Rules That Survive Parsing
- **Use standard section headers**: "Experience", "Education", "Skills", "Projects" — not creative alternatives like "My Journey" or "Where I've Been."
- **Avoid tables, text boxes, and multi-column layouts** — many parsers read left-to-right, top-to-bottom and will scramble a two-column layout into nonsense.
- **Never put critical text inside an image, icon, or header/footer** — parsers frequently skip these entirely, silently dropping your contact info or a whole section.
- **Stick to standard fonts** (Arial, Calibri, Georgia) — exotic fonts can render as garbled characters after parsing.
- **File format:** a simple, single-column **.docx or PDF** exported from a text-based tool (Word, Google Docs) works reliably. Avoid PDFs exported from design tools (Canva, Figma) that flatten text into images — those are frequently unreadable by parsers.
- **Use standard bullet characters** (•, -) rather than custom Unicode symbols or emoji.

## The Bullet-Point Formula
Every bullet should follow: **Action verb + what you did + measurable result.**

> Reduced API p95 latency by 40% by introducing a Redis cache layer in front of the product-catalog service.

- Start with a strong **action verb** (Built, Reduced, Led, Automated, Migrated) — never "Responsible for" or "Helped with."
- Include a **number** wherever honestly possible: percentage improvement, users served, time saved, cost reduced, team size.
- End with **impact**, not just activity — "wrote unit tests" is activity; "increased test coverage from 40% to 85%, cutting production bugs by half" is impact.

## Keyword Matching
- Pull **exact phrases** from the job description (e.g., if the posting says "distributed systems," don't only write "scalable backend" — include the literal term too).
- Mirror the **tech stack terminology** the posting uses (e.g., "Node.js" vs "NodeJS" vs "Node" — match theirs).
- Include both the **acronym and the full term** at least once (e.g., "CI/CD (Continuous Integration/Continuous Deployment)") since parsers may search for either.

## Length
- **1 page** for most candidates — students, new grads, and engineers with under ~10 years of experience.
- **2 pages max** for senior/staff+ engineers with extensive, relevant history. Never pad to fill a second page; cut ruthlessly instead.

## Quick Checklist
- [ ] Single column, standard section headers, no tables/images for critical text.
- [ ] Saved as .docx or text-based PDF (not an image-flattened PDF).
- [ ] Every bullet has an action verb and a measurable result.
- [ ] Keywords from the target job description appear verbatim.
- [ ] One page (two max for senior+).
	`
	},

	LinkedIn: {
		definition:
			'LinkedIn is the primary professional network recruiters search and message through, functioning as a living, searchable extension of your resume that also signals activity and credibility.',
		useCase:
			'A recruiter sourcing candidates searches LinkedIn by keyword and skill filters before ever seeing a resume — an incomplete or stale profile means you never surface in that search in the first place.',
		detailedMarkdown: `
# LinkedIn

Recruiters don't just wait for applications — they actively **search** LinkedIn using keyword and skill filters to source candidates. If your profile is thin, outdated, or missing the right keywords, you're invisible to that search regardless of how good your resume is. Treat your profile as a living document, not a one-time setup task.

## Profile Essentials Recruiters Actually Check
- **Headline beyond your job title:** the default headline is just "Job Title at Company." Replace it with something keyword-rich and specific — e.g., "Backend Engineer | Java, Spring Boot, AWS | Building distributed systems at scale." This is prime searchable real estate; don't waste it on the default.
- **A real "About" summary:** 3-5 sentences covering who you are, your core technical strengths, and what you're looking for. Recruiters skim this before reading your experience in detail.
- **Skills section matching your target keywords:** list the specific technologies from job descriptions you're targeting (e.g., "Kubernetes," "PostgreSQL," "System Design") — LinkedIn's search and "Skills" filters key directly off this list. Pin your top 3 most relevant skills.
- **Experience section that mirrors your resume:** same companies, same dates, same core bullet points. A mismatch between LinkedIn and resume (different dates, different titles) is a credibility red flag recruiters notice immediately.
- **A professional photo and a filled-in location** — profiles without a photo get dramatically fewer views and connection acceptances.

## The "Open to Work" Feature — Trade-offs
- **Pro:** Signals to recruiters searching LinkedIn that you're actively looking, which can increase inbound messages.
- **Con:** Visible to your current employer's recruiters/network if set to public, which can be risky if you're employed and not ready for that to be known. Use the **"share only with recruiters"** setting to get the visibility boost without broadcasting it to your entire network.

## Engagement vs. a Static Profile
- A profile that only exists (no posts, no comments, no connections added) reads as dormant. Recruiters weight some level of **recent activity** as a soft signal of engagement in the field.
- Low-effort, high-value engagement: commenting thoughtfully on posts in your domain, sharing a project you shipped, writing a short post about something you learned. You don't need to post daily — occasional, genuine activity is enough to avoid looking abandoned.
- **Grow your network deliberately:** connect with recruiters at companies you're targeting, alumni from your school, and engineers at companies of interest — a bigger, relevant network increases how often you surface in searches (2nd-degree connections rank higher).

## Quick Checklist
- [ ] Custom headline with keywords, not just "Title at Company."
- [ ] "About" section written (not left blank).
- [ ] Skills list matches your target job descriptions.
- [ ] Experience section dates/titles match your resume exactly.
- [ ] Professional photo added.
- [ ] Some recent activity (post, comment, or share) in the last month.
	`
	},

	GitHub: {
		definition:
			"GitHub is the de facto portfolio for engineers — a hiring manager who checks it is looking for evidence of real, working code, not just a resume claim of 'proficient in X.'",
		useCase:
			'For technical roles, a hiring manager or interviewer will often click through to your GitHub profile before or after a phone screen to sanity-check that your listed projects and skills are real and well-executed.',
		detailedMarkdown: `
# GitHub

For engineering roles, your GitHub profile is often the first thing a hiring manager checks after your resume — it's the difference between claiming "built a REST API in Node.js" and being able to *show* one. A neglected profile with dead repos and no README context wastes that opportunity; a curated one actively strengthens your candidacy.

## What a Hiring Manager Actually Looks At
- **Pinned repositories first** — GitHub lets you pin 6 repos to the top of your profile. This is prime real estate; pin your **best, most relevant** work, not your oldest or most numerous.
- **README quality** on those pinned repos — this is often the *only* thing that gets read; few reviewers clone and run your code.
- **Commit history authenticity** — a history of small, incremental, sensibly-messaged commits over time reads as genuine work. A single giant "Initial commit" with the entire project dumped in one shot is a signal the repo was uploaded, not built and iterated on.
- **The contribution graph** — a weak, secondary signal at best. An empty graph isn't disqualifying (people work in private repos at their job), but a graph that's completely dead for years alongside a resume claiming "passionate about coding" can raise an eyebrow. Don't chase graph-filling for its own sake (e.g., meaningless daily commits) — reviewers can tell the difference between real work and commit-count gaming.

## Writing a README That's Actually Useful
Every pinned project's README should answer, in order:
1. **What does this do?** — one or two sentences, plus ideally a screenshot or short GIF/demo for anything with a UI.
2. **How do I run it?** — clear setup steps (clone, install, run) that actually work if someone follows them.
3. **What's technically interesting here?** — the specific design decisions, trade-offs, or challenges you solved (e.g., "used a debounced search with request cancellation to avoid race conditions on fast typing").
4. **Tech stack** — a short list of the languages/frameworks used, so it's scannable in seconds.

A project with **zero README** forces the reviewer to dig through source files to understand what they're even looking at — most won't bother, and you lose the credit for work you actually did.

## Quality Over Quantity
- **3-6 well-documented, complete projects** beat 30 half-finished tutorial clones. A profile cluttered with abandoned "todo-app-v1" through "todo-app-v7" forks signals scattered effort, not depth.
- Delete or unpin course-follow-along projects that don't demonstrate original thinking, unless you meaningfully extended them beyond the tutorial.
- If a project isn't finished or polished enough to be proud of, either finish it or archive/unpin it rather than leaving it as a first impression.

## Quick Checklist
- [ ] 3-6 pinned repos representing your best, most relevant work.
- [ ] Every pinned repo has a README with what/how-to-run/why sections.
- [ ] Commit history shows incremental work, not one giant dump.
- [ ] Dead, abandoned, or tutorial-clone repos are unpinned or archived.
- [ ] Profile bio/pic filled in, with a link to your resume or portfolio.
	`
	},

	Portfolio: {
		definition:
			'A portfolio is a personal website showcasing your best work with context and write-ups — valuable for demonstrating design sense or filling gaps in a traditional work history, but not a universal requirement.',
		useCase:
			'A frontend or design-leaning candidate, or a career-changer without a strong resume of prior relevant jobs, uses a portfolio site to prove real ability where a standard resume alone falls short.',
		detailedMarkdown: `
# Portfolio

A personal portfolio site is **not required for every engineer**, but for the right profile it can do more convincing than a resume ever could — because it lets you *show*, not just claim.

## When a Portfolio Actually Helps
- **Design or frontend-heavy roles** — where visual taste and UI polish are part of the job, a live, well-designed portfolio site *is itself* a work sample.
- **Career changers or non-traditional backgrounds** — if your resume's work history doesn't scream "software engineer" (e.g., you're switching from another field, or your prior jobs are unrelated), a portfolio full of real projects fills that credibility gap fast.
- **Freelancers and contractors** — clients evaluating you want to see finished, presentable work in one place, not scattered across a GitHub profile.

## When It's Optional
- **Backend, infrastructure, and systems engineers** — a strong GitHub with real, well-documented projects usually does the same job, and the code itself matters more than presentation.
- **Candidates with solid, relevant work experience** — if your resume already tells a clear, credible story, a portfolio is a nice-to-have, not a differentiator.

Don't treat building a portfolio site as a required box to check before applying — for many roles, time is better spent on interview prep or a stronger resume.

## What to Include (If You Build One)
- **2-3 of your best projects only.** A portfolio with 15 mediocre projects dilutes the impression; 2-3 genuinely strong ones concentrate it.
- For each project, a short write-up covering:
  - **What the project does** (one or two sentences, ideally with a screenshot or embedded demo).
  - **Your specific contribution** — if it was a team or bootcamp project, be explicit about what *you* built versus what was scaffolded or built by others. Vague credit-taking is an easy thing for an interviewer to probe and catch.
  - **The interesting technical decisions** — why you chose a particular architecture, database, or library, and what trade-off you were weighing. This is the part that actually demonstrates engineering judgment, not just "I made a website."
- A **live demo link** and a **GitHub link** for each project — a portfolio that only shows screenshots with no way to interact with or inspect the real thing loses most of its credibility.
- A short **About** section and a way to **contact you** (email, LinkedIn) — surprisingly often forgotten.

## What to Avoid
- Don't just link out to demos with zero explanation — "here's a link, go explore it yourself" pushes work onto the reviewer that they won't do.
- Don't over-invest in portfolio design at the expense of the projects themselves — a stunning site showcasing weak or unfinished projects doesn't help.
- Don't list every project you've ever built — curate ruthlessly to your best 2-3.

## Quick Checklist
- [ ] Decided whether a portfolio is actually worth building for your target role.
- [ ] 2-3 best projects only, each with a short write-up of your specific contribution.
- [ ] Technical decisions/trade-offs explained, not just "what it does."
- [ ] Live demo + GitHub link for each project.
- [ ] Contact info and an About section present.
	`
	},

	'Mock Coding Interviews': {
		definition:
			'Mock coding interviews are timed, simulated technical interviews — practicing not just the problem-solving, but the real-time communication and pressure of an actual interview.',
		useCase:
			"Solving 200 LeetCode problems alone builds pattern recognition, but doesn't train you to think aloud, handle interruptions, or manage a ticking clock in front of a live interviewer — mock interviews close that specific gap.",
		detailedMarkdown: `
# Mock Coding Interviews

Solving problems alone on LeetCode trains **pattern recognition**. It does not train the skill that actually gets evaluated in a real interview: **communicating your thought process out loud, under time pressure, in front of another person.** Mock interviews are the only practice format that closes that gap.

## How to Structure Practice
- **Timebox to the real interview length** — typically **45 minutes** for a single coding round. Practicing without a clock builds a false sense of security; real interviews end abruptly whether you're done or not.
- **Think aloud, constantly** — narrate your reasoning as you work: what approach you're considering, why you're rejecting a brute-force option, what the time/space complexity is. In a real interview, silence for 5 minutes while you code reads as a black box to the interviewer, even if you're doing great work internally.
- **Use a shared doc or plain whiteboard tool, not an IDE with autocomplete.** Real interviews (especially onsite/virtual with CoderPad-style tools) often have limited or no autocomplete and no syntax highlighting help. Practicing in a full IDE builds a dependency you won't have on the day.
- **Practice explaining your solution after you finish** — walk through a test case by hand, out loud, the way you would to close out a real round.

## Platforms and Partners
- **Pramp / interviewing.io** — free or paid peer-matching platforms specifically built for mock technical interviews, often with structured feedback at the end.
- **A friend or study partner** — works just as well, especially if you take turns being interviewer and interviewee (interviewing someone else sharpens your own bar and question sense).
- **Record yourself solving a problem out loud** (even solo) as a lower-fidelity substitute when no partner is available — you can review the recording afterward for pacing and clarity issues.

## The Most Common Self-Sabotage: Jumping to Code Too Early
The single most repeated mistake in mock (and real) interviews: hearing the problem and immediately starting to type, without:
- **Clarifying requirements** — asking about edge cases, input constraints, expected scale, and ambiguous wording. ("Can the array contain duplicates? Negative numbers? What should happen on an empty input?")
- **Discussing the approach out loud first** — stating the algorithm and its complexity *before* writing a single line, so the interviewer can redirect you early if you're heading toward a suboptimal or wrong approach. Coding first and explaining later wastes time on a path that might get abandoned anyway.
- **Confirming the approach** — a quick "does this approach sound reasonable before I start coding?" turns the interview into a collaborative conversation rather than a silent, high-stakes exam — which is exactly how strong candidates come across.

## After Each Mock
- Get explicit feedback: was the approach clear? Was communication clear? Where did you get stuck?
- Note the **specific pattern** you struggled with (not just "I failed this problem") so you can target that gap in further practice.
- Track your **time-to-first-working-solution** across mocks — it should trend downward as you build reps.

## Quick Checklist
- [ ] Practiced with a real 45-minute clock, not open-ended.
- [ ] Used a plain text editor/shared doc, not a full autocomplete IDE.
- [ ] Clarified requirements and stated the approach out loud *before* coding.
- [ ] Got feedback from a partner or platform after each session.
- [ ] Logged which patterns/topics still need more reps.
	`
	},

	'Mock System Design': {
		definition:
			'Mock system design interviews rehearse the structured framework for tackling open-ended architecture questions out loud, since narrating your reasoning is most of what actually gets evaluated.',
		useCase:
			'Reading system design articles teaches you the components, but a mock session is what trains you to run the full framework — requirements to trade-offs — cleanly within a fixed 45-60 minute window without freezing up.',
		detailedMarkdown: `
# Mock System Design

System design interviews are open-ended by nature, which makes them easy to ramble through and hard to practice well alone. The fix is the same every time: rehearse a **repeatable structured framework**, out loud, against a clock, until running it feels automatic rather than effortful.

## The Structured Framework
Run through these phases, roughly in order, every time:
1. **Requirements gathering** — clarify functional requirements (what must the system do?) and non-functional requirements (scale, latency, availability, consistency needs). Ask about read/write ratios and expected scale (users, requests/sec, data size) before designing anything.
2. **Estimation (back-of-envelope)** — rough numbers for storage, bandwidth, and QPS based on the requirements. This grounds the design in reality instead of designing blind.
3. **High-level design (HLD)** — sketch the major components (clients, load balancer, API layer, services, databases, caches, queues) and how data flows between them. Keep it high-level first; resist diving into any one component too early.
4. **Deep dive** — the interviewer will usually steer you into one or two components for detail (e.g., "how would you shard this database?" or "how does the notification service scale?"). This is where most of the signal is captured.
5. **Trade-offs** — explicitly call out the trade-offs in your choices (consistency vs. availability, SQL vs. NoSQL, cache invalidation strategy) rather than presenting one option as the only answer.

Cross-reference the concrete worked examples in this roadmap's **HLD Practice Designs** section — running mock sessions against those same problems (design a URL shortener, a rate limiter, a news feed, etc.) turns passive reading into active recall under pressure.

## Timeboxing Each Phase
In a typical 45-60 minute round, a rough allocation that keeps you from running out of time:
- Requirements + estimation: **~5-10 minutes**
- High-level design: **~15-20 minutes**
- Deep dive: **~15-20 minutes**
- Trade-offs / wrap-up: **~5-10 minutes**

Practicing with an actual timer is what reveals where you personally overspend — most candidates burn too much time on requirements gathering or get stuck perfecting the HLD diagram and never reach a meaningful deep dive.

## Narrating Your Thinking Is Most of What's Being Evaluated
Unlike coding interviews where working code is tangible proof, system design has no "correct" final answer — the interviewer is evaluating your **reasoning process**: how you handle ambiguity, whether you consider trade-offs, whether you can justify decisions when pushed back on. Concretely:
- State assumptions explicitly ("I'm assuming reads vastly outnumber writes here, so I'll optimize for read latency").
- When the interviewer pushes back or asks "what if scale increased 100x?", treat it as an invitation to reconsider, not a signal you got it wrong.
- Silently drawing a diagram with no explanation gives the interviewer nothing to evaluate, even if the diagram itself is good.

## Running Effective Mock Sessions
- Practice with a **partner who plays interviewer** and can interrupt with follow-up questions and curveballs — solo practice can't replicate that pressure.
- Rotate through different problem categories (a chat system, a rate limiter, a distributed cache, a feed/timeline system) rather than deep-diving the same one repeatedly.
- After each mock, explicitly review: did you reach the deep dive with time to spare, or did you run out of time in the HLD phase?

## Quick Checklist
- [ ] Ran the full framework (requirements → estimation → HLD → deep dive → trade-offs) against a timer.
- [ ] Practiced against concrete problems from the HLD Practice Designs list.
- [ ] Narrated assumptions and trade-offs out loud, not just silently.
- [ ] Practiced with a partner who can interrupt and push back.
- [ ] Reviewed time allocation across phases after each session.
	`
	},

	'Mock Behavioral': {
		definition:
			"Mock behavioral interviews rehearse your STAR stories out loud under simulated pressure, because there's a real difference between having a story written down and being able to tell it smoothly when someone is watching and asking follow-ups.",
		useCase:
			"A candidate can have a perfectly structured STAR story on paper and still freeze, ramble, or lose the thread when actually asked 'tell me about a time you disagreed with a teammate' live — mock practice is what closes that specific gap.",
		detailedMarkdown: `
# Mock Behavioral

Writing out a STAR story once and reading it over is not the same skill as **telling it smoothly, out loud, in real time, while someone is watching and may interrupt with follow-ups.** Behavioral interviews are won or lost on delivery just as much as content — mock practice is the only way to close that gap.

## Why Rehearsing Out Loud Matters
- A story you've only ever read silently tends to come out **halting and over-long** the first time you say it aloud — you discover the actual awkward phrasing only by speaking it.
- Saying it repeatedly compresses a 4-minute ramble into a tight, confident 90-second answer, which is what strong behavioral answers actually sound like.
- It reveals which parts of the story are unclear to a listener who doesn't have your full context — something you can't catch by reading your own notes.

## How to Practice
- **Say every story out loud, multiple times**, ideally to another person who can ask natural follow-up questions ("what would you have done differently?", "how did the other person react?").
- **Record yourself** (phone video is fine) and watch it back — this surfaces filler words, pacing issues, and rambling that you don't notice while speaking, but that are obvious as a viewer.
- **Practice with a friend running a real mock**, not just monologuing to yourself — a live conversational partner forces you to actually land the story instead of just performing a rehearsed monologue.
- Time yourself: a strong STAR answer to a single question generally lands in **1.5-3 minutes** — much longer and you're likely including irrelevant detail; much shorter and you're probably skipping the Result/impact.

## Build 5-6 Flexible Stories, Not 20 Narrow Ones
Trying to have a distinct memorized story for every possible question is unsustainable and leads to stiff, over-rehearsed answers. Instead:
- Prepare **5-6 strong, detailed stories** from your real experience that each cover a meaningful challenge, decision, or conflict.
- For each one, identify the **multiple angles** it can answer — a single story about pushing back on a risky technical decision can answer "tell me about a conflict with a teammate," "tell me about a time you influenced without authority," and "tell me about a mistake you almost made," depending on which part you emphasize.
- In the actual interview, **listen carefully to the exact question** and select/frame the story to fit it — don't force-fit an unrelated story just because it's the one you rehearsed most.

## What to Rehearse Beyond the Story Itself
- **The opening line** — a strong first sentence that states the situation crisply, so you're not fumbling for how to start.
- **The result, with a number if possible** — "the team shipped two weeks early" or "reduced on-call incidents by 30%" lands harder than "and it went well."
- **A one-sentence reflection** — what you learned or would do differently, showing self-awareness rather than a story that ends at "and it worked out."
- **Smooth transitions when an interviewer interrupts** mid-story to ask a clarifying question — practicing with a live partner is what trains this; solo rehearsal never triggers it.

## Quick Checklist
- [ ] 5-6 core stories identified, each mapped to multiple possible questions.
- [ ] Each story rehearsed out loud multiple times, not just written down.
- [ ] At least one practice round recorded or done with a live partner.
- [ ] Each story timed to land in roughly 1.5-3 minutes.
- [ ] Each story ends with a measurable result and a brief reflection.
	`
	},

	'Resume Review': {
		definition:
			'A resume review is the final, deliberate self-audit (and ideally a second opinion) you run before submitting an application, catching the specific, common mistakes that otherwise quietly sink an application.',
		useCase:
			'Right before applying to a role you actually want, running a structured checklist catches typos, missing metrics, and untailored keywords that a rushed once-over would miss — the difference between an application that gets a callback and one that silently disappears.',
		detailedMarkdown: `
# Resume Review

The last 15 minutes before you submit a resume matter as much as the hours spent writing it. A structured final pass catches the specific, common mistakes that quietly sink otherwise-strong applications — and a second pair of eyes catches what you've gone blind to after staring at your own resume too long.

## The Self-Review Checklist

**Content**
- [ ] **Every bullet has a number or measurable result where honestly possible** — "improved performance" becomes "reduced page load time from 3.2s to 1.1s." If a bullet truly can't be quantified, at minimum state a concrete outcome (what shipped, who used it, what changed).
- [ ] **Every bullet starts with a strong action verb** — Built, Led, Designed, Automated, Migrated, Reduced — never "Responsible for" or "Worked on."
- [ ] **Outdated or irrelevant older experience is trimmed or removed.** A 10-year-old retail job or an unrelated internship from early in your career usually costs more space than it earns in relevance — cut it or compress it to a single line.
- [ ] **No unexplained gaps or inconsistencies** between what's on your resume and what's on LinkedIn (dates, titles, company names should match exactly).

**Tailoring**
- [ ] **Keywords from the specific job description are present, verbatim**, not just paraphrased — both for the ATS parser and for a human skimming for a match.
- [ ] **The most relevant projects/experience are moved higher or expanded**, and less relevant ones are trimmed, for *this specific application* — a resume tailored per-role consistently outperforms one generic version sent everywhere.

**Mechanics**
- [ ] **Zero typos and grammar errors.** This is the single most disqualifying, easily avoidable mistake — a typo signals carelessness disproportionate to its actual size. Read the resume backward (last bullet to first) to catch errors your brain otherwise auto-corrects when reading in order.
- [ ] **Consistent tense throughout** — past roles in past tense ("Built," "Led"), current role in present tense ("Build," "Lead"). Mixing tense within the same section reads as sloppy.
- [ ] **Consistent formatting** — same date format everywhere (e.g., "Jan 2023 - Present" not mixed with "01/2023-current"), consistent bullet punctuation, consistent font sizes across sections.
- [ ] **Contact info is current and correct** — email, phone, LinkedIn/GitHub links all clickable and pointed at the right place. Double-check this every time; it's an easy thing to leave stale after an old copy-paste.

## Get a Second Pair of Eyes
After enough edits, you stop seeing your own resume clearly — typos and awkward phrasing become invisible because you already know what you *meant* to say. Before submitting anywhere that matters:
- Ask a peer, mentor, or someone in the target role to read it **cold**, with no context from you beforehand — their first reaction mirrors a recruiter's.
- Ask them specifically: "what's the first thing that stands out?" and "is there anything confusing or unclear?" — open questions surface issues a simple "does this look okay?" won't.
- If possible, get feedback from someone **in the target role/company type**, since they'll flag missing keywords or conventions specific to that domain that a generalist reviewer would miss.

## A Final Gut Check
Read the resume once more and ask: does every single line earn its place, or is it there out of habit? Cutting a mediocre bullet is almost always better than keeping it — a shorter, denser resume of all-strong lines outperforms a longer one padded with filler.

## Quick Checklist
- [ ] Every bullet quantified where possible, starting with a strong verb.
- [ ] Outdated/irrelevant experience trimmed.
- [ ] Keywords tailored to the specific job description.
- [ ] Zero typos (read backward to check) and consistent tense/formatting.
- [ ] Reviewed by at least one other person before submitting.
	`
	}
};
