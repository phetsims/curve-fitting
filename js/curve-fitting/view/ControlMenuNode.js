// Copyright 2015-2016, University of Colorado Boulder

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
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var FitTypePanel = require( 'CURVE_FITTING/curve-fitting/view/FitTypePanel' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var VerticalAquaRadioButtonGroup = require( 'SUN/VerticalAquaRadioButtonGroup' );

  // strings
  var cubicString = require( 'string!CURVE_FITTING/cubic' );
  var curveString = require( 'string!CURVE_FITTING/curve' );
  var linearString = require( 'string!CURVE_FITTING/linear' );
  var quadraticString = require( 'string!CURVE_FITTING/quadratic' );
  var residualsString = require( 'string!CURVE_FITTING/residuals' );
  var valuesString = require( 'string!CURVE_FITTING/values' );

  // constants
  var CHECK_BOX_OPTIONS = { boxWidth: 16 };
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

    // create label for residual check box
    var residualCheckBoxLabel = new Text( residualsString, { font: FONT } );
    residualCheckBoxLabel.setEnabled = function( enabled ) {
      residualCheckBoxLabel.opacity = ( enabled ? 1 : 0.5 ); // gray out when disabled
    };

    // create options check boxes
    var residualCheckBox = new CheckBox( residualCheckBoxLabel, curveFittingModel.areResidualsVisibleProperty, CHECK_BOX_OPTIONS );
    var checkBoxGroup = new VBox( {
      spacing: 5,
      align: 'left',
      children: [
        new CheckBox( new Text( curveString, { font: FONT } ), curveFittingModel.curve.isVisibleProperty, CHECK_BOX_OPTIONS ),
        residualCheckBox,
        new CheckBox( new Text( valuesString, { font: FONT } ), curveFittingModel.areValuesVisibleProperty, CHECK_BOX_OPTIONS )
      ]
    } );
    checkBoxGroup.localBounds = checkBoxGroup.localBounds.withMaxX( Math.max( checkBoxGroup.localBounds.maxX, CurveFittingConstants.PANEL_WIDTH ) );
    var optionsCheckBoxPanel = new Panel( checkBoxGroup, PANEL_OPTIONS );
    this.addChild( optionsCheckBoxPanel );

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
        residualCheckBox.enabled = true;
      }
      else {
        curveTypePanel.visible = false;
        fitTypePanel.visible = false;
        residualCheckBox.enabled = false;
        curveFittingModel.areResidualsVisible = false;
      }
    } );
  }

  curveFitting.register( 'ControlMenuNode', ControlMenuNode );

  return inherit( VBox, ControlMenuNode );
} );