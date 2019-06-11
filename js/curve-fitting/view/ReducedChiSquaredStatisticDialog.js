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
  const symbolFString = require( 'string!CURVE_FITTING/symbol.f' );
  const symbolNString = require( 'string!CURVE_FITTING/symbol.N' );
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
              new FormulaNode( 'X_r^2 = \\frac{1}{N - f} \\sum_i \\frac{[y(x_i) - y_i]^2}{\\sigma_i^2}' )
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
