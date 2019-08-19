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
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  const patternFEqualsNumberOfParametersString = require( 'string!CURVE_FITTING/pattern.fEqualsNumberOfParameters' );
  const patternNEqualsNumberOfDataPointsString = require( 'string!CURVE_FITTING/pattern.nEqualsNumberOfDataPoints' );
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
        StringUtils.fillIn( patternNEqualsNumberOfDataPointsString, {
          nSymbol: `<i style='font-family:${DIALOG_MATH_FONT.family}'>${symbolNString}</i>`
        } ),
        { font: DIALOG_PLAIN_FONT, maxWidth: 500 }
      );

      const numberOfParametersNode = new RichText(
        StringUtils.fillIn( patternFEqualsNumberOfParametersString, {
          fSymbol: `<i style='font-family:${DIALOG_MATH_FONT.family}'>${symbolFString}</i>`
        } ),
        { font: DIALOG_PLAIN_FONT, maxWidth: 500 }
      );

      const contentNode = new VBox( {
        align: 'left',
        spacing: 10,
        children: [
          new Text( theReducedChiSquaredStatisticIsString, { font: DIALOG_PLAIN_FONT, maxWidth: 500 } ),
          new HBox( {
            children: [
              new HStrut( 20 ),
              new FormulaNode(
                `${symbolChiString}_r^2 = \\frac{1}{${symbolNString} - ${symbolFString}} \\sum_i \\frac{[${symbolYString}(${symbolXString}_i) - ${symbolYString}_i]^2}{\\sigma_i^2}`
              )
            ],
            maxWidth: 800
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
