# Genome U-Plot sample implementation 

The Genome U-Plot is a JavaScript tool to visualize Chromosomal abnormalities in the Human Genome using a U-shape layout. 

![](https://github.com/gaitat/GenomeUPlot/data/sampleIdLNCAP.png)

**Note:** This is an example prototype visualization technique. 

## Run a local server

### Node.js server

Node.js has a simple HTTP server package. To install:

```
npm install http-server -g
```

This will install http-server globally so that it may be run from the command line. 
To run (from your local directory):

```
http-server -p 8000
```

### To run the project
Using a modern browser visit:

```
http://localhost:8000/GenomePlot.html?sampleId=LNCAP
```

## Data Visualization

A sample (LNCAP) with all required files is provided in the `data` folder

```
sampleIdLNCAP/LNCAP_alts_comprehensive.csv  (Sample Rearrangements)
sampleIdLNCAP/LNCAP_cnvIntervals.csv        (Sample Copy Number Variation - Intervals)
sampleIdLNCAP/LNCAP_genomePlot_cnv30.json   (Sample Copy Number Variation - Raw Frequency)
sampleIdLNCAP/LNCAP_visualization.json      (Sample Definition)
```

In order to run the application against a different sample (eg. MY_SAMPLE) you need to create 
an appropriate folder and file structure replacing for example LNCAP with MY_SAMPLE. Finally 
don't forget to replace your sample name in the URL parameter of the app.

### Reference file

-   A reference file is provided by the visualization (`reference/cytobands/hg38/cytoBand.json`), 
however if you want to use your own you may download and uncompress a definition file from 
<ftp://hgdownload.cse.ucsc.edu/goldenPath/hg38/database/cytoBand.txt.gz>. 
Then you must convert the file to a json format of the following form:
```javascript
[
    {
        chrom: "chr1",
        chromStart: 0,
        chromEnd: 2300000,
        gieStain: "gneg",
        name: "p36.33"
    }, {
        chrom: "chr1",
        chromStart: 2300000,
        chromEnd: 5300000,
        gieStain: "gpos25",
        name: "p36.32"
    },
    ...
]
```

### Sample Definition

A sample specific json file must be provided (as in `sampleIdLNCAP\LNCAP_genomePlot_cnv30.json`):
```javascript
{
    fileFormatVersion: 1,
    altsComprehensive: "sampleId_alts_comprehensive.csv",
    cnvBinned30KJson: "sampleId_genomePlot_cnv30.json",
    cnvIntervals: "sampleId_cnvIntervals.csv"
}
```

### Sample Rearrangements

In order to visualize chromosomal rearrangements, a csv file is required 
(as in `sampleIdLNCAP/LNCAP_alts_comprehensive.csv`) and the following columns of integers 
must be supplied:
```
    Nassoc,chrA,chrB,posA,posB
```
where *Nassoc* is the number (integer) of supporting fragments of the events.

### Sample Copy Number Variation

In order to visualize copy number, two files of a specific format must be supplied. First, a file 
(as in `sampleIdLNCAP/LNCAP_genomePlot_cnv30.json`) with the raw frequency data from a 30000 bin 
moving window.

The second file contains the copy number state information; a csv 
file (as in `sampleIdLNCAP/LNCAP_cnvIntervals.csv`) with the following columns must be supplied:
```
    chr,start,end,cnvState,nrd
```
where *cnvState* is one of 1 (loss), 2 (normal) or 3 (gain) and *nrd* is a floating point value 
corresponding to the Normalized Read Depth score that provides a quantitative measure of how far 
the CNV deviates from the calculated normal level (*nrd* = 2.0).
