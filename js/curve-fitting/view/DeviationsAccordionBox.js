// Copyright 2015-2023, University of Colorado Boulder

/**
 * Deviations accordion box in 'Curve Fitting' simulation.
 * Contains X^2 barometer, r^2 barometer and help button.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author Saurabh Totey
 */

import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import InfoButton from '../../../../scenery-phet/js/buttons/InfoButton.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import { HBox, Node, RichText, Text } from '../../../../scenery/js/imports.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import Panel from '../../../../sun/js/Panel.js';
import curveFitting from '../../curveFitting.js';
import CurveFittingStrings from '../../CurveFittingStrings.js';
import CurveFittingConstants from '../CurveFittingConstants.js';
import BarometerR2Node from './BarometerR2Node.js';
import BarometerX2Node from './BarometerX2Node.js';
import ReducedChiSquaredStatisticDialog from './ReducedChiSquaredStatisticDialog.js';

const deviationsString = CurveFittingStrings.deviations;

// constants
const VALUES_TEXT_FONT = CurveFittingConstants.BAROMETER_VALUE_FONT;
const MAX_CHI_SQUARE_VALUE = 1000;
const LABEL_TEXT_OPTIONS = {
  font: CurveFittingConstants.BAROMETER_SYMBOL_FONT,
  maxWidth: 35
};

// strings
const chiSymbolString = CurveFittingStrings.chiSymbol;
const rSymbolString = CurveFittingStrings.rSymbol;

// constants
const LABEL_MAX_WIDTH = 30;
const VALUE_MAX_WIDTH = 45;

const CHI_SQUARED_PATTERN = `${chiSymbolString}<sup>2</sup>&nbsp;{{relationalOperator}}&nbsp;`;
const R_SQUARED_EQUALS_STRING = `${rSymbolString}<sup>2</sup>&nbsp;${MathSymbols.EQUAL_TO}&nbsp;`;

class DeviationsAccordionBox extends AccordionBox {

  /**
   * @param {Property.<boolean>} expandedProperty - is this panel expanded?
   * @param {Points} points
   * @param {Property.<number>} chiSquaredProperty
   * @param {Property.<number>} rSquaredProperty
   * @param {Property.<boolean>} curveVisibleProperty
   * @param {Object} [options]
   */
  constructor( expandedProperty, points, chiSquaredProperty, rSquaredProperty, curveVisibleProperty, options ) {

    options = merge( {
      cornerRadius: CurveFittingConstants.PANEL_CORNER_RADIUS,
      fill: CurveFittingConstants.PANEL_BACKGROUND_COLOR,
      minWidth: CurveFittingConstants.PANEL_MIN_WIDTH,
      maxWidth: CurveFittingConstants.PANEL_MAX_WIDTH,
      expandedProperty: expandedProperty,
      titleNode: new Text( deviationsString, {
        font: CurveFittingConstants.ACCORDION_BOX_TITLE_FONT,
        maxWidth: 115
      } ),
      titleAlignX: 'left',
      titleXSpacing: 8,
      showTitleWhenExpanded: true,
      buttonXMargin: CurveFittingConstants.PANEL_MARGIN,
      buttonYMargin: CurveFittingConstants.PANEL_MARGIN,
      expandCollapseButtonOptions: {
        touchAreaXDilation: 8,
        touchAreaYDilation: 8
      },
      valuePanelOptions: {
        fill: 'white',
        cornerRadius: CurveFittingConstants.PANEL_CORNER_RADIUS,
        xMargin: 4,
        yMargin: 4,
        resize: false,
        maxWidth: VALUE_MAX_WIDTH
      }
    }, options );

    const panelContent = new Node( { width: options.maxWidth } );

    // X^2 barometer
    const barometerX2 = new BarometerX2Node( points, chiSquaredProperty, curveVisibleProperty );

    // r^2 barometer
    const barometerR2 = new BarometerR2Node( rSquaredProperty, curveVisibleProperty );

    // informational dialog, created lazily because Dialog requires sim bounds during construction
    let dialog = null;

    // help button
    const helpButton = new InfoButton( {
      listener: () => {
        if ( !dialog ) {
          dialog = new ReducedChiSquaredStatisticDialog();
        }
        dialog.show();
      },
      baseColor: 'rgb( 204, 204, 204 )',
      iconFill: 'rgb( 44, 107, 159 )',
      maxWidth: 30,
      touchAreaXDilation: 8,
      touchAreaYDilation: 8
    } );

    // X^2 =
    const chiSquaredLabelText = new RichText( '', LABEL_TEXT_OPTIONS );

    // X^2 value
    const chiSquaredValueText = new Text( '0.00', {
      font: VALUES_TEXT_FONT,
      textAlign: 'left',
      maxWidth: LABEL_MAX_WIDTH
    } );
    const chiSquaredValuePanel = new Panel( chiSquaredValueText, options.valuePanelOptions );

    // X^2 = value
    const chiSquaredInformationBox = new HBox( {
      children: [ chiSquaredLabelText, chiSquaredValuePanel ]
    } );

    // r^2 =
    const rSquaredLabelText = new RichText( R_SQUARED_EQUALS_STRING, LABEL_TEXT_OPTIONS );

    // r^2 value
    const rSquaredValueText = new Text( '0.00', {
      font: VALUES_TEXT_FONT,
      textAlign: 'left',
      maxWidth: LABEL_MAX_WIDTH
    } );
    const rSquaredValuePanel = new Panel( rSquaredValueText, options.valuePanelOptions );

    // r^2 = value
    const rSquaredInformationBox = new HBox( {
      children: [ rSquaredLabelText, rSquaredValuePanel ]
    } );

    // unlink unnecessary, present for the lifetime of the sim
    chiSquaredProperty.link( chiSquared => {

      // if chiSquared is larger than a 1000, the actual value will not be displayed, so use a '>' sign
      chiSquaredLabelText.string = StringUtils.fillIn( CHI_SQUARED_PATTERN, {
        relationalOperator: ( chiSquared > MAX_CHI_SQUARE_VALUE ) ? MathSymbols.GREATER_THAN : MathSymbols.EQUAL_TO
      } );

      // If chiSquared is greater than 10 we have a bad fit so less precision is needed.
      // If chiSquared is greater than 100 we have a really bad fit and decimals are inconsequential.
      // If chiSquared is larger than 1000, round it to 1000; see #28
      chiSquaredValueText.string = formatNumber( Math.min( chiSquared, MAX_CHI_SQUARE_VALUE ), 2 );

      // centers the chiSquared text node within the panel
      // chi squared needs to be centered because the number of digits can change
      chiSquaredValueText.centerX = chiSquaredValuePanel.width / 2;
      chiSquaredValueText.centerY = chiSquaredValuePanel.height / 2;
    } );

    // unlink unnecessary, present for the lifetime of the sim
    rSquaredProperty.link( rSquared => {

      let rSquaredString;
      if ( isNaN( rSquared ) ) {
        rSquaredString = '';
      }
      else {
        rSquaredString = formatNumber( rSquared, 2 );
      }
      rSquaredValueText.string = rSquaredString;
    } );

    // unlinks unnecessary, present for the lifetime of the sim
    curveVisibleProperty.linkAttribute( rSquaredValueText, 'visible' );
    curveVisibleProperty.linkAttribute( chiSquaredValueText, 'visible' );

    panelContent.addChild( helpButton );
    panelContent.addChild( chiSquaredInformationBox );
    panelContent.addChild( rSquaredInformationBox );
    panelContent.addChild( barometerX2 );
    panelContent.addChild( barometerR2 );

    const xSpacing = 8;
    const ySpacing = 10;
    helpButton.centerX = panelContent.width / 2;
    chiSquaredInformationBox.right = helpButton.centerX - xSpacing;
    chiSquaredInformationBox.bottom = helpButton.top - ySpacing;
    rSquaredInformationBox.left = helpButton.centerX + xSpacing;
    rSquaredInformationBox.bottom = helpButton.top - ySpacing;
    barometerX2.centerX = chiSquaredInformationBox.centerX;
    barometerR2.centerX = rSquaredInformationBox.centerX;
    barometerX2.bottom = chiSquaredInformationBox.top - ySpacing;
    barometerR2.bottom = rSquaredInformationBox.top - ySpacing;

    super( panelContent, options );
  }

}

/**
 * For numbers smaller than ten, returns a number with digits decimal places.
 * For numbers larger than ten, returns a fixed number with (digits + 1) significant figures.
 *
 * @param {number} number
 * @param {number} digits
 * @returns {string}
 */
function formatNumber( number, digits ) {

  // e.g. for digits = 3
  // 9999.11 -> 9999  (numbers greater than 10^3) are rounded to integers
  // 999.111 -> 999.1
  // 99.1111 -> 99.11
  // 9.11111 -> 9.111 (numbers less than 10) have 3 decimal places
  // 1.11111 -> 1.111
  // 0.11111 -> 0.111
  // 0.01111 -> 0.011
  // 0.00111 -> 0.001
  // 0.00011 -> 0.000

  // number = mantissa times 10^(exponent) where the mantissa is between 1 and 10 (or -1 and -10)
  const exponent = Math.floor( Utils.log10( Math.abs( number ) ) );

  let decimalPlaces;
  if ( exponent >= digits ) {
    decimalPlaces = 0;
  }
  else if ( exponent > 0 ) {
    decimalPlaces = digits - exponent;
  }
  else {
    decimalPlaces = digits;
  }

  return Utils.toFixed( number, decimalPlaces );
}

curveFitting.register( 'DeviationsAccordionBox', DeviationsAccordionBox );
export default DeviationsAccordionBox;
