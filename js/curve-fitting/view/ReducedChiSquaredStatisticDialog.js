// Copyright 2016-2017, University of Colorado Boulder

/**
 * Dialog that provides information about the reduced chi-squared statistic.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var Dialog = require( 'SUN/Dialog' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var HStrut = require( 'SCENERY/nodes/HStrut' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MathSymbolFont = require( 'SCENERY_PHET/MathSymbolFont' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  // images
  var equationHelpImage = require( 'image!CURVE_FITTING/equation-help.png' );

  // strings
  var numberOfDataPointsString = require( 'string!CURVE_FITTING/numberOfDataPoints' );
  var numberOfParameters1String = require( 'string!CURVE_FITTING/numberOfParameters1' );
  var numberOfParameters2String = require( 'string!CURVE_FITTING/numberOfParameters2' );
  var symbolFString = require( 'string!CURVE_FITTING/symbol.f' );
  var symbolNString = require( 'string!CURVE_FITTING/symbol.N' );
  var theReducedChiSquaredStatisticIsString = require( 'string!CURVE_FITTING/theReducedChiSquaredStatisticIs' );

  // constants
  var DIALOG_FONT_SIZE = 14;
  var DIALOG_PLAIN_FONT = new PhetFont( DIALOG_FONT_SIZE );
  var DIALOG_MATH_FONT = new MathSymbolFont( DIALOG_FONT_SIZE );
  var TEXT_SPACING = 6;

  /**
   * @constructor
   */
  function ReducedChiSquaredStatisticDialog() {

    var numberOfDataPointsNode = new HBox( {
      spacing: TEXT_SPACING,
      children: [
        new Text( symbolNString, { font: DIALOG_MATH_FONT } ),
        new Text( numberOfDataPointsString, { font: DIALOG_PLAIN_FONT } )
      ]
    } );

    var numberOfParametersNode = new HBox( {
      spacing: TEXT_SPACING,
      children: [
        new Text( symbolFString, { font: DIALOG_MATH_FONT } ),
        new Text( numberOfParameters1String, { font: DIALOG_PLAIN_FONT } ),
        new Text( symbolFString, { font: DIALOG_MATH_FONT } ),
        new Text( numberOfParameters2String, { font: DIALOG_PLAIN_FONT } )
      ]
    } );

    var contentNode = new VBox( {
      align: 'left',
      spacing: 10,
      children: [
        new Text( theReducedChiSquaredStatisticIsString, { font: DIALOG_PLAIN_FONT } ),
        new HBox( {
          children: [
            new HStrut( 20 ),
            new Image( equationHelpImage, { scale: 0.23 } )
          ]
        } ),
        numberOfDataPointsNode,
        numberOfParametersNode
      ]
    } );

    Dialog.call( this, contentNode );
  }

  curveFitting.register( 'ReducedChiSquaredStatisticDialog', ReducedChiSquaredStatisticDialog );

  return inherit( Dialog, ReducedChiSquaredStatisticDialog );
} );
