# Handball Tournament Toolkit: prompt packs

Prompts work in Claude, ChatGPT or any capable AI. Fill the [BRACKETS]. Start with M0.


# M0 Tournament Context

Use this first, once. Every other prompt in the toolkit assumes the AI already has this context.

## How to use it with your AI

* Claude: create a Project, paste the filled block into the project instructions, and upload your workbook and logos to the project. Every chat in that project starts with the context.
* ChatGPT: create a Project (or a custom GPT), paste the block into its instructions, and upload the same files.
* Any other AI: paste the block at the top of each new conversation.
* Update the block when a fact changes (dates, fees, venue). It is your single source of truth; do not correct facts chat by chat.

Works in: any chat AI.

## Prompt (fill the brackets, then save as instructions)

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


# M3 Communication and Local Media

What it solves: writing each message once, sending it on a fixed calendar, and getting local coverage and spectators.
Levels: all. Works in: any chat AI (prompts 1 to 5); web search needed for prompts 6 and 7.
Typical time: 3 to 5 h to build the calendar and templates; each later message takes minutes.

## Lessons from CalCup
* A fixed communication calendar with templates replaced messages written from scratch each cycle.
* Designed emails with images must be tested by sending to yourself and opening the received email. Draft previews do not show what recipients get.
* WhatsApp works better than email for players; email remains the record for captains and payments.

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
Status: the website starter is in the downloads. It was built and tested end to end with mock data (workbook, converter, site, update after a new result) and has not yet been used in a live tournament.

## How it works at CalCup
* The master workbook is the only place where results are typed.
* The site reads a data file generated from the workbook. At Level 3 a scheduled job regenerates that file every few minutes and the host redeploys automatically.
* Results are posted after each game. The site is not live scoring; a video stream is embedded for people who want to watch.

## Lessons from CalCup
* Keep one source of truth. Never edit the website data by hand while the workbook is also being updated.
* Keep the site folder out of synced folders (OneDrive, Dropbox, Google Drive). Sync tools corrupt git repositories.
* A strict validation step (for example "exactly 13 teams") will block updates when the real world changes. Make checks warn rather than fail.

## Prompt 1: Site plan
Using our tournament context, propose a simple static website: pages, what each shows, and the data each needs. Required: home, schedule, standings, top scorers, teams, visitor info, watch live. Mobile first. No login, no database. All data from one data file.

## Prompt 2: Build the starter
Build that site as plain HTML, CSS and JavaScript with no framework. All tournament data in one file data.js (teams, games with scores, players with goals per game). Schedule, standings and scorers are calculated in the browser from that file. Use our visual spec [PASTE]. Give me the full file list and a short guide to publish it on Netlify by drag and drop.

## Prompt 3: Workbook to data file
Write a script that reads our workbook [FILE, TAB NAMES, HEADER ROWS] and writes data.js in the format the site expects. It must stop with a clear message if a team name in the games tab does not exist in the teams tab.

## Prompt 4: Game sheet to workbook (photo)
Attached is a photo of a completed game sheet. Read both team names, the final score and each player's goals. Find the matching game in the workbook. Propose the entries in a table and flag any difference between the sum of player goals and the final score. Do not write to the file until I approve.

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
* Coordinate with your national referee committee early; late coordination created avoidable work.

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
Build a single page web quiz on handball rules for referee recruitment and training. 15 questions drawn at random from a pool of [N], a countdown per question, a short rule explanation after each answer, and a final score. Count only decision time (from question shown to answer clicked) so reading the explanation is not penalized. Questions must cite the current rules of the game; mark any question you are unsure of so I can check it against the official text.

## Prompt 7: Referee partnership request
Draft a request to [NATIONAL OR REGIONAL REFEREE COMMITTEE] asking for support with referee assignments for our tournament on [DATES]: number of games, number of pairs needed, what we cover (travel, lodging, meals, fees), and the deadline to confirm. Ask whether the tournament can count toward referee development or evaluation. Short, formal, factual.


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
Levels: all; most useful from Level 2, when the event is streamed. Works in: any chat AI; web search for prompt 3; an AI music tool for prompt 7.
Typical time: 3 to 6 h to define the identity and source the assets; 1 h to set up the game day playlist.

## Lessons from CalCup
* Separate intro tracks for the men's and the women's teams, plus a few short stingers (a bugle call, a defense chant, a crowd prompt) gave the event a recognizable sound that people still mention.
* Sourcing music and sound effects from one licensed library meant the same tracks could be used in the gym, on the livestream and in highlight videos without copyright claims.
* Keep one folder with every audio file and its license certificate. When a platform flags a video, the certificate resolves it.
* Never play commercial radio songs while the stream is live. If in doubt, mute the stream audio during that moment.

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
| Music library subscription | About $10 to $17 a month on annual billing; more on monthly billing | Personal plans often exclude monetized channels and commercial use; for a club event with sponsors, the commercial or "unlimited" tier is the safer choice |
| Single track license | About $15 to $80 per track | Good when you only need a theme and a few stingers |
| Custom theme or jingle | About $150 to $1,500 | Depends on length, stems, revisions and ownership |
| Voice over pack (event intro, team intros, sponsor reads) | About $25 to $150 on marketplaces; $150 to $500 for professional talent with broadcast usage | Ask for separate files per line and a pronunciation check |
| Sound gear (powered speaker, small mixer, cables) | Often borrowed from the venue or a member; renting about $50 to $150 a day | Confirm what the venue provides before buying |

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
Write a ceremony checklist starting 3 hours before the ceremony: trophies and medals counted against the award list, engraving checked, MVP and best goalkeeper votes closed and counted, podium or stage area set, sponsor representatives confirmed, announcer script printed, music cues ready, photographer briefed, order of awards, and what happens if the final runs late.

## Prompt 5: Consumables plan
Estimate the consumables for [N] players, [N] referees and [N] spectators a day over [N] days: ice (for drinks and for injuries), water, drinks, snacks, tape, first aid supplies, cleaning supplies, printed game sheets. Give quantities per day, when to restock, and who buys what.

## Prompt 6: Live problems playbook
List the 15 most likely problems during a handball tournament weekend (a team arrives late, a referee does not show, the scoreboard fails, an injury needs transport, the stream drops, a game runs long, a protest is filed, the venue closes early) and for each give the decision, who makes it, and the message to send to teams.
