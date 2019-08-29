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
  const CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  const Dialog = require( 'SUN/Dialog' );
  const FormulaNode = require( 'SCENERY_PHET/FormulaNode' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const HStrut = require( 'SCENERY/nodes/HStrut' );
  const RichText = require( 'SCENERY/nodes/RichText' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  const fEqualsNumberOfParametersPatternString = require( 'string!CURVE_FITTING/fEqualsNumberOfParametersPattern' );
  const nEqualsNumberOfDataPointsPatternString = require( 'string!CURVE_FITTING/nEqualsNumberOfDataPointsPattern' );
  const chiSymbolString = require( 'string!CURVE_FITTING/chiSymbol' );
  const fSymbolString = require( 'string!CURVE_FITTING/fSymbol' );
  const nSymbolString = require( 'string!CURVE_FITTING/nSymbol' );
  const xSymbolString = require( 'string!CURVE_FITTING/xSymbol' );
  const ySymbolString = require( 'string!CURVE_FITTING/ySymbol' );
  const theReducedChiSquaredStatisticIsString = require( 'string!CURVE_FITTING/theReducedChiSquaredStatisticIs' );

  // constants
  const TEXT_OPTIONS = {
    font: CurveFittingConstants.INFO_DIALOG_NORMAL_FONT,
    maxWidth: 500
  };

  const FORMULA_STRING = `${chiSymbolString}_r^2 = ` +
                         `\\frac{1}{${nSymbolString} - ${fSymbolString}} ` +
                         '\\sum_i ' +
                         `\\frac{[${ySymbolString}(${xSymbolString}_i) - ${ySymbolString}_i]^2}{\\sigma_i^2}`;

  class ReducedChiSquaredStatisticDialog extends Dialog {

    constructor() {

      const numberOfDataPointsNode = new RichText(
        StringUtils.fillIn( nEqualsNumberOfDataPointsPatternString, {
          nSymbol: `<i style='font-family:${CurveFittingConstants.INFO_DIALOG_SYMBOL_FONT.family}'>${nSymbolString}</i>`
        } ),
        TEXT_OPTIONS
      );

      const numberOfParametersNode = new RichText(
        StringUtils.fillIn( fEqualsNumberOfParametersPatternString, {
          fSymbol: `<i style='font-family:${CurveFittingConstants.INFO_DIALOG_SYMBOL_FONT.family}'>${fSymbolString}</i>`
        } ),
        TEXT_OPTIONS
      );

      const contentNode = new VBox( {
        align: 'left',
        spacing: 10,
        children: [
          new Text( theReducedChiSquaredStatisticIsString, TEXT_OPTIONS ),
          new HBox( {
            children: [
              new HStrut( 20 ),
              new FormulaNode( FORMULA_STRING )
            ],
            maxWidth: 650
          } ),
          numberOfDataPointsNode,
          numberOfParametersNode
        ]
      } );

      super( contentNode );
    }

  }

  return curveFitting.register( 'ReducedChiSquaredStatisticDialog', ReducedChiSquaredStatisticDialog );
} );
