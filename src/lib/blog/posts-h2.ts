import type { Post } from './types';

/** Posts published April–August 2026. */
export const POSTS_H2: Post[] = [
  {
    slug: 'how-to-get-paid-freelancer',
    title: 'How to Get Paid as a Freelancer: Stripe vs PayPal vs Wise Compared',
    excerpt:
      'Choosing how you get paid is a pricing decision. Here is what each option actually costs, especially across borders.',
    date: '2026-04-07',
    author: '自由工作平台 Team',
    category: 'Money',
    keywords: [
      'how to get paid freelancer',
      'stripe vs paypal freelancers',
      'wise for freelancers',
      'freelance payment methods',
    ],
    readingMinutes: 8,
    body: `Payment processing looks like admin. It is actually pricing: a 4% payment cost is a 4% pay cut, taken silently every month.

## The options

| Method | Typical cost | Speed | Best for |
| --- | --- | --- | --- |
| Bank transfer (domestic) | Free–$5 | 1–3 days | Local clients, large invoices |
| Stripe | ~2.9% + $0.30 | 2 days | Card payments, recurring work |
| PayPal | ~3.5% + fixed, plus FX | Instant–1 day | Clients who insist on it |
| Wise | ~0.4–1% | 1–2 days | Cross-border, multi-currency |
| Crypto (USDC) | Network fee | Minutes | Technical clients, hard-to-bank regions |

Always confirm current rates on the providers' own pages — [Stripe pricing](https://stripe.com/pricing), [PayPal fees](https://www.paypal.com/us/webapps/mpp/merchant-fees), and [Wise pricing](https://wise.com/pricing) — since every provider adjusts them.

## Domestic bank transfer

If your client is in your country, this is almost always the cheapest option. ACH in the US, SEPA in the EU, Faster Payments in the UK — either free or a couple of currency units.

**Downside:** no buyer protection, slower to arrive, and some clients find it inconvenient.
**Use it for:** invoices over about $1,000 with clients you trust.

## Stripe

The best experience for card payments. Clean invoices, automatic reminders, subscriptions for retainers. Around 2.9% + $0.30 domestically, more for international cards and currency conversion.

On a $5,000 invoice that is roughly **$145**. Noticeable, but you are buying a genuinely good product and clients rarely object to paying by card.

**Use it for:** retainers, smaller invoices, clients who want to pay by card.

## PayPal

Ubiquitous and widely disliked. Fees run higher than Stripe once cross-border and conversion are included — the currency spread is the part that catches people, often around 3–4% above the mid-market rate on top of the transaction fee.

The bigger risk is account freezes. PayPal can hold funds for extended periods with limited recourse, which is a serious problem when the money is your rent.

**Use it for:** clients who will not use anything else. Withdraw promptly rather than treating it as a bank account.

## Wise

[Wise](https://wise.com) is purpose-built for cross-border. You get local account details in several currencies, so a US client pays a US account and a EUR client pays a EUR account — no wire fees, no correspondent bank surprises. Conversion is near the mid-market rate at roughly 0.4–1%.

For international freelancers this is usually the single biggest saving available.

**Example:** invoicing $50,000 a year from outside the US, PayPal's spread might cost around 3.5% (~$1,750). Wise at ~0.6% costs about $300. Same work, **$1,450** difference.

**Use it for:** any cross-border invoicing.

## Crypto (USDC)

Fast and cheap, useful where banking is genuinely difficult. Adds volatility handling, tax complexity, and a client willing to pay this way. Stablecoins reduce but do not eliminate the risk.

**Use it for:** technical clients, or regions where conventional banking is unreliable.

## Things that matter more than the method

**Invoice immediately.** The single biggest cash-flow improvement is not choosing a cheaper processor — it is sending the invoice the day work completes.

**Ask for a deposit.** 30–50% up front on new clients. It filters out the ones who were never going to pay.

**Put payment terms in writing.** Net 14 or net 30, late fee stated, both agreed before work starts.

**Never work large projects unpaid to completion.** Milestones exist for this reason. Deliver in stages, invoice in stages.

## The platform layer

Whatever processor you choose, check what sits on top of it. Marketplace commission stacks with payment fees: 10% platform + 3% processing is 13% before tax.

[自由工作平台](/settings/payments) is non-custodial — you connect your own Stripe, PayPal, Wise, or bank details and clients pay you directly. The platform adds **0%**, so the only cost is your processor's.`,
  },

  {
    slug: 'freelance-contract-essentials',
    title: 'Freelance Contract Essentials: 9 Clauses That Prevent Disputes',
    excerpt:
      'Most freelance disputes trace back to something nobody wrote down. Here are the nine clauses that prevent almost all of them.',
    date: '2026-04-21',
    author: '自由工作平台 Team',
    category: 'Guides',
    keywords: [
      'freelance contract template',
      'freelance agreement clauses',
      'contract for freelancers',
      'scope creep protection',
    ],
    readingMinutes: 8,
    body: `Almost every freelance dispute — unpaid invoices, scope creep, arguments over who owns the work — traces back to something both parties assumed and neither wrote down.

Here are the nine clauses that prevent most of it. This is practical guidance, not legal advice; for high-value contracts, have a lawyer review your template once and reuse it. If you want a starting point, the [Freelancers Union](https://www.freelancersunion.org) publishes contract resources, and [Creative Commons](https://creativecommons.org/licenses/) is worth understanding before you write any IP clause.

## 1. Scope, stated as deliverables

Not "redesign the website". Instead: *"Design 5 unique page templates (home, pricing, blog index, blog post, contact) delivered as Figma files."*

The test: could a stranger read this and tell whether it is finished? If not, rewrite it.

## 2. What is explicitly out of scope

The most valuable paragraph in any freelance contract, and the most commonly missing.

> Not included: copywriting, photography, CMS integration, ongoing maintenance, or additional page templates. These can be added at $X/hour or by written change order.

Now "can you just add..." has an answer that is not an argument.

## 3. Revisions, with a number

Unlimited revisions is not generosity, it is an unbounded liability.

> Includes two rounds of revisions per deliverable. Further rounds billed at $X/hour.

## 4. Payment terms and schedule

State the amount, the currency, the schedule, and the deadline.

- Deposit: 40% before work begins
- Milestone: 30% at design approval
- Final: 30% on delivery
- Terms: net 14 from invoice date

The deposit matters most. A client unwilling to pay a deposit is showing you something about how the final invoice will go.

## 5. Late payment consequences

> Invoices unpaid after 14 days accrue 2% monthly interest. Work pauses on accounts more than 21 days overdue.

You may never invoke it. Its job is to be present, so "when will this be paid?" is a contractual question, not a social one.

## 6. Intellectual property, and when it transfers

The clause that causes the most expensive arguments. Be explicit on both parts:

> Ownership of the delivered work transfers to the Client upon receipt of final payment. The Freelancer retains ownership of pre-existing tools, libraries, and components, licensed to the Client perpetually and non-exclusively for use in the deliverables.

"Upon receipt of final payment" is the important half. Without it, they own the work whether they pay or not.

## 7. Kill fee / termination

Either side can walk. Define what happens when they do.

> Either party may terminate with 7 days' written notice. The Client pays for all work completed to the termination date, plus 25% of the remaining contract value if terminating without cause.

## 8. Portfolio rights

You want to show the work. Agree it in advance rather than asking awkwardly later.

> The Freelancer may display the work in their portfolio and case studies after public launch, excluding any material marked confidential.

## 9. Limitation of liability

Cap your exposure at what you were paid.

> The Freelancer's total liability is limited to the total fees paid under this agreement. Neither party is liable for indirect or consequential damages.

Without this, a $3,000 project theoretically exposes you to unlimited damages.

## Practical notes

**Email counts.** A clear email both parties reply to is a contract in most jurisdictions. Better than a beautiful PDF nobody signed.

**Written change orders.** Every scope change gets an email: what changed, what it costs, what it does to the timeline. Get "yes" in writing before starting.

**Keep it short.** A readable two-page agreement that both parties understand beats a twelve-page template neither has read.

**One template, reused.** Write it once, adjust the scope and price per project.

> The contract is not there to win a lawsuit. It is there so that six weeks in, when someone says "I assumed that was included", you can both look at the same paragraph.

On [自由工作平台](/register), the contract is directly between you and your client — the platform is not a party to it, does not hold your money, and takes 0%.`,
  },

  {
    slug: 'freelance-portfolio-that-converts',
    title: 'How to Build a Freelance Portfolio That Actually Converts',
    excerpt:
      'Nobody hires you because your portfolio is pretty. They hire you because they recognise their problem in it. Here is how to build for that.',
    date: '2026-05-06',
    author: '自由工作平台 Team',
    category: 'Growth',
    keywords: [
      'freelance portfolio',
      'portfolio that gets clients',
      'freelance case study',
      'portfolio tips freelancers',
    ],
    readingMinutes: 7,
    body: `Most portfolios are galleries: screenshots, a logo grid, a list of tools. They demonstrate taste. They do not demonstrate that you solve problems.

Clients are not judging aesthetics. They are asking one question: *has this person solved my problem before?*

## Six case studies beat sixty screenshots

A portfolio's job is pattern-matching. A client with a slow Shopify store wants to see a slow Shopify store you made fast — not twelve unrelated projects across every industry.

**Show fewer, deeper.** Four to six pieces, each told properly, outperforms thirty thumbnails.

## The case study structure that works

### 1. The problem, in the client's words

> "Checkout took 11 seconds on mobile. Roughly 60% of mobile shoppers abandoned before payment."

Numbers immediately. A prospect with the same problem stops scrolling here.

### 2. The constraints

What made it hard? Legacy code, a two-week deadline, no design system, a nervous stakeholder. Constraints prove judgement — anyone can do good work with unlimited time.

### 3. What you did, and why

Decisions, not a task list. "Replaced the image pipeline with responsive WebP" is a task. "Images were 80% of page weight, so I started there rather than refactoring JavaScript" is judgement.

### 4. The outcome, measured

The part almost everyone omits:

> "Mobile checkout: 11s → 2.3s. Abandonment fell from 60% to 34%. Roughly $40k/month in recovered revenue."

If you have no metrics, ask the client — many will tell you. If they will not, use what you can observe: load times, error rates, hours saved.

### 5. What the client said

Two sentences of specific praise beat five of generic warmth.

## If you have no client work

Nobody's first portfolio has clients in it. Build proof anyway:

- **Fix something real, publicly.** Find a slow site or a confusing signup flow, improve it, document your reasoning. Critique the work, not the people.
- **Ship a small tool.** A calculator, a converter, a linter rule — something with a URL.
- **Write the guide you needed.** Explaining a problem clearly is evidence you understand it.
- **Do one project at cost** for a nonprofit, on the condition you can publish the case study and metrics.

## Where to host it

The platform matters less than the content, but:

- **Your own domain** — always. You control it and it accrues SEO value.
- One page per case study, so you can link a client directly to the most relevant one.
- **A marketplace profile** where your prospects search. On [自由工作平台](/register) your profile is public and indexable at no cost.

Send the *relevant* case study, not the homepage. A prospect with a checkout problem should land on the checkout case study.

## Details that quietly matter

**Load fast.** A portfolio that takes 6 seconds contradicts everything you claim about quality. Check it with [PageSpeed Insights](https://pagespeed.web.dev) before you send it to anyone.

**Make contact obvious.** A visible way to reach you on every page. People decide fast and forget faster.

**Date your work.** "2026" signals active. Undated work reads as stale.

**Say what you want next.** "Currently taking on accessibility audits for healthcare products" tells people exactly when to think of you.

> Your portfolio's job is not to impress everyone. It is to make the *right* client feel like you have already solved their exact problem.

Update it after every project, while the numbers are still fresh — nobody remembers the metrics six months later.`,
  },

  {
    slug: 'where-to-find-remote-freelance-work-2026',
    title: 'Where to Find Remote Freelance Work in 2026 (26 Real Sources)',
    excerpt:
      'Beyond the big marketplaces: job boards, niche communities, and channels that actually produce paid remote work.',
    date: '2026-05-19',
    author: '自由工作平台 Team',
    category: 'Guides',
    keywords: [
      'remote freelance jobs',
      'where to find freelance work',
      'freelance job boards',
      'remote work sites 2026',
    ],
    readingMinutes: 9,
    body: `Everyone knows the big three marketplaces. Here is the wider map — including the channels that produce the best-paid work and get mentioned least.

## Zero-fee marketplaces

**[自由工作平台](/jobs)** — 0% commission, free to apply, open source. Our own, so judge accordingly; the structural claim is that applying costs nothing and no commission is deducted.

[Contra](https://contra.com) — commission-free for freelancers, strong in design and creative.

## Traditional marketplaces

**Upwork** — the largest volume. ~10% fee plus paid applications.

**Fiverr** — buyers come to you; ~20% cut.

**Guru** — 5–9% depending on tier, dated interface, decent volume.

**PeoplePerHour** — European lean, sliding fees starting around 20%.

## Curated networks

**Toptal** — hard screening, high rates, slow entry.

**Arc.dev** — vetted remote engineering, contract and full-time.

**Gun.io**, **Lemon.io** — developer-focused vetted networks.

**Braintrust** — network-owned model with fees pushed to the client side.

## Remote job boards

Not marketplaces — you apply directly and the company pays you directly, so no commission at all:

[We Work Remotely](https://weworkremotely.com), [RemoteOK](https://remoteok.com), [Remotive](https://remotive.com), [Working Nomads](https://www.workingnomads.com), [NoDesk](https://nodesk.co), and [Wellfound](https://wellfound.com) for startups.

Contracts here tend to be longer and better paid than marketplace gigs. Trade-off: no escrow, so write a real contract.

## Niche boards by discipline

- **Design:** [Dribbble Jobs](https://dribbble.com/jobs), [Behance](https://www.behance.net/joblist), Working Not Working
- **Writing:** ProBlogger, Contently, Superpath (content marketing)
- **Development:** Stack Overflow Jobs, GitHub Jobs boards, Laravel/Rails/Django community boards
- **Data:** Kaggle forums, DataJobs

Niche boards convert far better than general ones. Fewer listings, dramatically less competition, and clients who understand the specialism.

## Communities (the underrated channel)

The best-paid work rarely gets posted publicly. It goes to whoever the person asking already trusts.

- **Slack and Discord communities** in your niche — most have a #jobs or #hiring channel
- [Indie Hackers](https://www.indiehackers.com) — founders who need contractors
- [r/forhire](https://www.reddit.com/r/forhire/) and [r/freelance](https://www.reddit.com/r/freelance/), plus subreddits for your specialty
- **Local meetups and conferences** — still remarkably effective

The rule: be useful there for weeks before you need anything. People hire the person who answered their question in March.

## Direct outreach

The highest-margin channel. No fees, no competition, and you set the price.

Find companies with a visible problem you can fix. Send a short note that leads with the specific observation, not with your CV. Most get ignored. The ones that land are usually your best-paid work.

## Referrals

Consistently the highest-conversion source and the most neglected.

After a project goes well, ask once, specifically:

> "Glad this worked out. If you know anyone else dealing with [the specific problem you solved], I'd appreciate an introduction."

"Anyone who needs a developer" gets you nothing. Specific requests get referrals.

## A realistic mix

For most freelancers, a sustainable pipeline looks roughly like:

- 40% repeat clients and referrals
- 30% direct outreach
- 20% niche boards and communities
- 10% marketplaces

Note what that implies: marketplaces are the *smallest* slice, but where most people spend the most effort — and the most commission.

> Marketplaces are how you start. Referrals and repeat work are how you make a living.

The strategic move is to use marketplaces to acquire clients, then keep those relationships somewhere that does not charge you commission forever. On [自由工作平台](/register) applying is free and there is no cut on what you earn.`,
  },

  {
    slug: 'avoid-freelance-scams',
    title: 'How to Spot Freelance Scams (and Never Work Unpaid Again)',
    excerpt:
      'The seven scams that target freelancers, the warning signs in the first message, and the rules that make you nearly unscammable.',
    date: '2026-06-03',
    author: '自由工作平台 Team',
    category: 'Guides',
    keywords: [
      'freelance scams',
      'avoid freelance fraud',
      'freelancer not paid',
      'fake client warning signs',
    ],
    readingMinutes: 8,
    body: `Every freelancer eventually meets a client who does not pay. Some of it is disorganisation. Some of it is deliberate.

Here are the common patterns and the rules that make you a hard target.

## The seven scams

### 1. The overpayment refund

They "accidentally" send $3,000 instead of $300 and ask you to refund the difference. The original payment is fraudulent and gets reversed weeks later. You have refunded real money against a fake payment.

**Rule:** never refund an overpayment. Ask the payment provider to reverse the original.

### 2. The unpaid "test project"

A test task that is suspiciously specific and suspiciously complete — a full landing page, a finished logo, a working feature. Multiple candidates each build one piece, and nobody is hired.

**Rule:** paid trial tasks are fine. Unpaid ones should be small, generic, and never immediately shippable.

### 3. Exposure

"We can't pay much now, but this will be great for your portfolio and there's much more work coming."

There is never more work coming.

**Rule:** exposure does not pay rent. Charge from the first project.

### 4. The off-platform pull, before trust exists

A client on a marketplace immediately pushes you to communicate and get paid elsewhere — before any work, any contract, any track record.

Moving *established* relationships off-platform is legitimate and often smart. Being pulled off-platform by a stranger before anything is agreed removes every protection you have.

**Rule:** for a first project with an unknown client, keep it where the protections are.

### 5. The endless revision

They keep requesting changes without ever accepting delivery, so final payment never triggers. Each round is small enough that walking away feels wasteful.

**Rule:** contract a specific number of revision rounds, then bill hourly. Invoice on milestones, not on final approval.

### 6. Credential phishing

A "client" needs access to your accounts, or sends a "brief" as a file that asks you to sign in to view it. The target is your account, not your work.

**Rule:** never enter credentials via a link someone sent you. Navigate to the site yourself.

### 7. The chargeback

Work is delivered, payment is made, then reversed months later claiming non-delivery.

**Rule:** keep written approval at each milestone. It is your evidence in a dispute.

## Warning signs in the first message

- Vague scope with urgent timelines
- Poor grammar combined with a large budget
- Immediate pressure to move to a personal messaging app
- Refusing a video call
- No verifiable company footprint
- Offering unusually above-market rates for routine work
- Wanting to pay in an unusual method "for convenience"

One of these can be innocent. Three together is a pattern.

## The rules that make you hard to scam

**1. Always take a deposit.** 30–50% up front on new clients. This alone eliminates most of it — scammers do not pay deposits.

**2. Milestones, always.** Never build the whole thing before invoicing anything. Split into stages: deliver a stage, invoice a stage, get paid, continue.

**3. Stop working when payment stops.** The most common way freelancers lose money is continuing to work while an invoice ages. One invoice overdue means work pauses. This is not aggressive; it is stated in your contract.

**4. Get scope in writing.** Email counts. If it was not written down, it is a disagreement waiting to happen.

**5. Verify the human.** A short video call. Scammers avoid them.

**6. Withhold the final handover until final payment.** Deliver watermarked previews or a staging environment; transfer files and ownership on payment. Your contract should say IP transfers on receipt of final payment.

## If it happens anyway

1. **Stop working immediately.** Do not deliver more hoping to trigger goodwill.
2. **Send one clear, factual invoice reminder** with the terms and the amount.
3. **Use the platform's dispute process** if the work was on a marketplace.
4. **Send a formal demand letter.** Often enough on its own.
5. **Small claims court** for larger amounts — cheaper and easier than most people expect.
6. **Write it off and move on** if it is small. Your time is worth more than the recovery.

> The goal is not to never get scammed. It is to make sure that when it happens, you lose one milestone rather than three months of work.

On [自由工作平台](/register), contracts and payments are directly between you and your client — which means the deposit and milestone discipline above is not optional best practice, it is your protection. Use it.`,
  },

  {
    slug: 'freelancer-taxes-101',
    title: 'Freelancer Taxes 101: What to Set Aside and When',
    excerpt:
      'The tax basics every freelancer needs: what percentage to reserve, what you can deduct, and the quarterly rhythm that avoids nasty surprises.',
    date: '2026-06-18',
    author: '自由工作平台 Team',
    category: 'Money',
    keywords: [
      'freelancer taxes',
      'self employed tax',
      'how much tax to set aside freelance',
      'freelance tax deductions',
    ],
    readingMinutes: 7,
    body: `The most expensive freelance mistake is spending money that was never yours. Here is the framework — general principles, not advice for your situation. Rules vary by country and change yearly; talk to an accountant once, early. It is the cheapest money you will spend.

US readers: the [IRS self-employed tax center](https://www.irs.gov/businesses/small-businesses-self-employed) is the authoritative source. UK readers: [HMRC's self-employment guidance](https://www.gov.uk/set-up-self-employed). Always prefer those over a blog post — including this one.

## The core shift

Employment hides tax. Money arrives already reduced, and what lands is genuinely yours.

Freelancing does the opposite. The full invoice arrives, feels like income, and a large portion of it belongs to a tax authority that will ask for it later.

**Every payment you receive is part income, part tax you are holding temporarily.**

## What to set aside

A workable default in most jurisdictions is **25–35% of gross**, depending on your bracket and local rates. If you are unsure, use 30%.

**The mechanism matters more than the number.** Open a separate savings account. The day a client payment lands, move 30% into it. Do not calculate, do not decide — transfer.

Money in your main account gets spent. This is not a discipline problem; it is how everyone works.

If you owe less than you saved, you have a bonus. If you skipped it, you have a debt.

## Why the rate is higher than employment

Employed people split payroll taxes with their employer. Freelancers are both parties, and pay both halves — the self-employment tax in the US, and similar structures elsewhere.

This is exactly why the [rate calculation](/blog/freelance-rates-2026) needs a ~30% uplift on top of your target income. It is not padding; it is the employer contribution you now cover yourself.

## Quarterly payments

Most systems expect income tax through the year rather than in one annual lump — quarterly estimated payments in the US, similar schedules elsewhere.

Miss them and you can owe penalties even if you eventually pay in full.

Put the four dates in your calendar with a week's warning. This is the single highest-value calendar entry a freelancer can make.

## What is usually deductible

Business expenses reduce taxable income. Commonly deductible for freelancers:

- Hardware: computer, monitor, phone (business-use portion)
- Software and subscriptions
- Home office (a proportion of rent/utilities, where rules permit)
- Internet and phone service, business portion
- Professional development: courses, books, conferences
- Accountant and legal fees
- Business insurance
- Travel to clients
- Payment processing fees
- **Platform commission** — if a marketplace takes 10%, that is usually deductible

Keep receipts. Photograph them immediately; shoeboxes fail.

## What usually is not

- Personal clothing, even "for work"
- Meals alone
- Commuting to your own office
- Anything with no business purpose

The test is whether the expense exists *because of* the business.

## A rhythm that works

**Weekly (10 minutes):** log invoices sent and paid; photograph receipts.

**Monthly (30 minutes):** reconcile, categorise expenses, confirm the 30% transfers happened.

**Quarterly:** make the estimated payment; review whether 30% is tracking correctly.

**Annually:** file, and review structure with an accountant — at some income level, incorporating may reduce your bill meaningfully.

## Structure, briefly

Sole trader / sole proprietor is simplest and fine at lower incomes. As earnings grow, a company structure can reduce tax and add liability protection, at the cost of paperwork.

There is no universal threshold — it depends on your country, income, and plans. This is the specific question worth paying an accountant an hour to answer.

## The platform angle

Commission is a real cost that reduces both your income and your tax bill — but a deduction returns only your marginal rate, not the whole fee. Paying $6,000 in commission to save perhaps $1,800 in tax still leaves you $4,200 down.

> Deductions soften costs. They never make a cost free. The cheapest fee is the one you do not pay.

On [自由工作平台](/register) there is no commission, so there is nothing to deduct — the money simply stays with you. Track your income carefully either way; nobody sends you a summary at year end when you are the business.`,
  },

  {
    slug: 'self-host-freelance-marketplace',
    title: 'Self-Hosting Your Own Freelance Marketplace: A Practical Guide',
    excerpt:
      '自由工作平台 is open source. Here is how to run your own instance — for an agency, a community, or a niche marketplace of your own.',
    date: '2026-07-08',
    author: '自由工作平台 Team',
    category: 'Product',
    keywords: [
      'self-hosted freelance marketplace',
      'open source freelance platform',
      'build a freelance marketplace',
      'freelancezero self hosting',
    ],
    readingMinutes: 8,
    body: `自由工作平台 is MIT-licensed and self-hostable. This guide covers who should run their own instance, what it takes, and the decisions that matter.

## Why self-host

**You run an agency or collective.** A private marketplace where your vetted freelancers meet your clients, on your domain, with your branding.

**You serve a niche.** A marketplace exclusively for, say, accessibility specialists or Shopify developers is a viable business — the incumbents are too general to serve narrow communities well.

**You need data residency.** Some clients cannot use a platform that stores data outside their jurisdiction. Self-hosting puts the database where you need it.

**You do not want to depend on us.** The strongest argument for open source: our promise of 0% fees is only as good as our incentives. The licence means you never have to trust it.

## What you need

- A server or container host (Docker Compose works out of the box)
- A PostgreSQL database
- A domain
- An SMTP provider for transactional email
- Optional: S3-compatible storage for uploads

A small VPS handles a community-scale instance comfortably.

## Getting it running

The repository ships with Docker Compose covering the app, Postgres, and a local mail catcher for development:

1. Clone the repository
2. Copy the example environment file and fill it in
3. Run the database migrations and the seed
4. Start the stack

The environment file is the whole configuration surface. The variables that matter most:

- **Database URL** — your Postgres connection
- **Auth secret** — generate a long random value; never reuse the example
- **App URL** — the public URL, used in emails and callbacks
- **Email** — either SMTP credentials or a Resend API key
- **Payments driver** — which payment adapter to use

## The decisions that actually matter

### 1. Email deliverability

The most common thing self-hosters get wrong. The platform requires email confirmation before users can post or apply — so if email does not arrive, **every new user is stuck**.

Do this properly:

- Use a real transactional provider, not your own SMTP server
- Verify your sending domain
- Configure SPF, DKIM, and DMARC before launch
- Send a test signup end-to-end and confirm it lands in an inbox, not spam

### 2. Payments stay non-custodial

The platform never holds funds — clients pay freelancers directly. Keep it that way. Custodying other people's money turns a side project into a regulated financial business with licensing obligations. The non-custodial design is a deliberate safety feature, not a limitation.

### 3. Approval policy

New accounts require manual approval before posting or applying. For a private agency instance that is ideal. For an open marketplace it is a bottleneck — decide who reviews the queue and how fast, before you launch.

### 4. Backups

Postgres holds everything: users, jobs, proposals, contracts, messages. Automate backups, and **test a restore** before you need one. An untested backup is a hypothesis.

### 5. Moderation

An open marketplace attracts spam. The platform includes proposal quality scoring and admin approval; you still need a human policy for reports and abuse.

## Cold-start reality

The hardest part is not technical. A marketplace with no jobs attracts no freelancers, and vice versa.

Approaches that work:

- **Start one-sided.** An agency instance already has both sides, which is why it is the easiest case.
- **Seed the demand side.** The platform includes an external-job ingestion system that can seed listings from public job boards, so freelancers arrive to a populated marketplace.
- **Niche down hard.** "Freelance marketplace" competes with everyone. "Marketplace for Django contractors in the EU" competes with nobody.

## What you are responsible for

Running your own instance makes you the data controller. That means privacy compliance, security patching, uptime, backups, and support for your users. The licence gives you the software, not an operations team.

If that is more than you want, use the hosted version — it is free and takes 0% commission either way.

> Self-hosting is the right call when you need control, branding, or data residency. It is the wrong call if you simply want a cheaper platform — the hosted one already costs nothing.

The code is on [GitHub](https://github.com/freelancezero/freelancezero) under the [MIT licence](https://opensource.org/license/mit). Deployment targets worth considering: [Vercel](https://vercel.com) for the app, [Docker](https://docs.docker.com/compose/) for a self-managed stack, and [Resend](https://resend.com) for transactional email. Contributions welcome.`,
  },

  {
    slug: 'raise-your-freelance-rates',
    title: 'How to Raise Your Freelance Rates Without Losing Clients',
    excerpt:
      'The script, the timing, and the arithmetic — including why losing a few clients to a rate rise usually means you earn more.',
    date: '2026-07-28',
    author: '自由工作平台 Team',
    category: 'Growth',
    keywords: [
      'raise freelance rates',
      'how to increase freelance prices',
      'freelance rate increase email',
      'pricing for freelancers',
    ],
    readingMinutes: 7,
    body: `Most freelancers are underpriced, know it, and do nothing — because raising rates feels like risking the income they have.

Here is the arithmetic that makes it less frightening, and the script that makes it routine.

## The maths nobody runs

You have 10 clients at $60/hour. You raise to $75 — a 25% increase. Two leave.

| | Before | After |
| --- | --- | --- |
| Clients | 10 | 8 |
| Rate | $60 | $75 |
| Weekly hours | 40 | 32 |
| Weekly revenue | $2,400 | $2,400 |

Same income, **eight fewer hours worked**. Those eight hours go into marketing, better work, or your life.

And the two who left were almost certainly the most price-sensitive and highest-maintenance.

Now assume you refill those hours at the new rate: $3,000 a week — a 25% raise.

> Losing clients to a rate rise is not the failure case. It is the mechanism working.

## When to raise

- You are booked solid and turning work away
- Your rate has not moved in over a year
- You have new proof: a strong case study, a measurable outcome
- You have specialised into something with less competition
- Nobody ever flinches at your price — the clearest signal you are under market

That last one deserves emphasis. **If every prospect says yes immediately, your rate is too low.** A correctly-priced freelancer loses some deals on price.

## The two-track method

The clean approach separates new from existing clients.

**Track 1 — new clients: raise immediately.** Quote the new rate starting with your next proposal. No announcement, no negotiation, no explanation. This is the easiest raise you will ever get, and most people skip it for months.

**Track 2 — existing clients: raise at a natural boundary.** A new project, a contract renewal, a quarter or year start. Give 30 days' notice.

## The script

Short, unapologetic, no justification:

> Hi [name],
>
> A quick heads-up: from [date, 30+ days out], my rate is moving to $[X]/hour.
>
> I've really enjoyed working on [specific project] and I'd like to keep going. Everything currently in flight stays at the current rate.
>
> Happy to talk through it if useful.
>
> [Your name]

That is the whole message.

**What not to include:**

- **Apologies.** "I'm so sorry to do this" invites negotiation.
- **Over-justification.** Listing costs invites debate about your costs. Your rate is your rate.
- **A request for permission.** "Would it be okay if..." makes it negotiable. It is a notification.

## Handling the responses

**"That's a big jump."**
> "I understand. The new rate reflects where my work is now. I'd love to keep working together — happy to look at scope if budget is the constraint."

Adjust scope, not price. Fewer hours at the new rate; never more hours at the old one.

**"Can you keep our old rate?"**
> "I can hold the current rate through [existing commitment], but new work will be at the new rate."

**"We'll have to find someone else."**
> "Completely understand. Happy to help with a clean handover — and if things change, get in touch."

No resentment. Some will come back after discovering that cheaper meant more expensive.

## Do it on a schedule

The freelancers who never struggle with this treat it as a calendar event, not a decision. Once a year, review and raise. It stops being an emotional negotiation and becomes routine — the same way salaried roles have annual reviews.

## Raise your effective rate too

Beyond the number on the invoice, your take-home rises when you:

- **Cut platform commission.** Moving a client off a 10% platform is an instant 10% raise with no conversation required.
- **Reduce payment fees.** Cross-border via Wise instead of PayPal can be worth 2–3%.
- **Kill unbillable time.** Templates for proposals and contracts convert admin into billable hours.

A freelancer billing $80,000 on a 10% platform who moves half their clients to a zero-fee one gains $4,000 a year — comparable to a 5% rate rise, and nobody has to say yes.

[自由工作平台](/register) takes 0% commission, permanently. Point your repeat clients there, then raise your rate on top.`,
  },
];
