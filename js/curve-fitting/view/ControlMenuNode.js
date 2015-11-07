// Copyright 2015, University of Colorado Boulder

/**
 * Control menu node in 'Curve Fitting' simulation.
 * Contains radio buttons, checkboxes and sliders.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

define( function( require ) {
  'use strict';

  // modules
  var CheckBox = require( 'SUN/CheckBox' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
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
  var CHECK_BOX_OPTIONS = { boxWidth: 16 };
  var FONT = new PhetFont( 12 );
  var PANEL_OPTIONS = {
    cornerRadius: CurveFittingConstants.PANEL_CORNER_RADIUS,
    fill: CurveFittingConstants.PANEL_BACKGROUND_COLOR,
    xMargin: CurveFittingConstants.PANEL_MARGIN,
    yMargin: CurveFittingConstants.PANEL_MARGIN
  };
  var RADIO_BUTTON_MENU_OPTIONS = {
    spacing: 5,
    radius: 8
  };

  /**
   * @param {CurveFittingModel} curveFittingModel
   * @param {Object} [options] for graph node
   * @constructor
   */
  function ControlMenuNode( curveFittingModel, options ) {
    VBox.call( this, _.extend( { align: 'left', spacing: 10 }, options ) );

    // create label for residual check box
    var residualCheckBoxLabel = new Text( ResidualsString, { font: FONT } );
    residualCheckBoxLabel.setEnabled = function( enabled ) {
      residualCheckBoxLabel.opacity = ( enabled ? 1 : 0.5 ); // gray out when disabled
    };

    // create options check boxes
    var residualCheckBox = new CheckBox( residualCheckBoxLabel, curveFittingModel.areResidualsVisibleProperty, CHECK_BOX_OPTIONS );
    var checkBoxGroup = new VBox( {
      spacing: 5,
      align: 'left',
      children: [
        new CheckBox( new Text( CurveString, { font: FONT } ), curveFittingModel.curve.isVisibleProperty, CHECK_BOX_OPTIONS ),
        residualCheckBox,
        new CheckBox( new Text( ValuesString, { font: FONT } ), curveFittingModel.areValuesVisibleProperty, CHECK_BOX_OPTIONS )
      ]
    } );
    checkBoxGroup.localBounds = checkBoxGroup.localBounds.withMaxX( Math.max( checkBoxGroup.localBounds.maxX, CurveFittingConstants.PANEL_WIDTH ) );
    var optionsCheckBoxPanel = new Panel( checkBoxGroup, PANEL_OPTIONS );
    this.addChild( optionsCheckBoxPanel );

    // create curve type radio buttons
    var curveTypeRadioButtonGroup = new VerticalAquaRadioButtonGroup( [
      { property: curveFittingModel.orderOfFitProperty, node: new Text( LinearString, { font: FONT } ), value: 1 },
      { property: curveFittingModel.orderOfFitProperty, node: new Text( QuadraticString, { font: FONT } ), value: 2 },
      { property: curveFittingModel.orderOfFitProperty, node: new Text( CubicString, { font: FONT } ), value: 3 }
    ], RADIO_BUTTON_MENU_OPTIONS );
    curveTypeRadioButtonGroup.localBounds = curveTypeRadioButtonGroup.localBounds.withMaxX( Math.max( curveTypeRadioButtonGroup.localBounds.maxX, CurveFittingConstants.PANEL_WIDTH - RADIO_BUTTON_MENU_OPTIONS.radius ) );
    var curveTypePanel = new Panel( curveTypeRadioButtonGroup, PANEL_OPTIONS );
    this.addChild( curveTypePanel );

    // create fit type menu
    var fitTypeMenu = new FitTypeMenu( curveFittingModel.curve, curveFittingModel.fitTypeProperty, curveFittingModel.orderOfFitProperty, curveFittingModel );
    this.addChild( fitTypeMenu );

    // add observers
    curveFittingModel.curve.isVisibleProperty.link( function( isCurveVisible ) {
      if ( isCurveVisible ) {
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