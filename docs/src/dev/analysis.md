# Analysis of the old system

REIMS can be downloaded from <a :href="$withBase('/reims-new.zip')">here (ZIP)</a>. The <a :href="$withBase('/reims-manual.pdf')">REIMS manual (PDF)</a> gives a very good overview of REIMS.

It's possible to run REIMS inside VirtualBox Windows 95 (find Windows 95 [here](https://archive.org/details/windows_95_vdi)).

_Using a newer Windows might be possible as well._

To run it extract all REIMS zips into **one** folder, because some of the ZIPs contain the Fox Pro 2.6 support library which is required. This is also explained in the REIMS manual.

## Database files from foxpro

Luckily the database extraction is pretty easy thanks to the python `dbfread` library.

The source code of the extractor can be found [here](https://github.com/reims2/reims_dbf_extractor)

An overview over all DBF files from REIMS:

### Important

- Glsku.dbf -- eyeglass inventory db
- Dispense.dbf -- containing a record of dispensed glasses
- Rdinv.dbf -- reader inventory db
- Rdtrak.dbf -- containing a record of dispensed readers

### Unsure

- Deleted.dbf -- a file of available numbers to be reused. _Created by the "Utilities" -> "Make file of available numbers" or by Export/Import -> "Import re-used numbers"_
- Glnxtno.dbf -- a file containing the next serial number to be used (glasses next number)
- Rdadd.dbf -- a file for recording additions to reader inventory
- Readd.dbf -- a file with data entered to replace used numbers

### Other not important stuff

- Bulog.dbf -- a log of backups – also contains the location of the clinic to appear in the window title if desired
- Notfound.dbf -- a file containing the Rx’s of unsuccessful searches
- Reimshlp.dbf -- the help file

### CDX (probably not important)

- Glsku.cdx -- the accompanying index file that allows the data to be displayed in the correct order
- Rdinv.cdx -- the accompanying index
- Readd.cdx -- the accompanying index

on cdx files: https://stackoverflow.com/q/3618633/4026792

## PhilScore

<a :href="$withBase('/philscore-breakdown.pdf')">Philscore Breakdown (PDF)</a>

### Helpful stuff to know:

- Cylinder and axis are coupled together, axis gives rotation. If the cylinder matches but the axis is totally different, that doesn't make sense.
- You always want to match both eyes, never a single one
- The "ignore cyl and axis" function is no longer required
- A prescription can be transformed to another one. That's possible because cylinder abd sphere are coupled together.

### The general process

We first filter out all glasses that wouldn't get a good Philscore anyway. For that:

EITHER

1.  Match Sphere +- Tolerance and
2.  Match Cyl +- Tolerance

OR

1.  Create new possible Rx with SPEQ() (account for the fact that cyl+sphere can be transformed, see below)

But this is just to save computing power probably, so it can be ignored.

Then comes the important stuff:

1. Filter out bad glasses with AtoLTF() (this checks for valid axis tolerances)
2. Rank using RANK() (this gives the philscore)

### AtoLTF()

**It filters all glasses by valid axes. The axis tolerance for that is derived from the cylinder strength.**

Input: zc (Lens cyl), zac (Lens Axis), za (desired axis)

Variables: zat (i.e. AXIS TOLERANCE). A bigger cylinder allows less tolerance for the axis, a smaller one more tolerance.

Returns: Whether the Lens axis is in range of desired axis and the tolerance

See also: [This reference Point 3](https://www.thevisioncouncil.org/sites/default/files/ANSI%20Z80%201-2015_Quick%20Reference%20v2.pdf) or [this paper](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6431005/)

### SPEQ()

**Calculates different possible pairs of glasses for the desired Rx because glasses can be transformed based on sphere+cylinder.**

It works because adding a value to Rx cylinder (remember cyl > 0 not possible!) and subtracting half of that value from the Rx sphere, will give you roughly the same Rx.

Input: desired Sphere, desired Cylinder (_Axis not used here?_)

Calculcates: An array of other possible Rx's (consisting of sphere+cylinder). First pair (cylinder+0.5, sphere-0.25), second (cylinder+1, sphere-0.5), third (cylinder+1.5, sphere-0.75)

Returns: It filters all glasses if they match to one of the newly calculcates Rx's. _It's unclear how the axis is used here? I assume it again calls the AtoLTF function here_

### PhilScore RANK()

**The actual PhilScore/Rank function which calculcates the score**

Input: desired sphere, cyl and add for OS and OD, measured sphere, cyl and add for OS and OD (**no axis??**)

Returns an index based on a lot of conditions

For RANK() see also [this source code from 5 years ago](https://github.com/reims2/reims-web/blob/58a412ef6185b83e2b5dde96f5bd800d2fb63ecb/app/records/eyeglassRecords.ts#L151-L172)

## Helpful stuff

> SA and SM are the 2 sites

> There is no correlation between the SKU and the power of the glasses that is assigned to it (so the SKU can be generated automatically)

SKU= Stock keeping unit i.e. serial number
