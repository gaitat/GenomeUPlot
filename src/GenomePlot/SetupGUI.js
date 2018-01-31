/**
 * @author gaitat / Athanasios Gaitatzes (Saki)
 */

import { saveSvgAsPng } from 'save-svg-as-png';
import dat from '../../vendor/dat-gui/dat.gui-0.5.1-plus.min';

import GenomePlot from './GenomePlot';
import { hideElementDisplay, showElementDisplay } from '../local_lib/domOperations';

import cssLocal from '!raw-loader!../../vendor/dat-gui/dat.gui.local.css'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/first
import cssLightTheme from '!raw-loader!../../vendor/dat-gui/dat.gui.light-theme.css'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/first

GenomePlot.initGUI = function ()
{
    GenomePlot.gui = new dat.GUI();
    // GenomePlot.gui.close();

    [cssLocal, cssLightTheme].forEach((css) =>
    {
        const injected = document.createElement('style');
        injected.type = 'text/css';
        injected.innerHTML = css;
        document.getElementsByTagName('head')[0].appendChild(injected);
    });

    GenomePlot.gui.adjustWidth = 265; // size of dat.GUI

    // /////////////////////////////////////////////////////////////////////////

    const graphTypeParams = {
        type: GenomePlot.graphTypeParams.graphType,
    };

    // GenomePlot.gui.gt = GenomePlot.gui.addFolder ("GRAPH TYPE");
    GenomePlot.gui.add(graphTypeParams, 'type', GenomePlot.graphTypeParams.graphTypes)
        .name('GRAPH TYPE')
        .onChange((value) =>
        {
            if (GenomePlot.graphTypeParams.graphType === value) return;
            GenomePlot.graphTypeParams.graphType = value;

            if (GenomePlot.graphTypeParams.graphType === 'U-Shape')
            {
                GenomePlot.gui.junctionsParams.arcFactor = GenomePlot.MAX_CURVATURE;
                GenomePlot.junctionsParams.arcFactor = GenomePlot.MAX_CURVATURE;

                // update the GUI with values from the data
                GenomePlot.gui.junctionsParams.arcCurvature.setValue(GenomePlot.junctionsParams.arcFactor, false); // eslint-disable-line max-len

                GenomePlot.debounced_draw();
            }
            else if (GenomePlot.graphTypeParams.graphType === 'Circos')
            {
                GenomePlot.debounced_draw();
            }

            // additional x-axis is only valid for the "U-Shape" GRAPH TYPE
            if (GenomePlot.graphTypeParams.graphType === 'U-Shape') { GenomePlot.gui.utilities.additionalXAxis.__li.setAttribute('style', 'display: list-item'); }
            else { GenomePlot.gui.utilities.additionalXAxis.__li.setAttribute('style', 'display: none'); }
        });


    // /////////////////////////////////////////////////////////////////////////

    GenomePlot.gui.jc = GenomePlot.gui.addFolder('JUNCTIONS');

    GenomePlot.gui.junctionsParams = {
        drawTypes: GenomePlot.junctionsParams.drawType, // line or arc
        arcFactor: GenomePlot.junctionsParams.arcFactor, // arc curvature factor
        thickness: GenomePlot.junctionsParams.thickness, // assoc. width with # of supporting reads
        associates: GenomePlot.junctionsParams.associates, // filter on # of reads supporting events
    };

    GenomePlot.gui.jc.add(GenomePlot.gui.junctionsParams, 'drawTypes', GenomePlot.junctionsParams.drawTypes)
        .name('Draw as').title('Enable or disable drawing of the Junctions')
        .onChange((value) =>
        {
            if (GenomePlot.junctionsParams.drawType === value) return;
            GenomePlot.junctionsParams.drawType = value;

            if (GenomePlot.junctionsParams.drawType === 'None')
            {
                // transition out the alterations
                d3.selectAll('.alterationsIndicator, .alterations, .alterationsIndicator_B, .alterations_B')
                    .transition()
                    .duration(500)
                    .style('opacity', 1e-6);

                // make them un-selectable
                d3.selectAll('.alterationsIndicator, .alterations, .alterationsIndicator_B, .alterations_B')
                    .transition()
                    .delay(500)
                    .duration(0)
                    .style({
                        visibility: 'hidden',
                        display: 'none',
                    });
            }
            else if (GenomePlot.junctionsParams.drawType === 'Arcs')
            {
                // make them selectable
                d3.selectAll('.alterationsIndicator, .alterations, .alterationsIndicator_B, .alterations_B')
                    .style({
                        visibility: 'visible',
                        display: 'inline',
                    });

                // transition in the alterations
                d3.selectAll('.alterationsIndicator, .alterations, .alterationsIndicator_B, .alterations_B')
                    .transition()
                    .duration(500)
                    .style('opacity', 1);

                // update the GUI with values from the data
                GenomePlot.gui.junctionsParams.arcCurvature.setValue(GenomePlot.junctionsParams.arcFactor); // eslint-disable-line max-len
            }
        });

    GenomePlot.gui.junctionsParams.arcCurvature = GenomePlot.gui.jc.add(GenomePlot.gui.junctionsParams, 'arcFactor', 0.1, GenomePlot.MAX_CURVATURE) // shorthand for min/max
        .steps([0.10, 0.17, 0.18, 0.19,
            0.20, 0.21, 0.22, 0.23, 0.24, 0.25, 0.26, 0.27, 0.28, 0.29,
            0.30, 0.31, 0.32, 0.33, 0.34, 0.35, 0.36, 0.37, 0.38, 0.39,
            0.40, 0.41, 0.42, 0.43, 0.44, 0.45, 0.46, 0.47, 0.48, 0.49,
            0.50, 0.51, 0.52, 0.53, 0.54, 0.55, 0.56, 0.57, 0.58, 0.59,
            0.60, 0.61, 0.62, 0.63, 0.64, 0.65, 0.66, 0.67, 0.68, 0.69,
            0.70, 0.71, 0.72, 0.73, 0.74, 0.75, 0.76, 0.77, 0.78, 0.79,
            0.80, 0.81, 0.82, 0.83, 0.84, 0.85, 0.86, 0.87, 0.88, 0.89,
            0.90, 0.91, 0.92, 0.93, 0.94, 0.95, 0.96, 0.97, 0.98, 0.99,
            1, 1.5, 2, 3, 4, 5, 10])
        .name('Arc factor').title('Curvature of the Arc')
        .onChange((value) =>
        {
            // when a callback has a .setValue from elsewhere in the code you should
            // not return even the input value is the same as the set value

            GenomePlot.junctionsParams.arcFactor = value;

            // if drawType is lines there is no reason to redraw
            if (GenomePlot.junctionsParams.drawType !== 'Arcs') return;

            GenomePlot.drawAlterations();
        });

    // /////////////////////////////////////////////////////////////////////////

    const ci = { calculateIntersections: GenomePlot.criteriaArcFactor };

    GenomePlot.gui.jc.criteria = GenomePlot.gui.jc.add(ci, 'calculateIntersections').name('Arc factor - Use best (through simulation)')
        .title('Find the best Arc Curvature factor to use');
    $(GenomePlot.gui.jc.criteria.domElement).siblings('span.property-name').css('width', '95%');

    // /////////////////////////////////////////////////////////////////////////

    GenomePlot.gui.jc.add(GenomePlot.gui.junctionsParams, 'thickness')
        .name('Line width to # Frags').title('Associate line thickness to number of Fragments supporting the Event')
        .onChange((value) =>
        {
            if (GenomePlot.junctionsParams.thickness === value) return;
            GenomePlot.junctionsParams.thickness = value;

            GenomePlot.drawAlterations();
        });

    GenomePlot.gui.junctionsParams.filterOnFrags = GenomePlot.gui.jc.add(GenomePlot.gui.junctionsParams, 'associates', 2, GenomePlot.junctionsParams.maxAssoc).step(1) // shorthand for min/max/step
        .steps([1, 2, 3, 4, 5, 10, 11, 12, 13, 14, 15, 20, 30, 40, 50, 100, 200, 300, 400, 500])
        .name('Filter on # of Frags')
        .title('Filter on number of Fragments supporting the Event')
        .onChange((value) =>
        {
            // when a callback has a .setValue from elsewhere in the code you should
            // not return even the input value is the same as the set value

            GenomePlot.junctionsParams.associates = value;

            GenomePlot.drawAlterations();
        });

    GenomePlot.gui.jc.open();

    // /////////////////////////////////////////////////////////////////////////

    GenomePlot.gui.cn = GenomePlot.gui.addFolder('COPY NUMBER');

    GenomePlot.gui.copyNumberParams = {
        drawType: GenomePlot.copyNumberParams.drawType,
    };

    GenomePlot.gui.cn.add(GenomePlot.gui.copyNumberParams, 'drawType', GenomePlot.copyNumberParams.drawTypes)
        .name('Draw as').title('Enable or disable drawing of the Copy Number')
        .onChange((value) =>
        {
            if (GenomePlot.copyNumberParams.drawType === value) return;
            GenomePlot.copyNumberParams.drawType = value;

            GenomePlot.drawSVGCopyNumber(true);
        });

    GenomePlot.gui.cn.open();

    GenomePlot.gui.open();

    // /////////////////////////////////////////////////////////////////////////

    GenomePlot.gui.cb = GenomePlot.gui.addFolder('CYTOBANDS');

    GenomePlot.gui.cytoBandsParams = {
        visible: GenomePlot.cytoBandsParams.visibility,
    };

    GenomePlot.gui.cb.add(GenomePlot.gui.cytoBandsParams, 'visible', 0, 100).step(5) // shorthand for min/max/step
        .name('Visibility').title('Change the Visibility')
        .onChange((value) =>
        {
            if (GenomePlot.cytoBandsParams.visibility === value) return;
            GenomePlot.cytoBandsParams.visibility = value;

            d3.selectAll('.cytobands')
                .style({
                    'fill-opacity': GenomePlot.cytoBandsParams.visibility / 100,
                    'stroke-opacity': GenomePlot.cytoBandsParams.visibility / 100,
                });
        });

    GenomePlot.gui.cb.open();

    // /////////////////////////////////////////////////////////////////////////

    GenomePlot.gui.ut = GenomePlot.gui.addFolder('UTILITIES');

    GenomePlot.gui.utilities = {
        horizDividers: GenomePlot.miscParams.showChromosomeHorizontalDividers,
        vertDividers: GenomePlot.miscParams.showChromosomeVerticalDividers,
        additionalAxis: GenomePlot.miscParams.showAdditionalAxis,
        tooltips: GenomePlot.miscParams.showTooltips,
        hoverline: GenomePlot.miscParams.showHoverline,
    };

    GenomePlot.gui.ut.add(GenomePlot.gui.utilities, 'horizDividers').name('Horizontal Dividers')
        .onChange((value) =>
        {
            if (GenomePlot.miscParams.showChromosomeHorizontalDividers === value) return;
            GenomePlot.miscParams.showChromosomeHorizontalDividers = value;

            if (GenomePlot.miscParams.showChromosomeHorizontalDividers)
            {
                // transition in the dividers
                d3.selectAll('.horizontaldividers line')
                    .transition()
                    .duration(500)
                    .style('stroke-opacity', 0.25);
            }
            else
            {
                // transition out the dividers
                d3.selectAll('.horizontaldividers line')
                    .transition()
                    .duration(500)
                    .style('stroke-opacity', 1e-6);
            }
        });

    GenomePlot.gui.ut.add(GenomePlot.gui.utilities, 'vertDividers').name('Vertical Dividers')
        .onChange((value) =>
        {
            if (GenomePlot.miscParams.showChromosomeVerticalDividers === value) return;
            GenomePlot.miscParams.showChromosomeVerticalDividers = value;

            if (GenomePlot.miscParams.showChromosomeVerticalDividers)
            {
                // transition in the dividers
                d3.selectAll('.verticaldividers line')
                    .transition()
                    .duration(500)
                    .style('stroke-opacity', 0.25);
            }
            else
            {
                // transition out the dividers
                d3.selectAll('.verticaldividers line')
                    .transition()
                    .duration(500)
                    .style('stroke-opacity', 1e-6);
            }
        });

    GenomePlot.gui.utilities.additionalXAxis = GenomePlot.gui.ut.add(GenomePlot.gui.utilities, 'additionalAxis')
        .name('Additional X-Axes').title('Enable or disable x-axes for the right side of the chromosomes which have been grouped in 4 categories')
        .onChange((value) =>
        {
            if (GenomePlot.miscParams.showAdditionalAxis === value) return;
            GenomePlot.miscParams.showAdditionalAxis = value;

            if (GenomePlot.graphTypeParams.graphType === 'U-Shape') { GenomePlot.debounced_draw(); }
        });

    if (GenomePlot.graphTypeParams.graphType !== 'U-Shape')
    {
    // __li is the root dom element of each controller
        GenomePlot.gui.utilities.additionalXAxis.__li.setAttribute('style', 'display: none');
    }

    GenomePlot.gui.ut.add(GenomePlot.gui.utilities, 'tooltips')
        .name('Tooltips').title('Enable or disable tooltips')
        .onChange((value) =>
        {
            GenomePlot.miscParams.showTooltips = value;

            if (GenomePlot.miscParams.showTooltips)
            {
                d3.selectAll('.cytobands').style('pointer-events', 'all'); // enable mouse events
            }
            else
            {
                d3.selectAll('.cytobands').style('pointer-events', 'none'); // disable mouse events
            }
        });

    GenomePlot.gui.ut.add(GenomePlot.gui.utilities, 'hoverline')
        .name('Hoverline').title('Enable or disable a hoverline')
        .onChange((value) =>
        {
            GenomePlot.miscParams.showHoverline = value;
        });

    GenomePlot.gui.ut.open();

    // /////////////////////////////////////////////////////////////////////////

    GenomePlot.gui.xp = GenomePlot.gui.addFolder('EXPORT');

    const png = {
        savePNG()
        {
            const svg = ($('#svgContainer')[0]).getElementsByTagName('svg')[0]; // the last [0] will pick the first svg in the page
            const name = `${GenomePlot.graphTypeParams.graphType === 'Circos' ? 'circos' : 'genomeU'}plot_${GenomePlot.sampleId}${GenomePlot.graphTypeParams.graphType === 'Circos' ?
                `_size_r${GenomePlot.graphTypeCircos.outerRadius}` :
                `_size_w${GenomePlot.innerWidth}_h${GenomePlot.innerHeight}`}.png`;

            saveSvgAsPng(svg, name);
        },
    };

    GenomePlot.gui.xp.add(png, 'savePNG').name("Image <span style='float: right;'>(PNG)</span>")
        .title('Export plot to png format');

    GenomePlot.gui.xp.open();

    // /////////////////////////////////////////////////////////////////////////

    const guiCloseButton = $('div.close-button');

    // hide the original Close Controls button
    hideElementDisplay(guiCloseButton);

    const cc = {
    // add a gui button which will take over the functionality
    // of the original Close Controls button
        closeControls()
        {
            GenomePlot.gui.close();
            showElementDisplay(guiCloseButton);

            // the gui now closes so we can increase the graph size
            GenomePlot.gui.adjustWidth = 0;
            GenomePlot.debounced_draw();
        },
    };
    const ccg = GenomePlot.gui.add(cc, 'closeControls').name('Close Controls');
    $(ccg.domElement).parent().parent().addClass('close-function');

    // the button is available to click only when the gui is closed
    guiCloseButton.on('click', function ()
    {
        hideElementDisplay($(this));

        // the gui now opens so we must decrease the graph size
        GenomePlot.gui.adjustWidth = 265;
        GenomePlot.debounced_draw();
    });
}; // initGUI
