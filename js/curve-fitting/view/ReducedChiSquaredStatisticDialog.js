// Copyright 2016-2019, University of Colorado Boulder

/**
 * Dialog that provides information about the reduced chi-squared statistic.
 *
 * @author Chris Malley (PixelZoom, Inc.)
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
  const TEXT_SPACING = 6;

  class ReducedChiSquaredStatisticDialog extends Dialog {

    /**
     * @constructor
     */
    constructor() {

      const numberOfDataPointsNode = new HBox( {
        spacing: TEXT_SPACING,
        children: [
          new Text( symbolNString, { font: DIALOG_MATH_FONT } ),
          new Text( numberOfDataPointsString, { font: DIALOG_PLAIN_FONT } )
        ]
      } );

      const numberOfParametersNode = new HBox( {
        spacing: TEXT_SPACING,
        children: [
          new Text( symbolFString, { font: DIALOG_MATH_FONT } ),
          new Text( numberOfParameters1String, { font: DIALOG_PLAIN_FONT } ),
          new Text( symbolFString, { font: DIALOG_MATH_FONT } ),
          new Text( numberOfParameters2String, { font: DIALOG_PLAIN_FONT } )
        ]
      } );

      const contentNode = new VBox( {
        align: 'left',
        spacing: 10,
        children: [
          new Text( theReducedChiSquaredStatisticIsString, { font: DIALOG_PLAIN_FONT } ),
          new HBox( {
            children: [
              new HStrut( 20 ),
              new FormulaNode(
                `${symbolChiString}_r^2 = \\frac{1}{${symbolNString} - ${symbolFString}} \\sum_i \\frac{[${symbolYString}(${symbolXString}_i) - ${symbolYString}_i]^2}{\\sigma_i^2}`
                  .replace('‪', '')
                  .replace('‬', '')
                  .replace('‪', '')
                  .replace('‬', '')
                  .replace('‪', '')
                  .replace('‬', '')
                  .replace('‪', '')
                  .replace('‬', '')
                  .replace('‪', '')
                  .replace('‬', '')
                  .replace('‪', '')
                  .replace('‬', '')

                // Now I know the above '.replace' calls look crazy. They are.
                // Apparently each of the embedded symbol strings is padded with some invisible character that breaks KaTeX parsing.
                // Even more crazily, each instance of an embedded string seems to be padded with different invisible characters.
                // Removing any of those '.replace' calls will make the code error because KaTeX cannot parse the string.
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
