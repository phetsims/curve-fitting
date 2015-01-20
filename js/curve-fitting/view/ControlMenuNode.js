// Copyright 2002-2014, University of Colorado Boulder

/**
 * Deviations node in 'Curve Fitting' simulation.
 * Contains X^2 barometer, r^2 barometer and menu dialog.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

define( function( require ) {
  'use strict';

  // modules
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var CurveType = require( 'CURVE_FITTING/curve-fitting/model/CurveType' );
  var inherit = require( 'PHET_CORE/inherit' );
  var FitType = require( 'CURVE_FITTING/curve-fitting/model/FitType' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var VerticalCheckBoxGroup = require( 'SUN/VerticalCheckBoxGroup' );
  var VerticalAquaRadioButtonGroup = require( 'SUN/VerticalAquaRadioButtonGroup' );

  // strings
  var AdjustableFitString = require( 'string!CURVE_FITTING/adjustableFit' );
  var BestFitString = require( 'string!CURVE_FITTING/bestFit' );
  var CubicString = require( 'string!CURVE_FITTING/cubic' );
  var CurveString = require( 'string!CURVE_FITTING/curve' );
  var LinearString = require( 'string!CURVE_FITTING/linear' );
  var QuadraticString = require( 'string!CURVE_FITTING/quadratic' );
  var ResidualsString = require( 'string!CURVE_FITTING/residuals' );
  var ValuesString = require( 'string!CURVE_FITTING/values' );

  // constants
  var FONT = new PhetFont( 14 );
  var PANEL_OPTIONS = {
    cornerRadius: CurveFittingConstants.PANEL_CORNER_RADIUS,
    fill: CurveFittingConstants.PANEL_BACKGROUND_COLOR,
    xMargin: 10,
    yMargin: 10
  };
  var RADIO_BUTTON_MENU_OPTIONS = {
    spacing: 5,
    radius: 10
  };
  var PANEL_WIDTH = 150;

  /**
   * @param {CurveFittingModel} CurveFittingModel
   * @param {Object} options for graph node
   * @constructor
   */
  function ControlMenuNode( CurveFittingModel, options ) {
    VBox.call( this, _.extend( {spacing: 10}, options ) );

    // create options check boxes
    var checkBoxGroup = new VerticalCheckBoxGroup( [{
      content: new Text( CurveString, {font: FONT} ),
      property: CurveFittingModel.property( 'isCurve' )
    }, {
      content: new Text( ResidualsString, {font: FONT} ),
      property: CurveFittingModel.property( 'isResiduals' )
    }, {
      content: new Text( ValuesString, {font: FONT} ),
      property: CurveFittingModel.property( 'isValues' )
    }
    ], {spacing: 5, boxWidth: 20} );
    checkBoxGroup.localBounds = checkBoxGroup.localBounds.withMaxX( Math.max( checkBoxGroup.localBounds.maxX, PANEL_WIDTH ) );
    var optionsCheckBoxPanel = new Panel( checkBoxGroup, PANEL_OPTIONS );
    this.addChild( optionsCheckBoxPanel );

    // create curve type radio buttons
    var curveTypeRadioButtonGroup = new VerticalAquaRadioButtonGroup( [
      {property: CurveFittingModel.property( 'curveType' ), node: new Text( LinearString, {font: FONT} ), value: CurveType.LINEAR},
      {property: CurveFittingModel.property( 'curveType' ), node: new Text( QuadraticString, {font: FONT} ), value: CurveType.QUADRATIC},
      {property: CurveFittingModel.property( 'curveType' ), node: new Text( CubicString, {font: FONT} ), value: CurveType.CUBIC}
    ], RADIO_BUTTON_MENU_OPTIONS );
    curveTypeRadioButtonGroup.localBounds = curveTypeRadioButtonGroup.localBounds.withMaxX( Math.max( curveTypeRadioButtonGroup.localBounds.maxX, PANEL_WIDTH - RADIO_BUTTON_MENU_OPTIONS.radius ) );
    var curveTypePanel = new Panel( curveTypeRadioButtonGroup, PANEL_OPTIONS );
    this.addChild( curveTypePanel );

    // create fit type radio buttons
    var fitTypeRadioButtonGroup = new VerticalAquaRadioButtonGroup( [
      {property: CurveFittingModel.property( 'fitType' ), node: new Text( BestFitString, {font: FONT} ), value: FitType.BEST},
      {property: CurveFittingModel.property( 'fitType' ), node: new Text( AdjustableFitString, {font: FONT} ), value: FitType.ADJUSTABLE}
    ], RADIO_BUTTON_MENU_OPTIONS );
    fitTypeRadioButtonGroup.localBounds = fitTypeRadioButtonGroup.localBounds.withMaxX( Math.max( fitTypeRadioButtonGroup.localBounds.maxX, PANEL_WIDTH - RADIO_BUTTON_MENU_OPTIONS.radius ) );
    var fitTypePanel = new Panel( fitTypeRadioButtonGroup, PANEL_OPTIONS );
    this.addChild( fitTypePanel );

    // add observers
    CurveFittingModel.property( 'isCurve' ).link( function( isCurve ) {
      if ( isCurve ) {
        curveTypePanel.visible = true;
        fitTypePanel.visible = true;
      }
      else {
        curveTypePanel.visible = false;
        fitTypePanel.visible = false;
      }
    } );
  }

  return inherit( VBox, ControlMenuNode );
} );