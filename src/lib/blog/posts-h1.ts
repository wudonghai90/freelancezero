import type { Post } from './types';

/**
 * Posts published January–April 2026.
 *
 * Note on competitor figures: fee percentages are what the platforms publicly
 * advertised at the time of writing. Platforms change pricing — each comparison
 * post tells readers to verify current rates rather than trust a number in a
 * blog post.
 */
export const POSTS_H1: Post[] = [
  {
    slug: 'best-freelance-platforms-2026',
    title: 'The 12 Best Freelance Platforms in 2026 (Ranked by What You Actually Keep)',
    excerpt:
      'Most "best freelance platform" lists rank by traffic. We ranked by take-home pay — what lands in your bank account after commission.',
    date: '2026-01-05',
    author: '自由工作平台 Team',
    category: 'Comparisons',
    keywords: [
      'best freelance platforms',
      'freelance websites 2026',
      'freelance platform comparison',
      'top freelance sites',
    ],
    readingMinutes: 11,
    body: `Every "best freelance platforms" list ranks the same way: by how much traffic the platform gets. That tells you where the jobs are. It tells you nothing about what you take home.

So we ranked differently. The question here is simple: **for every $10,000 of work you invoice, how much reaches your bank account?**

## The ranking

| # | Platform | Commission | You keep per $10k |
| --- | --- | --- | --- |
| 1 | 自由工作平台 | 0% | $10,000 |
| 2 | Contra | 0% (client-side fees) | ~$10,000 |
| 3 | Guru | 5–9% | $9,100–9,500 |
| 4 | Upwork | ~10% | ~$9,000 |
| 5 | Freelancer.com | ~10% | ~$9,000 |
| 6 | Toptal | Client-side markup | Varies |
| 7 | Arc.dev | Client-side markup | Varies |
| 8 | PeoplePerHour | ~20% sliding | ~$8,000+ |
| 9 | Fiverr | ~20% | ~$8,000 |
| 10 | 99designs | ~20% sliding | ~$8,000+ |
| 11 | DesignCrowd | ~15% | ~$8,500 |
| 12 | Craigslist / cold outreach | 0% | $10,000, but you find every client yourself |

Verify current rates before you commit to a platform — every one of these has changed pricing at least once, and none of them announce increases loudly. You can check them directly at [Upwork](https://www.upwork.com), [Fiverr](https://www.fiverr.com), [Freelancer.com](https://www.freelancer.com), [Guru](https://www.guru.com), [Toptal](https://www.toptal.com), and [Contra](https://contra.com).

## 1. 自由工作平台 — 0%, and open source

Full disclosure: this is our platform, and we built it because the maths above made us angry.

自由工作平台 charges **no commission on your work**. Not a reduced rate, not a sliding scale that improves after you hit a lifetime billing threshold — zero, permanently. Clients pay you directly through Stripe, PayPal, Wise, or bank transfer. We never take custody of the money, which is precisely why we cannot skim it.

The platform is also MIT-licensed and self-hostable. If we ever became the thing we replaced, you could fork the code and run it yourself. That is not a marketing promise; it is a licence.

**What you give up:** we are newer, so there are fewer jobs than on a platform with a decade of SEO. We are honest about that. Most freelancers we talk to run 自由工作平台 alongside an incumbent for a few months, then shift as their client base moves over.

## 2. Contra

Contra is commission-free for freelancers and has built a genuinely nice product around independent work. Fees are pushed to the client side instead. Strong for design and creative work, thinner in engineering.

## 3. Guru

Guru's cut depends on your membership tier — roughly 9% on the free plan, dropping toward 5% on paid tiers. That "pay us monthly to be charged less" structure is at least transparent. The interface feels its age, but the fee ceiling is lower than the big two.

## 4. Upwork

The default. The volume is real: if you need work this month, Upwork probably has it.

The cost is a flat service fee of around 10% on your earnings, plus Connects — a token currency you buy to submit proposals. That second part is worth naming plainly: **you pay for the privilege of applying**, whether or not you get hired.

## 5. Freelancer.com

Similar economics to Upwork, with a heavier emphasis on contests. Around 10% or a minimum fee, whichever is greater — the minimum matters on small projects, where a $30 job can lose a disproportionate chunk.

## 6–7. Toptal and Arc.dev

Both are curated networks with real screening. They do not visibly take a cut of your rate; they mark the rate up to the client. You still "pay" — you simply cannot see the number. Rates are high and the clients are serious, but acceptance is competitive and slow.

## 8–10. PeoplePerHour, Fiverr, 99designs

Fiverr's roughly 20% is the highest headline rate among the majors. On a $10,000 year that is $2,000 gone — a decent laptop, or a month of rent in most cities.

The counter-argument is inbound: Fiverr sends you buyers without you pitching. If you genuinely cannot find clients any other way, 20% for a fully-managed funnel is a defensible trade. Just make it a decision, not a default.

## 11. DesignCrowd

Contest-driven design work at around 15%. Contests mean speculative work — you may produce a finished design and be paid nothing. Enter with your eyes open.

## 12. Cold outreach

No platform, no commission, no protection, no dispute process, and no one sending you leads. Included because it is the honest baseline: platforms are selling you distribution, and distribution has a price.

## How to actually choose

> Pick based on where you are, not where you want to be. Need work this week? Go where the volume is. Have three clients who already trust you? Every percentage point you hand over is a choice.

The strategy we see working repeatedly:

1. Use a high-volume platform to find your first clients.
2. Deliver work good enough that they want to keep working with you.
3. Move ongoing relationships to a zero-fee platform where you keep everything.
4. Keep a profile on the big platform for new lead flow.

Step 3 is the one people skip, and it is the one worth the most money. A single retained client billing $3,000 a month costs you roughly $3,600 a year in commission at 10%. Moving that one relationship pays for a holiday.

[Create a free 自由工作平台 account](/register) and keep the next $10,000 you earn.`,
  },

  {
    slug: 'upwork-fees-explained-2026',
    title: 'Upwork Fees Explained: What You Actually Take Home in 2026',
    excerpt:
      'Upwork’s 10% service fee is only part of the story. Here is the full cost — Connects, payment fees, currency conversion — and what lands in your account.',
    date: '2026-01-15',
    author: '自由工作平台 Team',
    category: 'Money',
    keywords: [
      'upwork fees',
      'upwork service fee 2026',
      'how much does upwork take',
      'upwork connects cost',
    ],
    readingMinutes: 8,
    body: `"Upwork takes 10%" is the number everyone quotes. It is also incomplete. Here is every cost between a client paying and money arriving in your account.

## 1. The service fee

Upwork charges a flat service fee of around **10%** on your earnings. Historically this was tiered — 20% on the first $500 with a client, dropping to 5% above $10,000 — which rewarded long relationships. The flat structure is simpler and, for freelancers with a few large long-term clients, more expensive than the old sliding scale.

On $10,000 invoiced, that is **$1,000**.

## 2. Connects

To submit a proposal you spend Connects. You get a small monthly allowance and buy more at roughly $0.15 each. A competitive proposal costs a handful.

Say you send 20 proposals a month at 8 Connects each: 160 Connects, about **$24 a month** — around $288 a year — spent on *applying*. If you win one job in ten, you paid for nine rejections.

This is the fee people underestimate, because it is charged whether or not you earn anything.

## 3. Payment and withdrawal fees

Getting money out costs money:

- Direct to US bank (ACH): usually free or near it
- Wire transfer: a fixed fee per withdrawal
- PayPal: a per-withdrawal fee plus PayPal's own cut
- Currency conversion: typically around 2% above the mid-market rate if you bill in USD and bank in another currency

That last one is quietly the largest for non-US freelancers. A 2% conversion spread on $10,000 is **$200** — and it does not appear on any fee page as "Upwork's fee".

## 4. Membership (optional)

Freelancer Plus runs about $20 a month for more Connects and profile visibility. Another **$240 a year** if you take it.

## The real total

For a freelancer billing $10,000 a year, banking outside the US, applying actively:

| Cost | Amount |
| --- | --- |
| Service fee (10%) | $1,000 |
| Connects | ~$288 |
| Currency conversion (~2%) | ~$200 |
| Withdrawal fees | ~$50 |
| **Total** | **~$1,538** |

That is **roughly 15% of gross**, not 10%. On $50,000 a year it is around $7,700.

> The headline rate is the fee you notice. The other five percentage points are the ones that quietly compound.

## What you get for it

Being fair: Upwork provides real value. Escrow protection means you are far less likely to be stiffed. Dispute resolution exists. Payment processing is handled. And the volume of work is genuinely the largest in the industry.

If Upwork is your only source of clients, 15% for a working sales pipeline is not outrageous. Agencies charge 20–30% for less.

The problem is what happens after year one. Once a client is a repeat client — they know your work, they message you directly, no pitching involved — you are paying 10% for an invoicing tool.

## How to reduce it legitimately

1. **Consolidate clients.** Fewer, larger, longer engagements means fewer Connects spent chasing new ones.
2. **Bill in your own currency** where the client agrees, and avoid the conversion spread.
3. **Withdraw less often, in larger amounts,** so fixed withdrawal fees hurt less.
4. **Skip Freelancer Plus** unless you can point at revenue it produced.
5. **Move retained relationships to a zero-fee platform.** Not a trick — just stop paying commission on relationships you already own.

On that last point: [自由工作平台](/register) charges 0% and lets clients pay you directly. On $50,000 a year, the difference is roughly $7,700 — the single largest raise most freelancers can give themselves without asking anyone for anything.

Check [Upwork's own pricing page](https://www.upwork.com/pricing) before making decisions; pricing changes, and this post is a snapshot. For the currency-conversion side, [Wise publishes the mid-market rate](https://wise.com/gb/currency-converter/) so you can see exactly what spread you are being charged.`,
  },

  {
    slug: 'first-freelance-client',
    title: 'How to Get Your First Freelance Client (Without Paying to Apply)',
    excerpt:
      'A practical 30-day plan to land your first paying client — no Connects, no bidding wars, no working for exposure.',
    date: '2026-01-27',
    author: '自由工作平台 Team',
    category: 'Guides',
    keywords: [
      'how to get freelance clients',
      'first freelance client',
      'find freelance work',
      'freelancing for beginners',
    ],
    readingMinutes: 9,
    body: `The advice most beginners get is "build a portfolio and apply everywhere". It is not wrong, it is just slow — and on platforms that charge per application, expensive.

Here is a tighter plan. Thirty days, no paid applications.

## Week 1: Decide what you sell

"Full-stack developer" is not a service. "I migrate WordPress blogs to Next.js without losing SEO rankings" is a service.

Specific beats general for one unglamorous reason: **specific is searchable and referable**. Nobody refers "a designer". People refer "the person who does SaaS onboarding flows".

Write one sentence: *I help [who] achieve [outcome] by [what you do].*

Examples that work:

- I help climate-tech startups turn Figma into accessible React dashboards.
- I help B2B SaaS companies rewrite onboarding emails so trials convert.
- I help Shopify stores fix Core Web Vitals so they stop losing mobile sales.

## Week 2: Build proof, not a portfolio

You do not need ten case studies. You need **one** thing a stranger can look at and think *this person can do the job*.

If you have no client work:

- **Rebuild something badly done.** Pick a real product, improve one screen, write up what you changed and why. Be respectful; critique the work, not the team.
- **Ship a small open-source tool** that solves a real annoyance in your niche.
- **Write the guide you wish existed.** Teaching a thing is evidence you can do the thing.

Each of these is a portfolio piece you control, made without permission from anyone.

## Week 3: Talk to twenty people

Not applications — conversations.

1. **Ten people you already know.** Former colleagues, classmates, the friend whose startup you know is understaffed. Message: *"I'm freelancing now, doing [one sentence]. If you hear of anyone who needs that, I'd appreciate the intro."* No pitch, no pressure.
2. **Ten strangers with a visible problem.** Find companies whose site is slow, whose onboarding email is broken, whose docs are a mess. Send a short note that leads with the problem and a specific observation.

The stranger message that works looks like this:

> Hi [name] — I was looking at [specific thing] and noticed [specific problem, with detail proving you actually looked]. I fixed something similar for [context] and it took about [time]. Happy to send a short outline of how I'd approach it, no charge. Either way, thought you'd want to know about it.

You are not asking for a job. You are handing them something useful. Some of them will ask what you charge.

## Week 4: Say yes carefully

Your first client will probably be smaller than you want. Take it if:

- The scope is written down.
- The payment terms are written down.
- You can name what "done" means in one sentence.

Turn it down if they want free work "to see if you're a fit". A paid trial task is fine. Speculative work is not.

> Charge from the first project. A client who will not pay a beginner rate will not pay a senior rate later. You are not building a relationship — you are training them.

## What not to do

- **Do not lowball to $5/hour.** It does not lead anywhere except more $5/hour work, and it filters *for* clients who value the work least.
- **Do not build a fifteen-page website for yourself before starting.** One page with your sentence, your proof, and a way to contact you is enough.
- **Do not spend money applying** before you have earned any. Platforms that charge per application are a poor fit for someone with no track record — you are paying to compete against people with 50 reviews.

## Where to apply for free

Places where applying costs nothing:

- **[自由工作平台](/jobs)** — no fees to apply, no commission on what you earn.
- [We Work Remotely](https://weworkremotely.com) and [RemoteOK](https://remoteok.com) — remote boards where applying is free.
- [Wellfound](https://wellfound.com) for startup contract roles.
- Company career pages that list contract work directly.
- Niche job boards for your specialty.
- Communities where your clients already are — the trick is to be helpful there for weeks before you need anything.

## The thirty-day scoreboard

By day 30 you should have: one sentence describing your service, one piece of public proof, twenty conversations started, and at least one paid conversation in progress.

If you have the first three and no client yet, you are not failing — you are on week five. The conversations compound. The applications do not.

[Create a free profile](/register) and start applying without paying for the privilege.`,
  },

  {
    slug: 'best-upwork-alternatives-2026',
    title: 'The Best Upwork Alternatives in 2026 (Tested and Ranked)',
    excerpt:
      'Leaving Upwork? Here are the alternatives worth your time in 2026, what each actually costs, and who each one suits.',
    date: '2026-02-05',
    author: '自由工作平台 Team',
    category: 'Comparisons',
    keywords: [
      'upwork alternatives',
      'sites like upwork',
      'upwork competitors',
      'better than upwork',
    ],
    readingMinutes: 9,
    body: `People search for "Upwork alternatives" for three reasons: the fees, the race to the bottom on price, or the feeling of paying Connects to lose bids to someone charging $8/hour.

Here is what is actually out there, and who each option genuinely suits.

## Quick comparison

| Platform | Freelancer cost | Best for |
| --- | --- | --- |
| 自由工作平台 | 0% | Keeping your full rate; retained clients |
| Contra | 0% (client pays) | Design and creative independents |
| Toptal | Client-side markup | Senior specialists who pass screening |
| Arc.dev | Client-side markup | Remote engineers wanting vetted roles |
| Guru | 5–9% | Lower fees with an established marketplace |
| Fiverr | ~20% | Productised, repeatable deliverables |
| We Work Remotely | Free to apply | Contract and full-time remote roles |
| Direct outreach | 0% | Anyone with an existing network |

## 1. 自由工作平台 — best for keeping what you earn

Our own platform, so weigh accordingly — but the structural argument stands on its own.

自由工作平台 takes **0% commission**, permanently. Clients pay you directly through Stripe, PayPal, Wise, or bank transfer; the platform never holds the funds. There is no per-application currency, so applying costs nothing but your time.

It is also open source under the MIT licence and self-hostable, which is the real guarantee: a platform that *cannot* skim you is worth more than one that promises not to.

**Suits:** freelancers with repeat clients, anyone tired of paying to apply, teams who want to self-host.
**Trade-off:** newer, so fewer listings than the incumbents. Run it alongside another source of leads at first.

## 2. Contra — best for creatives

Commission-free for freelancers, with fees shifted to clients. The product is polished and the community skews design, brand, and content. Engineering roles are thinner on the ground.

## 3. Toptal — best for vetted senior work

[Toptal](https://www.toptal.com) screens hard — the accepted share of applicants is famously low, and the process takes weeks. In exchange you get serious clients at serious rates, with no visible cut from your side (the markup is applied to the client).

**Suits:** experienced specialists who can pass a rigorous screen and want fewer, larger engagements.
**Trade-off:** slow entry, and you never see the client's true budget.

## 4. Arc.dev — best for remote engineers

Similar curated model aimed at software engineers, with both contract and full-time remote roles. Reasonable middle ground between Toptal's gatekeeping and an open marketplace.

## 5. Guru — cheapest of the traditional marketplaces

Fees run roughly 5–9% depending on membership tier. Interface is dated, volume is moderate, but if you want a conventional bid-and-hire marketplace at half of Fiverr's cut, it is the pragmatic pick.

## 6. Fiverr — best for productised services

Fiverr's cut is high, but the model is different: buyers come to you and purchase a defined package. If you can turn your work into a repeatable product — "I will build your Shopify landing page in 5 days" — the inbound volume can outweigh the commission.

**Suits:** standardised, repeatable deliverables.
**Trade-off:** the highest headline commission among the majors, and price pressure at the entry level.

## 7. Job boards ([We Work Remotely](https://weworkremotely.com), [RemoteOK](https://remoteok.com), [Wellfound](https://wellfound.com))

Not marketplaces — boards. You apply directly and the company pays you directly, so there is no commission at all. Contracts tend to be longer and more stable than marketplace gigs.

**Suits:** freelancers who prefer a handful of long engagements over many small ones.
**Trade-off:** no escrow, no dispute process. You are on your own contractually — so write a real contract.

## 8. Direct outreach

The highest-margin channel and the hardest. No fees, no competition on price, full control. Also no lead flow unless you build it.

Most successful freelancers end up here eventually, using platforms as a top-of-funnel rather than a permanent home.

## How to actually switch

Do not delete your Upwork profile on day one. Overlap:

1. Keep earning where you are.
2. Set up your zero-fee profile and move **repeat clients** first — they already trust you, so there is no sales cycle.
3. Route new leads to whichever platform has the lower cost.
4. Wind down the expensive channel when the pipeline holds without it.

> Moving one retained client billing $3,000/month off a 10% platform saves about $3,600 a year. That is the whole argument, and it does not require you to leave anything behind on day one.

[Start free on 自由工作平台](/register) — no commission, no Connects, and the code is public.`,
  },

  {
    slug: 'freelance-proposal-template',
    title: 'How to Write a Freelance Proposal That Wins (With a Template)',
    excerpt:
      'Most proposals are rejected in under 15 seconds. Here is the structure that survives the skim — plus a template you can copy.',
    date: '2026-02-17',
    author: '自由工作平台 Team',
    category: 'Guides',
    keywords: [
      'freelance proposal template',
      'how to write a proposal',
      'winning freelance proposals',
      'upwork proposal tips',
    ],
    readingMinutes: 8,
    body: `A client posting a job gets somewhere between 20 and 80 proposals. They do not read 80 proposals. They skim until something stops them, then read that one properly.

Your job is to survive the skim.

## Why most proposals fail

They open with the writer. *"I am a passionate full-stack developer with 8 years of experience..."*

The client does not care yet. They have a problem, and they are scanning for someone who understands it. Every sentence about you before you demonstrate understanding of them is a sentence spent on the wrong thing.

## The structure that works

### 1. First line: prove you read the posting

Reference something specific — a constraint, a stack choice, an odd requirement. Not "I read your job description" but a detail that proves it.

> "You mentioned the migration has to preserve existing URLs — that's usually where these projects go wrong, so I'd start there."

This single line separates you from the 60% who paste a template.

### 2. Second paragraph: show you have done this exact thing

One relevant example. Not your whole CV. The closest match you have, with a concrete outcome.

> "I migrated a 400-post publication from WordPress to Next.js last year. We kept every URL, added redirects for the ones that had drifted, and organic traffic was flat within three weeks — no ranking dip."

Numbers make this real. "Improved performance" is noise. "LCP from 4.2s to 1.1s" is evidence.

### 3. Third: a short plan

Three to five steps showing how you would approach *their* project. This is the part almost nobody includes, and it is the most persuasive thing in the document, because it turns an abstract hire into a concrete sequence.

You are also, quietly, demonstrating that you have thought about it more than the other applicants.

### 4. Fourth: price and timeline, stated plainly

Do not hide the number or make them ask. Give a figure or a tight range, and what it covers.

> "$4,200 fixed for the migration, redirects, and a post-launch check. About three weeks from kickoff."

### 5. Last: one question

End with a specific question about their project. It invites a reply, and it signals you are evaluating fit too — not just hoping to be chosen.

## The template

Copy this and adapt:

> Hi [name],
>
> [Specific observation about their project that proves you read it. Mention the risky or interesting part.]
>
> I've done this before: [one closely-matched example with a concrete outcome and a number].
>
> How I'd approach yours:
> 1. [First step — usually the thing that de-risks the project]
> 2. [Second step]
> 3. [Third step]
> 4. [Handover / verification step]
>
> [Price] for the above, roughly [timeline] from kickoff. That includes [what's covered]; [what's not] would be separate.
>
> One question: [specific question about scope, constraints, or priorities]?
>
> [Portfolio link]
>
> [Your name]

## Rules that make a measurable difference

**Keep it under 250 words.** Long proposals read as desperate. Confident people are brief.

**Do not apologise for anything.** No "I know I don't have much experience with X, but...". If you cannot do the job, do not apply. If you can, act like it.

**Do not list every technology you know.** It reads as unfocused. Name the ones relevant to their project.

**Answer their screening questions properly.** Many clients filter on these first; a lazy answer there means your beautiful proposal is never read.

**Send it soon.** Early proposals get read while the client is still enthusiastic. A great proposal sent on day four often loses to a decent one sent in the first hour.

## What to do after sending

Nothing. Do not follow up in 24 hours; it reads as pressure. If you have not heard back in a week and the job is still open, one short message is fair:

> "Still interested in this — happy to answer any questions. If you've gone another way, no problem at all."

Then move on. The single biggest predictor of getting hired is the number of good proposals sent, not the amount of polish on any one of them.

On [自由工作平台](/jobs) applying is free — no Connects, no per-application currency — so the only cost of sending a proposal is the fifteen minutes it takes to write a good one.`,
  },

  {
    slug: 'freelance-rates-2026',
    title: 'Freelance Rates in 2026: How Much Should You Actually Charge?',
    excerpt:
      'A concrete method for setting your rate — based on your costs and target income, not on what a stranger on Reddit charges.',
    date: '2026-02-26',
    author: '自由工作平台 Team',
    category: 'Money',
    keywords: [
      'freelance rates 2026',
      'how much to charge freelance',
      'freelance hourly rate calculator',
      'freelance pricing',
    ],
    readingMinutes: 8,
    body: `"What should I charge?" gets answered badly almost everywhere, because the honest answer — *it depends* — is useless. So here is a method instead of a number.

## Start from the money you need, not the market

Most freelancers pick a rate by looking at what others charge and shading slightly under. That is how a whole market drifts downward.

Work backwards from your actual costs instead.

### Step 1: Your target income

Pick the annual figure you need. Not aspirational — the number that covers your life. Say **$70,000**.

### Step 2: Add the costs an employer used to absorb

As a freelancer you now pay for things a salary hid:

- Self-employment / employer-side taxes
- Health insurance
- Retirement contributions
- Equipment and software
- Accountant
- Sick days and holidays — nobody pays you for these

Rule of thumb: **add 30%**. $70,000 becomes **$91,000**.

### Step 3: Count real billable hours

This is where most calculations break. A year has about 2,000 working hours. You will not bill 2,000.

Realistically, subtract:

- 5 weeks off (holiday + sick + slow periods)
- ~30% of remaining time on unbillable work: sales, invoices, admin, learning

That leaves roughly **1,200 billable hours** a year. Optimistic, even.

### Step 4: Divide

$91,000 ÷ 1,200 = **about $76/hour**.

That is your floor — the rate at which freelancing matches a $70,000 salary. Not your ambitious rate. Your break-even.

The number surprises people, and it should: **a $70k salary is roughly a $76/hour freelance rate.** Anyone billing $35/hour and calling it a good living is quietly funding their clients.

## Then adjust for reality

Your floor is arithmetic. Your actual rate accounts for:

**Specialisation.** Generalists compete with everyone. "React developer" competes globally on price. "Accessibility remediation for healthcare apps" competes with almost nobody.

**Proof.** Concrete outcomes justify higher rates than years of experience. "Cut checkout abandonment 18%" beats "10 years experience".

**Client type.** A funded startup and a local restaurant have different budgets for the same work. Neither is wrong; know which one you are talking to.

**Urgency.** Rush work costs more. This is normal and clients expect it.

## Hourly vs fixed vs value

**Hourly** is safest when scope is unclear. It also caps your income at hours × rate and quietly punishes you for getting faster.

**Fixed price** is better once you can estimate reliably. Get faster, earn more per hour. Requires a written scope, or you will bleed.

**Value-based** — pricing against the outcome's worth, not your time — pays best and demands the most confidence. If your work will generate $200,000 in revenue, $20,000 is a bargain and hours are irrelevant.

Most freelancers should start hourly, move to fixed within a year, and reach for value-based on projects with a measurable business outcome.

## Raising your rate

The cleanest method:

1. Set your new rate for **all new clients**, starting now.
2. Leave existing clients alone until a natural boundary — a new project, a contract renewal.
3. At that boundary, tell them plainly: *"My rate for new projects is $X from [date]."*
4. Do not justify, apologise, or over-explain. One sentence.

Some clients will leave. Usually the ones consuming the most time for the least money. That is the mechanism working, not failing.

> If nobody ever pushes back on your rate, it is too low. A healthy rate loses you some deals.

## Remember what the platform takes

Your rate is not your income. On a 20% platform, $76/hour is $61. To take home the equivalent of $76 you would need to charge **$95**.

| Platform cut | Charge to net $76 |
| --- | --- |
| 0% | $76 |
| 10% | $84 |
| 20% | $95 |

This is why fee structure is a pricing decision, not an admin detail. On [自由工作平台](/register) there is no commission — your rate is your income.`,
  },

  {
    slug: 'fiverr-vs-upwork-vs-freelancezero',
    title: 'Fiverr vs Upwork vs 自由工作平台: An Honest Fee Comparison',
    excerpt:
      'Three platforms, three fee models, three very different take-home numbers. Here is the maths, and who each one genuinely suits.',
    date: '2026-03-10',
    author: '自由工作平台 Team',
    category: 'Comparisons',
    keywords: [
      'fiverr vs upwork',
      'freelance platform fees compared',
      'upwork vs fiverr fees',
      'cheapest freelance platform',
    ],
    readingMinutes: 7,
    body: `We run one of the three platforms in this comparison, so read it with that in mind. What follows is the arithmetic, and we have tried to be fair about where the others genuinely win.

## The models

These platforms are not the same product with different prices. They are three different businesses.

**Fiverr** is a catalogue. Buyers browse packaged services and purchase. You do not pitch; you list. Fiverr takes roughly **20%**.

**Upwork** is a marketplace. Clients post jobs, freelancers bid, and you pay a token currency (Connects) to submit proposals. Upwork takes roughly **10%** plus those Connects.

**自由工作平台** is infrastructure. Jobs are posted, applications are free, and payment happens directly between client and freelancer. The platform takes **0%** and never holds the money.

## The maths at three income levels

| Annual billing | Fiverr (~20%) | Upwork (~10% + Connects) | 自由工作平台 (0%) |
| --- | --- | --- | --- |
| $20,000 | $16,000 | ~$17,700 | $20,000 |
| $50,000 | $40,000 | ~$44,700 | $50,000 |
| $100,000 | $80,000 | ~$89,700 | $100,000 |

Over five years at $50,000 a year, the gap between the cheapest and most expensive option is roughly **$50,000** — a year's income, spent on commission.

## Where Fiverr genuinely wins

Inbound. You are not pitching; buyers find you and click purchase. For standardised work — logo packages, video edits, landing pages — that funnel is real and valuable.

If you are getting consistent inbound orders and would otherwise be sending cold proposals into the void, 20% for a working storefront is a rational trade.

**Where it hurts:** the entry-level price pressure is brutal, and 20% on high-value work is a lot. A $5,000 project costs you $1,000.

## Where Upwork genuinely wins

Volume and safety. It has more listings than anywhere else, escrow protects you from non-payment, and there is a dispute process when things go wrong.

For a freelancer with no network and no clients, Upwork is a reasonable place to build a track record.

**Where it hurts:** you pay Connects to apply, whether or not you win. And once a client is a repeat client, the 10% buys you nothing you are still using.

## Where 自由工作平台 wins

You keep everything, and applying is free. Clients pay you directly via Stripe, PayPal, Wise, or bank transfer — the platform never takes custody, which is exactly why it cannot take a cut.

It is MIT-licensed and self-hostable, so if we ever changed the deal, you could run it yourself.

**Where it hurts — honestly:** we are newer. There is less job volume than a platform with ten years of SEO behind it. If you need work this week and have no network, we are probably not your only answer yet.

## Which to choose

**Choose Fiverr if** your work is productisable and you want buyers to come to you.

**Choose Upwork if** you are starting from zero, need volume, and value escrow while you build a reputation.

**Choose 自由工作平台 if** you have clients who already know you, or you are tired of paying commission on relationships you built yourself.

## What most people should actually do

Use more than one.

1. Keep a profile where the volume is, for lead flow.
2. Move **repeat clients** to a zero-fee platform. No sales cycle needed — they already trust you.
3. Compare, after six months, what each channel actually paid you *net*.

> The mistake is not picking the wrong platform. It is paying marketplace rates on relationships that no longer need a marketplace.

Fee structures change; check each platform's current pricing page before deciding.

[Try 自由工作平台 free](/register) — 0% commission, free applications, open source.`,
  },

  {
    slug: 'true-cost-of-platform-fees',
    title: 'The True Cost of Platform Fees: What 10% Costs Over Five Years',
    excerpt:
      'Platform commission does not just cost you money — it costs you compounded money. Here is what the fee actually takes over a career.',
    date: '2026-03-24',
    author: '自由工作平台 Team',
    category: 'Money',
    keywords: [
      'freelance platform fees',
      'cost of upwork fees',
      'freelance commission calculator',
      'platform fee comparison',
    ],
    readingMinutes: 6,
    body: `A 10% fee sounds small. "Ten percent for finding me clients" is an easy sentence to say.

Run it forward five years and it stops sounding small.

## The direct cost

A freelancer billing $60,000 a year:

| Platform cut | Annual cost | 5-year cost | 10-year cost |
| --- | --- | --- | --- |
| 5% | $3,000 | $15,000 | $30,000 |
| 10% | $6,000 | $30,000 | $60,000 |
| 20% | $12,000 | $60,000 | $120,000 |

At 20%, a decade of freelancing costs you **$120,000** — roughly two years of your own income, handed over.

## The compounding cost

The direct number understates it, because money kept can be invested.

Take the 10% case: $6,000 a year, invested at a 7% average annual return.

| Years | Fees paid | Value if invested instead |
| --- | --- | --- |
| 5 | $30,000 | ~$34,500 |
| 10 | $60,000 | ~$83,000 |
| 20 | $120,000 | ~$246,000 |

Twenty years of a 10% platform fee is not $120,000. Measured against what that money could have become, it is closer to a **quarter of a million dollars**.

That is a house deposit. Or retiring several years earlier.

## The part nobody counts: paying to apply

Platforms with per-application currency add a cost that is independent of whether you earn anything.

Twenty proposals a month at roughly $0.15 per Connect, 8 Connects each: about **$288 a year**. Over ten years, near $3,000 — spent applying, most of it on jobs you did not get.

Worse is the behavioural effect. When applications cost money, you apply less, and you self-select out of jobs you might have won. The fee shapes your behaviour, not just your balance.

## When the fee is worth paying

Being straight: sometimes it is.

If a platform is genuinely your entire sales function — sending you clients you could not have found, handling escrow, resolving disputes — then 10% is competitive. A sales agency costs far more. A recruiter takes 15–25% of first-year salary.

The fee earns its keep when it is buying you **lead generation you would otherwise have to do yourself**.

## When it stops being worth paying

It stops the moment a client becomes a repeat client.

Think about what you are paying for on the fifth project with the same person:

- Lead generation? No — they came to you.
- Trust building? No — that is done.
- Dispute protection? Rarely, with someone you have worked with for a year.
- Invoicing? Yes, technically. At 10% of revenue.

> The first project with a client is where the platform earns its fee. The fifth is where it collects rent.

## What to do about it

You do not have to quit anything abruptly.

1. **Work out your real number.** Last year's earnings × platform rate. Write it down. It is usually larger than people expect.
2. **Sort clients into new and repeat.** Repeat clients are pure margin loss.
3. **Move repeat relationships to a zero-fee platform.** No pitching, no sales cycle — just tell them where to send the invoice.
4. **Keep the paid platform for genuinely new leads,** where it is doing real work.
5. **Recalculate in six months.** Most people find the paid channel is a smaller share of income than they assumed.

A freelancer billing $60,000 with three-quarters of it from repeat clients is paying about **$4,500 a year** for invoicing. Moving just those relationships is a 7.5% raise, granted by nobody but yourself.

[自由工作平台](/register) charges 0%, forever, and is open source so the deal cannot quietly change. Point your repeat clients there and keep the difference.`,
  },
];
