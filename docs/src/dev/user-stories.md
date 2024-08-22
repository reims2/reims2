# User Stories

This document compiles a set of user stories. While not exhaustive, it provides a comprehensive overview of the system requirements.

## On-Site Process

In an ideal scenario, a patient with poor vision visits the clinic in El Salvador and departs with suitable glasses.

1. The patient undergoes an eye examination conducted by a doctor, who measures the patient's vision.
   - This is the most time-intensive step.
2. If glasses are required, the patient receives a prescription/diagnosis on a piece of paper.
3. The patient moves to the next station and hands over the prescription to the operator.
4. The operator inputs the prescription into the system (primarily using a USB numpad), which should function offline.
5. The system suggests (the three) best-matching glasses and their SKU (serial number), which corresponds to their storage location.
   - The matching algorithm is detailed in [PhilScore ](/philscore)
6. Another operator retrieves the suggested glasses from the storage, where glasses are organized by SKU.
   - This retrieval process takes a few minutes.
   - In the meantime, the system operator may process other patients' prescriptions, allowing multiple glasses to be retrieved simultaneously.
7. The patient tries on the glasses and selects their preferred pair. They leave the clinic with their chosen glasses.
8. The empty plastic bag, which contained the selected glasses, is placed in a separate `dispensed` container. The system operator marks the glasses as `dispensed` in the database when they have a moment.

### Additional On-Site Activities

Upon arrival, all newly added glasses are registered into the inventory. During this process, the entire inventory is typically reviewed. The following scenarios may occur:

#### An empty SKU bag is retrieved.

- The system operator marks the bag as deleted, allowing it to be refilled back in America.

This also applies when a SKU still exists in the inventory, but a new pair of glasses was already assigned that SKU because it wasn't in the database anymore (this doesn't happen frequently).

#### The prescription on the bag is incorrect (due to data entry errors).

- The system operator corrects the prescription in the database.

## Back in America

### Inventory Analysis

A team member is responsible for determining which glasses need to be restocked. The following campaign data is pertinent:

- Total count of dispensed glasses, sorted by type (multifocal or single-focal)
- Count of dispensed glasses per strength category and type
- Information about prevalent prescriptions
- While not as critical, failed matches from that campaign are also of interest.

The decision is made through a manual analysis using Excel. For the current state, exporting the data to Excel is sufficient.

### Process for Entering New Data

The glasses inventory, which can hold up to 10,000 glasses, is replenished by one or more team members.

1. Glasses donated from various locations are gathered. Each pair is cleaned, measured, and stored in a plastic bag with the measured Rx written on it.
   - These glasses are not immediately recorded in the database to avoid excessive data entry.
2. A team member selects new glasses for inventory entry, based on the analysis (refer to the previous section).
3. The selected glasses are then registered into the system, primarily using a USB numpad.
   - This step and the next one can be performed simultaneously by multiple people.
4. The system generates an SKU for each pair of glasses, which is also written on the plastic bag.
   - The SKU corresponds to the next available slot, which becomes open after the dispensing from the previous campaign.
5. This process continues until all 10,000 glasses are restocked.

The new glasses are stored separately. When the next campaign begins, team members transport them to the campaign location. The integration of the new glasses into the physical inventory typically occurs shortly (usually a day) before the campaign starts.
