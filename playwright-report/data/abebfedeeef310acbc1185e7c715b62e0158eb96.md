# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual.spec.ts >> Visual Regression >> homepage should look consistent
- Location: tests\e2e\visual.spec.ts:4:7

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

  Expected an image 393px by 1517px, received 393px by 1853px. 125774 pixels (ratio 0.18 of all image pixels) are different.

  Snapshot: homepage.png

Call log:
  - Expect "toHaveScreenshot(homepage.png)" with timeout 5000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - Expected an image 393px by 1517px, received 393px by 1853px. 125774 pixels (ratio 0.18 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - Expected an image 393px by 1517px, received 393px by 1853px. 125774 pixels (ratio 0.18 of all image pixels) are different.

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - link "Skip to main content" [ref=e3] [cursor=pointer]:
      - /url: "#main-content"
    - generic [ref=e5]:
      - banner [ref=e6]:
        - link "MW Content Studio Logo MW Content Studio" [ref=e7] [cursor=pointer]:
          - /url: /
          - generic [ref=e8]:
            - img "MW Content Studio Logo" [ref=e10]
            - generic [ref=e11]: MW Content Studio
        - button "Switch to light theme" [ref=e13] [cursor=pointer]:
          - img [ref=e14]
      - main [ref=e20]:
        - region "Hero" [ref=e21]:
          - generic [ref=e26]: 3 live campaigns right now
          - generic [ref=e27]:
            - heading "Crafting Legacies through Excellence." [level=1] [ref=e28]:
              - text: Crafting Legacies
              - text: through Excellence.
            - paragraph [ref=e29]: The premier network connecting distinguished creators with iconic brands. Built for those who value artistry and the pursuit of a lasting legacy.
          - generic [ref=e30]:
            - generic [ref=e31]:
              - button "I'm a Creator Join an elite network of professional creators" [ref=e33] [cursor=pointer]:
                - img [ref=e35]
                - paragraph [ref=e40]: I'm a Creator
                - paragraph [ref=e41]: Join an elite network of professional creators
                - generic [ref=e43]:
                  - img [ref=e44]
                  - generic [ref=e49]: Sign in with Google
              - link "How it works?" [ref=e50] [cursor=pointer]:
                - /url: /creators
            - generic [ref=e51]:
              - link "I'm a Brand Discover India's most distinguished creative talent Post a Campaign" [ref=e53] [cursor=pointer]:
                - /url: /brands/signup
                - img [ref=e55]
                - paragraph [ref=e59]: I'm a Brand
                - paragraph [ref=e60]: Discover India's most distinguished creative talent
                - generic [ref=e63]: Post a Campaign
              - link "How it works?" [ref=e64] [cursor=pointer]:
                - /url: /brands
          - generic [ref=e65]:
            - generic [ref=e66]:
              - term [ref=e67]: Creators
              - definition [ref=e68]: "246"
            - generic [ref=e69]:
              - term [ref=e70]: Niches
              - definition [ref=e71]: "16"
            - generic [ref=e72]:
              - term [ref=e73]: Verified Brands
              - definition [ref=e74]: 100%
          - status [ref=e75]:
            - generic [ref=e76]: 🤝
            - generic [ref=e77]: Arjun S. is now collaborating with Boat Lifestyle
          - generic:
            - img
        - region "Creator network" [ref=e78]:
          - generic [ref=e79]:
            - paragraph [ref=e80]: Creator network
            - heading "Tamil Nadu's top creators, all in one place" [level=2] [ref=e81]
            - paragraph [ref=e82]: Fitness · Tech · Food · Beauty · Travel · Finance · Gaming · and more
          - generic [ref=e83]:
            - paragraph [ref=e84]: Our creator network includes niches such as Tech, Fitness, Food, Finance, Beauty, Travel, Lifestyle, Gaming, Fashion, Health, Education, and Sports — across YouTube and Instagram.
            - generic [ref=e85]:
              - generic [ref=e87]:
                - generic [ref=e88]:
                  - generic [ref=e89]:
                    - generic [ref=e90]: K
                    - generic [ref=e91]:
                      - paragraph [ref=e92]: Karthik Raja
                      - paragraph [ref=e93]: 125K followers
                  - generic [ref=e94]:
                    - generic [ref=e95]: Tech
                    - generic [ref=e96]: YouTube
                    - generic [ref=e97]: ★ 4.8
                - generic [ref=e98]:
                  - generic [ref=e99]:
                    - generic [ref=e100]: P
                    - generic [ref=e101]:
                      - paragraph [ref=e102]: Priya Mani
                      - paragraph [ref=e103]: 89K followers
                  - generic [ref=e104]:
                    - generic [ref=e105]: Fitness
                    - generic [ref=e106]: Instagram
                    - generic [ref=e107]: ★ 4.9
                - generic [ref=e108]:
                  - generic [ref=e109]:
                    - generic [ref=e110]: A
                    - generic [ref=e111]:
                      - paragraph [ref=e112]: Anjali Devi
                      - paragraph [ref=e113]: 210K followers
                  - generic [ref=e114]:
                    - generic [ref=e115]: Food
                    - generic [ref=e116]: Instagram
                    - generic [ref=e117]: ★ 4.7
                - generic [ref=e118]:
                  - generic [ref=e119]:
                    - generic [ref=e120]: V
                    - generic [ref=e121]:
                      - paragraph [ref=e122]: Vignesh K.
                      - paragraph [ref=e123]: 180K followers
                  - generic [ref=e124]:
                    - generic [ref=e125]: Finance
                    - generic [ref=e126]: YouTube
                    - generic [ref=e127]: ★ 4.8
                - generic [ref=e128]:
                  - generic [ref=e129]:
                    - generic [ref=e130]: S
                    - generic [ref=e131]:
                      - paragraph [ref=e132]: Selvi Selvam
                      - paragraph [ref=e133]: 95K followers
                  - generic [ref=e134]:
                    - generic [ref=e135]: Beauty
                    - generic [ref=e136]: Instagram
                    - generic [ref=e137]: ★ 4.9
                - generic [ref=e138]:
                  - generic [ref=e139]:
                    - generic [ref=e140]: M
                    - generic [ref=e141]:
                      - paragraph [ref=e142]: Madhavan R.
                      - paragraph [ref=e143]: 150K followers
                  - generic [ref=e144]:
                    - generic [ref=e145]: Travel
                    - generic [ref=e146]: YouTube
                    - generic [ref=e147]: ★ 4.6
                - generic [ref=e148]:
                  - generic [ref=e149]:
                    - generic [ref=e150]: K
                    - generic [ref=e151]:
                      - paragraph [ref=e152]: Karthik Raja
                      - paragraph [ref=e153]: 125K followers
                  - generic [ref=e154]:
                    - generic [ref=e155]: Tech
                    - generic [ref=e156]: YouTube
                    - generic [ref=e157]: ★ 4.8
                - generic [ref=e158]:
                  - generic [ref=e159]:
                    - generic [ref=e160]: P
                    - generic [ref=e161]:
                      - paragraph [ref=e162]: Priya Mani
                      - paragraph [ref=e163]: 89K followers
                  - generic [ref=e164]:
                    - generic [ref=e165]: Fitness
                    - generic [ref=e166]: Instagram
                    - generic [ref=e167]: ★ 4.9
                - generic [ref=e168]:
                  - generic [ref=e169]:
                    - generic [ref=e170]: A
                    - generic [ref=e171]:
                      - paragraph [ref=e172]: Anjali Devi
                      - paragraph [ref=e173]: 210K followers
                  - generic [ref=e174]:
                    - generic [ref=e175]: Food
                    - generic [ref=e176]: Instagram
                    - generic [ref=e177]: ★ 4.7
                - generic [ref=e178]:
                  - generic [ref=e179]:
                    - generic [ref=e180]: V
                    - generic [ref=e181]:
                      - paragraph [ref=e182]: Vignesh K.
                      - paragraph [ref=e183]: 180K followers
                  - generic [ref=e184]:
                    - generic [ref=e185]: Finance
                    - generic [ref=e186]: YouTube
                    - generic [ref=e187]: ★ 4.8
                - generic [ref=e188]:
                  - generic [ref=e189]:
                    - generic [ref=e190]: S
                    - generic [ref=e191]:
                      - paragraph [ref=e192]: Selvi Selvam
                      - paragraph [ref=e193]: 95K followers
                  - generic [ref=e194]:
                    - generic [ref=e195]: Beauty
                    - generic [ref=e196]: Instagram
                    - generic [ref=e197]: ★ 4.9
                - generic [ref=e198]:
                  - generic [ref=e199]:
                    - generic [ref=e200]: M
                    - generic [ref=e201]:
                      - paragraph [ref=e202]: Madhavan R.
                      - paragraph [ref=e203]: 150K followers
                  - generic [ref=e204]:
                    - generic [ref=e205]: Travel
                    - generic [ref=e206]: YouTube
                    - generic [ref=e207]: ★ 4.6
              - generic [ref=e209]:
                - generic [ref=e210]:
                  - generic [ref=e211]:
                    - generic [ref=e212]: K
                    - generic [ref=e213]:
                      - paragraph [ref=e214]: Kausalya G.
                      - paragraph [ref=e215]: 67K followers
                  - generic [ref=e216]:
                    - generic [ref=e217]: Lifestyle
                    - generic [ref=e218]: Instagram
                    - generic [ref=e219]: ★ 4.7
                - generic [ref=e220]:
                  - generic [ref=e221]:
                    - generic [ref=e222]: G
                    - generic [ref=e223]:
                      - paragraph [ref=e224]: Goutham J.
                      - paragraph [ref=e225]: 320K followers
                  - generic [ref=e226]:
                    - generic [ref=e227]: Gaming
                    - generic [ref=e228]: YouTube
                    - generic [ref=e229]: ★ 4.8
                - generic [ref=e230]:
                  - generic [ref=e231]:
                    - generic [ref=e232]: R
                    - generic [ref=e233]:
                      - paragraph [ref=e234]: Ramya Ram
                      - paragraph [ref=e235]: 145K followers
                  - generic [ref=e236]:
                    - generic [ref=e237]: Fashion
                    - generic [ref=e238]: Instagram
                    - generic [ref=e239]: ★ 4.9
                - generic [ref=e240]:
                  - generic [ref=e241]:
                    - generic [ref=e242]: D
                    - generic [ref=e243]:
                      - paragraph [ref=e244]: Dinesh Kumar
                      - paragraph [ref=e245]: 98K followers
                  - generic [ref=e246]:
                    - generic [ref=e247]: Health
                    - generic [ref=e248]: YouTube
                    - generic [ref=e249]: ★ 4.7
                - generic [ref=e250]:
                  - generic [ref=e251]:
                    - generic [ref=e252]: S
                    - generic [ref=e253]:
                      - paragraph [ref=e254]: Shalini S.
                      - paragraph [ref=e255]: 230K followers
                  - generic [ref=e256]:
                    - generic [ref=e257]: Education
                    - generic [ref=e258]: YouTube
                    - generic [ref=e259]: ★ 4.8
                - generic [ref=e260]:
                  - generic [ref=e261]:
                    - generic [ref=e262]: S
                    - generic [ref=e263]:
                      - paragraph [ref=e264]: Suresh Raina
                      - paragraph [ref=e265]: 175K followers
                  - generic [ref=e266]:
                    - generic [ref=e267]: Sports
                    - generic [ref=e268]: Instagram
                    - generic [ref=e269]: ★ 4.6
                - generic [ref=e270]:
                  - generic [ref=e271]:
                    - generic [ref=e272]: K
                    - generic [ref=e273]:
                      - paragraph [ref=e274]: Kausalya G.
                      - paragraph [ref=e275]: 67K followers
                  - generic [ref=e276]:
                    - generic [ref=e277]: Lifestyle
                    - generic [ref=e278]: Instagram
                    - generic [ref=e279]: ★ 4.7
                - generic [ref=e280]:
                  - generic [ref=e281]:
                    - generic [ref=e282]: G
                    - generic [ref=e283]:
                      - paragraph [ref=e284]: Goutham J.
                      - paragraph [ref=e285]: 320K followers
                  - generic [ref=e286]:
                    - generic [ref=e287]: Gaming
                    - generic [ref=e288]: YouTube
                    - generic [ref=e289]: ★ 4.8
                - generic [ref=e290]:
                  - generic [ref=e291]:
                    - generic [ref=e292]: R
                    - generic [ref=e293]:
                      - paragraph [ref=e294]: Ramya Ram
                      - paragraph [ref=e295]: 145K followers
                  - generic [ref=e296]:
                    - generic [ref=e297]: Fashion
                    - generic [ref=e298]: Instagram
                    - generic [ref=e299]: ★ 4.9
                - generic [ref=e300]:
                  - generic [ref=e301]:
                    - generic [ref=e302]: D
                    - generic [ref=e303]:
                      - paragraph [ref=e304]: Dinesh Kumar
                      - paragraph [ref=e305]: 98K followers
                  - generic [ref=e306]:
                    - generic [ref=e307]: Health
                    - generic [ref=e308]: YouTube
                    - generic [ref=e309]: ★ 4.7
                - generic [ref=e310]:
                  - generic [ref=e311]:
                    - generic [ref=e312]: S
                    - generic [ref=e313]:
                      - paragraph [ref=e314]: Shalini S.
                      - paragraph [ref=e315]: 230K followers
                  - generic [ref=e316]:
                    - generic [ref=e317]: Education
                    - generic [ref=e318]: YouTube
                    - generic [ref=e319]: ★ 4.8
                - generic [ref=e320]:
                  - generic [ref=e321]:
                    - generic [ref=e322]: S
                    - generic [ref=e323]:
                      - paragraph [ref=e324]: Suresh Raina
                      - paragraph [ref=e325]: 175K followers
                  - generic [ref=e326]:
                    - generic [ref=e327]: Sports
                    - generic [ref=e328]: Instagram
                    - generic [ref=e329]: ★ 4.6
          - link "Browse Live Deals" [ref=e331] [cursor=pointer]:
            - /url: /explore
        - region "Creator work showcase" [ref=e332]:
          - generic [ref=e333]:
            - generic [ref=e334]:
              - generic [ref=e335]:
                - paragraph [ref=e336]: Live View
                - heading "Content we've created" [level=2] [ref=e337]
              - generic [ref=e338]:
                - img "Instagram" [ref=e340]
                - img "YouTube" [ref=e343]
            - button "Play video by Daniel J Raj" [ref=e346] [cursor=pointer]:
              - generic [ref=e347]:
                - generic [ref=e349]: DJ
                - img [ref=e353]
                - img [ref=e357]
              - generic [ref=e359]:
                - generic [ref=e360]:
                  - paragraph [ref=e361]: Daniel J Raj
                  - paragraph [ref=e362]: Chennai Realty
                - generic [ref=e363]: Real Estate
      - contentinfo [ref=e364]:
        - link "Terms" [ref=e365] [cursor=pointer]:
          - /url: /terms
        - link "Privacy" [ref=e366] [cursor=pointer]:
          - /url: /privacy
        - link "Help" [ref=e367] [cursor=pointer]:
          - /url: /help
        - link "WhatsApp" [ref=e368] [cursor=pointer]:
          - /url: https://wa.me/918428601947
  - alert [ref=e369]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Visual Regression', () => {
  4  |   test('homepage should look consistent', async ({ page }) => {
  5  |     await page.goto('/');
  6  |     
  7  |     // Wait for everything to settle (images, fonts, etc.)
  8  |     await page.waitForLoadState('networkidle');
  9  |     
  10 |     // This will take a screenshot and compare it with the baseline.
  11 |     // The first time you run this, it will fail and create the baseline images.
> 12 |     await expect(page).toHaveScreenshot('homepage.png', {
     |                        ^ Error: expect(page).toHaveScreenshot(expected) failed
  13 |       maxDiffPixelRatio: 0.1, // Allow for small differences (e.g. anti-aliasing)
  14 |       fullPage: true,
  15 |     });
  16 |   });
  17 | 
  18 |   test('brand signup page should look consistent', async ({ page }) => {
  19 |     await page.goto('/brands/signup');
  20 |     await page.waitForLoadState('networkidle');
  21 |     
  22 |     await expect(page).toHaveScreenshot('brand-signup.png', {
  23 |       maxDiffPixelRatio: 0.1,
  24 |       fullPage: true,
  25 |     });
  26 |   });
  27 | });
  28 | 
```