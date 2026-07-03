/*
  CalCup 2027 — single source of truth.
  Everything on the site (schedule, standings, top scorers, team pages,
  referee pages) is generated from THIS file. To update during the
  tournament you only edit the `games` entries below — nothing else.

  TO RECORD A RESULT: set scoreA/scoreB, change status to "final",
  and (optionally) add scorers to goals: []. Standings + top scorers
  recompute automatically. See UPDATE-GUIDE.md.

  NOTE: data below is seeded from CalCup 2026 as a working SAMPLE in a
  mid-tournament state for testing. Replace once 2027 entries are locked.
*/
window.CALCUP = {
  meta: {
    edition: "XX",
    editionLabel: "20th edition",
    year: 2027,
    name: "California Cup 2027",
    host: "San Francisco CalHeat",
    dates: "Jan 29 – Feb 1, 2027",
    venue: "Centerville Middle School",
    venueAddress: "37720 Fremont Blvd, Fremont, CA 94536",
    streamUrl: "",
    contactEmail: "calcup@calheat.com",
    winPoints: 2, drawPoints: 1, lossPoints: 0
  },

  teams: [
    { id:"boston",   name:"Boston TH",          city:"Boston, MA",        division:"M", group:"A", logo:"" , jersey:{c:"#1E8449",n:"Green"} },
    { id:"lathc",    name:"LATHC",              city:"Los Angeles, CA",   division:"M", group:"A", logo:"" , jersey:{c:"#1C1C1C",n:"Black"} },
    { id:"seattle",  name:"Seattle",            city:"Seattle, WA",       division:"M", group:"A", logo:"" , jersey:{c:"#138D75",n:"Teal"} },
    { id:"ch-orange",name:"CalHeat Orange",     city:"San Francisco, CA", division:"M", group:"A", logo:"" , jersey:{c:"#F47920",n:"Orange"} },
    { id:"denver",   name:"Denver Wolves",      city:"Denver, CO",        division:"M", group:"B", logo:"" , jersey:{c:"#566573",n:"Grey"} },
    { id:"sd-m",     name:"San Diego M",        city:"San Diego, CA",     division:"M", group:"B", logo:"" , jersey:{c:"#2E86C1",n:"Blue"} },
    { id:"ch-blue",  name:"CalHeat Blue",       city:"San Francisco, CA", division:"M", group:"B", logo:"" , jersey:{c:"#1F3A93",n:"Navy"} },
    { id:"army-m",   name:"West Point – Army M",city:"West Point, NY",    division:"M", group:"B", logo:"" , jersey:{c:"#B8860B",n:"Gold"} },
    { id:"ch-w",     name:"CalHeat",            city:"San Francisco, CA", division:"W", group:"W", logo:"" , jersey:{c:"#F47920",n:"Orange"} },
    { id:"massif",   name:"Massif SLC",         city:"Salt Lake City, UT",division:"W", group:"W", logo:"" , jersey:{c:"#C0392B",n:"Red"} },
    { id:"nyc",      name:"NYC",                city:"New York, NY",      division:"W", group:"W", logo:"" , jersey:{c:"#1C1C1C",n:"Black"} },
    { id:"sd-w",     name:"San Diego W",        city:"San Diego, CA",     division:"W", group:"W", logo:"" , jersey:{c:"#2E86C1",n:"Blue"} },
    { id:"army-w",   name:"West Point – Army W",city:"West Point, NY",    division:"W", group:"W", logo:"" , jersey:{c:"#B8860B",n:"Gold"} }
  ],

  // optional: { id: [ {n, name, pos} ] }. Empty teams show "Roster to be announced".
  rosters: {
    "ch-w":     [ {n:1,name:"C. Duvert",pos:"Goalkeeper"}, {n:7,name:"L. Movahedian",pos:"Left wing"}, {n:10,name:"G. Davi",pos:"Centre back"} ],
    "boston":   [ {n:9,name:"N. Gros",pos:"Right back"}, {n:11,name:"F. Henry",pos:"Pivot"} ],
    "ch-orange":[ {n:8,name:"M. Paulus",pos:"Centre back"} ]
  },

  referees: [
    { id:"r1", refs:["M. Dupont", "L. Bernard"], country:"USA", bio:"USATH-certified national referee pair." },
    { id:"r2", refs:["J. Smith", "D. Johnson"],  country:"USA", bio:"USATH-certified national referee pair." },
    { id:"r3", refs:["A. Garcia", "R. Lopez"],   country:"USA", bio:"USATH-certified national referee pair." },
    { id:"r4", refs:["TBD", "TBD"],              country:"USA", bio:"Referee pair to be confirmed." },
    { id:"r5", refs:["TBD", "TBD"],              country:"USA", bio:"Referee pair to be confirmed." }
  ],

  volunteers: [
    { id:"v1", name:"K. Rosolowski" },
    { id:"v2", name:"M. Andrews" },
    { id:"v3", name:"P. Nguyen" },
    { id:"v4", name:"L. Moreau" }
  ],

  sponsors: {
    ask: "$1,500–$2,000",
    intro: "CalCup keeps registration affordable for teams traveling from across North America. Sponsor support covers the venue, referee travel, physiotherapy and logistics that make the event possible.",
    benefits: [
      "Logo on the tournament website",
      "Logo on the 3-day nationwide live stream and post-event highlights",
      "Recognition in announcements and event communications",
      "Banner display in the venue (if provided)",
      "Optional player photo or quote"
    ],
    contact: "calcup@calheat.com",
    list: []  // [{name, tier, url, logo}] — add confirmed sponsors here
  },

  history: {
    firstYear: 2007,
    blurb: "CalCup is the nation's longest-running team handball tournament, hosted by San Francisco CalHeat — a Bay Area club and 501(c)(3) nonprofit since 2012. Each year around 200 athletes from across the U.S. and Canada compete in elite men's and women's divisions, streamed nationwide. Many began in CalHeat's grassroots youth programs, some now chasing the Olympic dream for LA 2028.",
    timeline: [
      { year:2007, text:"First California Cup hosted by San Francisco CalHeat" },
      { year:2012, text:"CalHeat becomes a 501(c)(3) nonprofit" },
      { year:2026, text:"19th edition — ~200 athletes from the U.S., Canada and abroad" },
      { year:2027, text:"20th edition (XX) — two decades of elite handball" }
    ],
    awards: [
      { name:"Jack Holleman Trophy", for:"Champions (Men & Women)" },
      { name:"Steve Goss Award", for:"Most Valuable Player" },
      { name:"Mark Ragatz Award", for:"Most Valuable Goalkeeper" },
      { name:"Joe McVein Award", for:"Top Scorer" }
    ],
    trophyImage: "assets/women-trophy.jpg",
    championsNote: "Women's champions are from the trophy record (2024–25 to be confirmed). Men's champions shown here are placeholder examples — the men's roll of honour is still being confirmed.",
    champions: [
      { year:2026, edition:"XIX",  men:"Boston TH",             women:"San Diego" },
      { year:2025, edition:"XVIII", men:"LATHC",                women:"" },
      { year:2024, edition:"XVII", men:"Chicago Inter",         women:"" },
      { year:2023, edition:"XVI",  men:"New York City THC",     women:"New York City THC" },
      { year:2022, edition:"XV",   men:"Boston TH",             women:"New York City THC" },
      { year:2021, edition:"",     notHeld:true },
      { year:2020, edition:"XIV",  men:"West Point",            women:"Alberta THF" },
      { year:2019, edition:"XIII", men:"New York City THC",     women:"New York City THC" },
      { year:2018, edition:"XII",  men:"San Francisco CalHeat", women:"Houston Firehawks" },
      { year:2017, edition:"XI",   men:"LATHC",                 women:"Alberta THF" },
      { year:2016, edition:"X",    men:"Los Angeles / Baja",    women:"Los Angeles / Baja" },
      { year:2015, edition:"IX",   men:"San Francisco CalHeat", women:"San Francisco CalHeat" },
      { year:2014, edition:"VIII", men:"Boston TH",             women:"San Francisco CalHeat" },
      { year:2013, edition:"VII",  men:"Los Angeles THC",       women:"Los Angeles THC" },
      { year:2012, edition:"VI",   men:"San Francisco CalHeat", women:"San Francisco CalHeat" },
      { year:2011, edition:"V",    men:"Vancouver BC",          women:"Vancouver BC" }
    ]
  },

  physio: {
    intro: "CalCup runs a professional on-site physiotherapy and recovery station across all three days, staffed by licensed chiropractors and physical therapists caring for every athlete — men's and women's divisions alike.",
    lead: {
      org: "Vibrant Niche Chiropractic",
      tagline: "Chiropractic, Massage &amp; Pilates · Redwood City",
      desc: "Led by Dr. Anja Huq, Vibrant Niche takes athletes from pain to peak performance — combining chiropractic, massage therapy and Pilates to treat musculoskeletal pain at its root and restore mobility.",
      logo: "https://vibrantniche.com/wp-content/uploads/2024/03/VN_nameplate_wideWHTborder_360.png",
      website: "https://vibrantniche.com",
      email: "office@vibrantniche.com",
      address: "505 Seaport Court, Suite 103, Redwood City, CA 94063",
      phone: "(650) 260-4655"
    },
    team: [
      { name:"Dr. Anja Huq", org:"Vibrant Niche — Chiropractic & Massage", role:"Physiotherapy lead" },
      { name:"Dr. Sue Bedi", org:"Vibrant Niche — Chiropractic & Massage", role:"" },
      { name:"Dr. Marisa Chu", org:"Vibrant Niche — Chiropractic & Massage", role:"" },
      { name:"Dr. Merick Dang", org:"Vibrant Niche — Chiropractic & Massage", role:"" }
    ],
    protocols: [
      "Dedicated courtside treatment area for taping, soft-tissue work and recovery, open throughout the event.",
      "Concussion protocol (SCAT6): any suspected concussion is removed from play and evaluated — no same-day return after a confirmed or suspected concussion.",
      "Supplies (tape, Biofreeze, ice) stocked from a pre-tournament inventory and replenished daily.",
      "Safety always overrides competition."
    ],
    recovery: {
      intro: "Four games in three days is a real test. You don't need the science — you need a simple routine you actually follow. Here's what the pros do between games.",
      tips: [
        { icon:"ti-bolt", title:"Refuel in the first hour", body:"The 30–60 minutes after a game is your window — take on carbs + protein: chocolate milk, a turkey sandwich, Greek yogurt with fruit, or a banana. Short gap before the next game? Keep it light: fruit and a sports drink." },
        { icon:"ti-droplet", title:"Drink to the colour", body:"Aim for pale-yellow urine. For every pound lost during a game, drink 16–24 oz to rehydrate. Sip steadily between games — don't chug right before you step on court." },
        { icon:"ti-run", title:"Warm up — every game", body:"Even game four. Five to eight minutes: light jog, leg swings, arm circles, then a few throws building to full pace. Cold muscles are how you tweak a hamstring on day two." },
        { icon:"ti-stretching", title:"Move before you sit", body:"After the whistle, keep moving 5–10 minutes (easy walk or bike) before you sit down, then some light mobility for hips, shoulders and back. Save the deep static stretching for the end of the day." },
        { icon:"ti-moon", title:"Sleep is the cheat code", body:"Eight to nine hours does more than any supplement. Poor sleep means slower reactions and higher injury risk on back-to-back days — protect it like part of your training." }
      ],
      sources: [
        { name:"TrueSport — Recovery during tournaments", url:"https://truesport.org/preparation-recovery/recovery-during-sports-tournaments/" },
        { name:"Gatorade Sports Science Institute — Recovery techniques", url:"https://www.gssiweb.org/sports-science-exchange/article/sse-120-recovery-techniques-for-athletes" },
        { name:"Memorial Hermann — Refueling after competition", url:"https://memorialhermann.org/services/specialties/rockets-sports-medicine-institute/sports-nutrition/7-rules-for-refueling-after-a-tournament" }
      ]
    }
  },

  press: {
    intro: "Media and press resources for California Cup XX — the 20th edition of the nation's longest-running team handball tournament.",
    about: "CalCup is hosted by San Francisco CalHeat, a Bay Area handball club and 501(c)(3) nonprofit. Each year the tournament brings around 200 athletes from across the U.S., Canada and beyond to compete in elite men's and women's divisions, streamed nationwide. Many players began in CalHeat's grassroots youth programs, and some now pursue the Olympic dream for LA 2028. As a USA Team Handball 'Wild Card' qualifier, CalCup is both a marquee competition and a driver of the sport's growth in America.",
    facts: [
      "20th edition — the nation's longest-running handball tournament (since 2007).",
      "~200 athletes from the U.S., Canada and abroad each year.",
      "Elite men's and women's divisions, played to IHF rules.",
      "Three days of competition, streamed nationwide on YouTube.",
      "Hosted by San Francisco CalHeat — 501(c)(3) nonprofit since 2012.",
      "USA Team Handball 'Wild Card' qualifier for the US Nationals Elite division."
    ],
    assets: [
      { name:"Fact sheet (PDF)", url:"assets/press/CalCup_2027_Fact_Sheet.pdf" },
      { name:"Team & host logos (ZIP)", url:"" },
      { name:"Action photos (ZIP)", url:"" },
      { name:"Sponsorship deck (PPTX)", url:"assets/press/CalCup_2027_Sponsorship.pptx" }
    ],
    contact: "calcup@calheat.com"
  },


  lottery: {
    headline: "Win a signed pro jersey",
    blurb: "Two grand prizes, drawn live at the Sunday finals. Every ticket backs the tournament and the youth handball programs behind it.",
    prizes: [
      { place:"1st prize", item:"Signed French national team jersey", src:"Courtesy of the French Handball Federation" },
      { place:"2nd prize", item:"Signed PSG Handball jersey", src:"Courtesy of Paris Saint-Germain Handball" }
    ],
    tickets: [
      { name:"Single", price:"$5" },
      { name:"3-pack", price:"$12" },
      { name:"Team 12-pack", price:"$40" },
      { name:"School 20-pack", price:"$60" }
    ],
    where: "On sale at the organization table — Saturday & Sunday.",
    draw: "Drawn at the finals ceremony on Sunday. You must be present to win.",
    pay: "Venmo · PayPal · Zelle accepted"
  },

  concession: {
    intro: "Fuel up courtside. Cashless only — Venmo, PayPal & Zelle accepted at the booth.",
    card: "Prepaid food card: $12 of credit for $10 — use it all weekend.",
    menu: [
      { group:"Hot food", items:[ {n:"Grilled sandwich",p:"$5.50"}, {n:"Grilled sandwich (veg)",p:"$4.50"}, {n:"Rice cake",p:"$4"}, {n:"Crêpe",p:"$4"} ] },
      { group:"Snacks", items:[ {n:"Clif bar",p:"$2 · 2 for $3"}, {n:"Banana",p:"$1"} ] },
      { group:"Drinks", items:[ {n:"Gatorade (12 oz)",p:"$2.50 · 2 for $3.50"}, {n:"Coffee",p:"$2"}, {n:"Hot chocolate",p:"$2"}, {n:"Tea",p:"$2"} ] }
    ],
    bundles: [
      { n:"Sandwich + Gatorade", d:"Grilled sandwich + Gatorade", p:"$7" },
      { n:"Veg Sandwich + Gatorade", d:"Vegetarian sandwich + Gatorade", p:"$6" },
      { n:"Athlete Fuel Pack", d:"Banana + Gatorade + Clif bar", p:"$4.50" }
    ],
    merch: {
      note: "Gear up — cashless too (Venmo @CalHeat-Handball, PayPal or Zelle).",
      items: [ {n:"Hummel / Jax jersey",p:"$55"}, {n:"Superglobe jersey (signed)",p:"$30"}, {n:"CalCup jersey (17th / 18th)",p:"$25"}, {n:"CalCup T-shirt",p:"$20"}, {n:"Flat or curved hat",p:"$25"} ],
      bundles: [ {n:"Family Bundle",d:"3 CalCup t-shirts",p:"$50"}, {n:"Elite Bundle",d:"Hummel jersey + hat",p:"$70"}, {n:"Hat & Shirt Bundle",d:"Hat + CalCup t-shirt",p:"$45"}, {n:"Welcome Bundle",d:"Starter gear set",p:"$27"} ]
    }
  },

  refQuiz: {
    perQuestion: 10,
    questions: [{"q":"Free throw 11m out. The keeper leaves the goal area entirely; the thrower quick-throws (no whistle) into the empty net. Call?","a":["Goal — it counts","Retake the throw","No goal — free throw out","7-metre throw"],"c":0,"why":"Goal. For a free throw there is no rule requiring the goalkeeper to be on the goal line. The goalkeeper's position is irrelevant. Only the 7m throw requires the goalkeeper to be on the line. The goal stands.  (Rule 13, 15:2)"},{"q":"A 7m throw is saved. The rebound falls to an attacking teammate who scores immediately. Valid?","a":["No — free throw to defenders","Goal — it counts","Retake the 7m","7m throw again"],"c":0,"why":"No. On a 7m throw, only the thrower and the goalkeeper may play the ball until it has struck the post, crossbar, or the goalkeeper. A teammate touching the rebound before any such contact is a violation — free throw for the defending team.  (Rule 14:6)"},{"q":"On a free throw, the ball hits a referee standing in front of goal and deflects in. Call?","a":["No goal — referee throw","Goal — it counts","Retake the free throw","Throw-in"],"c":0,"why":"Not a goal. When the ball hits a referee and the outcome is materially affected, play is restarted with a referee throw at the location of the contact. The attacking team does not regain the free throw.  (Rule 13:4 Comment)"},{"q":"A player with two prior suspensions commits a third suspension-worthy foul. Result?","a":["Disqualification (red card)","Another 2-minute suspension","Blue card + report only","Warning (yellow)"],"c":0,"why":"Automatic disqualification (red card). A player's third 2-minute infraction in the same match — regardless of prior yellow cards — triggers disqualification. Team plays shorthanded for 2 minutes. After 2 minutes a replacement may enter.  (Rule 16:6d)"},{"q":"Two teammates are red-carded together for fighting. Players fielded, and when do replacements enter?","a":["5 players; both return after 2 min","5 players; return after 4 min","6 players; staggered entries","6 players; after 2 min"],"c":0,"why":"The team fields 5 players (7 minus 2). Both 2-minute penalty periods run simultaneously. After 2 game-time minutes, both replacements enter at the same time, returning the team to 7.  (Rule 16:6)"},{"q":"A suspended player returns after 2 min but has swapped jerseys to hide their identity. Call?","a":["Both players sanctioned","No action — legal","Retake the suspension","Team timeout"],"c":0,"why":"Both players are sanctioned. Jersey swapping to evade disciplinary tracking is grossly unsporting. Both players receive yellow cards at minimum; the originally suspended player may face escalation. The substitute who swapped jerseys may be disqualified for deliberately deceiving the referees.  (Rule 16:1, 16:9)"},{"q":"An airborne attacker shoots; the trailing hand grazes the 6m line AFTER the ball is released. Call?","a":["Goal — released before contact","No goal — line foul","7-metre throw","Free throw to defenders"],"c":0,"why":"Goal. The ball was released before any body contact with the goal area. The grazing of the line after release does not retroactively create a violation — what matters is that the ball was gone before the contact.  (Rule 6:2a)"},{"q":"A defender steps into their own empty goal area to stop a ball rolling toward goal. Call?","a":["7-metre throw","Goal — it counts","Free throw to attackers","Play on — legal"],"c":0,"why":"7m throw. A defending field player entering the goal area to prevent a certain goal is penalized by a 7m throw, regardless of whether they succeed in stopping the ball. The successful clearance does not change the call.  (Rule 6:2b)"},{"q":"The only goalkeeper is disqualified with no backup keeper. What must happen before resuming?","a":["Field player becomes keeper (distinct jersey)","Forfeit the match","Play with no keeper","Opponents get a 7m"],"c":0,"why":"A field player must be designated as the new goalkeeper and must wear a distinctly different-colored jersey from all other players on both teams. The team reorganizes; normal substitution rules apply. Play resumes once the jersey change is completed.  (Rule 5:11, 4:8)"},{"q":"Forewarning shown. After 3 passes a player dribbles twice, then passes. Passes toward the limit?","a":["3 — a dribble isn't a pass","4 passes","5 passes","2 passes"],"c":0,"why":"3 passes — 4 touches total, but dribbling by the same player does not count as a pass. Only ball transfers from one player to another increment the count. After the dribble the player passes = 4th pass now occurs. Referee must then act if no shot follows.  (Rule 7:11)"},{"q":"Forewarning shown. A defender fouls; referee plays advantage (no whistle). Does the forewarning reset?","a":["No — only a whistle cancels it","Yes — the foul resets it","Yes — after 3 passes","No — it never applies in attack"],"c":0,"why":"No. Advantage applied for a defensive foul does not cancel the forewarning signal. The signal is only cancelled when the referee actually blows the whistle for the foul and awards a free throw. If advantage is applied, the passive play situation and pass count continue.  (Rule 7:11 Comment)"},{"q":"On a clear 2-on-1 fast break, the referee shows the passive-play forewarning. Correct?","a":["No — never during a clear break","Yes — after 6 seconds","Yes — if no shot in 3 passes","Only in the last 2 minutes"],"c":0,"why":"Not correct. The forewarning signal should never be shown during a dynamic attack with clear scoring potential — a fast break with a 2v1 advantage is the antithesis of passive play. Showing the signal here would be an error in judgment.  (Rule 7:10)"},{"q":"On a goalkeeper throw, an attacker briefly steps on the 6m line before the ball is released. Call?","a":["Retake the goalkeeper throw","Play on — legal","7-metre throw","Free throw to attackers"],"c":0,"why":"Retake. Attackers must be outside the 6m line until the ball crosses the line. Stepping onto the line (which belongs to the goal area) before the ball is released = premature entry. The goalkeeper throw must be retaken.  (Rule 12:2)"},{"q":"A referee throw is called but one involved player is injured and can't take part. How is it done?","a":["Proceed with the players present","Cancel — award a free throw","Retake once the player returns","Give it to the healthy team"],"c":0,"why":"A referee throw is executed between whatever players are present. If one player is unavailable (injured), the referee throw still proceeds — the remaining eligible player participates and the referee throws accordingly. Play must resume.  (Rule 13:4)"},{"q":"GK throw to a field player, who immediately passes back to the keeper inside the area, who catches it. Call?","a":["Back-pass — free throw to opponents","Legal — play on","Goalkeeper throw again","7-metre throw"],"c":0,"why":"Back-pass violation. The field player deliberately passed the ball back to the goalkeeper. The sequence (GK throw → teammate → back to GK) is exactly what the back-pass rule prohibits. Free throw for the opponent.  (Rule 6:5a)"},{"q":"The goal referee signals goal; the court referee simultaneously signals no-goal. Resolution?","a":["Confer — goal ref has primacy at that end","Court referee always wins","Automatic no-goal","Retake from center"],"c":0,"why":"The referees confer immediately. General principle: the goal referee has primary authority for decisions at their end of the court (whether the ball fully crossed the line). If the goal referee is certain, their decision prevails. If genuine uncertainty remains, the safer decision is no-goal. Communication between partners is mandatory before play resumes.  (IHF Referees' Guide, Rule 17)"},{"q":"During a granted team timeout, the referee sees the timekeeper never stopped the clock. Action?","a":["Signal to stop the clock and correct time","Ignore it — play on","Restart the timeout","Add the time only at the end"],"c":0,"why":"The referee must immediately signal the timekeeper to stop the clock (T signal again, whistle if needed). The elapsed time during the timeout (where it was running) should be corrected. The referee must verify the clock is stopped before the timeout huddles proceed.  (Rule 2:10)"},{"q":"In extra time, team timeouts per team — and do unused regulation timeouts carry over?","a":["1 per extra-time period; none carry over","1 total for all extra time","Unused timeouts carry over","2 per period"],"c":0,"why":"Each team is entitled to 1 team timeout per period of extra time. Unused regulation timeouts do NOT carry over to extra time. Each period (first and second half of extra time) gives each team one new timeout.  (Rule 2:10)"},{"q":"A field player acting as 'keeper' in a 7-v-6 attack fouls outside the goal area. Which rules apply?","a":["Field-player rules entirely","Goalkeeper rules","No sanction — keeper privilege","Referee's discretion"],"c":0,"why":"Field player rules entirely. A player acting as 'goalkeeper' without being in the goal area is treated as a field player in all respects — including fouls, disciplinary sanctions, and the prohibition on using the legs/feet to play the ball.  (Rule 4:8)"},{"q":"A sub enters while the outgoing player hasn't left yet (8 on court); the sub never touches the ball. Sanction?","a":["2-minute suspension","None — no ball touch","Free throw only","Warning (yellow)"],"c":0,"why":"2-minute suspension for the illegally entering player — even though they didn't touch the ball. Illegal entry (court occupied by too many players) is an infraction regardless of ball contact. The outgoing player must leave first.  (Rule 4:5, 16:3b)"},{"q":"Both teams foul at the exact same instant; one slightly more severe. Correct restart?","a":["Referee throw","Free throw to the lesser-fouling team","7-metre throw","Throw-off"],"c":0,"why":"Referee throw. When both teams commit violations simultaneously — regardless of differing severity — the correct restart is always a referee throw. There is no provision for awarding the more severe foul; simultaneity = referee throw.  (Rule 13:4)"},{"q":"A substituted player re-enters from the corner area (not the sub zone) during a stoppage. Call?","a":["2-minute suspension","Legal — play was stopped","Warning (yellow)","Free throw to opponents"],"c":0,"why":"2-minute suspension. Players must always enter through the correct substitution zone after the outgoing player has fully left. Entry from any other boundary point is illegal entry regardless of whether play was stopped.  (Rule 4:4, 4:5)"},{"q":"Last 2 seconds, level score. On a free throw the thrower shoots from clearly inside the 9m line and scores. Result?","a":["No goal — turnover, match ends level","Goal — it counts","Retake the free throw","7-metre throw"],"c":0,"why":"No goal. The free throw was executed from an illegal position (inside the 9m line). Even in the dying seconds the position rule must be enforced. The throw is awarded to the opposing team (turnover) — time expires and the match ends level.  (Rule 13:1, 15:7)"},{"q":"A player commits a serious offense just after the final whistle, still on court. Can the referee act?","a":["Yes — authority lasts until teams leave","No — whistle already blown","Only a warning is allowed","No — the match is over"],"c":0,"why":"Yes. Referee authority extends until both teams have left the facility. Post-whistle incidents on or near the court are sanctionable. Serious conduct (assault, spitting, threats) = blue card (disqualification with report). The match result is unaffected.  (Rule 16:9)"}]
  },
  games: [
    { no:1, jA:"White", jB:"Blue", day:"Thu", time:"9:00 PM", court:1, division:"W", group:"W", teamA:"ch-w", teamB:"massif", scoreA:30, scoreB:22, status:"final", refs:"r2", table:["v1","v2"], stream:true, goals:[{team:"ch-w",player:"L. Movahedian",goals:9},{team:"massif",player:"R. Adams",goals:7}] },
    { no:2, jA:"Blue", jB:"White", day:"Fri", time:"3:45 PM", court:1, division:"M", group:"A", teamA:"boston", teamB:"lathc", scoreA:31, scoreB:27, status:"final", refs:"r1", table:["v3","v4"], stream:true, goals:[{team:"lathc",player:"F. Grifol",goals:11},{team:"boston",player:"N. Gros",goals:8}] },
    { no:3, jA:"Black", jB:"Blue", day:"Fri", time:"4:55 PM", court:1, division:"M", group:"B", teamA:"denver", teamB:"sd-m", scoreA:30, scoreB:25, status:"final", refs:"r2", table:["v1","v2"], stream:true, goals:[{team:"denver",player:"A. Keller",goals:9}] },
    { no:4, jA:"Black", jB:"Blue", day:"Fri", time:"6:05 PM", court:1, division:"W", group:"W", teamA:"nyc", teamB:"sd-w", scoreA:24, scoreB:21, status:"final", refs:"r3", table:["v3","v4"], stream:true, goals:[{team:"nyc",player:"S. Cohen",goals:8},{team:"sd-w",player:"T. Ruiz",goals:6}] },
    { no:5, jA:"Green", jB:"White", day:"Fri", time:"7:15 PM", court:1, division:"M", group:"A", teamA:"seattle", teamB:"ch-orange", scoreA:24, scoreB:28, status:"final", refs:"r1", table:["v1","v2"], stream:true, goals:[{team:"ch-orange",player:"M. Paulus",goals:10},{team:"seattle",player:"J. Park",goals:7}] },
    { no:6, jA:"White", jB:"Black", day:"Fri", time:"8:25 PM", court:1, division:"M", group:"B", teamA:"ch-blue", teamB:"army-m", scoreA:27, scoreB:29, status:"final", refs:"r2", table:["v3","v4"], stream:true, goals:[{team:"army-m",player:"D. Wright",goals:9}] },
    { no:7, jA:"White", jB:"Black", day:"Fri", time:"9:35 PM", court:1, division:"W", group:"W", teamA:"ch-w", teamB:"nyc", scoreA:28, scoreB:25, status:"final", refs:"r3", table:["v1","v2"], stream:true, goals:[{team:"ch-w",player:"L. Movahedian",goals:6},{team:"nyc",player:"S. Cohen",goals:7}] },
    { no:8, jA:"Blue", jB:"Green", day:"Sat", time:"7:30 AM", court:1, division:"M", group:"A", teamA:"boston", teamB:"seattle", scoreA:26, scoreB:22, status:"final", refs:"r1", table:["v3","v4"], stream:true, goals:[{team:"boston",player:"N. Gros",goals:9}] },
    { no:9, jA:"White", jB:"Black", day:"Sat", time:"8:40 AM", court:1, division:"W", group:"W", teamA:"massif", teamB:"army-w", scoreA:26, scoreB:23, status:"final", refs:"r2", table:["v1","v2"], stream:true, goals:[{team:"massif",player:"R. Adams",goals:8}] },
    { no:10, jA:"Black", jB:"White", day:"Sat", time:"9:50 AM", court:1, division:"M", group:"B", teamA:"denver", teamB:"ch-blue", scoreA:28, scoreB:26, status:"final", refs:"r3", table:["v3","v4"], stream:true, goals:[{team:"denver",player:"M. Stone",goals:8}] },
    { no:11, jA:"White", jB:"Blue", day:"Sat", time:"11:00 AM", court:1, division:"W", group:"W", teamA:"ch-w", teamB:"sd-w", scoreA:18, scoreB:16, status:"live", refs:"r1", table:["v1","v2"], stream:true, goals:[] },
    { no:12, jA:"Blue", jB:"White", day:"Sat", time:"12:10 PM", court:1, division:"M", group:"A", teamA:"lathc", teamB:"ch-orange", scoreA:null, scoreB:null, status:"upcoming", refs:"r2", table:["v3","v4"], stream:true, goals:[] },
    { no:13, jA:"Black", jB:"Gold", day:"Sat", time:"1:20 PM", court:1, division:"W", group:"W", teamA:"nyc", teamB:"army-w", scoreA:null, scoreB:null, status:"upcoming", refs:"r3", table:["v1","v2"], stream:true, goals:[] },
    { no:14, jA:"Blue", jB:"Black", day:"Sat", time:"2:30 PM", court:1, division:"M", group:"B", teamA:"sd-m", teamB:"army-m", scoreA:null, scoreB:null, status:"upcoming", refs:"r1", table:["v3","v4"], stream:true, goals:[] },
    { no:15, jA:"Blue", jB:"White", day:"Sat", time:"3:40 PM", court:1, division:"M", group:"A", teamA:"boston", teamB:"ch-orange", scoreA:null, scoreB:null, status:"upcoming", refs:"r2", table:["v1","v2"], stream:true, goals:[] },
    { no:16, jA:"White", jB:"Black", day:"Sat", time:"4:50 PM", court:1, division:"W", group:"W", teamA:"ch-w", teamB:"army-w", scoreA:null, scoreB:null, status:"upcoming", refs:"r3", table:["v3","v4"], stream:true, goals:[] },
    { no:17, jA:"White", jB:"Blue", day:"Sat", time:"6:00 PM", court:1, division:"W", group:"W", teamA:"massif", teamB:"sd-w", scoreA:null, scoreB:null, status:"upcoming", refs:"r1", table:["v1","v2"], stream:true, goals:[] },
    { no:18, jA:"Black", jB:"Gold", day:"Sat", time:"7:10 PM", court:1, division:"M", group:"B", teamA:"denver", teamB:"army-m", scoreA:null, scoreB:null, status:"upcoming", refs:"r2", table:["v3","v4"], stream:true, goals:[] },
    { no:19, jA:"Blue", jB:"Green", day:"Sat", time:"8:20 PM", court:1, division:"M", group:"A", teamA:"lathc", teamB:"seattle", scoreA:null, scoreB:null, status:"upcoming", refs:"r3", table:["v1","v2"], stream:true, goals:[] },
    { no:20, jA:"Blue", jB:"White", day:"Sat", time:"9:30 PM", court:1, division:"M", group:"B", teamA:"sd-m", teamB:"ch-blue", scoreA:null, scoreB:null, status:"upcoming", refs:"r1", table:["v3","v4"], stream:true, goals:[] },
    { no:21, jA:"White", jB:"Black", day:"Sun", time:"7:30 AM", court:1, division:"W", group:"W", teamA:"massif", teamB:"nyc", scoreA:null, scoreB:null, status:"upcoming", refs:"r2", table:["v1","v2"], stream:true, goals:[] },
    { no:22, jA:"Blue", jB:"Black", day:"Sun", time:"8:40 AM", court:1, division:"W", group:"W", teamA:"sd-w", teamB:"army-w", scoreA:null, scoreB:null, status:"upcoming", refs:"r3", table:["v3","v4"], stream:true, goals:[] },
    { no:23, jA:"White", jB:"Black", day:"Sun", time:"9:50 AM", court:1, division:"M", group:"P", teamA:"tbd-a4", teamB:"tbd-b4", scoreA:null, scoreB:null, status:"upcoming", refs:"r1", table:["v1","v2"], stream:true, label:"Men · 7th place", goals:[] },
    { no:24, jA:"Green", jB:"White", day:"Sun", time:"11:00 AM", court:1, division:"M", group:"P", teamA:"tbd-a3", teamB:"tbd-b3", scoreA:null, scoreB:null, status:"upcoming", refs:"r2", table:["v3","v4"], stream:true, label:"Men · 5th place", goals:[] },
    { no:25, jA:"Blue", jB:"White", day:"Sun", time:"12:10 PM", court:1, division:"M", group:"P", teamA:"tbd-a2", teamB:"tbd-b2", scoreA:null, scoreB:null, status:"upcoming", refs:"r3", table:["v1","v2"], stream:true, label:"Men · 3rd place", goals:[] },
    { no:26, jA:"White", jB:"Blue", day:"Sun", time:"1:20 PM", court:1, division:"W", group:"P", teamA:"tbd-w1", teamB:"tbd-w2", scoreA:null, scoreB:null, status:"upcoming", refs:"r1", table:["v3","v4"], stream:true, label:"Women · Final", goals:[] },
    { no:27, jA:"Blue", jB:"Black", day:"Sun", time:"2:30 PM", court:1, division:"M", group:"P", teamA:"tbd-a1", teamB:"tbd-b1", scoreA:null, scoreB:null, status:"upcoming", refs:"r2", table:["v1","v2"], stream:true, label:"Men · Final", goals:[] }
  ]
};
