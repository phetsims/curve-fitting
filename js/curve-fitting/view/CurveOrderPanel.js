// Copyright 2016-2019, University of Colorado Boulder

/**
 * Control panel for selecting order of the curve.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Text from '../../../../scenery/js/nodes/Text.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import AquaRadioButton from '../../../../sun/js/AquaRadioButton.js';
import Panel from '../../../../sun/js/Panel.js';
import curveFittingStrings from '../../curve-fitting-strings.js';
import curveFitting from '../../curveFitting.js';
import CurveFittingConstants from '../CurveFittingConstants.js';

const cubicString = curveFittingStrings.cubic;
const linearString = curveFittingStrings.linear;
const quadraticString = curveFittingStrings.quadratic;

class CurveOrderPanel extends Panel {

  /**
   * @param {Property.<number>} orderProperty - order of the polynomial that describes the curve
   * @param {Object} [options]
   */
  constructor( orderProperty, options ) {

    // radio buttons
    const linearButton = createRadioButton( orderProperty, 1, linearString );
    const quadraticButton = createRadioButton( orderProperty, 2, quadraticString );
    const cubicButton = createRadioButton( orderProperty, 3, cubicString );

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