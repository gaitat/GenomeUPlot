/**
 * @author gaitat / Athanasios Gaitatzes (Saki)
 */
/* eslint-disable max-len, camelcase, no-mixed-operators, prefer-destructuring */

import Circos from 'circos';
import viewportSize from 'viewport-size';
import sprintf from 'locutus/php/strings/sprintf';

import { getQueryVariable, saveJSONtoCSV } from '../local_lib/utils';
import { toggleElementVisibilitySlow, hideElementDisplay, showElementDisplay, hideElementVisibilityFast } from '../local_lib/domOperations';
import pathIntersections from '../local_lib/pathIntersections';
import { scan } from '../local_lib/utils-d3';

const GenomePlot = { REVISION: '1.0e-6' };

GenomePlot.sampleGenome = 'GRCh38';

GenomePlot.referenceFiles = {
    hg19: {
        cytoBand: 'reference/cytobands/hg19/cytoBand.json',
    },
    hg38: {
        cytoBand: 'reference/cytobands/hg38/cytoBand.json',
    },
};

// this should actually be based on the build; currently GRCh38(hg38)
GenomePlot.chromosomes =
  {
      1: { genomicSize: 248956422 },
      2: { genomicSize: 242193529 },
      3: { genomicSize: 198295559 },
      4: { genomicSize: 190214555 },
      5: { genomicSize: 181538259 },
      6: { genomicSize: 170805979 },
      7: { genomicSize: 159345973 },
      8: { genomicSize: 145138636 },
      9: { genomicSize: 138394717 },
      10: { genomicSize: 133797422 },
      11: { genomicSize: 135086622 },
      12: { genomicSize: 133275309 },
      13: { genomicSize: 114364328 },
      14: { genomicSize: 107043718 },
      15: { genomicSize: 101991189 },
      16: { genomicSize: 90338345 },
      17: { genomicSize: 83257441 },
      18: { genomicSize: 80373285 },
      19: { genomicSize: 58617616 },
      20: { genomicSize: 64444167 },
      21: { genomicSize: 46709983 },
      22: { genomicSize: 50818468 },
      23: {
          genomicSize: 156040895,
          name: 'X',
      },
      24: {
          genomicSize: 57227415,
          name: 'Y',
      },
  };

/* eslint-disable object-curly-newline */
GenomePlot.chromosomesCircos = [
    { id: 'chr1', label: '1', color: '#996600', len: 248956422 },
    { id: 'chr2', label: '2', color: '#666600', len: 242193529 },
    { id: 'chr3', label: '3', color: '#99991E', len: 198295559 },
    { id: 'chr4', label: '4', color: '#CC0000', len: 190214555 },
    { id: 'chr5', label: '5', color: '#FF0000', len: 181538259 },
    { id: 'chr6', label: '6', color: '#FF00CC', len: 170805979 },
    { id: 'chr7', label: '7', color: '#FFCCCC', len: 159345973 },
    { id: 'chr8', label: '8', color: '#FF9900', len: 145138636 },
    { id: 'chr9', label: '9', color: '#FFCC00', len: 138394717 },
    { id: 'chr10', label: '10', color: '#FFFF00', len: 133797422 },
    { id: 'chr11', label: '11', color: '#CCFF00', len: 135086622 },
    { id: 'chr12', label: '12', color: '#00FF00', len: 133275309 },
    { id: 'chr13', label: '13', color: '#358000', len: 114364328 },
    { id: 'chr14', label: '14', color: '#0000CC', len: 107043718 },
    { id: 'chr15', label: '15', color: '#6699FF', len: 101991189 },
    { id: 'chr16', label: '16', color: '#99CCFF', len: 90338345 },
    { id: 'chr17', label: '17', color: '#00FFFF', len: 83257441 },
    { id: 'chr18', label: '18', color: '#CCFFFF', len: 80373285 },
    { id: 'chr19', label: '19', color: '#9900CC', len: 58617616 },
    { id: 'chr20', label: '20', color: '#CC33FF', len: 64444167 },
    { id: 'chr21', label: '21', color: '#CC99FF', len: 46709983 },
    { id: 'chr22', label: '22', color: '#666666', len: 50818468 },
    { id: 'chrX', label: 'X', color: '#999999', len: 156040895 },
    { id: 'chrY', label: 'Y', color: '#CCCCCC', len: 57227415 },
];
/* eslint-enable object-curly-newline */

// constants
GenomePlot.MEGA_BASE = 1000000; // convert to MBase
GenomePlot.MAX_CHROMOSOME_BASE = GenomePlot.chromosomes['1'].genomicSize * 1.05; // 250 * MEGA_BASE;
GenomePlot.NUM_CHROMS = 24;
GenomePlot.MAX_CURVATURE = 10.0;
GenomePlot.GENOMIC_OVERLAP = 500000;
GenomePlot.FLOAT_PRECISION = 4;

// Cytogenetic band colors, typically reported in karyotype files.
// Colors define the G-staining shades seen in ideograms
GenomePlot.cytoBandColors = [];
GenomePlot.cytoBandColors.gpos = 'rgb(0,0,0)';
GenomePlot.cytoBandColors.gpos100 = 'rgb(0,0,0)';
GenomePlot.cytoBandColors.gpos75 = 'rgb(0,0,0)';
GenomePlot.cytoBandColors.gpos66 = 'rgb(160,160,160)';
GenomePlot.cytoBandColors.gpos50 = 'rgb(200,200,200)';
GenomePlot.cytoBandColors.gpos33 = 'rgb(210,210,210)';
GenomePlot.cytoBandColors.gpos25 = 'rgb(200,200,200)';
GenomePlot.cytoBandColors.gvar = 'rgb(220,220,220)'; // rgb(0.86,0.86,0.86), hsl(0 0 0.86)
GenomePlot.cytoBandColors.gneg = 'rgb(255,255,255)'; // rgb(1,1,1), hsl(0,0,1)
GenomePlot.cytoBandColors.acen = 'rgb(217,47,39)'; // rgb(0.85 0.185 0.153, hsl(0.0075 0.7 0.5)
GenomePlot.cytoBandColors.stalk = 'rgb(100,127,164)'; // rgb(0.39 0.5 0.64), hsl(0.6 0.26 0.52)

// copy number colors
GenomePlot.copyNumberStateColor = new Array(3);
GenomePlot.copyNumberStateColor[0] = 'red'; // loss
GenomePlot.copyNumberStateColor[1] = 'grey'; // normal
GenomePlot.copyNumberStateColor[2] = 'blue'; // gain

// junctions colors
GenomePlot.junctionNormalColor = 'magenta';

// from: http://www.hexcolortool.com/
// from: http://marcodiiga.github.io/rgba-to-rgb-conversion
GenomePlot.junctionTransposonColor = '#ff99ff'; // magenta lightened 60%

GenomePlot.junctionTypeColor = function (d)
{
    return (!Number.isNaN(d.transposonMetric) && d.transposonMetric >= GenomePlot.junctionsParams.transposon) ?
        GenomePlot.junctionTransposonColor :
        GenomePlot.junctionNormalColor;
};

// junctions thickness
GenomePlot.junctionThickness = function (d) { return GenomePlot.junctionsParams.thickness ? Math.sqrt(d.Nassoc) + 1 : 2; };

GenomePlot.junctionIndicatorThickness = function (d) { return GenomePlot.junctionThickness(d) + 4; };
GenomePlot.junctionIndicatorHighlightThickness = function (d) { return GenomePlot.junctionIndicatorThickness(d); };
GenomePlot.junctionIndicatorOpacity = function (d) { return d3.select(`#tableData .s${d.Nassoc === '' ? 0 : d.Nassoc}${d.chrA}${d.chrB}${d.posA}${d.posB}.info`).empty() ? 0 : 1; };

GenomePlot.junctionIndicatorStyle = {
    normal: {
        opacity: GenomePlot.junctionIndicatorOpacity,
        'stroke-width': GenomePlot.junctionIndicatorThickness,
    // "stroke": "#000080"
    },
    highlight: {
        opacity: 1,
        'stroke-width': GenomePlot.junctionIndicatorHighlightThickness,
        stroke: '#000080',
    },
};

GenomePlot.junctionNoURLColor = '#444444';
GenomePlot.junctionNoURLThickness = 1;

GenomePlot.junctionOrientationRadius = function (d) { return GenomePlot.junctionsParams.thickness ? (Math.sqrt(d.Nassoc) + 4) / 3 : 1; };

GenomePlot.criteriaRunAtStartup = false;
GenomePlot.criteriaArcFactorsAnimate = true;

// initial values for parameters
GenomePlot.initVals = {};

GenomePlot.initVals.miscParams = {
    showTooltips: false,
    showHoverline: false,
    showChromosomeHorizontalDividers: true,
    showChromosomeVerticalDividers: true,
    showAdditionalAxis: false,
};

GenomePlot.initVals.cytoBandsParams = {
    visibility: 15,
};

GenomePlot.initVals.graphTypeParams = {
    graphTypes: ['U-Shape', 'Circos'],
};

GenomePlot.initVals.junctionsParams = {
    drawTypes: ['None', 'Arcs'],
    arcFactor: GenomePlot.MAX_CURVATURE, // arc curvature factor
    thickness: true, // associate thickness with # reads supporting event
    associates: 4, // filter on # of reads supporting events
    maxAssoc: 500,
    transposon: 0.375,
    orientation: true,
};

GenomePlot.initVals.copyNumberParams = {
    drawTypes: ['None', 'Lines'],
};

// local
GenomePlot.miscParams = JSON.parse(JSON.stringify(GenomePlot.initVals.miscParams));
GenomePlot.cytoBandsParams = JSON.parse(JSON.stringify(GenomePlot.initVals.cytoBandsParams));
GenomePlot.graphTypeParams = JSON.parse(JSON.stringify(GenomePlot.initVals.graphTypeParams));
GenomePlot.junctionsParams = JSON.parse(JSON.stringify(GenomePlot.initVals.junctionsParams));
GenomePlot.copyNumberParams = JSON.parse(JSON.stringify(GenomePlot.initVals.copyNumberParams));

GenomePlot.graphTypeParams.graphType = GenomePlot.initVals.graphTypeParams.graphTypes[0];

GenomePlot.junctionsParams.drawType = GenomePlot.initVals.junctionsParams.drawTypes[1];

GenomePlot.copyNumberParams.drawType = GenomePlot.initVals.copyNumberParams.drawTypes[1];

GenomePlot.parseQueryString = function ()
{
    // data
    GenomePlot.sampleId = getQueryVariable('sampleId'); // sampleId is case sencitive

    // data from the yaml pipelineConfig file
    GenomePlot.minimumClusterSizeToGeneratePlot = 3;
    GenomePlot.junctionsParams.associates = GenomePlot.minimumClusterSizeToGeneratePlot;
};

/*
 * // from: http://stackoverflow.com/questions/17090642/d3-ignore-certain-row-in-csv
 * // from: http://stackoverflow.com/questions/13436519/csv-tsv-comment-lines-d3
 * The `d3.csv()` function does both the *loading* and the *parsing* without giving you a chance to intervene.
 * If you need to intervene, you need to load the csv as plain text, without parsing it.
 * Then remove the unnedded lines and pass it as a String into the csv module for parsing.
 *
 * For loading, use [`d3.xhr()`](https://github.com/mbostock/d3/wiki/Requests#wiki-d3_xhr)
 * For parsing, use [`d3.csv.parse()`](https://github.com/mbostock/d3/wiki/CSV#wiki-parse).
 */

GenomePlot.initData = function ()
{
    GenomePlot.prefixFile = `./data/${GenomePlot.sampleId}`;
    GenomePlot.matepairDataFile = `${GenomePlot.prefixFile}/${GenomePlot.sampleId}_visualization.json`;

    GenomePlot.matepairData = undefined;
    if (GenomePlot.matepairDataFile === undefined)
    {
        console.error(sprintf('%-18s Undefined Mate Pair data file', 'initData():'));
    }
    else
    {
        $.ajaxFileExists(GenomePlot.matepairDataFile)
            .done(() =>
            {
                GenomePlot.matepairDataStartTime = performance.now();
                console.info(sprintf('%-20s Started loading Mate Pair data file: %s at %.4fms', 'initData():', GenomePlot.matepairDataFile, GenomePlot.matepairDataStartTime));

                // load pipeline file, synchronously
                GenomePlot.matepairData = $.ajaxJSONSync(GenomePlot.matepairDataFile);

                const endTime = performance.now();
                console.info(sprintf('%-20s Finished loading Mate Pair data file: %s at %.4fms (duration: %.4f seconds)', 'initData():', GenomePlot.matepairDataFile, endTime, ((endTime - GenomePlot.matepairDataStartTime) / 1000)));

                // initGUI should be initialized
                if (GenomePlot.matepairData === undefined || GenomePlot.matepairData === null
                || GenomePlot.gui === undefined) { return; }

                // change the file paths to be relative to the directory the files were copied to
                Object.keys(GenomePlot.matepairData).forEach((record) =>
                {
                    if (typeof GenomePlot.matepairData[record] !== 'string') { return; }

                    GenomePlot.matepairData[record] =
                        `${GenomePlot.prefixFile}/${GenomePlot.matepairData[record].basename()}`;
                });

                GenomePlot.copyNumber30000DataFile = GenomePlot.matepairData.cnvBinned30KJson;
                GenomePlot.copyNumberStateDataFile = GenomePlot.matepairData.cnvIntervals;

                GenomePlot.alterationsDataFile = GenomePlot.matepairData.altsComprehensive;
            })
            .fail(() =>
            {
                console.error(sprintf('%-18s Failed to find Mate Pair data file: %s', 'initData():', GenomePlot.matepairDataFile));
            });
    }

    // load new copy number data
    GenomePlot.copyNumberData = undefined;
    GenomePlot.copyNumber30000Data = GenomePlot.copyNumberData;
    if (GenomePlot.copyNumber30000DataFile === undefined)
    {
        console.error(sprintf('%-18s Undefined CNV file of window size 30000', 'initData():'));
    }
    else
    {
        $.ajaxFileExists(GenomePlot.copyNumber30000DataFile)
            .done(() =>
            {
                GenomePlot.copyNumber30000DataStartTime = performance.now();
                console.info(sprintf('%-20s Started loading CNV file of window size 30000: %s at %.4fms', 'initData():', GenomePlot.copyNumber30000DataFile, GenomePlot.copyNumber30000DataStartTime));
                GenomePlot.loadedResources += 1;

                $.getJSON(GenomePlot.copyNumber30000DataFile)
                    .fail(() =>
                    {
                        console.error(sprintf('%-20s Failed to load CNV file of window size 30000: %s', 'initData():', GenomePlot.copyNumber30000DataFile));
                    })
                    .done((data) =>
                    {
                        const endTime = performance.now();
                        console.info(sprintf('%-20s Finished loading CNV file of window size 30000: %s at %.4fms (duration: %.4f seconds)', 'initData():', GenomePlot.copyNumber30000DataFile, endTime, ((endTime - GenomePlot.copyNumber30000DataStartTime) / 1000)));
                        GenomePlot.loadedResources -= 1;

                        GenomePlot.processCopyNumber30000Data(data);
                    });
            })
            .fail(() =>
            {
                GenomePlot.copyNumberData = undefined;
                GenomePlot.copyNumber30000Data = undefined;

                console.error(sprintf('%-18s Failed to find CNV file of window size 30000: %s', 'initData():', GenomePlot.copyNumber30000DataFile));
            });
    }

    // load copy number state data
    GenomePlot.copyNumberStateData = undefined;
    if (GenomePlot.copyNumberStateDataFile === undefined)
    {
        console.error(sprintf('%-18s Undefined CNV Intervals file', 'initData():'));
    }
    else
    {
        $.ajaxFileExists(GenomePlot.copyNumberStateDataFile)
            .done(() =>
            {
                GenomePlot.copyNumberStateDataStartTime = performance.now();
                console.info(sprintf('%-20s Started loading CNV Intervals file: %s at %.4fms', 'initData():', GenomePlot.copyNumberStateDataFile, GenomePlot.copyNumberStateDataStartTime));
                GenomePlot.loadedResources += 1;

                d3.text(
                    GenomePlot.copyNumberStateDataFile, 'text/csv',
                    (data) =>
                    {
                        const endTime = performance.now();
                        console.info(sprintf('%-20s Finished loading CNV Intervals file: %s at %.4fms (duration: %.4f seconds)', 'initData():', GenomePlot.copyNumberStateDataFile, endTime, ((endTime - GenomePlot.copyNumberStateDataStartTime) / 1000)));
                        GenomePlot.loadedResources -= 1;

                        GenomePlot.copyNumberStateData = GenomePlot.processCopyNumberStateData(data);

                        console.info(sprintf('%-20s     Total CNV Intervals to draw: %s', 'initData():', GenomePlot.copyNumberStateData.length.toLocaleString()));
                    },
                    (value) =>
                    {
                        const endTime = performance.now();
                        console.error(sprintf('%-20s Rejected loading CNV Intervals file: %s with %s at %.4fms (duration: %.4f seconds)', 'initData():', GenomePlot.copyNumberStateDataFile, value, endTime, ((endTime - GenomePlot.copyNumberStateDataStartTime) / 1000)));
                    },
                    (error) =>
                    {
                        console.error(sprintf('%-20s Failed to load CNV Intervals file: %s with %s', 'initData():', GenomePlot.copyNumberStateDataFile, error));
                    },
                );
            })
            .fail(() =>
            {
                console.error(sprintf('%-18s Failed to find CNV Intervals file: %s', 'initData():', GenomePlot.copyNumberStateDataFile));
            });
    }

    // load cytoband data
    GenomePlot.cytoBandData = undefined;
    if (GenomePlot.cytoBandFile === undefined)
    {
        console.error(sprintf('%-18s Undefined Cytoband file', 'initData():'));
    }
    else
    {
        $.ajaxFileExists(GenomePlot.cytoBandFile)
            .done(() =>
            {
                GenomePlot.cytoBandDataStartTime = performance.now();
                console.info(sprintf('%-20s Started loading Cytoband file: %s at %.4fms', 'initData():', GenomePlot.cytoBandFile, GenomePlot.cytoBandDataStartTime));
                GenomePlot.loadedResources += 1;

                d3.json(
                    GenomePlot.cytoBandFile,
                    (error, data) =>
                    {
                        const endTime = performance.now();
                        console.info(sprintf('%-20s Finished loading Cytoband file: %s at %.4fms (duration: %.4f seconds)', 'initData():', GenomePlot.cytoBandFile, endTime, ((endTime - GenomePlot.cytoBandDataStartTime) / 1000)));
                        GenomePlot.loadedResources -= 1;

                        GenomePlot.cytoBandData = data;

                        console.info(sprintf('%-20s     Total Cytoband elements to draw: %s', 'initData():', GenomePlot.cytoBandData.length.toLocaleString()));
                    },
                    (value) =>
                    {
                        const endTime = performance.now();
                        console.error(sprintf('%-20s Rejected loading Cytoband file: %s with %s at %.4fms (duration: %.4f seconds)', 'initData():', GenomePlot.cytoBandFile, value, endTime, ((endTime - GenomePlot.cytoBandDataStartTime) / 1000)));
                    },
                    (error) =>
                    {
                        console.error(sprintf('%-20s Failed to load Cytoband file: %s with %s', 'initData():', GenomePlot.cytoBandFile, error));
                    },
                );
            })
            .fail(() =>
            {
                console.error(sprintf('%-18s Failed to find Cytoband file: %s', 'initData():', GenomePlot.cytoBandFile));
            });
    }

    // load alterations data
    GenomePlot.alterationsData = undefined;
    if (GenomePlot.alterationsDataFile === undefined)
    {
        console.error(sprintf('%-18s Undefined Alterations file', 'initData():'));
    }
    else
    {
        $.ajaxFileExists(GenomePlot.alterationsDataFile)
            .done(() =>
            {
                GenomePlot.alterationsDataStartTime = performance.now();
                console.info(sprintf('%-20s Started loading Alterations file: %s at %.4fms', 'initData():', GenomePlot.alterationsDataFile, GenomePlot.alterationsDataStartTime));
                GenomePlot.loadedResources += 1;

                d3.text(GenomePlot.alterationsDataFile, 'text/csv', (data) =>
                {
                    const endTime = performance.now();
                    console.info(sprintf('%-20s Finished loading Alterations file: %s at %.4fms (duration: %.4f seconds)', 'initData():', GenomePlot.alterationsDataFile, endTime, ((endTime - GenomePlot.alterationsDataStartTime) / 1000)));
                    GenomePlot.loadedResources -= 1;

                    GenomePlot.alterationsData = GenomePlot.processAlterationsData(data);

                    console.info(sprintf('%-20s     Total Alterations to draw: %s', 'initData():', GenomePlot.alterationsData.length.toLocaleString()));
                });
            })
            .fail(() =>
            {
                console.error(sprintf('%-18s Failed to find Alterations file: %s', 'initData():', GenomePlot.alterationsDataFile));
            });
    }
}; // initData

// the scales translate data values to pixel values
GenomePlot.initTransforms = function ()
{
    if (GenomePlot.graphTypeParams.graphType === 'Circos') return;

    if (GenomePlot.graphTypeParams.graphType === 'U-Shape')
    {
        GenomePlot.linearGenomicToPaddedPixelScaleX =
            d3.scale.linear()
                .domain([0, GenomePlot.MAX_CHROMOSOME_BASE]) // the range of the values to plot
                .range([GenomePlot.padding.left, GenomePlot.innerWidth - GenomePlot.padding.right]); // the pixel range of the x-axis

        GenomePlot.basesPerPixel = Math.ceil(GenomePlot.MAX_CHROMOSOME_BASE / (GenomePlot.linearGenomicToPaddedPixelScaleX(GenomePlot.MAX_CHROMOSOME_BASE) - GenomePlot.linearGenomicToPaddedPixelScaleX(0)));
        // console.info( "GenomePlot.initTransforms(): bases/pixel =", GenomePlot.basesPerPixel.toLocaleString() );

        GenomePlot.linearGenomicToUnPaddedPixelScaleX =
            d3.scale.linear()
                .domain([0, GenomePlot.MAX_CHROMOSOME_BASE]) // the range of the values to plot
                .range([0, GenomePlot.innerWidth]); // the pixel range of the x-axis
        GenomePlot.linearGenomicToPaddedPixelScaleX_13_14_15 =
            d3.scale.linear()
                .domain([0, GenomePlot.chromosomes['13'].genomicSize]) // the range of the values to plot
                .range([GenomePlot.linearGenomicToPaddedPixelScaleX(GenomePlot.chromPixelStarts[(13 - 1)].x), GenomePlot.innerWidth - GenomePlot.padding.right]); // the pixel range of the x-axis
        GenomePlot.linearGenomicToPaddedPixelScaleX_16_17_18 =
            d3.scale.linear()
                .domain([0, GenomePlot.chromosomes['16'].genomicSize]) // the range of the values to plot
                .range([GenomePlot.linearGenomicToPaddedPixelScaleX(GenomePlot.chromPixelStarts[(16 - 1)].x), GenomePlot.innerWidth - GenomePlot.padding.right]); // the pixel range of the x-axis
        GenomePlot.linearGenomicToPaddedPixelScaleX_19_20 =
            d3.scale.linear()
                .domain([0, GenomePlot.chromosomes['20'].genomicSize]) // the range of the values to plot
                .range([GenomePlot.linearGenomicToPaddedPixelScaleX(GenomePlot.chromPixelStarts[(20 - 1)].x), GenomePlot.innerWidth - GenomePlot.padding.right]); // the pixel range of the x-axis
        GenomePlot.linearGenomicToPaddedPixelScaleX_21_22 =
            d3.scale.linear()
                .domain([0, GenomePlot.chromosomes['22'].genomicSize]) // the range of the values to plot
                .range([GenomePlot.linearGenomicToPaddedPixelScaleX(GenomePlot.chromPixelStarts[(22 - 1)].x), GenomePlot.innerWidth - GenomePlot.padding.right]); // the pixel range of the x-axis
        GenomePlot.linearGenomicToPaddedPixelScaleX_24 =
            d3.scale.linear()
                .domain([0, GenomePlot.chromosomes['24'].genomicSize]) // the range of the values to plot
                .range([GenomePlot.linearGenomicToPaddedPixelScaleX(GenomePlot.chromPixelStarts[(24 - 1)].x), GenomePlot.innerWidth - GenomePlot.padding.right]); // the pixel range of the x-axis

        if (GenomePlot.graphTypeParams.graphType === 'U-Shape')
        {
            GenomePlot.linearChromosomeToPaddedPixelScaleY_L =
                d3.scale.linear()
                    .domain([1, 14])
                    .range([GenomePlot.padding.top, GenomePlot.innerHeight - GenomePlot.padding.bottom]);

            GenomePlot.linearChromosomeToPaddedPixelScaleY_R =
                d3.scale.linear()
                    .domain([24, 11])
                    .range([GenomePlot.padding.top, GenomePlot.innerHeight - GenomePlot.padding.bottom]);
        }
    }

    GenomePlot.linearGenomicToPaddedPixelScaleY =
        d3.scale.linear()
            .domain([0, GenomePlot.ymax])
            .range([GenomePlot.innerHeight - GenomePlot.padding.bottom, GenomePlot.padding.top]);

    GenomePlot.linearWindowPixelToPaddedPixelScaleY =
        d3.scale.linear()
            .domain([0, GenomePlot.innerHeight])
            .range([GenomePlot.padding.top, GenomePlot.innerHeight - GenomePlot.padding.bottom]);

    GenomePlot.scaledPixelsPerLine = GenomePlot.linearWindowPixelToPaddedPixelScaleY(GenomePlot.chromPixelStarts[1].y) -
    GenomePlot.linearWindowPixelToPaddedPixelScaleY(GenomePlot.chromPixelStarts[0].y);

    GenomePlot.exponentMoveToMiddleOfChromScaleY = new Array(24);

    // by zoom factor 12 bring the elements' y-position to the middle of the chromosome height
    for (let chrom_id = 0; chrom_id < GenomePlot.NUM_CHROMS; chrom_id += 1)
    {
        GenomePlot.exponentMoveToMiddleOfChromScaleY[chrom_id] =
            d3.scale.pow().exponent(0.05)
                .domain([1, 12]) // 12: arbitrary scale value by which we want the overlap of data to take effect
                .range([
                    // GenomePlot.chromPixelStarts is 0 based
                    GenomePlot.linearWindowPixelToPaddedPixelScaleY(GenomePlot.chromPixelStarts[chrom_id].y + GenomePlot.pixelsPerLine / 3.5),
                    GenomePlot.linearWindowPixelToPaddedPixelScaleY(GenomePlot.chromPixelStarts[chrom_id].y) - 0.05 * GenomePlot.scaledPixelsPerLine,
                ])
                .clamp(true); // dont want values above 12
    }

    GenomePlot.scaleMin = 1; // limits the zoom, 1 means do not allow zoom-out
    GenomePlot.scaleMax = 200000; // go up to one base per pixel

    GenomePlot.zoom = d3.behavior.zoom()
        .scaleExtent([GenomePlot.scaleMin, GenomePlot.scaleMax])
        .x(GenomePlot.linearGenomicToPaddedPixelScaleX)
        .y(GenomePlot.linearWindowPixelToPaddedPixelScaleY)
        .on('zoom', GenomePlot.onZoom);

    if (GenomePlot.graphTypeParams.graphType === 'U-Shape')
    {
        GenomePlot.zoomY_L = d3.behavior.zoom()
            .scaleExtent([GenomePlot.scaleMin, GenomePlot.scaleMax])
            .y(GenomePlot.linearChromosomeToPaddedPixelScaleY_L);

        if (GenomePlot.graphTypeParams.graphType === 'U-Shape')
        {
            GenomePlot.zoomY_R = d3.behavior.zoom()
                .scaleExtent([GenomePlot.scaleMin, GenomePlot.scaleMax])
                .y(GenomePlot.linearChromosomeToPaddedPixelScaleY_R);
        }
    }
}; // initTransforms

GenomePlot.setupContainer = function ()
{
    // remove old svg if any
    d3.select('#svgContainer').selectAll('svg').remove();

    // if you ever set the visibility of the svg layer to false you will stop
    // receiving events as it is the svg layer that is responsible for them
    const svgMain = d3.select('#svgContainer')
        .append('svg:svg')
        .attr('id', 'svgMain')
        .attr('width', GenomePlot.outerWidth)
        .attr('height', GenomePlot.outerHeight);

    const defs = svgMain.append('defs');

    // hatch pattern for cytobands
    defs
        .append('pattern')
        .attr('id', 'diagonalHatch')
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('width', 4)
        .attr('height', 4)
        .append('path')
        .attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
        .attr('stroke', '#000000')
        .attr('stroke-width', 1);

    defs
        .append('clipPath')
        .attr('id', 'container-main-clip-path')
        .append('rect')
        .attr('width', GenomePlot.innerWidth)
        .attr('height', GenomePlot.innerHeight);

    const groupMain = svgMain
        .append('svg:g')
        .attr('id', 'groupMain')
        .attr('transform', `translate(${GenomePlot.margin.left},${GenomePlot.margin.top})`);

    const groupMainContainer = groupMain
        .append('svg:g')
        .attr('id', 'groupMainContainer')
        .style('clip-path', 'url(#container-main-clip-path)');

    // white rect behind the graph
    groupMainContainer
        .append('svg:rect')
        .attr('width', GenomePlot.innerWidth)
        .attr('height', GenomePlot.innerHeight)
        .attr('class', 'rectTransp')
        .style({
            fill: 'transparent',
            stroke: 'orange',
            'stroke-width': 2,
            // "pointer-events": "all",
            cursor: 'move',
        })

        .on('mouseout', () =>
        {
            d3.selectAll('.hoverX-text, .hoverX_13_14_15-text, .hoverX_16_17_18-text, .hoverX_19_20-text, .hoverX_21_22-text, .hoverX_T-text')
                .transition()
                .duration(200)
                .style('opacity', 1e-6);

            d3.select('.hoverX-line')
                .transition()
                .duration(200)
                .style('opacity', 1e-6);
        })
        .on('mouseover', () =>
        {
            d3.selectAll('.hoverX-text, .hoverX_13_14_15-text, .hoverX_16_17_18-text, .hoverX_19_20-text, .hoverX_21_22-text, .hoverX_T-text')
                .transition()
                .duration(200)
                .style('opacity', 1);

            d3.select('.hoverX-line')
                .transition()
                .duration(0)
                .style('opacity', GenomePlot.miscParams.showHoverline ? 1 : 1e-6);
        })
        .on('mousemove', function ()
        {
            if (GenomePlot.miscParams.showHoverline)
            {
                const mouseX = d3.mouse(this)[0];

                d3.select('.hoverX-line')
                    .attr('x1', mouseX)
                    .attr('x2', mouseX);
            }
        });

    groupMainContainer
        .call(GenomePlot.zoom)
        .on('dblclick.zoom', null); // disable double click zoom for d3.behavior.zoom
}; // setupContainer

// double return so I can pass in arguments (don't understand this)
function vCenter(heightAvailable, sign, offsetY)
{
    return function ()
    {
        const self = d3.select(this);
        const bbox = self.node().getBBox();

        const vheight = (heightAvailable === undefined) ? 0 : heightAvailable;
        const voffset = (offsetY === undefined) ? bbox.y : offsetY;

        self.attr('y', ((sign === undefined) ? 1 : sign) * ((Math.abs(vheight - bbox.height) * 0.5) - voffset));
    };
}

// double return so I can pass in arguments (don't understand this)
function hCenter(widthAvailable, sign)
{
    return function ()
    {
        const self = d3.select(this);
        const bbox = self.node().getBBox();

        self.attr('x', ((sign === undefined) ? 1 : sign) * (Math.abs(widthAvailable - bbox.width) * 0.5));
    };
}

GenomePlot.drawBackground = function ()
{
    // remove and recreate the main frame
    d3.select('#groupMainFrame').remove();
    GenomePlot.svg = d3.select('#groupMain')
        .append('svg:g')
        .attr('id', 'groupMainFrame');

    // remove and recreate the contents
    d3.select('#groupMainContainerContents').remove();
    GenomePlot.container = d3.select('#groupMainContainer')
        .append('svg:g')
        .attr('id', 'groupMainContainerContents');

    // remove old tooltip
    $('.tooltip').remove();

    // tooltip div
    GenomePlot.tooltip = d3.select('#svgContainer')
        .append('div')
        .attr('class', 'tooltip')
        .style({
            opacity: 1e-6,
            'font-size': '12px',
        });

    if (GenomePlot.graphTypeParams.graphType !== 'Circos')
    {
        GenomePlot.drawAxis();

        // hover line
        // from: http://stackoverflow.com/questions/29440455/how-to-as-mouseover-to-line-graph-interactive-in-d3
        // from: http://bl.ocks.org/gniemetz/4618602
        GenomePlot.container
            .append('svg:line')
            .attr('class', 'hoverX-line')
            .style({
                // "stroke": "#6E7B8B", // moved style to css so I can manipulate it based on media
                'stroke-dasharray': '3 3',
                // "stroke-opacity": 1e-6,
                fill: 'none',
                'shape-rendering': 'crispEdges',
                'vector-effect': 'non-scaling-stroke',
                'pointer-events': 'none',
                opacity: GenomePlot.miscParams.showHoverline ? 1 : 1e-6,
            })
            .attr('x1', 0)
            .attr('x2', 0)
            .attr('y1', 0)
            .attr('y2', GenomePlot.innerHeight); // top to bottom
    }

    // /////////////////////////////////////////////////////////////////////////////

    // Create plot title label
    const fontHeight = 2.0 * GenomePlot.viewportUnitHeight;
    const letterSpacing = 0.25 * GenomePlot.viewportUnitWidth;

    GenomePlot.svg
        .append('svg:text')
        .attr('text-anchor', 'end')
        .attr('x', GenomePlot.innerWidth - 10)
        .attr('class', 'sample-text')
        .style({
            'font-family': '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            'font-size': fontHeight,
            'font-weight': 'bold',
            'letter-spacing': letterSpacing,
            'shape-rendering': 'auto',

            '-webkit-user-select': 'text',
            '-moz-user-select': 'text',
            'user-select': 'text',
        })
        .text(`${GenomePlot.graphTypeParams.graphType === 'Circos' ? 'Circos ' : 'Genome U-'}plot of ${GenomePlot.sampleId}`)
        .each(vCenter(GenomePlot.margin.top, -1, -fontHeight / 3));
}; // drawBackground

// also computes linesPerGraph and pixelsPerLine
GenomePlot.computeChromosomeStartPositions = function ()
{
    if (GenomePlot.graphTypeParams.graphType === 'U-Shape')
    {
    // initialize it every time the function runs; garbage collection will take care of the memory
        GenomePlot.chromPixelStarts = new Array(GenomePlot.NUM_CHROMS);

        GenomePlot.linesPerGraph = 13;

        // height in pixels of one line holding one chromosome (or two)
        GenomePlot.pixelsPerLine = GenomePlot.innerHeight / GenomePlot.linesPerGraph;

        // create the start pixels positions of the left chromosomes
        for (let i = 0; i < 13; i += 1)
        {
            const chrom_id = i + 1;

            const cx = 0;
            const cy = (i + 0.5) * GenomePlot.pixelsPerLine; // computed in the un-padded space

            // x: genomic value; y: pixel value
            if (chrom_id === 13) { GenomePlot.chromPixelStarts[24 - 2] = { x: cx, y: cy, adjust: 0 }; }
            else { GenomePlot.chromPixelStarts[chrom_id - 1] = { x: cx, y: cy, adjust: 0 }; }
        }

        // create the start pixels positions of the right chromosomes
        for (let i = 2; i < 13; i += 1)
        {
            let chromSizeRight;
            let chrom_id = i + 1;

            // if the left chrom_id is 13 then we are at the XY line
            if (chrom_id === 13)
            {
                chrom_id = 25 - 1;
                chromSizeRight = GenomePlot.chromosomes['24'].genomicSize;
            }
            else
            {
                chrom_id = 25 - chrom_id;
                chromSizeRight = GenomePlot.chromosomes[chrom_id.toString()].genomicSize;
            }

            const cx = GenomePlot.MAX_CHROMOSOME_BASE - chromSizeRight;
            const cy = (i + 0.5) * GenomePlot.pixelsPerLine; // computed in the un-padded space

            // x: genomic value; y: pixel value
            GenomePlot.chromPixelStarts[chrom_id - 1] = { x: cx, y: cy, adjust: 0 };
        }

        // adjust chromosome positions on the graph
        GenomePlot.chromPixelStarts[(14 - 1)].adjust = GenomePlot.chromPixelStarts[(14 - 1)].x - GenomePlot.chromPixelStarts[(13 - 1)].x;
        GenomePlot.chromPixelStarts[(14 - 1)].x = GenomePlot.chromPixelStarts[(13 - 1)].x;

        GenomePlot.chromPixelStarts[(15 - 1)].adjust = GenomePlot.chromPixelStarts[(15 - 1)].x - GenomePlot.chromPixelStarts[(13 - 1)].x;
        GenomePlot.chromPixelStarts[(15 - 1)].x = GenomePlot.chromPixelStarts[(13 - 1)].x;

        GenomePlot.chromPixelStarts[(17 - 1)].adjust = GenomePlot.chromPixelStarts[(17 - 1)].x - GenomePlot.chromPixelStarts[(16 - 1)].x;
        GenomePlot.chromPixelStarts[(17 - 1)].x = GenomePlot.chromPixelStarts[(16 - 1)].x;

        GenomePlot.chromPixelStarts[(18 - 1)].adjust = GenomePlot.chromPixelStarts[(18 - 1)].x - GenomePlot.chromPixelStarts[(16 - 1)].x;
        GenomePlot.chromPixelStarts[(18 - 1)].x = GenomePlot.chromPixelStarts[(16 - 1)].x;

        GenomePlot.chromPixelStarts[(19 - 1)].adjust = GenomePlot.chromPixelStarts[(19 - 1)].x - GenomePlot.chromPixelStarts[(20 - 1)].x;
        GenomePlot.chromPixelStarts[(19 - 1)].x = GenomePlot.chromPixelStarts[(20 - 1)].x;

        GenomePlot.chromPixelStarts[(21 - 1)].adjust = GenomePlot.chromPixelStarts[(21 - 1)].x - GenomePlot.chromPixelStarts[(22 - 1)].x;
        GenomePlot.chromPixelStarts[(21 - 1)].x = GenomePlot.chromPixelStarts[(22 - 1)].x;
    }
}; // computeChromosomeStartPositions

// for the chromosomes in the left side of the graph (i.e chroms 1-12 & 23)
// compute the size of the left and right chromosomes
GenomePlot.computeChromosomeSizes = function ()
{
    if (GenomePlot.graphTypeParams.graphType !== 'U-Shape') return;

    for (let chrom_id = 1; chrom_id <= 13; chrom_id += 1)
    {
        let chromSizeLeft;
        let chromSizeRight;

        if (chrom_id === 1 || chrom_id === 2)
        {
            chromSizeLeft = GenomePlot.chromosomes[chrom_id.toString()].genomicSize;
            chromSizeRight = 0;

            GenomePlot.chromosomes[chrom_id.toString()].chromSizeLeft = chromSizeLeft;
            GenomePlot.chromosomes[chrom_id.toString()].chromSizeRight = chromSizeRight;
        }
        else if (chrom_id === 13)
        { // if the left chrom_id is 13 then we are at the XY line
            chromSizeLeft = GenomePlot.chromosomes['23'].genomicSize;
            chromSizeRight = GenomePlot.chromosomes['24'].genomicSize;

            GenomePlot.chromosomes['23'].chromSizeLeft = chromSizeLeft;
            GenomePlot.chromosomes['23'].chromSizeRight = chromSizeRight;
        }
        else
        {
            chromSizeLeft = GenomePlot.chromosomes[chrom_id.toString()].genomicSize;
            chromSizeRight = GenomePlot.chromosomes[(25 - chrom_id).toString()].genomicSize +
                            GenomePlot.chromPixelStarts[(25 - chrom_id - 1)].adjust;

            GenomePlot.chromosomes[chrom_id.toString()].chromSizeLeft = chromSizeLeft;
            GenomePlot.chromosomes[chrom_id.toString()].chromSizeRight = chromSizeRight;
        }
    }
}; // computeChromosomeSizes

GenomePlot.drawHorizontalDividers = function ()
{
    if (!(GenomePlot.graphTypeParams.graphType === 'U-Shape')) { return; }

    // remove the old cytobands
    d3.selectAll('.horizontaldividers').remove();

    const divs = GenomePlot.container
        .append('svg:g')
        .style({
            stroke: 'black',
            fill: 'none',
            'shape-rendering': 'crispEdges',
            'vector-effect': 'non-scaling-stroke',
            'stroke-opacity': 0.25, // 1e-6,
            'pointer-events': 'none',
        })
        .attr('class', 'horizontaldividers')
        .selectAll('line')
        .data(d3.range(0, GenomePlot.innerHeight + GenomePlot.pixelsPerLine, GenomePlot.pixelsPerLine));

    divs
        .enter().append('svg:line')
        .attr('x1', 0)
        .attr('y1', d => GenomePlot.linearWindowPixelToPaddedPixelScaleY(d).toFixed(GenomePlot.FLOAT_PRECISION))
        .attr('x2', GenomePlot.innerWidth)
        .attr('y2', d => GenomePlot.linearWindowPixelToPaddedPixelScaleY(d).toFixed(GenomePlot.FLOAT_PRECISION));

    divs.exit().remove();
}; // drawHorizontalDividers

// draw the vertical lines between adjacent chromosomes
GenomePlot.drawVerticalDividers = function ()
{
    // remove the old dividers
    d3.selectAll('.verticaldividers, .verticalpanels').remove();

    if (GenomePlot.graphTypeParams.graphType === 'U-Shape')
    {
        const divs = GenomePlot.container
            .append('svg:g')
            .attr('class', 'verticaldividers')
            .style({
                stroke: 'black',
                'stroke-opacity': 0.25, // 1e-6,
                fill: 'none',
                'shape-rendering': 'crispEdges',
                'vector-effect': 'non-scaling-stroke',
                'pointer-events': 'none',
            })
            .selectAll('scatter_line')
            .data(d3.range(1, 13).concat(23)); // the 13 left chromosomes

        divs
            .enter().append('svg:line')
            .attr('x1', (d) =>
            {
                const sizes = GenomePlot.chromosomes[d.toString()];

                // the space between adjacent chroms
                const space = GenomePlot.MAX_CHROMOSOME_BASE - sizes.chromSizeLeft - sizes.chromSizeRight;

                return GenomePlot.linearGenomicToPaddedPixelScaleX(sizes.chromSizeLeft + (space * 0.5)).toFixed(GenomePlot.FLOAT_PRECISION);
            })
            .attr('x2', (d) =>
            {
                const sizes = GenomePlot.chromosomes[d.toString()];

                // the space between adjacent chroms
                const space = GenomePlot.MAX_CHROMOSOME_BASE - sizes.chromSizeLeft - sizes.chromSizeRight;

                return GenomePlot.linearGenomicToPaddedPixelScaleX(sizes.chromSizeLeft + (space * 0.5)).toFixed(GenomePlot.FLOAT_PRECISION);
            })
            .attr('y1', d => GenomePlot.linearWindowPixelToPaddedPixelScaleY((d === 23 ? 12 : (d - 1)) * GenomePlot.pixelsPerLine).toFixed(GenomePlot.FLOAT_PRECISION))
            .attr('y2', d => GenomePlot.linearWindowPixelToPaddedPixelScaleY((d === 23 ? 13 : (d)) * GenomePlot.pixelsPerLine).toFixed(GenomePlot.FLOAT_PRECISION));

        divs.exit().remove();
    }
}; // drawVerticalDividers

function getChromIdFromString(chrom_str)
{
    let chrom_id;

    const chrom = chrom_str.substring(3, chrom_str.length);
    if (chrom === 'X') { chrom_id = 23; }
    else if (chrom === 'Y') { chrom_id = 24; }
    else { chrom_id = parseInt(chrom, 10); }

    return chrom_id; // 1 based
}

function getChromName(chr)
{
    let id;

    if (chr === 23) { id = 'X'; }
    else if (chr === 24) { id = 'Y'; }
    else { id = chr; }

    return id;
}

GenomePlot.drawCytobands = function ()
{
    // remove the old cytobands
    d3.selectAll('.cytobands').remove();

    // if( GenomePlot.cytoBandsParams.visibility < 1 ) return;

    // the json file has been cleaned of extraneous chromosomes
    if (GenomePlot.graphTypeParams.graphType === 'U-Shape')
    {
        GenomePlot.cytobandsHeight = 0.10 * GenomePlot.scaledPixelsPerLine;

        // filter the data appropriately and at the same time group by same color for optimized rendering
        const cytoBandDataGroupedByColor = {};
        for (let i = 0; i < GenomePlot.cytoBandData.length; i += 1)
        {
            const d = GenomePlot.cytoBandData[i];

            const chrom_id = getChromIdFromString(d.chrom); // 1 based;

            // filter out invalid chromosomes and the centromere
            if (chrom_id < 1 || chrom_id > GenomePlot.NUM_CHROMS || d.gieStain === 'acen') { continue; } // eslint-disable-line no-continue

            d.x = GenomePlot.linearGenomicToPaddedPixelScaleX(GenomePlot.chromPixelStarts[chrom_id - 1].x + +d.chromStart);
            d.y = GenomePlot.exponentMoveToMiddleOfChromScaleY[chrom_id - 1](1);
            d.width = GenomePlot.linearGenomicToPaddedPixelScaleX(+d.chromEnd) - GenomePlot.linearGenomicToPaddedPixelScaleX(+d.chromStart);
            d.height = GenomePlot.cytobandsHeight;

            // filter out bands outside the viewport
            if (d.x + d.width < 0 || d.x > GenomePlot.innerWidth || d.y + d.height < 0 || d.y > GenomePlot.innerHeight) { continue; } // eslint-disable-line no-continue

            const hasColorsProperty = Object.prototype.hasOwnProperty.call(cytoBandDataGroupedByColor, GenomePlot.cytoBandColors[d.gieStain]);
            if (!hasColorsProperty)
            {
                cytoBandDataGroupedByColor[GenomePlot.cytoBandColors[d.gieStain]] = [];
            }
            cytoBandDataGroupedByColor[GenomePlot.cytoBandColors[d.gieStain]].push(d);
        }

        const cytos =
            GenomePlot.container
                .append('svg:g')
                .style({
                    stroke: 'black',
                    'shape-rendering': 'auto',
                    'vector-effect': 'non-scaling-stroke',
                    'stroke-opacity': GenomePlot.cytoBandsParams.visibility / 100,
                    'fill-opacity': GenomePlot.cytoBandsParams.visibility / 100,
                })
                .style('pointer-events', () => (GenomePlot.miscParams.showTooltips ? 'all' : 'none'))
                .attr('class', 'cytobands')
                .selectAll('chrom-rect')
                .data(Object.keys(cytoBandDataGroupedByColor))
                .enter()
                .append('svg:g')
                .style('fill', d => d)
                .selectAll('chrom-rect-color')
                .data(d => cytoBandDataGroupedByColor[d]);

        cytos
            .enter().append('svg:rect')
            .attr('class', 'cytorects')
            .attr('x', d => d.x.toFixed(GenomePlot.FLOAT_PRECISION))
            .attr('y', d => d.y.toFixed(GenomePlot.FLOAT_PRECISION))
            .attr('width', d => d.width.toFixed(GenomePlot.FLOAT_PRECISION))
            .attr('height', d => d.height.toFixed(GenomePlot.FLOAT_PRECISION));

        cytos.exit().remove();

        const centromere =
            GenomePlot.container
                .append('svg:g')
                .style({
                    stroke: 'black',
                    fill: 'none',
                    'shape-rendering': 'auto',
                    'vector-effect': 'non-scaling-stroke',
                    'stroke-opacity': GenomePlot.cytoBandsParams.visibility / 100,
                    'fill-opacity': GenomePlot.cytoBandsParams.visibility / 100,
                })
                .style('pointer-events', () => (GenomePlot.miscParams.showTooltips ? 'all' : 'none'))
                .attr('class', 'cytobands');

        const centomereData = GenomePlot.cytoBandData.filter((d) =>
        {
            if (d.gieStain !== 'acen') return false;

            const chrom_id = getChromIdFromString(d.chrom); // 1 based

            const x = GenomePlot.linearGenomicToPaddedPixelScaleX(GenomePlot.chromPixelStarts[chrom_id - 1].x + +d.chromStart);
            const y = GenomePlot.exponentMoveToMiddleOfChromScaleY[chrom_id - 1](1);
            const w = GenomePlot.linearGenomicToPaddedPixelScaleX(+d.chromEnd) - GenomePlot.linearGenomicToPaddedPixelScaleX(+d.chromStart);
            const h = GenomePlot.cytobandsHeight;

            // filter out centromeres outside the viewport
            if (x + w < 0 || x > GenomePlot.innerWidth || y + h < 0 || y > GenomePlot.innerHeight) { return false; }

            d.points = (d.name[0] === 'p') ? // eslint-disable-line no-param-reassign
                `${x.toFixed(GenomePlot.FLOAT_PRECISION)},${y.toFixed(GenomePlot.FLOAT_PRECISION)} ${
                    x.toFixed(GenomePlot.FLOAT_PRECISION)},${(y + h).toFixed(GenomePlot.FLOAT_PRECISION)} ${
                    (x + w).toFixed(GenomePlot.FLOAT_PRECISION)},${(y + h * 0.5).toFixed(GenomePlot.FLOAT_PRECISION)}` : // p-arm
                `${x.toFixed(GenomePlot.FLOAT_PRECISION)},${(y + h * 0.5).toFixed(GenomePlot.FLOAT_PRECISION)} ${
                    (x + w).toFixed(GenomePlot.FLOAT_PRECISION)},${(y + h).toFixed(GenomePlot.FLOAT_PRECISION)} ${
                    (x + w).toFixed(GenomePlot.FLOAT_PRECISION)},${y.toFixed(GenomePlot.FLOAT_PRECISION)}`; // q-arm

            return true;
        });

        /* eslint-disable no-tabs */
        // draw the red centromere as a polygon
        //
        // (x,y)								(x+width,y+height)
        //	*-----	width				-----*
        //	|\   |						|   /|
        //	| \  |						|  / |
        //	|  \ |						| /  |
        //	|   \|	height/2	or		|/   |
        //	|   /|						|\   |
        //	|  / |						| \  |
        //	| /  |						|  \ |
        //	|/   |						|   \|
        //	------						-----* (x+width,y)
        /* eslint-enable no-tabs */

        // we will be adding 2 same polygons one with fill style cytoBandColors["acen"] (the centomereData can only
        // be of gieStain "acen") and one with fill "url(#diagonalHatch)"
        [GenomePlot.cytoBandColors.acen, 'url(#diagonalHatch)'].forEach((fillStyle) =>
        {
            const cm = centromere
                .append('svg:g')
                .style('fill', fillStyle)
                .selectAll('chrome-rect')
                .data(centomereData);

            cm.enter()
                .append('svg:polygon')
                .attr('class', 'cytotris')
                .attr('points', d => d.points);

            cm.exit().remove();
        });
    }

    d3.selectAll('.cytobands .cytorects, .cytobands .cytotris')

    // tooltips
        .on('mouseover', (d) =>
        {
            if (GenomePlot.miscParams.showTooltips)
            {
                GenomePlot.tooltip
                    .transition()
                    .duration(200)
                    .style('opacity', 0.9);
                GenomePlot.tooltip.html(`${d.chrom} Band ${d.name} (${(+d.chromStart / 1000).toLocaleString()}KB - ${(+d.chromEnd / 1000).toLocaleString()}KB)`)
                    .style('left', `${d3.event.pageX + 10}px`)
                    .style('top', `${d3.event.pageY - 100}px`);
            }
        })
        .on('mouseout', () =>
        {
            if (GenomePlot.miscParams.showTooltips)
            {
                GenomePlot.tooltip
                    .transition()
                    .duration(500)
                    .style('opacity', 1e-6);
            }
        });
}; // drawCytobands

GenomePlot.drawSVGAlterationsPaths = function (alterationsData)
{
    // first draw the indicator of a junction plot using GenomePlot.junctionIndicatorColor color
    const alterIndicator = GenomePlot.container
        .append('svg:g')
        .style({
            'stroke-linecap': 'round',
            'stroke-opacity': 0.50,
        })
        .selectAll('scatter_line')
        .data(alterationsData);

    alterIndicator
        .enter()
        .append('svg:g');

    if (GenomePlot.junctionsParams.drawType === 'Arcs')
    {
        alterIndicator
            .style({
                fill: 'none',
                'pointer-events': 'stroke',
            })
            .append('svg:path')
            .attr('d', d => d.pathArc);
    }

    alterIndicator
        .attr('class', d => `${'alterationsIndicator s'}${d.Nassoc === '' ? 0 : d.Nassoc}${d.chrA}${d.chrB}${d.posA}${d.posB}`)
        .style(GenomePlot.junctionIndicatorStyle.normal)
        .on('mouseover', function (d)
        {
            if (GenomePlot.miscParams.showTooltips)
            {
                GenomePlot.tooltip
                    .transition()
                    .duration(200)
                    .style('opacity', 0.9);
                GenomePlot.tooltip.html(`Chr${d.chrA} (${Math.round(+d.posA / 1000).toLocaleString()}KB) - Chr${d.chrB} (${Math.round(+d.posB / 1000).toLocaleString()}KB), Associates: ${d.Nassoc === '' ? 0 : d.Nassoc}`)
                    .style('left', `${d3.event.pageX + 10}px`)
                    .style('top', `${d3.event.pageY - 30}px`);
            }

            // remove all previous highlights
            d3.selectAll('.alterationsIndicator')
                .transition()
                .duration(500)
                .style(GenomePlot.junctionIndicatorStyle.normal);
            d3.timer.flush();

            // highlight selected variant
            const selection = d3.select(this);
            selection.moveToFront();

            // from: http://bl.ocks.org/aharris88/bd59ffb45f0635667749
            const strokeWidth = parseFloat(selection.style('stroke-width').replace('px', ''));

            selection.transition()
                .duration(500)
                .style(GenomePlot.junctionIndicatorStyle.highlight)
                .style('stroke-width', 1.55 * strokeWidth)
                .transition()
                .ease('elastic')
                .style('stroke-width', strokeWidth);
        })
        .on('mouseout', function ()
        {
            if (GenomePlot.miscParams.showTooltips)
            {
                GenomePlot.tooltip
                    .transition()
                    .duration(500)
                    .style('opacity', 1e-6);
            }

            d3.select(this)
                .transition()
                .duration(500)
                .style(GenomePlot.junctionIndicatorStyle.normal);
        })
        .on('mousedown', () =>
        {
            // prevent the start of panning since we will use the mouse up event
            d3.event.preventDefault();
            d3.event.stopImmediatePropagation();
        })
        .on('mouseup', () =>
        {
            d3.event.preventDefault();
            d3.event.stopImmediatePropagation();
        });

    alterIndicator.exit().remove();

    // draw the alterations
    const alter = GenomePlot.container
        .append('svg:g')
        .style({
            'stroke-linecap': 'round',
            'stroke-opacity': 0.75,
        })
        .selectAll('scatter_line')
        .data(alterationsData);

    alter
        .enter()
        .append('svg:g');

    if (GenomePlot.junctionsParams.drawType === 'Arcs')
    {
        alter
            .style({
                fill: 'none',
                'pointer-events': 'none',
            })
            .append('svg:path')
            .attr('d', d => d.pathArc);
    }

    alter
        .attr('class', 'alterations')
        .style('stroke-width', GenomePlot.junctionThickness)
        .style('stroke', GenomePlot.junctionTypeColor);

    alter.exit().remove();
}; // drawSVGAlterationsPaths

GenomePlot.drawAlterations = function ()
{
    // remove the old alterations
    d3.selectAll('.alterationsIndicator').remove();
    d3.selectAll('.alterations').remove();

    if (GenomePlot.alterationsData === undefined) return;

    if (GenomePlot.junctionsParams.drawType === 'None') return;

    if (GenomePlot.graphTypeParams.graphType === 'Circos') return;

    // first filter the data for the correct chromosome numbers and
    // then take the max(Nassoc) of the remaining GenomePlot.alterationsData
    GenomePlot.junctionsParams.maxAssoc =
    d3.max(
        GenomePlot.alterationsData
            .filter(d => d.chrA <= GenomePlot.NUM_CHROMS && d.chrB <= GenomePlot.NUM_CHROMS),
        d => d.Nassoc,
    );

    const offsetHigher = 0.40 * GenomePlot.pixelsPerLine;

    const alterationsData = GenomePlot.alterationsData
        .filter(d => d.chrA <= GenomePlot.NUM_CHROMS && d.chrB <= GenomePlot.NUM_CHROMS)
        .filter(d => d.Nassoc >= GenomePlot.junctionsParams.associates); // filter on the current numOfAssoc value

    // create the alter* paths
    for (let i = 0; i < alterationsData.length; i += 1)
    {
        const d = alterationsData[i];

        const x1 = GenomePlot.linearGenomicToPaddedPixelScaleX(GenomePlot.chromPixelStarts[d.chrA - 1].x + d.posA - 0.5);
        const x2 = GenomePlot.linearGenomicToPaddedPixelScaleX(GenomePlot.chromPixelStarts[d.chrB - 1].x + d.posB - 0.5);
        let y1;
        let y2;
        let curvature = GenomePlot.junctionsParams.arcFactor;

        if (d.chrA !== d.chrB)
        {
            y1 = GenomePlot.linearWindowPixelToPaddedPixelScaleY(GenomePlot.chromPixelStarts[d.chrA - 1].y);
            y2 = GenomePlot.linearWindowPixelToPaddedPixelScaleY(GenomePlot.chromPixelStarts[d.chrB - 1].y);
            curvature *= 3.0;
        }
        else
        {
            let adjust_y;

            if (Math.abs(d.posB - d.posA) > 5 * GenomePlot.MEGA_BASE &&
                (GenomePlot.graphTypeParams.graphType === 'U-Shape'))
            {
                adjust_y = GenomePlot.pixelsPerLine / 10;

                y1 = GenomePlot.linearWindowPixelToPaddedPixelScaleY(GenomePlot.chromPixelStarts[d.chrA - 1].y) - adjust_y;
                y2 = GenomePlot.linearWindowPixelToPaddedPixelScaleY(GenomePlot.chromPixelStarts[d.chrB - 1].y) - adjust_y;
            }
            else
            {
                adjust_y = offsetHigher - Math.sqrt(d.Nassoc) - 2;

                // place it higher in the line
                y1 = GenomePlot.linearWindowPixelToPaddedPixelScaleY(GenomePlot.chromPixelStarts[d.chrA - 1].y) - adjust_y;
                y2 = GenomePlot.linearWindowPixelToPaddedPixelScaleY(GenomePlot.chromPixelStarts[d.chrB - 1].y) - adjust_y;
            }
        }

        const dx = x2 - x1;
        const dy = y2 - y1;
        const dr = curvature * Math.sqrt(dx * dx + dy * dy);

        d.pathArc = `M${x1.toFixed(GenomePlot.FLOAT_PRECISION)},${y1.toFixed(GenomePlot.FLOAT_PRECISION)}A${dr},${dr} 0 0,1 ${x2.toFixed(GenomePlot.FLOAT_PRECISION)},${y2.toFixed(GenomePlot.FLOAT_PRECISION)}`;
    }

    // /////////////////////////////////////////////////////////////////////////////

    GenomePlot.drawSVGAlterationsPaths(alterationsData);
}; // drawAlterations

/**
 * handle masked data in copy number data
 * @param {array} dataInMasked - pairwise sequences to be masked
 * @returns {array[][]} - the information required to draw the lines
 */
function splitLinesToSegmentsPerCopyNumberState(dataIn, dataInMasked, dataY, dataC)
{
    // break the dataIn array into multiple line segments
    // depending on the masked ranges
    // and the copy number state
    const dataCNVLines = new Array(GenomePlot.copyNumberStateColor.length);

    for (let sc = 0; sc < GenomePlot.copyNumberStateColor.length; sc += 1)
    {
        dataCNVLines[sc] = [];
    }

    let s = 0; // count of number of segments
    let m = 0; // count of masking pairs
    let prev_state = dataC[0];

    // for each one of the cnv states
    for (let sc = 0; sc < GenomePlot.copyNumberStateColor.length; sc += 1)
    {
        dataCNVLines[sc][s] = []; // allocate a new segment
    }

    for (let i = 0; i < dataIn.length; i += 1)
    {
        if (dataIn[i] <= dataInMasked[m] || dataInMasked.length === 0)
        {
            if (dataC[i] !== prev_state)
            {
                s += 1;

                for (let sc = 0; sc < GenomePlot.copyNumberStateColor.length; sc += 1)
                {
                    dataCNVLines[sc][s] = []; // allocate a new segment
                }
            }

            for (let sc = 0; sc < GenomePlot.copyNumberStateColor.length; sc += 1)
            {
                if (dataC[i] === GenomePlot.copyNumberStateColor[sc])
                {
                    dataCNVLines[sc][s].push({ x: dataIn[i], y: dataY[i], c: dataC[i] });
                    prev_state = dataC[i];
                }
            }
        }
        else if (dataIn[i] > dataInMasked[m] && dataIn[i] < dataInMasked[m + 1])
        {
            prev_state = dataC[i];
            continue; // eslint-disable-line no-continue
        }
        else if (dataIn[i] >= dataInMasked[m + 1])
        {
            if (dataIn[i] === dataInMasked[m + 1])
            {
                s += 1;

                for (let sc = 0; sc < GenomePlot.copyNumberStateColor.length; sc += 1)
                {
                    dataCNVLines[sc][s] = []; // allocate a new segment
                }

                if (m < dataInMasked.length - 2) { m += 2; }
            }

            if (dataC[i] !== prev_state)
            {
                s += 1;

                for (let sc = 0; sc < GenomePlot.copyNumberStateColor.length; sc += 1)
                {
                    dataCNVLines[sc][s] = []; // allocate a new segment
                }
            }

            for (let sc = 0; sc < GenomePlot.copyNumberStateColor.length; sc += 1)
            {
                if (dataC[i] === GenomePlot.copyNumberStateColor[sc])
                {
                    dataCNVLines[sc][s].push({ x: dataIn[i], y: dataY[i], c: dataC[i] });
                    prev_state = dataC[i];
                }
            }
        }
    }

    // clean up; order is important!
    for (let sc = 0; sc < GenomePlot.copyNumberStateColor.length; sc += 1)
    {
        for (let ss = s; ss >= 0; ss -= 1)
        {
            if (dataCNVLines[sc][ss].length === 0 || dataCNVLines[sc][ss].length === 1)
            {
                dataCNVLines[sc].splice(ss, 1);
            }
        }
    }

    return dataCNVLines;
} // splitLinesToSegmentsPerCopyNumberState

GenomePlot.drawSVGCopyNumber = function ()
{
    // remove the old copy number
    d3.selectAll('.copycircles').remove();
    d3.selectAll('.copylines').remove();

    if (GenomePlot.copyNumberParams.drawType === 'None'
    || GenomePlot.copyNumberParams.drawType !== 'Lines') { return; }

    for (let chrom_id = 0; chrom_id < GenomePlot.NUM_CHROMS; chrom_id += 1)
    {
        const dataX = GenomePlot.copyNumberData.toLegacy.wdnsPerChrom[chrom_id];
        const dataY = GenomePlot.copyNumberData.toLegacy.frqPerChrom[chrom_id];

        const line = d3.svg.line()
            .x(d => GenomePlot.linearGenomicToPaddedPixelScaleX(d.x + GenomePlot.chromPixelStarts[chrom_id].x))
            .y(d => (1 - d.y) * 0.5 * GenomePlot.scale * GenomePlot.pixelsPerLine + GenomePlot.linearWindowPixelToPaddedPixelScaleY(GenomePlot.chromPixelStarts[chrom_id].y)); // translate y value to a pixel

        // get the intervals corresponding to chrom_id
        let dataCNVState = GenomePlot.copyNumberStateData
            // if we are using the tableDataSelected make sure we use only the rows with NRD values defined
            .filter(d => d.NRD !== '' && (d.chrA - 1) === chrom_id);

        let dataC = new Array(dataX.length);

        let i = 0;
        let j = 0;
        while (j < dataCNVState.length)
        {
            while (dataX[i] < dataCNVState[j].posA) i += 1;
            while (dataX[i] <= dataCNVState[j].posB)
            {
                dataC[i] = GenomePlot.copyNumberStateColor[dataCNVState[j].state - 1];

                i += 1;
            }

            j += 1;
        }

        const dataXMasked = GenomePlot.copyNumberData.toLegacy.wdnsMaskedPerChrom[chrom_id];

        let data = splitLinesToSegmentsPerCopyNumberState(dataX, dataXMasked, dataY, dataC);

        for (let sc = 0; sc < GenomePlot.copyNumberStateColor.length; sc += 1)
        {
            const lines =
                GenomePlot.container
                    .append('g')
                    .attr('class', 'copylines')
                    .style({
                        // "stroke": "gray",
                        stroke: GenomePlot.copyNumberStateColor[sc],
                        'stroke-opacity': 0.75,
                        'stroke-width': 1,
                        fill: 'none',
                        'shape-rendering': 'crispEdges',
                        'pointer-events': 'none',
                    })
                    .selectAll('path')
                    .data(data[sc]);

            lines
                .enter().append('svg:path')
                .attr('d', line);

            lines.exit().remove();
        }

        // for the garbage collector
        data = null;

        // for the garbage collector
        dataC = null;
        dataCNVState = null;
    }
}; // drawSVGCopyNumber

GenomePlot.drawAxis = function ()
{
    // remove the old axis
    d3.selectAll('.x.axis, .x.axis_13_14_15, .x.axis_16_17_18, .x.axis_19_20, .x.axis_21_22, .x.axis_T').remove();
    d3.selectAll('.y.axis_L, .y.axis_R').remove();

    d3.selectAll('.hoverX-text, .hoverX_13_14_15-text, .hoverX_16_17_18-text, .hoverX_19_20-text, .hoverX_21_22-text').remove();

    const formatValue = d3.format('s');

    const fontHeight = 1.1 * GenomePlot.viewportUnitHeight;

    // /////////////////////////////////////////////////////////////////////////////

    // draw the x axis
    GenomePlot.axisX = d3.svg.axis()
        .scale(GenomePlot.linearGenomicToPaddedPixelScaleX)
        .orient('bottom')
        .ticks(Math.round(GenomePlot.innerWidth / 100))
        .tickFormat(d => formatValue(d));

    const xAxisNode = GenomePlot.svg
        .append('svg:g')
        .style({
            'font-family': '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            'font-size': fontHeight,
            fill: 'none',
            stroke: 'black',
            'stroke-width': 1,
            'shape-rendering': 'auto',
        })
        .attr('class', 'x axis')
        .attr('transform', `translate(0,${GenomePlot.innerHeight + 5})`)
        .call(GenomePlot.axisX);

    // fix the resulting text
    xAxisNode.selectAll('text')
        .style('stroke', 'none')
        .style('fill', 'black');
    xAxisNode.locationY = d3.transform(xAxisNode.attr('transform')).translate[1] + 2.5 * fontHeight;

    // hover text for this axis
    GenomePlot.svg
        .append('svg:text')
        .attr('class', 'hoverX-text')
        .style({
            'font-family': '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            'font-size': 1.25 * GenomePlot.viewportUnitHeight,
            'shape-rendering': 'crispEdges',
            'vector-effect': 'non-scaling-stroke',
            'pointer-events': 'none',
        })
        .attr('x', 10)
        .attr('y', -GenomePlot.viewportUnitHeight / 1.5);

    // /////////////////////////////////////////////////////////////////////////////

    if (GenomePlot.miscParams.showAdditionalAxis
    && GenomePlot.graphTypeParams.graphType === 'U-Shape')
    {
        // draw the additional x axis
        GenomePlot.axisX_13_14_15 = d3.svg.axis()
            .scale(GenomePlot.linearGenomicToPaddedPixelScaleX_13_14_15)
            .orient('bottom')
            .ticks(Math.round(GenomePlot.innerWidth / 300))
            // .tickFormat (function( d ) { return formatValue(d).replace(/[MG]/, function( m ) { return m + 'b' } ); } )
            .tickFormat(d => formatValue(d));

        const xAxisNode_13_14_15 = GenomePlot.svg
            .append('svg:g')
            .style({
                'font-family': '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                'font-size': fontHeight,
                fill: 'none',
                stroke: 'black',
                'stroke-width': 1,
                'shape-rendering': 'auto',
            })
            .attr('class', 'x axis_13_14_15')
            .call(GenomePlot.axisX_13_14_15);

        xAxisNode_13_14_15
            .attr('transform', `translate(0,${xAxisNode.locationY})`);

        // fix the resulting text
        xAxisNode_13_14_15.selectAll('text')
            .style('stroke', 'none')
            .style('fill', 'black');
        xAxisNode_13_14_15.locationY = d3.transform(xAxisNode_13_14_15.attr('transform')).translate[1] + 2.5 * fontHeight;

        // hover text for this axis
        GenomePlot.svg
            .append('svg:text')
            .attr('class', 'hoverX_13_14_15-text')
            .style({
                'font-family': '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                'font-size': 1.1 * GenomePlot.viewportUnitHeight,
                'shape-rendering': 'crispEdges',
                'vector-effect': 'non-scaling-stroke',
                'pointer-events': 'none',
            })
            .attr('x', GenomePlot.innerWidth / 8)
            .attr('y', xAxisNode_13_14_15.locationY - 1.1 * GenomePlot.viewportUnitHeight);

        // /////////////////////////////////////////////////////////////////////////////

        // draw the additional x axis
        GenomePlot.axisX_16_17_18 = d3.svg.axis()
            .scale(GenomePlot.linearGenomicToPaddedPixelScaleX_16_17_18)
            .orient('bottom')
            .ticks(Math.round(GenomePlot.innerWidth / 375))
            // .tickFormat (function( d ) { return formatValue(d).replace(/[MG]/, function( m ) { return m + 'b' } ); } )
            .tickFormat(d => formatValue(d));

        const xAxisNode_16_17_18 = GenomePlot.svg
            .append('svg:g')
            .style({
                'font-family': '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                'font-size': fontHeight,
                fill: 'none',
                stroke: 'black',
                'stroke-width': 1,
                'shape-rendering': 'auto',
            })
            .attr('class', 'x axis_16_17_18')
            .call(GenomePlot.axisX_16_17_18);

        xAxisNode_16_17_18
            .attr('transform', `translate(0,${xAxisNode_13_14_15.locationY})`);

        // fix the resulting text
        xAxisNode_16_17_18.selectAll('text')
            .style('stroke', 'none')
            .style('fill', 'black');
        xAxisNode_16_17_18.locationY = d3.transform(xAxisNode_16_17_18.attr('transform')).translate[1] + 2.5 * fontHeight;

        // hover text for this axis
        GenomePlot.svg
            .append('svg:text')
            .attr('class', 'hoverX_16_17_18-text')
            .style({
                'font-family': '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                'font-size': 1.1 * GenomePlot.viewportUnitHeight,
                'shape-rendering': 'crispEdges',
                'vector-effect': 'non-scaling-stroke',
                'pointer-events': 'none',
            })
            .attr('x', GenomePlot.innerWidth / 8)
            .attr('y', xAxisNode_16_17_18.locationY - 1.1 * GenomePlot.viewportUnitHeight);

        // /////////////////////////////////////////////////////////////////////////////

        // draw the additional x axis
        GenomePlot.axisX_19_20 = d3.svg.axis()
            .scale(GenomePlot.linearGenomicToPaddedPixelScaleX_19_20)
            .orient('bottom')
            .ticks(Math.round(GenomePlot.innerWidth / 425))
            // .tickFormat (function( d ) { return formatValue(d).replace(/[MG]/, function( m ) { return ' ' + m + 'b' } ); } )
            .tickFormat(d => formatValue(d));

        const xAxisNode_19_20 = GenomePlot.svg
            .append('svg:g')
            .style({
                'font-family': '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                'font-size': fontHeight,
                fill: 'none',
                stroke: 'black',
                'stroke-width': 1,
                'shape-rendering': 'auto',
            })
            .attr('class', 'x axis_19_20')
            .call(GenomePlot.axisX_19_20);

        xAxisNode_19_20
            .attr('transform', `translate(0,${xAxisNode_16_17_18.locationY})`);

        // fix the resulting text
        xAxisNode_19_20.selectAll('text')
            .style('stroke', 'none')
            .style('fill', 'black');
        xAxisNode_19_20.locationY = d3.transform(xAxisNode_19_20.attr('transform')).translate[1] + 2.5 * fontHeight;

        // hover text for this axis
        GenomePlot.svg
            .append('svg:text')
            .attr('class', 'hoverX_19_20-text')
            .style({
                'font-family': '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                'font-size': 1.1 * GenomePlot.viewportUnitHeight,
                'shape-rendering': 'crispEdges',
                'vector-effect': 'non-scaling-stroke',
                'pointer-events': 'none',
            })
            .attr('x', GenomePlot.innerWidth / 8)
            .attr('y', xAxisNode_19_20.locationY - 1.1 * GenomePlot.viewportUnitHeight);

        // /////////////////////////////////////////////////////////////////////////////

        // draw the additional x axis
        GenomePlot.axisX_21_22 = d3.svg.axis()
            .scale(GenomePlot.linearGenomicToPaddedPixelScaleX_21_22)
            .orient('bottom')
            .ticks(Math.round(GenomePlot.innerWidth / 500))
            // .tickFormat (function( d ) { return formatValue(d).replace(/[MG]/, function( m ) { return ' ' + m + 'b' } ); } )
            .tickFormat(d => formatValue(d));

        const xAxisNode_21_22 = GenomePlot.svg
            .append('svg:g')
            .style({
                'font-family': '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                'font-size': fontHeight,
                fill: 'none',
                stroke: 'black',
                'stroke-width': 1,
                'shape-rendering': 'auto',
            })
            .attr('class', 'x axis_21_22')
            .call(GenomePlot.axisX_21_22);

        xAxisNode_21_22
            .attr('transform', `translate(0,${xAxisNode_19_20.locationY})`);

        // fix the resulting text
        xAxisNode_21_22.selectAll('text')
            .style('stroke', 'none')
            .style('fill', 'black');
        xAxisNode_21_22.locationY = d3.transform(xAxisNode_21_22.attr('transform')).translate[1] + 2.5 * fontHeight;

        // hover text for this axis
        GenomePlot.svg
            .append('svg:text')
            .attr('class', 'hoverX_21_22-text')
            .style({
                'font-family': '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                'font-size': 1.1 * GenomePlot.viewportUnitHeight,
                'shape-rendering': 'crispEdges',
                'vector-effect': 'non-scaling-stroke',
                'pointer-events': 'none',
            })
            .attr('x', GenomePlot.innerWidth / 8)
            .attr('y', xAxisNode_21_22.locationY - 1.1 * GenomePlot.viewportUnitHeight);
    }

    // /////////////////////////////////////////////////////////////////////////////

    if (GenomePlot.graphTypeParams.graphType === 'U-Shape')
    {
        const fontWidth = Math.max(8, 1.2 * GenomePlot.viewportUnitWidth);

        // draw the left y axis
        GenomePlot.axisY_L = d3.svg.axis()
            .scale(GenomePlot.linearChromosomeToPaddedPixelScaleY_L)
            .orient('left')
            .tickValues(d3.range(1, 14))
            .tickFormat(d => formatValue(d).replace('13', 'X'));

        GenomePlot.svg
            .append('svg:clipPath')
            .attr('id', 'clip-y-axis_L')
            .append('svg:rect')
            .attr('x', -GenomePlot.margin.left)
            .attr('y', 0)
            .attr('width', GenomePlot.margin.left)
            .attr('height', GenomePlot.innerHeight);

        const yAxisNode_L = GenomePlot.svg
            .append('svg:g')
            .style({
                'font-family': '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                'font-size': fontWidth,
                'font-weight': 'bold',
                fill: 'none',
                stroke: 'black',
                'stroke-width': 1,
                'shape-rendering': 'auto',
            })
            .attr('class', 'y axis_L')
            .attr('clip-path', 'url(#clip-y-axis_L)')
            .attr('transform', 'translate(-5,0)')
            .call(GenomePlot.axisY_L);

        // fix the resulting text
        yAxisNode_L.selectAll('text')
            .style({
                stroke: 'none',
                fill: 'black',
                cursor: 'pointer',
            })
            .each(vCenter(GenomePlot.scale * GenomePlot.pixelsPerLine))
            .each(hCenter(GenomePlot.margin.left - 5, -1));

        // /////////////////////////////////////////////////////////////////////////////

        // draw the right y axis
        GenomePlot.axisY_R = d3.svg.axis()
            .scale(GenomePlot.linearChromosomeToPaddedPixelScaleY_R)
            .orient('right')
            .tickValues([24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11])
            .tickFormat((d) =>
            {
                if (d === 12) return formatValue(d).replace('12', 'Y');
                if (d === 23) return formatValue(d).replace('23', '');
                if (d === 24) return formatValue(d).replace('24', '');

                return formatValue(d);
            });

        GenomePlot.svg
            .append('svg:clipPath')
            .attr('id', 'clip-y-axis_R')
            .append('svg:rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', GenomePlot.margin.right)
            .attr('height', GenomePlot.innerHeight);

        const yAxisNode_R = GenomePlot.svg
            .append('svg:g')
            .style({
                'font-family': '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                'font-size': fontWidth,
                'font-weight': 'bold',
                fill: 'none',
                stroke: 'black',
                'stroke-width': 1,
                'shape-rendering': 'auto',
            })
            .attr('class', 'y axis_R')
            .attr('clip-path', 'url(#clip-y-axis_R)')
            .attr('transform', `translate(${GenomePlot.innerWidth + 5},0)`)
            .call(GenomePlot.axisY_R);

        // fix the resulting text
        yAxisNode_R.selectAll('text')
            .style({
                stroke: 'none',
                fill: 'black',
                cursor: 'pointer',
            })
            .each(vCenter(GenomePlot.scale * GenomePlot.pixelsPerLine))
            .each(hCenter(GenomePlot.margin.right - 5, 1));
    }
}; // drawAxis

GenomePlot.onZoom = function ()
{
    const t = d3.event.translate;
    const s = d3.event.scale;

    // constrain the x and y components of the translation by the dimensions of the viewport
    // from: https://gist.github.com/shawnbot/6518285
    t[0] = Math.min(0, Math.max(t[0], GenomePlot.innerWidth - GenomePlot.innerWidth * s));
    t[1] = Math.min(0, Math.max(t[1], GenomePlot.innerHeight - GenomePlot.innerHeight * s));

    GenomePlot.scale = s;
    GenomePlot.translate = t;

    // update the behavior translate values with the constrained values
    d3.event.target.translate(t);

    // for geometric zooming
    // d3.select('#groupMainContainerContents').attr("transform", "translate(" + t + ")" + " scale(" + s + ")");

    // or, for semantic zooming
    GenomePlot.updateZoom(t, s);
}; // onZoom

GenomePlot.updateZoom = function (t, s)
{
    // from: http://stackoverflow.com/questions/23212277/adding-several-y-axes-with-zoom-pan-in-d3js
    if (GenomePlot.graphTypeParams.graphType === 'U-Shape')
    {
        GenomePlot.zoomY_L.scale(s).translate(t);

        if (GenomePlot.graphTypeParams.graphType === 'U-Shape')
        {
            GenomePlot.zoomY_R.scale(s).translate(t);
        }

        GenomePlot.basesPerPixel = Math.ceil(GenomePlot.MAX_CHROMOSOME_BASE / (
            GenomePlot.linearGenomicToPaddedPixelScaleX(GenomePlot.MAX_CHROMOSOME_BASE) -
                GenomePlot.linearGenomicToPaddedPixelScaleX(0)));
        GenomePlot.scaledPixelsPerLine =
            GenomePlot.linearWindowPixelToPaddedPixelScaleY(GenomePlot.chromPixelStarts[1].y) -
            GenomePlot.linearWindowPixelToPaddedPixelScaleY(GenomePlot.chromPixelStarts[0].y);

        // update scale as it depends on scaledPixelsPerLine
        // by zoom factor 12 bring the elements' y-position to the middle of the chromosome height
        for (let chrom_id = 0; chrom_id < GenomePlot.NUM_CHROMS; chrom_id += 1)
        {
            GenomePlot.exponentMoveToMiddleOfChromScaleY[chrom_id] =
                d3.scale.pow().exponent(0.05)
                    .domain([1, 12]) // 12: arbitrary scale value by which we want the overlap of data to take effect
                    .range([
                    // GenomePlot.chromPixelStarts is 0 based
                        GenomePlot.linearWindowPixelToPaddedPixelScaleY(GenomePlot.chromPixelStarts[chrom_id].y + GenomePlot.pixelsPerLine / 3.5),
                        GenomePlot.linearWindowPixelToPaddedPixelScaleY(GenomePlot.chromPixelStarts[chrom_id].y) - 0.05 * GenomePlot.scaledPixelsPerLine,
                    ])
                    .clamp(true); // dont want values above 12
        }
    }

    GenomePlot.drawBackground();

    GenomePlot.drawHorizontalDividers();
    GenomePlot.drawVerticalDividers();

    GenomePlot.drawCytobands();

    if (GenomePlot.copyNumberData !== undefined &&
    GenomePlot.copyNumberStateData !== undefined) { GenomePlot.drawSVGCopyNumber(); }

    GenomePlot.drawAlterations();

    // set the opacity of the vertical labels depending on how much of the chromosome we see in out viewport
    if (GenomePlot.graphTypeParams.graphType === 'U-Shape')
    {
        const virtualWidth = GenomePlot.innerWidth - GenomePlot.innerWidth * s;

        d3.selectAll('.y.axis_L text')
            .style('opacity', () => 1 - t[0] / virtualWidth);

        d3.selectAll('.y.axis_R text')
            .style('opacity', () => t[0] / virtualWidth);
    }
}; // updateZoom

function closureCopyNumberStateColor(c) { return GenomePlot.copyNumberStateColor[c]; }

GenomePlot.drawCircos = function ()
{
    const cytobands = GenomePlot.cytoBandData.map(d => ({
        block_id: d.chrom,
        start: parseInt(d.chromStart, 10),
        end: parseInt(d.chromEnd, 10),
        gieStain: d.gieStain,
        name: d.name,
    }));

    // intra
    const alterationsIntraData = GenomePlot.alterationsData
        .filter(d => d.chrA !== d.chrB && d.Nassoc >= GenomePlot.junctionsParams.associates); // filter on the current numOfAssoc value

    const alterationsIntra = alterationsIntraData.map((d) =>
    {
        const idA = getChromName(+d.chrA);
        const idB = getChromName(+d.chrB);

        return {
            source: {
                id: `chr${idA}`,
                start: Math.max(parseInt(d.posA, 10) - 2000000),
                end: Math.max(parseInt(d.posA, 10) + 2000000),
            },
            target: {
                id: `chr${idB}`,
                start: Math.max(parseInt(d.posB, 10) - 2000000),
                end: Math.max(parseInt(d.posB, 10) + 2000000),
            },
        };
    });

    // inter
    const alterationsInterData = GenomePlot.alterationsData
        .filter(d => d.chrA === d.chrB && d.Nassoc >= GenomePlot.junctionsParams.associates); // filter on the current numOfAssoc value

    const alterationsInter = alterationsInterData.map((d) =>
    {
        const idA = getChromName(+d.chrA);
        const idB = getChromName(+d.chrB);

        return {
            source: {
                id: `chr${idA}`,
                start: Math.max(parseInt(d.posA, 10) - 2000000),
                end: Math.max(parseInt(d.posA, 10) + 2000000),
            },
            target: {
                id: `chr${idB}`,
                start: Math.max(parseInt(d.posB, 10) - 2000000),
                end: Math.max(parseInt(d.posB, 10) + 2000000),
            },
        };
    });

    // remove old contents
    const container = d3.select('#groupMainContainerContents');
    container
        .selectAll(function () { return this.childNodes; })
        .remove();

    // remove all behaviors from the parent container
    d3.select('#groupMainContainer')
        .on('.zoom', null);
    const chromRingThickness = 20;
    const labelOffset = chromRingThickness + 40;
    GenomePlot.graphTypeCircos.outerRadius = Math.max(chromRingThickness + 1, (GenomePlot.graphTypeCircos.width - labelOffset) * 0.5 - GenomePlot.graphTypeCircos.padding);

    const circos = new Circos({
        container: '#groupMainContainerContents',
        width: GenomePlot.graphTypeCircos.width,
        height: GenomePlot.graphTypeCircos.width,
    });

    circos.svg
        .attr('transform', `translate(${GenomePlot.margin.left},${GenomePlot.margin.top})`)
        .style('pointer-events', 'none');

    // add zoom behavior to the circos plot
    d3.select('#groupMainContainer')
        .select('rect')
        .call(d3.behavior.zoom()
            .scaleExtent([1, 10])
            .on('zoom', () =>
            {
                container.attr('transform', `translate(${d3.event.translate}) scale(${d3.event.scale})`);
            }));
    circos
        .layout(GenomePlot.chromosomesCircos, {
            outerRadius: GenomePlot.graphTypeCircos.outerRadius,
            innerRadius: GenomePlot.graphTypeCircos.outerRadius - chromRingThickness,
            labels: {
                radialOffset: labelOffset,
            },
            ticks: {
                display: true,
                labelDenominator: 1000000,
            },
        })
        .highlight('cytobands', cytobands, {
            outerRadius: GenomePlot.graphTypeCircos.outerRadius,
            innerRadius: GenomePlot.graphTypeCircos.outerRadius - chromRingThickness,
            opacity: 0.50,
            color(d)
            {
                return GenomePlot.cytoBandColors[d.gieStain];
            },
            tooltipContent: null, // function (d) { return d.name },
        })
        .chords('alterationsIntra', alterationsIntra, {
            logScale: false,
            opacity: 0.75,
            color: GenomePlot.junctionNormalColor,
            tooltipContent: null, // function (d) { return d.source.id + ' ➤ ' + d.target.id + ': ' + d.value; },
        })
        .chords('alterationsInter', alterationsInter, {
            logScale: false,
            opacity: 0.75,
            color: 'orange',
            tooltipContent: null, // function (d) { return d.source.id + ' ➤ ' + d.target.id + ': ' + d.value; },
        });

    if (GenomePlot.copyNumberData !== undefined
    && GenomePlot.copyNumberStateData !== undefined)
    {
        for (let chrom_id = 0; chrom_id < GenomePlot.NUM_CHROMS; chrom_id += 1)
        {
            const dataX = GenomePlot.copyNumberData.toLegacy.wdnsPerChrom[chrom_id];
            const dataY = GenomePlot.copyNumberData.toLegacy.frqPerChrom[chrom_id];

            const dataXMasked = GenomePlot.copyNumberData.toLegacy.wdnsMaskedPerChrom[chrom_id];

            {
                // get the intervals corresponding to chrom_id
                let dataCNVState = GenomePlot.copyNumberStateData
                    // if we are using the tableDataSelected make sure we use only the rows with NRD values defined
                    .filter(d => d.NRD !== '' && (d.chrA - 1) === chrom_id);

                let dataC = new Array(dataX.length);

                let i = 0;
                let j = 0;

                while (j < dataCNVState.length)
                {
                    while (dataX[i] < dataCNVState[j].posA) i += 1;
                    while (dataX[i] <= dataCNVState[j].posB)
                    {
                        dataC[i] = GenomePlot.copyNumberStateColor[dataCNVState[j].state - 1];

                        i += 1;
                    }

                    j += 1;
                }

                let data = splitLinesToSegmentsPerCopyNumberState(dataX, dataXMasked, dataY, dataC);

                for (let sc = 0; sc < GenomePlot.copyNumberStateColor.length; sc += 1)
                {
                    const copynumber = [];

                    for (let s = 0; s < data[sc].length; s += 1)
                    {
                        for (let si = 0; si < data[sc][s].length; si += 1)
                        {
                            copynumber.push({
                                block_id: `chr${getChromName(chrom_id + 1)}`,
                                position: data[sc][s][si].x,
                                value: data[sc][s][si].y,
                            });
                        }
                    }

                    circos
                        .line(`copynumber${chrom_id + 1}${sc}`, copynumber, {
                            outerRadius: 0.975,
                            innerRadius: 0.5,
                            direction: 'in',
                            maxGap: 1000000,
                            min: 0,
                            max: 4,
                            showAxesTooltip: false,
                            axes: [
                                {
                                    color: 'blue',
                                    opacity: 0.3,
                                    position: 0.000001,
                                },
                                {
                                    color: 'yellow',
                                    opacity: 0.75,
                                    position: 1,
                                },
                                {
                                    color: 'red',
                                    opacity: 0.3,
                                    position: 2,
                                },
                            ],
                            color: closureCopyNumberStateColor(sc),
                            tooltipContent: null,
                        });
                }

                // for the garbage collector
                data = null;

                // for the garbage collector
                dataC = null;
                dataCNVState = null;
            }
        }
    }

    circos.render();

    // unwrap the svg from the div container
    $('#groupMainContainerContents').find('svg').unwrap();
}; // drawCircos

GenomePlot.criteriaArcFactor = function ()
{
    let selector;
    const options = {};

    GenomePlot.criteria = [];

    if (GenomePlot.graphTypeParams.graphType === 'U-Shape')
    {
        (function ()
        {
            selector = 'g.alterations > path';
            // options.debugContainer = d3.select("#groupMainContainerContents");

            $('#error_panel .message').empty();
            $('#error_panel .message').append('Computing Arc Factor criteria. Please wait...');
            toggleElementVisibilitySlow($('#error_panel'));

            const arcFactors = d3.range(0, 3, 0.01); // .concat( d3.range( 2, 11, 0.5 ) );

            let af_i = -1;

            function criteriaArcFactors()
            {
                // update the GUI with values from the data
                GenomePlot.gui.junctionsParams.arcCurvature.setValue(arcFactors[af_i]);

                const af_c = pathIntersections(selector, options);
                af_c.arcFactor = arcFactors[af_i];
                GenomePlot.criteria.push(af_c);
            }

            function analyzeArcFactors()
            {
                // http://smallbusiness.chron.com/normalize-excel-36009.html
                // https://support.office.com/en-us/article/STANDARDIZE-function-81d66554-2d54-40ec-ba83-6437108ee775
                // https://support.office.com/en-us/article/STDEV-S-function-7d69cf97-0c1f-4acf-be27-f3e83904cc23

                const numXingsMean = d3.mean(GenomePlot.criteria, d => d.xings);
                const numXingsStdD = d3.deviation(GenomePlot.criteria, d => d.xings);

                const avgMinXingAngleMean = d3.mean(GenomePlot.criteria, d => d.avgMinXingAngle);
                const avgMinXingAngleStdD = d3.deviation(GenomePlot.criteria, d => d.avgMinXingAngle);

                /* eslint-disable no-param-reassign */
                GenomePlot.criteria.forEach((af_c) =>
                {
                    af_c.numXingsStdZ = (af_c.xings - numXingsMean) / numXingsStdD;
                    af_c.avgMinXingAngleStdZ = (af_c.avgMinXingAngle - avgMinXingAngleMean) / avgMinXingAngleStdD;

                    // linear combination; maximize avgMinXingAngle and minimize numXings
                    af_c.score = +af_c.avgMinXingAngleStdZ + -af_c.numXingsStdZ;
                });
                /* eslint-enable no-param-reassign */

                console.table(GenomePlot.criteria);

                // const scoreMax = d3.max(GenomePlot.criteria, d => d.score);
                const scoreIdx = scan(GenomePlot.criteria, (a, b) => b.score - a.score);

                console.log(
                    'at index', scoreIdx, 'score', GenomePlot.criteria[scoreIdx].score,
                    'Best Arc factor', GenomePlot.criteria[scoreIdx].arcFactor,
                );
                console.log(
                    'Number of Edge Xings', GenomePlot.criteria[scoreIdx].xings,
                    'Average Minimum Xing Angle', GenomePlot.criteria[scoreIdx].avgMinXingAngle,
                );

                // update the GUI with values from the data
                GenomePlot.gui.junctionsParams.arcCurvature.setValue(GenomePlot.criteria[scoreIdx].arcFactor, true);

                toggleElementVisibilitySlow($('#error_panel'));

                saveJSONtoCSV(GenomePlot.criteria, `genomeplotCriteria_${GenomePlot.sampleId
                }_size_w${GenomePlot.innerWidth}_h${GenomePlot.innerHeight}.csv`);
            }

            function viewArcFactors()
            {
                af_i += 1;

                if (af_i < arcFactors.length)
                {
                    setTimeout(() =>
                    {
                        criteriaArcFactors();
                        viewArcFactors();
                    }, 100);
                }
                else
                {
                    analyzeArcFactors();
                }
            }

            if (GenomePlot.criteriaArcFactorsAnimate)
            {
                viewArcFactors();
            }
            else
            {
                for (af_i = 0; af_i < arcFactors.length; af_i += 1)
                {
                    criteriaArcFactors(af_i);
                }
                analyzeArcFactors();
            }
        }());
    }
    else if (GenomePlot.graphTypeParams.graphType === 'Circos')
    {
        selector = 'path.chord';
        options.circos = true;
        // options.debugContainer = d3.select("g.alterations");

        const c_c = pathIntersections(selector, options);
        GenomePlot.criteria.push(c_c);

        console.table(GenomePlot.criteria);

        saveJSONtoCSV(GenomePlot.criteria, `circosplotCriteria_${GenomePlot.sampleId}_size_r${GenomePlot.graphTypeCircos.outerRadius}.csv`);
    }
}; // criteriaArcFactor

//
/* CALLBACKS */
//

GenomePlot.onKeyDown = function (event)
{
// event.preventDefault(); // this interferes with text input in fields

    // don't catch keyboard shortcuts when focused on text input
    if ($(':focus').is('input[type=text]')) { return; }

    switch (event.keyCode)
    {
    case 72: /* h */
        // dat.gui workaround to fix a bug which allows the user to interact with the gui
        // although it is hidden (opacity: 0, z-index: -999)
        if (GenomePlot.gui.domElement.style.opacity === '0')
        {
            GenomePlot.gui.domElement.parentElement.style.display = 'none';
            GenomePlot.gui.adjustWidth = 0;
        }
        else
        {
            GenomePlot.gui.domElement.parentElement.style.display = null;

            // if the gui displays "Open Controls" it means that it is closed
            if ($('.dg.main .close-button').html() === 'Close Controls') { GenomePlot.gui.adjustWidth = 265; }
        }

        GenomePlot.debounced_draw();

        break;

    default:

        break;
    }
}; // onKeyDown

//
/* WINDOW SIZES SECTION */
//

GenomePlot.computeGraphSize = function ()
{
    GenomePlot.viewportWidth = viewportSize.getWidth() -
    parseFloat($('#container').css('margin-left').replace('px', '')) -
    parseFloat($('#container').css('margin-right').replace('px', ''));
    GenomePlot.viewportHeight = viewportSize.getHeight();

    if (GenomePlot.viewportWidth <= 640 ||
    GenomePlot.viewportHeight <= 480)
    {
        hideElementDisplay($(GenomePlot.gui.domElement));
    }
    else
    {
        GenomePlot.viewportWidth -= GenomePlot.gui.adjustWidth;
    }

    GenomePlot.viewportUnitWidth = GenomePlot.viewportWidth / 100;
    GenomePlot.viewportUnitHeight = GenomePlot.viewportHeight / 100;

    // assign the dimensions here, works the best
    GenomePlot.outerWidth = Math.ceil(100 * GenomePlot.viewportUnitWidth);
    GenomePlot.outerHeight = Math.ceil(90 * GenomePlot.viewportUnitHeight);

    // distance of the outerRect from the innerRect in viewport units
    GenomePlot.margin = {
        top: Math.max(25, Math.ceil(3.50 * GenomePlot.viewportUnitHeight)),
        right: Math.max(25, Math.ceil(2.75 * GenomePlot.viewportUnitWidth)),
        bottom: Math.max(25, Math.ceil(3.50 * GenomePlot.viewportUnitHeight)),
        left: Math.max(25, Math.ceil(2.75 * GenomePlot.viewportUnitWidth)),
    };

    if (GenomePlot.graphTypeParams.graphType === 'U-Shape'
    && GenomePlot.miscParams.showAdditionalAxis)
    {
        GenomePlot.margin.bottom = Math.max(25, Math.ceil(14.00 * GenomePlot.viewportUnitHeight));
    }

    GenomePlot.innerWidth = Math.ceil(GenomePlot.outerWidth - GenomePlot.margin.left - GenomePlot.margin.right);
    GenomePlot.innerHeight = Math.ceil(GenomePlot.outerHeight - GenomePlot.margin.top - GenomePlot.margin.bottom);

    if (GenomePlot.graphTypeParams.graphType === 'Circos') { GenomePlot.graphTypeCircos = {}; }

    // distance of the actual data from the innerRect in viewport units
    GenomePlot.padding = {
        top: Math.ceil(2.25 * GenomePlot.viewportUnitHeight),
        right: Math.ceil(0.75 * GenomePlot.viewportUnitWidth),
        bottom: Math.ceil(0.75 * GenomePlot.viewportUnitHeight),
        left: Math.ceil(0.75 * GenomePlot.viewportUnitWidth),
    };

    if (GenomePlot.graphTypeParams.graphType === 'Circos')
    {
        GenomePlot.graphTypeCircos.width = GenomePlot.innerHeight;
        GenomePlot.graphTypeCircos.padding = 40;
    }

    // /////////////////////////////////////////////////////////////////////////////

    $('#backgroundContainer').css({
        top: GenomePlot.margin.top,
        left: GenomePlot.margin.left,
        width: GenomePlot.innerWidth,
        height: GenomePlot.innerHeight,
    });

    $('#container').css({ width: GenomePlot.outerWidth, height: GenomePlot.outerHeight });
}; // computeGraphSize

//
/* DOCUMENT READY */
//

$(document).ready(() =>
{
    // from: http://stackoverflow.com/questions/7505623/colors-in-javascript-console
    console.info(
        '%cWhole Genome Visualization',
        'font:normal 60pt Arial;' +
        'color:#FFFFFF;' +
        'text-shadow: 0 1px 0 #ccc,' +
        '0 2px 0 #c9c9c9,' +
        '0 3px 0 #bbb,' +
        '0 4px 0 #b9b9b9,' +
        '0 5px 0 #aaa,' +
        '0 6px 1px rgba(0,0,0,.1),' +
        '0 0 5px rgba(0,0,0,.1),' +
        '0 1px 3px rgba(0,0,0,.3),' +
        '0 3px 5px rgba(0,0,0,.2),' +
        '0 5px 10px rgba(0,0,0,.25),' +
        '0 10px 10px rgba(0,0,0,.2),' +
        '0 20px 20px rgba(0,0,0,.15);',
    );

    // so that button presses on the panels do not propagate to the canvas
    $('#error_panel').mousedown((event) =>
    {
        event.preventDefault();
        event.stopPropagation();
    });
    $('#info_panel').mousedown((event) =>
    {
        event.preventDefault();
        event.stopPropagation();
    });

    $('#error_panel .ok').mouseup(() =>
    {
        hideElementVisibilityFast($('#error_panel'));
        $('#error_panel .title').empty();
        $('#error_panel .title').append('Alert:');
    });

    // cytobands file
    GenomePlot.cytoBandFile = GenomePlot.referenceFiles.hg38.cytoBand;

    GenomePlot.BASE_ALL_MAX = 0;

    for (let chrom_id = 0; chrom_id < GenomePlot.NUM_CHROMS; chrom_id += 1)
    {
        if (chrom_id === 0) { GenomePlot.chromosomes[(chrom_id + 1).toString()].cumulativeGenomicSize = GenomePlot.chromosomes[(chrom_id + 1).toString()].genomicSize; }
        else
        {
            GenomePlot.chromosomes[(chrom_id + 1).toString()].cumulativeGenomicSize =
        GenomePlot.chromosomes[chrom_id.toString()].cumulativeGenomicSize + GenomePlot.chromosomes[(chrom_id + 1).toString()].genomicSize;
        }

        // compute total genomic size
        GenomePlot.BASE_ALL_MAX += GenomePlot.chromosomes[(chrom_id + 1).toString()].genomicSize;
    }

    GenomePlot.loadedResources = 0;

    GenomePlot.parseQueryString();

    GenomePlot.initGUI();

    GenomePlot.computeGraphSize();

    if (GenomePlot.graphTypeParams.graphType === 'U-Shape') { GenomePlot.junctionsParams.arcFactor = GenomePlot.MAX_CURVATURE; }

    GenomePlot.initData();

    document.title = `${GenomePlot.sampleId} Whole Genome Analysis`; // initData() must have been called already
    $('#pageTitle').html(`Integrated Whole Genome Analysis, ${GenomePlot.sampleGenome}`);

    GenomePlot.translate = [0, 0];
    GenomePlot.scale = 1;

    // also computes linesPerGraph and pixelsPerLine
    GenomePlot.computeChromosomeStartPositions();
    GenomePlot.computeChromosomeSizes();

    GenomePlot.initTransforms();

    GenomePlot.setupContainer();
    GenomePlot.drawBackground();

    GenomePlot.drawHorizontalDividers();
    GenomePlot.drawVerticalDividers();

    GenomePlot.drawableCytobands = setInterval(() =>
    {
    // call, once loading of data has completed
        if (GenomePlot.cytoBandData !== undefined)
        {
            clearInterval(GenomePlot.drawableCytobands);

            GenomePlot.drawCytobands();
        }
    }, 100);

    GenomePlot.drawableResources = setInterval(() =>
    {
    // call, once loading of data has completed
        if (GenomePlot.loadedResources === 0)
        {
            clearInterval(GenomePlot.drawableResources);

            toggleElementVisibilitySlow($('#loading_panel'));

            if (GenomePlot.copyNumberData !== undefined &&
                GenomePlot.copyNumberStateData !== undefined) { GenomePlot.drawSVGCopyNumber(); }

            GenomePlot.drawAlterations();

            if (GenomePlot.criteriaRunAtStartup)
            {
                setTimeout(() =>
                {
                    GenomePlot.criteriaArcFactor();
                }, 1000);
            }
        }
    }, 500);
}); // $(document).ready

//
/* BROWSER EVENTS */
//

// a better idiom for binding with window resize is to debounce
const debounce = function (fn, timeout)
{
    let timeoutID = -1;

    return function ()
    {
        if (timeoutID > -1) { window.clearTimeout(timeoutID); }

        timeoutID = window.setTimeout(fn, timeout);
    };
};

GenomePlot.debounced_draw = debounce(() =>
{
    showElementDisplay($(GenomePlot.gui.domElement));

    GenomePlot.computeGraphSize();

    // also computes linesPerGraph and pixelsPerLine
    GenomePlot.computeChromosomeStartPositions();
    GenomePlot.computeChromosomeSizes();

    GenomePlot.initTransforms();

    GenomePlot.setupContainer();
    GenomePlot.drawBackground();

    if (GenomePlot.graphTypeParams.graphType === 'Circos')
    {
        GenomePlot.drawCircos();
    }
    else
    {
        GenomePlot.drawHorizontalDividers();
        GenomePlot.drawVerticalDividers();

        GenomePlot.drawCytobands();

        if (GenomePlot.copyNumberData !== undefined &&
            GenomePlot.copyNumberStateData !== undefined) { GenomePlot.drawSVGCopyNumber(); }

        GenomePlot.drawAlterations();
    }
}, 250); // debounced_draw

// bind the window resize to the draw method.
$(window).resize((e) =>
{
    if (e.target === window) { GenomePlot.debounced_draw(); }
});

//
/* KEYBOARD EVENTS */
//

window.addEventListener('keydown', GenomePlot.onKeyDown, false);

//
/* BUTTON EVENTS */
//

// block right mouse menu pop up
window.oncontextmenu = function () { return false; };

export default GenomePlot;
