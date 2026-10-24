# Midnight Archive App: build brief for Claude Code

You are building the official Midnight Archive mobile app for iPhone and Android. The owner is Jesse, a solo founder and not a developer. Explain each step in plain words, do one milestone at a time, and stop for his OK at the end of each milestone.

## What the business is
Midnight Archive Mailer (midnightarchivemailer.com) is a monthly mystery club. Each month, members get a sealed case file in the mail: a story sheet, a coded Field Kit they crack by hand, a postcard, a collector card and stickers. Each case hides five "hunt" answers. Their first letters spell a keyword. The keyword decodes a transmission into one fragment word. Over the 12-month season, the fragments' first letters spell a passphrase.
There is also a free podcast, The Midnight Archive. Each case file has a full episode (Late Night archivist voice) on YouTube and Spotify, plus free "Archive Extra" episodes and Shorts.
The store runs on Shopify (store handle midnight-archive-mailer). Subscriptions run through Appstle.

## What the app must do
"The Archive in your pocket." It should cover everything the website does and feel fast and polished.
1. Listen: every podcast episode, with a real audio player (background play, lock screen controls, resume, speed control, offline downloads). Also show the YouTube video versions and the Shorts.
2. Play a case: the free Case 000 (The Mary Celeste) is playable without an account (read the story, find the clues, build the key, break the cipher, reveal the ending). After solving, offer an optional email signup for the newsletter.
3. The Vault (members): after login, members see every case they have unlocked. They can read the story, play the Field Kit (auto-built key, verdict poll, saved progress), download the PDFs and play the episode. Locked cases show a "get this case on the website" link.
4. Season progress: a tracker of fragment words earned so far, plus the Keeper's Key for cases unlocked through the Archive Pass.
5. Alerts: push notifications for new episodes, ship day (the 15th), and the join deadline (last day of the month). Each type can be turned on or off.
6. Shop and join: membership plans, merch and gifts, opened in the browser.
7. Theories: members can send a theory on a case (posts to the site form or email).

## Where the data lives (reuse it, do not copy it by hand)
- Podcast RSS: https://anchor.fm/s/118bad8e4/podcast/rss (Spotify show 7ExPZ1dI4yZ4YP8m4GEpWq)
- YouTube channel: @midnightarchivemailer (channel id UCfVs0SSdv6VO6q8U6_cqLSw)
- Shopify Storefront API: products, collections, pages, and Files on cdn.shopify.com. Jesse creates the Storefront token himself (Headless sales channel) and pastes it into .env. Never ask him to paste a token into chat.
- Login: Shopify Customer Account API (passwordless email code, the same login the website Vault uses).
- Vault unlock rules (copy them exactly from the live theme files sections/ma-vault.liquid and snippets/ma-case-reader.liquid; Jesse will download the theme for you):
  - Order month maps to a case: Jul 2026 = 001, Aug 2026 = 002, and so on.
  - Prepaid 3, 6 and 12 month plans unlock 3, 6 or 12 cases.
  - Digital Case File lines unlock the case number at the start of the variant title.
  - The Digital Archive Membership counts like the monthly membership.
  - The Archive Pass unlocks every case shipped by its purchase date.
  - Customer tags vault-N are manual overrides. Comp tags unlock 001.
  - Cancelled and refunded orders are ignored.
  - A case opens after the 15th of its ship month.
- Case content (story text, Field Kit clues, ciphertext, answers) is currently in theme snippets ma-case-data-001 to 003, plus case-000-mary-celeste.js in Shopify Files. Move it into Shopify metaobjects or a small private backend, so it can be updated every month without an app update.

## Security rules (very important)
- Hunt answers, keywords and fragment words must never ship inside the app bundle or reach a logged-out user. Serve case data only after a server-side entitlement check (a small backend such as a Cloudflare Worker or a Shopify app proxy). Test this before every release.
- Case 004 (D.B. Cooper) stays locked until Nov 15, 2026. Case 005 (Krampus) stays locked until Dec 15, 2026, episodes included.
- Never show the unredacted Keeper's Key image publicly.
- Never put tokens or keys in the repo. Use .env and add it to .gitignore.

## Payments (App Store rules)
Do not build in-app purchases. Treat this as a "reader" app where members buy on the website. Mailed memberships, merch and gifts are physical goods and can be sold through an outside link. Digital items (Digital Archive $5/month, Digital Case File $5, Archive Pass) fall under Apple's digital goods rules. Before building any buy button, check the current Apple App Review Guidelines (section 3.1) and the Google Play payments policy, follow what they allow in each country, and explain the choice to Jesse in plain words.

## Brand
- Dark archival look. Background #0b0b0d, panels #121216, amber #e8b04b, seal red #7a1015, text #f2f2f5 and #c9c9d4.
- Fonts: Special Elite (labels), Oswald (headlines), Playfair Display (titles), all free Google Fonts.
- Voice: calm, late-night archivist. Short sentences.
- No em dashes or en dashes anywhere users can see. Use commas, periods or "to".
- Logo: the red wax "MA" seal (take it from the website).

## Tech choices (suggested; explain any change to Jesse first)
- Expo (React Native + TypeScript) with Expo Router. Build and submit with EAS Build and EAS Submit.
- Audio: react-native-track-player (background play, lock screen, downloads).
- Push: Expo Notifications, plus a small scheduled job that checks the RSS feed for new episodes.
- Storage: SecureStore for login, local storage for progress, synced to the account when logged in.
- Accessibility: dynamic text size, screen reader labels, good contrast.
- Store requirements: privacy policy link, account deletion link, app icon, screenshots.

## Milestones (stop after each one for Jesse's OK)
1. Setup: Expo project, brand theme, tabs (Listen, Cases, Vault, Shop, Settings), running on Jesse's phone in Expo Go.
2. Listen: episodes from the RSS feed, full player, downloads, YouTube and Shorts.
3. Free case: Case 000 fully playable, with email capture.
4. Login and Vault: Shopify customer login, entitlement backend, case reader and Field Kit player, season tracker.
5. Alerts and Shop: push notifications, shop and join links, theories form.
6. Test: TestFlight (iPhone) and Internal Testing (Android) builds, plus a checklist for Jesse.
7. Store launch: listings, screenshots, privacy details and review submission. Jesse signs into his own Apple and Google accounts. Never handle his passwords or payment details.

## Working with Jesse
- He reads on his phone. Keep updates short. Ask one multiple-choice question at a time, with the recommended option first.
- Show him anything public (store listing text, screenshots) before it goes live.
- When he must do something himself (create an account, paste a token, approve something in Shopify), give him numbered steps and wait.
