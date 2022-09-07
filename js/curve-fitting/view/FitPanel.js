// Copyright 2015-2022, University of Colorado Boulder

/**
 * Control panel for selecting how the curve is fit to data points.
 * For adjustable fit, provides additional controls for coefficients.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author Saurabh Totey
 */

import merge from '../../../../phet-core/js/merge.js';
import { HBox, HStrut, Text, VBox } from '../../../../scenery/js/imports.js';
import AquaRadioButton from '../../../../sun/js/AquaRadioButton.js';
import Panel from '../../../../sun/js/Panel.js';
import curveFitting from '../../curveFitting.js';
import CurveFittingStrings from '../../CurveFittingStrings.js';
import CurveFittingConstants from '../CurveFittingConstants.js';
import FitType from '../model/FitType.js';
import CoefficientSliderNode from './CoefficientSliderNode.js';
import EquationNode from './EquationNode.js';

const adjustableFitString = CurveFittingStrings.adjustableFit;
const aSymbolString = CurveFittingStrings.aSymbol;
const bestFitString = CurveFittingStrings.bestFit;
const bSymbolString = CurveFittingStrings.bSymbol;
const cSymbolString = CurveFittingStrings.cSymbol;
const dSymbolString = CurveFittingStrings.dSymbol;

class FitPanel extends Panel {

  /**
   * @param {Property.<number>[]} sliderPropertyArray - stored in ascending order of the polynomial fit, starting with order zero.
   * @param {Property.<FitType>} fitProperty
   * @param {Property.<number>} orderProperty
   * @param {Object} [options]
   */
  constructor( sliderPropertyArray, fitProperty, orderProperty, options ) {

    options = merge( {
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
        range: CurveFittingConstants.CONSTANT_RANGE
      },
      {
        string: cSymbolString,
        range: CurveFittingConstants.LINEAR_RANGE
      },
      {
        string: bSymbolString,
        range: CurveFittingConstants.QUADRATIC_RANGE
      },
      {
        string: aSymbolString,
        range: CurveFittingConstants.CUBIC_RANGE
      }
    ];

    // create array in ASCENDING order of polynomial
    const ascendingSliders = slidersAttributes.map(
      ( sliderAttribute, index ) => new CoefficientSliderNode(
        sliderPropertyArray[ index ],
        sliderAttribute.range,
        sliderAttribute.string
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
      maxWidth: 140 // determined empirically
    } ),
    CurveFittingConstants.RADIO_BUTTON_OPTIONS
  );
}

curveFitting.register( 'FitPanel', FitPanel );
export default FitPanel;