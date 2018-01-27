/**
 * @author gaitat / Athanasios Gaitatzes (Saki)
 */

import dat from '../../vendor/dat-gui/dat.gui-0.5.1-plus.min';
import { saveSvgAsPng } from 'save-svg-as-png';

import GenomePlot from './GenomePlot';
import { hideElementDisplay, showElementDisplay } from '../local_lib/domOperations';

import cssLocal from '!raw-loader!../../vendor/dat-gui/dat.gui.local.css';
import cssLightTheme from '!raw-loader!../../vendor/dat-gui/dat.gui.light-theme.css';

"use strict";

GenomePlot.initGUI = function()
{
	GenomePlot.gui = new dat.GUI();
//	GenomePlot.gui.close();

  [cssLocal, cssLightTheme].forEach(function (css) {
    var injected = document.createElement('style');
    injected.type = 'text/css';
    injected.innerHTML = css;
    document.getElementsByTagName('head')[0].appendChild(injected);
  });

  GenomePlot.gui.adjustWidth = 265;	// size of dat.GUI

	///////////////////////////////////////////////////////////////////////////

	var graphTypeParams = {
		type:	GenomePlot.graphTypeParams.graphType,
	};

//	GenomePlot.gui.gt = GenomePlot.gui.addFolder ("GRAPH TYPE");
	GenomePlot.gui.add (graphTypeParams, "type", GenomePlot.graphTypeParams.graphTypes)
		.name("GRAPH TYPE")
		.onChange (function (value)
		{
			if( GenomePlot.graphTypeParams.graphType === value ) return;
			GenomePlot.graphTypeParams.graphType = value;

			if( GenomePlot.graphTypeParams.graphType === "U-Shape" )
			{
				GenomePlot.gui.junctionsParams.arcFactor =
					GenomePlot.junctionsParams.arcFactor = GenomePlot.MAX_CURVATURE;

				// update the GUI with values from the data
				GenomePlot.gui.junctionsParams.arcCurvature.setValue( GenomePlot.junctionsParams.arcFactor, false );

				GenomePlot.debounced_draw();
			}
			else if( GenomePlot.graphTypeParams.graphType === "Circos" )
			{
				GenomePlot.debounced_draw();
			}

			// additional x-axis is only valid for the "U-Shape" GRAPH TYPE
			if( GenomePlot.graphTypeParams.graphType === "U-Shape" )
				GenomePlot.gui.utilities.additionalXAxis.__li.setAttribute( "style", "display: list-item" );
			else
				GenomePlot.gui.utilities.additionalXAxis.__li.setAttribute( "style", "display: none" );
		} );
	;

	///////////////////////////////////////////////////////////////////////////

	GenomePlot.gui.jc = GenomePlot.gui.addFolder ("JUNCTIONS");

	GenomePlot.gui.junctionsParams = {
		drawTypes:	GenomePlot.junctionsParams.drawType,		// line or arc
		arcFactor:	GenomePlot.junctionsParams.arcFactor,		// arc curvature factor
		thickness:	GenomePlot.junctionsParams.thickness,		// associate thickness with # reads supporting event
		associates:	GenomePlot.junctionsParams.associates,		// filter on # of reads supporting events
	};

	GenomePlot.gui.jc.add (GenomePlot.gui.junctionsParams, "drawTypes", GenomePlot.junctionsParams.drawTypes)
		.name("Draw as").title("Enable or disable drawing of the Junctions")
		.onChange (function (value)
		{
			if( GenomePlot.junctionsParams.drawType === value ) return;
			GenomePlot.junctionsParams.drawType = value;

			if( GenomePlot.junctionsParams.drawType === "None" )
			{
				// transition out the alterations
				d3.selectAll(".alterationsIndicator, .alterations, .alterationsIndicator_B, .alterations_B")
					.transition()
					.duration( 500 )
						.style( "opacity", 1e-6 );

				// make them un-selectable
				d3.selectAll(".alterationsIndicator, .alterations, .alterationsIndicator_B, .alterations_B")
					.transition()
					.delay( 500 )
					.duration( 0 )
						.style( {
							"visibility": "hidden",
							"display": "none",
						} );
			}
			else if( GenomePlot.junctionsParams.drawType === "Arcs" )
			{
				// make them selectable
				d3.selectAll(".alterationsIndicator, .alterations, .alterationsIndicator_B, .alterations_B")
					.style( {
						"visibility": "visible",
						"display": "inline",
					} );

				// transition in the alterations
				d3.selectAll(".alterationsIndicator, .alterations, .alterationsIndicator_B, .alterations_B")
					.transition()
					.duration( 500 )
						.style( "opacity", 1 );

				// update the GUI with values from the data
				GenomePlot.gui.junctionsParams.arcCurvature.setValue( GenomePlot.junctionsParams.arcFactor );
			}
		});

	GenomePlot.gui.junctionsParams.arcCurvature = GenomePlot.gui.jc.add (GenomePlot.gui.junctionsParams, "arcFactor", 0.1, GenomePlot.MAX_CURVATURE)		// shorthand for min/max
		.steps([.10, .17, .18, .19,
				.20, .21, .22, .23, .24, .25, .26, .27, .28, .29,
				.30, .31, .32, .33, .34, .35, .36, .37, .38, .39,
				.40, .41, .42, .43, .44, .45, .46, .47, .48, .49,
				.50, .51, .52, .53, .54, .55, .56, .57, .58, .59,
				.60, .61, .62, .63, .64, .65, .66, .67, .68, .69,
				.70, .71, .72, .73, .74, .75, .76, .77, .78, .79,
				.80, .81, .82, .83, .84, .85, .86, .87, .88, .89,
				.90, .91, .92, .93, .94, .95, .96, .97, .98, .99,
				1, 1.5, 2, 3, 4, 5, 10])
		.name("Arc factor").title("Curvature of the Arc")
		.onChange (function (value)
		{
			// when a callback has a .setValue from elsewhere in the code you should
			// not return even the input value is the same as the set value

			GenomePlot.junctionsParams.arcFactor = value;

			// if drawType is lines there is no reason to redraw
			if( GenomePlot.junctionsParams.drawType !== "Arcs" ) return;

			GenomePlot.drawAlterations();
		});

	///////////////////////////////////////////////////////////////////////////

	var ci = { calculateIntersections: GenomePlot.criteriaArcFactor };

	GenomePlot.gui.jc.criteria = GenomePlot.gui.jc.add (ci, "calculateIntersections").name("Arc factor - Use best (through simulation)")
		.title("Find the best Arc Curvature factor to use");
	$(GenomePlot.gui.jc.criteria.domElement).siblings("span.property-name").css("width", "95%");

	///////////////////////////////////////////////////////////////////////////

	GenomePlot.gui.jc.add (GenomePlot.gui.junctionsParams, "thickness")
		.name("Line width to # Frags").title("Associate line thickness to number of Fragments supporting the Event")
		.onChange (function (value)
		{
			if( GenomePlot.junctionsParams.thickness === value ) return;
			GenomePlot.junctionsParams.thickness = value;

			GenomePlot.drawAlterations();
		});

	GenomePlot.gui.junctionsParams.filterOnFrags = GenomePlot.gui.jc.add (GenomePlot.gui.junctionsParams, "associates", 2, GenomePlot.junctionsParams.maxAssoc).step(1)		// shorthand for min/max/step
		.steps( [ 1, 2, 3, 4, 5, 10, 11, 12, 13, 14, 15, 20, 30, 40, 50, 100, 200, 300, 400, 500 ] )
		.name("Filter on # of Frags").title("Filter on number of Fragments supporting the Event")
		.onChange (function (value)
		{
			// when a callback has a .setValue from elsewhere in the code you should
			// not return even the input value is the same as the set value

			GenomePlot.junctionsParams.associates = value;

			GenomePlot.drawAlterations();
		});

	GenomePlot.gui.jc.open();

	///////////////////////////////////////////////////////////////////////////

	GenomePlot.gui.cn = GenomePlot.gui.addFolder ("COPY NUMBER");

	GenomePlot.gui.copyNumberParams = {
		drawType:		GenomePlot.copyNumberParams.drawType,
	};

	GenomePlot.gui.cn.add (GenomePlot.gui.copyNumberParams, "drawType", GenomePlot.copyNumberParams.drawTypes)
		.name("Draw as").title("Enable or disable drawing of the Copy Number")
		.onChange (function (value)
		{
			if( GenomePlot.copyNumberParams.drawType === value ) return;
			GenomePlot.copyNumberParams.drawType = value;

			GenomePlot.drawSVGCopyNumber( true );
		});

	GenomePlot.gui.cn.open();

	GenomePlot.gui.open();

	///////////////////////////////////////////////////////////////////////////

	GenomePlot.gui.cb = GenomePlot.gui.addFolder ("CYTOBANDS");

	GenomePlot.gui.cytoBandsParams = {
		visible:	GenomePlot.cytoBandsParams.visibility,
	};

	GenomePlot.gui.cb.add (GenomePlot.gui.cytoBandsParams, "visible", 0, 100).step(5)		// shorthand for min/max/step
		.name("Visibility").title("Change the Visibility")
		.onChange (function (value)
		{
			if( GenomePlot.cytoBandsParams.visibility === value ) return;
			GenomePlot.cytoBandsParams.visibility = value;

			d3.selectAll(".cytobands")
				.style( {
					"fill-opacity": GenomePlot.cytoBandsParams.visibility / 100,
					"stroke-opacity": GenomePlot.cytoBandsParams.visibility / 100,
			} );
		});

	GenomePlot.gui.cb.open();

	///////////////////////////////////////////////////////////////////////////

	GenomePlot.gui.ut = GenomePlot.gui.addFolder ("UTILITIES");

	GenomePlot.gui.utilities = {
		horizDividers:	GenomePlot.miscParams.showChromosomeHorizontalDividers,
		vertDividers:	GenomePlot.miscParams.showChromosomeVerticalDividers,
		additionalAxis:	GenomePlot.miscParams.showAdditionalAxis,
		tooltips:		GenomePlot.miscParams.showTooltips,
		hoverline:		GenomePlot.miscParams.showHoverline,
	};

	GenomePlot.gui.ut.add (GenomePlot.gui.utilities, "horizDividers").name("Horizontal Dividers")
		.onChange (function (value)
		{
			if( GenomePlot.miscParams.showChromosomeHorizontalDividers === value ) return;
			GenomePlot.miscParams.showChromosomeHorizontalDividers = value;

			if( GenomePlot.miscParams.showChromosomeHorizontalDividers )
			{
				// transition in the dividers
				d3.selectAll(".horizontaldividers line")
					.transition()
						.duration( 500 )
						.style( "stroke-opacity", 0.25 );
			}
			else
			{
				// transition out the dividers
				d3.selectAll(".horizontaldividers line")
					.transition()
						.duration( 500 )
						.style( "stroke-opacity", 1e-6 );
			}
		});

	GenomePlot.gui.ut.add (GenomePlot.gui.utilities, "vertDividers").name("Vertical Dividers")
		.onChange (function (value)
		{
			if( GenomePlot.miscParams.showChromosomeVerticalDividers === value ) return;
			GenomePlot.miscParams.showChromosomeVerticalDividers = value;

			if( GenomePlot.miscParams.showChromosomeVerticalDividers )
			{
				// transition in the dividers
				d3.selectAll(".verticaldividers line")
					.transition()
						.duration( 500 )
						.style( "stroke-opacity", 0.25 );
			}
			else
			{
				// transition out the dividers
				d3.selectAll(".verticaldividers line")
					.transition()
						.duration( 500 )
						.style( "stroke-opacity", 1e-6 );
			}
		});

	GenomePlot.gui.utilities.additionalXAxis = GenomePlot.gui.ut.add (GenomePlot.gui.utilities, "additionalAxis")
		.name("Additional X-Axes").title("Enable or disable x-axes for the right side of the chromosomes which have been grouped in 4 categories")
		.onChange (function (value)
		{
			if( GenomePlot.miscParams.showAdditionalAxis === value ) return;
			GenomePlot.miscParams.showAdditionalAxis = value;

			if( GenomePlot.graphTypeParams.graphType === "U-Shape" )
				GenomePlot.debounced_draw();
		});

	if( GenomePlot.graphTypeParams.graphType !== "U-Shape" )
	{
		// __li is the root dom element of each controller
		GenomePlot.gui.utilities.additionalXAxis.__li.setAttribute( "style", "display: none" );
	}

	GenomePlot.gui.ut.add (GenomePlot.gui.utilities, "tooltips")
		.name("Tooltips").title("Enable or disable tooltips")
		.onChange (function (value)
		{
			GenomePlot.miscParams.showTooltips = ! GenomePlot.miscParams.showTooltips;

			if( GenomePlot.miscParams.showTooltips )
				d3.selectAll( ".cytobands" ).style( "pointer-events", "all" );	// enable mouse events
			else
				d3.selectAll( ".cytobands" ).style( "pointer-events", "none" );	// disable mouse events
		} );

	GenomePlot.gui.ut.add (GenomePlot.gui.utilities, "hoverline")
		.name("Hoverline").title("Enable or disable a hoverline")
		.onChange (function (value)
		{
			GenomePlot.miscParams.showHoverline = ! GenomePlot.miscParams.showHoverline;
		} );

	GenomePlot.gui.ut.open();

	///////////////////////////////////////////////////////////////////////////

	GenomePlot.gui.xp = GenomePlot.gui.addFolder ("EXPORT");

	var png = { savePNG:
		function()
		{
			var svg = ($("#svgContainer")[0]).getElementsByTagName("svg")[0];	// the last [0] will pick the first svg in the page
			var name = ( GenomePlot.graphTypeParams.graphType === "Circos" ? "circos" : "genomeU" ) + "plot_" + GenomePlot.sampleId +
				( GenomePlot.graphTypeParams.graphType === "Circos" ?
					"_size_r" + GenomePlot.graphTypeCircos.outerRadius :
					"_size_w" + GenomePlot.innerWidth + '_h' + GenomePlot.innerHeight ) + ".png";

      saveSvgAsPng(svg,name);
		}
	};

	GenomePlot.gui.xp.add (png, "savePNG").name("Image <span style='float: right;'>(PNG)</span>")
		.title("Export plot to png format");

	GenomePlot.gui.xp.open();

	///////////////////////////////////////////////////////////////////////////

	// hide the original Close Controls button
	hideElementDisplay($('div.close-button'));

	var cc = {
		// add a gui button which will take over the functionality
		// of the original Close Controls button
		closeControls: function () {
			GenomePlot.gui.close();
			showElementDisplay ( $('div.close-button') );

			// the gui now closes so we can increase the graph size
			GenomePlot.gui.adjustWidth = 0;
			GenomePlot.debounced_draw();
		}
	};
	var ccg = GenomePlot.gui.add(cc, "closeControls").name("Close Controls");
	$(ccg.domElement).parent().parent().addClass("close-function");

	// the button is available to click only when the gui is closed
	$('div.close-button').on('click', function () {
		hideElementDisplay( $(this) );

		// the gui now opens so we must decrease the graph size
		GenomePlot.gui.adjustWidth = 265;
		GenomePlot.debounced_draw();
	});

}	// initGUI
