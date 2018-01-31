/**
 * @author gaitat / Athanasios Gaitatzes (Saki)
 */

import GenomePlot from './GenomePlot';
import { comparator } from '../local_lib/utils-d3';

GenomePlot.processCopyNumberStateData = function (data)
{
    if (data === null) return null;

    const rData = data.replace(/^[#@][^\r\n]+[\r\n]+/mg, ''); // remove comments
    const dataParsed = d3.csv.parse(rData);

    const localData = dataParsed.map(d => ({
        chrA: +d.chr,
        chrB: +d.chr,
        posA: +d.start,
        posB: +d.end,
        size: +d.end - +d.start,
        state: +d.cnvState,
        NRD: (+d.nrd).toFixed(3),
    }));

    // from: https://github.com/interactivethings/d3-comparator
    // sort first by chrom_id and then by txStart (transcription start)
    // so that the genes come in genomic order in the plot
    const compare = comparator()
        .order(d3.ascending, d => d.chrA)
        .order(d3.ascending, d => d.posA)
        .order(d3.ascending, d => d.posB);
    localData.sort(compare);

    return localData;
}; // processCopyNumberStateData
