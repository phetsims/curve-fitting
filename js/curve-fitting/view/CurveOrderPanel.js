// Copyright 2016-2019, University of Colorado Boulder

/**
 * Control panel for selecting order of the curve.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const AquaRadioButton = require( 'SUN/AquaRadioButton' );
  const curveFitting = require( 'CURVE_FITTING/curveFitting' );
  const CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  const Panel = require( 'SUN/Panel' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  const cubicString = require( 'string!CURVE_FITTING/cubic' );
  const linearString = require( 'string!CURVE_FITTING/linear' );
  const quadraticString = require( 'string!CURVE_FITTING/quadratic' );

  class CurveOrderPanel extends Panel {

    /**
     * @param {Property.<number>} orderProperty - order of the polynomial that describes the curve
     * @param {Object} [options]
     */
    constructor( orderProperty, options ) {

      // radio buttons
      const linearButton = createRadioButton( 1, linearString, orderProperty );
      const quadraticButton = createRadioButton( 2, quadraticString, orderProperty );
      const cubicButton = createRadioButton( 3, cubicString, orderProperty );

      // vertical layout
      const contentNode = new VBox( {
        align: 'left',
        spacing: 5,
        children: [
          linearButton,
          quadraticButton,
          cubicButton
        ]
      } );

      super( contentNode, options );
    }

  }

  /**
   * Creates a uniform radio button for this panel.
   *
   * @param {number} value
   * @param {string} label
   * @param {Property.<number>} orderProperty
   * @returns {AquaRadioButton}
   */
  function createRadioButton( value, label, orderProperty ) {
    return new AquaRadioButton(
      orderProperty,
      value,
      new Text( label, CurveFittingConstants.CONTROL_TEXT_OPTIONS ),
      CurveFittingConstants.RADIO_BUTTON_OPTIONS
    );
  }

  return curveFitting.register( 'CurveOrderPanel', CurveOrderPanel );
} );
