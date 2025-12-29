// Copyright 2016-2025, University of Colorado Boulder

/**
 * Control panel for selecting order of the curve.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import AquaRadioButton from '../../../../sun/js/AquaRadioButton.js';
import Panel from '../../../../sun/js/Panel.js';
import curveFitting from '../../curveFitting.js';
import CurveFittingStrings from '../../CurveFittingStrings.js';
import CurveFittingConstants from '../CurveFittingConstants.js';

const cubicStringProperty = CurveFittingStrings.cubicStringProperty;
const linearStringProperty = CurveFittingStrings.linearStringProperty;
const quadraticStringProperty = CurveFittingStrings.quadraticStringProperty;

class CurveOrderPanel extends Panel {

  /**
   * @param {Property.<number>} orderProperty - order of the polynomial that describes the curve
   * @param {Object} [options]
   */
  constructor( orderProperty, options ) {

    // radio buttons
    const linearButton = createRadioButton( orderProperty, 1, linearStringProperty );
    const quadraticButton = createRadioButton( orderProperty, 2, quadraticStringProperty );
    const cubicButton = createRadioButton( orderProperty, 3, cubicStringProperty );

    // vertical layout
    const contentNode = new VBox( {
      align: 'left',
      spacing: CurveFittingConstants.CONTROLS_Y_SPACING,
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
 * @param {Property.<number>} orderProperty
 * @param {number} value
 * @param {string} label
 * @returns {AquaRadioButton}
 */
function createRadioButton( orderProperty, value, label ) {
  return new AquaRadioButton(
    orderProperty,
    value,
    new Text( label, {
      font: CurveFittingConstants.CONTROL_FONT,
      maxWidth: 140 // determined empirically
    } ),
    CurveFittingConstants.RADIO_BUTTON_OPTIONS
  );
}

curveFitting.register( 'CurveOrderPanel', CurveOrderPanel );
export default CurveOrderPanel;