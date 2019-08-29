// Copyright 2015-2019, University of Colorado Boulder

/**
 * Control panel for selecting how the curve is fit to data points.
 * For adjustable fit, provides additional controls for coefficients.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author Saurabh Totey
 */
define( require => {
  'use strict';

  // modules
  const AquaRadioButton = require( 'SUN/AquaRadioButton' );
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const CoefficientSliderNode = require( 'CURVE_FITTING/curve-fitting/view/CoefficientSliderNode' );
  const curveFitting = require( 'CURVE_FITTING/curveFitting' );
  const CurveFittingConstants = require( 'CURVE_FITTING/curve-fitting/CurveFittingConstants' );
  const EquationNode = require( 'CURVE_FITTING/curve-fitting/view/EquationNode' );
  const FitType = require( 'CURVE_FITTING/curve-fitting/model/FitType' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const HStrut = require( 'SCENERY/nodes/HStrut' );
  const Panel = require( 'SUN/Panel' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  const adjustableFitString = require( 'string!CURVE_FITTING/adjustableFit' );
  const bestFitString = require( 'string!CURVE_FITTING/bestFit' );
  const aSymbolString = require( 'string!CURVE_FITTING/aSymbol' );
  const bSymbolString = require( 'string!CURVE_FITTING/bSymbol' );
  const cSymbolString = require( 'string!CURVE_FITTING/cSymbol' );
  const dSymbolString = require( 'string!CURVE_FITTING/dSymbol' );

  class FitPanel extends Panel {

    /**
     * @param {Property.<number>[]} sliderPropertyArray - stored in ascending order of the polynomial fit, starting with order zero.
     * @param {Property.<FitType>} fitProperty
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
      const bestFitButton = createRadioButton( fitProperty, FitType.BEST, bestFitString );
      const adjustableFitButton = createRadioButton( fitProperty, FitType.ADJUSTABLE, adjustableFitString );

      // vertical layout
      const radioButtonsBox = new VBox( {
        align: 'left',
        spacing: CurveFittingConstants.CONTROLS_Y_SPACING,
        children: [
          bestFitButton,
          adjustableFitButton
        ]
      } );

      // equation that corresponds to the curve
      const equationFitNode = new EquationNode( orderProperty, {
        coefficientTextOptions: {
          font: CurveFittingConstants.COEFFICIENT_FONT,
          fill: CurveFittingConstants.BLUE_COLOR
        }
      } );

      // vertical layout
      const contentNode = new VBox( {
        align: 'left',
        spacing: CurveFittingConstants.CONTROLS_Y_SPACING,
        children: [
          radioButtonsBox,
          equationFitNode
        ]
      } );

      super( contentNode, options );

      // attributes for four sliders in ASCENDING order of polynomial
      const slidersAttributes = [
        {
          string: dSymbolString,
          range: CurveFittingConstants.CONSTANT_RANGE,
          enabledProperty: new BooleanProperty( true )
        },
        {
          string: cSymbolString,
          range: CurveFittingConstants.LINEAR_RANGE,
          enabledProperty: new BooleanProperty( true )
        },
        {
          string: bSymbolString,
          range: CurveFittingConstants.QUADRATIC_RANGE,
          enabledProperty: new BooleanProperty( true )
        },
        {
          string: aSymbolString,
          range: CurveFittingConstants.CUBIC_RANGE,
          enabledProperty: new BooleanProperty( true )
        }
      ];

      // create array in ASCENDING order of polynomial
      const ascendingSliders = slidersAttributes.map(
        ( sliderAttribute, index ) => new CoefficientSliderNode(
          sliderPropertyArray[ index ],
          sliderAttribute.range,
          sliderAttribute.string,
          { enabledProperty: sliderAttribute.enabledProperty }
        )
      );

      // we want sliders in DESCENDING order of polynomial
      const sliders = ascendingSliders.reverse();

      // create slider box under the equationFitNode
      // HBox and HStrut spacing are empirically determined
      const slidersBox = new HBox( {
        spacing: CurveFittingConstants.SLIDERS_X_SPACING,
        children: sliders
      } );
      const slidersOffset = new HStrut( 3 );

      // add slider number observer; no dispose necessary because FitPanel is always present
      orderProperty.link( order => {

        // set the content of the slidersBox
        slidersBox.children = sliders.slice( sliders.length - order - 1, sliders.length );

        // if the sliders are not disabled they will be able to change
        // and behave as described in #15 and #37
        slidersAttributes.forEach(
          ( sliderObject, index ) => { sliderObject.enabledProperty.value = order >= index; }
        );

        slidersBox.children = [ slidersOffset ].concat( slidersBox.children );
      } );

      // show sliders when adjustable fit is selected; no dispose necessary because FitPanel is always present
      fitProperty.link( fit => {
        if ( fit === FitType.BEST && contentNode.hasChild( slidersBox ) ) {
          contentNode.removeChild( slidersBox );
        }
        else if ( fit === FitType.ADJUSTABLE ) {
          contentNode.addChild( slidersBox );
        }
      } );
    }
  }

  /**
   * Creates a radio button for this panel.
   *
   * @param {Property} property
   * @param {*} value
   * @param {string} label
   * @returns {AquaRadioButton}
   */
  function createRadioButton( property, value, label ) {
    return new AquaRadioButton(
      property,
      value,
      new Text( label, {
        font: CurveFittingConstants.CONTROL_FONT,
        maxWidth: 140
      } ),
      CurveFittingConstants.RADIO_BUTTON_OPTIONS
    );
  }

  return curveFitting.register( 'FitPanel', FitPanel );
} );
