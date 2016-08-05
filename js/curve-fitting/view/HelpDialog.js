// Copyright 2016, University of Colorado Boulder

/**
 * Help dialog, accessed from the '?' button in the Deviations panel.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var Dialog = require( 'JOIST/Dialog' );
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
  var theReducedChiSquaredStatisticIsString = require( 'string!CURVE_FITTING/theReducedChiSquaredStatisticIs' );
  var symbolFString = require( 'string!CURVE_FITTING/symbol.f' );
  var symbolNString = require( 'string!CURVE_FITTING/symbol.N' );

  // constants
  var DIALOG_FONT_SIZE = 14;
  var DIALOG_PLAIN_FONT = new PhetFont( DIALOG_FONT_SIZE );
  var DIALOG_MATH_FONT = new MathSymbolFont( DIALOG_FONT_SIZE );
  var TEXT_SPACING = 6;

  /**
   * @constructor
   */
  function HelpDialog() {

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

    Dialog.call( this, contentNode, {
      modal: true,
      hasCloseButton: true
    } );
  }

  curveFitting.register( 'HelpDialog', HelpDialog );

  return inherit( Dialog, HelpDialog );
} );
