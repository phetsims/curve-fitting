// Copyright 2015-2017, University of Colorado Boulder

//TODO make all 3 panels the same width, https://github.com/phetsims/curve-fitting/issues/98
/**
 * Container for control panels
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  const curveFitting = require( 'CURVE_FITTING/curveFitting' );
  const CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  const CurveOrderPanel = require( 'CURVE_FITTING/curve-fitting/view/CurveOrderPanel' );
  const FitPanel = require( 'CURVE_FITTING/curve-fitting/view/FitPanel' );
  const inherit = require( 'PHET_CORE/inherit' );
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

  /**
   * @param {Property.<number>[]} sliderPropertyArray
   * @param {Property.<number>} orderProperty
   * @param {Property.<string>} fitProperty
   * @param {Property.<boolean>} curveVisibleProperty
   * @param {Property.<boolean>} residualsVisibleProperty
   * @param {Property.<boolean>} valuesProperty
   * @param {Object} [options]
   * @constructor
   */
  function ControlPanels( sliderPropertyArray, orderProperty, fitProperty, curveVisibleProperty, residualsVisibleProperty, valuesProperty, options ) {

    options = _.extend( {
      align: 'left',
      spacing: 10
    }, options );

    // view options
    const viewOptionsPanel = new ViewOptionsPanel( curveVisibleProperty, residualsVisibleProperty, valuesProperty, PANEL_OPTIONS );

    // order of curve
    const orderPanel = new CurveOrderPanel( orderProperty, PANEL_OPTIONS );

    // fit type
    const fitPanel = new FitPanel( sliderPropertyArray, fitProperty, orderProperty, PANEL_OPTIONS );

    assert && assert( !options.children, 'decoration not supported' );
    options.children = [ viewOptionsPanel, orderPanel, fitPanel ];

    VBox.call( this, options );

    // hide panels when curve is not visible
    curveVisibleProperty.link( curveVisible => {
      orderPanel.visible = curveVisible;
      fitPanel.visible = curveVisible;
    } );
  }

  curveFitting.register( 'ControlPanels', ControlPanels );

  return inherit( VBox, ControlPanels );
} );