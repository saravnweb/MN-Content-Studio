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

  Expected an image 1280px by 1504px, received 1280px by 1883px. 477247 pixels (ratio 0.20 of all image pixels) are different.

  Snapshot: homepage.png

Call log:
  - Expect "toHaveScreenshot(homepage.png)" with timeout 5000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - Expected an image 1280px by 1504px, received 1280px by 1883px. 477247 pixels (ratio 0.20 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - Expected an image 1280px by 1504px, received 1280px by 1883px. 477247 pixels (ratio 0.20 of all image pixels) are different.

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
        - generic [ref=e12]:
          - link "Browse Deals" [ref=e13] [cursor=pointer]:
            - /url: /explore
          - button "Switch to light theme" [ref=e14] [cursor=pointer]:
            - img [ref=e15]
      - main [ref=e21]:
        - region "Hero" [ref=e22]:
          - generic [ref=e27]: 3 live campaigns right now
          - generic [ref=e28]:
            - heading "Crafting Legacies through Excellence." [level=1] [ref=e29]:
              - text: Crafting Legacies
              - text: through Excellence.
            - paragraph [ref=e30]: The premier network connecting distinguished creators with iconic brands. Built for those who value artistry and the pursuit of a lasting legacy.
          - generic [ref=e31]:
            - generic [ref=e32]:
              - button "I'm a Creator Join an elite network of professional creators" [ref=e34] [cursor=pointer]:
                - img [ref=e36]
                - paragraph [ref=e41]: I'm a Creator
                - paragraph [ref=e42]: Join an elite network of professional creators
                - generic [ref=e44]:
                  - img [ref=e45]
                  - generic [ref=e50]: Sign in with Google
              - link "How it works?" [ref=e51] [cursor=pointer]:
                - /url: /creators
            - generic [ref=e52]:
              - link "I'm a Brand Discover India's most distinguished creative talent Post a Campaign" [ref=e54] [cursor=pointer]:
                - /url: /brands/signup
                - img [ref=e56]
                - paragraph [ref=e60]: I'm a Brand
                - paragraph [ref=e61]: Discover India's most distinguished creative talent
                - generic [ref=e64]: Post a Campaign
              - link "How it works?" [ref=e65] [cursor=pointer]:
                - /url: /brands
          - generic [ref=e66]:
            - generic [ref=e67]:
              - term [ref=e68]: Creators
              - definition [ref=e69]: "246"
            - generic [ref=e70]:
              - term [ref=e71]: Niches
              - definition [ref=e72]: "16"
            - generic [ref=e73]:
              - term [ref=e74]: Verified Brands
              - definition [ref=e75]: 100%
          - status [ref=e76]:
            - generic [ref=e77]: 🤝
            - generic [ref=e78]: Arjun S. is now collaborating with Boat Lifestyle
          - generic:
            - img
        - region "Creator network" [ref=e79]:
          - generic [ref=e80]:
            - paragraph [ref=e81]: Creator network
            - heading "Tamil Nadu's top creators, all in one place" [level=2] [ref=e82]
            - paragraph [ref=e83]: Fitness · Tech · Food · Beauty · Travel · Finance · Gaming · and more
          - generic [ref=e84]:
            - paragraph [ref=e85]: Our creator network includes niches such as Tech, Fitness, Food, Finance, Beauty, Travel, Lifestyle, Gaming, Fashion, Health, Education, and Sports — across YouTube and Instagram.
            - generic [ref=e86]:
              - generic [ref=e88]:
                - generic [ref=e89]:
                  - generic [ref=e90]:
                    - generic [ref=e91]: K
                    - generic [ref=e92]:
                      - paragraph [ref=e93]: Karthik Raja
                      - paragraph [ref=e94]: 125K followers
                  - generic [ref=e95]:
                    - generic [ref=e96]: Tech
                    - generic [ref=e97]: YouTube
                    - generic [ref=e98]: ★ 4.8
                - generic [ref=e99]:
                  - generic [ref=e100]:
                    - generic [ref=e101]: P
                    - generic [ref=e102]:
                      - paragraph [ref=e103]: Priya Mani
                      - paragraph [ref=e104]: 89K followers
                  - generic [ref=e105]:
                    - generic [ref=e106]: Fitness
                    - generic [ref=e107]: Instagram
                    - generic [ref=e108]: ★ 4.9
                - generic [ref=e109]:
                  - generic [ref=e110]:
                    - generic [ref=e111]: A
                    - generic [ref=e112]:
                      - paragraph [ref=e113]: Anjali Devi
                      - paragraph [ref=e114]: 210K followers
                  - generic [ref=e115]:
                    - generic [ref=e116]: Food
                    - generic [ref=e117]: Instagram
                    - generic [ref=e118]: ★ 4.7
                - generic [ref=e119]:
                  - generic [ref=e120]:
                    - generic [ref=e121]: V
                    - generic [ref=e122]:
                      - paragraph [ref=e123]: Vignesh K.
                      - paragraph [ref=e124]: 180K followers
                  - generic [ref=e125]:
                    - generic [ref=e126]: Finance
                    - generic [ref=e127]: YouTube
                    - generic [ref=e128]: ★ 4.8
                - generic [ref=e129]:
                  - generic [ref=e130]:
                    - generic [ref=e131]: S
                    - generic [ref=e132]:
                      - paragraph [ref=e133]: Selvi Selvam
                      - paragraph [ref=e134]: 95K followers
                  - generic [ref=e135]:
                    - generic [ref=e136]: Beauty
                    - generic [ref=e137]: Instagram
                    - generic [ref=e138]: ★ 4.9
                - generic [ref=e139]:
                  - generic [ref=e140]:
                    - generic [ref=e141]: M
                    - generic [ref=e142]:
                      - paragraph [ref=e143]: Madhavan R.
                      - paragraph [ref=e144]: 150K followers
                  - generic [ref=e145]:
                    - generic [ref=e146]: Travel
                    - generic [ref=e147]: YouTube
                    - generic [ref=e148]: ★ 4.6
                - generic [ref=e149]:
                  - generic [ref=e150]:
                    - generic [ref=e151]: K
                    - generic [ref=e152]:
                      - paragraph [ref=e153]: Karthik Raja
                      - paragraph [ref=e154]: 125K followers
                  - generic [ref=e155]:
                    - generic [ref=e156]: Tech
                    - generic [ref=e157]: YouTube
                    - generic [ref=e158]: ★ 4.8
                - generic [ref=e159]:
                  - generic [ref=e160]:
                    - generic [ref=e161]: P
                    - generic [ref=e162]:
                      - paragraph [ref=e163]: Priya Mani
                      - paragraph [ref=e164]: 89K followers
                  - generic [ref=e165]:
                    - generic [ref=e166]: Fitness
                    - generic [ref=e167]: Instagram
                    - generic [ref=e168]: ★ 4.9
                - generic [ref=e169]:
                  - generic [ref=e170]:
                    - generic [ref=e171]: A
                    - generic [ref=e172]:
                      - paragraph [ref=e173]: Anjali Devi
                      - paragraph [ref=e174]: 210K followers
                  - generic [ref=e175]:
                    - generic [ref=e176]: Food
                    - generic [ref=e177]: Instagram
                    - generic [ref=e178]: ★ 4.7
                - generic [ref=e179]:
                  - generic [ref=e180]:
                    - generic [ref=e181]: V
                    - generic [ref=e182]:
                      - paragraph [ref=e183]: Vignesh K.
                      - paragraph [ref=e184]: 180K followers
                  - generic [ref=e185]:
                    - generic [ref=e186]: Finance
                    - generic [ref=e187]: YouTube
                    - generic [ref=e188]: ★ 4.8
                - generic [ref=e189]:
                  - generic [ref=e190]:
                    - generic [ref=e191]: S
                    - generic [ref=e192]:
                      - paragraph [ref=e193]: Selvi Selvam
                      - paragraph [ref=e194]: 95K followers
                  - generic [ref=e195]:
                    - generic [ref=e196]: Beauty
                    - generic [ref=e197]: Instagram
                    - generic [ref=e198]: ★ 4.9
                - generic [ref=e199]:
                  - generic [ref=e200]:
                    - generic [ref=e201]: M
                    - generic [ref=e202]:
                      - paragraph [ref=e203]: Madhavan R.
                      - paragraph [ref=e204]: 150K followers
                  - generic [ref=e205]:
                    - generic [ref=e206]: Travel
                    - generic [ref=e207]: YouTube
                    - generic [ref=e208]: ★ 4.6
              - generic [ref=e210]:
                - generic [ref=e211]:
                  - generic [ref=e212]:
                    - generic [ref=e213]: K
                    - generic [ref=e214]:
                      - paragraph [ref=e215]: Kausalya G.
                      - paragraph [ref=e216]: 67K followers
                  - generic [ref=e217]:
                    - generic [ref=e218]: Lifestyle
                    - generic [ref=e219]: Instagram
                    - generic [ref=e220]: ★ 4.7
                - generic [ref=e221]:
                  - generic [ref=e222]:
                    - generic [ref=e223]: G
                    - generic [ref=e224]:
                      - paragraph [ref=e225]: Goutham J.
                      - paragraph [ref=e226]: 320K followers
                  - generic [ref=e227]:
                    - generic [ref=e228]: Gaming
                    - generic [ref=e229]: YouTube
                    - generic [ref=e230]: ★ 4.8
                - generic [ref=e231]:
                  - generic [ref=e232]:
                    - generic [ref=e233]: R
                    - generic [ref=e234]:
                      - paragraph [ref=e235]: Ramya Ram
                      - paragraph [ref=e236]: 145K followers
                  - generic [ref=e237]:
                    - generic [ref=e238]: Fashion
                    - generic [ref=e239]: Instagram
                    - generic [ref=e240]: ★ 4.9
                - generic [ref=e241]:
                  - generic [ref=e242]:
                    - generic [ref=e243]: D
                    - generic [ref=e244]:
                      - paragraph [ref=e245]: Dinesh Kumar
                      - paragraph [ref=e246]: 98K followers
                  - generic [ref=e247]:
                    - generic [ref=e248]: Health
                    - generic [ref=e249]: YouTube
                    - generic [ref=e250]: ★ 4.7
                - generic [ref=e251]:
                  - generic [ref=e252]:
                    - generic [ref=e253]: S
                    - generic [ref=e254]:
                      - paragraph [ref=e255]: Shalini S.
                      - paragraph [ref=e256]: 230K followers
                  - generic [ref=e257]:
                    - generic [ref=e258]: Education
                    - generic [ref=e259]: YouTube
                    - generic [ref=e260]: ★ 4.8
                - generic [ref=e261]:
                  - generic [ref=e262]:
                    - generic [ref=e263]: S
                    - generic [ref=e264]:
                      - paragraph [ref=e265]: Suresh Raina
                      - paragraph [ref=e266]: 175K followers
                  - generic [ref=e267]:
                    - generic [ref=e268]: Sports
                    - generic [ref=e269]: Instagram
                    - generic [ref=e270]: ★ 4.6
                - generic [ref=e271]:
                  - generic [ref=e272]:
                    - generic [ref=e273]: K
                    - generic [ref=e274]:
                      - paragraph [ref=e275]: Kausalya G.
                      - paragraph [ref=e276]: 67K followers
                  - generic [ref=e277]:
                    - generic [ref=e278]: Lifestyle
                    - generic [ref=e279]: Instagram
                    - generic [ref=e280]: ★ 4.7
                - generic [ref=e281]:
                  - generic [ref=e282]:
                    - generic [ref=e283]: G
                    - generic [ref=e284]:
                      - paragraph [ref=e285]: Goutham J.
                      - paragraph [ref=e286]: 320K followers
                  - generic [ref=e287]:
                    - generic [ref=e288]: Gaming
                    - generic [ref=e289]: YouTube
                    - generic [ref=e290]: ★ 4.8
                - generic [ref=e291]:
                  - generic [ref=e292]:
                    - generic [ref=e293]: R
                    - generic [ref=e294]:
                      - paragraph [ref=e295]: Ramya Ram
                      - paragraph [ref=e296]: 145K followers
                  - generic [ref=e297]:
                    - generic [ref=e298]: Fashion
                    - generic [ref=e299]: Instagram
                    - generic [ref=e300]: ★ 4.9
                - generic [ref=e301]:
                  - generic [ref=e302]:
                    - generic [ref=e303]: D
                    - generic [ref=e304]:
                      - paragraph [ref=e305]: Dinesh Kumar
                      - paragraph [ref=e306]: 98K followers
                  - generic [ref=e307]:
                    - generic [ref=e308]: Health
                    - generic [ref=e309]: YouTube
                    - generic [ref=e310]: ★ 4.7
                - generic [ref=e311]:
                  - generic [ref=e312]:
                    - generic [ref=e313]: S
                    - generic [ref=e314]:
                      - paragraph [ref=e315]: Shalini S.
                      - paragraph [ref=e316]: 230K followers
                  - generic [ref=e317]:
                    - generic [ref=e318]: Education
                    - generic [ref=e319]: YouTube
                    - generic [ref=e320]: ★ 4.8
                - generic [ref=e321]:
                  - generic [ref=e322]:
                    - generic [ref=e323]: S
                    - generic [ref=e324]:
                      - paragraph [ref=e325]: Suresh Raina
                      - paragraph [ref=e326]: 175K followers
                  - generic [ref=e327]:
                    - generic [ref=e328]: Sports
                    - generic [ref=e329]: Instagram
                    - generic [ref=e330]: ★ 4.6
          - link "Browse Live Deals" [ref=e332] [cursor=pointer]:
            - /url: /explore
        - region "Creator work showcase" [ref=e333]:
          - generic [ref=e334]:
            - generic [ref=e335]:
              - generic [ref=e336]:
                - paragraph [ref=e337]: Live View
                - heading "Content we've created" [level=2] [ref=e338]
              - generic [ref=e339]:
                - img "Instagram" [ref=e341]
                - img "YouTube" [ref=e344]
            - button "Play video by Daniel J Raj" [ref=e347] [cursor=pointer]:
              - generic [ref=e348]:
                - generic [ref=e350]: DJ
                - img [ref=e354]
                - img [ref=e358]
              - generic [ref=e360]:
                - generic [ref=e361]:
                  - paragraph [ref=e362]: Daniel J Raj
                  - paragraph [ref=e363]: Chennai Realty
                - generic [ref=e364]: Real Estate
      - contentinfo [ref=e365]:
        - link "Terms" [ref=e366] [cursor=pointer]:
          - /url: /terms
        - link "Privacy" [ref=e367] [cursor=pointer]:
          - /url: /privacy
        - link "Help" [ref=e368] [cursor=pointer]:
          - /url: /help
        - link "WhatsApp" [ref=e369] [cursor=pointer]:
          - /url: https://wa.me/918428601947
  - alert [ref=e370]
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