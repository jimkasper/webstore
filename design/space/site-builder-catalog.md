# Site Builder Catalog
Last updated: 2026-04-24

Full hierarchy: Purpose → Use → Page Templates → Pages → Blocks → Modules.
Block types are defined once in the Block Library and referenced throughout the page catalog.

---

## Block Library

Reusable block types used across all page templates. Each block contains the listed default modules.

| Block | Default modules |
|-------|----------------|
| **Hero** | Background image/video · Heading · Subtext · Primary CTA button · Secondary CTA button |
| **Feature cards** | Section heading · Card ×N: [Icon · Heading · Body text · Link] |
| **Text section** | Heading · Rich text body |
| **Image + text** | Image · Heading · Rich text · CTA button |
| **Gallery grid** | Section heading · Image ×N: [Image · Caption] |
| **Testimonials** | Section heading · Testimonial ×N: [Quote · Name · Photo · Role/company · Star rating] |
| **CTA banner** | Heading · Subtext · Primary CTA button |
| **Contact form** | Heading · Name field · Email field · Message field · Submit button |
| **Social links** | Platform icons ×N: [Icon · Label · URL] |
| **Stats** | Stat ×N: [Number · Label] |
| **Team grid** | Section heading · Member ×N: [Photo · Name · Title · Bio · Social links] |
| **Timeline** | Section heading · Entry ×N: [Date · Title · Description] |
| **FAQ** | Section heading · Item ×N: [Question · Answer (expandable)] |
| **Newsletter signup** | Heading · Subtext · Email field · Submit button |
| **Video embed** | Video embed · Caption |
| **Audio player** | Player · Episode title · Description |
| **Post feed** *(dynamic)* | Section heading · Post ×N: [Thumbnail · Title · Date · Excerpt · Read more link] |
| **Events list** *(dynamic)* | Section heading · Event ×N: [Date · Title · Location · Ticket/RSVP CTA] |
| **Social feed** *(dynamic)* | Section heading · Social wall post feed |
| **Map embed** | Map · Address text · Hours (static text) |
| **Pricing table** | Section heading · Tier ×N: [Name · Price · Feature list · CTA button] |
| **Countdown timer** *(dynamic)* | Target date · Label · Days/hours/minutes/seconds display |
| **Repo card** *(dynamic)* | Repo name · Description · Language · Stars · Last commit · Clone/view link |
| **Commit feed** *(dynamic)* | Repo selector · Commit ×N: [Hash · Message · Author · Date] |
| **Lists block** *(dynamic)* | List selector (from Lists app) · Item ×N: [Text · Tag(s) · Status] |
| **Booking/reservation form** | Heading · Date picker · Time picker · Name field · Email field · Notes · Submit |
| **Menu section** | Section heading · Item ×N: [Name · Description · Price · Dietary tags] |
| **Discography** | Album ×N: [Cover art · Title · Year · Listen link] |
| **Episode list** | Episode ×N: [Cover · Title · Date · Duration · Play button · Description] |
| **Product grid** | Section heading · Product ×N: [Image · Name · Price · Add to cart] |
| **Poll** | Question · Option ×N: [Label] · End date (optional) · Results display (live % bar) |
| **Divider / spacer** | Height setting · Optional decorative rule |

---

## Page Catalog

---

### PERSONAL

---

#### Blog / Journal

**Home**
- Hero — background image, blog name heading, tagline subtext, "Start reading" CTA
- Post feed *(dynamic)* — latest posts
- Newsletter signup — heading, subtext, email field, submit
- Social links

**Posts**
- Post feed *(dynamic)* — full paginated post list with thumbnail, title, date, excerpt, tags
- Newsletter signup

**About**
- Image + text — author photo, name, bio
- Social links

**Contact**
- Contact form
- Social links

---

#### Portfolio

**Home**
- Hero — background image, name heading, role/tagline subtext, "View my work" CTA
- Gallery grid — featured project thumbnails
- Text section — skills or services summary
- CTA banner — "Let's work together"

**Work**
- Gallery grid — full project grid (image, title, description)

**About**
- Image + text — photo, name, extended bio
- Timeline — experience entries
- Feature cards — skills (icon, skill name, short description)

**Contact**
- Contact form
- Social links

---

#### Resume / CV

**Home / Resume**
- Hero — photo, name heading, job title subtext, "Download CV" CTA button
- Timeline — experience entries (company, role, dates, description)
- Feature cards — skills
- Timeline — education entries (institution, degree, dates)

**Contact**
- Contact form
- Social links
- Map embed *(optional — city-level only)*

---

#### Professional Networking

**Home**
- Hero — photo, name, headline, "Connect with me" CTA
- Feature cards — areas of expertise
- Post feed *(dynamic)* — recent activity / thought leadership posts
- Stats — years of experience, projects, clients

**About**
- Image + text — extended professional bio
- Timeline — career history
- Feature cards — certifications / credentials

**Blog**
- Post feed *(dynamic)*
- Newsletter signup

**Contact**
- Contact form
- Social links

---

#### Personal Networking

**Home**
- Hero — photo, name, tagline
- Text section — short personal intro
- Social feed *(dynamic)* — recent wall posts
- Social links

**About**
- Image + text — photo, personal bio
- Feature cards — interests / hobbies
- Lists block *(dynamic)* — likes/dislikes list (from Lists app)
- Lists block *(dynamic)* — favorite albums list

**Gallery**
- Gallery grid

**Contact**
- Contact form
- Social links

---

#### Hobby Site

**Home**
- Hero — hobby name/theme, tagline, CTA
- Post feed *(dynamic)* — latest posts/updates
- Gallery grid — featured photos/projects preview

**About**
- Image + text — photo, bio, hobby description
- Stats — years practicing, projects completed, etc.

**Gallery / Projects**
- Gallery grid

**Blog**
- Post feed *(dynamic)*

**Contact**
- Contact form

---

#### Fan Site

**Home**
- Hero — subject image, site name, tagline
- Post feed *(dynamic)* — latest news/updates
- Gallery grid — featured gallery preview
- Social links

**About**
- Text section — subject description/history
- Timeline — career / milestone timeline
- Feature cards — facts / highlights

**Gallery**
- Gallery grid

**News / Updates**
- Post feed *(dynamic)*

**Contact**
- Contact form

---

#### Family Site

**Home**
- Hero — family photo, family name heading, tagline
- Post feed *(dynamic)* — recent updates
- Events list *(dynamic)* — upcoming family events (from Scheduler)

**About**
- Team grid — family members (photo, name, short bio)
- Text section — family story

**Gallery**
- Gallery grid

**Events**
- Events list *(dynamic)*

**Blog**
- Post feed *(dynamic)*

---

---

### BUSINESS

---

#### Company Website

**Home**
- Hero — brand image, company name, value proposition, "Get started" + "Learn more" CTAs
- Feature cards — services overview (icon, name, description)
- Stats — years in business, clients, projects
- Testimonials
- CTA banner — "Ready to work together?"

**About**
- Text section — company story / mission
- Timeline — company milestones
- Team grid

**Services**
- Feature cards — service cards (icon, name, description, CTA)

**Team**
- Team grid

**Testimonials**
- Testimonials (full page)

**Blog**
- Post feed *(dynamic)*

**Contact**
- Contact form
- Map embed
- Social links

---

#### E-commerce / Store

**Home**
- Hero — product/brand image, headline, "Shop now" CTA
- Product grid — featured products
- Feature cards — category highlights
- CTA banner — promotion / sale

**Shop**
- Product grid — full catalog with filter/sort

**About**
- Image + text — brand story
- Feature cards — brand values

**Contact**
- Contact form
- FAQ

---

#### Retail Store

**Home**
- Hero — store front or product image, store name, tagline, "Shop now" CTA
- Product grid — featured / new arrivals
- CTA banner — current promotion
- Map embed — with store hours

**Products**
- Product grid

**About**
- Image + text — store story, founding
- Team grid *(optional)*

**Store Info**
- Map embed — address, directions, parking
- Text section — hours, accessibility info

**Contact**
- Contact form
- Social links

---

#### Professional Services

**Home**
- Hero — professional image, firm name, tagline, "Book a consultation" CTA
- Feature cards — services overview
- Stats — years experience, clients served, cases won / projects delivered
- Testimonials
- CTA banner — "Schedule your consultation"

**Services**
- Feature cards — detailed service cards with description and pricing range
- FAQ

**About / Team**
- Image + text — firm story / founding
- Team grid

**Case Studies**
- Gallery grid — project cards (image, client name, industry, outcome headline, read more)

**Testimonials**
- Testimonials (full page)

**Contact**
- Contact form
- Map embed
- Social links

---

#### Restaurant / Food & Beverage

**Home**
- Hero — food/ambiance photo, restaurant name, tagline, "Reserve a table" CTA
- Text section — restaurant concept / story
- Map embed — address, hours
- Events list *(dynamic)* — upcoming specials / events

**Menu**
- Menu section ×N — appetizers, mains, desserts, drinks (each: item name, description, price, dietary tags)

**About**
- Image + text — founder/chef story
- Timeline — restaurant history

**Reservations**
- Booking / reservation form

**Gallery**
- Gallery grid — food and ambiance photos

**Contact**
- Map embed
- Contact form
- Social links

---

#### Real Estate

**Home**
- Hero — property/lifestyle image, agent/firm name, tagline, "Find your home" CTA
- Product grid — featured listings (property image, address, price, beds/baths)
- Stats — homes sold, years experience, areas served
- Testimonials
- CTA banner — "Book a consultation"

**Listings**
- Product grid — full listing catalog

**About**
- Image + text — agent/team bio, credentials
- Stats
- Timeline *(optional)* — career highlights

**Testimonials**
- Testimonials (full page)

**Contact**
- Contact form
- Map embed
- Social links

---

#### Agency

**Home**
- Hero — brand image, agency name, tagline, "See our work" + "Get in touch" CTAs
- Feature cards — services overview
- Gallery grid — featured work
- Feature cards — client logos (image + link)
- Testimonials
- CTA banner

**Services**
- Feature cards — detailed service descriptions

**Work / Portfolio**
- Gallery grid — project cards (image, client, description, result)

**About**
- Text section — agency story / culture
- Timeline — founding + milestones
- Team grid

**Testimonials**
- Testimonials (full page)

**Blog**
- Post feed *(dynamic)*

**Contact**
- Contact form
- Map embed *(optional)*
- Social links

---

#### Startup / SaaS

**Home**
- Hero — product screenshot/illustration, product name, value prop headline, "Get started free" + "See how it works" CTAs
- Feature cards — key features (icon, name, description)
- Stats — users, uptime, satisfaction
- Testimonials
- CTA banner — final conversion prompt

**Product / Features**
- Feature cards — detailed feature breakdown
- Video embed — product demo or walkthrough
- FAQ

**Pricing**
- Pricing table — tiers with feature list and CTA per tier
- FAQ — pricing questions

**About**
- Image + text — founder story
- Team grid
- Timeline — company milestones

**Blog**
- Post feed *(dynamic)*

**Contact**
- Contact form
- FAQ
- Social links

---

---

### CONTENT / INFLUENCER

---

#### Video Creator

**Home**
- Hero — channel banner, creator name, subscriber count (stat), "Subscribe" CTA
- Video embed — featured / latest video
- Post feed *(dynamic)* — recent videos feed
- Social links

**Videos**
- Post feed *(dynamic)* — full video archive with thumbnail, title, date, description

**About**
- Image + text — creator photo, bio, content focus
- Stats — subscribers, total views, videos published
- Social links

**Merch** *(optional)*
- Product grid

**Contact**
- Contact form — collaboration / brand inquiry
- Social links

---

#### Podcaster

**Home**
- Hero — podcast cover art, show name, tagline, "Subscribe" CTA
- Audio player — latest episode
- Episode list — recent episodes preview
- Newsletter signup

**Episodes**
- Episode list — full episode archive (cover, title, date, duration, play button, description)

**About**
- Image + text — host photo, bio
- Text section — show description, topics, audience

**Guests**
- Team grid — guest cards (photo, name, episode title, link)

**Contact**
- Contact form — pitch / booking form
- Social links

---

#### Streamer

**Home**
- Hero — stream banner, streamer name, tagline, "Watch live" CTA
- Social feed *(dynamic)* — live status / recent stream activity
- Events list *(dynamic)* — upcoming stream schedule (from Scheduler)
- Social links — Twitch, Discord, YouTube, etc.

**Schedule**
- Events list *(dynamic)* — full stream schedule with recurring entries

**About**
- Image + text — avatar, bio, content/game focus
- Stats — followers, hours streamed, peak viewers
- Feature cards — games / categories

**Contact**
- Contact form — sponsorship / collab
- Social links

---

#### Writer / Blogger

**Home**
- Hero — author photo, name, tagline, "Read my work" CTA
- Post feed *(dynamic)* — featured / recent posts
- Newsletter signup

**Posts**
- Post feed *(dynamic)* — full archive with title, date, excerpt, category tags

**About**
- Image + text — photo, bio, writing style / focus
- Text section — publications / credits
- Social links

**Newsletter**
- Text section — newsletter description, what subscribers get
- Newsletter signup
- Post feed *(dynamic)* — archive of past issues

**Contact**
- Contact form
- Social links

---

#### Photographer

**Home**
- Hero — signature full-bleed photo, name, "View my work" CTA
- Gallery grid — featured images
- Feature cards — photography genres / services
- CTA banner — "Book a session"

**Gallery**
- Gallery grid — full portfolio, full-bleed

**Collections**
- Gallery grid — collection cards (cover image, title, image count)

**About**
- Image + text — photographer portrait, bio, style description

**Contact / Booking**
- Booking / reservation form
- Feature cards — packages and pricing
- Social links

---

#### Musician / Band

**Home**
- Hero — artist/band photo, name, latest release CTA
- Audio player — latest single/album embed
- Events list *(dynamic)* — upcoming shows (from Scheduler)
- Social links

**Music**
- Discography — album/single cards (cover art, title, year, stream/buy links)

**Shows / Tour**
- Events list *(dynamic)* — full tour schedule (date, venue, city, ticket CTA)

**About**
- Image + text — artist/band photo, bio
- Team grid *(band members: photo, name, instrument)*

**Press**
- Testimonials — press quote cards (quote, publication, date)
- CTA banner — "Download press kit"

**Contact**
- Contact form — booking / label / press inquiry
- Social links

---

#### Newsletter

**Home**
- Hero — publication name, tagline, issue count stat, "Subscribe" CTA
- Post feed *(dynamic)* — latest issue preview
- Newsletter signup
- Text section — what subscribers get / about the newsletter

**Archive**
- Post feed *(dynamic)* — full issue archive (title, date, excerpt)

**About**
- Image + text — author photo, bio, publication background

**Subscribe**
- Newsletter signup — expanded with benefits list
- Post feed *(dynamic)* — recent issues preview

**Contact**
- Contact form
- Social links

---

#### Community Builder

**Home**
- Hero — community name, mission statement, member count (stat), "Join us" CTA
- Feature cards — what the community offers
- Stats — members, events run, posts
- Events list *(dynamic)* — upcoming community events

**About**
- Text section — community origin story, values
- Team grid — founders / moderators

**Events**
- Events list *(dynamic)* — full event calendar

**Blog**
- Post feed *(dynamic)*

**Join / Subscribe**
- Feature cards — membership tiers or benefits
- Contact form / sign-up form

**Contact**
- Contact form
- Social links

---

---

### ORGANIZATION

---

#### Nonprofit

**Home**
- Hero — mission image, org name, mission statement heading, "Donate" + "Get involved" CTAs
- Feature cards — programs overview
- Stats — people helped, years operating, funds raised
- Testimonials — beneficiary stories
- CTA banner — "Make a donation today"

**About**
- Text section — founding story, mission, vision
- Timeline — organizational milestones
- Team grid — leadership

**Programs / Work**
- Feature cards — program cards (name, description, impact)

**Impact**
- Stats — impact numbers
- Testimonials — beneficiary / volunteer stories
- Gallery grid *(optional)*

**Get Involved**
- Feature cards — ways to help (volunteer, donate, spread the word)
- Contact form — volunteer sign-up

**Donate**
- CTA banner — giving appeal
- Feature cards — where funds go
- Contact form — donation prompt / link to payment processor

**Contact**
- Contact form
- Map embed
- Social links

---

#### Charity

**Home**
- Hero — cause image, charity name, mission heading, "Donate now" CTA
- Feature cards — causes / campaigns
- Stats — funds raised, people helped, campaigns run
- Events list *(dynamic)* — upcoming fundraising events
- CTA banner — current campaign

**About**
- Text section — org story, mission
- Team grid — leadership + partners

**Causes**
- Feature cards — cause cards with description and progress bar *(static)*

**How to Help**
- Feature cards — donate, volunteer, in-kind giving
- Contact form — volunteer / in-kind inquiry

**Events**
- Events list *(dynamic)*

**Contact**
- Contact form
- Map embed

---

#### Church / Faith Community

**Home**
- Hero — community photo, church name, welcome heading, "Plan your visit" CTA
- Text section — service times + location
- Events list *(dynamic)* — upcoming services and events
- Post feed *(dynamic)* — latest messages/announcements
- CTA banner — "Join us this Sunday"

**About**
- Text section — community story, beliefs / statement of faith
- Team grid — pastor(s) / leadership

**Sermons / Messages**
- Episode list — message archive (title, date, speaker, series, audio/video player)

**Events**
- Events list *(dynamic)*

**Give**
- Text section — generosity statement
- CTA banner — giving link / form

**Contact**
- Map embed — with service times
- Contact form
- Social links

---

#### School / Educational Institution

**Home**
- Hero — campus/community photo, institution name, tagline, "Apply now" CTA
- Feature cards — programs overview
- Stats — students enrolled, programs offered, years established
- Events list *(dynamic)* — upcoming events / open days

**About**
- Text section — history, mission, values
- Timeline — institutional milestones
- Team grid — leadership / faculty highlights

**Programs / Courses**
- Feature cards — program cards (title, description, duration, level, "Learn more" CTA)

**Admissions**
- Timeline — admissions process steps
- Feature cards — requirements
- Contact form — "Apply" or inquiry form

**Events**
- Events list *(dynamic)*

**Contact**
- Contact form
- Map embed
- Social links

---

#### Club / Association

**Home**
- Hero — club image, name, tagline, "Join us" CTA
- Text section — what the club is about
- Events list *(dynamic)* — upcoming meetings / events
- Stats — members, years active, events held

**About**
- Text section — founding story, mission
- Team grid — committee / board members

**Members**
- Team grid — member grid *(visibility: selectively shared by default)*

**Events**
- Events list *(dynamic)*

**Blog**
- Post feed *(dynamic)* — club news and updates

**Join**
- Feature cards — membership benefits
- Contact form — application / sign-up

**Contact**
- Contact form
- Social links

---

#### Political / Advocacy

**Home**
- Hero — candidate/cause image, name, tagline, "Donate" + "Volunteer" CTAs
- Feature cards — issues / platform overview
- Stats — supporters, events, donations raised
- Events list *(dynamic)* — upcoming events / rallies
- CTA banner — primary campaign action

**About**
- Image + text — candidate/org photo, bio / founding story
- Text section — values, mission

**Issues / Platform**
- Feature cards — issue cards (title, position statement, description)

**News**
- Post feed *(dynamic)*

**Events**
- Events list *(dynamic)*

**Get Involved**
- Feature cards — volunteer, donate, spread the word
- Contact form — volunteer sign-up

**Contact**
- Contact form
- Social links

---

#### Events-Based

**Home**
- Hero — event image, event name, date, location, "Get tickets" CTA
- Countdown timer *(dynamic)* — days to event
- Feature cards — highlights / what to expect
- Post feed *(dynamic)* — lineup / speaker preview

**Events**
- Events list *(dynamic)* — schedule / program with session detail

**About**
- Text section — organizer story, event history
- Stats — past attendees, editions, speakers

**Speakers / Lineup**
- Team grid — speaker/performer cards (photo, name, title/role, bio, session link)

**Tickets**
- Pricing table — ticket tiers (name, price, inclusions, "Buy" CTA)
- FAQ — ticketing questions

**Contact**
- Contact form
- Map embed — venue
- FAQ

---

## Open Items

- Final approval on block sets per page (some pages may need additions or removals)
- Whether users can save custom blocks/modules as reusable components in their library
- Block pre-population behavior when a use is selected mid-wizard vs. added later
- Page templates for the "Other" use under each purpose
- Collaborative editing and version history
