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
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Panel = require( 'SUN/Panel' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  var cubicString = require( 'string!CURVE_FITTING/cubic' );
  var linearString = require( 'string!CURVE_FITTING/linear' );
  var quadraticString = require( 'string!CURVE_FITTING/quadratic' );

  /**
   * @param {Property.<number>} orderProperty - order of the polynomial that describes the curve
   * @param {Object} [options]
   * @constructor
   */
  function CurveOrderPanel( orderProperty, options ) {

    // radio buttons
    var linearButton = createRadioButton( orderProperty, 1, linearString );
    var cubicButton = createRadioButton( orderProperty, 2, cubicString );
    var quadraticButton = createRadioButton( orderProperty, 3, quadraticString );

    // vertical layout
    var contentNode = new VBox( {
      align: 'left',
      spacing: 5,
      children: [
        linearButton,
        cubicButton,
        quadraticButton
      ]
    } );

    Panel.call( this, contentNode, options );
  }

  curveFitting.register( 'CurveOrderPanel', CurveOrderPanel );

  /**
   * Creates a radio button for this panel.
   *
   * @param {Property} property
   * @param {*} value
   * @param {string} label
   * @returns {AquaRadioButton}
   */
  var createRadioButton = function( property, value, label ) {
    return new AquaRadioButton( property, value,
      new Text( label, CurveFittingConstants.CONTROL_TEXT_OPTIONS ),
      CurveFittingConstants.RADIO_BUTTON_OPTIONS );
  };

  return inherit( Panel, CurveOrderPanel );
} );
