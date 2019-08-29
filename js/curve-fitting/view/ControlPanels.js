// Copyright 2015-2019, University of Colorado Boulder

/**
 * Container for control panels
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const curveFitting = require( 'CURVE_FITTING/curveFitting' );
  const CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  const CurveOrderPanel = require( 'CURVE_FITTING/curve-fitting/view/CurveOrderPanel' );
  const FitPanel = require( 'CURVE_FITTING/curve-fitting/view/FitPanel' );
  const VBox = require( 'SCENERY/nodes/VBox' );
  const ViewOptionsPanel = require( 'CURVE_FITTING/curve-fitting/view/ViewOptionsPanel' );

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
      options = _.extend( {
        align: 'left',
        spacing: 12
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

      // hide panels when curve is not visible; unlink unnecessary because ControlPanels is always present
      curveVisibleProperty.linkAttribute( orderPanel, 'visible' );
      curveVisibleProperty.linkAttribute( fitPanel, 'visible' );
    }

  }

  return curveFitting.register( 'ControlPanels', ControlPanels );
} );
