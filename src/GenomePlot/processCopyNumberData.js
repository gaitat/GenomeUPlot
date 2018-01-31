/**
 * @author gaitat / Athanasios Gaitatzes (Saki)
 */
/* eslint-disable max-len, camelcase */

import sprintf from 'locutus/php/strings/sprintf';

import GenomePlot from './GenomePlot';
import { assert } from '../local_lib/utils';

GenomePlot.cnvBinnedToLegacy = function (dataV, normalValues)
{
    let toSort = [];
    let median;

    const dataValues = dataV;

    // normalValues[normalValues==-1] <- ...
    for (let i = 0; i < normalValues.length; i += 1)
    {
        if (!normalValues[i] > 0)
        {
            dataValues[i] = 0;
        }
        else
        {
            dataValues[i] /= normalValues[i];
        }

        if (normalValues[i] !== -1)
        {
            toSort.push(dataValues[i]);
        }
    }

    // get the median of ratios of dataValues
    toSort.sort((a, b) => a - b);

    const half = Math.floor(toSort.length / 2);

    if (toSort.length % 2) { median = toSort[half]; }
    else { median = (toSort[half - 1] + toSort[half]) / 2.0; }

    // for the garbage collector
    toSort = null;

    const wdns = [];
    const frq = [];
    let idx = 0;

    for (let i = 0; i < dataValues.length; i += 1)
    {
        dataValues[i] /= median;

        if (normalValues[i] !== -1)
        {
            wdns[idx] = i;
            frq[idx] = dataValues[i];
            idx += 1;
        }
    }

    return {
        wdns, // x-axis
        frq, // y-axis
        median,
    };
}; // cnvBinnedToLegacy

GenomePlot.processCopyNumber30000Data = function (data)
{
    if (data === null) return null;

    GenomePlot.copyNumberData = data;
    GenomePlot.copyNumber30000Data = GenomePlot.copyNumberData;

    if (GenomePlot.copyNumber30000Data === undefined ||
    GenomePlot.copyNumber30000Data.cnv === undefined ||
    GenomePlot.copyNumber30000Data.normalCnv === undefined)
    {
        return null;
    }

    assert(GenomePlot.copyNumber30000Data.cnv.length === GenomePlot.copyNumber30000Data.normalCnv.length, 'processCopyNumber30000Data(): The CNV data files to be plotted have different length!');

    // go back to legacy
    GenomePlot.copyNumber30000Data.toLegacy = GenomePlot.cnvBinnedToLegacy(GenomePlot.copyNumber30000Data.cnv, GenomePlot.copyNumber30000Data.normalCnv);

    // verify size of resulting arrays
    if (GenomePlot.copyNumber30000Data.toLegacy === undefined ||
    GenomePlot.copyNumber30000Data.toLegacy.frq === undefined ||
    GenomePlot.copyNumber30000Data.toLegacy.wdns === undefined)
    {
        return null;
    }

    assert(GenomePlot.copyNumber30000Data.toLegacy.frq.length === GenomePlot.copyNumber30000Data.toLegacy.wdns.length);

    // split data to be per chromosome

    // allocate space
    GenomePlot.copyNumber30000Data.toLegacy.wdnsPerChrom = new Array(GenomePlot.NUM_CHROMS);
    GenomePlot.copyNumber30000Data.toLegacy.frqPerChrom = new Array(GenomePlot.NUM_CHROMS);
    let frqGreaterTwoPerChrom = new Array(GenomePlot.NUM_CHROMS);
    let maskedIndicesArray;
    let maskedIndicesRanges;
    GenomePlot.copyNumber30000Data.toLegacy.wdnsMaskedPerChrom = new Array(GenomePlot.NUM_CHROMS);

    let chrom_id = 0;
    GenomePlot.copyNumber30000Data.toLegacy.wdnsPerChrom[chrom_id] = [];
    GenomePlot.copyNumber30000Data.toLegacy.frqPerChrom[chrom_id] = [];

    // we are assuming wdns values are sorted per chromosome and we need to extract them
    for (let i = 0; i < GenomePlot.copyNumber30000Data.toLegacy.frq.length; i += 1)
    {
    // if the value is not between the Starts/Ends values of the input data we are at the next chromosome
        const value = GenomePlot.copyNumber30000Data.toLegacy.wdns[i];

        if (value >= (GenomePlot.copyNumber30000Data.chromosomeStarts[(chrom_id + 1).toString()] - 1)
      && value <= (GenomePlot.copyNumber30000Data.chromosomeEnds[(chrom_id + 1).toString()] - 1))
        {
            GenomePlot.copyNumber30000Data.toLegacy.wdnsPerChrom[chrom_id].push(value);
            GenomePlot.copyNumber30000Data.toLegacy.frqPerChrom[chrom_id].push(GenomePlot.copyNumber30000Data.toLegacy.frq[i]);
        }
        else
        {
            chrom_id += 1;

            GenomePlot.copyNumber30000Data.toLegacy.wdnsPerChrom[chrom_id] = [];
            GenomePlot.copyNumber30000Data.toLegacy.frqPerChrom[chrom_id] = [];

            // push the current value at the next chromosome
            GenomePlot.copyNumber30000Data.toLegacy.wdnsPerChrom[chrom_id].push(value);
            GenomePlot.copyNumber30000Data.toLegacy.frqPerChrom[chrom_id].push(GenomePlot.copyNumber30000Data.toLegacy.frq[i]);
        }
    }

    let frqCnt = 0;

    for (chrom_id = 0; chrom_id < GenomePlot.NUM_CHROMS; chrom_id += 1)
    {
    // verify size of resulting arrays
        if (GenomePlot.copyNumber30000Data.toLegacy.wdnsPerChrom[chrom_id] === undefined ||
      GenomePlot.copyNumber30000Data.toLegacy.frqPerChrom[chrom_id] === undefined)
        {
            continue; // eslint-disable-line no-continue
        }

        assert(GenomePlot.copyNumber30000Data.toLegacy.wdnsPerChrom[chrom_id].length === GenomePlot.copyNumber30000Data.toLegacy.frqPerChrom[chrom_id].length, 'processCopyNumber30000Data(): wdns & frq array lengths do not match!');
        assert(GenomePlot.copyNumber30000Data.toLegacy.frqPerChrom[chrom_id].length <= ((GenomePlot.copyNumber30000Data.chromosomeEnds[(chrom_id + 1).toString()] - GenomePlot.copyNumber30000Data.chromosomeStarts[(chrom_id + 1).toString()]) + 1));

        // store the min/max of the arrays
        // GenomePlot.copyNumber30000Data.toLegacy.frqPerChrom[ chrom_id ].miinFrq = GenomePlot.copyNumber30000Data.toLegacy.frqPerChrom[ chrom_id ].min();
        // GenomePlot.copyNumber30000Data.toLegacy.frqPerChrom[ chrom_id ].maaxFrq = GenomePlot.copyNumber30000Data.toLegacy.frqPerChrom[ chrom_id ].max();
        // console.log( "Chromosome", (chrom_id+1), "minFrq:", GenomePlot.copyNumber30000Data.toLegacy.frqPerChrom[ chrom_id ].miinFrq, "and maxFrq:", GenomePlot.copyNumber30000Data.toLegacy.frqPerChrom[ chrom_id ].maaxFrq );

        // find all frequencies greater than 2 and their indexes into the array
        frqGreaterTwoPerChrom[chrom_id] = [];

        // find the min/max of the arrays
        GenomePlot.copyNumber30000Data.toLegacy.frqPerChrom[chrom_id].minFrq = 10;
        GenomePlot.copyNumber30000Data.toLegacy.frqPerChrom[chrom_id].maxFrq = -10;

        for (let k = 0; k < GenomePlot.copyNumber30000Data.toLegacy.frqPerChrom[chrom_id].length; k += 1)
        {
            const frq = GenomePlot.copyNumber30000Data.toLegacy.frqPerChrom[chrom_id][k];

            if (frq > 2)
            {
                frqGreaterTwoPerChrom[chrom_id][k] = frq; // k is the index of that frequency in the original array
            }

            if (frq > GenomePlot.copyNumber30000Data.toLegacy.frqPerChrom[chrom_id].maxFrq)
            {
                GenomePlot.copyNumber30000Data.toLegacy.frqPerChrom[chrom_id].maxFrq = frq; // get the maximum frequency
            }
            else if (frq < GenomePlot.copyNumber30000Data.toLegacy.frqPerChrom[chrom_id].minFrq)
            {
                GenomePlot.copyNumber30000Data.toLegacy.frqPerChrom[chrom_id].minFrq = frq; // get the minimum frequency
            }
        }

        frqCnt += GenomePlot.copyNumber30000Data.toLegacy.wdnsPerChrom[chrom_id].length;

        // the data of the chromosomes are positioned one after the other
        // subtract the chromosome ends to make them 0-based
        const chromosomeStarts = GenomePlot.copyNumber30000Data.chromosomeStarts[(chrom_id + 1).toString()] - 1;
        const chromosomeEnds = GenomePlot.copyNumber30000Data.chromosomeEnds[(chrom_id + 1).toString()] - 1;

        // bring the dataX to its original form
        for (let j = 0; j < GenomePlot.copyNumber30000Data.toLegacy.wdnsPerChrom[chrom_id].length; j += 1)
        {
            GenomePlot.copyNumber30000Data.toLegacy.wdnsPerChrom[chrom_id][j] -= chromosomeStarts; // bring data to 0
            GenomePlot.copyNumber30000Data.toLegacy.wdnsPerChrom[chrom_id][j] *= GenomePlot.copyNumber30000Data.windowSize;
        }

        // compute the copyNumber masked areas
        maskedIndicesArray = [];
        maskedIndicesRanges = [];

        for (let i = 0; i < GenomePlot.copyNumber30000Data.toLegacy.wdnsPerChrom[chrom_id].length - 1; i += 1)
        {
            if ((GenomePlot.copyNumber30000Data.toLegacy.wdnsPerChrom[chrom_id][i + 1] -
          GenomePlot.copyNumber30000Data.toLegacy.wdnsPerChrom[chrom_id][i]) !==
        GenomePlot.copyNumber30000Data.windowSize)
            {
                maskedIndicesArray.push(i, i + 1);
            }
        }

        // compute the indices that are masked; final array contains pairs of indices
        let i;
        let indexStart = 0;

        for (i = 0; i < maskedIndicesArray.length - 2; i += 2)
        {
            if (maskedIndicesArray[i + 2] !== maskedIndicesArray[i + 1])
            {
                maskedIndicesRanges.push(maskedIndicesArray[indexStart], maskedIndicesArray[i + 1]);
                indexStart = i + 2;
            }
        }

        // take care of the last two indices
        if (maskedIndicesArray[i] !== maskedIndicesArray[i - 1])
        {
            maskedIndicesRanges.push(maskedIndicesArray[i], maskedIndicesArray[i + 1]);
        }
        else
        {
            maskedIndicesRanges.push(maskedIndicesArray[indexStart], maskedIndicesArray[i + 1]);
        }

        GenomePlot.copyNumber30000Data.toLegacy.wdnsMaskedPerChrom[chrom_id] = [];

        // since we applied chromosomeStarts everything should be back to 0; if it is not then it is masked
        // add it directly to the array
        if (GenomePlot.copyNumber30000Data.toLegacy.wdnsPerChrom[chrom_id][0] !== 0)
        {
            GenomePlot.copyNumber30000Data.toLegacy.wdnsMaskedPerChrom[chrom_id]
                .push(0, GenomePlot.copyNumber30000Data.toLegacy.wdnsPerChrom[chrom_id][0]);
        }

        for (let j = 0; j < maskedIndicesRanges.length; j += 1)
        {
            GenomePlot.copyNumber30000Data.toLegacy.wdnsMaskedPerChrom[chrom_id]
                .push(GenomePlot.copyNumber30000Data.toLegacy.wdnsPerChrom[chrom_id][maskedIndicesRanges[j]]);
        }

        // do the same for the end of the chrom. if the last point does not match the expected value it is masked
        // add it directly to the array
        if (GenomePlot.copyNumber30000Data.toLegacy.wdnsPerChrom[chrom_id][GenomePlot.copyNumber30000Data.toLegacy.wdnsPerChrom[chrom_id].length - 1] !== (chromosomeEnds - chromosomeStarts) * GenomePlot.copyNumber30000Data.windowSize)
        {
            GenomePlot.copyNumber30000Data.toLegacy.wdnsMaskedPerChrom[chrom_id]
                .push(
                    GenomePlot.copyNumber30000Data.toLegacy.wdnsPerChrom[chrom_id][GenomePlot.copyNumber30000Data.toLegacy.wdnsPerChrom[chrom_id].length - 1],
                    GenomePlot.chromosomes[(chrom_id + 1).toString()].genomicSize,
                ); // instead of pushing (chromosomeEnds - chromosomeStarts) * GenomePlot.copyNumber30000Data.windowSize push the actual chrom end since we now we are at the end of the chromosome
        }
    }
    console.info(sprintf('%-20s     Total CNV elements to draw: %s', 'initData():', frqCnt.toLocaleString()));

    // for the garbage collector
    GenomePlot.copyNumber30000Data.cnv = null;
    GenomePlot.copyNumber30000Data.normalCnv = null;
    GenomePlot.copyNumber30000Data.toLegacy.wdns = null;
    GenomePlot.copyNumber30000Data.toLegacy.frq = null;

    frqGreaterTwoPerChrom = null;
    maskedIndicesArray = null;
    maskedIndicesRanges = null;

    return null;
}; // processCopyNumber30000Data
