// Copyright 2015-2016, University of Colorado Boulder

/**
 * Control panel for selecting fit type, and adjusting parameters for 'adjustable fit'.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

define( function( require ) {
  'use strict';

  // modules
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var EquationFitNode = require( 'CURVE_FITTING/curve-fitting/view/EquationFitNode' );
  var FitType = require( 'CURVE_FITTING/curve-fitting/model/FitType' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var SliderParameterNode = require( 'CURVE_FITTING/curve-fitting/view/SliderParameterNode' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var VerticalAquaRadioButtonGroup = require( 'SUN/VerticalAquaRadioButtonGroup' );

  // strings
  var adjustableFitString = require( 'string!CURVE_FITTING/adjustableFit' );
  var bestFitString = require( 'string!CURVE_FITTING/bestFit' );
  var symbolAString = require( 'string!CURVE_FITTING/symbol.a' );
  var symbolBString = require( 'string!CURVE_FITTING/symbol.b' );
  var symbolCString = require( 'string!CURVE_FITTING/symbol.c' );
  var symbolDString = require( 'string!CURVE_FITTING/symbol.d' );

  // constants
  var FONT = new PhetFont( 12 );
  var RADIO_BUTTON_MENU_OPTIONS = {
    spacing: 5,
    radius: 8,
    touchAreaXDilation: 5
  };

  /**
   * @param {Curve} curve
   * @param {Property.<string>} fitTypeProperty
   * @param {Property.<number>} orderProperty
   * @param {Object} [options] for graph node TODO rename, and this type needs its own options
   * @constructor
   */
  function FitPanel( curve, fitTypeProperty, orderProperty, options ) {

    var content = new VBox();

    // create radio buttons
    var fitTypeRadioButtonGroup = new VerticalAquaRadioButtonGroup( [
      { property: fitTypeProperty, node: new Text( bestFitString, { font: FONT } ), value: FitType.BEST },
      { property: fitTypeProperty, node: new Text( adjustableFitString, { font: FONT } ), value: FitType.ADJUSTABLE }
    ], RADIO_BUTTON_MENU_OPTIONS );
    fitTypeRadioButtonGroup.localBounds = fitTypeRadioButtonGroup.localBounds.withMaxX( Math.max( fitTypeRadioButtonGroup.localBounds.maxX, CurveFittingConstants.PANEL_WIDTH - RADIO_BUTTON_MENU_OPTIONS.radius ) );
    content.addChild( fitTypeRadioButtonGroup );

    // create and add equation node
    content.addChild( new EquationFitNode( orderProperty ) );

    // it's necessary to be able to enable and disable sliders
    var aSliderEnabledProperty = new Property( true );
    var bSliderEnabledProperty = new Property( true );
    var cSliderEnabledProperty = new Property( true );
    var dSliderEnabledProperty = new Property( true );

    // create slider for parameters
    var aSliderBox = new SliderParameterNode( curve.aProperty, {
      min: -1,
      max: 1
    }, symbolAString, { enabledProperty: aSliderEnabledProperty } );
    var bSliderBox = new SliderParameterNode( curve.bProperty, {
      min: -2,
      max: 2
    }, symbolBString, { enabledProperty: bSliderEnabledProperty } );
    var cSliderBox = new SliderParameterNode( curve.cProperty, {
      min: -10,
      max: 10
    }, symbolCString, { enabledProperty: cSliderEnabledProperty } );
    var dSliderBox = new SliderParameterNode( curve.dProperty, {
      min: -10,
      max: 10
    }, symbolDString, { enabledProperty: dSliderEnabledProperty } );

    // create slider box
    var slidersBox = new HBox( {
      spacing: 5,
      children: [ aSliderBox, bSliderBox, cSliderBox, dSliderBox ]
    } );

    // add slider number observer
    orderProperty.link( function( order ) {
      // if the sliders are not disabled they will be able to change
      // and behave as described in #15 and #37
      if ( order === 1 ) {
        // disable a and b slider
        aSliderEnabledProperty.set( false );
        bSliderEnabledProperty.set( false );
        slidersBox.children = [ cSliderBox, dSliderBox ];
      }
      else if ( order === 2 ) {
        // enable b slider
        bSliderEnabledProperty.set( true );
        //disable a slider
        aSliderEnabledProperty.set( false );
        slidersBox.children = [ bSliderBox, cSliderBox, dSliderBox ];
      }
      else if ( order === 3 ) {
        // enable a and b sliders
        aSliderEnabledProperty.set( true );
        bSliderEnabledProperty.set( true );
        slidersBox.children = [ aSliderBox, bSliderBox, cSliderBox, dSliderBox ];
      }
      else {
        throw new Error( 'unsupported curve order: ' + order );
      }
    } );

    // add slider visibility observer
    fitTypeProperty.link( function( fitType ) {
      if ( fitType === FitType.BEST && content.hasChild( slidersBox ) ) {
        content.removeChild( slidersBox );
      }
      else if ( fitType === FitType.ADJUSTABLE ) {
        content.addChild( slidersBox );
      }
    } );

    Panel.call( this, content, _.extend( {
      cornerRadius: CurveFittingConstants.PANEL_CORNER_RADIUS,
      fill: CurveFittingConstants.PANEL_BACKGROUND_COLOR,
      xMargin: CurveFittingConstants.PANEL_MARGIN,
      yMargin: CurveFittingConstants.PANEL_MARGIN,
      maxWidth: CurveFittingConstants.PANEL_MAX_WIDTH
    }, options ) );
  }

  curveFitting.register( 'FitPanel', FitPanel );

  return inherit( Panel, FitPanel );
} );