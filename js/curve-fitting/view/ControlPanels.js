// Copyright 2015-2021, University of Colorado Boulder

/**
 * Container for control panels
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../../../phet-core/js/merge.js';
import { VBox } from '../../../../scenery/js/imports.js';
import curveFitting from '../../curveFitting.js';
import CurveFittingConstants from '../CurveFittingConstants.js';
import CurveOrderPanel from './CurveOrderPanel.js';
import FitPanel from './FitPanel.js';
import ViewOptionsPanel from './ViewOptionsPanel.js';

// constants
const PANEL_OPTIONS = {
  cornerRadius: CurveFittingConstants.PANEL_CORNER_RADIUS,
  fill: CurveFittingConstants.PANEL_BACKGROUND_COLOR,
  xMargin: CurveFittingConstants.PANEL_MARGIN,
  yMargin: CurveFittingConstants.PANEL_MARGIN,
  maxWidth: CurveFittingConstants.PANEL_MAX_WIDTH,
  minWidth: CurveFittingConstants.PANEL_MIN_WIDTH
};

class ControlPanels extends VBox {

  /**
   * @param {Property.<number>[]} sliderPropertyArray
   * @param {Property.<number>} orderProperty
   * @param {Property.<FitType>} fitProperty
   * @param {Property.<boolean>} curveVisibleProperty
   * @param {Property.<boolean>} residualsVisibleProperty
   * @param {Property.<boolean>} valuesProperty
   * @param {Object} [options]
   */
  constructor( sliderPropertyArray, orderProperty, fitProperty, curveVisibleProperty, residualsVisibleProperty,
               valuesProperty, options ) {
    options = merge( {
      align: 'left',
      spacing: 12,
      excludeInvisibleChildrenFromBounds: true
    }, options );

    // view options
    const viewOptionsPanel = new ViewOptionsPanel( curveVisibleProperty, residualsVisibleProperty, valuesProperty, PANEL_OPTIONS );

    // order of curve
    const orderPanel = new CurveOrderPanel( orderProperty, PANEL_OPTIONS );

    // fit type
    const fitPanel = new FitPanel( sliderPropertyArray, fitProperty, orderProperty, PANEL_OPTIONS );

    assert && assert( !options.children, 'decoration not supported' );
    options.children = [ viewOptionsPanel, orderPanel, fitPanel ];

    super( options );

    // @private stored in as a field of ControlPanels for #161
    this.viewOptionsPanel = viewOptionsPanel;

    // hide panels when curve is not visible; unlink unnecessary because ControlPanels is always present
    curveVisibleProperty.linkAttribute( orderPanel, 'visible' );
    curveVisibleProperty.linkAttribute( fitPanel, 'visible' );
  }

  /**
   * @public
   */
  reset() {
    this.viewOptionsPanel.reset();
  }

}

curveFitting.register( 'ControlPanels', ControlPanels );
export default ControlPanels;