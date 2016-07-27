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
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  // images
  var equationHelpImage = require( 'image!CURVE_FITTING/equation-help.png' );

  // strings
  var numberOfDataPointsString = require( 'string!CURVE_FITTING/numberOfDataPoints' );
  var numberOfParametersInFitString = require( 'string!CURVE_FITTING/numberOfParametersInFit' );
  var theReducedChiSquaredStatisticIsString = require( 'string!CURVE_FITTING/theReducedChiSquaredStatisticIs' );

  // constants
  var DIALOG_FONT = new PhetFont( 14 );

  /**
   * @constructor
   */
  function HelpDialog() {

    var contentNode = new VBox( {
      align: 'left',
      spacing: 10,
      children: [
        new Text( theReducedChiSquaredStatisticIsString, { font: DIALOG_FONT } ),
        new HBox( {
          children: [
            new HStrut( 20 ),
            new Image( equationHelpImage, { scale: 0.23 } )
          ]
        } ),
        new Text( numberOfDataPointsString, { font: DIALOG_FONT } ),
        new Text( numberOfParametersInFitString, { font: DIALOG_FONT } )
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
