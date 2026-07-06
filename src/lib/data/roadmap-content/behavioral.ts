import type { RoadmapDetailMap } from './types';

export const BehavioralContent: RoadmapDetailMap = {
	'STAR Method': {
		definition:
			'A structured way to answer behavioral questions by walking through the Situation, Task, Action, and Result of a real experience, so the interviewer gets a complete, evidence-backed story instead of a vague generality.',
		useCase:
			'Any question that starts with "Tell me about a time..." or "Give me an example of..." is signaling that the interviewer wants a STAR-structured answer, not a general opinion.',
		detailedMarkdown: `
# STAR Method

**STAR** (Situation, Task, Action, Result) is the standard framework for answering behavioral interview questions. It forces you to tell a complete, verifiable story instead of a vague generalization — and it gives the interviewer a consistent structure to score you against.

## What Interviewers Are Actually Evaluating
When an interviewer asks "Tell me about a time you...", they are not grading your storytelling flair. They are checking:
- **Did this actually happen?** Specificity is the tell — vague answers read as rehearsed or exaggerated.
- **What did you personally do?** Not "we" — you.
- **What was the measurable outcome?**
- **Does this map to the competency they're probing** (ownership, conflict resolution, leadership, etc.)?

## The Four Parts, and How Much Airtime Each Deserves
| Part | What Goes In It | Target Share of Answer |
|---|---|---|
| **Situation** | The context — team, project, stakes, timeline. Just enough to orient the listener. | ~10% |
| **Task** | Your specific responsibility or goal in that situation — what were you on the hook for? | ~10% |
| **Action** | The concrete steps *you* took — decisions, tradeoffs, conversations, escalations. | ~50-60% |
| **Result** | The outcome, ideally quantified, plus what changed afterward. | ~20-30% |

## The #1 Mistake: Burying the Lede
Most candidates spend 80% of their answer describing the Situation and Task — the backstory — and rush through the Action and Result in a single breathless sentence at the end. This is backwards. The interviewer gets the gist of "there was a problem" after 20 seconds; what they're straining to hear is what you actually *did* about it. If you notice yourself still setting the scene 45 seconds in, cut it short and jump to the action.

## Worked Example
**Situation:** On my last team, we had a shared staging environment that kept breaking because multiple engineers were deploying to it at the same time, with no coordination.

**Task:** As the most senior engineer on the team at the time, I took it on myself to fix this before it caused a production incident, even though it wasn't formally assigned to anyone.

**Action:** I first spent a day tracking every staging deploy for a week to confirm the pattern was real, not a hunch. Then I proposed a lightweight deploy-lock using a Slack bot: whoever deployed would post in a channel and "claim" staging for 15 minutes, auto-releasing after. I built a rough version in an afternoon, demoed it in standup, and got two teammates to try it that week instead of asking for buy-in upfront.

**Result:** Within two weeks the whole team had adopted it. Staging-related bugs reported in QA dropped by roughly 70%, and we later formalized it into our CI pipeline as an actual deploy queue. It also became the template two other teams reused.

## Common Mistakes
- **No numbers in the Result.** "It went well" tells the interviewer nothing. "Reduced X by 30%" or "cut review time from 2 days to 4 hours" does.
- **Answering in "we" instead of "I."** Interviewers need to isolate your individual contribution — say "I proposed," "I decided," "I pushed back," not just "we fixed it."
- **Picking a story that doesn't map to the question.** If asked about conflict and your story has no actual disagreement in it, you've wasted the opportunity.
- **Rehearsed, word-perfect delivery.** A story recited identically every time sounds scripted. Know the beats, not a script.
	`
	},

	Leadership: {
		definition:
			'Demonstrating the ability to influence outcomes, set direction, or unblock other people — with or without formal management authority.',
		useCase:
			'Questions like "Tell me about a time you led a project" or "Describe a situation where you influenced a decision without being the decision-maker" are testing this.',
		detailedMarkdown: `
# Leadership

Leadership in a behavioral interview does not mean "have you managed people." Most candidates for IC (individual contributor) roles have never had a direct report, and interviewers know this. What they're actually testing is **influence without authority** — did you ever change the direction of a team, a decision, or a project, purely through the strength of your judgment and communication?

## What Interviewers Are Actually Evaluating
- Can you **see a problem others haven't**, and act on it instead of waiting to be told?
- Can you **get buy-in** from people who don't report to you and have no obligation to listen?
- Do you **set a clear direction** and follow through, or do you just raise concerns and leave them for someone else?
- Do you take **credit and blame appropriately** — leading includes owning outcomes, not just proposing ideas.

## Mining Your Own Experience
Ask yourself:
- Have I ever proposed a new tool, library, or process that the team adopted?
- Have I ever pushed back on a plan I thought was wrong, and won the argument?
- Have I ever organized other people around a shared goal (an on-call rotation redesign, a migration, a bug bash) without being asked?
- Have I ever mentored someone or unblocked a teammate who was stuck?
- Have I ever made the call in an ambiguous situation when nobody else would?

If your honest answer to all of these is "no," look for a smaller-scale story: leading a single sprint's testing effort, driving a design discussion, or being the point person during an incident.

## Worked Example: Driving Adoption Without Being Asked
**Situation:** Our team had no consistent code review checklist — review quality varied a lot depending on who reviewed your PR, and we were shipping avoidable bugs.

**Task:** Nobody assigned me to fix this. I noticed it after my third bug in a row slipped through review that a checklist would have caught.

**Action:** I wrote a one-page PR checklist covering the most common gaps I'd seen — missing tests, no rollback plan, no logging on new error paths. I didn't ask for permission or wait for a team meeting; I posted it in our team channel, used it visibly on my own next few PRs, and asked two reviewers directly if they'd try referencing it. When one teammate pushed back that it would slow reviews down, I offered to trial it for two weeks and revisit.

**Result:** After two weeks, the team agreed to keep it — reviewers said it actually made reviews faster because there was less back-and-forth over the same recurring issues. It got added to our onboarding doc, and our post-release bug rate dropped noticeably the following sprint.

## Common Mistakes
- **Confusing "leadership" with "seniority."** You don't need a title — you need an example of influence.
- **Taking sole credit for a team effort.** Be specific about your role; overclaiming reads as dishonest, especially under follow-up questions.
- **A story with no resistance in it.** If everyone agreed with you instantly, it's a weak leadership story — the interesting part is usually how you got skeptics on board.
- **Vague framing** ("I always try to lead by example") with no concrete instance attached.
	`
	},

	Ownership: {
		definition:
			'Taking responsibility for outcomes beyond your explicitly assigned tasks — noticing problems nobody asked you to fix and following through on them anyway.',
		useCase:
			'Questions like "Tell me about a time you went beyond your role" or Amazon-style "Ownership" leadership-principle prompts are testing this directly.',
		detailedMarkdown: `
# Ownership

**Ownership** is the difference between "I did what my ticket said" and "I made sure the right thing happened, even if it wasn't technically my job." Interviewers use this question to find people who treat the product or system as theirs, not just their assigned slice of it.

## What Interviewers Are Actually Evaluating
- Do you **notice problems** outside your immediate scope, or do you have tunnel vision on your own tickets?
- When you notice something wrong, do you **act or escalate**, or do you shrug and move on because "not my area"?
- Do you **follow through to resolution**, including unglamorous cleanup work, or disappear once the interesting part is done?
- Do you own **outcomes**, not just the completion of tasks? ("The feature shipped" vs. "the feature shipped and actually solved the user's problem.")

## Mining Your Own Experience
- Have I ever noticed a bug, a risk, or a piece of tech debt that wasn't assigned to me, and fixed or flagged it anyway?
- Have I ever stayed with a problem after "my part" was technically done, because the overall outcome still wasn't right?
- Have I ever caught something in production outside working hours and dealt with it instead of waiting for Monday?
- Have I ever pushed back on a deadline or scope because I could see it would cause a downstream problem?

## Worked Example
**Situation:** One Saturday I got a low-priority alert for a service I don't normally work on — error rate had ticked up slightly, well under the threshold that pages the on-call owner for that service.

**Task:** It wasn't my service and nobody had asked me to look at it, but the errors were customer-facing and I happened to see the alert in a shared channel.

**Action:** I spent twenty minutes digging into the logs myself before escalating, to make sure I wasn't wasting someone's weekend over noise. I found a downstream dependency silently failing and retrying in a way that was slowly filling a queue — not urgent yet, but it would hit a hard limit and cause an outage within about 36 hours based on the growth rate. I wrote up exactly what I found, opened a ticket marked high-priority-but-not-urgent, tagged the actual owning team with my analysis, and proposed a specific mitigation (a temporary rate limit) so it wasn't just "here's a problem, good luck."

**Result:** The owning team applied the mitigation Monday morning before it became customer-visible. My manager heard about it from their manager, and we adopted a rule afterward that any alert trending toward a known limit gets flagged proactively, not just reactively paged.

## Common Mistakes
- **Confusing ownership with martyrdom.** "I worked every weekend for a month" is not the point — the point is judgment and follow-through, not hours logged.
- **A story where you just did your assigned job well.** That's competence, not ownership — the differentiator is scope beyond what was assigned.
- **No resolution.** "I noticed a problem" without "and here's what happened as a result" is an unfinished story.
- **Overstepping without judgment.** Ownership isn't unilaterally changing something outside your area without telling anyone — the example above works because it includes checking first and looping in the right owner.
	`
	},

	Teamwork: {
		definition:
			'Working effectively with others, especially through genuine disagreement, so a shared goal is reached without the relationship or the decision quality suffering.',
		useCase:
			'Questions like "Tell me about a conflict with a coworker" or "Describe a time you disagreed with a teammate" are testing this — and a story with no real friction in it is a red flag.',
		detailedMarkdown: `
# Teamwork

The trap with "teamwork" questions is answering with a story where nothing actually went wrong — "we all got along and shipped it." That answer is forgettable because it proves nothing. A strong teamwork story shows a **real disagreement** that was resolved constructively, which is a much stronger signal than harmony.

## What Interviewers Are Actually Evaluating
- Can you **disagree without being disagreeable** — hold a firm technical position without damaging the relationship?
- Do you **resolve disagreements with evidence** (data, prototypes, benchmarks) rather than seniority, volume, or politics?
- Can you **accept being wrong** gracefully if the evidence goes against you?
- Do you know when to **stop pushing and align** behind a decision once it's made, even if you didn't originally agree?

## Mining Your Own Experience
- Have I ever disagreed with a teammate about a technical approach, and how did we actually resolve it?
- Have I ever been wrong in a disagreement, and how did I handle finding that out?
- Have I ever had to work closely with someone whose working style clashed with mine?
- Have I ever had to disagree with someone more senior than me and hold my ground appropriately?

## Worked Example
**Situation:** A teammate and I disagreed on how to implement a new caching layer — he wanted an in-memory cache per service instance for simplicity and speed to ship; I was worried it would cause inconsistent data across instances once we scaled past a single node.

**Task:** We were blocking each other's work because the API contract depended on which approach we picked, and the disagreement was dragging into a second day of back-and-forth in code review comments.

**Action:** Rather than escalating to our lead immediately, or just deferring to him since he'd been on the team longer, I asked if we could timebox two hours to each build a rough spike of our approach against a realistic load test. I built the distributed-cache version, he kept his in-memory version, and we ran both against the same simulated traffic pattern that included multi-instance writes. I made sure to say upfront that I'd go with whichever version tested better, not just push for mine regardless of the result.

**Result:** The load test showed his in-memory approach had a real staleness bug under our actual traffic shape — data that should have invalidated across instances didn't. He agreed we needed the distributed approach, we shipped it together within the day, and we adopted "quick spike before a design disagreement drags on" as an informal rule on the team afterward.

## Common Mistakes
- **A conflict-free story.** If there's no real tension, it doesn't demonstrate conflict resolution — pick a story with actual disagreement.
- **Blaming the other person.** Even if they were wrong, describing them dismissively ("they just didn't get it") is a bigger red flag than the original disagreement.
- **Resolving via authority instead of reasoning.** "I was right, so I told them to just do it my way" is not a good resolution story, even if you were technically correct.
- **No self-reflection.** The strongest version of this story includes a moment where you considered you might be wrong, or where you adjusted your own position.
	`
	},

	Communication: {
		definition:
			'Conveying information clearly to the right audience — translating technical detail for non-technical stakeholders, and surfacing bad news early instead of late.',
		useCase:
			'Questions like "Tell me about a time you had to explain something technical to a non-technical person" or "Describe a time you had to deliver bad news" test this.',
		detailedMarkdown: `
# Communication

Communication questions in behavioral interviews usually probe two different skills: **translating technical concepts for a non-technical audience**, and **delivering bad news (especially about timelines) early rather than late**. Both are proxies for the same underlying trait: do you manage information in a way that lets other people make good decisions?

## What Interviewers Are Actually Evaluating
- Can you **adjust your explanation to your audience** — no jargon dump on a PM, no oversimplification that insults an engineer?
- Do you **surface risk early**, while there's still time to act on it, instead of hoping it resolves itself?
- Do you communicate bad news with a **plan attached**, not just a problem dumped on someone else's desk?
- Are you **proactive** about status updates, or do people have to chase you for information?

## Mining Your Own Experience
- Have I ever had to explain a technical tradeoff or a bug to a non-technical stakeholder?
- Have I ever seen a deadline slipping and had to decide when and how to tell someone?
- Have I ever had to say "no" or "not yet" to a stakeholder and needed to make that land well?
- Have I ever had to write a postmortem or status update that non-engineers would read?

## Worked Example: Surfacing a Slipping Deadline Early
**Situation:** I was building a reporting feature with a hard external deadline — it was tied to a client's quarterly business review, two weeks out.

**Task:** About a week in, I realized the data source we were integrating with had undocumented rate limits that were going to make the feature roughly three days slower to build than originally scoped.

**Action:** Instead of waiting to see if I could "make up the time" later in the week — which is what I'd done on a smaller project before, to my regret — I flagged it to my manager and the PM the same day I found the rate-limit issue, with three concrete pieces of information: exactly how much slower, why, and two options: ship a reduced version by the deadline with a follow-up for the rest, or push the full feature by three days. I didn't just say "this might be late."

**Result:** The PM chose the reduced-scope option, told the client proactively that a follow-up enhancement was coming, and the client appreciated the heads-up rather than being surprised. We hit the review date with the core feature working, and the client relationship stayed intact because there was no last-minute scramble.

## Common Mistakes
- **Hiding bad news until the last possible moment**, hoping it'll resolve itself — this is the single most common failure mode interviewers are screening for.
- **Delivering a problem with no options.** "We're going to be late" is much weaker than "we're going to be late, here are two ways to handle it."
- **Jargon with non-technical stakeholders.** Explaining a database index problem using the word "index" to a PM with no context loses them immediately — use an analogy instead.
- **Over-explaining to technical peers**, as if they need the beginner-level version — read your audience.
	`
	},

	'Failure Stories': {
		definition:
			'Owning a genuine mistake, describing its real impact honestly, and showing the concrete change in behavior or process that came out of it.',
		useCase:
			'Questions like "Tell me about a time you failed" or "What\'s the biggest mistake you\'ve made at work?" — widely considered the hardest behavioral question to answer well.',
		detailedMarkdown: `
# Failure Stories

This is the question most candidates prepare for worst, because the instinct is self-protective: pick something trivial, or worse, describe a "failure" that's secretly a humble-brag ("I failed by working too hard and burning myself out"). Interviewers have heard every version of this dodge. The actual point of the question is to see **how you relate to your own mistakes** — do you own them cleanly, and do you demonstrably change afterward?

## What Interviewers Are Actually Evaluating
- Is this a **real failure** — did something genuinely go wrong because of a decision you made?
- Do you **own your part** without excessive self-flagellation or, at the other extreme, without deflecting blame?
- Is there a **clear, specific change** in how you work now, as a direct result of this failure? This is the actual point of the question — the mistake itself is just the setup.
- Can you talk about it **without visible defensiveness**? Comfort discussing failure is itself a signal.

## Mining Your Own Experience
- What's a decision I made that I'd genuinely make differently today, knowing what I know now?
- What's a time I shipped something that broke, traceable back to something I personally missed?
- What's a time I misjudged a technical approach, an estimate, or a person, and it cost real time or trust?
- What did I change — concretely, not just "I learned to be more careful" — after that happened?

## Worked Example
**Situation:** I shipped a schema migration for a billing service that added a new column with a default value, without checking the table size first.

**Task:** The migration was mine end-to-end — I wrote it, tested it locally against a small dataset, and got it approved in review.

**Action:** In production, the table had around 40 million rows, and the migration ran as a blocking, table-locking operation. It locked writes to the billing table for almost eleven minutes during business hours, causing a real customer-facing outage on checkout. I flagged it the moment I saw error rates spike, rolled back immediately, and then wrote the incident postmortem myself rather than letting my manager do it, since it was my mistake. I didn't try to soften my role in the writeup.

**Result:** The immediate fix was straightforward — I re-ran the migration as a backfill in batches during low-traffic hours instead. The lasting change is what matters: I proposed, and we adopted, a rule that any migration touching a table over a defined row-count threshold requires an explicit review of lock behavior and a dry run against a production-sized snapshot before it's approved. That checklist is still in our deployment process, and I've personally caught two other risky migrations with it since.

The process change, and the fact that I've since *used* that change to catch other issues, is what makes this a strong answer — the mistake itself is only half the story.

## Common Mistakes
- **A fake failure.** "I was too much of a perfectionist" is a strength dressed up as a weakness — interviewers see through this instantly.
- **No real consequence.** If nothing actually broke or cost anything, it's not a compelling failure story.
- **Excessive self-blame with no resolution.** Dwelling on how bad you felt, without a clear "and here's what I changed," misses the point of the question.
- **Blaming the process, the tooling, or a teammate** instead of naming your own decision that led to the outcome.
	`
	},

	'Success Stories': {
		definition:
			"Describing a project or contribution with a measurable before/after outcome, framed around your specific contribution rather than the team's collective effort.",
		useCase:
			'Questions like "Tell me about your proudest accomplishment" or "What\'s a project you\'re most proud of?" test whether you can isolate and quantify your own impact.',
		detailedMarkdown: `
# Success Stories

The trap here is answering with something the *team* achieved, described in the passive voice — "our project launched and it went really well." Interviewers can't evaluate a team; they need to isolate what you specifically contributed, and they need a way to judge the size of the win. That means numbers, not adjectives.

## What Interviewers Are Actually Evaluating
- Can you **quantify impact** — revenue, latency, error rate, adoption, time saved — rather than describing things as "great" or "significant"?
- Can you **isolate your own contribution** from the team's collective effort?
- Did you pick something **meaningfully difficult or ambiguous**, not just "the task went as planned"?
- Do you talk about success with **confidence but not arrogance** — crediting collaborators where due while still being specific about your role?

## Mining Your Own Experience
- What's a project where I can point to a specific metric that moved because of something I did?
- What's something I built or fixed where I know the "before" number and the "after" number?
- What's a project where my individual decision (an architecture choice, a prioritization call, a technical bet) was the reason it succeeded, not just "I was on the team"?
- Do I have the numbers memorized, or do I need to go dig them up before my next interview?

## Worked Example
**Situation:** Our checkout flow had a page load time of about 4.2 seconds on mobile, and analytics showed a steep drop-off in conversion correlated with load time past 3 seconds.

**Task:** I was asked to investigate performance on the checkout page specifically, as one of two engineers on a small performance initiative.

**Action:** I profiled the page and found that a third-party fraud-detection script was being loaded synchronously and blocking render, even though it wasn't needed until the user clicked "submit." I redesigned the loading strategy to defer that script until after first paint, and separately identified and removed two unused CSS bundles that were adding roughly 300ms of parse time. I owned both the profiling and the implementation; the other engineer on the initiative focused on the product listing pages instead.

**Result:** Checkout page load time on mobile dropped from 4.2 seconds to 1.8 seconds — a 57% improvement. Over the following month, checkout conversion on mobile increased by 6.3%, which the data team estimated at roughly $180K in additional monthly revenue based on our transaction volume. It also became the reference example our team used when arguing for a broader performance budget policy afterward.

## Common Mistakes
- **No numbers.** "It was a big success" tells the interviewer nothing they can evaluate — always have a before/after figure ready, even an estimate.
- **Team credit, no individual isolation.** "We improved performance" doesn't tell the interviewer what you did versus what your teammates did.
- **Picking something too easy.** A success story about a task with no real risk or ambiguity is a weak signal — pick the one where the outcome wasn't guaranteed.
- **Overclaiming.** If you inflate your role and get a specific follow-up question about implementation details you don't actually know, it damages your credibility for the rest of the interview.
	`
	},

	'Project Walkthrough': {
		definition:
			'Delivering a tight, 60-90 second summary of a project — context, your role, and outcome — before the interviewer decides where to dig deeper.',
		useCase:
			'The opening prompt of nearly every technical and behavioral interview: "Walk me through a project you\'re proud of" or "Tell me about [project on your resume]."',
		detailedMarkdown: `
# Project Walkthrough

Almost every interview opens with some version of "walk me through a project." How you handle the first 60-90 seconds sets the trajectory of the entire conversation — it determines what the interviewer chooses to dig into next. Ramble, and you lose control of that; be crisp, and you steer the interview toward your strengths.

## What Interviewers Are Actually Evaluating
- Can you **summarize before you elaborate** — give the headline first, details second, instead of narrating chronologically from day one?
- Do you know **what to include and what to cut**? A rambling walkthrough with no clear "so what" is a bad sign for how you communicate with stakeholders generally.
- Are you setting up **good follow-up questions** for yourself, or accidentally inviting questions you can't answer well?
- Is this **actually your project**, in the details, not just something you were adjacent to?

## The Structure: Context, Role, Outcome
Think of the opening summary as three beats, not a full narrative:
1. **Context (10-15 seconds):** What was the project, and why did it exist? One sentence — the problem it solved or the goal it served.
2. **Your Role (20-30 seconds):** What specifically did you own? Not "I worked on the backend" — name the actual piece: "I designed and built the notification service that handled X."
3. **Outcome (15-20 seconds):** What happened as a result — shipped, adopted, scaled, what metric moved. This is a natural place to flag what you'd like to go deeper on, inviting the interviewer to steer.

After that ~60-90 second summary, stop talking and let the interviewer choose where to go deeper — don't pre-empt every possible question yourself.

## Worked Example (Compressed Summary)
"This was a real-time order-tracking system for an e-commerce platform — before it existed, customers had no visibility into their order once it left the warehouse, which was our top driver of support tickets. I was the lead engineer on a two-person team; I designed the event pipeline that ingested carrier webhook updates and owned the WebSocket layer that pushed live status to the customer app, while my teammate handled the carrier-integration side. We rolled it out to 100% of traffic over about six weeks, and order-status support tickets dropped by around 40% the following quarter. Happy to go deeper on the event pipeline design or the tradeoffs we made on the real-time delivery mechanism, whichever's more useful."

That last sentence is doing real work: it hands the interviewer two concrete directions to dig into, both of which the candidate is prepared for.

## Cross-Reference
For the deep-dive questions that follow this summary — architecture decisions, database design, tradeoffs, scaling, what you'd do differently — see the **Project Preparation** section, which covers how to prepare defensible answers for each of those follow-ups in depth.

## Common Mistakes
- **Starting with "So, um, well, it's kind of a long story..."** — lead with the one-sentence context, not a chronological diary.
- **No clear "your role."** If the interviewer can't tell what you specifically did versus your team, they'll spend their first follow-up question just figuring that out.
- **No outcome.** Ending on "...and then we shipped it" with no result leaves the walkthrough feeling unfinished.
- **Trying to cover everything.** A walkthrough that mentions every technical detail up front leaves nothing for the follow-up questions and runs long, eating into deep-dive time.
	`
	},

	'Resume Walkthrough': {
		definition:
			'Narrating your work history chronologically in a way that highlights what you did and one concrete result per role, without simply reading your resume back verbatim.',
		useCase:
			'The "Walk me through your resume" or "Tell me about yourself" opener used at the very start of most interview loops.',
		detailedMarkdown: `
# Resume Walkthrough

"Walk me through your resume" sounds like the easiest possible interview question, which is exactly why candidates under-prepare for it and give a rambling, flat answer. Done well, this is a chance to set the narrative frame for the entire interview. Done poorly, it burns five to ten minutes and gives the interviewer nothing to work with.

## What Interviewers Are Actually Evaluating
- Can you **narrate, not recite** — do you add color and judgment, or just repeat words already on the page in front of them?
- Do you **allocate time proportionally to relevance** — recent and relevant roles get more time, an old unrelated internship gets a sentence?
- Is there a **coherent throughline** — does your career progression make sense as a story, or does it sound like a random walk?
- Can you **self-edit in real time** — reading the room if the interviewer's body language says "get to the point"?

## The Format: One Sentence + One Highlight, Per Role
For each role, prepare exactly two things in advance:
1. **One sentence on what you did.** Specific enough to mean something: not "I worked on the backend," but "I owned the payments team's fraud-detection pipeline."
2. **One concrete highlight.** A number, a shipped feature, a hard problem solved — the single most interesting or impressive fact about that role.

Then move on. Resist the urge to list every project from a role that ended three years ago — the interviewer cares far more about your most recent, most relevant experience.

## Worked Example (Condensed, Three Roles)
"I started at Company A as a new grad on the platform team — I mostly built internal tooling, and the highlight there was a deploy dashboard I built that cut our release-verification time roughly in half. After about a year and a half I moved to Company B, where I joined the payments team; I owned the fraud-detection scoring service, and the highlight was leading the migration of that service off a deprecated internal framework with zero downtime, which is actually a good example if you want me to go deeper on migration strategy. Most recently, at Company C, I've been the lead on our checkout experience — the biggest thing there has been redesigning our real-time inventory-sync system, which reduced overselling incidents by about 90%. That's roughly the arc — happy to go deeper on any of those."

Notice the early roles get a sentence or two, while the most recent, most relevant role gets the most detail and an explicit invitation to dig in.

## Common Mistakes
- **Reading the resume back literally.** ("As you can see here, I worked at Company A from 2019 to 2021 doing backend development...") — the interviewer already has the resume open; narrate the story behind it instead.
- **Equal time for every role.** Spending two minutes on a first internship and thirty seconds on your current, most relevant job is backwards — the further back in time, the less airtime it needs.
- **Too vague.** "I worked on the backend" or "I did a lot of different things" leaves the interviewer with nothing to grab onto for follow-ups.
- **No highlight per role.** Without at least one concrete detail per stop, the walkthrough sounds like a list of job titles instead of a career.
	`
	}
};
