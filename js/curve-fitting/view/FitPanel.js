// Copyright 2015-2017, University of Colorado Boulder

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
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var CoefficientSliderNode = require( 'CURVE_FITTING/curve-fitting/view/CoefficientSliderNode' );
  var curveFitting = require( 'CURVE_FITTING/curveFitting' );
  var CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  var EquationFitNode = require( 'CURVE_FITTING/curve-fitting/view/EquationFitNode' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Panel = require( 'SUN/Panel' );
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

    // attributes for four sliders in ASCENDING order of polynomial
    var slidersAttributes = [
      {
        string: symbolDString,
        range: CurveFittingConstants.CONSTANT_RANGE,
        enabledProperty: new BooleanProperty( true )
      },
      {
        string: symbolCString,
        range: CurveFittingConstants.LINEAR_RANGE,
        enabledProperty: new BooleanProperty( true )
      },
      {
        string: symbolBString,
        range: CurveFittingConstants.QUADRATIC_RANGE,
        enabledProperty: new BooleanProperty( true )
      },
      {
        string: symbolAString,
        range: CurveFittingConstants.CUBIC_RANGE,
        enabledProperty: new BooleanProperty( true )
      }
    ];

    // create array in ASCENDING order of polynomial
    var ascendingSliders = slidersAttributes.map( function( sliderObject, index ) {
        return new CoefficientSliderNode( sliderPropertyArray[ index ],
          sliderObject.range,
          sliderObject.string,
          { enabledProperty: sliderObject.enabledProperty } );
      }
    );

    // we want sliders in DESCENDING order of polynomial
    var sliders = ascendingSliders.reverse();

    // create slider box
    var slidersBox = new HBox( { spacing: 6, children: sliders } );

    // add slider number observer
    orderProperty.link( function( order ) {

      // set the content of the slidersBox
      slidersBox.children = sliders.slice( sliders.length - order - 1, sliders.length );

      // if the sliders are not disabled they will be able to change
      // and behave as described in #15 and #37
      slidersAttributes.forEach( function( sliderObject, index ) {
        sliderObject.enabledProperty.set( order >= index );
      } );
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


  /**
   * Create sliders
   * @returns {CoefficientSliderNode}
   */

  return inherit( Panel, FitPanel );
} );
