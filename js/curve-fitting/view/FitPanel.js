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
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var EquationFitNode = require( 'CURVE_FITTING/curve-fitting/view/EquationFitNode' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Panel = require( 'SUN/Panel' );
  var Property = require( 'AXON/Property' );
  var SliderParameterNode = require( 'CURVE_FITTING/curve-fitting/view/SliderParameterNode' );
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
    });

    // equation that corresponds to the curve
    var equationFitNode = new EquationFitNode( orderProperty );

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