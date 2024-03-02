# Meeting notes

## Open Questions

- Do we have a SKU 0? What's with SKU 5000 and 10000 then?
- admin account for VPS
- other orgs
- philscore docs notes
- Spherical equivs: Can they go negative like this?
  ```json
     {
        cylinder: -1,
        sphere: 0.25,
     },
     {
        cylinder: -0.5,
        sphere: 0.0,
     },
     {
        cylinder: 0.0,
        sphere: -0.25,
     }
  ```

## 9.9.22

- make it clear which location we are in when adding glasses
- empty cyl = 0
- change wording leading zeros
- horizotnal input fields would be nicer

## 6.4.22 Feedback analysis

### Find

- We typically use an external number keypad to expedite searches. It is helpful if the enter key on the number pad performs like a tab key to jump to the next field. As it operates now, the enter key acts as a search command and I have to use my left hand to hit tab on the laptop keyboard. If I could keep all inputs on the external keypad and simply select single vision or multifocal, hit enter, input a number, hit enter, input a number, hit enter, etc. until enter brings me to the last field and then enter will trigger a search.
- In the event of an unsuccessful match, it would be beneficial to be prompted with an option to look for a spherical equivalent (remove an amount of cyl and add half that amount to sphere). It would be great to see instant matches as we adjust cyl on the fly
- In the event of an unsuccessful bifocal match, an additional prompt to search for two pair (one pair for near and one for far) is very helpul.
  - => this is not very important right now, good idea, maybe for the future
- Have we abandoned the concept of a Philscore to help assess how close a match we have? Many of us running the computers in the dispensary don’t have backgrounds in optometry and this is a nice sanity check.
  - => maybe make it clearer what the number is.
- Minor point, but the axis field requires 3 digits to be entered. I would personally like to enter and axis value of 9 by hitting the number 9 and having the program populate the zeros. I know it sounds silly, but when you have a dozen yellow sheets stacked up, being able to quickly bang out prescriptions on the keypad is essential.
  - => diane wants it that way
- Is it possible to have an “Edit/undo” option in the event someone hits enter and accidentally marks a pair as dispensed.
  - => maybe make it more clear? but no priority
- There doesn’t currently appear to be a dispensing option for readers. We obviously like to track that
  - => currently there is a tallysheet, we could implement that
- In the event we don’t have suitable glasses for a patient we have the ability to have them made. We track the number of pairs as well as the prescription made. This is typically done in a separate excel spreadsheet, but it would be much nicer to input it on this page and have it part of the overall records.
  - => new feature, low priority, lot of works

### “Create Reports”

- I may be missing something, but this section doesn’t seem to be functional. Obviously, we need to be able to determine the number of glasses dispensed (prescription, readers, and made) sortable by date range.
  - => yes, missing will be implemented
- It would be very useful to be able to generate a report of our current inventory by prescription parameters (number of pairs at certain sphere values, cylinder values, etc.).
  - => maybe together with the create reports feature in the backend
- Not totally necessary, but a report of dispensed glasses organized by prescription parameters over variable date ranges would be nice in order to evaluate historical trends.
  - => not necessary
- We should have the ability to view the number of available slots at any given time
  - => implement it, maybe just in the frotnend?
- How do we deal with the gap in time from when we enter new glasses into the db until they physically arrive in ES. Can we have an option to “Enter into queue” and then get assigned number, but the program will know that they are not available for dispensing until we actively tell the system to “enter queue into db”. This is really only applicable if we are letting people in ES use the inventory in our absence, but it feels like we are leaning that way.

### General

- Am I correct that this program will only function with internet functionality? That is to say, is there a capacity for us to dispense when we are offline and then reconcile the database when we regain connectivity?
  - => yes it will work. Maybe some status.
  -
  -

## 6.3.23

- BAL lenses: when it's not worth correcting or user has a protheses. BAL lens is used for aestheatic reasons. It means the RX of the other eye doesn't matter, but it's important to keep the Sphere as similiar as possible.

## 23.6.23

- Glasses that would work well, but OD/OS are swapped => rather not, because swapping lenses needs an optometrist on site
- show bal lens
  - which range to filter? => +- 1 is fine
  - sphere only or also sphereical equivalents? => also spherical equivalents
- monitoring dashboard

  - sphere combination. calc avg of glasses or like currently? => diane will think about it, use OD only for now
  - smaller resolution? it's possible to do smaller histogram res => grouping into 1.0 bins is fine

- switch disable OD with stuff in ()
- this years packing day is in october

## 19.7.23

Grafana use case: Wants to repopulate DB by adding glasses only. Add a new dashboard for that and remove the stats from the main dashboard.

- Needed numbers of glasses that should be added, to make the inventory as close to the last campaigns as possible
- Maybe show percentage as well, but it's not that important
- Show number of free slots.
- Dont show a time picker, its always now
- Keep the old stats, where one can see which glasses could be deleted for a better inventory. But it's not relevant while adding.
- Optionally add the old REIMS1 dispension data from previous campaigns

## 26.2.24

- first mail example 3 is really close tho
- first maill 1vs2 is fine, ignore
- first mial notperfect is fine as well, its just axis and ignroe it for now

- second mail, ex2 modify axis maybe, check with REIMS1
- second mail, ex1 probably a bug, theres 0 cyl but axis still filtering?? bi3 should show up in non BAL search

- third mail, similiar to shanti
