// Copyright 2016-2022, University of Colorado Boulder

/**
 * Control panel for selecting view options.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Text, VBox } from '../../../../scenery/js/imports.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import Panel from '../../../../sun/js/Panel.js';
import curveFitting from '../../curveFitting.js';
import CurveFittingStrings from '../../CurveFittingStrings.js';
import CurveFittingConstants from '../CurveFittingConstants.js';

const curveString = CurveFittingStrings.curve;
const residualsString = CurveFittingStrings.residuals;
const valuesString = CurveFittingStrings.values;

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

    // @private Saves state of residualsVisibleProperty while the residuals checkbox is disabled.
    this.wereResidualsVisible = residualsVisibleProperty.value;

    // Visibility of the curve affects other controls. No dispose necessary because this panel is present for the lifetime of the sim.
    curveVisibleProperty.link( isCurveVisible => {

      // Enable residuals checkbox when curve is checked.
      residualsCheckbox.enabled = isCurveVisible;

      if ( isCurveVisible ) {

        // When curve is checked, restore the state of residuals.
        residualsVisibleProperty.value = this.wereResidualsVisible;
      }
      else {

        // When the curve is unchecked, save residuals state and turn off residuals.
        this.wereResidualsVisible = residualsVisibleProperty.value;
        residualsVisibleProperty.value = false;
      }
    } );
  }

  /**
   * @public
   * Resets wereResidualsVisible for #161
   */
  reset() {
    this.wereResidualsVisible = false;
  }

}

/**
 * Creates a checkbox for this panel.
 * @param {Property} property
 * @param {string} label
 * @returns {Checkbox}
 */
function createCheckbox( property, label ) {
  return new Checkbox( property, new Text( label, {
    font: CurveFittingConstants.CONTROL_FONT,
    maxWidth: 140 // determined empirically
  } ), CurveFittingConstants.CHECKBOX_OPTIONS );
}

curveFitting.register( 'ViewOptionsPanel', ViewOptionsPanel );
export default ViewOptionsPanel;