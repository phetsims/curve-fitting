// Copyright 2016-2019, University of Colorado Boulder

/**
 * Control panel for selecting view options.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const Checkbox = require( 'SUN/Checkbox' );
  const curveFitting = require( 'CURVE_FITTING/curveFitting' );
  const CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  const Panel = require( 'SUN/Panel' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  const curveString = require( 'string!CURVE_FITTING/curve' );
  const residualsString = require( 'string!CURVE_FITTING/residuals' );
  const valuesString = require( 'string!CURVE_FITTING/values' );

  class ViewOptionsPanel extends Panel {

    /**
     * @param {Property.<boolean>} curveVisibleProperty
     * @param {Property.<boolean>} residualsVisibleProperty
     * @param {Property.<boolean>} valuesVisibleProperty
     * @param {Object} [options]
     */
    constructor( curveVisibleProperty, residualsVisibleProperty, valuesVisibleProperty, options ) {

      // checkboxes
      const curveCheckbox = createCheckbox( curveVisibleProperty, curveString );
      const residualsCheckbox = createCheckbox( residualsVisibleProperty, residualsString );
      const valuesCheckbox = createCheckbox( valuesVisibleProperty, valuesString );

      // vertical layout
      const contentNode = new VBox( {
        spacing: CurveFittingConstants.CONTROLS_Y_SPACING,
        align: 'left',
        children: [
          curveCheckbox,
          residualsCheckbox,
          valuesCheckbox
        ]
      } );

      super( contentNode, options );

      // Saves state of residualsVisibleProperty while the residuals checkbox is disabled.
      let wereResidualsVisible = residualsVisibleProperty.value;

      // Visibility of the curve affects other controls. No dispose necessary because this panel is present for the lifetime of the sim.
      curveVisibleProperty.link( isCurveVisible => {

        // Enable residuals checkbox when curve is checked.
        residualsCheckbox.enabled = isCurveVisible;

        if ( isCurveVisible ) {

          // When curve is checked, restore the state of residuals.
          residualsVisibleProperty.value = wereResidualsVisible;
        }
        else {

          // When the curve is unchecked, save residuals state and turn off residuals.
          wereResidualsVisible = residualsVisibleProperty.value;
          residualsVisibleProperty.value = false;
        }
      } );
    }
  }

  /**
   * Creates a checkbox for this panel.
   * @param {Property} property
   * @param {string} label
   * @returns {Checkbox}
   */
  function createCheckbox( property, label ) {
    return new Checkbox(
      new Text( label, {
        font: CurveFittingConstants.CONTROL_FONT,
        maxWidth: 140 // determined empirically
      } ),
      property,
      CurveFittingConstants.CHECKBOX_OPTIONS
    );
  }

  return curveFitting.register( 'ViewOptionsPanel', ViewOptionsPanel );
} );
