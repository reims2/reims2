# User stories

Rx = Prescription = A pair of glasses descriped by its parameters like strength and others

## Process on site

Patient with bad sight visits the clinc in El Salvador and leaves with matching glasses (best case).

1. Check-up by a doc, who measures eye sight
   - most time-consuming task here
2. If glasses are deemed neccessary, the patient gets a sheet of paper with their Rx/diagnosis written on it
3. Patient proceeds to the next station, where he gives his Rx to the computer person
4. Rx is entered into the program (mostly with a USB numpad only), that should be able to run offline.
5. The program outputs the 3 best fitting glasses and their SKU (serial number), by which they are sorted in the storage.
   - The matching algorithm is described in PDF "REIMS Philscore Breakdown"
6. Some other guy fetches the 3 glasses from the storage. The glasses are sorted by SKU in boxes.
   - The fetching process takes a few minutes.
   - Meanwhile, the computer person might repeat the matching process for other patients, so other guys can fetch their best matching glasses simultanously
7. The patient tries out the 3 glasses and picks their favorite. They leave the clinic with their favorite glasses.
8. The empty plastic bag, which the picked glasses were in, is stored in a seperate "dispensed" container. The computer person records them as "dispensed" in the DB as soon as he has some time inbetween.

### Other things that happen on site

A retrieved SKU bag has been empty.

- The computer person marks the bag as deleted (and not dispensed?), so it can be refilled back in America.

The Rx on the bag is different (because wrong data was entered).

- The computer person directly corrects the Rx in the DB so it's correct in the future

## Back in America

### Inventory analysis

A person in America wants to know which glasses to refill.

For that, the following data of that campaign is relevant:

- Total number of dispensed glasses by type (bifocal or single)
- Number of dispensed glasses **per strength category** and type
- Their knowledge about common Rx's
- Not as relevant, but interesting: Failed matches in that campaign.

The decision is done by a manual analysis with excel. For the current state it would be enough to do an export to Excel.

### Process for entering new data

One or multiple persons in America refill the glasses inventory to the possible 10k glasses.

1. The donated glasses from all over America are collected. Glasses are cleaned and measured. All glasses are stored in a plastic bag with the measured Rx written on them.
   - Those glasses are not yet recorded inside the DB, as it'd be too tedious to enter them all.
2. They pick new glasses for entering to inventory (after analysis, see previous section) and enter them into the program (mostly with a USB numpad only).
   - It should be possible to do this step and the next one with multiple people simultanously all over America.
3. The program outputs the selected SKU and the person writes it also on the plastic bag.
   - The SKU is selected simply by the next free slot, which opened after the dispensing in the previous campaign.
4. This process is repeated until all 10k glasses are refilled again.
