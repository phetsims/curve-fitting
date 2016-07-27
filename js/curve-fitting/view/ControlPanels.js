// Copyright 2015-2016, University of Colorado Boulder

//TODO make all 3 panels the same width
/**
 * Container for control panels
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var CurveOrderPanel = require( 'CURVE_FITTING/curve-fitting/view/CurveOrderPanel' );
  var FitPanel = require( 'CURVE_FITTING/curve-fitting/view/FitPanel' );
  var inherit = require( 'PHET_CORE/inherit' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var ViewOptionsPanel = require( 'CURVE_FITTING/curve-fitting/view/ViewOptionsPanel' );

  //TODO revisit this
  // constants
  var PANEL_OPTIONS = {
    cornerRadius: CurveFittingConstants.PANEL_CORNER_RADIUS,
    fill: CurveFittingConstants.PANEL_BACKGROUND_COLOR,
    xMargin: CurveFittingConstants.PANEL_MARGIN,
    yMargin: CurveFittingConstants.PANEL_MARGIN,
    maxWidth: CurveFittingConstants.PANEL_MAX_WIDTH
  };

  //TODO don't pass in the entire model!
  /**
   * @param {CurveFittingModel} model
   * @param {Object} [options] for graph node
   * @constructor
   */
  function ControlPanels( model, options ) {

    options = _.extend( {
      align: 'left',
      spacing: 10
    }, options );

    // view options
    var viewOptionsPanel = new ViewOptionsPanel(
      model.curve.isVisibleProperty,
      model.areResidualsVisibleProperty,
      model.areValuesVisibleProperty,
      PANEL_OPTIONS );

    // order of curve
    var orderPanel = new CurveOrderPanel( model.orderProperty, PANEL_OPTIONS );

    // fit type
    var fitPanel = new FitPanel( model.curve, model.fitProperty, model.orderProperty, model );

    assert && assert( !options.children, 'decoration not supported' );
    options.children = [ viewOptionsPanel, orderPanel, fitPanel ];

    VBox.call( this, options );

    // hide panels when curve is not visible
    model.curve.isVisibleProperty.link( function( curveVisible ) {
      orderPanel.visible = fitPanel.visible = curveVisible;
    } );
  }

  curveFitting.register( 'ControlPanels', ControlPanels );

  return inherit( VBox, ControlPanels );
} );