// Copyright 2015-2016, University of Colorado Boulder

//TODO make all 3 panels the same width
/**
 * Control menu node in 'Curve Fitting' simulation.
 * Contains radio buttons, checkboxes and sliders.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var FitTypePanel = require( 'CURVE_FITTING/curve-fitting/view/FitTypePanel' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var VerticalAquaRadioButtonGroup = require( 'SUN/VerticalAquaRadioButtonGroup' );
  var ViewOptionsPanel = require( 'CURVE_FITTING/curve-fitting/view/ViewOptionsPanel' );

  // strings
  var cubicString = require( 'string!CURVE_FITTING/cubic' );
  var linearString = require( 'string!CURVE_FITTING/linear' );
  var quadraticString = require( 'string!CURVE_FITTING/quadratic' );

  // constants
  var FONT = new PhetFont( 12 );
  var PANEL_OPTIONS = {
    cornerRadius: CurveFittingConstants.PANEL_CORNER_RADIUS,
    fill: CurveFittingConstants.PANEL_BACKGROUND_COLOR,
    xMargin: CurveFittingConstants.PANEL_MARGIN,
    yMargin: CurveFittingConstants.PANEL_MARGIN,
    maxWidth: CurveFittingConstants.PANEL_MAX_WIDTH
  };
  var RADIO_BUTTON_MENU_OPTIONS = {
    spacing: 5,
    radius: 8,
    touchAreaXDilation: 5
  };

  /**
   * @param {CurveFittingModel} curveFittingModel
   * @param {Object} [options] for graph node
   * @constructor
   */
  function ControlMenuNode( curveFittingModel, options ) {

    VBox.call( this, _.extend( { align: 'left', spacing: 10 }, options ) );

    var viewOptionsPanel = new ViewOptionsPanel(
      curveFittingModel.curve.isVisibleProperty,
      curveFittingModel.areResidualsVisibleProperty,
      curveFittingModel.areValuesVisibleProperty,
      PANEL_OPTIONS );
    this.addChild( viewOptionsPanel );

    // create curve type radio buttons
    var curveTypeRadioButtonGroup = new VerticalAquaRadioButtonGroup( [
      { property: curveFittingModel.orderOfFitProperty, node: new Text( linearString, { font: FONT } ), value: 1 },
      { property: curveFittingModel.orderOfFitProperty, node: new Text( quadraticString, { font: FONT } ), value: 2 },
      { property: curveFittingModel.orderOfFitProperty, node: new Text( cubicString, { font: FONT } ), value: 3 }
    ], RADIO_BUTTON_MENU_OPTIONS );
    curveTypeRadioButtonGroup.localBounds = curveTypeRadioButtonGroup.localBounds.withMaxX( Math.max( curveTypeRadioButtonGroup.localBounds.maxX, CurveFittingConstants.PANEL_WIDTH - RADIO_BUTTON_MENU_OPTIONS.radius ) );
    var curveTypePanel = new Panel( curveTypeRadioButtonGroup, PANEL_OPTIONS );
    this.addChild( curveTypePanel );

    // create fit type menu
    var fitTypePanel = new FitTypePanel( curveFittingModel.curve, curveFittingModel.fitTypeProperty, curveFittingModel.orderOfFitProperty, curveFittingModel );
    this.addChild( fitTypePanel );

    // add observers
    curveFittingModel.curve.isVisibleProperty.link( function( isCurveVisible ) {
      if ( isCurveVisible ) {
        curveTypePanel.visible = true;
        fitTypePanel.visible = true;
      }
      else {
        curveTypePanel.visible = false;
        fitTypePanel.visible = false;
      }
    } );
  }

  curveFitting.register( 'ControlMenuNode', ControlMenuNode );

  return inherit( VBox, ControlMenuNode );
} );