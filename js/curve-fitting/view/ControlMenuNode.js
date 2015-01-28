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
  var CheckBox = require( 'SUN/CheckBox' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var CurveType = require( 'CURVE_FITTING/curve-fitting/model/CurveType' );
  var inherit = require( 'PHET_CORE/inherit' );
  var FitTypeMenu = require( 'CURVE_FITTING/curve-fitting/view/FitTypeMenu' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var VerticalAquaRadioButtonGroup = require( 'SUN/VerticalAquaRadioButtonGroup' );

  // strings
  var CubicString = require( 'string!CURVE_FITTING/cubic' );
  var CurveString = require( 'string!CURVE_FITTING/curve' );
  var LinearString = require( 'string!CURVE_FITTING/linear' );
  var QuadraticString = require( 'string!CURVE_FITTING/quadratic' );
  var ResidualsString = require( 'string!CURVE_FITTING/residuals' );
  var ValuesString = require( 'string!CURVE_FITTING/values' );

  // constants
  var CHECK_BOX_OPTIONS = { boxWidth: 20 };
  var FONT = new PhetFont( 13 );
  var PANEL_OPTIONS = {
    cornerRadius: CurveFittingConstants.PANEL_CORNER_RADIUS,
    fill: CurveFittingConstants.PANEL_BACKGROUND_COLOR,
    xMargin: CurveFittingConstants.PANEL_MARGIN,
    yMargin: CurveFittingConstants.PANEL_MARGIN
  };
  var RADIO_BUTTON_MENU_OPTIONS = {
    spacing: 5,
    radius: 10
  };

  /**
   * @param {CurveFittingModel} CurveFittingModel
   * @param {Object} options for graph node
   * @constructor
   */
  function ControlMenuNode( CurveFittingModel, options ) {
    VBox.call( this, _.extend( { spacing: 10 }, options ) );

    // create label for residual check box
    var residualCheckBoxLabel = new Text( ResidualsString, { font: FONT } );
    residualCheckBoxLabel.setEnabled = function( enabled ) {
      residualCheckBoxLabel.opacity = ( enabled ? 1 : 0.5 ); // gray out when disabled
    };

    // create options check boxes
    var residualCheckBox = new CheckBox( residualCheckBoxLabel, CurveFittingModel.property( 'isResiduals' ), CHECK_BOX_OPTIONS );
    var checkBoxGroup = new VBox( {
      spacing: 5,
      align: 'left',
      children: [
        new CheckBox( new Text( CurveString, { font: FONT } ), CurveFittingModel.property( 'isCurve' ), CHECK_BOX_OPTIONS ),
        residualCheckBox,
        new CheckBox( new Text( ValuesString, { font: FONT } ), CurveFittingModel.property( 'isValues' ), CHECK_BOX_OPTIONS )
      ]
    } );
    checkBoxGroup.localBounds = checkBoxGroup.localBounds.withMaxX( Math.max( checkBoxGroup.localBounds.maxX, CurveFittingConstants.PANEL_WIDTH ) );
    var optionsCheckBoxPanel = new Panel( checkBoxGroup, PANEL_OPTIONS );
    this.addChild( optionsCheckBoxPanel );

    // create curve type radio buttons
    var curveTypeRadioButtonGroup = new VerticalAquaRadioButtonGroup( [
      { property: CurveFittingModel.property( 'curveType' ), node: new Text( LinearString, { font: FONT } ), value: CurveType.LINEAR },
      { property: CurveFittingModel.property( 'curveType' ), node: new Text( QuadraticString, { font: FONT } ), value: CurveType.QUADRATIC },
      { property: CurveFittingModel.property( 'curveType' ), node: new Text( CubicString, { font: FONT } ), value: CurveType.CUBIC }
    ], RADIO_BUTTON_MENU_OPTIONS );
    curveTypeRadioButtonGroup.localBounds = curveTypeRadioButtonGroup.localBounds.withMaxX( Math.max( curveTypeRadioButtonGroup.localBounds.maxX, CurveFittingConstants.PANEL_WIDTH - RADIO_BUTTON_MENU_OPTIONS.radius ) );
    var curveTypePanel = new Panel( curveTypeRadioButtonGroup, PANEL_OPTIONS );
    this.addChild( curveTypePanel );

    // create fit type menu
    var fitTypeMenu = new FitTypeMenu( CurveFittingModel.curveModel, CurveFittingModel.property( 'fitType' ), CurveFittingModel.property( 'curveType' ) );
    this.addChild( fitTypeMenu );

    // add observers
    CurveFittingModel.property( 'isCurve' ).link( function( isCurve ) {
      if ( isCurve ) {
        curveTypePanel.visible = true;
        fitTypeMenu.visible = true;
        residualCheckBox.enabled = true;
      }
      else {
        curveTypePanel.visible = false;
        fitTypeMenu.visible = false;
        residualCheckBox.enabled = false;
      }
    } );
  }

  return inherit( VBox, ControlMenuNode );
} );