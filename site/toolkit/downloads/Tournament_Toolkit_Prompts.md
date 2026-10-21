# Handball Tournament Toolkit: prompt packs

Prompts work in Claude, ChatGPT or any capable AI. Fill the [BRACKETS]. Start with M0.


# M0 Start Here: Setup Review and Tournament Context

Step 1 is a review of where you stand. Prompt 1 asks whether you already run a tournament or are starting from scratch, then takes a different path for each: for an existing event it reviews your files, website and messages; for a new event it interviews you. Both paths end with a plan sized to the time you have and how far you want to go, and a list of legal and compliance points to check. Step 2 (Prompt 2) gives the AI your tournament facts once, so every later prompt can use them.

Works in: any chat AI. The review is better with file upload (workbook, invitation, past emails) and web browsing (your website); without browsing, paste the text of your pages.

## Before you start
* Remove bank details, card numbers, passwords and players' personal data from anything you upload. The review does not need them.
* The legal section flags points to check; it is not legal advice. Confirm anything important with your federation, your insurer, the venue or a lawyer.

## Prompt 1: Setup review (run this first)
You are an experienced tournament organizer and operations reviewer. Help me assess my handball tournament setup and plan improvements. Work in steps and wait for my answers at each step.

Step 1. Ask me one question: do I already run this tournament (and want to improve it), or am I building one from scratch? Then follow path A or path B.

Path A, existing tournament:
1. Ask me to share what I have: workbook or spreadsheets, invitation and registration form, website link or page text, recent emails to teams, budget, schedule, rules, waivers, sponsor material. Ask how many teams, editions, organizers and volunteers.
2. Review everything I share. For each area (format and schedule, registration and payments, communication, visuals, website and results, referees and volunteers, merch and concessions, livestream, committee and handover, sponsors and funding, venue, compliance and awards), rate it as working, needs work or missing, with one line of evidence from my files.
3. Point out duplicated data (the same list kept in several places), manual steps that repeat every week, and anything that depends on one person only.

Path B, new tournament:
1. Interview me in short rounds: dates and city, expected teams and divisions, venue status, budget and entry fee, who helps me, federation and sanctioning, what success looks like for the first edition.
2. Tell me what a first edition needs at minimum and what can wait for year two.

Both paths, then:
4. Ask me two questions: how many hours I can put in before the event, and how far I want to go (Level 0: my current spreadsheet plus AI for writing; Level 1: one master workbook; Level 2: workbook plus a public website; Level 3: full automation with an AI agent).
5. Give me a plan that fits those hours: the 5 to 10 actions with the most impact, in order, each with the time it takes, the cost, the owner role and the toolkit module to use (M1 to M12). Start with the quick wins. Say clearly what to leave out if time is short.
6. Flag legal and compliance risks you can see in what I shared, or that apply to what I described, with severity (high, medium, low) and the question to ask and to whom. Check at least: sanctioning and membership rules; event liability and participant accident insurance, and the certificate the venue requires; participant waivers and parental consent for minors; safeguarding rules for adults working with minors; photo and video consent, including on the livestream; personal data published on the website or shared in emails (use Bcc for group emails); payments collected into personal accounts instead of a club account, refunds and cancellation policy; sales tax or permits for merch and food; music licensing in the venue and on the stream; use of federation, sponsor or other logos; vendor and venue contracts (cancellation, liability, automatic renewal); invitation letters and entry requirements for foreign teams and referees. Say when a point depends on my state or federation, and that this is not legal advice.
7. End with a one page summary: where I stand, the plan, the risks, and the next three actions for this week.

Rules: base every finding on what I shared or told you; do not invent facts about my event. When a file is missing, say what you could not check. Do not send anything on my behalf.

## How to use the context prompt (Prompt 2)

* Claude: create a Project, paste the filled block into the project instructions, and upload your workbook and logos to the project. Every chat in that project starts with the context.
* ChatGPT: create a Project (or a custom GPT), paste the block into its instructions, and upload the same files.
* Any other AI: paste the block at the top of each new conversation.
* Update the block when a fact changes (dates, fees, venue). It is your single source of truth; do not correct facts chat by chat.

## Prompt 2: Tournament context (fill the brackets, then save as instructions)

You are helping me organize a handball tournament. Use these facts in everything you write. If a fact you need is missing, ask me instead of inventing it.

Tournament: [NAME], edition [NUMBER], [DATES], [VENUE NAME AND ADDRESS].
Host club: [CLUB NAME], contact email [EMAIL].
Divisions: [e.g. Men, Women, U16], expected teams per division: [NUMBERS].
Game format: [e.g. 2 x 20 min, running clock], courts: [NUMBER], playing hours per day: [HOURS].
Entry fee: [AMOUNT] per team, deadline [DATE], payment methods: [METHODS, no account numbers in this block].
Key deadlines: registration [DATE], rosters [DATE], final payment [DATE].
Sanctioning and membership requirements: [e.g. federation membership required for all players].
Brand: primary color [HEX], accent color [HEX], logo files uploaded as [FILE NAMES].
Tone: [e.g. direct, friendly, no exaggeration]. Language: [LANGUAGE].
Audience: club captains, players, families, referees, volunteers, local media.

Rules for your work:
1. Never send anything on my behalf. Draft only; I review and send.
2. Keep numbers consistent with my workbook. When you calculate, show the inputs.
3. When you are unsure about a rule, a date or a name, say so.


# M1 Format and Schedule

What it solves: choosing a format that fits your courts, hours and referees, then producing a schedule and a standings logic everyone can trust.
Levels: all. Works in: any chat AI (prompts 1 to 3); file upload needed for prompt 4.
Typical time: 1 to 3 h for the first version.

## Lesson from CalCup
An unbalanced format (5 teams in one division, 8 in the other) left no margin: a Thursday game was added, some referees worked 8 games in 3 days, and any delay had nowhere to go. Size the format from capacity first, then fit the demand.

## Prompt 1: Capacity check
Using the tournament context, calculate how many games fit in our available court time. Inputs: [COURTS] courts, [HOURS PER DAY] hours on day 1, [HOURS] on day 2, [HOURS] on day 3, game length [MINUTES] plus [MINUTES] changeover, minimum rest between two games of the same team [MINUTES]. Show the total game slots, then the slots left after a 15% buffer for delays. Present it as a small table.

## Prompt 2: Format options
We expect [N] men's teams and [N] women's teams. Propose 3 formats (for example round robin, two groups plus crossover, groups plus semifinals and finals). For each one give: total games, games per team, games per referee pair assuming [N] pairs, minimum rest per team, whether it fits the capacity from prompt 1, and the main risk. Recommend one and explain why in three sentences. Apply the same rules to both divisions.

## Prompt 3: Schedule draft
Build the game schedule for the chosen format. Columns: Game number, Day, Start time, Court, Division, Group, Team A, Team B, Referee pair (leave blank). Rules: no team plays twice within [MINUTES]; the finals are last on the final day; no team has its first game before [TIME] if it travels the same day. Then check the schedule against these rules and list any violation.

## Prompt 4: Tiebreakers and standings (with your workbook)
Here is our workbook. Add a standings table per group that updates from the game scores. Points: win [N], draw [N], loss [N]. Tiebreakers in this order: [e.g. head to head points, head to head goal difference, overall goal difference, goals scored]. Before writing formulas, describe the logic and wait for my approval. Then write the formulas and test them with three sample results, including a tie.

## Prompt 5: Demand survey before deciding the format
Write a short survey (8 questions maximum) for club captains, to send before we fix the format. Ask: likelihood of entering a men's team and a women's team, number of teams per club, preferred game length, arrival and departure constraints, budget sensitivity to the entry fee, and interest in extra activities. Use the same questions for every division. Then explain how to read the results into a format decision.

## Prompt 6: Group draw
Run a group draw for these confirmed teams: [LIST WITH DIVISION AND CLUB]. Rules: [N] groups of [N]; two teams from the same club never in the same group; seed the top [N] teams from last year's results [LIST] into different groups. Show the draw, explain how each rule was respected, then produce the group codes (A1, A2, B1...) in a table I can paste into the workbook. If you will run the draw publicly, write a short script for announcing it live.

## Prompt 7: Technical meeting pack
Using the tournament context and the attached schedule, write the technical meeting pack for team officials: format and tiebreakers, game duration and timeouts, roster and eligibility rules, jersey color rules for clashes, protest procedure, medical protocol, venue rules, and contacts on the day. Produce it as an 8 to 10 slide outline with speaker notes, plus a one page summary to email to teams before the meeting.


# M2 Registration and Payments

What it solves: knowing at any moment which teams are in, who has paid, and who needs a reminder, without rereading email threads.
Levels: all (Level 3 adds a scheduled weekly check). Works in: file upload for prompts 2 and 3; agent with email access for prompt 4.
Typical time: 2 h to set up, then 15 minutes a week.

## Lesson from CalCup
Rosters arrived at the end of December and too many payment follow ups were needed. Fixed deadlines that reopen the slot if unpaid work better than repeated reminders.

A single flat fee with a single deadline gives a team no reason to decide early, so most of them decide late and the deadline moves. CalCup 2027 ran one price of $850 with an October 15 deadline, reached seven confirmed teams by that date and had to extend. Price the deadline instead of only announcing it: an early rate, a standard rate and a late rate, published together from the first invitation. The gap between tiers has to be large enough to be worth a club meeting, and small enough that a late team still enters. Roughly 5 to 10 percent per step works. Tiers also give the organiser something to say in every follow up that is new information rather than another reminder, and they pull deposits forward, which matters when the format depends on how many teams have paid.

## Prompt 1: Registration tracker design
Design a registration tracker as one table. One row per team. Columns: Club, Team name, Division, Contact name, Contact email, Status (Invited, Interested, Confirmed, Withdrawn), Fee due, Amount paid, Payment date, Payment method, Balance (formula), Roster received (Y/N), Notes. Give me the column list, the formulas, and conditional formatting rules that highlight unpaid balances after [DEADLINE].

## Prompt 2: Payment reconciliation
Attached are our tracker and an export of payments received from [BANK OR PAYMENT APP] for [PERIOD]. Match each payment to a team using the payer name, amount and memo. Produce three lists: matched (with the tracker row), unmatched payments, and teams with an open balance. Do not change the tracker; propose the updates and wait for my approval. Flag any match you are less than sure about.

## Prompt 3: Deadline status
From the attached tracker, list every team that is past a deadline (payment, roster) as of [DATE], with the amount or item missing and the date of the last reminder in the notes.

## Prompt 4: Weekly check (Level 3, agent with email access)
Every [DAY] at [TIME], search my inbox for registration and payment messages since the last check, update the tracker, and draft (do not send) a reminder for each team past a deadline. Give me a short summary: new confirmations, new payments, open balances, drafts waiting for review.

## Prompt 5: Eligibility and rosters
Write the roster and eligibility rules for our tournament: membership in [FEDERATION] required for every player, roster limit of [N] players and [N] officials, deadline [DATE], how late changes are handled. Then draft the roster template columns (number, first name, last name, position, membership ID, date of birth only if the rules require it) and a reminder email for teams with missing or incomplete rosters.

## Prompt 6: Invitation letter for international teams
Draft an official invitation letter for [TEAM, COUNTRY] to attend our tournament on [DATES] at [VENUE], signed by [NAME, ROLE] of [HOST CLUB]. Include the purpose of the trip, dates, the fact that participants cover their own travel and lodging unless stated otherwise, and the contact for verification. Keep it factual: embassies read these letters to confirm that the event exists.

## Prompt 7: Tiered entry pricing
Our entry fee is [AMOUNT] per team and our event is on [DATES]. Build a three tier price schedule that rewards early entry: an early rate closing [EARLY DEADLINE], a standard rate closing [STANDARD DEADLINE], and a late rate after that. Propose the three amounts and the two cut off dates, keeping the standard rate at our current fee so we are not raising prices overall. For each tier give the deposit due at confirmation and the balance due date. Then tell me what each tier is worth to us if [N] teams enter: total entry income per scenario, and how many teams would have to move from late to early for the schedule to pay for itself. Finish with the four lines of copy we put on the invitation, the website and each follow up, stating all three tiers together so a club can see what waiting costs.

## Prompt 8: Tier deadline enforcement
We published the tier schedule from prompt 7. A team has asked to pay the early rate after the early deadline. Draft a reply that holds the published price without losing the team, and give me the one rule we apply to every similar request so the schedule stays credible. Then list the three cases where an exception is worth making, and the wording that frames each one as an exception rather than a new price.


# M3 Communication and Local Media

What it solves: writing each message once, sending it on a fixed calendar, and getting local coverage and spectators.
Levels: all. Works in: any chat AI (prompts 1 to 5); web search needed for prompts 6 and 7.
Typical time: 3 to 5 h to build the calendar and templates; each later message takes minutes.

## Lessons from CalCup
* A fixed communication calendar with templates replaced messages written from scratch each cycle.
* Designed emails with images must be tested by sending to yourself and opening the received email. Draft previews do not show what recipients get.
* WhatsApp works better than email for players; email remains the record for captains and payments.
* Past participants are not the whole market. When entries were slow, CalCup built a prospect list from the national federation's public club directory, added the nearest airport for each club, and sent a late invitation that showed the teams already registered and how many more entries would change the format.

## Part A: Teams and participants

### Prompt 1: Communication calendar
Build a communication calendar from today to the tournament and one week after. Columns: Date, Message, Audience (all past participants, invited clubs, confirmed teams, referees, volunteers, schools, media), Channel (email, WhatsApp, Instagram), Owner, Status. Include: save the date, invitation, registration reminders, deposit deadline, welcome pack, roster reminder, final payment deadline, volunteer briefing, pre tournament info pack, thank you and results.

### Prompt 2: Invitation
Write the team invitation email. Include: dates, venue, format, fee and deadlines, membership requirement, how to register, accommodation suggestion [HOTEL], and one paragraph on what makes this tournament worth the trip [YOUR REASONS]. Keep it under 250 words. Then write a WhatsApp version under 80 words.

### Prompt 3: Reminder sequence
Write three registration reminders for clubs that have not answered: the first friendly and short, the second with the deadline and the number of slots left, the third a final notice that the slot will be offered to another club. Each under 120 words. No pressure tactics or exaggeration.

### Prompt 4: Pre tournament info pack
Write the info pack for confirmed teams: schedule link, arrival and check in, parking, locker rooms, game sheet and roster rules, protest procedure, medical contacts, food options near the venue, and who to call on the day. Format it as a one page document with headings.

### Prompt 5: Post event message
Write a thank you message to teams, referees and volunteers with the final results [PASTE RESULTS], the award winners, a link to photos, and a request for feedback through [FORM LINK].

### Prompt 5b: Prospect list from the federation club directory
From the public club directory of [NATIONAL FEDERATION] (I will paste it or give the link), build a prospect table: club name, club type (adult, youth, college), city, state, website or social page, nearest major airport, rough travel time or flight time to [VENUE CITY], already invited (yes or no), and notes. Remove clubs that are not eligible for our tournament [ELIGIBILITY RULES]. Sort by travel time. Then write a short late invitation for the clubs not yet contacted that states the entry deadline, the teams registered so far, and how many more confirmed entries in each division change the format. Use only public information and do not guess contact emails.

## Part B: Local media

### Prompt 6: Find local media
Search the web for media that could cover a handball tournament in [CITY, COUNTY]. Include: local newspapers and their sports or community editors, local TV and radio stations with a community or sports segment, community event calendars that accept submissions, local news sites and newsletters, college newspapers and journalism programs within [DISTANCE] miles, and local sports bloggers or podcasters. For each, give the outlet, the relevant section or person if publicly listed, how they accept story ideas (email, form, calendar submission), and the public link. Do not guess email addresses; write "via form" when no address is published. Present the result as a table I can paste into a tracker.

### Prompt 7: Story angles
Based on our tournament context, propose five story angles a local editor would find newsworthy, for example local athletes, an international team, a youth or school component, the history of the event, the Olympic connection of handball in the US. For each, say which type of outlet fits and what photo opportunity goes with it.

### Prompt 8: Pitch email
Write a pitch email to [OUTLET, PERSON] using angle [ANGLE]. Under 150 words, subject line included, with the date, the venue, the free entry if applicable, a contact person available on the day, and an offer of photos. No superlatives.

### Prompt 9: Calendar listing and press note
Write a 50 word event listing for community calendars and a 300 word press note with a headline, the key facts in the first paragraph, one quote from [NAME, ROLE], and a short paragraph about the host club.

### Prompt 10: Media tracker
Create a media tracker with columns: Outlet, Type, Contact or submission route, Angle, Date contacted, Follow up date, Status (Not contacted, Pitched, Interested, Covered, Declined), Coverage link. Add a rule to follow up once, 7 days after the first contact, and stop after that.

## Part C: Schools and youth (optional)
Search for schools and youth clubs within [DISTANCE] miles of [VENUE]. Return name, type, address, and a public contact route (athletics department, PE department, main office). Then draft a short note to a PE teacher inviting their students to watch, with the free entry, the schedule highlights and a poster attached.

## Part D: Social media and designed emails

### Prompt 11: Social media calendar
Build a social media calendar for Instagram and [OTHER CHANNELS] from today to one week after the tournament: registration open, team announcements (one post per confirmed team), sponsor thank you posts, behind the scenes, schedule release, day by day results, award winners, and the thank you post. For each: date, format (post, story, reel), caption draft, visual needed (see the visuals module), and who posts it.

### Prompt 12: Team announcement posts
For each confirmed team in this list [TEAMS WITH CITY AND A FACT ABOUT EACH], write a short Instagram caption announcing that the team is coming, with one sentence about the team and the tournament hashtag [HASHTAG]. Factual, warm, no superlatives.

### Tip: designed emails with images
If you send designed emails with images, host the images on your website and send a test to yourself first. Draft previews in email tools often hide images or strip them, so only the received email tells you what recipients will see.


# M4 Visuals

What it solves: consistent, good looking material (social posts, posters, match cards, stream thumbnails, signage) without a designer for every item.
Levels: all; Level 2 and 3 add generator scripts. Works in: image generation (ChatGPT, Gemini, Adobe Firefly, Artlist or similar) for prompts 2 to 4; code capable AI for prompt 5.
Typical time: 2 h to set the visual system, then 10 to 20 minutes per item.

## Lessons from CalCup
* Lock a visual spec once (colors, font, logo placement) and repeat it word for word in every prompt. Results drift when the spec is paraphrased.
* Image generators misspell text. Generate the background and layout, then add exact text, dates and logos in a design tool or with a script.
* When editing a photo of a real person, say explicitly that the face and body must not change. Otherwise the tool "improves" them.
* Keep the lower right corner of video thumbnails empty; the platform places the duration there.

## Prompt 1: Visual spec
Write a one page visual spec for our tournament: primary color [HEX], accent [HEX], neutral [HEX], one display font and one text font (free fonts only), logo placement rules, photo style, and three do and don't examples. I will paste this spec into every image prompt.

## Prompt 2: Social post background (image generator)
[PASTE VISUAL SPEC]. Create a 1080x1350 background for an Instagram post announcing [EVENT OR NEWS]. Indoor handball court atmosphere, abstract court lines, no players, no text, no logos. Leave the top third clear for a headline and the bottom 15% clear for dates and sponsor logos.

## Prompt 3: Stream thumbnail (image generator)
[PASTE VISUAL SPEC]. Create a 1920x1080 sports broadcast title card for day [N] of [TOURNAMENT]. Abstract court graphic in the lower third, light streaks in the accent color, no players. Leave the center clear for the title, keep the top left clear for the logo and the lower right corner empty.

## Prompt 4: Real person, background only (image editor)
Edit the attached photo. Keep the person exactly as they are: same face, features, skin tone, expression, hair and clothing. Do not retouch or reshape anything. The only change is to replace the background with an evenly lit light grey studio backdrop. Keep it photorealistic, with natural edges around the hair. Head and shoulders framing with space above the head for a circular crop.

## Prompt 5: Match card generator (code capable AI, Level 2 and 3)
Write a Python script that reads a CSV with columns Game, Day, Time, Court, Team A, Team B, Logo A, Logo B and produces one 1080x1350 PNG per game: background color [HEX], both logos, team names in [FONT], time and court in the accent color, our logo at the bottom. Use Pillow, load fonts from a fonts folder, and write the files to an out folder named by game number. Include instructions to run it.

## Prompt 6: Poster with QR code
Write a script (or step by step design instructions) for an 11x17 inch poster: headline [TEXT], dates, venue, "free entry" line, a QR code pointing to [URL], and our logos. Export a print PDF with 0.125 inch bleed and a JPG preview.

## Printing notes
* Roll up banner: 33x80 inch is a common size; keep the top inch and bottom 3 inches free of content (bar and base).
* Feather flag: vendors supply their own template; send artwork without dates so it can be reused every year.


# M5 Results Website

What it solves: one link (and one QR code in the gym) where players and families find the schedule, results, standings, scorers and visitor information.
Levels: 2 and 3. Works in: code capable AI; Level 3 needs an agent that can operate git.
Typical time: 20 to 30 h for Level 2 the first year; Level 3 adds automation and more upkeep.
Status: the website starter is in the downloads. It was built and tested end to end with mock data (workbook, converter, site, update after a new result) and has not yet been used in a live tournament. Since October 21, 2026 it also includes the referee rules quiz and flashcards (IHF Catalogue 2025) and secured MVP and MVG voting, both tested with mock data and running on the CalCup 2027 site.

## How it works at CalCup
* The master workbook is the only place where results are typed.
* The site reads a data file generated from the workbook. At Level 3 a scheduled job regenerates that file every few minutes and the host redeploys automatically.
* Results are posted after each game. The site is not live scoring; a video stream is embedded for people who want to watch.

## Lessons from CalCup
* Keep one source of truth. Never edit the website data by hand while the workbook is also being updated.
* Keep the site folder out of synced folders (OneDrive, Dropbox, Google Drive). Sync tools corrupt git repositories.
* A strict validation step (for example "exactly 13 teams") will block updates when the real world changes. Make checks warn rather than fail.
* MVP and MVG voting is the one award task the website does much better than paper. Each head coach (Official A) and each referee receives a personal signed link, votes once from a phone, and the server checks eligibility (no vote for one's own team, goalkeepers only on the MVG ballot) and counts the points. Results are ready the moment voting closes, which matters when the ceremony starts minutes after the last final. It needs the site to run Netlify Functions, so deploy from GitHub (Level 3) or with the Netlify CLI; a drag and drop upload does not run them.
* Content written by hand (club news, announcements) must live outside the generated data file. CalCup keeps a short news list in the site script, newest first, because the data file is overwritten every time it is regenerated from the workbook.

## Prompt 1: Site plan
Using our tournament context, propose a simple static website: pages, what each shows, and the data each needs. Required: home, schedule, standings, top scorers, teams, visitor info, watch live. Mobile first. No login, no database. All data from one data file.

## Prompt 2: Build the starter
Build that site as plain HTML, CSS and JavaScript with no framework. All tournament data in one file data.js (teams, games with scores, players with goals per game). Schedule, standings and scorers are calculated in the browser from that file. Use our visual spec [PASTE]. Give me the full file list and a short guide to publish it on Netlify by drag and drop.

## Prompt 3: Workbook to data file
Write a script that reads our workbook [FILE, TAB NAMES, HEADER ROWS] and writes data.js in the format the site expects. It must stop with a clear message if a team name in the games tab does not exist in the teams tab.

## Prompt 4: Game sheet to workbook (photo)
Attached is a photo of a completed game sheet. Read both team names, the final score and each player's goals. Find the matching game in the workbook. Propose the entries in a table and flag any difference between the sum of player goals and the final score. Do not write to the file until I approve.

## Prompt 6: Set up MVP and MVG voting
I use the toolkit website starter with its voting module (vote.html, vote-admin.html, netlify/functions/vote.mjs; see the README section "MVP and MVG voting"). Help me set it up for [TOURNAMENT]. First check our Rosters Master: every team has one Official A with a name, and every goalkeeper has Position GK; list what is missing. Then walk me through adding VOTE_ADMIN_TOKEN in Netlify and testing the vote with a new round afterwards. From the ballot links CSV I download from the admin page, prepare one short email per voter with their personal link, the awards, the point system (3, 2, 1, no vote for one's own team) and the closing time [TIME]. Save them as drafts for me to review; do not send anything.

## Prompt 5: QR code
Generate a QR code for [URL] as a high resolution PNG and SVG, and a one page A4 and letter sign: "Schedule and results" above the code, the URL in text below it.


# M6 Referees and Volunteers

What it solves: enough referees without burning them out, and a volunteer roster that covers every table and every shift.
Levels: all. Works in: any chat AI; file upload for assignment prompts.
Typical time: 2 to 4 h to set up.

## Lessons from CalCup
* Volunteers were the main structural weakness. Assign owners by area well before the event, not on the day.
* Referee travel windows (for example no departure before late Sunday afternoon) must be in writing early; schedules should not be changed for flights.
* Local player referees create conflicts of interest in scheduling; track them explicitly.
* Do not rely on volunteers for referee transport; budget a rental car.
* Coordinate with your national referee committee early; late coordination created avoidable work. For a sanctioned event, expect the committee to want a say in nominations, and expect pushback if you bring referees from abroad who are not clearly above the level available at home.
* Do not assume a central contact exists. For several weeks in fall 2026 CalCup had no national referee committee contact while the role changed hands, and there is no shared bank of referee contacts in the US. Each organizer has to source pairs through their own network, returning referees and neighboring regions. Keep your own referee contact list (name, level, home city, availability, past events) in the workbook Referees tab, and update it after every event so next year starts from it.
* A mix worked for CalCup: one top international pair plus regional pairs, starting with returning pairs who know the event.
* Ask referees to book flights as soon as they confirm. Fares rise as the dates get closer, and flights are usually the largest referee cost. Ask them not to book a return flight before the finals end.
* Put the package in writing before anyone books, so every pair gets the same terms. What CalCup covers per pair: 2 hotel nights with one room per pair; a food stipend of $55 per referee per day; one compact rental car per pair, used on site and for the drive to the airport on the last day; a standard rideshare (UberX) from each referee's home to their departure airport. State what is not covered (extra nights, upgrades, a second car) and how expenses are claimed and paid.
* Celebrate your own referees in public (a club news item and a social post when one gets a major appointment) and point readers to your referee quiz and a contact. It costs little and is a recruitment channel.
* Do not write your own rules questions. CalCup first used questions written in house, and a national level referee found errors in them. The quiz and flashcards now use only the official IHF Catalogue of Rules Questions (2025 edition) with its official answer key, and every explanation cites the catalogue number and the rule. Referees trust a source they already study from.
* If you attach a prize to a quiz leaderboard, decide first how scores are verified. A page that sends its own score to the server can be faked, and one person can post under many names. CalCup paused its prize board in October 2026 to add email verification, server side scoring and a rule that certified referees cannot win. Not yet built or tested.

## Prompt 1: Referee needs
From our schedule, calculate how many referee pairs we need so that no pair works more than [N] games a day or [N] games in total, with at least one game of rest between two assignments. Show the result for 4, 5 and 6 pairs.

## Prompt 2: Referee assignment
Attached are the schedule and a list of referee pairs with their availability, home club and travel times. Assign a pair to every game. Rules: no pair referees a team from its own club, workload balanced within one game, travel windows respected, finals to the pairs I mark as "finals". List any game you could not assign and why.

## Prompt 3: Referee recruitment message
Write a short message to recruit referees for our tournament: dates, number of games, what we cover (hotel, meals, travel, fee), the level of play, and how to apply. Under 150 words, plus a version for WhatsApp.

## Prompt 4: Volunteer roles and shifts
List the volunteer roles a [N] court handball tournament needs (scorekeeper, timekeeper, check in, concessions, setup, teardown, first aid liaison, photographer, social media). For each, the number of people per shift, shift length and a three line job description. Then build a shift grid for [DAYS] with empty name cells.

## Prompt 5: Table crew briefing
Write a one page briefing for scorekeepers and timekeepers: game sheet fields, timeouts, suspensions, end of game signatures, what to do with the completed sheet, and who to call when there is a dispute.

## Checklist: medical
* Confirm a physiotherapist or athletic trainer for all playing hours.
* Have a concussion protocol and the form ready at the table.
* Post the nearest emergency room address at every court.

## Prompt 6: Referee rules quiz (Level 2 and 3)
Build a single page web quiz on handball rules for referee recruitment and training. Use only questions from the official IHF Catalogue of Rules Questions, current edition, which I will provide as a file: keep the question text, options and official answer key unchanged, and do not write or reword any question. Each round draws 15 questions with at most one per rule, so a round covers 15 rules. Include questions with more than one correct option as "select all that apply", scored all or nothing, and cap them at [N] per round. Set the time per question from its length (for example 4 words a second plus 2 seconds per option on select all questions, between 15 and 45 seconds). After each answer, show every correct option, the catalogue question number and the rule references. Count only decision time (from question shown to answer submitted) so reading the explanation is not penalized, and end with a final score. Then build a flashcard page from the full catalogue, grouped by rule.

Ready made: the website starter in the downloads now includes this quiz with all 408 questions of the 2025 Catalogue that suit a timed round, the 430 question flashcards and the leaderboard, credited to the IHF. Use the prompt only if you build your own version or need a new edition of the Catalogue.

## Prompt 7: Referee partnership request
Draft a request to [NATIONAL OR REGIONAL REFEREE COMMITTEE] asking for support with referee assignments for our tournament on [DATES]: number of games, number of pairs needed, what we cover (travel, lodging, meals, fees), and the deadline to confirm. Ask whether the tournament can count toward referee development or evaluation. Short, formal, factual.

## Prompt 8: Referee offer and travel package
Draft the written offer we send to each confirmed referee pair for [TOURNAMENT, DATES, CITY]. Include: games expected per day, arrival and departure windows (no return flight before [TIME] on the last day), flights (who books, fare limit, book within [N] days of confirming), hotel ([N] nights, one room per pair), food stipend ([AMOUNT] per referee per day), local transport ([CAR TYPE], one car per pair, also used to return to the airport, plus a rideshare from home to the departure airport), fee if any, what is not covered, and how expenses are claimed and paid. Then build a one page cost table per pair and in total for [N] pairs, with flights as an input I fill in.

## International referees (for example a European pair)
A top international pair raises the level of the event and gives teams a reason to come. It also costs more and takes longer to secure than a regional pair.

When to start: at least six months before the event. January and February clash with the international calendar (world and continental championships, national league games), and referees at the top level are often committed elsewhere. CalCup lost a confirmed pair to a championship in the same window, so keep a second option open until flights are booked.

Who to target: referees from a first or second national division. If your national referee committee is involved, expect it to object to foreign referees who are not clearly above the level available at home; aim high enough that the choice is easy to defend.

Clearance comes first: elite referees (first or second division) need clearance from their national referee commission before they can officiate abroad. Contact that commission at the start, before or at the same time as any approach to individual referees. It can recommend available pairs, speed up the approval and coordinate with the referees' calendar. Going around it creates friction: a commission that learns about the invitation from the referees may delay or refuse the clearance, and the relationship matters for future editions.

How to reach out, in order:
* The national referee commission of the country you are targeting: a short formal request for clearance and, if they are open to it, a recommendation of a pair.
* Your own network: club members, coaches and players with ties to a European federation or club, who can introduce you to the commission or to referees.
* Pairs who have refereed your event before, and the referees they recommend, always copying or informing their commission.
* A regional referee association, as a complement.

Share a one page visual pitch with every contact. A single slide with the dates, the city, the level of play, the number of games and what you cover saves long explanations, and the commission can forward it to its referees as is.

How to pitch it: the level and format of play (number of teams, international clubs, games per day); the experience (a well organized event, a full schedule of meaningful games, finals); what you cover; the dates and the time commitment; and the visibility (streamed games, a written evaluation or thank you letter they can use in their file). Keep it short, factual and specific.

What to ask for: current division and international grade; availability for all days including travel; home airport and an indicative economy fare; whether their clearance request is already with their national referee commission; whether they hold an ESTA or a visa; dietary needs; and a reply date.

What changes in the package: add one extra hotel night (3 nights instead of 2) to absorb the long flight and the time difference. Flights are economy, booked as soon as the pair confirms. Check entry requirements early: a travel authorization may not cover paid work, so confirm with the referees whether a fee or only expenses applies, and provide an invitation letter on club letterhead if they need one.

Extra days: invite the referees to add a few days before or after the event to enjoy the host city, at their own cost: you pay the fare for the event dates, and any fare difference and the extra nights are theirs. It makes the invitation more attractive at no cost to the budget. Send a short guide of things to see and do nearby with the offer.

## Prompt 9: International referee outreach
Write a short, formal message to [REFEREE DEPARTMENT, ASSOCIATION OR REFEREE] inviting a [DIVISION] referee pair to our tournament [NAME, DATES, CITY, COUNTRY]. Include: the level and format of play, number of games per day, what we cover ([N] hotel nights, one room per pair, [AMOUNT] food stipend per person per day, economy flights, rental car, transfer to the airport), and that we provide an invitation letter. Ask for: current division and international grade, availability including travel days, home airport, whether their clearance from their national referee commission is in place or requested, entry documents held, and a reply by [DATE]. Under 200 words. Then give me a version in [LANGUAGE].

## Prompt 10: Referee pipeline tracker
Build a simple tracker for referee sourcing with one row per pair: source (network, returning, federation, association), level, home city or country, date contacted, status (contacted, interested, confirmed, declined), reason if declined, flights booked (yes or no), estimated cost, and next action with a date. Add a summary of pairs confirmed against pairs needed, and flag any confirmed pair without flights booked after [N] days.

## Prompt 11: Referee clearance request
I want to invite a [DIVISION] referee pair from [COUNTRY] to officiate at our tournament [NAME, DATES, CITY]. First, tell me which body grants clearance for that country's referees to officiate abroad (usually the national referee commission of the national federation), how to find its current official contact on the federation's website, and whether the continental federation also needs to be informed. Do not guess an email address; tell me where to verify it. Then draft a short formal request to that commission: who we are, the event and its level, the number of games, what we cover, and our request for clearance for a named pair or, if they prefer, a recommendation of an available pair. Ask about their process and lead time. Under 200 words, with a version in [LANGUAGE].

## Prompt 12: One page referee pitch slide
Using our tournament context [PASTE] and visual spec [PASTE], design one slide (16:9, also exportable as PDF and image) that a referee commission can forward to its referees. Content: event name and edition, dates, city and venue, level and format (teams, international clubs, games per day, finals), what we cover (flights, hotel nights, food stipend, rental car, airport transfer), the option to extend the stay at their own cost, and one contact. Large, readable text, no paragraphs, logo and one photo.

## Prompt 13: Local guide for visiting referees
Write a one page guide for visiting referees who extend their stay around [CITY] for [N] days in [MONTH]: 8 to 10 things to see or do within [DISTANCE] of the venue (landmarks, nature, food, a sports experience), each with one line on why it is worth it, rough time needed and rough cost. Add two day trip ideas, practical tips (transport, weather that month, tipping) and a note that suggestions should be checked for opening days and hours before going.


# M7 Merch and Concessions

What it solves: selling commemorative merch and running a concession stand without losing money or ending up with unsold stock.
Levels: all; Level 3 adds online preorders with payment tracking. Works in: any chat AI; file upload for the cost model; image generation for mockups.
Typical time: 4 to 8 h for merch (design, quotes, preorder); 2 h for concessions.

## Lessons from CalCup
* Sell merch on preorder with a firm close date, then order the exact quantity plus a small buffer. Unsold stock is where merch loses money.
* Build the cost model per unit (blank, decoration, freight, delivery buffer) plus one time setup fees, and price from it.
* Ask vendors for a written quote with unit price by quantity break, setup fees, proof process, production time and shipping date. Get the in hand date in writing.
* Mockups from image generators are good enough to sell a preorder; the production file for embroidery or print is a separate, exact vector file.
* Bundles (hoodie plus hat, food plus drink) raise the average sale at concessions.
* Custom cut and sew items (made in your colors, not printed on a stock blank) come with a factory minimum order quantity. Ask for it in the quote, set it as the preorder target, and say in the announcement that the item is produced only if the minimum is reached. Stock items with printing or embroidery usually have low minimums and are the safer choice when demand is uncertain.
* Preorders come in slowly and late. CalCup reached about a quarter of its 50 unit minimum after several weeks and had to extend the close date and run a second push to teams and alumni. Set the first close date early enough that one extension still meets the vendor's production deadline, and show progress against the target (for example "14 of 50") in every reminder.
* Get a physical sample before opening preorders and publish the sizing on the order page. The CalCup sample ran one full size large, which led to a "order one size down" notice, a size chart and a confirmation message to every buyer who had already ordered.
* Ask buyers to put their name and the item in the payment memo. Payments are reconciled by hand, and a generic memo cannot be matched to an order.

## Prompt 1: Cost model
Build a merch cost model in a spreadsheet. Inputs per item: blank cost, decoration cost, inbound freight, delivery buffer, retail price. One time costs: setup and proofs. Outputs: unit cost, unit margin, break even quantity, and total profit at [N1], [N2], [N3] units sold. Include a bundle line. Show the formulas.

## Prompt 2: Vendor request for quote
Write a request for quote to apparel vendors for [ITEMS, QUANTITY RANGE, DECORATION]. Ask for: price by quantity break, setup fees, proof process, production time, shipping cost, in hand date to [ADDRESS] by [DATE], payment terms. Attach the design brief. Keep it under 200 words.

## Prompt 3: Mockups (image generator)
[PASTE VISUAL SPEC]. Create a ghost mannequin product photo of a [COLOR] hoodie with a small embroidered logo on the left chest, white background, studio lighting, front view. No text other than the logo.

## Prompt 4: Preorder announcement
Write a preorder announcement for email and WhatsApp: items, prices, sizes, close date, pickup at the tournament, how to pay. Clear and short, no pressure language.

## Prompt 5: Preorder tracking
Attached are our order form export and our payment export. Match orders to payments, list unpaid orders, and give me the total quantity by item and size for the vendor order. Do not send reminders; draft them for review.

## Prompt 6: Concession plan
Propose a concession menu for a three day handball tournament with about [N] players and [N] spectators a day: items, unit cost, price, and three bundles. Include a stock estimate per day, a simple stand SOP (opening, cash and card handling, food safety, closing count) and a poster text for each bundle.

## Prompt 7: Production files for embroidery or print
Our merch design is [DESCRIPTION, COLORS WITH HEX OR PANTONE]. Write the production spec a vendor needs: placement and size in inches, number of thread colors, minimum line width for embroidery, file format (vector SVG or PDF), and what to check on the vendor's proof before approving. Then list the questions to ask the vendor about digitizing fees and proof rounds.

## Prompt 8: Prepaid cards and bundles at the stand
Propose a prepaid card system for the concession stand (for example a $25 card with a small bonus value) and three bundles, with the cash handling rules, how to track card balances simply, and the poster text for each offer.

## Prompt 9: Minimum order push
Our [ITEM] needs [MINIMUM] units for the factory to produce it, and we have [CURRENT] orders with [DAYS] days left before [CLOSE DATE]. Write a follow up for email and a shorter version for WhatsApp: why the minimum exists, the progress so far, prices, the sizing advice, how to order and pay (name and item in the payment memo), and what happens if the minimum is not reached. Factual and short, no guilt or pressure language. Add one line asking readers to forward it to former players.


# M8 Livestream and Highlights

What it solves: letting families and clubs watch remotely, and turning hours of video into clips people actually share.
Levels: 0 and 1 use the checklist; Level 2 embeds the stream on the site; Level 3 automates clips and chapters.
Typical time: 2 to 4 h of setup and testing before the event.

## Checklist
* Test the venue internet upload speed on a weekday at the same hour as games. Plan for a mobile hotspot backup.
* One fixed wide camera per court is enough for remote viewers. Add a scoreboard overlay only if someone is assigned to update it.
* Create one stream per day per court in advance, with titles and thumbnails (see M4), so links can be shared before the event.
* Assign one person per day responsible for starting and stopping the stream.
* Check music rights: use licensed tracks or none at all on the stream. The audio identity module (M12) covers where to find licensed music and what to check.

## Prompt 1: Stream plan
Using our tournament context, write a streaming plan: platform, number of streams, camera positions, equipment list with approximate cost, internet requirements, roles, and a test schedule for the week before.

## Prompt 2: Chapters from the schedule
Here is our schedule with game start times and the stream start time for day [N]. Produce a list of video chapters in the format "HH:MM:SS Team A vs Team B (Division)" that I can paste into the video description.

## Prompt 3: Highlight shot list
Write a shot list for a 60 second highlight video of the tournament: opening, best goals, saves, crowd, award ceremony, closing card. Note what to capture during the event so the edit takes under an hour.

## Level 3 note
CalCup is building a tool that cuts the daily stream into per game clips and chapters automatically. It will be described here once it has run on a full tournament.


# M9 Committee and Review

What it solves: getting decisions from a committee or board on time, keeping everyone on the same status, and learning from each edition.
Levels: all. Works in: any chat AI; file upload for the review prompt.
Typical time: 2 h per decision pack; 2 h for the post event review.

## Lessons from CalCup
* Put the single most important decision (usually the format) at the start of the board pack and send a short pre read before the meeting.
* Write the post event review within two weeks, area by area, while memory is fresh. It becomes next year's plan.
* Keep one place that says where every file lives and which version is the master.
* Collect inventory needs (equipment, medical, concessions, merch) from each owner by a fixed date, then make one consolidated purchase list.

## Prompt 1: Decision pack
Write a short decision pack for our committee on [DECISION]. Structure: the decision needed and by when, background in five lines, two or three options with cost, risk and impact on teams, the recommendation, and what happens next. Maximum three pages or six slides.

## Prompt 2: Budget
Build a tournament budget in a spreadsheet. Revenue: entry fees, merch margin, concessions, sponsors, donations. Costs: venue, referees (fees, travel, hotel, meals), medical, trophies and awards, equipment, printing and signage, streaming, insurance, contingency of [N]%. Show the break even number of teams and a low, base and high case.

## Prompt 3: Status update
From these notes [PASTE], write a weekly status update for the committee: what was done, what is late, decisions needed, next week. Under 200 words.

## Prompt 4: Post event review
Write a post event review from the attached notes and feedback. For each area (governance, format and schedule, refereeing, registration, volunteers, facilities, communication, finance, merch and concessions, media): overall status in one line, what worked, issues and risks, and actions for next year with an owner. End with the top five changes for the next edition.

## Prompt 5: Inventory checklist
Create an inventory checklist template with columns: Item, Category, Owner, Quantity on hand, Quantity needed, To buy, Estimated cost, Where stored, Due date. Prefill typical items for a handball tournament (balls, pinnies, game sheets, timeout cards, first aid, tape, scoreboards, table and chairs, signage, concession supplies).

## Prompt 6: Handover document
Write a handover document for the next tournament organizer: where every file lives, what each workbook tab does, the yearly timeline with deadlines, key contacts by role (not by name, so it stays valid), the recurring vendors and venue terms, the lessons from the last post event review, and the first ten things to do. Then list the questions a newcomer is likely to ask and answer them from the attached files.


# M10 Sponsors, Donors and Alumni

What it solves: funding the tournament beyond entry fees, by finding the right people to ask and giving each of them a reason to say yes.
Levels: all. Works in: any chat AI; web search for prompts 1 and 2; file upload for the tracker.
Typical time: 3 to 5 h to build the list and the pitch; then 15 minutes per contact.

## Lessons from CalCup
* Alumni and families of past players are the warmest audience. A personal note from someone they know works better than a general appeal.
* Sponsors respond to visibility they can see: logo placement on the website, posters and live stream, posts thanking them, and a short report after the event with numbers (teams, spectators, views).
* Decide the sponsor tiers and what each one gets before contacting anyone, so every conversation offers the same package.
* Keep one tracker for every contact, with the date of the last message and the next step. Follow up once, then stop.

## Prompt 1: Find local sponsors
Search the web for businesses near [CITY, VENUE] that are likely to sponsor a youth friendly sports event: sports stores, physical therapy and sports medicine clinics, restaurants and food businesses near the venue, hotels where teams will stay, local banks and credit unions, car dealerships, and companies whose employees or founders have a link to handball or to our club. For each, give the business name, why it fits, the public contact route (community or marketing contact, general email, form), and the link. Do not invent email addresses.

## Prompt 2: Find the right person
For [COMPANY], identify from public sources (company website, press releases, LinkedIn public pages) who decides on local sponsorships or community giving: marketing manager, community relations, store manager, owner. Give the role, the name if publicly listed, and the best way to reach them. Say when you are not sure.

## Prompt 3: Sponsor tiers
Propose three sponsor tiers for our tournament (for example $250, $750, $2,000) based on what we can offer: logo on the website and posters, banner at the venue, mention during the live stream, social media posts, booth space, tickets or merch for their staff, and a short post event report. Put it in a table with what each tier receives, and keep the offer realistic for an event of [N] teams and [N] spectators.

## Prompt 4: Sponsor pitch
Write a one page sponsor pitch and a short email to [COMPANY, PERSON]: who we are, the tournament facts (dates, teams, where they travel from, spectators, live stream audience), the tiers, and why their business fits. Under 200 words for the email; factual, no exaggeration. Then write the follow up email for 7 days later.

## Prompt 5: Alumni and families list
From the attached past rosters and contact lists, build a list of alumni and families to contact: name, years played, last known contact, relationship to current members, and who in the club knows them best. Flag missing or outdated contacts. Do not include anyone who asked not to be contacted.

## Prompt 6: Alumni message
Write a message to former players and families inviting them to support this year's tournament through a donation, a sponsorship introduction, volunteering or simply coming to watch. Mention the anniversary or milestone if there is one [DETAIL], what the money funds (referees, venue, youth program), and how to give [METHOD]. Write one version for email and one shorter version for WhatsApp, in the voice of [NAME, ROLE].

## Prompt 7: Thank you and recognition
Write thank you messages for sponsors and donors after the event, with the results, a photo suggestion, and the numbers they care about (teams, spectators, stream views, posts). Then draft the sponsor report as a one page summary that makes renewal next year an easy decision.

## Prompt 8: Funding tracker
Create a tracker with columns: Name, Organization, Type (sponsor, donor, alumni, in kind), Tier or amount asked, Contact route, Owner, Date contacted, Follow up date, Status (to contact, contacted, interested, committed, paid, declined), Amount received, Recognition delivered (Y/N), Notes.


# M11 Venue, Compliance and Awards

What it solves: the practical foundations (venue, sanctioning, insurance, safety) and a closing ceremony that people remember.
Levels: all. Works in: any chat AI.
Typical time: 2 to 4 h, mostly early in the planning.

## Lessons from CalCup
* Book the venue and confirm the exact hours, floor setup and equipment in writing early; everything else depends on it.
* Sanctioning and membership requirements belong in the invitation, not in a reminder a week before the event.
* Awards named after people who built the event give the ceremony meaning and keep the history alive.
* Run the ceremony to a written timeline, before teams start leaving for their flights.
* Publish the voting rules for individual awards before the event (who votes, the point system, no vote for one's own team) and present them at the technical meeting. CalCup's rules: each head coach (Official A) and each referee votes; MVP for field players, MVG for goalkeepers; 1st, 2nd and 3rd choice worth 3, 2 and 1 points; ties broken on the number of 1st choices. If you have a website, the starter's voting module applies these rules and counts the votes (see M5); without one, the MVP Voting tab of the workbook does the count from paper ballots.

## Prompt 1: Venue request and checklist
Draft a venue rental request to [VENUE] for [DATES AND HOURS]: number of courts, goals and nets, scoreboards, tables and chairs, locker rooms, spectator seating, parking, food rules, setup and teardown windows, insurance certificate requirements, and cost. Then give me a checklist of what to confirm in writing before signing.

## Prompt 2: Sanctioning and insurance
List what we need to check with [FEDERATION] to sanction the tournament: application deadline, fees, membership requirements for players and officials, referee requirements, and results reporting. Then explain the insurance questions to ask (event liability, participant accident coverage, certificate for the venue) and who usually provides each. Mark anything that depends on our federation's current rules so I verify it.

## Prompt 3: Safety and medical plan
Write a one page safety plan: medical staff on site, concussion protocol, first aid kit contents, emergency contacts and the nearest emergency room, evacuation route, and who decides to stop a game. Format it to post at each court and to share with team officials.

## Prompt 4: Awards
Propose the awards for our tournament (champions, finalists, MVP, best goalkeeper, top scorer, fair play, volunteer of the year) with how each is decided: by results, by statistics, or by a vote of referees and team officials. Suggest names to honor people who built the event if we have them [NAMES AND STORIES]. Then write the voting instructions for the MVP and best goalkeeper ballots.

## Prompt 5: Trophy and medal order
Write a request for quote for [N] trophies and [N] medals: sizes, materials, engraving text for each, delivery date [DATE], and budget [AMOUNT]. Include a table of engraving texts for every award.

## Prompt 6: Ceremony run of show
Write a 20 minute run of show for the closing ceremony: timing, who speaks, award order, sponsor thanks, photo moments, and a short closing script for the announcer. Leave room for the results of the last game.


# M12 Audio Identity and Game Day Sound

What it solves: giving the tournament a recognizable sound in the gym and on the stream (intros, stingers, announcer voice, stream music) with every track properly licensed.
Levels: all; most useful from Level 2, when the event is streamed. Works in: any chat AI; web search for prompts 3 and 9; an AI music tool for prompt 7.
Typical time: 3 to 6 h to define the identity and source the assets; 1 h to set up the game day playlist.

## Lessons from CalCup
* Separate intro tracks for the men's and the women's teams, plus a few short stingers (a bugle call, a defense chant, a crowd prompt) gave the event a recognizable sound that people still mention.
* Sourcing music and sound effects from one licensed library meant the same tracks could be used in the gym, on the livestream and in highlight videos without copyright claims.
* Keep one folder with every audio file and its license certificate. When a platform flags a video, the certificate resolves it.
* Never play commercial radio songs while the stream is live. If in doubt, mute the stream audio during that moment.
* Streaming apps are not a source for the gym. Spotify, Apple Music and YouTube Music are licensed for personal listening only, so they cannot be played to a public crowd, even through DJ software such as Serato, and their tracks are the ones the stream's copyright check catches.
* The gym audio reaches the stream through the camera microphones. YouTube checks live streams in real time and can mute the audio, replace the picture or end the broadcast within seconds, with no review window. A few seconds of a commercial track are enough. YouTube's own Creator Music program does not cover live streams.
* A paid plan does not always mean clean files. In 2026 CalCup paid for Artlist but its downloads carried a spoken watermark, because the plan had no music tier. Clean music files on Artlist need a plan that includes music (Music Pro or Music and SFX Pro). Its license covers music inside your videos and streams; it does not by itself cover playing tracks over the gym speakers.
* Tracks for events average just over two minutes, so six to seven hours of game day music takes about 175 tracks, not 70 to 100. Plan blocks by moment of the day rather than one long list.

## What an audio identity usually includes
* Main theme (30 to 60 seconds) for openings, team introductions and the ceremony; one version per division if you want them distinct
* Team walk on music and short stingers (3 to 8 seconds) for goals, timeouts, suspensions, final minute and victory
* Crowd prompts and a defense chant
* Announcer voice: event intro, team introductions, sponsor reads, safety and housekeeping announcements
* Stream package: intro, outro, break music bed, highlight music
* Warm up playlist for the gym between games

## Where to find providers
* Subscription music libraries (music and sound effects, licenses cover social media and streaming on the right plan): Artlist, Epidemic Sound, Soundstripe, Musicbed
* Single track marketplaces (pay per track): Pond5, Envato (AudioJungle), PremiumBeat
* Free libraries (check the license of each track, attribution is sometimes required): YouTube Audio Library, Pixabay Music
* Custom composers and sound designers: SoundBetter, Fiverr, Upwork, AirGigs; local music schools and college audio programs are a good source for students looking for real projects
* Voice talent: Voices.com, Voice123, Fiverr, Backstage; also local radio or college radio announcers
* AI music generators (Suno, Udio): paid plans grant commercial use under their terms, which have changed several times; read the current terms and keep proof of your plan when you generate

## What to expect to pay (indicative, checked October 2026; verify before buying)
| Option | Typical cost | Notes |
|---|---|---|
| Free library tracks | $0 | Check each license; fine for warm up and stream breaks |
| StreamBeats albums (stream cleared) | $0 | Cleared for live streams, replays and clips; ask the label in writing about playing over the venue speakers |
| Music library subscription | About $10 to $17 a month on annual billing; more on monthly billing | Personal plans often exclude monetized channels and commercial use; for a club event with sponsors, the commercial or "unlimited" tier is the safer choice |
| Single track license | About $15 to $80 per track | Good when you only need a theme and a few stingers |
| Custom theme or jingle | About $150 to $1,500 | Depends on length, stems, revisions and ownership |
| Voice over pack (event intro, team intros, sponsor reads) | About $25 to $150 on marketplaces; $150 to $500 for professional talent with broadcast usage | Ask for separate files per line and a pronunciation check |
| Sound gear (powered speaker, small mixer, cables) | Often borrowed from the venue or a member; renting about $50 to $150 a day | Confirm what the venue provides before buying |

## Free music you can stream cleanly
What CalCup 2027 settled on after testing the options (prepared for January 2027, not yet used live):
* StreamBeats by Harris Heller: free, no credit required, and kept cleared on YouTube Content ID and Twitch by the label, so the stream is not muted and the clips you cut from it are not claimed. The license covers the live stream, the replay and clips. The catalog is mostly hip hop, electronic, lofi and rock in a modern produced sound, which fits warm ups and game breaks. Whole albums download as files from the label's Bandcamp page at $0 or from its public Google Drive.
* The CalCup game day list uses six full albums in six blocks, 175 tracks and 6 h 43 min in total: doors and setup (Bounce), team warm ups (Supreme), two game rotation blocks (Drop, Ignition), peak energy for the semifinals (Pulse), and finals and awards (Stage).
* One gap to close in writing: the StreamBeats license is written for streams and videos and does not say whether you may play the tracks over the venue speakers. Ask the label (licensing@streambeats.com) for a short written confirmation for a free amateur tournament. If they decline, Kevin MacLeod's library (Incompetech) allows live events with a credit.
* Play from downloaded files on a laptop, in an offline player or DJ software crates, never from a streaming app or the gym Wi Fi. Keep a backup copy on a phone.
* Run a private test stream with the playlist a few weeks before the event and check it for copyright claims. Do the same after any change to the list.
* If you want an exclusive theme or announcer voice on top, the paid options below apply; the free library covers the hours of background music.

## Licensing for the venue and the stream
* Streaming: confirm in writing that your plan covers live streams and monetized channels, and register your channel with the library when it offers channel clearance, so automated copyright systems do not flag the stream.
* Venue: playing music to a public audience can require a public performance license from a performing rights organization (ASCAP, BMI, SESAC, GMR). Many schools and venues already hold one; ask the venue. Some library tracks are licensed directly and are not registered with these organizations; ask your library which applies.
* Custom work: agree in writing whether you buy the rights outright or receive a license, which uses are covered (gym, stream, social media, future years), and that you receive the stems.

## Prompt 1: Define the audio identity
Using the tournament context, help me define an audio identity for the event. Ask me up to five questions first (the feeling we want in the gym, the audience, references we like, what we want to avoid, budget). Then write a one page audio brief: three adjectives, tempo range in BPM, instruments and genres, references (describe them, do not name copyrighted songs to copy), what to avoid, and how the men's and women's themes should differ, if at all. End with the list of assets we need and their durations.

## Prompt 2: Cue sheet for game day
From the attached schedule, build a cue sheet for the sound operator: for each moment (doors open, warm up, team introductions, kick off, goal, timeout, suspension, last minute, end of game, half time, sponsor reads, awards ceremony), the asset to play, its duration, the volume level, who triggers it and any rule (for example no music while the ball is in play). Format it as a one page table to print.

## Prompt 3: Find tracks in a library
I use [LIBRARY]. Based on our audio brief [PASTE], give me search keywords, filters (mood, genre, BPM, length, vocals or instrumental) and a shortlist method: five candidates for the main theme, five stingers, and a warm up playlist of 40 minutes. For each candidate I find, tell me what to check before using it (license tier, stream coverage, stems available).

## Prompt 4: Brief for a composer or sound designer
Write a brief to hire a composer for our tournament theme: background on the event, the audio brief [PASTE], deliverables (60 second theme, 15 and 30 second cuts, three stingers, loopable stream bed, separate stems), file formats (WAV 48 kHz 24 bit plus MP3), loudness target for streaming (about minus 14 LUFS integrated), timeline [DATES], budget [AMOUNT], and the rights we need (use in the gym, on streams and social media, in future editions). Ask for two or three samples of similar work and a fixed price quote.

## Prompt 5: Voice over script and brief
Write the voice over script for our announcer: event intro (20 seconds), one introduction line per team [TEAMS], three sponsor reads [SPONSORS AND KEY MESSAGES], safety and housekeeping announcements, and the closing ceremony lines. Add a pronunciation guide for every team and player name I list [NAMES], then write a short brief for voice talent: tone, pace, delivery format (one file per line, WAV), and the usage rights we need.

## Prompt 6: License check before buying
Here is the license text of [LIBRARY OR PROVIDER] [PASTE OR LINK]. Tell me in plain English whether it covers: playing the track in a public gym, live streams on YouTube or other platforms, monetized channels, social media posts by our club and by sponsors, use in future years, and use after the subscription ends. List anything unclear that I should confirm in writing.

## Prompt 7: Generate a theme with an AI music tool
Write prompts for [AI MUSIC TOOL] to generate a 60 second instrumental sports theme matching our audio brief [PASTE]: style, instruments, tempo, structure (build, drop, ending suitable for team introductions), no vocals, no imitation of existing artists. Then write variations for a 5 second goal stinger and a calm loop for stream breaks. Remind me to save the generation date, plan type and terms in force with each file.

## Prompt 8: Game day sound setup
List what we need to run sound in a gym of [SIZE] with [N] courts: speakers, mixer, cables, a laptop or tablet with a soundboard app that plays cues with one tap, a backup on a phone, and a test plan the day before. Include who runs sound on each shift and how they coordinate with the table crew and the stream.

## Prompt 9: Stream safe game day playlist
Build the background music plan for our tournament: [DAYS], about [HOURS] of music per day, played over the gym speakers and picked up by our live stream on [PLATFORM]. Use only music that is free or that we already license [LIBRARY OR NONE], and that is cleared for live streams, replays and clips cut from them. Search the web for the current license terms of each source you propose and quote the clause that covers streaming and the clause on public playback; flag any source whose terms do not mention playback to a live audience. Organize the music in blocks by moment of the day (doors open, warm ups, game rotation, peak games, finals and awards), with the albums or tracks, running time per block and in total, and download links. Then draft a two line email asking the label to confirm in writing that we may play the tracks over the venue speakers at a free amateur tournament. Do not suggest Spotify, Apple Music or YouTube Music for playback.


# M13 Automation: Inbox, Messages, Trackers and Follow Ups

What it solves: the largest time sink for most organizers, which is reading every email and message, updating files by hand, chasing people who have not replied, and writing the same answers again and again.
Levels: 1 to 3. At Level 1 the AI does the work when you paste or upload; at Level 3 an AI agent with access to your email and files runs it on a schedule. Works in: any chat AI for prompts 1, 6 and 7; an agent with email and file access (for example Claude Cowork scheduled tasks, or ChatGPT agent mode) for scheduled runs.
Typical time: 2 to 4 h to set up the first automations; then 10 to 20 minutes a day reviewing drafts and summaries instead of 1 to 2 hours of manual work.

## Lessons from CalCup
* Use one dedicated address for the tournament (an alias or a group address that forwards to you). Everything about the event lands in one place, which makes it possible to automate.
* Let the AI draft, never send. Every outbound message waits for your approval. This one rule removes almost all the risk of automation.
* Automate one flow at a time and check it for a week before adding the next. The first flows worth automating are payment matching, order tracking and the daily summary.
* Keep a change log: every time the AI updates a tracker, it writes what changed and why. When something looks wrong, the log shows where it came from.
* Website and form submissions (registration, orders) should arrive as structured emails or rows, not free text, so the AI can read them reliably.

## What can be automated
| Task | How | Level |
|---|---|---|
| Daily inbox summary: new registrations, payments, questions, problems | Scheduled task reads the tournament inbox and posts a short digest | 3 |
| Payment and order matching | Scheduled task reads payment notifications and order emails, updates the tracker, flags mismatches | 3 |
| Tracker updates from emails and forms | Agent updates the workbook or sheet and writes a change log | 2 to 3 |
| Follow ups with people who have not replied | Weekly run lists overdue items and drafts reminders for your approval | 3 |
| Answers to frequent questions | AI drafts replies from your info pack and FAQ | 1 to 3 |
| WhatsApp group summary | Export the chat and give the file to the AI (see below) | 1 |
| Weekly committee status | Agent compiles the week from the tracker and inbox | 2 to 3 |

## Tools and costs (indicative, check current plans)
* AI agent with email and file access, able to run on a schedule: included in paid plans of the main AI products, about $20 a month and up; heavier daily use may need a higher tier.
* Automation platforms (Zapier, Make): free tiers cover a few simple flows; paid plans start around $10 to $30 a month. Useful to move form submissions into a sheet or to forward payment notifications.
* Google Apps Script or Microsoft Power Automate: often included with your Google or Microsoft account; good for moving data between forms, email and sheets.
* Email setup: filters and labels are free in Gmail and Outlook and make every automation more reliable.

## About WhatsApp
WhatsApp does not offer most clubs an official way to let software read a group chat automatically, and unofficial tools that do it break WhatsApp's terms and put the account at risk. Practical options:
* Once or twice a week, use "Export chat" (without media) on the group and give the text file to the AI for a summary, decisions, open questions and a list of who asked what.
* Use WhatsApp for announcements and quick coordination, and route anything that must be tracked (registrations, payments, orders, roster changes) to a form or the tournament email address.
* Check whether WhatsApp Business tools fit your case if you need structured one to one messaging with teams.

## Prompt 1: Inbox and channel setup
Help me set up my tournament communication so it can be automated. My email is [GMAIL OR OUTLOOK]. Propose: a dedicated address or alias, labels or folders (registration, payments, orders, referees, volunteers, sponsors, media, questions), filters that sort incoming email by sender or keywords, and the subject line conventions to ask teams to use. Give me step by step instructions for my email provider.

## Prompt 2: Daily digest (scheduled, agent with email access)
Every day at [TIME], read new email in [ADDRESS OR LABEL] since the last run. Produce a digest of no more than 15 lines: new registrations, payments received, orders, questions waiting for an answer (with a suggested reply drafted for each, not sent), problems or complaints, and anything with a deadline in the next 7 days. Never send anything. If nothing new arrived, say so in one line.

## Prompt 3: Payment and order matching (scheduled)
Every day, read payment notifications from [PAYMENT APPS OR BANK EMAILS] and order or registration emails from [FORM OR WEBSITE]. Match each payment to a team or an order by name, amount and memo. Update [TRACKER FILE AND TAB] only for confident matches, add a line to the change log tab for each update (date, row, field, old value, new value, source email), and list unmatched or doubtful items for me to resolve. Do not change anything you are not sure about.

## Prompt 4: Follow ups with people who have not replied (weekly)
Every [DAY], check the tracker for items waiting on someone (unpaid balances, missing rosters, unconfirmed referees or volunteers, sponsors who have not answered). For each, check the inbox for a reply since the last reminder. Draft a short, polite follow up for those still waiting, threaded on the existing conversation, and stop after [N] reminders per person. Give me the list of drafts to review. Never send.

## Prompt 5: Tracker update with change log
Here is the latest information [PASTE EMAILS OR UPLOAD FILES] and my tracker [UPLOAD]. Propose every update as a table (row, field, current value, new value, source) and wait for my approval. After I approve, apply them and add each one to the change log tab.

## Prompt 6: WhatsApp group summary
Attached is an export of our WhatsApp group [NAME] since [DATE]. Summarize: decisions made, questions still open and who asked them, commitments people made (who will do what by when), problems raised, and anything that should update the tracker. Ignore jokes and greetings. Finish with draft replies for the open questions.

## Prompt 7: Frequent questions and reply templates
From the attached info pack and the questions in these emails [PASTE], build a list of the 20 most frequent questions with a short, accurate answer for each. Then write reply templates I can reuse, and flag any question whose answer is not in our documents.

## Prompt 8: Guardrails for any automation
Before I switch on an automation, review it with me: what it reads, what it can change, what it must never do (send, pay, delete, share personal data), where it logs its actions, how I can switch it off, and what I should check during the first week. Write this as a short checklist I keep with the automation.


# M14 Event Days Run Sheet

What it solves: everything that has to happen during the tournament beyond the games themselves, hour by hour and with an owner, so nothing depends on one person remembering it.
Levels: all. Works in: any chat AI; file upload to build it from your schedule.
Typical time: 2 to 3 h to build the first version; 30 minutes to adapt it the next year.

## Lessons from CalCup
* The game schedule is only half of the weekend. Ice, food restocks, sponsor visits, results posting, ceremony preparation and referee transport each need a time and an owner.
* One person should own the run sheet on each day and walk it every hour. Everyone else gets only their own lines.
* Plan the ceremony as a project: trophies counted, engraving checked, podium area set, music cue ready, photographer briefed, before the last game starts.
* Print the run sheet and keep it in a shared file. Phones die and Wi-Fi fails in gyms.

## What a run sheet covers (adapt to your event)
| Area | Typical items |
|---|---|
| Setup and venue | Doors, courts, goals, nets, table and benches, signage, scoreboards, sound check, Wi-Fi and stream test, lost and found |
| Check in | Team arrival, roster and eligibility check, jerseys and colors, wristbands, welcome pack |
| Officials | Referee arrival, meals, payments, transport to hotel and airport, table crew rotation |
| Medical and safety | Medical staff on duty, first aid kit, ice for injuries, emergency route |
| Food and concessions | Opening, float and cash, restocks (ice, drinks, snacks), food safety, closing count |
| Merch | Pickup of preorders, stand staffing, payments |
| Results and communication | Enter scores after each game, update standings and website, post results and match cards on social media, messages to teams about schedule changes |
| Livestream | Start and stop per court, check audio, chapter notes |
| Sponsors and guests | Welcome on arrival, banner check, photo, thank you announcement |
| Media | Greet journalists, interview spots, press notes, photos |
| Ceremony | Trophies and medals count, engraving check, MVP votes counted, podium area, music, announcer script, photographer |
| Teardown | Equipment return, cleaning, venue walk through, deposit and key return |
| After the event | Thank you messages, results to the federation, sponsor report, post event review |

## Sample run sheet format
| Day | Time | Task | Owner | Done |
|---|---|---|---|---|
| Friday | 15:00 | Venue access, courts and goals set up | Setup lead | |
| Friday | 16:30 | Sound and livestream test | Media lead | |
| Friday | 17:00 | Team check in opens | Check in lead | |
| Saturday | 08:00 | Concession opens, ice and drinks restocked | Concession lead | |
| Saturday | After each game | Scores entered, standings and website updated | Results lead | |
| Saturday | 12:00 | Welcome sponsor at the entrance, photo | Sponsor lead | |
| Saturday | 13:00 | Restock ice and drinks | Concession lead | |
| Sunday | 11:00 | Trophies counted, engraving checked, MVP votes closed | Ceremony lead | |
| Sunday | 14:30 | Closing ceremony | Tournament director | |
| Sunday | 16:00 | Teardown and venue walk through | Setup lead | |

## Prompt 1: Build the run sheet from the schedule
Using the tournament context and the attached game schedule, build an hour by hour run sheet for every day of the tournament, from setup to teardown, covering everything except refereeing the games themselves: setup, check in, officials, medical, food and concession restocks (including ice), merch, results updates and posting after each game, livestream, sponsors and guests, media, ceremony preparation and the ceremony itself, teardown. Columns: Day, Time, Task, Owner (by role), Done. Tie the timing to the game schedule (for example restock between game blocks, post results within 15 minutes of each final whistle).

## Prompt 2: Adapt it to our event
Here is our run sheet [UPLOAD] and what is different about our event [DESCRIBE: one or two days, number of courts, outdoor or indoor, food or no food, sponsors present, livestream or not, youth teams]. Remove what does not apply, add what is missing, and flag any hour where one role has too many tasks at once.

## Prompt 3: Role cards
From the run sheet, produce one card per role (setup, check in, results, concession, media, sponsor host, ceremony, medical liaison): their tasks in time order, who they report to, the phone numbers they need [ROLES ONLY, no personal data in the template], and what to do if something goes wrong.

## Prompt 4: Ceremony checklist
Write a ceremony checklist starting 3 hours before the ceremony: trophies and medals counted against the award list, engraving checked, MVP and best goalkeeper votes closed and counted (with the website vote: close it at the end of the last final, open Results and copy the winners into the script), podium or stage area set, sponsor representatives confirmed, announcer script printed, music cues ready, photographer briefed, order of awards, and what happens if the final runs late.

## Prompt 5: Consumables plan
Estimate the consumables for [N] players, [N] referees and [N] spectators a day over [N] days: ice (for drinks and for injuries), water, drinks, snacks, tape, first aid supplies, cleaning supplies, printed game sheets. Give quantities per day, when to restock, and who buys what.

## Prompt 6: Live problems playbook
List the 15 most likely problems during a handball tournament weekend (a team arrives late, a referee does not show, the scoreboard fails, an injury needs transport, the stream drops, a game runs long, a protest is filed, the venue closes early) and for each give the decision, who makes it, and the message to send to teams.
