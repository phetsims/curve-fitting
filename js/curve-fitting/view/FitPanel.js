// Copyright 2015-2016, University of Colorado Boulder

/**
 * Control panel for selecting how the curve is fit to data points.
 * For 'adjustable fit', provides additional controls for coefficients.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var EquationFitNode = require( 'CURVE_FITTING/curve-fitting/view/EquationFitNode' );
  var Fit = require( 'CURVE_FITTING/curve-fitting/model/Fit' );
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
   * @param {Property.<string>} fitProperty
   * @param {Property.<number>} orderProperty
   * @param {Object} [options]
   * @constructor
   */
  function FitPanel( curve, fitProperty, orderProperty, options ) {

    options = _.extend( {
      cornerRadius: CurveFittingConstants.PANEL_CORNER_RADIUS,
      fill: CurveFittingConstants.PANEL_BACKGROUND_COLOR,
      xMargin: CurveFittingConstants.PANEL_MARGIN,
      yMargin: CurveFittingConstants.PANEL_MARGIN,
      maxWidth: CurveFittingConstants.PANEL_MAX_WIDTH
    }, options );

    var content = new VBox();

    //TODO get rid of VerticalAquaRadioButtonGroup
    // create radio buttons
    var radioButtonGroup = new VerticalAquaRadioButtonGroup( [
      { property: fitProperty, node: new Text( bestFitString, { font: FONT } ), value: Fit.BEST },
      { property: fitProperty, node: new Text( adjustableFitString, { font: FONT } ), value: Fit.ADJUSTABLE }
    ], RADIO_BUTTON_MENU_OPTIONS );
    content.addChild( radioButtonGroup );

    // create and add equation node
    content.addChild( new EquationFitNode( orderProperty ) );

    //TODO why is it necessary?
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

      aSliderEnabledProperty.set( order >= 3 );
      bSliderEnabledProperty.set( order >= 2 );

      if ( order === 1 ) {
        slidersBox.children = [ cSliderBox, dSliderBox ];
      }
      else if ( order === 2 ) {
        slidersBox.children = [ bSliderBox, cSliderBox, dSliderBox ];
      }
      else if ( order === 3 ) {
        slidersBox.children = [ aSliderBox, bSliderBox, cSliderBox, dSliderBox ];
      }
      else {
        throw new Error( 'unsupported curve order: ' + order );
      }
    } );

    // show sliders when 'adjustable' fit is selected
    fitProperty.link( function( fit ) {
      if ( fit === Fit.BEST && content.hasChild( slidersBox ) ) {
        content.removeChild( slidersBox );
      }
      else if ( fit === Fit.ADJUSTABLE ) {
        content.addChild( slidersBox );
      }
    } );

    Panel.call( this, content, options );
  }

  curveFitting.register( 'FitPanel', FitPanel );

  return inherit( Panel, FitPanel );
} );