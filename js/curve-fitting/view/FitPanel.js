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
  var AquaRadioButton = require( 'SUN/AquaRadioButton' );
  var CoefficientSliderNode = require( 'CURVE_FITTING/curve-fitting/view/CoefficientSliderNode' );
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var EquationFitNode = require( 'CURVE_FITTING/curve-fitting/view/EquationFitNode' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Panel = require( 'SUN/Panel' );
  var Property = require( 'AXON/Property' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  var adjustableFitString = require( 'string!CURVE_FITTING/adjustableFit' );
  var bestFitString = require( 'string!CURVE_FITTING/bestFit' );
  var symbolAString = require( 'string!CURVE_FITTING/symbol.a' );
  var symbolBString = require( 'string!CURVE_FITTING/symbol.b' );
  var symbolCString = require( 'string!CURVE_FITTING/symbol.c' );
  var symbolDString = require( 'string!CURVE_FITTING/symbol.d' );

  /**
   * @param {Property.<number>[]} sliderPropertyArray - stored in ascending order of the polynomial fit, starting with order zero.
   * @param {Property.<string>} fitProperty
   * @param {Property.<number>} orderProperty
   * @param {Object} [options]
   * @constructor
   */
  function FitPanel( sliderPropertyArray, fitProperty, orderProperty, options ) {

    options = _.extend( {
      cornerRadius: CurveFittingConstants.PANEL_CORNER_RADIUS,
      fill: CurveFittingConstants.PANEL_BACKGROUND_COLOR,
      xMargin: CurveFittingConstants.PANEL_MARGIN,
      yMargin: CurveFittingConstants.PANEL_MARGIN,
      maxWidth: CurveFittingConstants.PANEL_MAX_WIDTH
    }, options );

    // radio buttons
    var bestFitButton = createRadioButton( fitProperty, 'best', bestFitString );
    var adjustableFitButton = createRadioButton( fitProperty, 'adjustable', adjustableFitString );

    // vertical layout
    var radioButtonsBox = new VBox( {
      align: 'left',
      spacing: 5,
      children: [
        bestFitButton,
        adjustableFitButton
      ]
    } );

    // equation that corresponds to the curve
    var equationFitNode = new EquationFitNode( orderProperty );

    // it's necessary to be able to enable and disable sliders
    var aSliderEnabledProperty = new Property( true );
    var bSliderEnabledProperty = new Property( true );
    var cSliderEnabledProperty = new Property( true );
    var dSliderEnabledProperty = new Property( true );

    // create slider for parameters
    var aSlider = new CoefficientSliderNode( sliderPropertyArray[ 3 ], {
      min: -1,
      max: 1
    }, symbolAString, { enabledProperty: aSliderEnabledProperty } );
    var bSlider = new CoefficientSliderNode( sliderPropertyArray[ 2 ], {
      min: -2,
      max: 2
    }, symbolBString, { enabledProperty: bSliderEnabledProperty } );
    var cSlider = new CoefficientSliderNode( sliderPropertyArray[ 1 ], {
      min: -10,
      max: 10
    }, symbolCString, { enabledProperty: cSliderEnabledProperty } );
    var dSlider = new CoefficientSliderNode( sliderPropertyArray[ 0 ], {
      min: -10,
      max: 10
    }, symbolDString, { enabledProperty: dSliderEnabledProperty } );

    var sliders = [ aSlider, bSlider, cSlider, dSlider ];

    // create slider box
    var slidersBox = new HBox( { spacing: 5, children: sliders } );

    // add slider number observer
    orderProperty.link( function( order ) {
      // if the sliders are not disabled they will be able to change
      // and behave as described in #15 and #37
      aSliderEnabledProperty.set( order >= 3 );
      bSliderEnabledProperty.set( order >= 2 );

      // set the content of the slidersBox
      slidersBox.children = sliders.slice( sliders.length - order - 1, sliders.length );
    } );

    // vertical layout
    var contentNode = new VBox( {
      align: 'left',
      spacing: 5,
      children: [
        radioButtonsBox,
        equationFitNode
      ]
    } );

    // show sliders when 'adjustable' fit is selected
    fitProperty.link( function( fit ) {
      if ( fit === 'best' && contentNode.hasChild( slidersBox ) ) {
        contentNode.removeChild( slidersBox );
      }
      else if ( fit === 'adjustable' ) {
        contentNode.addChild( slidersBox );
      }
    } );

    Panel.call( this, contentNode, options );
  }

  curveFitting.register( 'FitPanel', FitPanel );

  /**
   * Creates a radio button for this panel.
   *
   * @param {Property} property
   * @param {*} value
   * @param {string} label
   * @returns {AquaRadioButton}
   */
  var createRadioButton = function( property, value, label ) {
    return new AquaRadioButton( property, value,
      new Text( label, CurveFittingConstants.CONTROL_TEXT_OPTIONS ),
      CurveFittingConstants.RADIO_BUTTON_OPTIONS );
  };

  return inherit( Panel, FitPanel );
} );