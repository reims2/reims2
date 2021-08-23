# Notes & ideas

This is a page for meeting notes and all the ideas I had while exploring the current version of REIMS.

## Open Questions

None

## Ideas

Most of them are just nice-to-have and could be done after the rewrite as a QOL improvement.

- Lens measuring is done with digital devices as well, so it would be nice to automatically import it from there
- QR Code and prescription printing feature?
- Use Grafana for reports!
- Handwrite OCR with mobile phone for entering glasses
- Administration panel for adding new accounts

## Meeting notes 28.04.21

- bifocal = gleichsichtbrille
- progressive = no line bifocal (gleitsicht mit verlauf)

### in america

- empty slots refilled

- sorting by power also required / category: analyze the data/ run reports
- how many slots are empty

- max amount of glasses is limit for shipping

- Rx for right an dleft and additon portion optionally (for bifocal)
- person goes over to dispensing area
- software spits out 3 closest matches
- petient tries it out
- take SKU number and mark it as dispensed

- glasses should be entered with multiple persons
- there is an offline storage unit, where all glasses are stored
  - measeruement is taken before and is noted on the bags. then bags are selected and entered into the unit
- refill just on what's missing
- 0.25 reicht aus,
- readers: shipped seperately, not considered part of the 10k limit. nice-to-have aber nicht wichtig
- power limits within -8 and +8, most -6 and +6

- digital measurement not required
- numeric keypads currently used +1.2 wird zu +1.25
- sequence of fields is important

- we dont need the R-XX prefix

#### on site

- pair of empty bags gets dispensed (in free time)
- 4 patients simultanoulsy, a few runner
- algo is in pdf
- also numpad
- fairly stable, with WiFi. offline support nice
- when no matches: track that search

### report

- nothing for PR purporses, nice to have
- mostly diane as well

- read only would be arlight, but write protection

- login with google would be alright

- administrator,
- make it comatpible for others

## Meeting notes 07.05.21

- single or multifocal, no seperation
- sphere + or - required 00.xx (xx are single digits)
- cyl default to minus one number dot one nmber rounding, (1 decimal)
- AXIS require three digits (including padding)
- addition default to +, never negative

- remove material

- sorting is extremely helpful
- type, od/os cly sphere
- Rx correct is much more important
- also have filtering on site

- deleting on site as well because sometimes bags are empty
- editing in table would be great, if you detect wrong entered glasses, most times on site

- no help text in UI required

- tab to swithc fields
- philscore explanation will follow

-

## Meeting notes 23.8.

- No single eye philscore neccessary!
- No tolerances for search required (philscore will get bad if it's too high anyway)
- Option to "relax axis tolerances" as in old REIMS is not required anymore
- it's not really clear that the current score is the philscore
- just copy the additional field from od to os, don't copy the rest
