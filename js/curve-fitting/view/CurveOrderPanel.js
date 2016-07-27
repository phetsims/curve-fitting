// Copyright 2016, University of Colorado Boulder

/**
 * Control panel for selecting order of the curve.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var AquaRadioButton = require( 'SUN/AquaRadioButton' );
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  var cubicString = require( 'string!CURVE_FITTING/cubic' );
  var linearString = require( 'string!CURVE_FITTING/linear' );
  var quadraticString = require( 'string!CURVE_FITTING/quadratic' );

  // constants
  var TEXT_OPTIONS = {
    font: new PhetFont( 12 )
  };
  var RADIO_BUTTON_OPTIONS = {
    radius: 8,
    touchAreaXDilation: 5
  };

  /**
   * @param {Property.<number>} orderOfFitProperty
   * @param {Object} [options]
   * @constructor
   */
  function CurveOrderPanel( orderOfFitProperty, options ) {

    // 3 radio buttons
    var linearButton = new AquaRadioButton( orderOfFitProperty, 1, new Text( linearString, TEXT_OPTIONS ), RADIO_BUTTON_OPTIONS );
    var cubicButton = new AquaRadioButton( orderOfFitProperty, 2, new Text( cubicString, TEXT_OPTIONS ), RADIO_BUTTON_OPTIONS );
    var quadraticButton = new AquaRadioButton( orderOfFitProperty, 3, new Text( quadraticString, TEXT_OPTIONS ), RADIO_BUTTON_OPTIONS );

    // vertical layout
    var contentNode = new VBox( {
      children: [ linearButton, cubicButton, quadraticButton ],
      align: 'left',
      spacing: 5
    } );

    Panel.call( this, contentNode, options );
  }

  curveFitting.register( 'CurveOrderPanel', CurveOrderPanel );

  return inherit( Panel, CurveOrderPanel );
} );
