// Copyright 2015-2019, University of Colorado Boulder

/**
 * Control panel for selecting how the curve is fit to data points.
 * For 'adjustable fit', provides additional controls for coefficients.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( require => {
  'use strict';

  // modules
  const AquaRadioButton = require( 'SUN/AquaRadioButton' );
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const CoefficientSliderNode = require( 'CURVE_FITTING/curve-fitting/view/CoefficientSliderNode' );
  const curveFitting = require( 'CURVE_FITTING/curveFitting' );
  const CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  const EquationFitNode = require( 'CURVE_FITTING/curve-fitting/view/EquationFitNode' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const Panel = require( 'SUN/Panel' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  const adjustableFitString = require( 'string!CURVE_FITTING/adjustableFit' );
  const bestFitString = require( 'string!CURVE_FITTING/bestFit' );
  const symbolAString = require( 'string!CURVE_FITTING/symbol.a' );
  const symbolBString = require( 'string!CURVE_FITTING/symbol.b' );
  const symbolCString = require( 'string!CURVE_FITTING/symbol.c' );
  const symbolDString = require( 'string!CURVE_FITTING/symbol.d' );

  class FitPanel extends Panel {

    /**
     * @param {Property.<number>[]} sliderPropertyArray - stored in ascending order of the polynomial fit, starting with order zero.
     * @param {Property.<string>} fitProperty
     * @param {Property.<number>} orderProperty
     * @param {Object} [options]
     */
    constructor( sliderPropertyArray, fitProperty, orderProperty, options ) {

      options = _.extend( {
        cornerRadius: CurveFittingConstants.PANEL_CORNER_RADIUS,
        fill: CurveFittingConstants.PANEL_BACKGROUND_COLOR,
        xMargin: CurveFittingConstants.PANEL_MARGIN,
        yMargin: CurveFittingConstants.PANEL_MARGIN,
        maxWidth: CurveFittingConstants.PANEL_MAX_WIDTH
      }, options );

      // radio buttons
      const bestFitButton = createRadioButton( fitProperty, 'best', bestFitString );
      const adjustableFitButton = createRadioButton( fitProperty, 'adjustable', adjustableFitString );

      // vertical layout
      const radioButtonsBox = new VBox( {
        align: 'left',
        spacing: 5,
        children: [
          bestFitButton,
          adjustableFitButton
        ]
      } );

      // equation that corresponds to the curve
      const equationFitNode = new EquationFitNode( orderProperty );

      // attributes for four sliders in ASCENDING order of polynomial
      const slidersAttributes = [
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
      const ascendingSliders = slidersAttributes.map( function( sliderObject, index ) {
          return new CoefficientSliderNode( sliderPropertyArray[ index ],
            sliderObject.range,
            sliderObject.string,
            { enabledProperty: sliderObject.enabledProperty } );
        }
      );

      // we want sliders in DESCENDING order of polynomial
      const sliders = ascendingSliders.reverse();

      // create slider box
      const slidersBox = new HBox( { spacing: 6, children: sliders } );

      // add slider number observer
      orderProperty.link( function( order ) {

        // set the content of the slidersBox
        slidersBox.children = sliders.slice( sliders.length - order - 1, sliders.length );

        // if the sliders are not disabled they will be able to change
        // and behave as described in #15 and #37
        slidersAttributes.forEach( ( sliderObject, index ) => sliderObject.enabledProperty.set( order >= index ) );
      } );

      // vertical layout
      const contentNode = new VBox( {
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

      super( contentNode, options );
    }

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
  function createRadioButton( property, value, label ) {
    return new AquaRadioButton( property, value,
      new Text( label, CurveFittingConstants.CONTROL_TEXT_OPTIONS ),
      CurveFittingConstants.RADIO_BUTTON_OPTIONS );
  }

  return FitPanel;
} );
