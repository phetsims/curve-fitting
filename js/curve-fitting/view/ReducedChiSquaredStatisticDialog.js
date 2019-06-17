// Copyright 2016-2019, University of Colorado Boulder

/**
 * Dialog that provides information about the reduced chi-squared statistic.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Saurabh Totey
 */
define( require => {
  'use strict';

  // modules
  const curveFitting = require( 'CURVE_FITTING/curveFitting' );
  const Dialog = require( 'SUN/Dialog' );
  const FormulaNode = require( 'SCENERY_PHET/FormulaNode' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const HStrut = require( 'SCENERY/nodes/HStrut' );
  const MathSymbolFont = require( 'SCENERY_PHET/MathSymbolFont' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const RichText = require( 'SCENERY/nodes/RichText' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  const numberOfDataPointsString = require( 'string!CURVE_FITTING/numberOfDataPoints' );
  const numberOfParameters1String = require( 'string!CURVE_FITTING/numberOfParameters1' );
  const numberOfParameters2String = require( 'string!CURVE_FITTING/numberOfParameters2' );
  const symbolChiString = require( 'string!CURVE_FITTING/symbol.chi' );
  const symbolFString = require( 'string!CURVE_FITTING/symbol.f' );
  const symbolNString = require( 'string!CURVE_FITTING/symbol.N' );
  const symbolXString = require( 'string!CURVE_FITTING/symbol.x' );
  const symbolYString = require( 'string!CURVE_FITTING/symbol.y' );
  const theReducedChiSquaredStatisticIsString = require( 'string!CURVE_FITTING/theReducedChiSquaredStatisticIs' );

  // constants
  const DIALOG_FONT_SIZE = 14;
  const DIALOG_PLAIN_FONT = new PhetFont( DIALOG_FONT_SIZE );
  const DIALOG_MATH_FONT = new MathSymbolFont( DIALOG_FONT_SIZE );

  class ReducedChiSquaredStatisticDialog extends Dialog {

    /**
     * @constructor
     */
    constructor() {

      const numberOfDataPointsNode = new RichText(
        `<i style='font-family:${DIALOG_MATH_FONT.family}'>${symbolNString}</i> ${numberOfDataPointsString}`,
        { font: DIALOG_PLAIN_FONT }
      );

      const mathFontFString = `<i style='font-family:${DIALOG_MATH_FONT.family}'>${symbolFString}</i>`;
      const numberOfParametersNode = new RichText(
        `${mathFontFString} ${numberOfParameters1String} ${mathFontFString} ${numberOfParameters2String}`,
        { font: DIALOG_PLAIN_FONT }
      );

      const contentNode = new VBox( {
        align: 'left',
        spacing: 10,
        children: [
          new Text( theReducedChiSquaredStatisticIsString, { font: DIALOG_PLAIN_FONT } ),
          new HBox( {
            children: [
              new HStrut( 20 ),

              // Each translatable string is padded by an invisible starting and ending character.
              // These characters are usually for determining if the string is LTR or RTL.
              // These padding characters break KaTeX parsing and need to be removed.
              // The invisible characters are removed by the split calls, and the string is regenerated with the join calls.
              // The embedded strings should only be symbols/single characters anyways, so stripping direction
              //  characters shouldn't be too harmful.
              new FormulaNode(
                `${symbolChiString}_r^2 = \\frac{1}{${symbolNString} - ${symbolFString}} \\sum_i \\frac{[${symbolYString}(${symbolXString}_i) - ${symbolYString}_i]^2}{\\sigma_i^2}`
                  .split('‪').join('').split('‬').join('').split('‫').join('')
              )
            ]
          } ),
          numberOfDataPointsNode,
          numberOfParametersNode
        ]
      } );

      super( contentNode );
    }

  }

  curveFitting.register( 'ReducedChiSquaredStatisticDialog', ReducedChiSquaredStatisticDialog );

  return ReducedChiSquaredStatisticDialog;
} );
