// Copyright 2016-2022, University of Colorado Boulder

/**
 * Dialog that provides information about the reduced chi-squared statistic.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Saurabh Totey
 */

import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import FormulaNode from '../../../../scenery-phet/js/FormulaNode.js';
import { HBox, HStrut, RichText, Text, VBox } from '../../../../scenery/js/imports.js';
import Dialog from '../../../../sun/js/Dialog.js';
import curveFitting from '../../curveFitting.js';
import CurveFittingStrings from '../../CurveFittingStrings.js';
import CurveFittingConstants from '../CurveFittingConstants.js';

const fEqualsNumberOfParametersPatternString = CurveFittingStrings.fEqualsNumberOfParametersPattern;
const nEqualsNumberOfDataPointsPatternString = CurveFittingStrings.nEqualsNumberOfDataPointsPattern;
const chiSymbolString = CurveFittingStrings.chiSymbol;
const fSymbolString = CurveFittingStrings.fSymbol;
const nSymbolString = CurveFittingStrings.nSymbol;
const xSymbolString = CurveFittingStrings.xSymbol;
const ySymbolString = CurveFittingStrings.ySymbol;
const theReducedChiSquaredStatisticIsString = CurveFittingStrings.theReducedChiSquaredStatisticIs;

// constants
const TEXT_OPTIONS = {
  font: CurveFittingConstants.INFO_DIALOG_NORMAL_FONT
};

const FORMULA_STRING = `${chiSymbolString}_r^2 = ` +
                       `\\frac{1}{${nSymbolString} - ${fSymbolString}} ` +
                       '\\sum_i ' +
                       `\\frac{[${ySymbolString}(${xSymbolString}_i) - ${ySymbolString}_i]^2}{\\sigma_i^2}`;

class ReducedChiSquaredStatisticDialog extends Dialog {

  constructor() {

    // Pattern for styling a symbol with the PhET standard math font
    const symbolPattern = `<i style='font-family:${CurveFittingConstants.INFO_DIALOG_SYMBOL_FONT.family}'>{{symbol}}</i>`;

    const numberOfDataPointsNode = new RichText(
      StringUtils.fillIn( nEqualsNumberOfDataPointsPatternString, {
        nSymbol: StringUtils.fillIn( symbolPattern, { symbol: nSymbolString } )
      } ),
      TEXT_OPTIONS
    );

    const numberOfParametersNode = new RichText(
      StringUtils.fillIn( fEqualsNumberOfParametersPatternString, {
        fSymbol: StringUtils.fillIn( symbolPattern, { symbol: fSymbolString } )
      } ),
      TEXT_OPTIONS
    );

    const contentNode = new VBox( {
      align: 'left',
      spacing: 10,
      children: [
        new Text( theReducedChiSquaredStatisticIsString, TEXT_OPTIONS ),
        new HBox( {
          children: [
            new HStrut( 20 ),
            new FormulaNode( FORMULA_STRING )
          ]
        } ),
        numberOfDataPointsNode,
        numberOfParametersNode
      ],
      maxWidth: 500 // determined empirically
    } );

    super( contentNode );
  }

}

curveFitting.register( 'ReducedChiSquaredStatisticDialog', ReducedChiSquaredStatisticDialog );
export default ReducedChiSquaredStatisticDialog;